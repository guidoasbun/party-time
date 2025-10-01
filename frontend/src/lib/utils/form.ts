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
  if (formData.max_guests !== undefined && formData.max_guests !== null) transformed.max_guests = formData.max_guests
  if (formData.budget_total !== undefined && formData.budget_total !== null) transformed.budget_total = formData.budget_total
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

  if (transformed.guest_settings &&
      typeof transformed.guest_settings === 'object' &&
      transformed.guest_settings !== null &&
      'rsvp_deadline' in transformed.guest_settings) {
    const guestSettings = transformed.guest_settings as Record<string, unknown>
    if (typeof guestSettings.rsvp_deadline === 'string') {
      guestSettings.rsvp_deadline = new Date(guestSettings.rsvp_deadline).toISOString().split('T')[0]
    }
  }

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
    case 'guestSettings':
      return [] // All guest settings are optional
    case 'notificationSettings':
      return [] // All notification settings are optional
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