/**
 * Smoke tests for Events List Page
 * Phase 3.2.6: Events List Page
 */

import React from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import EventsPage from '@/app/events/page'
import { eventsService } from '@/lib/api/services'
import { EventSummary, EventType, EventStatus } from '@/types/event.types'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  usePathname: jest.fn(() => '/events'),
}))

// Mock events service
jest.mock('@/lib/api/services', () => ({
  eventsService: {
    getEvents: jest.fn(),
  },
}))

// Mock Breadcrumb component
jest.mock('@/components/layout/Breadcrumb', () => ({
  Breadcrumb: () => <div data-testid="breadcrumb">Dashboard &gt; Events</div>,
}))

// Mock data
const mockEvents: EventSummary[] = [
  {
    id: '1',
    name: 'Summer BBQ',
    description: 'Annual summer barbecue',
    event_type: EventType.CELEBRATION,
    status: EventStatus.PLANNING,
    start_date: '2025-07-15',
    start_time: '14:00',
    location: 'Central Park',
    guest_count: 50,
    budget: 2000,
    created_by: 'user1',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Team Building Workshop',
    description: 'Q2 team building event',
    event_type: EventType.CORPORATE,
    status: EventStatus.CONFIRMED,
    start_date: '2025-06-20',
    start_time: '09:00',
    location: 'Conference Center',
    guest_count: 30,
    budget: 5000,
    created_by: 'user1',
    created_at: '2025-01-02T00:00:00Z',
    updated_at: '2025-01-02T00:00:00Z',
  },
  {
    id: '3',
    name: 'Birthday Party',
    description: 'Sarah\'s 30th birthday celebration',
    event_type: EventType.BIRTHDAY,
    status: EventStatus.DRAFT,
    start_date: '2025-08-10',
    start_time: '18:00',
    location: 'Home',
    guest_count: 25,
    budget: 1000,
    created_by: 'user1',
    created_at: '2025-01-03T00:00:00Z',
    updated_at: '2025-01-03T00:00:00Z',
  },
]

const mockPaginatedResponse = {
  items: mockEvents,
  page: 1,
  limit: 20,
  total: 3,
  has_next: false,
  has_previous: false,
}

// Helper function to render with providers
function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  )
}

