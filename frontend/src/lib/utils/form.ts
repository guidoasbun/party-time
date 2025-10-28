import { EventCreateFormData, FormStepName } from '@/lib/validations/event'
import { EventCreate } from '@/types/event.types'

// Local storage keys
const FORM_STORAGE_KEY = 'party-time-event-form'
const FORM_STEP_STORAGE_KEY = 'party-time-event-form-step'

// Form persistence utilities
export class FormPersistence {
  private static getStorageKey(formId?: string): string {
    return formId ? `${FORM_STORAGE_KEY}-${formId}` : FORM_STORAGE_KEY
  }

  private static getStepStorageKey(formId?: string): string {
    return formId ? `${FORM_STEP_STORAGE_KEY}-${formId}` : FORM_STEP_STORAGE_KEY
  }

  // Save form data to localStorage
  static saveFormData(data: Partial<EventCreateFormData>, formId?: string): void {
    try {
      const key = this.getStorageKey(formId)
      const timestamp = new Date().toISOString()
      const formData = {
        data,
        timestamp,
        version: '1.0',
      }
      localStorage.setItem(key, JSON.stringify(formData))
    } catch {
      console.warn('Failed to save form data to localStorage')
    }
  }

  // Load form data from localStorage
  static loadFormData(formId?: string): Partial<EventCreateFormData> | null {
    try {
      const key = this.getStorageKey(formId)
      const stored = localStorage.getItem(key)

      if (!stored) return null

      const parsed = JSON.parse(stored)

      // Check if data is too old (older than 7 days)
      if (parsed.timestamp) {
        const storedDate = new Date(parsed.timestamp)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)

        if (storedDate < weekAgo) {
          this.clearFormData(formId)
          return null
        }
      }

      return parsed.data || null
    } catch (error) {
      console.warn('Failed to load form data from localStorage:', error)
      return null
    }
  }

  // Save current step
  static saveCurrentStep(step: FormStepName, formId?: string): void {
    try {
      const key = this.getStepStorageKey(formId)
      localStorage.setItem(key, step)
    } catch (error) {
      console.warn('Failed to save current step:', error)
    }
  }

  // Load current step
  static loadCurrentStep(formId?: string): FormStepName | null {
    try {
      const key = this.getStepStorageKey(formId)
      const step = localStorage.getItem(key) as FormStepName | null
      return step
    } catch (error) {
      console.warn('Failed to load current step:', error)
      return null
    }
  }

  // Clear form data from localStorage
  static clearFormData(formId?: string): void {
    try {
      const dataKey = this.getStorageKey(formId)
      const stepKey = this.getStepStorageKey(formId)
      localStorage.removeItem(dataKey)
      localStorage.removeItem(stepKey)
    } catch (error) {
      console.warn('Failed to clear form data from localStorage:', error)
    }
  }

  // Check if form has saved data
  static hasSavedData(formId?: string): boolean {
    try {
      const key = this.getStorageKey(formId)
      return localStorage.getItem(key) !== null
    } catch (error) {
      return false
    }
  }

  // Clear all form data (useful for cleanup)
  static clearAllFormData(): void {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(FORM_STORAGE_KEY) || key.startsWith(FORM_STEP_STORAGE_KEY)) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.warn('Failed to clear all form data:', error)
    }
  }
}

// Form state management utilities
export interface FormStepState {
  currentStep: number
  totalSteps: number
  isValid: boolean
  isDirty: boolean
  isSubmitting: boolean
}

export const getStepProgress = (currentStep: number, totalSteps: number): number => {
  return Math.round(((currentStep + 1) / totalSteps) * 100)
}

export const canNavigateToStep = (
  targetStep: number,
  currentStep: number,
  completedSteps: Set<number>
): boolean => {
  // Can always go to previous steps
  if (targetStep <= currentStep) return true

  // Can go to next step if current step is completed
  if (targetStep === currentStep + 1 && completedSteps.has(currentStep)) return true

  // Can jump to any completed step
  return completedSteps.has(targetStep)
}

// Form data transformation utilities
export const transformFormDataForApi = (formData: EventCreateFormData): EventCreate => {
  // Combine date and time into proper ISO datetime strings
  // Handle both HH:mm and HH:mm:ss formats
  let startTime = formData.start_time || '00:00'
  if (startTime.length === 5) {
    startTime = `${startTime}:00` // Add seconds if not present
  }
  const startDateTime = `${formData.start_date}T${startTime}`
  const start_date = new Date(startDateTime).toISOString()

  // Create object with required fields
  const transformed: EventCreate = {
    name: formData.name,
    type: formData.type,
    start_date,
    is_public: formData.is_public ?? false,
  }

  // Add optional fields
  if (formData.description) transformed.description = formData.description
  if (formData.location) transformed.location = formData.location
  if (formData.venue_name) transformed.venue_name = formData.venue_name
  if (formData.venue_address) transformed.venue_address = formData.venue_address
  if (formData.venue_google_place_id) transformed.venue_google_place_id = formData.venue_google_place_id
  if (formData.max_guests !== undefined && formData.max_guests !== null) {
    transformed.max_guests = typeof formData.max_guests === 'string' ? Number(formData.max_guests) : formData.max_guests
  }
  if (formData.budget_total !== undefined && formData.budget_total !== null) {
    transformed.budget_total = typeof formData.budget_total === 'string' ? Number(formData.budget_total) : formData.budget_total
  }
  if (formData.status) transformed.status = formData.status

  // Handle end date if provided
  if (formData.end_date) {
    let endTime = formData.end_time || '23:59'
    if (endTime.length === 5) {
      endTime = `${endTime}:59` // Add seconds if not present
    }
    const endDateTime = `${formData.end_date}T${endTime}`
    transformed.end_date = new Date(endDateTime).toISOString()
  }

  // Transform RSVP settings from frontend nested structure to backend flat structure
  // Frontend has: rsvp_settings: { ... } nested object
  // Backend expects: rsvp_deadline, allow_plus_ones, meal_options, custom_questions, dietary_restrictions_enabled as direct fields
  if (formData.rsvp_settings) {
    if (formData.rsvp_settings.rsvp_deadline) {
      // Convert date to ISO string with time set to end of day
      const rsvpDeadline = new Date(`${formData.rsvp_settings.rsvp_deadline}T23:59:59`)
      transformed.rsvp_deadline = rsvpDeadline.toISOString()
    }
    transformed.allow_plus_ones = formData.rsvp_settings.allow_plus_ones ?? false
    transformed.dietary_restrictions_enabled = formData.rsvp_settings.dietary_restrictions_enabled ?? false
    if (formData.rsvp_settings.meal_options) {
      transformed.meal_options = formData.rsvp_settings.meal_options
    }
    if (formData.rsvp_settings.custom_questions) {
      transformed.custom_questions = formData.rsvp_settings.custom_questions
    }
  }

  // Note: start_time, end_time, all_day, timezone, guest_settings, and notification_settings
  // are intentionally omitted as they are not part of the backend EventCreate schema

  return transformed
}

