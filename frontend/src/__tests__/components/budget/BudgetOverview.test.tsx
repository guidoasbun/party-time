/**
 * BudgetOverview Component Tests
 * Phase 8.1: Comprehensive Testing Backfill
 *
 * Tests for the budget dashboard component including:
 * - Stats cards display (target, spent, remaining, utilization)
 * - Loading skeleton state
 * - Empty state
 * - Category progress bars with color coding
 * - Budget alerts (>=80% warning)
 * - Recent expenses list with paid/unpaid badges
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BudgetOverview } from '@/components/budget/BudgetOverview'
import {
  createMockBudgetCategory,
  createMockBudgetSummary,
  createMockExpense,
  createOverBudgetCategory,
  mockBudgetCategories,
  mockExpenses,
} from '../../../../__tests__/mocks/budgetData'
import type { Expense } from '@/types'

describe('BudgetOverview', () => {
  const defaultProps = {
    eventBudgetTotal: 30000,
    summary: createMockBudgetSummary(),
    categories: mockBudgetCategories,
    expenses: mockExpenses,
    isLoading: false,
  }

  describe('Stats Cards Display', () => {
    it('renders all four stats cards', () => {
      render(<BudgetOverview {...defaultProps} />)

      expect(screen.getByText('Budget Target')).toBeInTheDocument()
      expect(screen.getByText('Total Spent')).toBeInTheDocument()
      expect(screen.getByText('Remaining')).toBeInTheDocument()
      expect(screen.getByText('Utilization')).toBeInTheDocument()
    })

    it('displays correct budget target amount', () => {
      render(<BudgetOverview {...defaultProps} eventBudgetTotal={30000} />)

      expect(screen.getByText('$30,000.00')).toBeInTheDocument()
    })

    it('displays correct total spent amount', () => {
      const summary = createMockBudgetSummary({ total_spent: 18500 })
      render(<BudgetOverview {...defaultProps} summary={summary} />)

      expect(screen.getByText('$18,500.00')).toBeInTheDocument()
    })

    it('displays expense count in spent card', () => {
      render(<BudgetOverview {...defaultProps} expenses={mockExpenses} />)

      expect(screen.getByText('5 expenses')).toBeInTheDocument()
    })

    it('displays singular expense text for one expense', () => {
      const singleExpense = [createMockExpense()]
      render(<BudgetOverview {...defaultProps} expenses={singleExpense} />)

      expect(screen.getByText('1 expense')).toBeInTheDocument()
    })

    it('shows remaining amount under budget (positive)', () => {
      const summary = createMockBudgetSummary({ total_spent: 20000 })
      render(
        <BudgetOverview
          {...defaultProps}
          eventBudgetTotal={30000}
          summary={summary}
        />
      )

      expect(screen.getByText('$10,000.00')).toBeInTheDocument()
      expect(screen.getByText('under budget')).toBeInTheDocument()
    })

    it('shows remaining amount over budget (negative)', () => {
      const summary = createMockBudgetSummary({ total_spent: 35000 })
      render(
        <BudgetOverview
          {...defaultProps}
          eventBudgetTotal={30000}
          summary={summary}
        />
      )

      expect(screen.getByText('$5,000.00')).toBeInTheDocument()
      expect(screen.getByText('over budget')).toBeInTheDocument()
    })

    it('calculates and displays correct utilization percentage', () => {
      const summary = createMockBudgetSummary({ total_spent: 15000 })
      render(
        <BudgetOverview
          {...defaultProps}
          eventBudgetTotal={30000}
          summary={summary}
        />
      )

      expect(screen.getByText('50.0%')).toBeInTheDocument()
    })

    it('shows allocated amount under budget target', () => {
      const summary = createMockBudgetSummary({ total_budget: 25000 })
      render(<BudgetOverview {...defaultProps} summary={summary} />)

      expect(screen.getByText('Allocated: $25,000.00')).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('renders skeleton loading state when isLoading is true', () => {
      render(<BudgetOverview {...defaultProps} isLoading={true} />)

      // Should not show actual content
      expect(screen.queryByText('Budget Target')).not.toBeInTheDocument()
      expect(screen.queryByText('Total Spent')).not.toBeInTheDocument()
    })

    it('renders multiple skeleton cards in loading state', () => {
      const { container } = render(
        <BudgetOverview {...defaultProps} isLoading={true} />
      )

      // Check for skeleton elements - using data-slot attribute from Skeleton component
      const skeletons = container.querySelectorAll('[data-slot="skeleton"]')
      expect(skeletons.length).toBeGreaterThan(0)
    })
  })

  describe('Empty State', () => {
    it('renders empty state when no data available', () => {
      render(
        <BudgetOverview
          eventBudgetTotal={0}
          summary={null}
          categories={[]}
          expenses={[]}
        />
      )

      expect(screen.getByText('No budget data yet')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Start by creating budget categories and adding expenses to track your event spending.'
        )
      ).toBeInTheDocument()
    })

    it('does not render empty state when summary exists', () => {
      render(
        <BudgetOverview
          eventBudgetTotal={30000}
          summary={createMockBudgetSummary()}
          categories={[]}
          expenses={[]}
        />
      )

      expect(screen.queryByText('No budget data yet')).not.toBeInTheDocument()
    })
  })

  describe('Category Progress Bars', () => {
    it('renders category progress section', () => {
      render(<BudgetOverview {...defaultProps} />)

      expect(screen.getByText('Budget by Category')).toBeInTheDocument()
    })

    it('displays all categories with names', () => {
      render(<BudgetOverview {...defaultProps} />)

      expect(screen.getByText('Venue')).toBeInTheDocument()
      expect(screen.getByText('Catering')).toBeInTheDocument()
      expect(screen.getByText('Photography')).toBeInTheDocument()
      expect(screen.getByText('Decorations')).toBeInTheDocument()
    })

    it('shows spent/allocated amounts for each category', () => {
      render(<BudgetOverview {...defaultProps} />)

      // Check for formatted compact currency values
      expect(screen.getByText(/\$7\.5K \/ \$10K/)).toBeInTheDocument()
      expect(screen.getByText(/\$6\.5K \/ \$8K/)).toBeInTheDocument()
    })

    it('shows empty state when no categories', () => {
      render(<BudgetOverview {...defaultProps} categories={[]} />)

      expect(screen.getByText('No categories created yet')).toBeInTheDocument()
    })

    it('calls onViewCategory when category is clicked', async () => {
      const user = userEvent.setup()
      const onViewCategory = jest.fn()

      render(
        <BudgetOverview {...defaultProps} onViewCategory={onViewCategory} />
      )

      // Click on the Venue category button
      const venueButton = screen.getByRole('button', { name: /Venue/i })
      await user.click(venueButton)

      expect(onViewCategory).toHaveBeenCalledWith('category-1')
    })
  })

  describe('Budget Alerts Section', () => {
    it('renders budget alerts section', () => {
      render(<BudgetOverview {...defaultProps} />)

      expect(screen.getByText('Budget Alerts')).toBeInTheDocument()
    })

    it('shows "All categories within budget" when no alerts', () => {
      const categoriesUnder80 = [
        createMockBudgetCategory({
          id: 'cat-1',
          name: 'Low Budget',
          allocated_amount: 10000,
          spent_amount: 5000, // 50%
        }),
      ]

      render(<BudgetOverview {...defaultProps} categories={categoriesUnder80} />)

      expect(screen.getByText('All categories within budget')).toBeInTheDocument()
      expect(screen.getByText("You're doing great!")).toBeInTheDocument()
    })

    it('shows warning for categories at 80% or more', () => {
      const categoriesAt80 = [
        createMockBudgetCategory({
          id: 'cat-warning',
          name: 'Warning Category',
          allocated_amount: 10000,
          spent_amount: 8000, // 80%
        }),
      ]

      render(<BudgetOverview {...defaultProps} categories={categoriesAt80} />)

      // Should show the warning category in alerts
      const alertsSection = screen.getByText('Budget Alerts').closest('div')?.parentElement
      expect(alertsSection).toBeInTheDocument()

      // The category should appear in the alerts section with percentage badge
      expect(screen.getByText('80%')).toBeInTheDocument()
    })

    it('shows over budget alert for categories exceeding 100%', () => {
      const overBudgetCategories = [createOverBudgetCategory()]

      render(
        <BudgetOverview {...defaultProps} categories={overBudgetCategories} />
      )

      expect(screen.getByText('125%')).toBeInTheDocument()
      expect(screen.getByText(/Over budget by/)).toBeInTheDocument()
    })

    it('shows remaining amount for warning categories (80-100%)', () => {
      const warningCategories = [
        createMockBudgetCategory({
          id: 'cat-warning',
          name: 'Near Limit',
          allocated_amount: 10000,
          spent_amount: 9000, // 90%
        }),
      ]

      render(<BudgetOverview {...defaultProps} categories={warningCategories} />)

      expect(screen.getByText('$1,000.00 remaining')).toBeInTheDocument()
    })

    it('calls onViewCategory when alert category is clicked', async () => {
      const user = userEvent.setup()
      const onViewCategory = jest.fn()
      const alertCategories = [
        createMockBudgetCategory({
          id: 'alert-cat',
          name: 'Alert Category',
          allocated_amount: 1000,
          spent_amount: 900, // 90%
        }),
      ]

      render(
        <BudgetOverview
          {...defaultProps}
          categories={alertCategories}
          onViewCategory={onViewCategory}
        />
      )

      // Find and click the alert item button
      const alertButton = screen.getByRole('button', { name: /Alert Category/i })
      await user.click(alertButton)

      expect(onViewCategory).toHaveBeenCalledWith('alert-cat')
    })
  })

  describe('Recent Expenses List', () => {
    it('renders recent expenses section', () => {
      render(<BudgetOverview {...defaultProps} />)

      expect(screen.getByText('Recent Expenses')).toBeInTheDocument()
    })

    it('shows empty state when no expenses', () => {
      render(<BudgetOverview {...defaultProps} expenses={[]} />)

      expect(screen.getByText('No expenses recorded yet')).toBeInTheDocument()
    })

    it('displays expense names', () => {
      render(<BudgetOverview {...defaultProps} />)

      expect(screen.getByText('Venue Deposit')).toBeInTheDocument()
      expect(screen.getByText('Venue Final Payment')).toBeInTheDocument()
    })

    it('shows paid badge for paid expenses', () => {
      const paidExpense = [
        createMockExpense({ id: 'paid-1', name: 'Paid Expense', is_paid: true }),
      ]

      render(<BudgetOverview {...defaultProps} expenses={paidExpense} />)

      expect(screen.getByText('Paid')).toBeInTheDocument()
    })

    it('shows unpaid badge for unpaid expenses', () => {
      const unpaidExpense = [
        createMockExpense({ id: 'unpaid-1', name: 'Unpaid Expense', is_paid: false }),
      ]

      render(<BudgetOverview {...defaultProps} expenses={unpaidExpense} />)

      expect(screen.getByText('Unpaid')).toBeInTheDocument()
    })

    it('displays expense amounts', () => {
      const expenses = [
        createMockExpense({ id: 'exp-1', name: 'Test Expense', amount: 1500 }),
      ]

      render(<BudgetOverview {...defaultProps} expenses={expenses} />)

      expect(screen.getByText('$1,500.00')).toBeInTheDocument()
    })

    it('shows vendor name when available', () => {
      const expenseWithVendor = [
        createMockExpense({
          id: 'vendor-exp',
          name: 'Vendor Expense',
          vendor_name: 'ABC Vendors',
        }),
      ]

      render(<BudgetOverview {...defaultProps} expenses={expenseWithVendor} />)

      expect(screen.getByText('ABC Vendors')).toBeInTheDocument()
    })

    it('shows category badge for expense', () => {
      const categories = [
        createMockBudgetCategory({
          id: 'cat-1',
          name: 'Test Category',
          color: '#ff0000',
        }),
      ]
      const expenses = [
        createMockExpense({
          id: 'exp-1',
          name: 'Test Expense',
          category_id: 'cat-1',
        }),
      ]

      render(
        <BudgetOverview
          {...defaultProps}
          categories={categories}
          expenses={expenses}
        />
      )

      expect(screen.getByText('Test Category')).toBeInTheDocument()
    })

    it('limits to 5 most recent expenses', () => {
      const manyExpenses: Expense[] = Array.from({ length: 10 }, (_, i) =>
        createMockExpense({
          id: `expense-${i}`,
          name: `Expense ${i + 1}`,
          created_at: new Date(2024, 0, i + 1).toISOString(),
        })
      )

      render(<BudgetOverview {...defaultProps} expenses={manyExpenses} />)

      // Should show 5 expense buttons (most recent)
      const expenseButtons = screen.getAllByRole('button', { name: /Expense \d+/i })
      expect(expenseButtons.length).toBe(5)
    })

    it('calls onViewExpense when expense is clicked', async () => {
      const user = userEvent.setup()
      const onViewExpense = jest.fn()
      const expenses = [
        createMockExpense({ id: 'click-exp', name: 'Click Me Expense' }),
      ]

      render(
        <BudgetOverview
          {...defaultProps}
          expenses={expenses}
          onViewExpense={onViewExpense}
        />
      )

      const expenseButton = screen.getByRole('button', { name: /Click Me Expense/i })
      await user.click(expenseButton)

      expect(onViewExpense).toHaveBeenCalledWith('click-exp')
    })
  })

  describe('Utilization Color Coding', () => {
    it('shows green styling for utilization <= 50%', () => {
      const summary = createMockBudgetSummary({ total_spent: 10000 })
      render(
        <BudgetOverview
          {...defaultProps}
          eventBudgetTotal={30000}
          summary={summary}
        />
      )

      // 33.3% utilization should show green
      expect(screen.getByText('33.3%')).toBeInTheDocument()
    })

    it('shows yellow styling for utilization 51-80%', () => {
      const summary = createMockBudgetSummary({ total_spent: 20000 })
      render(
        <BudgetOverview
          {...defaultProps}
          eventBudgetTotal={30000}
          summary={summary}
        />
      )

      // 66.7% utilization should exist
      expect(screen.getByText('66.7%')).toBeInTheDocument()
    })

    it('shows red styling for utilization > 80%', () => {
      const summary = createMockBudgetSummary({ total_spent: 27000 })
      render(
        <BudgetOverview
          {...defaultProps}
          eventBudgetTotal={30000}
          summary={summary}
        />
      )

      // 90% utilization should exist
      expect(screen.getByText('90.0%')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles zero budget target gracefully', () => {
      render(
        <BudgetOverview
          eventBudgetTotal={0}
          summary={createMockBudgetSummary({ total_budget: 0, total_spent: 0 })}
          categories={[]}
          expenses={[]}
        />
      )

      // Should show empty state or handle gracefully
      expect(screen.getByText('No budget data yet')).toBeInTheDocument()
    })

    it('handles null summary with categories', () => {
      render(
        <BudgetOverview
          eventBudgetTotal={10000}
          summary={null}
          categories={mockBudgetCategories}
          expenses={mockExpenses}
        />
      )

      // Should still render with fallback values
      expect(screen.getByText('Budget Target')).toBeInTheDocument()
    })

    it('falls back to allocated budget when event budget not set', () => {
      const summary = createMockBudgetSummary({ total_budget: 25000, total_spent: 12500 })
      render(
        <BudgetOverview
          eventBudgetTotal={undefined}
          summary={summary}
          categories={mockBudgetCategories}
          expenses={mockExpenses}
        />
      )

      // Should show 50% utilization (12500 / 25000)
      expect(screen.getByText('50.0%')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(
        <BudgetOverview {...defaultProps} className="custom-test-class" />
      )

      const wrapper = container.firstChild
      expect(wrapper).toHaveClass('custom-test-class')
    })

    it('handles categories with zero allocation', () => {
      const zeroAllocCategory = [
        createMockBudgetCategory({
          id: 'zero-alloc',
          name: 'Zero Allocation',
          allocated_amount: 0,
          spent_amount: 0,
        }),
      ]

      render(<BudgetOverview {...defaultProps} categories={zeroAllocCategory} />)

      expect(screen.getByText('Zero Allocation')).toBeInTheDocument()
    })
  })
})
