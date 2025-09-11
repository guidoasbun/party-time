/**
 * Unit tests for BudgetService
 */

import { budgetService } from '../budget.service'
import { api } from '@/lib/api-client'
import {
  BudgetCategoryCreate,
  // BudgetCategoryUpdate,
  ExpenseCreate,
  // ExpenseUpdate,
  // EventType
} from '@/types'

// Mock the API client
jest.mock('@/lib/api-client', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    upload: jest.fn(),
    download: jest.fn(),
  },
  withRetry: jest.fn(() => ({ retries: { attempts: 2, delay: 1000, backoff: true } }))
}))

const mockApi = api as jest.Mocked<typeof api>

describe('BudgetService', () => {
  const mockEventId = 'event-123'
  const mockCategoryId = 'category-123'
  const mockExpenseId = 'expense-123'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Budget Categories', () => {
    describe('getBudgetCategories', () => {
      it('should fetch budget categories for an event', async () => {
        const mockCategories = [
          { id: 'cat-1', name: 'Venue', allocated_amount: 5000 },
          { id: 'cat-2', name: 'Catering', allocated_amount: 3000 }
        ]

        mockApi.get.mockResolvedValue(mockCategories)

        const result = await budgetService.getBudgetCategories(mockEventId)

        expect(mockApi.get).toHaveBeenCalledWith(
          `/api/v1/events/${mockEventId}/budget/categories`,
          undefined,
          { retries: { attempts: 2, delay: 1000, backoff: true } }
        )
        expect(result).toEqual(mockCategories)
      })
    })

    describe('createBudgetCategory', () => {
      it('should create a new budget category', async () => {
        const categoryData: BudgetCategoryCreate = {
          name: 'Venue',
          allocated_amount: 5000,
          color: '#3B82F6'
        }

        const expectedResponse = {
          id: mockCategoryId,
          event_id: mockEventId,
          ...categoryData,
          created_at: '2024-01-01T00:00:00Z'
        }

        mockApi.post.mockResolvedValue(expectedResponse)

        const result = await budgetService.createBudgetCategory(mockEventId, categoryData)

        expect(mockApi.post).toHaveBeenCalledWith(
          `/api/v1/events/${mockEventId}/budget/categories`,
          categoryData
        )
        expect(result).toEqual(expectedResponse)
      })
    })
  })

  describe('Expenses', () => {
    describe('createExpense', () => {
      it('should create a new expense', async () => {
        const expenseData: ExpenseCreate = {
          name: 'Venue Booking',
          amount: 5000,
          expense_date: '2024-01-15',
          category_id: mockCategoryId,
          is_paid: false
        }

        const expectedResponse = {
          id: mockExpenseId,
          event_id: mockEventId,
          ...expenseData,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }

        mockApi.post.mockResolvedValue(expectedResponse)

        const result = await budgetService.createExpense(mockEventId, expenseData)

        expect(mockApi.post).toHaveBeenCalledWith(
          `/api/v1/events/${mockEventId}/budget/expenses`,
          expenseData
        )
        expect(result).toEqual(expectedResponse)
      })
    })

    describe('markExpenseAsPaid', () => {
      it('should mark expense as paid', async () => {
        const expectedResponse = {
          id: mockExpenseId,
          name: 'Venue Booking',
          amount: 5000,
          is_paid: true
        }

        mockApi.patch.mockResolvedValue(expectedResponse)

        const result = await budgetService.markExpenseAsPaid(mockEventId, mockExpenseId)

        expect(mockApi.patch).toHaveBeenCalledWith(
          `/api/v1/events/${mockEventId}/budget/expenses/${mockExpenseId}`,
          { is_paid: true }
        )
        expect(result).toEqual(expectedResponse)
      })
    })
  })

  describe('Validation', () => {
    describe('validateCategoryData', () => {
      it('should validate valid category data', () => {
        const validData: BudgetCategoryCreate = {
          name: 'Venue',
          allocated_amount: 5000,
          color: '#3B82F6'
        }

        const result = budgetService.validateCategoryData(validData)

        expect(result.isValid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })

      it('should reject empty name', () => {
        const invalidData: BudgetCategoryCreate = {
          name: '',
          allocated_amount: 5000
        }

        const result = budgetService.validateCategoryData(invalidData)

        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Category name is required')
      })

      it('should reject negative amount', () => {
        const invalidData: BudgetCategoryCreate = {
          name: 'Venue',
          allocated_amount: -100
        }

        const result = budgetService.validateCategoryData(invalidData)

        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Allocated amount cannot be negative')
      })

      it('should reject invalid color format', () => {
        const invalidData: BudgetCategoryCreate = {
          name: 'Venue',
          allocated_amount: 5000,
          color: 'red'
        }

        const result = budgetService.validateCategoryData(invalidData)

        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Color must be a valid hex color code (e.g., #FF0000)')
      })
    })

    describe('validateExpenseData', () => {
      it('should validate valid expense data', () => {
        const validData: ExpenseCreate = {
          name: 'Venue Booking',
          amount: 5000,
          expense_date: '2024-01-15',
          is_paid: false
        }

        const result = budgetService.validateExpenseData(validData)

        expect(result.isValid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })

      it('should reject zero or negative amount', () => {
        const invalidData: ExpenseCreate = {
          name: 'Test',
          amount: 0,
          expense_date: '2024-01-15',
          is_paid: false
        }

        const result = budgetService.validateExpenseData(invalidData)

        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Amount must be greater than 0')
      })
    })
  })

  describe('Analytics Helpers', () => {
    describe('calculateBudgetUtilization', () => {
      it('should calculate correct utilization percentage', () => {
        expect(budgetService.calculateBudgetUtilization(10000, 7500)).toBe(75)
        expect(budgetService.calculateBudgetUtilization(10000, 10000)).toBe(100)
        expect(budgetService.calculateBudgetUtilization(10000, 0)).toBe(0)
      })

      it('should handle zero budget', () => {
        expect(budgetService.calculateBudgetUtilization(0, 1000)).toBe(0)
      })
    })

    describe('calculateCategoryUtilization', () => {
      it('should calculate utilization with correct status', () => {
        expect(budgetService.calculateCategoryUtilization(1000, 500)).toEqual({
          percentage: 50,
          status: 'good'
        })

        expect(budgetService.calculateCategoryUtilization(1000, 800)).toEqual({
          percentage: 80,
          status: 'warning'
        })

        expect(budgetService.calculateCategoryUtilization(1000, 950)).toEqual({
          percentage: 95,
          status: 'critical'
        })
      })
    })

    describe('getDefaultCategories', () => {
      it('should return wedding categories', () => {
        const categories = budgetService.getDefaultCategories('wedding')
        
        expect(categories).toHaveLength(8)
        expect(categories[0].name).toBe('Venue')
        expect(categories[1].name).toBe('Catering')
      })

      it('should return birthday categories', () => {
        const categories = budgetService.getDefaultCategories('birthday')
        
        expect(categories).toHaveLength(6)
        expect(categories[0].name).toBe('Venue')
        expect(categories[4].name).toBe('Cake')
      })

      it('should return default categories for unknown type', () => {
        const categories = budgetService.getDefaultCategories('unknown')
        
        expect(categories).toHaveLength(5)
        expect(categories[0].name).toBe('Venue')
        expect(categories[1].name).toBe('Food & Beverages')
      })
    })

    describe('formatCurrency', () => {
      it('should format USD currency', () => {
        expect(budgetService.formatCurrency(1234.56)).toBe('$1,234.56')
        expect(budgetService.formatCurrency(0)).toBe('$0.00')
      })

      it('should format different currencies', () => {
        // Note: This test might vary based on locale
        const formatted = budgetService.formatCurrency(1234.56, 'EUR')
        expect(formatted).toContain('1,234.56')
      })
    })
  })
})