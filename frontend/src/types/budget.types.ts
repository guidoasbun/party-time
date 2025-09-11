/**
 * Budget and expense model types
 */

import { UUID, Timestamps, ListQueryParams } from './common.types'

// Budget category types
export interface BudgetCategoryBase {
  name: string
  allocated_amount: number
  color?: string // Hex color code
}

export interface BudgetCategoryCreate extends BudgetCategoryBase {
  event_id: UUID
}

export interface BudgetCategoryUpdate {
  name?: string
  allocated_amount?: number
  color?: string
}

export interface BudgetCategory extends BudgetCategoryBase, Timestamps {
  id: UUID
  event_id: UUID
  
  // Calculated fields
  spent_amount: number
  remaining_amount: number
  expense_count: number
}

export interface BudgetCategorySummary {
  id: UUID
  name: string
  allocated_amount: number
  spent_amount: number
  color?: string
}

// Expense types
export interface ExpenseBase {
  name: string
  description?: string
  amount: number
  expense_date: string // ISO date string
  vendor_name?: string
  is_paid: boolean
  receipt_url?: string
}

export interface ExpenseCreate extends ExpenseBase {
  category_id?: UUID
}

export interface ExpenseUpdate {
  name?: string
  description?: string
  amount?: number
  expense_date?: string
  vendor_name?: string
  is_paid?: boolean
  receipt_url?: string
  category_id?: UUID
}

export interface Expense extends ExpenseBase, Timestamps {
  id: UUID
  event_id: UUID
  category_id?: UUID
}

export interface ExpenseSummary {
  id: UUID
  name: string
  amount: number
  expense_date: string
  is_paid: boolean
  category_name?: string
}

// Budget summary and analytics
export interface BudgetSummary {
  total_budget: number
  total_spent: number
  remaining_budget: number
  categories: BudgetCategorySummary[]
  recent_expenses: ExpenseSummary[]
}

export interface BudgetAnalytics {
  budget_utilization: {
    percentage: number
    status: 'under' | 'on_track' | 'over' | 'warning'
  }
  category_breakdown: Array<{
    category_id: UUID
    category_name: string
    allocated: number
    spent: number
    remaining: number
    utilization_percentage: number
    expense_count: number
  }>
  spending_trends: Array<{
    date: string
    daily_spent: number
    cumulative_spent: number
  }>
  expense_distribution: {
    by_category: Record<string, number>
    by_vendor: Record<string, number>
    by_payment_status: {
      paid: number
      unpaid: number
    }
  }
  forecasting: {
    projected_total: number
    budget_risk_level: 'low' | 'medium' | 'high'
    recommendations: string[]
  }
}

// Budget templates and presets
export interface BudgetTemplate {
  id: UUID
  name: string
  description?: string
  event_type: string
  categories: Array<{
    name: string
    percentage: number // percentage of total budget
    color?: string
  }>
  is_public: boolean
  created_by: UUID
  usage_count: number
  created_at: string
}

export interface BudgetPreset {
  event_type: string
  suggested_categories: Array<{
    name: string
    typical_percentage: number
    min_percentage: number
    max_percentage: number
    description: string
    priority: 'essential' | 'important' | 'optional'
  }>
}

// Budget tracking and alerts
export interface BudgetAlert {
  id: UUID
  event_id: UUID
  category_id?: UUID
  alert_type: 'overspend' | 'approaching_limit' | 'payment_due' | 'budget_exceeded'
  threshold_percentage: number
  message: string
  is_active: boolean
  triggered_at?: string
  resolved_at?: string
  created_at: string
}

export interface BudgetNotification {
  id: UUID
  user_id: UUID
  event_id: UUID
  type: 'budget_warning' | 'payment_reminder' | 'expense_approved' | 'category_overspend'
  title: string
  message: string
  read: boolean
  action_url?: string
  created_at: string
}

// Vendor and payment tracking
export interface Vendor {
  id: UUID
  name: string
  contact_person?: string
  email?: string
  phone?: string
  address?: string
  website?: string
  category: string
  rating?: number
  notes?: string
  preferred: boolean
  created_at: string
}

export interface Payment {
  id: UUID
  expense_id: UUID
  amount: number
  payment_date: string
  payment_method: 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'check' | 'other'
  transaction_id?: string
  notes?: string
  receipt_url?: string
  created_at: string
}

