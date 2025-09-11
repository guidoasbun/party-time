/**
 * Budget and expenses service module
 */

import { api, withRetry } from '@/lib/api-client'
import { 
  BudgetCategory,
  BudgetCategoryCreate,
  BudgetCategoryUpdate,
  Expense,
  ExpenseCreate,
  ExpenseUpdate,
  ExpenseSummary,
  BudgetSummary,
  BudgetAnalytics,
  ExpenseSearchParams,
  PaginatedResponse,
  UUID,
  API_ENDPOINTS
} from '@/types'

/**
 * Budget service class with typed methods
 */
export class BudgetService {
  // Budget Categories

  /**
   * Get all budget categories for an event
   */
  async getBudgetCategories(eventId: UUID): Promise<BudgetCategory[]> {
    return api.get<BudgetCategory[]>(
      API_ENDPOINTS.BUDGET.CATEGORIES(eventId),
      undefined,
      withRetry({ attempts: 2 })
    )
  }

  /**
   * Get a single budget category
   */
  async getBudgetCategory(eventId: UUID, categoryId: UUID): Promise<BudgetCategory> {
    return api.get<BudgetCategory>(
      API_ENDPOINTS.BUDGET.GET_CATEGORY(eventId, categoryId),
      undefined,
      withRetry({ attempts: 2 })
    )
  }

  /**
   * Create a new budget category
   */
  async createBudgetCategory(eventId: UUID, data: BudgetCategoryCreate): Promise<BudgetCategory> {
    return api.post<BudgetCategory, BudgetCategoryCreate>(
      API_ENDPOINTS.BUDGET.CREATE_CATEGORY(eventId),
      data
    )
  }

  /**
   * Update a budget category
   */
  async updateBudgetCategory(
    eventId: UUID, 
    categoryId: UUID, 
    data: BudgetCategoryUpdate
  ): Promise<BudgetCategory> {
    return api.patch<BudgetCategory, BudgetCategoryUpdate>(
      API_ENDPOINTS.BUDGET.UPDATE_CATEGORY(eventId, categoryId),
      data
    )
  }

  /**
   * Delete a budget category
   */
  async deleteBudgetCategory(eventId: UUID, categoryId: UUID): Promise<{ message: string }> {
    return api.delete<{ message: string }>(
      API_ENDPOINTS.BUDGET.DELETE_CATEGORY(eventId, categoryId)
    )
  }

  // Expenses

  /**
   * Get all expenses for an event
   */
  async getExpenses(eventId: UUID, params?: ExpenseSearchParams): Promise<PaginatedResponse<Expense>> {
    return api.get<PaginatedResponse<Expense>>(
      API_ENDPOINTS.BUDGET.EXPENSES(eventId),
      params,
      withRetry({ attempts: 2 })
    )
  }

  /**
   * Get a single expense
   */
  async getExpense(eventId: UUID, expenseId: UUID): Promise<Expense> {
    return api.get<Expense>(
      API_ENDPOINTS.BUDGET.GET_EXPENSE(eventId, expenseId),
      undefined,
      withRetry({ attempts: 2 })
    )
  }

  /**
   * Create a new expense
   */
  async createExpense(eventId: UUID, data: ExpenseCreate): Promise<Expense> {
    return api.post<Expense, ExpenseCreate>(
      API_ENDPOINTS.BUDGET.CREATE_EXPENSE(eventId),
      data
    )
  }

  /**
   * Update an expense
   */
  async updateExpense(eventId: UUID, expenseId: UUID, data: ExpenseUpdate): Promise<Expense> {
    return api.patch<Expense, ExpenseUpdate>(
      API_ENDPOINTS.BUDGET.UPDATE_EXPENSE(eventId, expenseId),
      data
    )
  }

  /**
   * Delete an expense
   */
  async deleteExpense(eventId: UUID, expenseId: UUID): Promise<{ message: string }> {
    return api.delete<{ message: string }>(
      API_ENDPOINTS.BUDGET.DELETE_EXPENSE(eventId, expenseId)
    )
  }

