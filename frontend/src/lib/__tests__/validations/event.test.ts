import {
  basicInfoSchema,
  dateTimeSchema,
  locationSchema,
  settingsSchema,
  eventCreateSchema,
  eventUpdateSchema,
  validateFormStep,
  validateCompleteForm,
  formatZodErrors,
  getFieldError,
  defaultEventFormValues
} from '@/lib/validations/event'
import { EventType, EventStatus } from '@/types/event.types'

describe('Event Validation Schemas', () => {
  describe('basicInfoSchema', () => {
    it('validates valid basic info', () => {
      const validData = {
        name: 'Test Event',
        description: 'A test event',
        type: EventType.BIRTHDAY
      }

      const result = basicInfoSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validData)
      }
    })

    it('requires event name', () => {
      const invalidData = {
        description: 'A test event',
        type: EventType.BIRTHDAY
      }

      const result = basicInfoSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['name'])
        expect(result.error.issues[0].message).toContain('expected string')
      }
    })

    it('rejects empty event name', () => {
      const invalidData = {
        name: '',
        type: EventType.BIRTHDAY
      }

      const result = basicInfoSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('enforces maximum length for event name', () => {
      const longName = 'a'.repeat(256)
      const invalidData = {
        name: longName,
        type: EventType.BIRTHDAY
      }

      const result = basicInfoSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Event name must be less than 255 characters')
      }
    })

    it('validates event types', () => {
      const validData = {
        name: 'Test Event',
        type: EventType.WEDDING
      }

      const result = basicInfoSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('rejects invalid event types', () => {
      const invalidData = {
        name: 'Test Event',
        type: 'invalid_type'
      }

      const result = basicInfoSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('enforces maximum length for description', () => {
      const longDescription = 'a'.repeat(2001)
      const invalidData = {
        name: 'Test Event',
        description: longDescription,
        type: EventType.BIRTHDAY
      }

      const result = basicInfoSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Description must be less than 2000 characters')
      }
    })
  })

  describe('dateTimeSchema', () => {
    it('validates valid date time', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const dateString = tomorrow.toISOString().split('T')[0]

      const validData = {
        start_date: dateString,
        timezone: 'UTC'
      }

      const result = dateTimeSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('requires start date', () => {
      const invalidData = {
        timezone: 'UTC'
      }

      const result = dateTimeSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['start_date'])
      }
    })

    it('rejects past dates', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const dateString = yesterday.toISOString().split('T')[0]

      const invalidData = {
        start_date: dateString,
        timezone: 'UTC'
      }

      const result = dateTimeSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Event date cannot be in the past')
      }
    })

    it('validates that end date is after start date', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const dayAfterTomorrow = new Date()
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)

      const validData = {
        start_date: tomorrow.toISOString().split('T')[0],
        end_date: dayAfterTomorrow.toISOString().split('T')[0],
        timezone: 'UTC'
      }

      const result = dateTimeSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('rejects end date before start date', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const today = new Date()

      const invalidData = {
        start_date: tomorrow.toISOString().split('T')[0],
        end_date: today.toISOString().split('T')[0],
        timezone: 'UTC'
      }

      const result = dateTimeSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('End date must be after start date')
        expect(result.error.issues[0].path).toEqual(['end_date'])
      }
    })

    it('allows same day start and end date', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const dateString = tomorrow.toISOString().split('T')[0]

      const validData = {
        start_date: dateString,
        end_date: dateString,
        timezone: 'UTC'
      }

      const result = dateTimeSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('accepts today as start date', () => {
      const today = new Date()
      const dateString = today.toISOString().split('T')[0]

      const validData = {
        start_date: dateString,
        timezone: 'UTC'
      }

      const result = dateTimeSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('locationSchema', () => {
    it('validates valid location data', () => {
      const validData = {
        location: 'Seattle, WA',
        venue_name: 'The Grand Hall',
        venue_address: '123 Main St, Seattle, WA 98101',
        venue_google_place_id: 'ChIJVTPokywQkFQRmtVEaUZlJRA'
      }

      const result = locationSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('accepts empty location data', () => {
      const validData = {}

      const result = locationSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('enforces maximum length constraints', () => {
      const longString = 'a'.repeat(501)
      const invalidData = {
        location: longString
      }

      const result = locationSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Location must be less than 500 characters')
      }
    })

    it('validates venue name length', () => {
      const longVenueName = 'a'.repeat(256)
      const invalidData = {
        venue_name: longVenueName
      }

      const result = locationSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Venue name must be less than 255 characters')
      }
    })
  })

  describe('settingsSchema', () => {
    it('validates valid settings with defaults', () => {
      const validData = {}

      const result = settingsSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.is_public).toBe(false)
        expect(result.data.status).toBe(EventStatus.DRAFT)
      }
    })

    it('validates custom settings', () => {
      const validData = {
        is_public: true,
        max_guests: 50,
        budget_total: 5000,
        status: EventStatus.CONFIRMED
      }

      const result = settingsSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('validates guest limit range', () => {
      const invalidData = {
        max_guests: 0
      }

      const result = settingsSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Guest limit must be between 1 and 10,000')
      }
    })

    it('rejects excessive guest limits', () => {
      const invalidData = {
        max_guests: 20000
      }

      const result = settingsSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('validates budget range', () => {
      const invalidData = {
        budget_total: -100
      }

      const result = settingsSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('expected number to be >=0')
      }
    })

    it('accepts zero budget', () => {
      const validData = {
        budget_total: 0
      }

      const result = settingsSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('eventCreateSchema', () => {
    it('validates complete event data', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      const validData = {
        name: 'Test Event',
        type: EventType.BIRTHDAY,
        start_date: tomorrow.toISOString().split('T')[0],
        is_public: false
      }

      const result = eventCreateSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('requires all mandatory fields', () => {
      const invalidData = {
        name: 'Test Event'
        // Missing type, start_date, is_public
      }

      const result = eventCreateSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('eventUpdateSchema', () => {
    it('validates partial update data', () => {
      const validData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Updated Event Name'
      }

      const result = eventUpdateSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('requires valid UUID for id', () => {
      const invalidData = {
        id: 'invalid-uuid',
        name: 'Updated Event Name'
      }

      const result = eventUpdateSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid event ID')
      }
    })
  })

  describe('validateFormStep', () => {
    it('validates basic info step', () => {
      const data = {
        name: 'Test Event',
        type: EventType.BIRTHDAY
      }

      const result = validateFormStep('basicInfo', data)
      expect(result.success).toBe(true)
    })

    it('returns validation errors for invalid step data', () => {
      const data = {
        name: '',
        type: EventType.BIRTHDAY
      }

      const result = validateFormStep('basicInfo', data)
      expect(result.success).toBe(false)
    })
  })

  describe('validateCompleteForm', () => {
    it('validates complete form data', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      const data = {
        name: 'Complete Event',
        type: EventType.WEDDING,
        start_date: tomorrow.toISOString().split('T')[0],
        is_public: true
      }

      const result = validateCompleteForm(data)
      expect(result.success).toBe(true)
    })
  })

  describe('formatZodErrors', () => {
    it('formats validation errors correctly', () => {
      const invalidData = {
        name: '',
        type: 'invalid'
      }

      const result = basicInfoSchema.safeParse(invalidData)
      expect(result.success).toBe(false)

      if (!result.success) {
        const formattedErrors = formatZodErrors(result.error)
        expect(formattedErrors).toHaveProperty('name')
        expect(formattedErrors).toHaveProperty('type')
      }
    })

    it('handles nested field paths', () => {
      const result = dateTimeSchema.safeParse({
        start_date: '2023-12-01',
        end_date: '2023-11-30'
      })

      if (!result.success) {
        const formattedErrors = formatZodErrors(result.error)
        expect(formattedErrors).toHaveProperty('end_date')
      }
    })
  })

  describe('getFieldError', () => {
    it('retrieves field error by path', () => {
      const errors = {
        'name': 'Name is required',
        'start_date': 'Invalid date'
      }

      expect(getFieldError(errors, 'name')).toBe('Name is required')
      expect(getFieldError(errors, 'start_date')).toBe('Invalid date')
      expect(getFieldError(errors, 'description')).toBeUndefined()
    })
  })

  describe('defaultEventFormValues', () => {
    it('provides sensible defaults', () => {
      expect(defaultEventFormValues.type).toBe(EventType.OTHER)
      expect(defaultEventFormValues.is_public).toBe(false)
      expect(defaultEventFormValues.status).toBe(EventStatus.DRAFT)
      expect(defaultEventFormValues.timezone).toBeTruthy()
      expect(defaultEventFormValues.guest_settings).toBeDefined()
      expect(defaultEventFormValues.notification_settings).toBeDefined()
    })
  })
})