describe('Events List Page - Smoke Tests', () => {
  let mockPush: jest.Mock
  let mockReplace: jest.Mock

  beforeEach(() => {
    mockPush = jest.fn()
    mockReplace = jest.fn()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: mockReplace,
    })
    ;(eventsService.getEvents as jest.Mock).mockResolvedValue(mockPaginatedResponse)

    // Mock localStorage
    Storage.prototype.getItem = jest.fn()
    Storage.prototype.setItem = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Page Loading', () => {
    it('should render the page with breadcrumbs', () => {
      renderWithProviders(<EventsPage />)
      expect(screen.getByTestId('breadcrumb')).toBeInTheDocument()
    })

    it('should display page title and event count', async () => {
      renderWithProviders(<EventsPage />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /events/i })).toBeInTheDocument()
        expect(screen.getByText(/3 events/i)).toBeInTheDocument()
      })
    })

    it('should load and display events', async () => {
      renderWithProviders(<EventsPage />)

      await waitFor(() => {
        expect(screen.getByText('Summer BBQ')).toBeInTheDocument()
        expect(screen.getByText('Team Building Workshop')).toBeInTheDocument()
        expect(screen.getByText('Birthday Party')).toBeInTheDocument()
      })
    })
  })

  describe('View Mode Toggle', () => {
    it('should display view mode toggle buttons', async () => {
      renderWithProviders(<EventsPage />)

      await waitFor(() => {
        expect(screen.getByTitle('Grid view')).toBeInTheDocument()
        expect(screen.getByTitle('List view')).toBeInTheDocument()
      })
    })

    it('should toggle between grid and list view', async () => {
      const user = userEvent.setup()
      renderWithProviders(<EventsPage />)

      await waitFor(() => {
        expect(screen.getByText('Summer BBQ')).toBeInTheDocument()
      })

      // Click list view button
      const listButton = screen.getByTitle('List view')
      await user.click(listButton)

      // Verify localStorage was called (view mode persistence)
      await waitFor(() => {
        expect(Storage.prototype.setItem).toHaveBeenCalled()
      })
    })
  })

  describe('Filtering', () => {
    it('should display filter toggle button', async () => {
      renderWithProviders(<EventsPage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /hide filters/i })).toBeInTheDocument()
      })
    })

    it('should toggle filters visibility', async () => {
      const user = userEvent.setup()
      renderWithProviders(<EventsPage />)

      const filterButton = await screen.findByRole('button', { name: /hide filters/i })
      await user.click(filterButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /show filters/i })).toBeInTheDocument()
      })
    })

    it('should display clear filters button when filters are active', async () => {
      const user = userEvent.setup()
      renderWithProviders(<EventsPage />)

      // Wait for events to load
      await waitFor(() => {
        expect(screen.getByText('Summer BBQ')).toBeInTheDocument()
      })

      // Apply a filter by typing in search
      const searchInput = screen.getByPlaceholderText(/search events/i)
      await user.type(searchInput, 'summer')

      // Wait for clear filters button
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /clear filters/i })).toBeInTheDocument()
      })
    })
  })

  describe('Search Functionality', () => {
    it('should display search input', () => {
      renderWithProviders(<EventsPage />)
      expect(screen.getByPlaceholderText(/search events/i)).toBeInTheDocument()
    })

    it('should debounce search input', async () => {
      jest.useFakeTimers()
      const user = userEvent.setup({ delay: null })

      renderWithProviders(<EventsPage />)

      const searchInput = screen.getByPlaceholderText(/search events/i)
      await user.type(searchInput, 'test')

      // API should not be called immediately
      expect(eventsService.getEvents).toHaveBeenCalledTimes(1) // Initial load only

      // Fast-forward time by 300ms (debounce delay)
      jest.advanceTimersByTime(300)

      // Now API should be called with search param
      await waitFor(() => {
        expect(eventsService.getEvents).toHaveBeenCalledWith(
          expect.objectContaining({ search: 'test' })
        )
      })

      jest.useRealTimers()
    })
  })

  describe('Sorting', () => {
    it('should display sort dropdown', async () => {
      renderWithProviders(<EventsPage />)

      await waitFor(() => {
        expect(screen.getByText('Event Date')).toBeInTheDocument()
      })
    })

    it('should display sort direction toggle', async () => {
      renderWithProviders(<EventsPage />)

      await waitFor(() => {
        const sortButton = screen.getByTitle(/descending/i)
        expect(sortButton).toBeInTheDocument()
      })
    })
  })

  describe('Pagination', () => {
    it('should display pagination when multiple pages exist', async () => {
      const multiPageResponse = {
        ...mockPaginatedResponse,
        total: 50,
        has_next: true,
      }
      ;(eventsService.getEvents as jest.Mock).mockResolvedValue(multiPageResponse)

      renderWithProviders(<EventsPage />)

      await waitFor(() => {
        expect(screen.getByText(/showing 1 to 3 of 50 events/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
      })
    })

    it('should navigate to next page when clicked', async () => {
      const user = userEvent.setup()
      const multiPageResponse = {
        ...mockPaginatedResponse,
        total: 50,
        has_next: true,
      }
      ;(eventsService.getEvents as jest.Mock).mockResolvedValue(multiPageResponse)

      renderWithProviders(<EventsPage />)

      const nextButton = await screen.findByRole('button', { name: /next/i })
      await user.click(nextButton)

      await waitFor(() => {
        expect(eventsService.getEvents).toHaveBeenCalledWith(
          expect.objectContaining({ page: 2 })
        )
      })
    })
  })

  describe('Create Event', () => {
    it('should display create event FAB on mobile', () => {
      renderWithProviders(<EventsPage />)

      const fab = screen.getByTitle('Create new event')
      expect(fab).toBeInTheDocument()
    })

    it('should navigate to create event page when FAB clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<EventsPage />)

      const fab = screen.getByTitle('Create new event')
      await user.click(fab)

      expect(mockPush).toHaveBeenCalledWith('/events/new')
    })

    it('should navigate to create event page when desktop button clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<EventsPage />)

      const createButton = await screen.findByRole('button', { name: /create event/i })
      await user.click(createButton)

      expect(mockPush).toHaveBeenCalledWith('/events/new')
    })
  })

  describe('Empty State', () => {
    it('should display empty state when no events exist', async () => {
      const emptyResponse = {
        items: [],
        page: 1,
        limit: 20,
        total: 0,
        has_next: false,
        has_previous: false,
      }
      ;(eventsService.getEvents as jest.Mock).mockResolvedValue(emptyResponse)

      renderWithProviders(<EventsPage />)

      await waitFor(() => {
        expect(screen.getByText(/no events yet/i)).toBeInTheDocument()
        expect(screen.getByText(/get started by creating your first event/i)).toBeInTheDocument()
      })
    })

    it('should display filtered empty state when filters return no results', async () => {
      const user = userEvent.setup()

      // First render with events
      renderWithProviders(<EventsPage />)

      await waitFor(() => {
        expect(screen.getByText('Summer BBQ')).toBeInTheDocument()
      })

      // Apply filter that returns no results
      const emptyResponse = {
        items: [],
        page: 1,
        limit: 20,
        total: 0,
        has_next: false,
        has_previous: false,
      }
      ;(eventsService.getEvents as jest.Mock).mockResolvedValue(emptyResponse)

      const searchInput = screen.getByPlaceholderText(/search events/i)
      await user.type(searchInput, 'nonexistent')

      await waitFor(() => {
        expect(screen.getByText(/no events match your filters/i)).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('should display error message when API fails', async () => {
      const errorMessage = 'Failed to load events'
      ;(eventsService.getEvents as jest.Mock).mockRejectedValue(new Error(errorMessage))

      renderWithProviders(<EventsPage />)

      await waitFor(() => {
        expect(screen.getByText(/failed to load events/i)).toBeInTheDocument()
      })
    })

    it('should have retry button on error', async () => {
      ;(eventsService.getEvents as jest.Mock).mockRejectedValue(new Error('API Error'))

      renderWithProviders(<EventsPage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
      })
    })
  })

  describe('Mobile Responsiveness', () => {
    it('should render mobile-optimized filter component', () => {
      renderWithProviders(<EventsPage />)

      // Mobile filters should be present (compact mode)
      const searchInput = screen.getByPlaceholderText(/search events/i)
      expect(searchInput).toBeInTheDocument()
    })

    it('should display FAB for mobile create action', () => {
      renderWithProviders(<EventsPage />)

      const fab = screen.getByTitle('Create new event')
      expect(fab).toHaveClass('fixed', 'bottom-6', 'right-6')
    })
  })
})