  /**
   * Mark expense as paid
   */
  async markExpenseAsPaid(eventId: UUID, expenseId: UUID): Promise<Expense> {
    return api.patch<Expense, { is_paid: boolean }>(
      API_ENDPOINTS.BUDGET.UPDATE_EXPENSE(eventId, expenseId),
      { is_paid: true }
    )
  }

  /**
   * Mark expense as unpaid
   */
  async markExpenseAsUnpaid(eventId: UUID, expenseId: UUID): Promise<Expense> {
    return api.patch<Expense, { is_paid: boolean }>(
      API_ENDPOINTS.BUDGET.UPDATE_EXPENSE(eventId, expenseId),
      { is_paid: false }
    )
  }

  // Budget Summary and Analytics

  /**
   * Get budget summary for an event
   */
  async getBudgetSummary(eventId: UUID): Promise<BudgetSummary> {
    return api.get<BudgetSummary>(
      API_ENDPOINTS.BUDGET.SUMMARY(eventId),
      undefined,
      withRetry({ attempts: 2 })
    )
  }

  /**
   * Get budget analytics for an event
   */
  async getBudgetAnalytics(eventId: UUID): Promise<BudgetAnalytics> {
    return api.get<BudgetAnalytics>(
      `${API_ENDPOINTS.BUDGET.SUMMARY(eventId)}/analytics`,
      undefined,
      withRetry({ attempts: 2 })
    )
  }

  // Bulk Operations

  /**
   * Bulk create budget categories
   */
  async bulkCreateCategories(
    eventId: UUID, 
    categories: BudgetCategoryCreate[]
  ): Promise<{
    created_count: number
    errors: Array<{ index: number; error: string }>
    categories: BudgetCategory[]
  }> {
    return api.post<{
      created_count: number
      errors: Array<{ index: number; error: string }>
      categories: BudgetCategory[]
    }, { categories: BudgetCategoryCreate[] }>(
      `${API_ENDPOINTS.BUDGET.CATEGORIES(eventId)}/bulk`,
      { categories }
    )
  }

  /**
   * Bulk create expenses
   */
  async bulkCreateExpenses(
    eventId: UUID, 
    expenses: ExpenseCreate[]
  ): Promise<{
    created_count: number
    errors: Array<{ index: number; error: string }>
    expenses: Expense[]
  }> {
    return api.post<{
      created_count: number
      errors: Array<{ index: number; error: string }>
      expenses: Expense[]
    }, { expenses: ExpenseCreate[] }>(
      `${API_ENDPOINTS.BUDGET.EXPENSES(eventId)}/bulk`,
      { expenses }
    )
  }

  /**
   * Bulk update expenses
   */
  async bulkUpdateExpenses(
    eventId: UUID,
    updates: Array<{ expense_id: UUID; data: ExpenseUpdate }>
  ): Promise<{
    updated_count: number
    errors: Array<{ expense_id: UUID; error: string }>
  }> {
    return api.patch<{
      updated_count: number
      errors: Array<{ expense_id: UUID; error: string }>
    }, { updates: Array<{ expense_id: UUID; data: ExpenseUpdate }> }>(
      `${API_ENDPOINTS.BUDGET.EXPENSES(eventId)}/bulk`,
      { updates }
    )
  }

  /**
   * Bulk delete expenses
   */
  async bulkDeleteExpenses(eventId: UUID, expenseIds: UUID[]): Promise<{
    deleted_count: number
    errors: Array<{ expense_id: UUID; error: string }>
  }> {
    return api.post<{
      deleted_count: number
      errors: Array<{ expense_id: UUID; error: string }>
    }, { expense_ids: UUID[] }>(
      `${API_ENDPOINTS.BUDGET.EXPENSES(eventId)}/bulk-delete`,
      { expense_ids: expenseIds }
    )
  }

  // Import/Export

  /**
   * Import budget data from file
   */
  async importBudgetData(
    eventId: UUID,
    file: File,
    options: {
      mapping: Record<string, string>
      create_missing_categories: boolean
    },
    onProgress?: (progress: number) => void
  ): Promise<{
    categories_created: number
    expenses_created: number
    errors: Array<{ row: number; error: string }>
  }> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('mapping', JSON.stringify(options.mapping))
    formData.append('create_missing_categories', options.create_missing_categories.toString())

