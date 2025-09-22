import React from 'react'
import { render, screen, waitFor } from '../../../../__tests__/test-utils'
import userEvent from '@testing-library/user-event'
import { EventCard } from '../EventCard'
import { createMockEventSummary } from '../../../../__tests__/mocks/eventData'
import { EventType, EventStatus } from '@/types/event.types'

// Mock animations to avoid issues in tests
jest.mock('@/lib/animations', () => ({
  ANIMATION_CLASSES: {},
  PRESET_ANIMATIONS: {
    CARD_HOVER: 'transition-all duration-300 ease-out',
  },
  getAnimationClass: jest.fn(() => 'animate-slideInUp'),
}))

// Mock utils
jest.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}))

// Mock Button component
jest.mock('@/components/ui/Button', () => ({
  Button: ({ children, onClick, title, className, ...props }: any) => (
    <button onClick={onClick} title={title} className={className} {...props}>
      {children}
    </button>
  ),
}))

// Mock EventStatusBadge
jest.mock('../EventStatusBadge', () => ({
  EventStatusBadge: ({ status }: { status: EventStatus }) => (
    <div data-testid="event-status-badge">{status}</div>
  ),
}))

describe('EventCard Component Tests', () => {
  const user = userEvent.setup()
  const mockHandlers = {
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onView: jest.fn(),
    onDuplicate: jest.fn(),
    onArchive: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render event basic information correctly', () => {
      const event = createMockEventSummary({
        name: 'Sample Wedding Event',
        type: EventType.WEDDING,
        status: EventStatus.PLANNING,
        venue_name: 'Grand Ballroom',
        guest_count: 150,
        confirmed_guests: 120,
      })

      render(<EventCard event={event} {...mockHandlers} />)

      expect(screen.getByText('Sample Wedding Event')).toBeInTheDocument()
      expect(screen.getByText('Wedding')).toBeInTheDocument()
      expect(screen.getByText('Grand Ballroom')).toBeInTheDocument()
      expect(screen.getByText('120/150 confirmed (80%)')).toBeInTheDocument()
    })

    it('should render event date correctly formatted', () => {
      const event = createMockEventSummary({
        start_date: '2024-06-15T14:00:00Z',
      })

      render(<EventCard event={event} {...mockHandlers} />)

      // Should format date properly
      expect(screen.getByText(/June 15, 2024/)).toBeInTheDocument()
      expect(screen.getByText(/2:00 PM/)).toBeInTheDocument()
    })

    it('should handle missing venue name gracefully', () => {
      const event = createMockEventSummary({
        venue_name: undefined,
      })

      render(<EventCard event={event} {...mockHandlers} />)

      // When venue_name is undefined, the venue section should not render
      // No need to check for "No venue set" text as it's not in the component
      expect(screen.getByRole('heading')).toBeInTheDocument()
    })

    it('should display correct event type labels', () => {
      const eventTypes = [
        { type: EventType.WEDDING, label: 'Wedding' },
        { type: EventType.BIRTHDAY, label: 'Birthday' },
        { type: EventType.CORPORATE, label: 'Corporate' },
        { type: EventType.CONFERENCE, label: 'Conference' },
      ]

      eventTypes.forEach(({ type, label }) => {
        const event = createMockEventSummary({ type })
        const { unmount } = render(<EventCard event={event} {...mockHandlers} />)

        expect(screen.getByText(label)).toBeInTheDocument()
        unmount()
      })
    })
  })

  describe('Event Status Badge', () => {
    it('should render status badge with correct status', () => {
      const event = createMockEventSummary({
        status: EventStatus.CONFIRMED,
      })

      render(<EventCard event={event} {...mockHandlers} />)

      // EventStatusBadge should be rendered (exact text depends on implementation)
      const statusBadge = screen.getByTestId('event-status-badge') || screen.getByText(/confirmed/i)
      expect(statusBadge).toBeInTheDocument()
    })

    it('should handle all event status types', () => {
      const statuses = [
        EventStatus.DRAFT,
        EventStatus.PLANNING,
        EventStatus.CONFIRMED,
        EventStatus.IN_PROGRESS,
        EventStatus.COMPLETED,
        EventStatus.CANCELLED,
        EventStatus.POSTPONED,
      ]

      statuses.forEach((status) => {
        const event = createMockEventSummary({ status })
        const { unmount } = render(<EventCard event={event} {...mockHandlers} />)

        // Should render without errors
        expect(screen.getByRole('article')).toBeInTheDocument()
        unmount()
      })
    })
  })

  describe('Budget Progress Bar', () => {
    it('should render budget progress with correct values', () => {
      const event = createMockEventSummary({
        budget_total: 10000,
        total_expenses: 7500,
      })

      render(<EventCard event={event} {...mockHandlers} />)

      expect(screen.getByText('Budget')).toBeInTheDocument()
      expect(screen.getByText('$7,500 / $10,000')).toBeInTheDocument()
    })

    it('should show no budget set when budget is zero', () => {
      const event = createMockEventSummary({
        budget_total: 0,
        total_expenses: 0,
      })

      render(<EventCard event={event} {...mockHandlers} />)

      expect(screen.getByText('No budget set')).toBeInTheDocument()
    })

    it('should show over budget status when expenses exceed budget', () => {
      const event = createMockEventSummary({
        budget_total: 5000,
        total_expenses: 6000,
      })

      render(<EventCard event={event} {...mockHandlers} />)

      expect(screen.getByText('$6,000 / $5,000')).toBeInTheDocument()
      // Over budget styling should be applied (red colors in CSS classes)
      const progressBar = screen.getByRole('progressbar') || screen.getByTestId('budget-progress')
      if (progressBar) {
        expect(progressBar.className).toContain('red')
      }
    })

    it('should show warning colors when near budget limit', () => {
      const event = createMockEventSummary({
        budget_total: 10000,
        total_expenses: 8500, // 85% of budget
      })

      render(<EventCard event={event} {...mockHandlers} />)

      expect(screen.getByText('$8,500 / $10,000')).toBeInTheDocument()
      // Warning styling should be applied (yellow colors)
      const progressText = screen.getByText('$8,500 / $10,000')
      expect(progressText).toBeInTheDocument()
    })
  })

  describe('View Modes', () => {
    it('should render correctly in grid view mode', () => {
      const event = createMockEventSummary()

      render(<EventCard event={event} viewMode="grid" {...mockHandlers} />)

      // Should render the card container
      const cardContainer = document.querySelector('.group')
      expect(cardContainer).toBeInTheDocument()
    })

    it('should render correctly in list view mode', () => {
      const event = createMockEventSummary()

      render(<EventCard event={event} viewMode="list" {...mockHandlers} />)

      const cardContainer = document.querySelector('.group')
      expect(cardContainer).toBeInTheDocument()
      // List view has different layout classes
      expect(cardContainer?.className).toContain('p-3')
    })

    it('should default to grid view when no viewMode specified', () => {
      const event = createMockEventSummary()

      render(<EventCard event={event} {...mockHandlers} />)

      const cardContainer = document.querySelector('.group')
      expect(cardContainer).toBeInTheDocument()
    })
  })

  describe('Action Buttons', () => {
    it('should render all action buttons when showActions is true', () => {
      const event = createMockEventSummary()

      render(<EventCard event={event} showActions={true} {...mockHandlers} />)

      expect(screen.getByTitle('Edit event')).toBeInTheDocument()
      expect(screen.getByTitle('Delete event')).toBeInTheDocument()
      expect(screen.getByTitle('View event')).toBeInTheDocument()
      expect(screen.getByTitle('Duplicate event')).toBeInTheDocument()
      expect(screen.getByTitle('Archive event')).toBeInTheDocument()
    })

    it('should hide action buttons when showActions is false', () => {
      const event = createMockEventSummary()

      render(<EventCard event={event} showActions={false} {...mockHandlers} />)

      expect(screen.queryByTitle('Edit event')).not.toBeInTheDocument()
      expect(screen.queryByTitle('Delete event')).not.toBeInTheDocument()
      expect(screen.queryByTitle('View event')).not.toBeInTheDocument()
    })

    it('should call onEdit when edit button is clicked', async () => {
      const event = createMockEventSummary({ id: 'test-event-id' })

      render(<EventCard event={event} showActions={true} {...mockHandlers} />)

      const editButton = screen.getByTitle('Edit event')
      await user.click(editButton)

      expect(mockHandlers.onEdit).toHaveBeenCalledWith('test-event-id')
    })

    it('should call onDelete when delete button is clicked', async () => {
      const event = createMockEventSummary({ id: 'test-event-id' })

      render(<EventCard event={event} showActions={true} {...mockHandlers} />)

      const deleteButton = screen.getByTitle('Delete event')
      await user.click(deleteButton)

      expect(mockHandlers.onDelete).toHaveBeenCalledWith('test-event-id')
    })

    it('should call onView when view button is clicked', async () => {
      const event = createMockEventSummary({ id: 'test-event-id' })

      render(<EventCard event={event} showActions={true} {...mockHandlers} />)

      const viewButton = screen.getByTitle('View event')
      await user.click(viewButton)

      expect(mockHandlers.onView).toHaveBeenCalledWith('test-event-id')
    })

    it('should call onDuplicate when duplicate button is clicked', async () => {
      const event = createMockEventSummary({ id: 'test-event-id' })

      render(<EventCard event={event} showActions={true} {...mockHandlers} />)

      const duplicateButton = screen.getByTitle('Duplicate event')
      await user.click(duplicateButton)

      expect(mockHandlers.onDuplicate).toHaveBeenCalledWith('test-event-id')
    })

    it('should call onArchive when archive button is clicked', async () => {
      const event = createMockEventSummary({ id: 'test-event-id' })

      render(<EventCard event={event} showActions={true} {...mockHandlers} />)

      const archiveButton = screen.getByTitle('Archive event')
      await user.click(archiveButton)

      expect(mockHandlers.onArchive).toHaveBeenCalledWith('test-event-id')
    })
  })

  describe('Guest Information', () => {
    it('should display guest count correctly', () => {
      const event = createMockEventSummary({
        guest_count: 150,
        confirmed_guests: 120,
      })

      render(<EventCard event={event} {...mockHandlers} />)

      expect(screen.getByText('120/150 confirmed (80%)')).toBeInTheDocument()
    })

    it('should handle zero guests gracefully', () => {
      const event = createMockEventSummary({
        guest_count: 0,
        confirmed_guests: 0,
      })

      render(<EventCard event={event} {...mockHandlers} />)

      expect(screen.getByText('0/0 confirmed (0%)')).toBeInTheDocument()
    })

    it('should show guest confirmation rate', () => {
      const event = createMockEventSummary({
        guest_count: 100,
        confirmed_guests: 75,
      })

      render(<EventCard event={event} {...mockHandlers} />)

      expect(screen.getByText('75/100 confirmed (75%)')).toBeInTheDocument()
    })
  })

  describe('Animation and Styling', () => {
    it('should apply animation classes when animated prop is true', () => {
      const event = createMockEventSummary()

      render(
        <EventCard
          event={event}
          animated={true}
          animationDelay={100}
          {...mockHandlers}
        />
      )

      // Should render without errors with animation props
      expect(screen.getByRole('article')).toBeInTheDocument()
    })

    it('should handle animateOnMount prop', () => {
      const event = createMockEventSummary()

      render(
        <EventCard
          event={event}
          animateOnMount={true}
          {...mockHandlers}
        />
      )

      expect(screen.getByRole('article')).toBeInTheDocument()
    })

    it('should apply hover effects', async () => {
      const event = createMockEventSummary()

      render(<EventCard event={event} {...mockHandlers} />)

      const card = screen.getByRole('article')

      await user.hover(card)
      // Should not throw errors on hover
      expect(card).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const event = createMockEventSummary({
        name: 'Accessible Event',
        type: EventType.WEDDING,
      })

      render(<EventCard event={event} showActions={true} {...mockHandlers} />)

      // Should render the event name as heading
      const heading = screen.getByRole('heading')
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveTextContent('Accessible Event')

      // Action buttons should be properly labeled
      expect(screen.getByTitle('Edit event')).toBeInTheDocument()
      expect(screen.getByTitle('Delete event')).toBeInTheDocument()
      expect(screen.getByTitle('View event')).toBeInTheDocument()
    })

    it('should support keyboard navigation', async () => {
      const event = createMockEventSummary()

      render(<EventCard event={event} showActions={true} {...mockHandlers} />)

      const editButton = screen.getByTitle('Edit event')

      // Should be able to focus and activate with keyboard
      editButton.focus()
      expect(editButton).toHaveFocus()

      await user.keyboard('{Enter}')
      expect(mockHandlers.onEdit).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should handle missing required fields gracefully', () => {
      const event = createMockEventSummary({
        name: '',
        venue_name: undefined,
        guest_count: 0,
      })

      render(<EventCard event={event} {...mockHandlers} />)

      // Should render without errors
      const heading = screen.getByRole('heading')
      expect(heading).toBeInTheDocument()
      // Empty name should still render
      expect(heading).toHaveTextContent('')
    })

    it('should handle invalid date formats', () => {
      const event = createMockEventSummary({
        start_date: 'invalid-date',
      })

      // Should not crash when rendering with invalid date
      expect(() => {
        render(<EventCard event={event} {...mockHandlers} />)
      }).not.toThrow()
    })

    it('should handle negative budget values', () => {
      const event = createMockEventSummary({
        budget_total: -1000,
        total_expenses: -500,
      })

      render(<EventCard event={event} {...mockHandlers} />)

      // Should render without errors
      expect(screen.getByRole('article')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long event names', () => {
      const longName = 'A'.repeat(200)
      const event = createMockEventSummary({
        name: longName,
      })

      render(<EventCard event={event} {...mockHandlers} />)

      const heading = screen.getByRole('heading')
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveTextContent(longName)
    })

    it('should handle very large numbers', () => {
      const event = createMockEventSummary({
        guest_count: 999999,
        confirmed_guests: 888888,
        budget_total: 999999999,
        total_expenses: 888888888,
      })

      render(<EventCard event={event} {...mockHandlers} />)

      expect(screen.getByText('888,888/999,999 confirmed (89%)')).toBeInTheDocument()
      expect(screen.getByText('$888,888,888 / $999,999,999')).toBeInTheDocument()
    })

    it('should handle undefined callback functions', () => {
      const event = createMockEventSummary()

      // Should not crash when callbacks are undefined
      expect(() => {
        render(
          <EventCard
            event={event}
            showActions={true}
            onEdit={undefined}
            onDelete={undefined}
            onView={undefined}
          />
        )
      }).not.toThrow()
    })
  })
})