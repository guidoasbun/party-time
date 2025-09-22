import React from 'react'
import { render, screen, waitFor, fireEvent } from '../../../../__tests__/test-utils'
import userEvent from '@testing-library/user-event'
import { EventList } from '../EventList'
import { createMockEventSummary } from '../../../../__tests__/mocks/eventData'
import { EventType, EventStatus } from '@/types/event.types'

// Mock animations
jest.mock('@/lib/animations', () => ({
  ANIMATION_CLASSES: {},
  PRESET_ANIMATIONS: {
    CARD_HOVER: 'transition-all duration-300 ease-out',
  },
  getAnimationClass: jest.fn(() => 'animate-fadeIn'),
}))

// Mock utils
jest.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}))

// Mock Button component
jest.mock('@/components/ui/Button', () => ({
  Button: ({ children, onClick, variant, size, className, title, ...props }: any) => (
    <button
      onClick={onClick}
      className={`${variant} ${size} ${className}`}
      title={title}
      data-variant={variant}
      {...props}
    >
      {children}
    </button>
  ),
}))

// Mock ConfirmDialog
jest.mock('@/components/ui/ConfirmDialog', () => ({
  __esModule: true,
  default: ({ open, onClose, onConfirm, title, description }: any) =>
    open ? (
      <div data-testid="confirm-dialog">
        <h3>{title}</h3>
        <p>{description}</p>
        <button onClick={onConfirm}>Confirm</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    ) : null,
}))

// Mock EventCard
jest.mock('../EventCard', () => ({
  EventCard: ({ event, onEdit, onDelete, onView, onDuplicate, onArchive, viewMode }: any) => (
    <div data-testid="event-card" data-view-mode={viewMode}>
      <h3>{event.name}</h3>
      <p>{event.type}</p>
      {onEdit && <button onClick={() => onEdit(event.id)}>Edit</button>}
      {onDelete && <button onClick={() => onDelete(event.id)}>Delete</button>}
      {onView && <button onClick={() => onView(event.id)}>View</button>}
      {onDuplicate && <button onClick={() => onDuplicate(event.id)}>Duplicate</button>}
      {onArchive && <button onClick={() => onArchive(event.id)}>Archive</button>}
    </div>
  ),
}))

// Mock useEventActions hook
const mockEventActions = {
  selectEvent: jest.fn(),
  deselectEvent: jest.fn(),
  selectAllEvents: jest.fn(),
  deselectAllEvents: jest.fn(),
  toggleEventSelection: jest.fn(),
  hasSelection: false,
  bulkDeleteEvents: jest.fn(),
  state: {
    bulkSelection: {
      selectedIds: new Set<string>(),
      isSelectAll: false,
      totalCount: 0,
    },
    pendingConfirmation: null,
  },
  showConfirmation: jest.fn(),
  hideConfirmation: jest.fn(),
  confirmAction: jest.fn(),
  getSelectedEvents: jest.fn(() => []),
}

jest.mock('@/hooks/useEventActions', () => ({
  useEventActions: () => mockEventActions,
}))

// Mock useStaggeredAnimation
jest.mock('@/hooks/useAnimatedMount', () => ({
  useStaggeredAnimation: () => [],
}))

