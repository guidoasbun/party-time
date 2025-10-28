import { z } from "zod";
import { EventType, EventStatus } from "@/types/event.types";

// Base validation schemas
const eventTypeSchema = z.nativeEnum(EventType);
const eventStatusSchema = z.nativeEnum(EventStatus);

// Helper schemas
const optionalPositiveNumberSchema = z
  .number()
  .min(0)
  .optional()
  .nullable()
  .transform((val) => (val === null ? undefined : val));
const nonEmptyStringSchema = z.string().min(1, "This field is required");
const optionalStringSchema = z
  .string()
  .optional()
  .nullable()
  .transform((val) => (val === null ? undefined : val));

// Date validation helpers
// For new events, require future dates; for editing, allow any date
const futureDateSchema = z
  .string()
  .min(1, "Date is required")
  .refine((date) => {
    const selectedDate = new Date(date + "T00:00:00");
    const now = new Date();
    // Allow events to be created for today or future
    now.setHours(0, 0, 0, 0);
    return selectedDate >= now;
  }, "Event date cannot be in the past");

// For edit mode - allows any date (past or future)
const anyDateSchema = z.string().min(1, "Date is required");

const endDateSchema = z
  .string()
  .optional()
  .nullable()
  .transform((val) => (val === null ? undefined : val));

// Multi-step form schemas
export const basicInfoSchema = z.object({
  name: nonEmptyStringSchema.max(
    255,
    "Event name must be less than 255 characters"
  ),
  description: optionalStringSchema.refine(
    (val) => !val || val.length <= 2000,
    "Description must be less than 2000 characters"
  ),
  type: eventTypeSchema,
});

export const dateTimeSchema = z
  .object({
    start_date: futureDateSchema,
    end_date: endDateSchema,
    start_time: z
      .string()
      .optional()
      .nullable()
      .transform((val) => (val === null ? undefined : val)),
    end_time: z
      .string()
      .optional()
      .nullable()
      .transform((val) => (val === null ? undefined : val)),
    all_day: z.boolean().default(false),
    timezone: z
      .string()
      .optional()
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .default("UTC"),
  })
  .refine(
    (data) => {
      if (!data.end_date) return true;

      // Create datetime objects for comparison
      const startDateTime = new Date(
        data.start_date + "T" + (data.start_time || "00:00:00")
      );
      const endDateTime = new Date(
        data.end_date + "T" + (data.end_time || "23:59:59")
      );

      return endDateTime >= startDateTime;
    },
    {
      message: "End date and time must be after start date and time",
      path: ["end_date"],
    }
  );

// Edit mode version - allows past dates
export const dateTimeSchemaEdit = z
  .object({
    start_date: anyDateSchema,
    end_date: endDateSchema,
    start_time: z
      .string()
      .optional()
      .nullable()
      .transform((val) => (val === null ? undefined : val)),
    end_time: z
      .string()
      .optional()
      .nullable()
      .transform((val) => (val === null ? undefined : val)),
    all_day: z.boolean().default(false),
    timezone: z
      .string()
      .optional()
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .default("UTC"),
  })
  .refine(
    (data) => {
      if (!data.end_date) return true;

      // Create datetime objects for comparison
      const startDateTime = new Date(
        data.start_date + "T" + (data.start_time || "00:00:00")
      );
      const endDateTime = new Date(
        data.end_date + "T" + (data.end_time || "23:59:59")
      );

      return endDateTime >= startDateTime;
    },
    {
      message: "End date and time must be after start date and time",
      path: ["end_date"],
    }
  );

export const locationSchema = z.object({
  location: optionalStringSchema.refine(
    (val) => !val || val.length <= 500,
    "Location must be less than 500 characters"
  ),
  venue_name: optionalStringSchema.refine(
    (val) => !val || val.length <= 255,
    "Venue name must be less than 255 characters"
  ),
  venue_address: optionalStringSchema.refine(
    (val) => !val || val.length <= 500,
    "Venue address must be less than 500 characters"
  ),
  venue_google_place_id: optionalStringSchema,
});

export const settingsSchema = z.object({
  is_public: z.boolean().default(false),
  max_guests: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === '') return undefined;
      if (typeof val === 'string') return Number(val);
      return val;
    },
    z
      .union([z.number(), z.undefined()])
      .refine(
        (val) => {
          // undefined means no value entered yet - valid (no limit)
          if (val === undefined) return true;
          // number must be in valid range
          return val >= 1 && val <= 10000;
        },
        {
          message: "Must have at least 1 guest",
        }
      )
  ),
  budget_total: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === '') return undefined;
      if (typeof val === 'string') return Number(val);
      return val;
    },
    z
      .union([z.number(), z.undefined()])
      .refine(
        (val) => {
          // undefined means no value entered yet - valid (no budget set)
          if (val === undefined) return true;
          // number must be in valid range
          return val >= 0 && val <= 10000000;
        },
        {
          message: "Budget must be at least $0",
        }
      )
  ),
  status: eventStatusSchema
    .optional()
    .nullable()
    .transform((val) => (val === null ? undefined : val))
    .default(EventStatus.DRAFT),
});

