/**
 * FR-6: The system shall display an RSVP submission page 5.1.2
 * Main RSVP form component with multi-step workflow
 */

"use client";

import * as React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, ChevronRight, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import {
  rsvpFormSchema,
  type RSVPFormData,
  type RSVPFormStepName,
  RSVP_FORM_STEPS,
  validateRSVPFormStep,
  getVisibleRSVPSteps,
} from "@/lib/validations/rsvp";
import {
  AttendanceStep,
  GuestDetailsStep,
  MealPreferencesStep,
  PlusOneStep,
  NotesStep,
} from "./RSVPSteps";
import type { RSVPEventDetailsResponse } from "@/types/rsvp.types";
import { RsvpStatus } from "@/types/guest.types";

interface RSVPFormProps {
  eventDetails: RSVPEventDetailsResponse;
  token: string;
  onSubmit: (data: RSVPFormData) => Promise<void>;
  onCancel?: () => void;
  className?: string;
}

export function RSVPForm({
  eventDetails,
  token,
  onSubmit,
  onCancel,
  className,
}: RSVPFormProps) {
  // Initialize form with event details
  const initialFormData: Partial<RSVPFormData> = {
    rsvp_status: eventDetails.current_rsvp_status || undefined,
    first_name: eventDetails.guest.first_name,
    last_name: eventDetails.guest.last_name,
    email: eventDetails.guest.email,
    plus_one_allowed: eventDetails.guest.plus_one_allowed,
    plus_one_name: eventDetails.plus_one_name || undefined,
    dietary_restrictions: eventDetails.dietary_restrictions || undefined,
    meal_preference: eventDetails.meal_preference || undefined,
    notes: undefined,
  };

  // Load saved draft from localStorage
  const savedDraft = React.useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      const saved = localStorage.getItem(`rsvp-draft-${token}`);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.warn("Failed to load RSVP draft:", error);
      return null;
    }
  }, [token]);

  const form = useForm<RSVPFormData>({
    resolver: zodResolver(rsvpFormSchema),
    defaultValues: (savedDraft || initialFormData) as RSVPFormData,
    mode: "onChange",
  });

  const {
    handleSubmit,
    watch,
    formState: { isSubmitting, errors },
  } = form;

  // Watch form data to determine visible steps
  const formData = watch();
  const visibleSteps = React.useMemo(
    () => getVisibleRSVPSteps(formData),
    [formData]
  );

  // Current step management
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);

  // Safety check: Reset to last valid step if current index is out of bounds
  // This can happen when visibleSteps shrinks (e.g., when selecting "Not Attending")
  React.useEffect(() => {
    if (currentStepIndex >= visibleSteps.length && visibleSteps.length > 0) {
      setCurrentStepIndex(visibleSteps.length - 1);
    }
  }, [currentStepIndex, visibleSteps.length]);

  const currentStep = visibleSteps[currentStepIndex] || visibleSteps[0];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === visibleSteps.length - 1;

  // Track if user has interacted with form (to prevent auto-skip on load)
  const hasInteracted = React.useRef(false);

  // Track if auto-skip has already been triggered for current NOT_ATTENDING selection
  // This prevents the auto-skip from triggering again when user navigates back
  const hasAutoSkipped = React.useRef(false);

  // Auto-save to localStorage
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const subscription = watch((value) => {
      try {
        localStorage.setItem(`rsvp-draft-${token}`, JSON.stringify(value));
      } catch (error) {
        console.warn("Failed to save RSVP draft:", error);
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, token]);

  // Navigation handlers
  const goToNextStep = React.useCallback(() => {
    // Validate current step before proceeding
    const validation = validateRSVPFormStep(currentStep.name, formData);
    if (!validation.isValid && !currentStep.optional) {
      return; // Stay on current step if validation fails
    }

    if (currentStepIndex < visibleSteps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  }, [currentStepIndex, visibleSteps.length, currentStep, formData]);

  const goToPreviousStep = React.useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  const goToStep = React.useCallback(
    (stepIndex: number) => {
      if (stepIndex >= 0 && stepIndex < visibleSteps.length) {
        setCurrentStepIndex(stepIndex);
      }
    },
    [visibleSteps.length]
  );

  // Form submission
  const onFormSubmit = React.useCallback(
    async (data: RSVPFormData) => {
      try {
        await onSubmit(data);

        // Clear draft on successful submission
        if (typeof window !== "undefined") {
          localStorage.removeItem(`rsvp-draft-${token}`);
        }
      } catch (error) {
        console.error("RSVP submission error:", error);
        // Error handling is done in the parent component
      }
    },
    [onSubmit, token]
  );

  // Calculate progress percentage
  const progressPercentage = ((currentStepIndex + 1) / visibleSteps.length) * 100;

  // Render current step component
  const renderCurrentStep = () => {
    switch (currentStep.name) {
      case "attendance":
        return <AttendanceStep onNext={goToNextStep} />;
      case "guestDetails":
        return <GuestDetailsStep />;
      case "mealPreferences":
        return <MealPreferencesStep />;
      case "plusOne":
        return <PlusOneStep />;
      case "notes":
        return <NotesStep />;
      default:
        return null;
    }
  };

  // Set hasInteracted flag after initial render to prevent auto-skip on load
  React.useEffect(() => {
    const timer = setTimeout(() => {
      hasInteracted.current = true;
    }, 100); // Small delay to ensure form is fully loaded

    return () => clearTimeout(timer);
  }, []);

  // Reset hasAutoSkipped flag when status changes away from NOT_ATTENDING
  // This allows auto-skip to trigger again if user changes back to NOT_ATTENDING
  React.useEffect(() => {
    if (formData.rsvp_status !== RsvpStatus.NOT_ATTENDING) {
      hasAutoSkipped.current = false;
    }
  }, [formData.rsvp_status]);

  // Skip non-attending flow: If user actively selects "Not Attending", skip to final step
  // Only trigger after user interaction, not on initial form load with previous data
  // Only trigger once per NOT_ATTENDING selection to allow user to navigate back
  React.useEffect(() => {
    if (
      hasInteracted.current &&
      formData.rsvp_status === RsvpStatus.NOT_ATTENDING &&
      currentStepIndex === 0 &&
      !hasAutoSkipped.current // Only skip if we haven't already skipped
    ) {
      // Mark that we've performed the auto-skip
      hasAutoSkipped.current = true;

      // Jump to last step (notes) to allow them to leave a message
      const lastStepIndex = visibleSteps.length - 1;
      setCurrentStepIndex(lastStepIndex);
    }
  }, [formData.rsvp_status, currentStepIndex, visibleSteps.length]);

  return (
    <FormProvider {...form}>
      <form
        onSubmit={handleSubmit(onFormSubmit)}
        className={cn("space-y-8", className)}
      >
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">
              Step {currentStepIndex + 1} of {visibleSteps.length}
            </span>
            <span className="text-muted-foreground">{currentStep.title}</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Step Indicators (Dots) */}
        <div className="flex justify-center gap-2">
          {visibleSteps.map((step, index) => (
            <button
              key={step.name}
              type="button"
              onClick={() => goToStep(index)}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300",
                index === currentStepIndex
                  ? "bg-primary w-8"
                  : index < currentStepIndex
                  ? "bg-primary/60 hover:bg-primary/80"
                  : "bg-muted hover:bg-muted-foreground/20"
              )}
              aria-label={`Go to step ${index + 1}: ${step.title}`}
              aria-current={index === currentStepIndex ? "step" : undefined}
            />
          ))}
        </div>

        {/* Current Step Content */}
        <div className="min-h-[400px] py-4">{renderCurrentStep()}</div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-border">
          <div>
            {!isFirstStep && (
              <Button
                type="button"
                variant="outline"
                onClick={goToPreviousStep}
                disabled={isSubmitting}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
            )}
            {isFirstStep && onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
          </div>

          <div className="flex gap-3">
            {!isLastStep && (
              <Button
                type="button"
                onClick={goToNextStep}
                disabled={isSubmitting}
                className="gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}

            {isLastStep && (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="gap-2 min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit RSVP
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Form-level errors */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
              Please fix the following errors:
            </p>
            <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300 space-y-1">
              {Object.entries(errors).map(([field, error]) => (
                <li key={field}>
                  {field}: {error.message}
                </li>
              ))}
            </ul>
          </div>
        )}
      </form>
    </FormProvider>
  );
}