describe('EventList Component Tests', () => {
  const user = userEvent.setup()
  const mockHandlers = {
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onView: jest.fn(),
    onDuplicate: jest.fn(),
    onArchive: jest.fn(),
    onCreateEvent: jest.fn(),
    onViewModeChange: jest.fn(),
    onPageChange: jest.fn(),
    onLoadMore: jest.fn(),
  }

  const mockEvents = [
    createMockEventSummary({ id: '1', name: 'Wedding Event', type: EventType.WEDDING }),
    createMockEventSummary({ id: '2', name: 'Birthday Party', type: EventType.BIRTHDAY }),
    createMockEventSummary({ id: '3', name: 'Corporate Meeting', type: EventType.CORPORATE }),
  ]

  const mockPagination = {
    page: 1,
    limit: 10,
    total: 3,
    has_next: false,
    has_previous: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockEventActions.state.bulkSelection.selectedIds.clear()
    mockEventActions.state.bulkSelection.totalCount = 0
    mockEventActions.hasSelection = false
  })

  describe('Basic Rendering', () => {
    it('should render events in grid view by default', () => {
      render(<EventList events={mockEvents} {...mockHandlers} />)

      expect(screen.getAllByTestId('event-card')).toHaveLength(3)
      expect(screen.getByText('Wedding Event')).toBeInTheDocument()
      expect(screen.getByText('Birthday Party')).toBeInTheDocument()
      expect(screen.getByText('Corporate Meeting')).toBeInTheDocument()
    })

    it('should render events in list view when specified', () => {
      render(<EventList events={mockEvents} viewMode="list" {...mockHandlers} />)

      const eventCards = screen.getAllByTestId('event-card')
      expect(eventCards).toHaveLength(3)
      eventCards.forEach(card => {
        expect(card).toHaveAttribute('data-view-mode', 'list')
      })
    })

    it('should handle empty events array', () => {
      render(<EventList events={[]} {...mockHandlers} />)

      expect(screen.getByText('No events found')).toBeInTheDocument()
      expect(screen.getByText('Get started by creating your first event')).toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('should render default empty state', () => {
      render(<EventList events={[]} onCreateEvent={mockHandlers.onCreateEvent} />)

      expect(screen.getByText('No events found')).toBeInTheDocument()
      expect(screen.getByText('Get started by creating your first event')).toBeInTheDocument()
      expect(screen.getByText('Create Event')).toBeInTheDocument()
    })

    it('should render custom empty state messages', () => {
      render(
        <EventList
          events={[]}
          emptyStateTitle="No matching events"
          emptyStateMessage="Try adjusting your filters"
        />
      )

      expect(screen.getByText('No matching events')).toBeInTheDocument()
      expect(screen.getByText('Try adjusting your filters')).toBeInTheDocument()
    })

    it('should call onCreateEvent when create button is clicked', async () => {
      render(<EventList events={[]} onCreateEvent={mockHandlers.onCreateEvent} />)

      const createButton = screen.getByText('Create Event')
      await user.click(createButton)

      expect(mockHandlers.onCreateEvent).toHaveBeenCalled()
    })

    it('should not show create button when onCreateEvent is not provided', () => {
      render(<EventList events={[]} />)

      expect(screen.queryByText('Create Event')).not.toBeInTheDocument()
    })
  })

  describe('View Mode Toggle', () => {
    it('should render view toggle when onViewModeChange is provided', () => {
      render(
        <EventList
          events={mockEvents}
          viewMode="grid"
          onViewModeChange={mockHandlers.onViewModeChange}
        />
      )

      expect(screen.getByTitle('Grid view')).toBeInTheDocument()
      expect(screen.getByTitle('List view')).toBeInTheDocument()
    })

    it('should call onViewModeChange when grid button is clicked', async () => {
      render(
        <EventList
          events={mockEvents}
          viewMode="list"
          onViewModeChange={mockHandlers.onViewModeChange}
        />
      )

      const gridButton = screen.getByTitle('Grid view')
      await user.click(gridButton)

      expect(mockHandlers.onViewModeChange).toHaveBeenCalledWith('grid')
    })

    it('should call onViewModeChange when list button is clicked', async () => {
      render(
        <EventList
          events={mockEvents}
          viewMode="grid"
          onViewModeChange={mockHandlers.onViewModeChange}
        />
      )

      const listButton = screen.getByTitle('List view')
      await user.click(listButton)

      expect(mockHandlers.onViewModeChange).toHaveBeenCalledWith('list')
    })

    it('should not render view toggle when onViewModeChange is not provided', () => {
      render(<EventList events={mockEvents} />)

      expect(screen.queryByTitle('Grid view')).not.toBeInTheDocument()
      expect(screen.queryByTitle('List view')).not.toBeInTheDocument()
    })
  })

  describe('Loading States', () => {
    it('should render loading skeleton when isLoading is true', () => {
      render(<EventList events={[]} isLoading={true} />)

      // Check for skeleton loading elements
      const skeletonElements = document.querySelectorAll('.bg-gray-200, .bg-gray-700')
      expect(skeletonElements.length).toBeGreaterThan(0)
    })

    it('should render grid skeleton in grid view', () => {
      render(<EventList events={[]} isLoading={true} viewMode="grid" />)

      const gridContainer = document.querySelector('.grid-cols-1')
      expect(gridContainer).toBeInTheDocument()
    })

    it('should render list skeleton in list view', () => {
      render(<EventList events={[]} isLoading={true} viewMode="list" />)

      const listContainer = document.querySelector('.grid-cols-1')
      expect(listContainer).toBeInTheDocument()
    })

    it('should not render events when loading', () => {
      render(<EventList events={mockEvents} isLoading={true} />)

      expect(screen.queryByTestId('event-card')).not.toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should render error message when error is provided', () => {
      render(<EventList events={[]} error="Failed to load events" />)

      expect(screen.getByText(/failed to load events/i)).toBeInTheDocument()
    })

    it('should render retry button on error', () => {
      render(<EventList events={[]} error="Network error" />)

      expect(screen.getByText(/retry/i)).toBeInTheDocument()
    })

    it('should handle both error and events simultaneously', () => {
      render(<EventList events={mockEvents} error="Partial failure" />)

      // Should show both error and events
      expect(screen.getByText(/partial failure/i)).toBeInTheDocument()
      expect(screen.getAllByTestId('event-card')).toHaveLength(3)
    })
  })

  describe('Pagination', () => {
    it('should render pagination controls when pagination is provided', () => {
      const paginationWithNext = { ...mockPagination, has_next: true, total: 25 }

      render(
        <EventList
          events={mockEvents}
          pagination={paginationWithNext}
          onPageChange={mockHandlers.onPageChange}
        />
      )

      expect(screen.getByTitle('Next page')).toBeInTheDocument()
    })

    it('should call onPageChange when next button is clicked', async () => {
      const paginationWithNext = { ...mockPagination, has_next: true }

      render(
        <EventList
          events={mockEvents}
          pagination={paginationWithNext}
          onPageChange={mockHandlers.onPageChange}
        />
      )

      const nextButton = screen.getByTitle('Next page')
      await user.click(nextButton)

      expect(mockHandlers.onPageChange).toHaveBeenCalledWith(2)
    })

    it('should call onPageChange when previous button is clicked', async () => {
      const paginationWithPrev = { ...mockPagination, page: 2, has_previous: true }

      render(
        <EventList
          events={mockEvents}
          pagination={paginationWithPrev}
          onPageChange={mockHandlers.onPageChange}
        />
      )

      const prevButton = screen.getByTitle('Previous page')
      await user.click(prevButton)

      expect(mockHandlers.onPageChange).toHaveBeenCalledWith(1)
    })

    it('should disable buttons appropriately based on pagination state', () => {
      render(
        <EventList
          events={mockEvents}
          pagination={mockPagination}
          onPageChange={mockHandlers.onPageChange}
        />
      )

      const nextButton = screen.getByTitle('Next page')
      const prevButton = screen.getByTitle('Previous page')

      expect(nextButton).toBeDisabled()
      expect(prevButton).toBeDisabled()
    })
  })

  describe('Infinite Scroll', () => {
    it('should render load more button when enableInfiniteScroll and hasMore are true', () => {
      render(
        <EventList
          events={mockEvents}
          enableInfiniteScroll={true}
          hasMore={true}
          onLoadMore={mockHandlers.onLoadMore}
        />
      )

      expect(screen.getByText('Load More')).toBeInTheDocument()
    })

    it('should call onLoadMore when load more button is clicked', async () => {
      render(
        <EventList
          events={mockEvents}
          enableInfiniteScroll={true}
          hasMore={true}
          onLoadMore={mockHandlers.onLoadMore}
        />
      )

      const loadMoreButton = screen.getByText('Load More')
      await user.click(loadMoreButton)

      expect(mockHandlers.onLoadMore).toHaveBeenCalled()
    })

    it('should show loading state when isLoadingMore is true', () => {
      render(
        <EventList
          events={mockEvents}
          enableInfiniteScroll={true}
          hasMore={true}
          isLoadingMore={true}
          onLoadMore={mockHandlers.onLoadMore}
        />
      )

      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should not render load more button when hasMore is false', () => {
      render(
        <EventList
          events={mockEvents}
          enableInfiniteScroll={true}
          hasMore={false}
          onLoadMore={mockHandlers.onLoadMore}
        />
      )

      expect(screen.queryByText('Load More')).not.toBeInTheDocument()
    })
  })

  describe('Bulk Selection', () => {
    beforeEach(() => {
      mockEventActions.hasSelection = true
      mockEventActions.state.bulkSelection.selectedIds.add('1')
      mockEventActions.state.bulkSelection.selectedIds.add('2')
      mockEventActions.state.bulkSelection.totalCount = 3
    })

    it('should render bulk selection bar when enableBulkSelection and hasSelection', () => {
      render(
        <EventList
          events={mockEvents}
          enableBulkSelection={true}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('2 events selected')).toBeInTheDocument()
    })

    it('should render select all button in bulk selection bar', () => {
      render(
        <EventList
          events={mockEvents}
          enableBulkSelection={true}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('Select All')).toBeInTheDocument()
    })

    it('should call selectAllEvents when select all is clicked', async () => {
      render(
        <EventList
          events={mockEvents}
          enableBulkSelection={true}
          {...mockHandlers}
        />
      )

      const selectAllButton = screen.getByText('Select All')
      await user.click(selectAllButton)

      expect(mockEventActions.selectAllEvents).toHaveBeenCalled()
    })

    it('should render bulk delete button', () => {
      render(
        <EventList
          events={mockEvents}
          enableBulkSelection={true}
          {...mockHandlers}
        />
      )

      expect(screen.getByTitle('Delete selected events')).toBeInTheDocument()
    })

    it('should call showConfirmation when bulk delete is clicked', async () => {
      render(
        <EventList
          events={mockEvents}
          enableBulkSelection={true}
          {...mockHandlers}
        />
      )

      const bulkDeleteButton = screen.getByTitle('Delete selected events')
      await user.click(bulkDeleteButton)

      expect(mockEventActions.showConfirmation).toHaveBeenCalled()
    })

    it('should not render bulk selection when enableBulkSelection is false', () => {
      render(
        <EventList
          events={mockEvents}
          enableBulkSelection={false}
          {...mockHandlers}
        />
      )

      expect(screen.queryByText('2 events selected')).not.toBeInTheDocument()
    })
  })

  describe('Event Actions', () => {
    it('should pass action handlers to EventCard when enableEventActions is true', () => {
      render(
        <EventList
          events={mockEvents}
          enableEventActions={true}
          {...mockHandlers}
        />
      )

      const firstCard = screen.getAllByTestId('event-card')[0]
      const editButton = firstCard.querySelector('button:contains("Edit")')

      expect(firstCard.querySelector('button')).toBeInTheDocument()
    })

    it('should call onEdit when event card edit button is clicked', async () => {
      render(
        <EventList
          events={mockEvents}
          enableEventActions={true}
          {...mockHandlers}
        />
      )

      const editButton = screen.getAllByText('Edit')[0]
      await user.click(editButton)

      expect(mockHandlers.onEdit).toHaveBeenCalledWith('1')
    })

    it('should call onDelete when event card delete button is clicked', async () => {
      render(
        <EventList
          events={mockEvents}
          enableEventActions={true}
          {...mockHandlers}
        />
      )

      const deleteButton = screen.getAllByText('Delete')[0]
      await user.click(deleteButton)

      expect(mockHandlers.onDelete).toHaveBeenCalledWith('1')
    })

    it('should call onView when event card view button is clicked', async () => {
      render(
        <EventList
          events={mockEvents}
          enableEventActions={true}
          {...mockHandlers}
        />
      )

      const viewButton = screen.getAllByText('View')[0]
      await user.click(viewButton)

      expect(mockHandlers.onView).toHaveBeenCalledWith('1')
    })
  })

  describe('Responsive Behavior', () => {
    it('should apply responsive grid classes in grid view', () => {
      render(<EventList events={mockEvents} viewMode="grid" />)

      const gridContainer = document.querySelector('.grid')
      expect(gridContainer?.className).toContain('sm:grid-cols-2')
      expect(gridContainer?.className).toContain('lg:grid-cols-3')
    })

    it('should apply single column layout in list view', () => {
      render(<EventList events={mockEvents} viewMode="list" />)

      const listContainer = document.querySelector('.grid')
      expect(listContainer?.className).toContain('grid-cols-1')
    })
  })

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <EventList events={mockEvents} className="custom-event-list" />
      )

      expect(container.firstChild).toHaveClass('custom-event-list')
    })

    it('should merge custom className with default styles', () => {
      const { container } = render(
        <EventList events={mockEvents} className="bg-blue-50" />
      )

      const element = container.firstChild as HTMLElement
      expect(element?.className).toContain('bg-blue-50')
    })
  })

  describe('Animation Props', () => {
    it('should handle enableAnimations prop', () => {
      render(<EventList events={mockEvents} enableAnimations={true} />)

      // Should render without errors
      expect(screen.getAllByTestId('event-card')).toHaveLength(3)
    })

    it('should handle enableStaggeredAnimations prop', () => {
      render(<EventList events={mockEvents} enableStaggeredAnimations={true} />)

      expect(screen.getAllByTestId('event-card')).toHaveLength(3)
    })

    it('should handle viewTransitionDuration prop', () => {
      render(<EventList events={mockEvents} viewTransitionDuration={500} />)

      expect(screen.getAllByTestId('event-card')).toHaveLength(3)
    })
  })

  describe('Edge Cases', () => {
    it('should handle events with missing data', () => {
      const incompleteEvents = [
        createMockEventSummary({ name: '', type: EventType.OTHER }),
        createMockEventSummary({ id: '', name: 'No ID Event' }),
      ]

      expect(() => {
        render(<EventList events={incompleteEvents} />)
      }).not.toThrow()

      expect(screen.getAllByTestId('event-card')).toHaveLength(2)
    })

    it('should handle very large event arrays', () => {
      const largeEventArray = Array.from({ length: 100 }, (_, i) =>
        createMockEventSummary({ id: i.toString(), name: `Event ${i}` })
      )

      expect(() => {
        render(<EventList events={largeEventArray} />)
      }).not.toThrow()

      expect(screen.getAllByTestId('event-card')).toHaveLength(100)
    })

    it('should handle undefined callback functions gracefully', () => {
      expect(() => {
        render(
          <EventList
            events={mockEvents}
            onEdit={undefined}
            onDelete={undefined}
            onView={undefined}
          />
        )
      }).not.toThrow()
    })
  })
})