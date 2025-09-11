/**
 * Type safety and validation tests
 */

import {
  EventType,
  EventStatus,
  RsvpStatus,
  UserRole,
  BudgetCategoryCreate,
  ExpenseCreate,
  GuestCreate,
  EventCreate,
  API_ENDPOINTS
} from '@/types'

describe('Type System Tests', () => {
  describe('Enums', () => {
    it('should have correct EventType values', () => {
      expect(EventType.WEDDING).toBe('wedding')
      expect(EventType.BIRTHDAY).toBe('birthday')
      expect(EventType.CORPORATE).toBe('corporate')
      expect(Object.values(EventType)).toContain('anniversary')
    })

    it('should have correct EventStatus values', () => {
      expect(EventStatus.DRAFT).toBe('draft')
      expect(EventStatus.PLANNING).toBe('planning')
      expect(EventStatus.CONFIRMED).toBe('confirmed')
      expect(EventStatus.COMPLETED).toBe('completed')
    })

    it('should have correct RsvpStatus values', () => {
      expect(RsvpStatus.PENDING).toBe('pending')
      expect(RsvpStatus.CONFIRMED).toBe('confirmed')
      expect(RsvpStatus.DECLINED).toBe('declined')
      expect(RsvpStatus.TENTATIVE).toBe('tentative')
    })

    it('should have correct UserRole values', () => {
      expect(UserRole.ADMIN).toBe('admin')
      expect(UserRole.PLANNER).toBe('planner')
      expect(UserRole.GUEST).toBe('guest')
    })
  })

  describe('Interface Compliance', () => {
    it('should allow valid BudgetCategoryCreate', () => {
      const validCategory: BudgetCategoryCreate = {
        name: 'Venue',
        allocated_amount: 5000,
        color: '#3B82F6'
      }

      expect(validCategory.name).toBe('Venue')
      expect(validCategory.allocated_amount).toBe(5000)
      expect(validCategory.color).toBe('#3B82F6')
    })

    it('should allow valid ExpenseCreate', () => {
      const validExpense: ExpenseCreate = {
        name: 'Venue Booking',
        amount: 5000,
        expense_date: '2024-01-15',
        vendor_name: 'ABC Venues',
        is_paid: false,
        category_id: 'cat-123'
      }

      expect(validExpense.name).toBe('Venue Booking')
      expect(validExpense.amount).toBe(5000)
      expect(validExpense.is_paid).toBe(false)
    })

    it('should allow valid GuestCreate', () => {
      const validGuest: GuestCreate = {
        email: 'guest@example.com',
        first_name: 'John',
        last_name: 'Doe',
        phone: '+1234567890',
        plus_one_allowed: true,
        plus_one_name: 'Jane Doe',
        dietary_restrictions: 'Vegetarian',
        notes: 'VIP guest'
      }

      expect(validGuest.email).toBe('guest@example.com')
      expect(validGuest.plus_one_allowed).toBe(true)
    })

    it('should allow valid EventCreate', () => {
      const validEvent: EventCreate = {
        name: 'Wedding Celebration',
        description: 'A beautiful wedding',
        type: EventType.WEDDING,
        start_date: '2024-06-01T15:00:00Z',
        end_date: '2024-06-01T23:00:00Z',
        location: 'Beach Resort',
        venue_name: 'Sunset Beach Resort',
        venue_address: '123 Beach St, Paradise Island',
        max_guests: 100,
        budget_total: 25000,
        is_public: false,
        status: EventStatus.PLANNING
      }

      expect(validEvent.name).toBe('Wedding Celebration')
      expect(validEvent.type).toBe(EventType.WEDDING)
      expect(validEvent.max_guests).toBe(100)
    })
  })

  describe('API Endpoints', () => {
    it('should generate correct auth endpoints', () => {
      expect(API_ENDPOINTS.AUTH.REGISTER).toBe('/api/v1/auth/register')
      expect(API_ENDPOINTS.AUTH.LOGIN).toBe('/api/v1/auth/login')
      expect(API_ENDPOINTS.AUTH.ME).toBe('/api/v1/auth/me')
    })

    it('should generate correct event endpoints', () => {
      expect(API_ENDPOINTS.EVENTS.LIST).toBe('/api/v1/events')
      expect(API_ENDPOINTS.EVENTS.CREATE).toBe('/api/v1/events')
      expect(API_ENDPOINTS.EVENTS.GET('123')).toBe('/api/v1/events/123')
      expect(API_ENDPOINTS.EVENTS.UPDATE('456')).toBe('/api/v1/events/456')
    })

    it('should generate correct guest endpoints', () => {
      expect(API_ENDPOINTS.GUESTS.LIST('event-123')).toBe('/api/v1/events/event-123/guests')
      expect(API_ENDPOINTS.GUESTS.CREATE('event-123')).toBe('/api/v1/events/event-123/guests')
      expect(API_ENDPOINTS.GUESTS.GET('event-123', 'guest-456')).toBe('/api/v1/events/event-123/guests/guest-456')
    })

    it('should generate correct budget endpoints', () => {
      expect(API_ENDPOINTS.BUDGET.CATEGORIES('event-123')).toBe('/api/v1/events/event-123/budget/categories')
      expect(API_ENDPOINTS.BUDGET.EXPENSES('event-123')).toBe('/api/v1/events/event-123/budget/expenses')
      expect(API_ENDPOINTS.BUDGET.SUMMARY('event-123')).toBe('/api/v1/events/event-123/budget/summary')
    })
  })

  describe('Type Inference', () => {
    it('should infer types correctly from unions', () => {
      const status: EventStatus = EventStatus.PLANNING
      
      // TypeScript should understand this is a valid EventStatus
      expect([
        EventStatus.DRAFT,
        EventStatus.PLANNING,
        EventStatus.CONFIRMED
      ]).toContain(status)
    })

    it('should handle optional properties correctly', () => {
      const minimalEvent: EventCreate = {
        name: 'Minimal Event',
        type: EventType.OTHER,
        start_date: '2024-06-01T15:00:00Z',
        is_public: false
      }

      // Should compile without requiring optional properties
      expect(minimalEvent.name).toBe('Minimal Event')
      expect(minimalEvent.description).toBeUndefined()
      expect(minimalEvent.end_date).toBeUndefined()
    })
  })

  describe('Index Signatures', () => {
    it('should allow additional properties in search params', () => {
      const searchParams = {
        page: 1,
        limit: 10,
        search: 'wedding',
        // Additional properties should be allowed
        custom_filter: 'value',
        another_param: 123
      }

      // Should be assignable to Record<string, unknown>
      const record: Record<string, unknown> = searchParams
      expect(record.page).toBe(1)
      expect(record.custom_filter).toBe('value')
    })
  })

  describe('Type Guards', () => {
    it('should work with discriminated unions', () => {
      type ApiResult<T> = 
        | { success: true; data: T }
        | { success: false; error: string }

      const successResult: ApiResult<string> = {
        success: true,
        data: 'test data'
      }

      const errorResult: ApiResult<string> = {
        success: false,
        error: 'Something went wrong'
      }

      if (successResult.success) {
        // TypeScript should know this has 'data' property
        expect(successResult.data).toBe('test data')
      }

      if (!errorResult.success) {
        // TypeScript should know this has 'error' property
        expect(errorResult.error).toBe('Something went wrong')
      }
    })
  })
})