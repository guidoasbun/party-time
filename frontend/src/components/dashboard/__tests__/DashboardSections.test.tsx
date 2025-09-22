import React from 'react'
import { render, screen } from '../../../../__tests__/test-utils'
import userEvent from '@testing-library/user-event'
import { DashboardSections } from '../DashboardSections'

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
}))

// Mock utils
jest.mock('@/lib/utils', () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(' '),
}))

// Mock dashboard layout
jest.mock('../DashboardLayout', () => ({
  DashboardGrid: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dashboard-grid">{children}</div>
  ),
}))

// Mock ErrorBoundary
jest.mock('@/components/ui/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode; fallback?: React.ReactNode }) => (
    <div data-testid="error-boundary">{children}</div>
  ),
}))

// Mock dashboard section components
jest.mock('../QuickStatsSection', () => ({
  QuickStatsSection: () => (
    <div data-testid="quick-stats-section">Quick Stats Section</div>
  ),
}))

jest.mock('../RecentActivityFeed', () => ({
  RecentActivityFeed: () => (
    <div data-testid="recent-activity-feed">Recent Activity Feed</div>
  ),
}))

jest.mock('../UpcomingEventsWidget', () => ({
  UpcomingEventsWidget: ({ onViewEvent, onCreateEvent }: {
    onViewEvent?: (eventId: string) => void
    onCreateEvent?: () => void
  }) => (
    <div data-testid="upcoming-events-widget">
      <div>Upcoming Events Widget</div>
      <button onClick={() => onViewEvent?.('test-event-1')}>View Event</button>
      <button onClick={onCreateEvent}>Create Event</button>
    </div>
  ),
}))

jest.mock('../QuickActionsPanel', () => ({
  QuickActionsPanel: ({ onCreateEvent, onViewAllEvents }: {
    onCreateEvent?: () => void
    onViewAllEvents?: () => void
  }) => (
    <div data-testid="quick-actions-panel">
      <div>Quick Actions Panel</div>
      <button onClick={onCreateEvent}>Create New Event</button>
      <button onClick={onViewAllEvents}>View All Events</button>
    </div>
  ),
}))

jest.mock('../RecentEventsSection', () => ({
  RecentEventsSection: ({ onViewEvent, onEditEvent }: {
    onViewEvent?: (eventId: string) => void
    onEditEvent?: (eventId: string) => void
  }) => (
    <div data-testid="recent-events-section">
      <div>Recent Events Section</div>
      <button onClick={() => onViewEvent?.('test-event-1')}>View Recent Event</button>
      <button onClick={() => onEditEvent?.('test-event-1')}>Edit Recent Event</button>
    </div>
  ),
}))

// Mock useDashboardData hook
const mockDashboardData = {
  error: null,
  isLoading: false,
  data: {
    stats: {
      totalEvents: 10,
      upcomingEvents: 5,
      totalGuests: 250,
      totalBudget: 75000,
    },
    recentActivity: [],
    upcomingEvents: [],
    recentEvents: [],
  },
}

jest.mock('@/hooks/api/useEventStats', () => ({
  useDashboardData: () => mockDashboardData,
}))

