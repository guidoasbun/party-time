/**
 * Test setup and configuration for Phase 2.3.1 tests
 */

import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    route: '/',
    pathname: '/',
    query: {},
    asPath: '/',
    push: jest.fn(),
    replace: jest.fn(),
  }),
}))

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  getSession: jest.fn(() => Promise.resolve({
    idToken: 'mock-id-token',
    accessToken: 'mock-access-token',
    user: {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User'
    }
  })),
  useSession: jest.fn(() => ({
    data: {
      idToken: 'mock-id-token',
      user: {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User'
      }
    },
    status: 'authenticated'
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
}))

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000'

// Global test utilities
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toBeValidUUID(): R
      toBeValidEmail(): R
      toBeValidDate(): R
    }
  }
}

// Custom Jest matchers
expect.extend({
  toBeValidUUID(received: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    const pass = typeof received === 'string' && uuidRegex.test(received)
    
    return {
      message: () =>
        pass
          ? `expected ${received} not to be a valid UUID`
          : `expected ${received} to be a valid UUID`,
      pass,
    }
  },
  
  toBeValidEmail(received: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const pass = typeof received === 'string' && emailRegex.test(received)
    
    return {
      message: () =>
        pass
          ? `expected ${received} not to be a valid email`
          : `expected ${received} to be a valid email`,
      pass,
    }
  },
  
  toBeValidDate(received: string) {
    const pass = typeof received === 'string' && !isNaN(Date.parse(received))
    
    return {
      message: () =>
        pass
          ? `expected ${received} not to be a valid date`
          : `expected ${received} to be a valid date`,
      pass,
    }
  },
})

// Test data factories
export const createMockEvent = (overrides = {}) => ({
  id: 'event-123',
  name: 'Test Event',
  type: 'wedding',
  status: 'planning',
  start_date: '2024-06-01T15:00:00Z',
  end_date: '2024-06-01T23:00:00Z',
  planner_id: 'user-123',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  guest_count: 0,
  confirmed_guests: 0,
  total_expenses: 0,
  is_public: false,
  ...overrides
})

export const createMockGuest = (overrides = {}) => ({
  id: 'guest-123',
  event_id: 'event-123',
  email: 'guest@example.com',
  first_name: 'John',
  last_name: 'Doe',
  rsvp_status: 'pending',
  plus_one_allowed: false,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides
})

export const createMockBudgetCategory = (overrides = {}) => ({
  id: 'category-123',
  event_id: 'event-123',
  name: 'Venue',
  allocated_amount: 5000,
  color: '#3B82F6',
  spent_amount: 0,
  remaining_amount: 5000,
  expense_count: 0,
  created_at: '2024-01-01T00:00:00Z',
  ...overrides
})

export const createMockExpense = (overrides = {}) => ({
  id: 'expense-123',
  event_id: 'event-123',
  category_id: 'category-123',
  name: 'Venue Booking',
  amount: 5000,
  expense_date: '2024-01-15',
  is_paid: false,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides
})

export const createMockUser = (overrides = {}) => ({
  user_id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  email_verified: true,
  username: 'testuser',
  groups: ['user'],
  ...overrides
})

// Cleanup function for tests
export const cleanup = () => {
  jest.clearAllMocks()
  localStorage.clear()
  sessionStorage.clear()
}