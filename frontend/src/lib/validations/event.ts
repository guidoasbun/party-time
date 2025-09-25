import { z } from 'zod'
import { EventType, EventStatus } from '@/types/event.types'

// Base validation schemas
const eventTypeSchema = z.nativeEnum(EventType)
const eventStatusSchema = z.nativeEnum(EventStatus)

// Helper schemas
const positiveNumberSchema = z.number().min(0, 'Must be a positive number')
const optionalPositiveNumberSchema = z.number().min(0).optional()
const nonEmptyStringSchema = z.string().min(1, 'This field is required')
const optionalStringSchema = z.string().optional()

// Date validation helpers
const futureDateSchema = z.string()
  .min(1, 'Date is required')
  .refine((date) => {
    const selectedDate = new Date(date)
    const now = new Date()
    // Allow events to be created for today or future
    now.setHours(0, 0, 0, 0)
    return selectedDate >= now
  }, 'Event date cannot be in the past')

const endDateSchema = z.string().optional()

// Multi-step form schemas
export const basicInfoSchema = z.object({
  name: nonEmptyStringSchema.max(255, 'Event name must be less than 255 characters'),
  description: optionalStringSchema.max(2000, 'Description must be less than 2000 characters'),
  type: eventTypeSchema,
})

export const dateTimeSchema = z.object({
  start_date: futureDateSchema,
  end_date: endDateSchema,
  timezone: z.string().optional().default('UTC'),
}).refine((data) => {
  if (!data.end_date) return true
  const startDate = new Date(data.start_date)
  const endDate = new Date(data.end_date)
  return endDate > startDate
}, {
  message: 'End date must be after start date',
  path: ['end_date']
})

export const locationSchema = z.object({
  location: optionalStringSchema.max(500, 'Location must be less than 500 characters'),
  venue_name: optionalStringSchema.max(255, 'Venue name must be less than 255 characters'),
  venue_address: optionalStringSchema.max(500, 'Venue address must be less than 500 characters'),
  venue_google_place_id: optionalStringSchema,
})

export const settingsSchema = z.object({
  is_public: z.boolean().default(false),
  max_guests: optionalPositiveNumberSchema.refine((val) => {
    if (val === undefined) return true
    return val >= 1 && val <= 10000
  }, 'Guest limit must be between 1 and 10,000'),
  budget_total: optionalPositiveNumberSchema.refine((val) => {
    if (val === undefined) return true
    return val >= 0 && val <= 10000000
  }, 'Budget must be between $0 and $10,000,000'),
  status: eventStatusSchema.optional().default(EventStatus.DRAFT),
})

export const guestSettingsSchema = z.object({
  allow_plus_ones: z.boolean().default(false),
  require_rsvp: z.boolean().default(true),
  rsvp_deadline: z.string().optional(),
  dietary_restrictions_enabled: z.boolean().default(false),
}).refine((data) => {
  if (!data.rsvp_deadline) return true
  const rsvpDate = new Date(data.rsvp_deadline)
  const now = new Date()
  return rsvpDate > now
}, {
  message: 'RSVP deadline must be in the future',
  path: ['rsvp_deadline']
})

export const notificationSettingsSchema = z.object({
  send_invitations: z.boolean().default(true),
  reminder_schedule: z.array(z.string()).default([]),
  auto_reminders: z.boolean().default(true),
})

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

  // Additional settings (optional)
  guest_settings: guestSettingsSchema.optional(),
  notification_settings: notificationSettingsSchema.optional(),
})

// Event update schema (all fields optional except ID)
export const eventUpdateSchema = eventCreateSchema.partial().extend({
  id: z.string().uuid('Invalid event ID'),
})

// Form step validation mapping
export const formStepSchemas = {
  basicInfo: basicInfoSchema,
  dateTime: dateTimeSchema,
  location: locationSchema,
  settings: settingsSchema,
  guestSettings: guestSettingsSchema,
  notificationSettings: notificationSettingsSchema,
} as const

// Form data types derived from schemas
export type BasicInfoFormData = z.infer<typeof basicInfoSchema>
export type DateTimeFormData = z.infer<typeof dateTimeSchema>
export type LocationFormData = z.infer<typeof locationSchema>
export type SettingsFormData = z.infer<typeof settingsSchema>
export type GuestSettingsFormData = z.infer<typeof guestSettingsSchema>
export type NotificationSettingsFormData = z.infer<typeof notificationSettingsSchema>
export type EventCreateFormData = z.infer<typeof eventCreateSchema>
export type EventUpdateFormData = z.infer<typeof eventUpdateSchema>

// Form step names
export type FormStepName = keyof typeof formStepSchemas

// Multi-step form configuration
export interface FormStep {
  name: FormStepName
  title: string
  description: string
  schema: z.ZodSchema
  optional: boolean
}

export const FORM_STEPS: FormStep[] = [
  {
    name: 'basicInfo',
    title: 'Basic Information',
    description: 'Event name, type, and description',
    schema: basicInfoSchema,
    optional: false,
  },
  {
    name: 'dateTime',
    title: 'Date & Time',
    description: 'When your event will take place',
    schema: dateTimeSchema,
    optional: false,
  },
  {
    name: 'location',
    title: 'Location',
    description: 'Where your event will be held',
    schema: locationSchema,
    optional: true,
  },
  {
    name: 'settings',
    title: 'Event Settings',
    description: 'Privacy, guest limits, and budget',
    schema: settingsSchema,
    optional: false,
  },
]

// Default form values
export const defaultEventFormValues: Partial<EventCreateFormData> = {
  type: EventType.OTHER,
  is_public: false,
  status: EventStatus.DRAFT,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  guest_settings: {
    allow_plus_ones: false,
    require_rsvp: true,
    dietary_restrictions_enabled: false,
  },
  notification_settings: {
    send_invitations: true,
    reminder_schedule: [],
    auto_reminders: true,
  },
}

// Form validation utilities
export const validateFormStep = (stepName: FormStepName, data: unknown) => {
  const schema = formStepSchemas[stepName]
  return schema.safeParse(data)
}

export const validateCompleteForm = (data: unknown) => {
  return eventCreateSchema.safeParse(data)
}

// Error formatting utilities
export const formatZodErrors = (errors: z.ZodError) => {
  const formattedErrors: Record<string, string> = {}

  errors.errors.forEach((error) => {
    const path = error.path.join('.')
    formattedErrors[path] = error.message
  })

  return formattedErrors
}

export const getFieldError = (errors: Record<string, string>, fieldPath: string) => {
  return errors[fieldPath]
}