export const guestSettingsSchema = z
  .object({
    allow_plus_ones: z.boolean().default(false),
    require_rsvp: z.boolean().default(true),
    rsvp_deadline: optionalStringSchema,
    dietary_restrictions_enabled: z.boolean().default(false),
  })
  .refine(
    (data) => {
      if (!data.rsvp_deadline) return true;
      const rsvpDate = new Date(data.rsvp_deadline);
      const now = new Date();
      return rsvpDate > now;
    },
    {
      message: "RSVP deadline must be in the future",
      path: ["rsvp_deadline"],
    }
  );

// RSVP Custom Question Schema
// FR-6: The system shall display an RSVP submission page.
// 5.1.4: RSVP Customization
const rsvpCustomQuestionSchema = z
  .object({
    id: z.string(),
    question: z
      .string()
      .min(1, "Question is required")
      .max(500, "Question must be less than 500 characters"),
    type: z.enum(["text", "select", "yes_no"]),
    options: z.preprocess(
      (val) => val === null ? undefined : val,
      z.array(z.string()).optional()
    ),
    required: z.boolean().default(false),
    order: z.number().int().min(0),
  })
  .refine(
    (data) => {
      // For select type, options are required
      if (
        data.type === "select" &&
        (!data.options || data.options.length === 0)
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Options are required for multiple choice questions",
      path: ["options"],
    }
  )
  .refine(
    (data) => {
      // For non-select types, options should not be present
      if (data.type !== "select" && data.options && data.options.length > 0) {
        return false;
      }
      return true;
    },
    {
      message: "Options should only be provided for multiple choice questions",
      path: ["options"],
    }
  );

// RSVP Settings Schema
export const rsvpSettingsSchema = z
  .object({
    allow_plus_ones: z.boolean().default(false),
    require_rsvp: z.boolean().default(true),
    rsvp_deadline: optionalStringSchema,
    dietary_restrictions_enabled: z.boolean().default(false),
    meal_options: z
      .array(z.string().min(1).max(100))
      .max(10, "Maximum 10 meal options allowed")
      .optional()
      .nullable()
      .transform(val => val === null ? [] : val),
    custom_questions: z
      .array(rsvpCustomQuestionSchema)
      .max(5, "Maximum 5 custom questions allowed")
      .optional()
      .nullable()
      .transform(val => val === null ? [] : val),
  })
  .refine(
    (data) => {
      // Ensure no duplicate meal options
      if (data.meal_options && data.meal_options.length > 0) {
        const uniqueOptions = new Set(data.meal_options);
        if (uniqueOptions.size !== data.meal_options.length) {
          return false;
        }
      }
      return true;
    },
    {
      message: "Duplicate meal options are not allowed",
      path: ["meal_options"],
    }
  )
  .refine(
    (data) => {
      // Ensure no duplicate question IDs
      if (data.custom_questions && data.custom_questions.length > 0) {
        const ids = data.custom_questions.map((q) => q.id);
        const uniqueIds = new Set(ids);
        if (uniqueIds.size !== ids.length) {
          return false;
        }
      }
      return true;
    },
    {
      message: "Duplicate question IDs are not allowed",
      path: ["custom_questions"],
    }
  );

export const notificationSettingsSchema = z.object({
  send_invitations: z.boolean().default(true),
  reminder_schedule: z.array(z.string()).default([]),
  auto_reminders: z.boolean().default(true),
});

// Complete event creation schema
export const eventCreateSchema = z.object({
  // Basic info step
  ...basicInfoSchema.shape,

  // Date/time step
  ...dateTimeSchema.shape,

  // Location step
  ...locationSchema.shape,

  // Settings step
  ...settingsSchema.shape,

  // FR-6: The system shall display an RSVP submission page.
  // 5.1.4: RSVP Customization
  rsvp_settings: rsvpSettingsSchema.optional().default({
    allow_plus_ones: false,
    require_rsvp: true,
    rsvp_deadline: undefined,
    dietary_restrictions_enabled: false,
    meal_options: [],
    custom_questions: [],
  }),
});

// Event edit schema - allows past dates
export const eventEditSchema = z.object({
  // Basic info step
  ...basicInfoSchema.shape,

  // Date/time step (edit version - allows past dates)
  ...dateTimeSchemaEdit.shape,

  // Location step
  ...locationSchema.shape,

  // Settings step
  ...settingsSchema.shape,

  // FR-6: The system shall display an RSVP submission page.
  // 5.1.4: RSVP Customization
  rsvp_settings: rsvpSettingsSchema.optional().default({
    allow_plus_ones: false,
    require_rsvp: true,
    rsvp_deadline: undefined,
    dietary_restrictions_enabled: false,
    meal_options: [],
    custom_questions: [],
  }),
});

// Event update schema (all fields optional except ID)
export const eventUpdateSchema = eventCreateSchema.partial().extend({
  id: z.string().uuid("Invalid event ID"),
});

// Form step validation mapping
export const formStepSchemas = {
  basicInfo: basicInfoSchema,
  dateTime: dateTimeSchema,
  location: locationSchema,
  settings: settingsSchema,
  rsvpSettings: rsvpSettingsSchema,
} as const;

// Form step validation mapping for edit mode
export const formStepSchemasEdit = {
  basicInfo: basicInfoSchema,
  dateTime: dateTimeSchemaEdit,
  location: locationSchema,
  settings: settingsSchema,
  rsvpSettings: rsvpSettingsSchema,
} as const;

// Form data types derived from schemas
export type BasicInfoFormData = z.infer<typeof basicInfoSchema>;
export type DateTimeFormData = z.infer<typeof dateTimeSchema>;
export type LocationFormData = z.infer<typeof locationSchema>;
export type SettingsFormData = z.infer<typeof settingsSchema>;
export type GuestSettingsFormData = z.infer<typeof guestSettingsSchema>;
export type NotificationSettingsFormData = z.infer<
  typeof notificationSettingsSchema
>;
export type RSVPSettingsFormData = z.infer<typeof rsvpSettingsSchema>;
export type EventCreateFormData = z.infer<typeof eventCreateSchema>;
export type EventUpdateFormData = z.infer<typeof eventUpdateSchema>;

// Form step names
export type FormStepName = keyof typeof formStepSchemas;

// Multi-step form configuration
export interface FormStep {
  name: FormStepName;
  title: string;
  description: string;
  schema: z.ZodSchema;
  optional: boolean;
}

export const FORM_STEPS: FormStep[] = [
  {
    name: "basicInfo",
    title: "Basic Information",
    description: "Event name, type, and description",
    schema: basicInfoSchema,
    optional: false,
  },
  {
    name: "dateTime",
    title: "Date & Time",
    description: "When your event will take place",
    schema: dateTimeSchema,
    optional: false,
  },
  {
    name: "location",
    title: "Location",
    description: "Where your event will be held",
    schema: locationSchema,
    optional: true,
  },
  {
    name: "settings",
    title: "Event Settings",
    description: "Privacy, guest limits, and budget",
    schema: settingsSchema,
    optional: false,
  },
  // FR-6: The system shall display an RSVP submission page.
  // 5.1.4: RSVP Customization
  {
    name: "rsvpSettings",
    title: "RSVP Customization",
    description: "Configure RSVP options and questions",
    schema: rsvpSettingsSchema,
    optional: false, // Make this step mandatory so it's not skipped
  },
];

// Default form values
export const defaultEventFormValues: Partial<EventCreateFormData> = {
  type: EventType.OTHER,
  is_public: false,
  status: EventStatus.DRAFT,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  // FR-6: The system shall display an RSVP submission page.
  // 5.1.4: RSVP Customization
  rsvp_settings: {
    allow_plus_ones: false,
    require_rsvp: true,
    rsvp_deadline: undefined,
    dietary_restrictions_enabled: false,
    meal_options: [],
    custom_questions: [],
  },
};

// Form validation utilities
export const validateFormStep = (
  stepName: FormStepName,
  data: unknown,
  mode: "create" | "edit" = "create"
) => {
  const schemas = mode === "edit" ? formStepSchemasEdit : formStepSchemas;
  const schema = schemas[stepName];
  return schema.safeParse(data);
};

export const validateCompleteForm = (
  data: unknown,
  mode: "create" | "edit" = "create"
) => {
  const schema = mode === "edit" ? eventEditSchema : eventCreateSchema;
  return schema.safeParse(data);
};

// Error formatting utilities
export const formatZodErrors = (error: z.ZodError) => {
  const formattedErrors: Record<string, string> = {};

  error.issues.forEach((issue) => {
    const path = issue.path.join(".");
    formattedErrors[path] = issue.message;
  });

  return formattedErrors;
};

export const getFieldError = (
  errors: Record<string, string>,
  fieldPath: string
) => {
  return errors[fieldPath];
};
