/**
 * FR-6: The system shall display an RSVP submission page 5.1.2
 * FR-6: RSVP Submission
 * Phase 5: RSVP & Email Systems -
 * 5.1.2: RSVP Frontend Portal
 *
 * Zod validation schemas for public RSVP form
 */

import { z } from "zod";
import { RsvpStatus } from "@/types/guest.types";

// Step 1: Attendance Selection
export const attendanceStepSchema = z.object({
  rsvp_status: z.nativeEnum(RsvpStatus).refine((val) => val !== undefined, {
    message: "Please select your attendance status",
  }),
});

export type AttendanceStepData = z.infer<typeof attendanceStepSchema>;

// Step 2: Guest Details (read-only confirmation - no validation needed)
export const guestDetailsStepSchema = z.object({
  // These fields are read-only from the API response
  first_name: z.string(),
  last_name: z.string(),
  email: z.string().email(),
});

export type GuestDetailsStepData = z.infer<typeof guestDetailsStepSchema>;

// Step 3: Meal Preferences & Dietary Restrictions
export const mealPreferencesStepSchema = z.object({
  meal_preference: z
    .string()
    .max(100, "Meal preference must be less than 100 characters")
    .optional()
    .nullable()
    .transform((val) => val || undefined),
  dietary_restrictions: z
    .string()
    .max(500, "Dietary restrictions must be less than 500 characters")
    .optional()
    .nullable()
    .transform((val) => val || undefined),
});

export type MealPreferencesStepData = z.infer<typeof mealPreferencesStepSchema>;

// Step 4: Plus-One Information (conditional)
export const plusOneStepSchema = z.object({
  plus_one_name: z
    .string()
    .min(1, "Plus-one name is required if bringing a guest")
    .max(200, "Plus-one name must be less than 200 characters")
    .optional()
    .nullable()
    .transform((val) => val || undefined),
});

export type PlusOneStepData = z.infer<typeof plusOneStepSchema>;

// Step 5: Additional Notes & Song Requests
export const notesStepSchema = z.object({
  notes: z
    .string()
    .max(1000, "Notes must be less than 1000 characters")
    .optional()
    .nullable()
    .transform((val) => val || undefined),
});

export type NotesStepData = z.infer<typeof notesStepSchema>;

// Complete RSVP Form Data
export const rsvpFormSchema = z.object({
  // Step 1: Attendance
  rsvp_status: z.nativeEnum(RsvpStatus),

  // Step 2: Guest Details (read-only)
  first_name: z.string(),
  last_name: z.string(),
  email: z.string().email(),

  // Step 3: Meal Preferences
  meal_preference: z.string().max(100).optional().nullable(),
  dietary_restrictions: z.string().max(500).optional().nullable(),

  // Step 4: Plus-One (conditional based on plus_one_allowed)
  plus_one_name: z.string().max(200).optional().nullable(),
  plus_one_allowed: z.boolean(),

  // Step 5: Additional Notes
  notes: z.string().max(1000).optional().nullable(),
});

export type RSVPFormData = z.infer<typeof rsvpFormSchema>;

// Conditional validation: Require plus_one_name if attending and plus_one_allowed
export const rsvpFormWithConditionalValidation = rsvpFormSchema.superRefine(
  (data, ctx) => {
    // If attending and plus-one is allowed, and they want to bring someone
    if (
      data.rsvp_status === RsvpStatus.ATTENDING &&
      data.plus_one_allowed &&
      data.plus_one_name &&
      data.plus_one_name.trim().length === 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please enter your guest's name",
        path: ["plus_one_name"],
      });
    }
  }
);

// Default form values
export const defaultRSVPFormValues: Partial<RSVPFormData> = {
  rsvp_status: undefined,
  meal_preference: undefined,
  dietary_restrictions: undefined,
  plus_one_name: undefined,
  notes: undefined,
};

// Form step names
export type RSVPFormStepName =
  | "attendance"
  | "guestDetails"
  | "mealPreferences"
  | "plusOne"
  | "notes";

// Form steps configuration
export interface RSVPFormStep {
  name: RSVPFormStepName;
  title: string;
  description: string;
  schema:
    | typeof attendanceStepSchema
    | typeof guestDetailsStepSchema
    | typeof mealPreferencesStepSchema
    | typeof plusOneStepSchema
    | typeof notesStepSchema;
  optional?: boolean;
  conditional?: boolean; // Whether step should be shown conditionally
}

export const RSVP_FORM_STEPS: RSVPFormStep[] = [
  {
    name: "attendance",
    title: "Will you attend?",
    description: "Please let us know if you can make it",
    schema: attendanceStepSchema,
  },
  {
    name: "guestDetails",
    title: "Guest Details",
    description: "Confirm your information",
    schema: guestDetailsStepSchema,
  },
  {
    name: "mealPreferences",
    title: "Meal Preferences",
    description: "Let us know about any dietary needs",
    schema: mealPreferencesStepSchema,
    optional: true,
  },
  {
    name: "plusOne",
    title: "Plus-One Guest",
    description: "Who will you be bringing?",
    schema: plusOneStepSchema,
    optional: true,
    conditional: true, // Only show if plus_one_allowed is true
  },
  {
    name: "notes",
    title: "Additional Information",
    description: "Any special requests or song suggestions?",
    schema: notesStepSchema,
    optional: true,
  },
];

// Validate specific form step
export function validateRSVPFormStep(
  step: RSVPFormStepName,
  data: Partial<RSVPFormData>
): { isValid: boolean; errors: Record<string, string> } {
  const stepConfig = RSVP_FORM_STEPS.find((s) => s.name === step);
  if (!stepConfig) {
    return { isValid: true, errors: {} };
  }

  try {
    stepConfig.schema.parse(data);
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((err) => {
        const path = err.path.join(".");
        errors[path] = err.message;
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { general: "Validation error" } };
  }
}

// Check if a step should be shown based on form data
export function shouldShowRSVPStep(
  step: RSVPFormStepName,
  data: Partial<RSVPFormData>
): boolean {
  const stepConfig = RSVP_FORM_STEPS.find((s) => s.name === step);
  if (!stepConfig) return false;

  // Always show non-conditional steps
  if (!stepConfig.conditional) return true;

  // Plus-One step: only show if plus_one_allowed and attending
  if (step === "plusOne") {
    return (
      data.plus_one_allowed === true &&
      data.rsvp_status === RsvpStatus.ATTENDING
    );
  }

  return true;
}

// Get visible steps based on current form data
export function getVisibleRSVPSteps(
  data: Partial<RSVPFormData>
): RSVPFormStep[] {
  return RSVP_FORM_STEPS.filter((step) => shouldShowRSVPStep(step.name, data));
}

// Format Zod errors for display
export function formatRSVPZodErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  error.issues.forEach((err) => {
    const path = err.path.join(".");
    errors[path] = err.message;
  });
  return errors;
}
