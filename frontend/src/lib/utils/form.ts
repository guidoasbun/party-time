import { EventCreateFormData, FormStepName } from '@/lib/validations/event'

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
export const transformFormDataForApi = (formData: EventCreateFormData) => {
  // Transform dates to proper ISO strings if needed
  const transformed = { ...formData }

  // Ensure dates are properly formatted
  if (transformed.start_date) {
    transformed.start_date = new Date(transformed.start_date).toISOString()
  }

  if (transformed.end_date) {
    transformed.end_date = new Date(transformed.end_date).toISOString()
  }

  if (transformed.guest_settings?.rsvp_deadline) {
    transformed.guest_settings.rsvp_deadline = new Date(
      transformed.guest_settings.rsvp_deadline
    ).toISOString()
  }

  return transformed
}

export const transformApiDataForForm = (apiData: Record<string, unknown>): Partial<EventCreateFormData> => {
  const transformed = { ...apiData }

  // Transform ISO dates to YYYY-MM-DD format for form inputs
  if (transformed.start_date && typeof transformed.start_date === 'string') {
    transformed.start_date = new Date(transformed.start_date).toISOString().split('T')[0]
  }

  if (transformed.end_date && typeof transformed.end_date === 'string') {
    transformed.end_date = new Date(transformed.end_date).toISOString().split('T')[0]
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