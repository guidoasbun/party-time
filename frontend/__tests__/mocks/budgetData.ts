/**
 * Mock data factories for budget testing
 * Phase 8.1: Comprehensive Testing Backfill
 */

import type {
  BudgetSummary,
  BudgetCategory,
  BudgetCategorySummary,
  Expense,
  ExpenseSummary,
  BudgetAnalytics,
  BudgetAlert,
  BudgetDashboardData,
} from '@/types/budget.types'

// Budget category factory
export const createMockBudgetCategory = (
  overrides: Partial<BudgetCategory> = {}
): BudgetCategory => ({
  id: 'category-1',
  event_id: 'event-1',
  name: 'Venue',
  allocated_amount: 10000,
  spent_amount: 7500,
  remaining_amount: 2500,
  expense_count: 3,
  color: '#3b82f6',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-15T00:00:00Z',
  ...overrides,
})

// Budget category summary factory
export const createMockBudgetCategorySummary = (
  overrides: Partial<BudgetCategorySummary> = {}
): BudgetCategorySummary => ({
  id: 'category-1',
  name: 'Venue',
  allocated_amount: 10000,
  spent_amount: 7500,
  color: '#3b82f6',
  ...overrides,
})

// Expense factory
export const createMockExpense = (
  overrides: Partial<Expense> = {}
): Expense => ({
  id: 'expense-1',
  event_id: 'event-1',
  category_id: 'category-1',
  name: 'Venue Deposit',
  description: 'Initial deposit for venue booking',
  amount: 2500,
  expense_date: '2024-02-01',
  vendor_name: 'Grand Ballroom',
  is_paid: true,
  receipt_url: undefined,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-15T00:00:00Z',
  ...overrides,
})

// Expense summary factory
export const createMockExpenseSummary = (
  overrides: Partial<ExpenseSummary> = {}
): ExpenseSummary => ({
  id: 'expense-1',
  name: 'Venue Deposit',
  amount: 2500,
  expense_date: '2024-02-01',
  is_paid: true,
  category_name: 'Venue',
  ...overrides,
})

// Budget summary factory
export const createMockBudgetSummary = (
  overrides: Partial<BudgetSummary> = {}
): BudgetSummary => ({
  total_budget: 25000,
  total_spent: 18500,
  remaining_budget: 6500,
  categories: [
    createMockBudgetCategorySummary({
      id: 'category-1',
      name: 'Venue',
      allocated_amount: 10000,
      spent_amount: 7500,
      color: '#3b82f6',
    }),
    createMockBudgetCategorySummary({
      id: 'category-2',
      name: 'Catering',
      allocated_amount: 8000,
      spent_amount: 6500,
      color: '#10b981',
    }),
    createMockBudgetCategorySummary({
      id: 'category-3',
      name: 'Photography',
      allocated_amount: 4000,
      spent_amount: 3000,
      color: '#8b5cf6',
    }),
    createMockBudgetCategorySummary({
      id: 'category-4',
      name: 'Decorations',
      allocated_amount: 3000,
      spent_amount: 1500,
      color: '#f59e0b',
    }),
  ],
  recent_expenses: [
    createMockExpenseSummary({
      id: 'expense-1',
      name: 'Venue Final Payment',
      amount: 5000,
      expense_date: '2024-03-15',
      is_paid: true,
      category_name: 'Venue',
    }),
    createMockExpenseSummary({
      id: 'expense-2',
      name: 'Catering Deposit',
      amount: 3000,
      expense_date: '2024-03-10',
      is_paid: true,
      category_name: 'Catering',
    }),
    createMockExpenseSummary({
      id: 'expense-3',
      name: 'Photographer Booking',
      amount: 1500,
      expense_date: '2024-03-05',
      is_paid: false,
      category_name: 'Photography',
    }),
  ],
  ...overrides,
})

// Budget analytics factory
export const createMockBudgetAnalytics = (
  overrides: Partial<BudgetAnalytics> = {}
): BudgetAnalytics => ({
  budget_utilization: {
    percentage: 74,
    status: 'on_track',
  },
  category_breakdown: [
    {
      category_id: 'category-1',
      category_name: 'Venue',
      allocated: 10000,
      spent: 7500,
      remaining: 2500,
      utilization_percentage: 75,
      expense_count: 3,
    },
    {
      category_id: 'category-2',
      category_name: 'Catering',
      allocated: 8000,
      spent: 6500,
      remaining: 1500,
      utilization_percentage: 81.25,
      expense_count: 5,
    },
  ],
  spending_trends: [
    { date: '2024-01-01', daily_spent: 2500, cumulative_spent: 2500 },
    { date: '2024-02-01', daily_spent: 3000, cumulative_spent: 5500 },
    { date: '2024-03-01', daily_spent: 5000, cumulative_spent: 10500 },
    { date: '2024-03-15', daily_spent: 8000, cumulative_spent: 18500 },
  ],
  expense_distribution: {
    by_category: {
      Venue: 7500,
      Catering: 6500,
      Photography: 3000,
      Decorations: 1500,
    },
    by_vendor: {
      'Grand Ballroom': 7500,
      'Delicious Catering': 6500,
      'Pro Photography': 3000,
      'Party Decor': 1500,
    },
    by_payment_status: {
      paid: 15000,
      unpaid: 3500,
    },
  },
  forecasting: {
    projected_total: 24000,
    budget_risk_level: 'low',
    recommendations: [
      'Consider booking decorations vendor soon to lock in pricing',
      'Photography payment due in 2 weeks',
    ],
  },
  ...overrides,
})

