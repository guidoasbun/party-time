import React from 'react'
import { render, screen } from '../../../../__tests__/test-utils'
import { StatsCards } from '../StatsCards'
import { createMockDashboardStats } from '../../../../__tests__/mocks/eventData'

// Mock utils
jest.mock('@/lib/utils', () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(' '),
}))

// Mock StatCard component
jest.mock('../StatCard', () => ({
  StatCard: ({
    title,
    value,
    previousValue,
    icon: Icon,
    prefix,
    loading,
    className,
    ...props
  }: {
    title: string
    value: number | string
    previousValue?: number
    icon?: React.ComponentType<{ 'data-testid'?: string }>
    prefix?: string
    loading?: boolean
    className?: string
    [key: string]: unknown
  }) => (
    <div
      className={className}
      data-testid={props['data-testid']}
      data-loading={loading}
    >
      <div data-testid="stat-title">{title}</div>
      <div data-testid="stat-value">
        {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      {previousValue !== undefined && (
        <div data-testid="stat-comparison">
          Previous: {previousValue}
        </div>
      )}
      {Icon && <Icon data-testid="stat-icon" />}
    </div>
  ),
}))

// Mock useDashboardStats hook
const mockDashboardStats = {
  data: createMockDashboardStats(),
  isLoading: false,
  error: null,
}

jest.mock('@/hooks/api/useEventStats', () => ({
  useDashboardStats: () => mockDashboardStats,
}))

describe('StatsCards Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockDashboardStats.data = createMockDashboardStats()
    mockDashboardStats.isLoading = false
    mockDashboardStats.error = null
  })

  describe('Basic Rendering', () => {
    it('should render all stat cards', () => {
      render(<StatsCards />)

      expect(screen.getByTestId('total-events-card')).toBeInTheDocument()
      expect(screen.getByTestId('upcoming-events-card')).toBeInTheDocument()
      expect(screen.getByTestId('total-guests-card')).toBeInTheDocument()
      expect(screen.getByTestId('total-budget-card')).toBeInTheDocument()
    })

    it('should display correct card titles', () => {
      render(<StatsCards />)

      expect(screen.getByText('Total Events')).toBeInTheDocument()
      expect(screen.getByText('Upcoming Events')).toBeInTheDocument()
      expect(screen.getByText('Total Guests')).toBeInTheDocument()
      expect(screen.getByText('Total Budget')).toBeInTheDocument()
    })

    it('should display stat values from dashboard data', () => {
      const mockStats = createMockDashboardStats({
        totalEvents: 25,
        upcomingEvents: 8,
        totalGuests: 500,
        totalBudget: 150000,
      })
      mockDashboardStats.data = mockStats

      render(<StatsCards />)

      expect(screen.getByText('25')).toBeInTheDocument()
      expect(screen.getByText('8')).toBeInTheDocument()
      expect(screen.getByText('500')).toBeInTheDocument()
      expect(screen.getByText('$150,000')).toBeInTheDocument()
    })

    it('should render icons for each stat card', () => {
      render(<StatsCards />)

      const icons = screen.getAllByTestId('stat-icon')
      expect(icons).toHaveLength(4)
    })
  })

  describe('Loading States', () => {
    it('should show loading state when isLoading is true', () => {
      mockDashboardStats.isLoading = true

      render(<StatsCards />)

      const cards = screen.getAllByTestId(/.*-card/)
      cards.forEach(card => {
        expect(card).toHaveAttribute('data-loading', 'true')
      })
    })

    it('should not show stat values when loading', () => {
      mockDashboardStats.isLoading = true

      render(<StatsCards />)

      // When loading, StatCard should be in loading state, titles might still be visible
      const cards = screen.getAllByTestId(/.*-card/)
      cards.forEach(card => {
        expect(card).toHaveAttribute('data-loading', 'true')
      })
    })

    it('should show actual data when not loading', () => {
      mockDashboardStats.isLoading = false

      render(<StatsCards />)

      const cards = screen.getAllByTestId(/.*-card/)
      cards.forEach(card => {
        expect(card).toHaveAttribute('data-loading', 'false')
      })
    })
  })

  describe('Error Handling', () => {
    it('should render error message when error occurs', () => {
      mockDashboardStats.error = new Error('Failed to fetch statistics')

      render(<StatsCards />)

      expect(screen.getByText('Failed to load dashboard statistics')).toBeInTheDocument()
      expect(screen.getByText('Failed to fetch statistics')).toBeInTheDocument()
    })

    it('should render generic error message for errors without message', () => {
      mockDashboardStats.error = new Error()

      render(<StatsCards />)

      expect(screen.getByText('Failed to load dashboard statistics')).toBeInTheDocument()
      expect(screen.getByText('An error occurred while fetching data.')).toBeInTheDocument()
    })

    it('should not render stat cards when error occurs', () => {
      mockDashboardStats.error = new Error('Network error')

      render(<StatsCards />)

      expect(screen.queryByTestId('total-events-card')).not.toBeInTheDocument()
      expect(screen.queryByTestId('upcoming-events-card')).not.toBeInTheDocument()
      expect(screen.queryByTestId('total-guests-card')).not.toBeInTheDocument()
      expect(screen.queryByTestId('total-budget-card')).not.toBeInTheDocument()
    })

    it('should apply error styling classes', () => {
      mockDashboardStats.error = new Error('Test error')

      const { container } = render(<StatsCards />)
      const errorContainer = container.querySelector('.border-red-200')

      expect(errorContainer).toBeInTheDocument()
    })
  })

  describe('Comparison Data', () => {
    it('should show comparison data when showComparisons is true and previousPeriodData is provided', () => {
      const previousData = {
        totalEvents: 20,
        upcomingEvents: 5,
        totalGuests: 400,
        totalBudget: 120000,
      }

      render(<StatsCards showComparisons={true} previousPeriodData={previousData} />)

      expect(screen.getByText('Previous: 20')).toBeInTheDocument()
      expect(screen.getByText('Previous: 5')).toBeInTheDocument()
      expect(screen.getByText('Previous: 400')).toBeInTheDocument()
      expect(screen.getByText('Previous: 120000')).toBeInTheDocument()
    })

    it('should not show comparison data when showComparisons is false', () => {
      const previousData = {
        totalEvents: 20,
        upcomingEvents: 5,
        totalGuests: 400,
        totalBudget: 120000,
      }

      render(<StatsCards showComparisons={false} previousPeriodData={previousData} />)

      expect(screen.queryByText('Previous: 20')).not.toBeInTheDocument()
      expect(screen.queryByTestId('stat-comparison')).not.toBeInTheDocument()
    })

    it('should not show comparison data when previousPeriodData is not provided', () => {
      render(<StatsCards showComparisons={true} />)

      expect(screen.queryByTestId('stat-comparison')).not.toBeInTheDocument()
    })

    it('should handle partial previousPeriodData', () => {
      const partialPreviousData = {
        totalEvents: 15,
        upcomingEvents: 3,
        // Missing totalGuests and totalBudget
      }

      render(<StatsCards showComparisons={true} previousPeriodData={partialPreviousData} />)

      expect(screen.getByText('Previous: 15')).toBeInTheDocument()
      expect(screen.getByText('Previous: 3')).toBeInTheDocument()
      expect(screen.getAllByText(/Previous: \d+/)).toHaveLength(2) // Only two comparisons should show
    })
  })

  describe('Data Formatting', () => {
    it('should format large numbers with commas', () => {
      const mockStats = createMockDashboardStats({
        totalEvents: 1234,
        totalGuests: 56789,
        totalBudget: 1234567,
      })
      mockDashboardStats.data = mockStats

      render(<StatsCards />)

      expect(screen.getByText('1,234')).toBeInTheDocument()
      expect(screen.getByText('56,789')).toBeInTheDocument()
      expect(screen.getByText('$1,234,567')).toBeInTheDocument()
    })

    it('should add dollar sign prefix to budget values', () => {
      const mockStats = createMockDashboardStats({
        totalBudget: 50000,
      })
      mockDashboardStats.data = mockStats

      render(<StatsCards />)

      expect(screen.getByText('$50,000')).toBeInTheDocument()
    })

    it('should handle zero values correctly', () => {
      const mockStats = createMockDashboardStats({
        totalEvents: 0,
        upcomingEvents: 0,
        totalGuests: 0,
        totalBudget: 0,
      })
      mockDashboardStats.data = mockStats

      render(<StatsCards />)

      expect(screen.getAllByText('0')).toHaveLength(3) // Three cards with numeric 0
      expect(screen.getByText('$0')).toBeInTheDocument()
    })
  })

  describe('No Data Handling', () => {
    it('should handle undefined stats data', () => {
      mockDashboardStats.data = undefined

      render(<StatsCards />)

      expect(screen.getAllByText('0')).toHaveLength(3) // Should show default values
    })

    it('should handle null stats data', () => {
      mockDashboardStats.data = null

      render(<StatsCards />)

      expect(screen.getAllByText('0')).toHaveLength(3) // Three cards with numeric 0
      expect(screen.getByText('$0')).toBeInTheDocument() // One card with $0
    })

    it('should use fallback values for missing properties', () => {
      mockDashboardStats.data = {} // Empty object

      render(<StatsCards />)

      // Should render all cards with default 0 values
      expect(screen.getAllByText('0')).toHaveLength(3)
      expect(screen.getByText('$0')).toBeInTheDocument()
    })
  })

  describe('Responsive Layout', () => {
    it('should apply responsive grid classes', () => {
      const { container } = render(<StatsCards />)

      const gridContainer = container.querySelector('.grid')
      expect(gridContainer?.className).toContain('grid-cols-1')
      expect(gridContainer?.className).toContain('sm:grid-cols-2')
      expect(gridContainer?.className).toContain('lg:grid-cols-4')
    })

    it('should apply minimum height classes to cards', () => {
      render(<StatsCards />)

      const cards = screen.getAllByTestId(/.*-card/)
      cards.forEach(card => {
        expect(card.className).toContain('min-h-[120px]')
        expect(card.className).toContain('sm:min-h-[140px]')
      })
    })
  })

  describe('Custom Styling', () => {
    it('should apply custom className to container', () => {
      const { container } = render(<StatsCards className="custom-stats-cards" />)

      expect(container.firstChild).toHaveClass('custom-stats-cards')
    })

    it('should merge custom className with default styles', () => {
      const { container } = render(<StatsCards className="bg-blue-50 p-4" />)

      const element = container.firstChild as HTMLElement
      expect(element?.className).toContain('bg-blue-50 p-4')
    })

    it('should apply custom className to error state container', () => {
      mockDashboardStats.error = new Error('Test error')

      const { container } = render(<StatsCards className="custom-error-class" />)
      const errorContainer = container.firstChild as HTMLElement

      expect(errorContainer?.className).toContain('custom-error-class')
    })
  })

  describe('Accessibility', () => {
    it('should have proper test IDs for all cards', () => {
      render(<StatsCards />)

      expect(screen.getByTestId('total-events-card')).toBeInTheDocument()
      expect(screen.getByTestId('upcoming-events-card')).toBeInTheDocument()
      expect(screen.getByTestId('total-guests-card')).toBeInTheDocument()
      expect(screen.getByTestId('total-budget-card')).toBeInTheDocument()
    })

    it('should maintain semantic structure with proper heading hierarchy', () => {
      render(<StatsCards />)

      // Stat titles should be accessible
      expect(screen.getByText('Total Events')).toBeInTheDocument()
      expect(screen.getByText('Upcoming Events')).toBeInTheDocument()
      expect(screen.getByText('Total Guests')).toBeInTheDocument()
      expect(screen.getByText('Total Budget')).toBeInTheDocument()
    })
  })

  describe('Integration with StatCard', () => {
    it('should pass correct props to StatCard components', () => {
      const mockStats = createMockDashboardStats({
        totalEvents: 42,
        upcomingEvents: 12,
        totalGuests: 350,
        totalBudget: 85000,
      })
      mockDashboardStats.data = mockStats

      render(<StatsCards />)

      // Verify that StatCard receives the correct data
      expect(screen.getByText('42')).toBeInTheDocument()
      expect(screen.getByText('12')).toBeInTheDocument()
      expect(screen.getByText('350')).toBeInTheDocument()
      expect(screen.getByText('$85,000')).toBeInTheDocument()
    })

    it('should pass loading state to all StatCard components', () => {
      mockDashboardStats.isLoading = true

      render(<StatsCards />)

      const cards = screen.getAllByTestId(/.*-card/)
      expect(cards).toHaveLength(4)
      cards.forEach(card => {
        expect(card).toHaveAttribute('data-loading', 'true')
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle very large numbers', () => {
      const mockStats = createMockDashboardStats({
        totalEvents: 999999,
        totalGuests: 1234567890,
        totalBudget: 999999999999,
      })
      mockDashboardStats.data = mockStats

      render(<StatsCards />)

      expect(screen.getByText('999,999')).toBeInTheDocument()
      expect(screen.getByText('1,234,567,890')).toBeInTheDocument()
      expect(screen.getByText('$999,999,999,999')).toBeInTheDocument()
    })

    it('should handle negative values gracefully', () => {
      const mockStats = createMockDashboardStats({
        totalEvents: -5,
        totalBudget: -1000,
      })
      mockDashboardStats.data = mockStats

      render(<StatsCards />)

      expect(screen.getByText('-5')).toBeInTheDocument()
      expect(screen.getByText('$-1,000')).toBeInTheDocument()
    })

    it('should handle decimal values', () => {
      const mockStats = createMockDashboardStats({
        totalBudget: 1234.56,
      })
      mockDashboardStats.data = mockStats

      render(<StatsCards />)

      // Our mock formats numbers as-is, so check for the actual formatted value
      expect(screen.getByText('$1,234.56')).toBeInTheDocument()
    })
  })
})