    return api.upload<{
      categories_created: number
      expenses_created: number
      errors: Array<{ row: number; error: string }>
    }>(
      `${API_ENDPOINTS.BUDGET.SUMMARY(eventId)}/import`,
      file,
      onProgress
    )
  }

  /**
   * Export budget data
   */
  async exportBudgetData(
    eventId: UUID,
    format: 'csv' | 'excel' | 'pdf',
    options?: {
      include_categories?: boolean
      include_expenses?: boolean
      include_summary?: boolean
      date_range?: { start: string; end: string }
      category_filter?: UUID[]
    }
  ): Promise<void> {
    const _params = {
      format,
      ...options
    }

    return api.download(
      `${API_ENDPOINTS.BUDGET.SUMMARY(eventId)}/export`,
      `budget-${eventId}.${format}`,
      {
        requestId: `export-budget-${eventId}-${format}`
      }
    )
  }

  // Utility Methods

  /**
   * Search expenses
   */
  async searchExpenses(eventId: UUID, query: string): Promise<Expense[]> {
    const response = await api.get<PaginatedResponse<Expense>>(
      API_ENDPOINTS.BUDGET.EXPENSES(eventId),
      { search: query },
      withRetry({ attempts: 2 })
    )
    return response.items
  }

  /**
   * Get expenses by category
   */
  async getExpensesByCategory(eventId: UUID, categoryId: UUID): Promise<Expense[]> {
    const response = await api.get<PaginatedResponse<Expense>>(
      API_ENDPOINTS.BUDGET.EXPENSES(eventId),
      { category_id: categoryId },
      withRetry({ attempts: 2 })
    )
    return response.items
  }

  /**
   * Get unpaid expenses
   */
  async getUnpaidExpenses(eventId: UUID): Promise<Expense[]> {
    const response = await api.get<PaginatedResponse<Expense>>(
      API_ENDPOINTS.BUDGET.EXPENSES(eventId),
      { is_paid: false },
      withRetry({ attempts: 2 })
    )
    return response.items
  }

  /**
   * Get recent expenses
   */
  async getRecentExpenses(eventId: UUID, limit: number = 10): Promise<ExpenseSummary[]> {
    const response = await api.get<PaginatedResponse<Expense>>(
      API_ENDPOINTS.BUDGET.EXPENSES(eventId),
      { 
        sort_by: 'expense_date',
        sort_order: 'desc',
        limit 
      },
      withRetry({ attempts: 2 })
    )
    return response.items.map(expense => ({
      id: expense.id,
      name: expense.name,
      amount: expense.amount,
      expense_date: expense.expense_date,
      is_paid: expense.is_paid,
      category_name: undefined // Would need to be populated separately
    }))
  }

  // Validation

  /**
   * Validate budget category data
   */
  validateCategoryData(data: BudgetCategoryCreate | BudgetCategoryUpdate): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    // Name validation
    if ('name' in data && data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        errors.push('Category name is required')
      } else if (data.name.length > 100) {
        errors.push('Category name must be 100 characters or less')
      }
    }

    // Amount validation
    if ('allocated_amount' in data && data.allocated_amount !== undefined) {
      if (data.allocated_amount < 0) {
        errors.push('Allocated amount cannot be negative')
      }
    }

    // Color validation
    if ('color' in data && data.color !== undefined && data.color) {
      const colorRegex = /^#[0-9A-Fa-f]{6}$/
      if (!colorRegex.test(data.color)) {
        errors.push('Color must be a valid hex color code (e.g., #FF0000)')
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate expense data
   */
  validateExpenseData(data: ExpenseCreate | ExpenseUpdate): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    // Name validation
    if ('name' in data && data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        errors.push('Expense name is required')
      } else if (data.name.length > 255) {
        errors.push('Expense name must be 255 characters or less')
      }
    }

    // Amount validation
    if ('amount' in data && data.amount !== undefined) {
      if (data.amount <= 0) {
        errors.push('Amount must be greater than 0')
      }
    }

    // Date validation
    if ('expense_date' in data && data.expense_date !== undefined) {
      const expenseDate = new Date(data.expense_date)
      if (isNaN(expenseDate.getTime())) {
        errors.push('Invalid expense date')
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Analytics Helpers

  /**
   * Calculate budget utilization percentage
   */
  calculateBudgetUtilization(totalBudget: number, totalSpent: number): number {
    if (totalBudget <= 0) return 0
    return Math.round((totalSpent / totalBudget) * 100)
  }

  /**
   * Calculate category utilization
   */
  calculateCategoryUtilization(allocated: number, spent: number): {
    percentage: number
    status: 'good' | 'warning' | 'critical'
  } {
    const percentage = allocated > 0 ? Math.round((spent / allocated) * 100) : 0
    
    let status: 'good' | 'warning' | 'critical'
    if (percentage <= 75) {
      status = 'good'
    } else if (percentage <= 90) {
      status = 'warning'
    } else {
      status = 'critical'
    }

    return { percentage, status }
  }

  /**
   * Generate default budget categories for event type
   */
  getDefaultCategories(eventType: string): Omit<BudgetCategoryCreate, 'event_id'>[] {
    const categoryTemplates: Record<string, Omit<BudgetCategoryCreate, 'event_id'>[]> = {
      wedding: [
        { name: 'Venue', allocated_amount: 5000, color: '#3B82F6' },
        { name: 'Catering', allocated_amount: 3000, color: '#EF4444' },
        { name: 'Photography', allocated_amount: 1500, color: '#10B981' },
        { name: 'Flowers', allocated_amount: 800, color: '#F59E0B' },
        { name: 'Music/DJ', allocated_amount: 1000, color: '#8B5CF6' },
        { name: 'Attire', allocated_amount: 1200, color: '#EC4899' },
        { name: 'Transportation', allocated_amount: 500, color: '#06B6D4' },
        { name: 'Miscellaneous', allocated_amount: 500, color: '#6B7280' }
      ],
      birthday: [
        { name: 'Venue', allocated_amount: 500, color: '#3B82F6' },
        { name: 'Food & Drinks', allocated_amount: 300, color: '#EF4444' },
        { name: 'Decorations', allocated_amount: 200, color: '#10B981' },
        { name: 'Entertainment', allocated_amount: 250, color: '#F59E0B' },
        { name: 'Cake', allocated_amount: 100, color: '#8B5CF6' },
        { name: 'Miscellaneous', allocated_amount: 150, color: '#6B7280' }
      ],
      corporate: [
        { name: 'Venue', allocated_amount: 2000, color: '#3B82F6' },
        { name: 'Catering', allocated_amount: 1500, color: '#EF4444' },
        { name: 'A/V Equipment', allocated_amount: 800, color: '#10B981' },
        { name: 'Materials', allocated_amount: 400, color: '#F59E0B' },
        { name: 'Speakers', allocated_amount: 1000, color: '#8B5CF6' },
        { name: 'Marketing', allocated_amount: 600, color: '#EC4899' },
        { name: 'Miscellaneous', allocated_amount: 300, color: '#6B7280' }
      ]
    }

    return categoryTemplates[eventType] || [
      { name: 'Venue', allocated_amount: 1000, color: '#3B82F6' },
      { name: 'Food & Beverages', allocated_amount: 800, color: '#EF4444' },
      { name: 'Entertainment', allocated_amount: 500, color: '#10B981' },
      { name: 'Decorations', allocated_amount: 300, color: '#F59E0B' },
      { name: 'Miscellaneous', allocated_amount: 200, color: '#6B7280' }
    ]
  }

  /**
   * Get budget status color
   */
  getBudgetStatusColor(utilization: number): string {
    if (utilization <= 75) return '#10B981'  // green
    if (utilization <= 90) return '#F59E0B'  // amber
    return '#EF4444'  // red
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }
}

// Create singleton instance
export const budgetService = new BudgetService()

// Export default instance
export default budgetService