export interface PaymentSchedule {
  id: UUID
  expense_id: UUID
  due_date: string
  amount: number
  description?: string
  is_paid: boolean
  paid_at?: string
  payment_id?: UUID
  created_at: string
}

// Budget search and filtering
export interface ExpenseSearchParams extends ListQueryParams {
  category_id?: UUID
  vendor_name?: string
  is_paid?: boolean
  amount_min?: number
  amount_max?: number
  date_from?: string
  date_to?: string
  has_receipt?: boolean
  [key: string]: unknown
}

export interface BudgetFilters {
  categories: UUID[]
  vendors: string[]
  payment_status: ('paid' | 'unpaid')[]
  amount_range: {
    min?: number
    max?: number
  }
  date_range: {
    start?: string
    end?: string
  }
  has_receipt: 'all' | 'yes' | 'no'
}

// Forms and UI types
export interface BudgetCategoryFormData extends BudgetCategoryBase {
  initial_expenses?: Array<Omit<ExpenseCreate, 'category_id'>>
}

export interface ExpenseFormData extends ExpenseBase {
  category_id?: UUID
  receipt_file?: File
  payment_schedule?: Array<{
    due_date: string
    amount: number
    description?: string
  }>
}

export interface BudgetSetupFormData {
  total_budget: number
  categories: Array<{
    name: string
    allocated_amount: number
    color?: string
  }>
  use_template?: UUID
  auto_create_alerts: boolean
  alert_thresholds: {
    warning_percentage: number
    critical_percentage: number
  }
}

// Budget import/export
export interface BudgetImportData {
  file: File
  format: 'csv' | 'excel'
  mapping: {
    expense_name: string
    amount: string
    category: string
    date: string
    vendor?: string
    description?: string
    is_paid?: string
  }
  create_missing_categories: boolean
}

export interface BudgetExportOptions {
  format: 'csv' | 'excel' | 'pdf'
  include_categories: boolean
  include_expenses: boolean
  include_summary: boolean
  include_analytics: boolean
  date_range?: {
    start: string
    end: string
  }
  category_filter?: UUID[]
}

// Budget collaboration
export interface BudgetApproval {
  id: UUID
  expense_id: UUID
  requested_by: UUID
  approved_by?: UUID
  status: 'pending' | 'approved' | 'rejected'
  notes?: string
  requested_at: string
  responded_at?: string
}

export interface BudgetPermissions {
  can_view_budget: boolean
  can_edit_budget: boolean
  can_add_expenses: boolean
  can_approve_expenses: boolean
  can_delete_expenses: boolean
  can_manage_categories: boolean
  can_view_analytics: boolean
  spending_limit?: number
  requires_approval_above?: number
}

// Budget dashboard and widgets
export interface BudgetDashboardData {
  summary: BudgetSummary
  analytics: BudgetAnalytics
  recent_expenses: ExpenseSummary[]
  upcoming_payments: PaymentSchedule[]
  active_alerts: BudgetAlert[]
  category_progress: Array<{
    category: BudgetCategorySummary
    progress_percentage: number
    status: 'good' | 'warning' | 'critical'
  }>
}

export interface BudgetWidget {
  id: string
  type: 'summary' | 'category_breakdown' | 'spending_trend' | 'recent_expenses' | 'alerts'
  title: string
  size: 'small' | 'medium' | 'large'
  position: {
    x: number
    y: number
    width: number
    height: number
  }
  settings: Record<string, unknown>
  visible: boolean
}

// Budget comparison and benchmarking
export interface BudgetComparison {
  current_event: BudgetSummary
  comparison_events: Array<{
    event_id: UUID
    event_name: string
    budget_summary: BudgetSummary
  }>
  industry_benchmarks?: {
    average_budget: number
    category_averages: Record<string, number>
    cost_per_guest_average: number
  }
}

export interface BudgetInsight {
  type: 'overspend_warning' | 'cost_saving_opportunity' | 'budget_optimization' | 'vendor_recommendation'
  title: string
  description: string
  impact: 'low' | 'medium' | 'high'
  action_required: boolean
  suggested_actions: string[]
  potential_savings?: number
  created_at: string
}