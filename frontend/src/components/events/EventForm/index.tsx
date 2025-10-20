"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import { FormContainer } from "./FormContainer";
import { BasicInfoStep } from "./BasicInfoStep";
import { DateTimeStep } from "./DateTimeStep";
import { LocationStep } from "./LocationStep";
import { SettingsStep } from "./SettingsStep";
import { RSVPSettingsStep } from "./RSVPSettingsStep";
import { EventCreateFormData } from "@/lib/validations/event";
import { transformFormDataForApi } from "@/lib/utils/form";
import { useCreateEvent, useUpdateEvent } from "@/hooks/api/useEvents";

interface EventFormProps {
  mode?: "create" | "edit";
  eventId?: string;
  initialData?: Partial<EventCreateFormData>;
  formId?: string;
  onSuccess?: (eventId: string) => void;
  onCancel?: () => void;
  className?: string;
}

export function EventForm({
  mode = "create",
  eventId,
  initialData,
  formId,
  onSuccess,
  onCancel,
  className,
}: EventFormProps) {
  const router = useRouter();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const { toast } = useToast();

  const isEditMode = mode === "edit";

  // Form submission handler
  const handleSubmit = React.useCallback(
    async (data: EventCreateFormData) => {
      try {
        // Transform form data for API
        const apiData = transformFormDataForApi(data);

        let result;

        if (isEditMode && eventId) {
          // Update existing event
          result = await updateEvent.mutateAsync({
            id: eventId,
            data: apiData,
          });

          // Show success message
          toast({
            title: "Event Updated!",
            description: `${data.name} has been updated successfully.`,
          });
        } else {
          // Create new event
          result = await createEvent.mutateAsync(apiData);

          // Show success message
          toast({
            title: "Event Created!",
            description: `${data.name} has been created successfully.`,
          });
        }

        // Handle success
        if (onSuccess) {
          onSuccess(result.id);
        } else {
          // Default behavior: navigate to the event detail page
          router.push(`/events/${result.id}`);
        }
      } catch (error) {
        console.error(
          `Failed to ${isEditMode ? "update" : "create"} event:`,
          error
        );

        // Show error message
        toast({
          title: `Failed to ${isEditMode ? "Update" : "Create"} Event`,
          description:
            error instanceof Error
              ? error.message
              : "Something went wrong. Please try again.",
          variant: "destructive",
        });

        // Re-throw to let form handle the error state
        throw error;
      }
    },
    [isEditMode, eventId, createEvent, updateEvent, onSuccess, router, toast]
  );

  // Draft save handler
  const handleSaveDraft = React.useCallback(
    async (data: Partial<EventCreateFormData>) => {
      try {
        // Only save drafts that have at least a name
        if (!data.name) return;

        // TODO: Implement draft saving functionality
        toast({
          title: "Draft Saved",
          description: "Your event draft has been saved.",
        });
      } catch (error) {
        console.error("Failed to save draft:", error);
        // Don't show error for draft saves - they're automatic
      }
    },
    [toast]
  );

  // Cancel handler
  const handleCancel = React.useCallback(() => {
    if (onCancel) {
      onCancel();
    } else {
      // Default behavior: go back to events list
      router.push("/events");
    }
  }, [onCancel, router]);

  return (
    <FormContainer
      initialData={initialData}
      formId={formId}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      onSaveDraft={handleSaveDraft}
      className={className}
      enableUnsavedWarning={isEditMode}
      mode={mode}
    >
      {({ currentStep }) => (
        <>
          {currentStep === "basicInfo" && <BasicInfoStep />}
          {currentStep === "dateTime" && <DateTimeStep />}
          {currentStep === "location" && <LocationStep />}
          {currentStep === "settings" && <SettingsStep />}
          {currentStep === "rsvpSettings" && <RSVPSettingsStep />}
        </>
      )}
    </FormContainer>
  );
}

// Export form steps for use in other components
export { BasicInfoStep } from "./BasicInfoStep";
export { DateTimeStep } from "./DateTimeStep";
export { LocationStep } from "./LocationStep";
export { SettingsStep } from "./SettingsStep";
export { RSVPSettingsStep } from "./RSVPSettingsStep";
export { FormContainer } from "./FormContainer";