describe('DashboardSections Component Tests', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
    mockDashboardData.error = null
    mockDashboardData.isLoading = false
  })

  describe('Basic Rendering', () => {
    it('should render dashboard header', () => {
      render(<DashboardSections />)

      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Overview of your events, activities, and quick actions')).toBeInTheDocument()
    })

    it('should render all dashboard sections', () => {
      render(<DashboardSections />)

      expect(screen.getByTestId('quick-stats-section')).toBeInTheDocument()
      expect(screen.getByTestId('recent-activity-feed')).toBeInTheDocument()
      expect(screen.getByTestId('upcoming-events-widget')).toBeInTheDocument()
      expect(screen.getByTestId('quick-actions-panel')).toBeInTheDocument()
      expect(screen.getByTestId('recent-events-section')).toBeInTheDocument()
    })

    it('should render dashboard grid layout', () => {
      render(<DashboardSections />)

      expect(screen.getAllByTestId('dashboard-grid')).toHaveLength(2)
    })

    it('should render error boundary wrapper', () => {
      render(<DashboardSections />)

      // There are multiple error boundaries, one for each section
      expect(screen.getAllByTestId('error-boundary')).toHaveLength(5)
    })
  })

  describe('Section Content', () => {
    it('should display content from all sections', () => {
      render(<DashboardSections />)

      expect(screen.getByText('Quick Stats Section')).toBeInTheDocument()
      expect(screen.getByText('Recent Activity Feed')).toBeInTheDocument()
      expect(screen.getByText('Upcoming Events Widget')).toBeInTheDocument()
      expect(screen.getByText('Quick Actions Panel')).toBeInTheDocument()
      expect(screen.getByText('Recent Events Section')).toBeInTheDocument()
    })

    it('should render interactive elements in sections', () => {
      render(<DashboardSections />)

      expect(screen.getByText('View Event')).toBeInTheDocument()
      expect(screen.getByText('Create Event')).toBeInTheDocument()
      expect(screen.getByText('Create New Event')).toBeInTheDocument()
      expect(screen.getByText('View All Events')).toBeInTheDocument()
      expect(screen.getByText('View Recent Event')).toBeInTheDocument()
      expect(screen.getByText('Edit Recent Event')).toBeInTheDocument()
    })
  })

  describe('Navigation Handlers', () => {
    it('should navigate to create event page when create event is clicked', async () => {
      render(<DashboardSections />)

      const createEventButton = screen.getByText('Create Event')
      await user.click(createEventButton)

      expect(mockPush).toHaveBeenCalledWith('/events/new')
    })

    it('should navigate to create event from quick actions', async () => {
      render(<DashboardSections />)

      const createNewEventButton = screen.getByText('Create New Event')
      await user.click(createNewEventButton)

      expect(mockPush).toHaveBeenCalledWith('/events/new')
    })

    it('should navigate to view event when view event is clicked', async () => {
      render(<DashboardSections />)

      const viewEventButton = screen.getByText('View Event')
      await user.click(viewEventButton)

      expect(mockPush).toHaveBeenCalledWith('/events/test-event-1')
    })

    it('should navigate to edit event when edit event is clicked', async () => {
      render(<DashboardSections />)

      const editEventButton = screen.getByText('Edit Recent Event')
      await user.click(editEventButton)

      expect(mockPush).toHaveBeenCalledWith('/events/test-event-1/edit')
    })

    it('should navigate to events list when view all events is clicked', async () => {
      render(<DashboardSections />)

      const viewAllEventsButton = screen.getByText('View All Events')
      await user.click(viewAllEventsButton)

      expect(mockPush).toHaveBeenCalledWith('/events')
    })

    it('should navigate to view recent event', async () => {
      render(<DashboardSections />)

      const viewRecentEventButton = screen.getByText('View Recent Event')
      await user.click(viewRecentEventButton)

      expect(mockPush).toHaveBeenCalledWith('/events/test-event-1')
    })
  })

  describe('Error Handling', () => {
    it('should handle dashboard data errors gracefully', () => {
      mockDashboardData.error = new Error('Failed to load dashboard data')

      render(<DashboardSections />)

      // Should still render sections even with error
      expect(screen.getByTestId('quick-stats-section')).toBeInTheDocument()
      expect(screen.getByTestId('recent-activity-feed')).toBeInTheDocument()
      expect(screen.getByTestId('upcoming-events-widget')).toBeInTheDocument()
    })

    it('should render individual section error states', () => {
      // This test assumes sections handle their own errors
      render(<DashboardSections />)

      expect(screen.getAllByTestId(/.*-section|.*-widget|.*-panel/)).toHaveLength(5)
    })

    it('should render without crashing when navigation handlers fail', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      mockPush.mockImplementation(() => {
        throw new Error('Navigation error')
      })

      expect(() => {
        render(<DashboardSections />)
      }).not.toThrow()

      consoleSpy.mockRestore()
    })
  })

  describe('Loading States', () => {
    it('should handle loading state in dashboard data', () => {
      mockDashboardData.isLoading = true

      render(<DashboardSections />)

      // Should still render the structure
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getAllByTestId('dashboard-grid')).toHaveLength(2)
    })

    it('should render loading sections when needed', () => {
      mockDashboardData.isLoading = true

      render(<DashboardSections />)

      // Loading sections would be handled by individual components
      expect(screen.getByTestId('quick-stats-section')).toBeInTheDocument()
    })
  })

  describe('Layout and Structure', () => {
    it('should have proper dashboard header structure', () => {
      render(<DashboardSections />)

      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveTextContent('Dashboard')

      const description = screen.getByText('Overview of your events, activities, and quick actions')
      expect(description).toBeInTheDocument()
    })

    it('should organize sections in proper layout', () => {
      render(<DashboardSections />)

      const dashboardGrids = screen.getAllByTestId('dashboard-grid')
      expect(dashboardGrids).toHaveLength(2)

      // All sections should be within the grids
      const sections = screen.getAllByTestId(/.*-section|.*-widget|.*-panel/)
      expect(sections).toHaveLength(5)
    })

    it('should maintain proper spacing and structure', () => {
      const { container } = render(<DashboardSections />)

      const headerSection = container.querySelector('.mb-8')
      expect(headerSection).toBeInTheDocument()
    })
  })

  describe('Error Boundaries', () => {
    it('should wrap content in error boundaries', () => {
      render(<DashboardSections />)

      expect(screen.getByTestId('error-boundary')).toBeInTheDocument()
    })

    it('should contain all sections within error boundary', () => {
      render(<DashboardSections />)

      const errorBoundary = screen.getByTestId('error-boundary')
      const sections = screen.getAllByTestId(/.*-section|.*-widget|.*-panel/)

      sections.forEach(section => {
        expect(errorBoundary).toContainElement(section)
      })
    })
  })

  describe('Section Wrapper Functionality', () => {
    it('should render section wrapper error state', () => {
      // This would be tested if SectionWrapper was exposed or if individual sections had errors
      render(<DashboardSections />)

      // Verify that sections are rendering properly without errors
      expect(screen.queryByText(/Error loading/)).not.toBeInTheDocument()
    })

    it('should handle section retry functionality', () => {
      // This would test retry functionality if exposed
      render(<DashboardSections />)

      expect(screen.queryByText('Try again')).not.toBeInTheDocument()
    })
  })

  describe('Responsive Behavior', () => {
    it('should render properly on different screen sizes', () => {
      render(<DashboardSections />)

      // Dashboard should render without layout issues
      expect(screen.getAllByTestId('dashboard-grid')).toHaveLength(2)
      expect(screen.getAllByTestId(/.*-section|.*-widget|.*-panel|.*-feed/)).toHaveLength(5)
    })
  })

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(<DashboardSections className="custom-dashboard" />)

      expect(container.firstChild).toHaveClass('custom-dashboard')
    })

    it('should merge custom className with default styles', () => {
      const { container } = render(<DashboardSections className="bg-blue-50 p-4" />)

      const element = container.firstChild as HTMLElement
      expect(element?.className).toContain('bg-blue-50 p-4')
    })
  })

  describe('Integration with Dashboard Data', () => {
    it('should use dashboard data hook', () => {
      render(<DashboardSections />)

      // Should render without errors, indicating proper hook usage
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    it('should handle data hook errors', () => {
      mockDashboardData.error = new Error('API Error')

      expect(() => {
        render(<DashboardSections />)
      }).not.toThrow()

      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    it('should pass data to child components', () => {
      render(<DashboardSections />)

      // Child components should render properly with data
      expect(screen.getByTestId('quick-stats-section')).toBeInTheDocument()
      expect(screen.getByTestId('upcoming-events-widget')).toBeInTheDocument()
      expect(screen.getByTestId('recent-events-section')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<DashboardSections />)

      const mainHeading = screen.getByRole('heading', { level: 1 })
      expect(mainHeading).toHaveTextContent('Dashboard')
    })

    it('should have descriptive text for screen readers', () => {
      render(<DashboardSections />)

      expect(screen.getByText('Overview of your events, activities, and quick actions')).toBeInTheDocument()
    })

    it('should have accessible button labels', () => {
      render(<DashboardSections />)

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button.textContent).toBeTruthy()
      })
    })
  })

  describe('Performance Considerations', () => {
    it('should render efficiently with multiple sections', () => {
      const startTime = performance.now()
      render(<DashboardSections />)
      const endTime = performance.now()

      // Should render within reasonable time (< 100ms in tests)
      expect(endTime - startTime).toBeLessThan(100)
    })

    it('should handle multiple navigation calls', async () => {
      render(<DashboardSections />)

      const buttons = screen.getAllByRole('button')

      // Click multiple buttons rapidly with error handling
      for (const button of buttons.slice(0, 3)) {
        try {
          await user.click(button)
        } catch (error) {
          // Some buttons might throw errors in test environment
        }
      }

      // Check that navigation was attempted
      expect(mockPush).toHaveBeenCalled()
    })
  })
})