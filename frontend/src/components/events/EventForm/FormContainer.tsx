"use client";

import * as React from "react";
import { useForm, FormProvider, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, ChevronRight, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  EventCreateFormData,
  defaultEventFormValues,
  FORM_STEPS,
  FormStepName,
  validateFormStep,
  eventCreateSchema,
  eventEditSchema,
  formatZodErrors,
} from "@/lib/validations/event";
import {
  FormPersistence,
  getStepProgress,
  canNavigateToStep,
  createAutoSave,
} from "@/lib/utils/form";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";

interface FormContainerProps {
  initialData?: Partial<EventCreateFormData>;
  formId?: string;
  onSubmit: (data: EventCreateFormData) => void | Promise<void>;
  onCancel?: () => void;
  onSaveDraft?: (data: Partial<EventCreateFormData>) => void | Promise<void>;
  children: (props: FormChildrenProps) => React.ReactNode;
  className?: string;
  enableUnsavedWarning?: boolean;
  mode?: "create" | "edit";
}

interface FormChildrenProps {
  currentStep: FormStepName;
  currentStepIndex: number;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStep: (step: number) => void;
  isStepValid: boolean;
  isSubmitting: boolean;
  completedSteps: Set<number>;
  errors: Record<string, string>;
  clearErrors: () => void;
}