// Budget alert factory
export const createMockBudgetAlert = (
  overrides: Partial<BudgetAlert> = {}
): BudgetAlert => ({
  id: 'alert-1',
  event_id: 'event-1',
  category_id: 'category-2',
  alert_type: 'approaching_limit',
  threshold_percentage: 80,
  message: 'Catering budget is at 81% utilization',
  is_active: true,
  triggered_at: '2024-03-10T12:00:00Z',
  resolved_at: undefined,
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

// Budget dashboard data factory
export const createMockBudgetDashboardData = (
  overrides: Partial<BudgetDashboardData> = {}
): BudgetDashboardData => ({
  summary: createMockBudgetSummary(),
  analytics: createMockBudgetAnalytics(),
  recent_expenses: [
    createMockExpenseSummary({ id: 'expense-1' }),
    createMockExpenseSummary({ id: 'expense-2', name: 'Catering Deposit', amount: 3000 }),
  ],
  upcoming_payments: [
    {
      id: 'payment-1',
      expense_id: 'expense-3',
      due_date: '2024-04-01',
      amount: 1500,
      description: 'Photography final payment',
      is_paid: false,
      paid_at: undefined,
      payment_id: undefined,
      created_at: '2024-03-01T00:00:00Z',
    },
  ],
  active_alerts: [createMockBudgetAlert()],
  category_progress: [
    {
      category: createMockBudgetCategorySummary({ id: 'category-1', name: 'Venue' }),
      progress_percentage: 75,
      status: 'good',
    },
    {
      category: createMockBudgetCategorySummary({ id: 'category-2', name: 'Catering' }),
      progress_percentage: 81,
      status: 'warning',
    },
  ],
  ...overrides,
})

// Mock collections
export const mockBudgetCategories: BudgetCategory[] = [
  createMockBudgetCategory({
    id: 'category-1',
    name: 'Venue',
    allocated_amount: 10000,
    spent_amount: 7500,
    color: '#3b82f6',
  }),
  createMockBudgetCategory({
    id: 'category-2',
    name: 'Catering',
    allocated_amount: 8000,
    spent_amount: 6500,
    color: '#10b981',
  }),
  createMockBudgetCategory({
    id: 'category-3',
    name: 'Photography',
    allocated_amount: 4000,
    spent_amount: 3000,
    color: '#8b5cf6',
  }),
  createMockBudgetCategory({
    id: 'category-4',
    name: 'Decorations',
    allocated_amount: 3000,
    spent_amount: 1500,
    color: '#f59e0b',
  }),
]

export const mockExpenses: Expense[] = [
  createMockExpense({
    id: 'expense-1',
    name: 'Venue Deposit',
    amount: 2500,
    is_paid: true,
    category_id: 'category-1',
  }),
  createMockExpense({
    id: 'expense-2',
    name: 'Venue Final Payment',
    amount: 5000,
    is_paid: true,
    category_id: 'category-1',
  }),
  createMockExpense({
    id: 'expense-3',
    name: 'Catering Deposit',
    amount: 3000,
    is_paid: true,
    category_id: 'category-2',
  }),
  createMockExpense({
    id: 'expense-4',
    name: 'Catering Service Fee',
    amount: 3500,
    is_paid: false,
    category_id: 'category-2',
  }),
  createMockExpense({
    id: 'expense-5',
    name: 'Photographer Booking',
    amount: 3000,
    is_paid: false,
    category_id: 'category-3',
  }),
]

// Helper for over-budget scenario
export const createOverBudgetCategory = (): BudgetCategory =>
  createMockBudgetCategory({
    id: 'over-budget-category',
    name: 'Entertainment',
    allocated_amount: 2000,
    spent_amount: 2500,
    remaining_amount: -500,
    expense_count: 4,
    color: '#ef4444',
  })

// Helper for empty budget
export const createEmptyBudgetSummary = (): BudgetSummary => ({
  total_budget: 0,
  total_spent: 0,
  remaining_budget: 0,
  categories: [],
  recent_expenses: [],
})
