/**
 * Integration tests for Phase 2.3.1 API Layer
 */

import {
  EventType,
  EventStatus,
  RsvpStatus,
  UserRole,
  API_ENDPOINTS
} from '@/types'

describe('Phase 2.3.1 API Integration Tests', () => {
  describe('Type System', () => {
    it('should have correct enum values', () => {
      expect(EventType.WEDDING).toBe('wedding')
      expect(EventStatus.DRAFT).toBe('draft')
      expect(RsvpStatus.CONFIRMED).toBe('confirmed')
      expect(UserRole.ADMIN).toBe('admin')
    })

    it('should generate correct API endpoints', () => {
      expect(API_ENDPOINTS.AUTH.REGISTER).toBe('/api/v1/auth/register')
      expect(API_ENDPOINTS.EVENTS.LIST).toBe('/api/v1/events')
      expect(API_ENDPOINTS.EVENTS.GET('123')).toBe('/api/v1/events/123')
      expect(API_ENDPOINTS.GUESTS.LIST('event-123')).toBe('/api/v1/events/event-123/guests')
      expect(API_ENDPOINTS.BUDGET.CATEGORIES('event-123')).toBe('/api/v1/events/event-123/budget/categories')
    })
  })

  describe('Services Import', () => {
    it('should import services correctly', async () => {
      // Dynamic import to test module resolution
      const { authService } = await import('@/lib/api/services/auth.service')
      const { eventsService } = await import('@/lib/api/services/events.service')
      const { guestsService } = await import('@/lib/api/services/guests.service')
      const { budgetService } = await import('@/lib/api/services/budget.service')

      expect(authService).toBeDefined()
      expect(eventsService).toBeDefined()
      expect(guestsService).toBeDefined()
      expect(budgetService).toBeDefined()

      // Test service methods exist
      expect(typeof authService.validatePassword).toBe('function')
      expect(typeof eventsService.validateEventData).toBe('function')
      expect(typeof guestsService.validateGuestData).toBe('function')
      expect(typeof budgetService.validateCategoryData).toBe('function')
    })

    it('should import unified services object', async () => {
      const { services } = await import('@/lib/api/services')

      expect(services.auth).toBeDefined()
      expect(services.events).toBeDefined()
      expect(services.guests).toBeDefined()
      expect(services.budget).toBeDefined()
    })
  })

  describe('Validation Functions', () => {
    it('should validate auth data correctly', async () => {
      const { authService } = await import('@/lib/api/services/auth.service')

      const strongPassword = authService.validatePassword('TestPass123!')
      expect(strongPassword.isValid).toBe(true)
      expect(strongPassword.strength).toBe('strong')

      const weakPassword = authService.validatePassword('123')
      expect(weakPassword.isValid).toBe(false)
      expect(weakPassword.strength).toBe('weak')

      expect(authService.validateEmail('test@example.com')).toBe(true)
      expect(authService.validateEmail('invalid')).toBe(false)
    })

    it('should validate event data correctly', async () => {
      const { eventsService } = await import('@/lib/api/services/events.service')

      const validEvent = {
        name: 'Test Event',
        type: EventType.WEDDING,
        start_date: new Date(Date.now() + 86400000).toISOString(),
        is_public: false
      }

      const validation = eventsService.validateEventData(validEvent)
      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)

      const invalidEvent = {
        name: '',
        type: EventType.WEDDING,
        start_date: new Date(Date.now() - 86400000).toISOString(), // Past date
        is_public: false
      }

      const invalidValidation = eventsService.validateEventData(invalidEvent)
      expect(invalidValidation.isValid).toBe(false)
      expect(invalidValidation.errors.length).toBeGreaterThan(0)
    })

    it('should validate guest data correctly', async () => {
      const { guestsService } = await import('@/lib/api/services/guests.service')

      const validGuest = {
        email: 'guest@example.com',
        first_name: 'John',
        last_name: 'Doe',
        plus_one_allowed: false
      }

      const validation = guestsService.validateGuestData(validGuest)
      expect(validation.isValid).toBe(true)

      const invalidGuest = {
        email: 'invalid-email',
        first_name: '',
        last_name: 'Doe',
        plus_one_allowed: false
      }

      const invalidValidation = guestsService.validateGuestData(invalidGuest)
      expect(invalidValidation.isValid).toBe(false)
    })

    it('should validate budget data correctly', async () => {
      const { budgetService } = await import('@/lib/api/services/budget.service')

      const validCategory = {
        name: 'Venue',
        allocated_amount: 5000,
        color: '#3B82F6'
      }

      const validation = budgetService.validateCategoryData(validCategory)
      expect(validation.isValid).toBe(true)

      const invalidCategory = {
        name: '',
        allocated_amount: -100,
        color: 'invalid-color'
      }

      const invalidValidation = budgetService.validateCategoryData(invalidCategory)
      expect(invalidValidation.isValid).toBe(false)
    })
  })

  describe('Helper Functions', () => {
    it('should calculate budget metrics correctly', async () => {
      const { budgetService } = await import('@/lib/api/services/budget.service')

      expect(budgetService.calculateBudgetUtilization(10000, 7500)).toBe(75)
      expect(budgetService.calculateBudgetUtilization(0, 1000)).toBe(0)

      const categoryUtilization = budgetService.calculateCategoryUtilization(1000, 800)
      expect(categoryUtilization.percentage).toBe(80)
      expect(categoryUtilization.status).toBe('warning')
    })

    it('should generate default categories correctly', async () => {
      const { budgetService } = await import('@/lib/api/services/budget.service')

      const weddingCategories = budgetService.getDefaultCategories('wedding')
      expect(weddingCategories).toHaveLength(8)
      expect(weddingCategories[0].name).toBe('Venue')

      const birthdayCategories = budgetService.getDefaultCategories('birthday')
      expect(birthdayCategories).toHaveLength(6)
    })

    it('should generate RSVP summaries correctly', async () => {
      const { guestsService } = await import('@/lib/api/services/guests.service')

      const mockGuests = [
        { rsvp_status: RsvpStatus.CONFIRMED, plus_one_name: 'Jane' },
        { rsvp_status: RsvpStatus.PENDING },
        { rsvp_status: RsvpStatus.DECLINED }
      ] as Array<{rsvp_status: RsvpStatus; plus_one_name?: string}>

      const summary = guestsService.generateRSVPSummary(mockGuests)
      expect(summary.total).toBe(3)
      expect(summary.confirmed).toBe(1)
      expect(summary.pending).toBe(1)
      expect(summary.declined).toBe(1)
      expect(summary.plusOnesConfirmed).toBe(1)
    })

    it('should format currency correctly', async () => {
      const { budgetService } = await import('@/lib/api/services/budget.service')

      const formatted = budgetService.formatCurrency(1234.56)
      expect(formatted).toContain('1,234.56')
      expect(formatted).toContain('$')
    })
  })

  describe('Type Safety', () => {
    it('should maintain type safety in interfaces', () => {
      const eventData: EventType = EventType.WEDDING
      expect(typeof eventData).toBe('string')
      expect(eventData).toBe('wedding')

      const status: EventStatus = EventStatus.PLANNING
      expect(status).toBe('planning')

      const rsvp: RsvpStatus = RsvpStatus.CONFIRMED
      expect(rsvp).toBe('confirmed')
    })

    it('should allow proper interface usage', () => {
      // Test that our interfaces work with real data structures
      const eventCreate = {
        name: 'Test Event',
        type: EventType.BIRTHDAY,
        start_date: '2024-06-01T15:00:00Z',
        is_public: false
      }

      expect(eventCreate.name).toBe('Test Event')
      expect(eventCreate.type).toBe(EventType.BIRTHDAY)

      const guestCreate = {
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        plus_one_allowed: true
      }

      expect(guestCreate.email).toBe('test@example.com')
      expect(guestCreate.plus_one_allowed).toBe(true)
    })
  })
})