export function FormContainer({
  initialData,
  formId,
  onSubmit,
  onCancel,
  onSaveDraft,
  children,
  className,
  enableUnsavedWarning = false,
  mode = "create",
}: FormContainerProps) {
  // Load saved data from localStorage if available
  const savedData = React.useMemo(() => {
    if (initialData) return initialData;
    return FormPersistence.loadFormData(formId) || defaultEventFormValues;
  }, [initialData, formId]);

  const savedStep = React.useMemo(() => {
    return FormPersistence.loadCurrentStep(formId) || "basicInfo";
  }, [formId]);

  // Use appropriate schema based on mode
  const validationSchema =
    mode === "edit" ? eventEditSchema : eventCreateSchema;

  // Form setup
  const form = useForm<EventCreateFormData>({
    resolver: zodResolver(validationSchema) as Resolver<EventCreateFormData>,
    defaultValues: savedData as EventCreateFormData,
    mode: "onChange",
  });

  const {
    handleSubmit,
    formState: { isSubmitting, isDirty, errors },
    watch,
    clearErrors,
  } = form;

  // Warn about unsaved changes if enabled
  useUnsavedChangesWarning(enableUnsavedWarning && isDirty);

  // Step management
  const [currentStepIndex, setCurrentStepIndex] = React.useState(() => {
    const stepIndex = FORM_STEPS.findIndex((step) => step.name === savedStep);
    return stepIndex >= 0 ? stepIndex : 0;
  });

  const [completedSteps, setCompletedSteps] = React.useState<Set<number>>(
    new Set()
  );
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>(
    {}
  );

  const currentStep = FORM_STEPS[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === FORM_STEPS.length - 1;

  // Watch form data for auto-save
  const formData = watch();

  // Auto-save functionality
  const autoSave = React.useMemo(() => {
    return createAutoSave((data: Partial<EventCreateFormData>) => {
      FormPersistence.saveFormData(data, formId);
      if (onSaveDraft) {
        onSaveDraft(data);
      }
    }, 2000); // Save every 2 seconds
  }, [formId, onSaveDraft]);

  // Auto-save when form data changes
  React.useEffect(() => {
    if (isDirty) {
      autoSave(formData);
    }
  }, [formData, isDirty, autoSave]);

  // Save current step to localStorage
  React.useEffect(() => {
    FormPersistence.saveCurrentStep(currentStep.name, formId);
  }, [currentStep.name, formId]);

  // Memoize the current step data to prevent unnecessary re-validations
  const currentStepData = React.useMemo(() => {
    return getStepData(formData, currentStep.name);
  }, [formData, currentStep.name]);

  const currentStepDataString = React.useMemo(() => {
    return JSON.stringify(currentStepData);
  }, [currentStepData]);

  // Check if current step is valid
  const [isStepValid, setIsStepValid] = React.useState(false);

  // Navigation functions
  const goToNextStep = React.useCallback(async () => {
    if (isStepValid) {
      setCompletedSteps((prev) => new Set(prev).add(currentStepIndex));

      if (!isLastStep) {
        setCurrentStepIndex((prev) => prev + 1);
      }
    }
  }, [isStepValid, currentStepIndex, isLastStep]);

  const goToPreviousStep = React.useCallback(() => {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [isFirstStep]);

  const goToStep = React.useCallback(
    (targetStepIndex: number) => {
      if (
        canNavigateToStep(targetStepIndex, currentStepIndex, completedSteps)
      ) {
        setCurrentStepIndex(targetStepIndex);
      }
    },
    [currentStepIndex, completedSteps]
  );

  React.useEffect(() => {
    async function checkStepValidity() {
      try {
        const stepData = getStepData(formData, currentStep.name);
        const result = validateFormStep(currentStep.name, stepData, mode);

        if (!result.success) {
          const errors = formatZodErrors(result.error);
          setFormErrors(errors);
          setIsStepValid(false);
          return;
        }

        // Clear errors for this step
        setFormErrors((prev) => {
          const newErrors = { ...prev };
          Object.keys(newErrors).forEach((key) => {
            if (isFieldInCurrentStep(key, currentStep.name)) {
              delete newErrors[key];
            }
          });
          return newErrors;
        });

        setIsStepValid(true);
      } catch (error) {
        console.error("Step validation error:", error);
        setIsStepValid(false);
      }
    }

    checkStepValidity();
  }, [currentStepDataString]);

  // Submit handler
  const onFormSubmit = React.useCallback(
    async (data: EventCreateFormData) => {
      try {
        await onSubmit(data);
        // Clear saved data after successful submission
        FormPersistence.clearFormData(formId);
      } catch (error) {
        console.error("Form submission error:", error);
        throw error;
      }
    },
    [onSubmit, formId]
  );

  // Cancel handler
  const handleCancel = React.useCallback(() => {
    if (onCancel) {
      onCancel();
    }
    // Optionally clear saved data
    // FormPersistence.clearFormData(formId)
  }, [onCancel]);

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case "ArrowLeft":
            event.preventDefault();
            if (!isFirstStep) goToPreviousStep();
            break;
          case "ArrowRight":
            event.preventDefault();
            if (!isLastStep && isStepValid) goToNextStep();
            break;
          case "s":
            event.preventDefault();
            FormPersistence.saveFormData(formData, formId);
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isFirstStep,
    isLastStep,
    isStepValid,
    goToPreviousStep,
    goToNextStep,
    formData,
    formId,
  ]);

  return (
    <div className={cn("max-w-7xl mx-auto p-6", className)}>
      <FormProvider {...form}>
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Create Event</h2>
            <div className="text-sm text-muted-foreground">
              Step {currentStepIndex + 1} of {FORM_STEPS.length}
            </div>
          </div>

          <Progress
            value={getStepProgress(currentStepIndex, FORM_STEPS.length)}
            className="mb-4"
          />

          {/* Step indicators */}
          <div className="flex justify-between">
            {FORM_STEPS.map((step, index) => {
              const isActive = index === currentStepIndex;
              const isCompleted = completedSteps.has(index);
              const canAccess = canNavigateToStep(
                index,
                currentStepIndex,
                completedSteps
              );

              return (
                <button
                  key={step.name}
                  type="button"
                  onClick={() => (canAccess ? goToStep(index) : undefined)}
                  disabled={!canAccess}
                  className={cn(
                    "flex flex-col items-center p-2 rounded-lg transition-colors text-sm",
                    isActive && "bg-primary text-primary-foreground",
                    isCompleted &&
                      !isActive &&
                      "bg-secondary text-secondary-foreground",
                    canAccess && "cursor-pointer hover:bg-accent",
                    !canAccess && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center mb-1 text-xs font-medium",
                      isActive && "bg-primary-foreground text-primary",
                      isCompleted &&
                        !isActive &&
                        "bg-primary text-primary-foreground",
                      !isCompleted &&
                        !isActive &&
                        "bg-muted text-muted-foreground"
                    )}
                  >
                    {index + 1}
                  </div>
                  <span className="font-medium">{step.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Current step header */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">{currentStep.title}</h3>
          <p className="text-muted-foreground">{currentStep.description}</p>
        </div>

        {/* Form content */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {children({
            currentStep: currentStep.name,
            currentStepIndex,
            totalSteps: FORM_STEPS.length,
            isFirstStep,
            isLastStep,
            goToNextStep,
            goToPreviousStep,
            goToStep,
            isStepValid,
            isSubmitting,
            completedSteps,
            errors: {
              ...formErrors,
              ...Object.keys(errors).reduce((acc, key) => {
                const error = errors[key as keyof typeof errors];
                if (error && typeof error === "object" && "message" in error) {
                  acc[key] = error.message || "Invalid field";
                }
                return acc;
              }, {} as Record<string, string>),
            },
            clearErrors: () => {
              clearErrors();
              setFormErrors({});
            },
          })}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between pt-6 border-t">
            <div className="flex items-center gap-3">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={() => FormPersistence.saveFormData(formData, formId)}
                disabled={isSubmitting}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={goToPreviousStep}
                disabled={isFirstStep || isSubmitting}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {isLastStep ? (
                <Button type="submit" disabled={!isStepValid || isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Event"}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={goToNextStep}
                  disabled={!isStepValid || isSubmitting}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}

// Helper functions
function getStepData(
  formData: Partial<EventCreateFormData>,
  stepName: FormStepName
): unknown {
  switch (stepName) {
    case "basicInfo":
      return {
        name: formData.name,
        description: formData.description,
        type: formData.type,
      };
    case "dateTime":
      return {
        start_date: formData.start_date,
        end_date: formData.end_date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        all_day: formData.all_day,
        timezone: formData.timezone,
      };
    case "location":
      return {
        location: formData.location,
        venue_name: formData.venue_name,
        venue_address: formData.venue_address,
        venue_google_place_id: formData.venue_google_place_id,
      };
    case "settings":
      return {
        is_public: formData.is_public,
        max_guests: formData.max_guests,
        budget_total: formData.budget_total,
        status: formData.status,
      };
    case "guestSettings":
      return formData.guest_settings;
    case "notificationSettings":
      return formData.notification_settings;
    default:
      return formData;
  }
}

function isFieldInCurrentStep(
  fieldPath: string,
  stepName: FormStepName
): boolean {
  const stepFields: Record<FormStepName, string[]> = {
    basicInfo: ["name", "description", "type"],
    dateTime: [
      "start_date",
      "end_date",
      "start_time",
      "end_time",
      "all_day",
      "timezone",
    ],
    location: [
      "location",
      "venue_name",
      "venue_address",
      "venue_google_place_id",
    ],
    settings: ["is_public", "max_guests", "budget_total", "status"],
    guestSettings: [
      "guest_settings.allow_plus_ones",
      "guest_settings.require_rsvp",
      "guest_settings.rsvp_deadline",
      "guest_settings.dietary_restrictions_enabled",
    ],
    notificationSettings: [
      "notification_settings.send_invitations",
      "notification_settings.reminder_schedule",
      "notification_settings.auto_reminders",
    ],
  };

  const fields = stepFields[stepName] || [];
  return fields.some((field) => fieldPath.startsWith(field));
}