export const transformApiDataForForm = (apiData: Record<string, unknown>): Partial<EventCreateFormData> => {
  const transformed = { ...apiData }

  // Transform ISO dates to YYYY-MM-DD format and extract time for form inputs
  if (transformed.start_date && typeof transformed.start_date === 'string') {
    const startDateTime = new Date(transformed.start_date)
    transformed.start_date = startDateTime.toISOString().split('T')[0]

    // Extract time in HH:mm format (without seconds, as expected by DateTimeStep)
    const hours = String(startDateTime.getHours()).padStart(2, '0')
    const minutes = String(startDateTime.getMinutes()).padStart(2, '0')
    transformed.start_time = `${hours}:${minutes}`

    // Set all_day to false if there's a specific time, true if midnight
    transformed.all_day = hours === '00' && minutes === '00'
  }

  if (transformed.end_date && typeof transformed.end_date === 'string') {
    const endDateTime = new Date(transformed.end_date)
    transformed.end_date = endDateTime.toISOString().split('T')[0]

    // Extract time in HH:mm format (without seconds, as expected by DateTimeStep)
    const hours = String(endDateTime.getHours()).padStart(2, '0')
    const minutes = String(endDateTime.getMinutes()).padStart(2, '0')
    transformed.end_time = `${hours}:${minutes}`
  }

  // Transform RSVP fields from backend flat structure to frontend nested structure
  // Backend returns: rsvp_deadline, allow_plus_ones, meal_options, custom_questions, dietary_restrictions_enabled as direct fields
  // Frontend expects: rsvp_settings: { ... } nested object
  const apiFields = transformed as Record<string, unknown>
  if (!apiFields.rsvp_settings) {
    apiFields.rsvp_settings = {
      allow_plus_ones: apiFields.allow_plus_ones ?? false,
      require_rsvp: true, // Default value, backend doesn't have this field
      rsvp_deadline: apiFields.rsvp_deadline as string | undefined,
      dietary_restrictions_enabled: apiFields.dietary_restrictions_enabled ?? false,
      meal_options: (apiFields.meal_options || []) as string[],
      custom_questions: (apiFields.custom_questions || []) as Array<{
        id: string
        question: string
        type: 'text' | 'select' | 'yes_no'
        options?: string[]
        required: boolean
      }>
    }
  }

  // Format RSVP deadline if present
  const rsvpSettings = apiFields.rsvp_settings as Record<string, unknown>
  if (rsvpSettings && typeof rsvpSettings.rsvp_deadline === 'string') {
    rsvpSettings.rsvp_deadline = new Date(rsvpSettings.rsvp_deadline).toISOString().split('T')[0]
  }

  // Clean up the flat fields since they're now in rsvp_settings
  delete apiFields.allow_plus_ones
  delete apiFields.rsvp_deadline
  delete apiFields.dietary_restrictions_enabled
  delete apiFields.meal_options
  delete apiFields.custom_questions

  return transformed
}

// Form validation utilities
export const getFormCompletion = (
  formData: Partial<EventCreateFormData>,
  requiredFields: (keyof EventCreateFormData)[]
): number => {
  const filledFields = requiredFields.filter(field => {
    const value = formData[field]
    return value !== undefined && value !== null && value !== ''
  })

  return Math.round((filledFields.length / requiredFields.length) * 100)
}

export const getRequiredFieldsForStep = (stepName: FormStepName): (keyof EventCreateFormData)[] => {
  switch (stepName) {
    case 'basicInfo':
      return ['name', 'type']
    case 'dateTime':
      return ['start_date']
    case 'location':
      return [] // Location is optional
    case 'settings':
      return ['is_public']
    case 'rsvpSettings':
      return [] // All RSVP settings are optional
    default:
      return []
  }
}

// Debounce utility for auto-save
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

// Auto-save hook utility
export const createAutoSave = (
  saveFunction: (data: Partial<EventCreateFormData>) => void,
  delay: number = 1000
) => {
  return debounce(saveFunction as (...args: unknown[]) => unknown, delay)
}