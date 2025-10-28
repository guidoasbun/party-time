// FR-6: The system shall display an RSVP submission page.
// 5.1.4: RSVP Customization

"use client";

import * as React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { EventCreateFormData } from "@/lib/validations/event";
import { RSVPSettings } from "../RSVPSettings";
import { cn } from "@/lib/utils";

interface RSVPSettingsStepProps {
  className?: string;
  errors?: Record<string, string>;
  onFieldChange?: (field: string, value: unknown) => void;
}

export function RSVPSettingsStep({
  className,
  errors,
  onFieldChange,
}: RSVPSettingsStepProps) {
  const {
    control,
    watch,
    formState: { errors: formErrors },
  } = useFormContext<EventCreateFormData>();

  // Watch event start date for deadline validation
  const startDate = watch("start_date");

  // Handle field changes
  const handleFieldChange = React.useCallback(
    (field: string, value: unknown) => {
      onFieldChange?.(field, value);
    },
    [onFieldChange]
  );

  // Get error messages for RSVP settings fields
  const rsvpErrors = {
    rsvp_deadline:
      errors?.["rsvp_settings.rsvp_deadline"] ||
      formErrors.rsvp_settings?.rsvp_deadline?.message,
    meal_options:
      errors?.["rsvp_settings.meal_options"] ||
      formErrors.rsvp_settings?.meal_options?.message,
    custom_questions:
      errors?.["rsvp_settings.custom_questions"] ||
      formErrors.rsvp_settings?.custom_questions?.message,
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          RSVP Customization
        </h2>
        <p className="text-muted-foreground mt-1">
          Configure how guests will RSVP to your event
        </p>
      </div>

      <Controller
        name="rsvp_settings"
        control={control}
        render={({ field }) => (
          <RSVPSettings
            value={
              field.value || {
                allow_plus_ones: false,
                require_rsvp: true,
                dietary_restrictions_enabled: false,
              }
            }
            onChange={(settings) => {
              field.onChange(settings);
              handleFieldChange("rsvp_settings", settings);
            }}
            eventStartDate={startDate}
            errors={rsvpErrors}
          />
        )}
      />

      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Tip:</strong> RSVP settings can help you plan better! Meal
          options and custom questions will appear on the public RSVP form for
          your guests.
        </p>
      </div>
    </div>
  );
}
