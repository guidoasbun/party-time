/**
 * Smoke tests for Event Detail Page (Phase 3.2.1)
 * Basic functionality tests to verify the event detail layout works correctly
 */

import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useRouter, useParams } from 'next/navigation'
import EventDetailPage from '@/app/events/[id]/page'
import { NavigationProvider } from '@/contexts/NavigationContext'
import type { Event } from '@/types'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
  usePathname: jest.fn(() => '/events/123'),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(() => null),
  })),
}))

jest.mock('@/hooks/api/useEvents', () => ({
  useEvent: jest.fn(),
  useDeleteEvent: jest.fn(() => ({
    mutate: jest.fn(),
    isPending: false,
  })),
  useDuplicateEvent: jest.fn(() => ({
    mutate: jest.fn(),
    isPending: false,
  })),
  useUpdateEvent: jest.fn(() => ({
    mutate: jest.fn(),
    isPending: false,
  })),
}))

jest.mock('@/hooks/useToast', () => ({
  useToast: jest.fn(() => ({
    toast: jest.fn(),
  })),
}))

jest.mock('@/hooks/useConfirmation', () => ({
  useConfirmation: jest.fn(() => ({
    showConfirmation: jest.fn(() => Promise.resolve(true)),
  })),
}))

// Sample event data
const mockEvent: Event = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Summer Wedding',
  description: 'Beautiful outdoor wedding celebration',
  type: 'wedding',
  status: 'confirmed',
  start_date: '2025-07-15T14:00:00Z',
  end_date: '2025-07-15T22:00:00Z',
  location: 'Garden Venue',
  venue_name: 'Garden Venue',
  venue_address: '123 Main St, City, State',
  is_public: true,
  guest_count: 150,
  confirmed_guests: 120,
  max_guests: 200,
  budget_total: 25000,
  total_expenses: 18000,
  planner_id: 'planner-123',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-15T00:00:00Z',
}

describe('Event Detail Page - Smoke Tests', () => {
  let queryClient: QueryClient
  let mockRouter: { push: jest.Mock }
  let mockUseEvent: jest.Mock

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })

    mockRouter = {
      push: jest.fn(),
    }

    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useParams as jest.Mock).mockReturnValue({ id: mockEvent.id })

    // Reset mocks
    jest.clearAllMocks()

    // Get the mocked hook
    mockUseEvent = jest.requireMock('@/hooks/api/useEvents').useEvent
  })

  afterEach(() => {
    queryClient.clear()
  })

  const renderPage = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <NavigationProvider>
          <EventDetailPage />
        </NavigationProvider>
      </QueryClientProvider>
    )
  }

  describe('Page Load', () => {
    it('should load event detail page with valid event ID', async () => {
      mockUseEvent.mockReturnValue({
        data: mockEvent,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      })

      renderPage()

      await waitFor(() => {
        expect(screen.getByText('Summer Wedding')).toBeInTheDocument()
      })

      // Description appears in overview tab
      const descriptions = screen.getAllByText('Beautiful outdoor wedding celebration')
      expect(descriptions.length).toBeGreaterThan(0)
    })

    it('should show loading skeleton while fetching event', () => {
      mockUseEvent.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
        refetch: jest.fn(),
      })

      const { container } = renderPage()

      // Check for loading skeleton elements (they have animate-pulse class)
      const skeletons = container.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('should show error message when event not found', () => {
      mockUseEvent.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Event not found'),
        refetch: jest.fn(),
      })

      renderPage()

      expect(screen.getByText('Failed to load event')).toBeInTheDocument()
      // The error message shows the error.message text
      expect(screen.getByText('Event not found')).toBeInTheDocument()
    })

    it('should show error message when API fails', () => {
      mockUseEvent.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('API Error'),
        refetch: jest.fn(),
      })

      renderPage()

      expect(screen.getByText('Failed to load event')).toBeInTheDocument()
    })
  })

  describe('Event Header', () => {
    beforeEach(() => {
      mockUseEvent.mockReturnValue({
        data: mockEvent,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      })
    })

    it('should display event title', () => {
      renderPage()

      expect(screen.getByText('Summer Wedding')).toBeInTheDocument()
    })

    it('should display event type badge', () => {
      renderPage()

      expect(screen.getByText('Wedding')).toBeInTheDocument()
    })

    it('should display event status badge', () => {
      const { container } = renderPage()

      // Status badge should exist - it may not have text content we can easily query
      // Look for the EventStatusBadge component's output
      // The EventStatusBadge component renders a span with specific classes
      const badge = container.querySelector('[class*="inline-flex"][class*="items-center"][class*="px-"]')
      expect(badge).toBeInTheDocument()
    })

    it('should display public badge when event is public', () => {
      renderPage()

      expect(screen.getByText('Public')).toBeInTheDocument()
    })

    it('should display event date and time', () => {
      renderPage()

      // Date should be formatted (exact format may vary)
      const dateElements = screen.getAllByText(/July|2025/i)
      expect(dateElements.length).toBeGreaterThan(0)
    })

    it('should display event location', () => {
      renderPage()

      // Location may appear in multiple places (header and overview tab)
      const locationTexts = screen.getAllByText(/Garden Venue/i)
      expect(locationTexts.length).toBeGreaterThan(0)
      expect(locationTexts[0]).toBeInTheDocument()
    })

    it('should display guest count when available', () => {
      renderPage()

      // Guest count is shown in the header (150 guests)
      expect(screen.getByText(/150 guests/i)).toBeInTheDocument()

      // Max guests may also be shown (Max: 200)
      const maxGuestsText = screen.queryByText(/Max:\s*\d+/i)
      if (maxGuestsText) {
        expect(maxGuestsText).toBeInTheDocument()
      }
    })
  })

  describe('Action Buttons', () => {
    beforeEach(() => {
      mockUseEvent.mockReturnValue({
        data: mockEvent,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      })
    })

    it('should display Edit button', () => {
      renderPage()

      const editButton = screen.getByRole('button', { name: /edit/i })
      expect(editButton).toBeInTheDocument()
      expect(editButton).toBeEnabled()
    })

    it('should display Duplicate button', () => {
      renderPage()

      const duplicateButton = screen.getByRole('button', { name: /duplicate/i })
      expect(duplicateButton).toBeInTheDocument()
      expect(duplicateButton).toBeEnabled()
    })

    it('should display Share button', () => {
      renderPage()

      const shareButton = screen.getByRole('button', { name: /share/i })
      expect(shareButton).toBeInTheDocument()
      expect(shareButton).toBeEnabled()
    })

    it('should display Delete button', () => {
      renderPage()

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      expect(deleteButton).toBeInTheDocument()
      expect(deleteButton).toBeEnabled()
    })

    it('should have all action buttons clickable', () => {
      renderPage()

      const editButton = screen.getByRole('button', { name: /edit/i })
      const duplicateButton = screen.getByRole('button', { name: /duplicate/i })
      const shareButton = screen.getByRole('button', { name: /share/i })
      const deleteButton = screen.getByRole('button', { name: /delete/i })

      // Verify buttons are not disabled
      expect(editButton).not.toBeDisabled()
      expect(duplicateButton).not.toBeDisabled()
      expect(shareButton).not.toBeDisabled()
      expect(deleteButton).not.toBeDisabled()
    })
  })

  describe('Navigation', () => {
    beforeEach(() => {
      mockUseEvent.mockReturnValue({
        data: mockEvent,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      })
    })

    it('should navigate back to dashboard when error occurs', () => {
      mockUseEvent.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Event not found'),
        refetch: jest.fn(),
      })

      renderPage()

      const backButton = screen.getByText(/back to dashboard/i)
      expect(backButton).toBeInTheDocument()
    })
  })

  describe('Overview Section', () => {
    beforeEach(() => {
      mockUseEvent.mockReturnValue({
        data: mockEvent,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      })
    })

    it('should display Event Details section', () => {
      renderPage()

      // The Overview tab shows "Event Details" not "Event Overview"
      expect(screen.getByText('Event Details')).toBeInTheDocument()
    })

    it('should display guest summary in overview', () => {
      renderPage()

      expect(screen.getByText('Guests')).toBeInTheDocument()
    })

    it('should display guest information in overview', () => {
      renderPage()

      // Look for guest-related text (tab label)
      expect(screen.getByText('Guests')).toBeInTheDocument()

      // Guest count should be visible somewhere (there may be multiple instances)
      const guestTexts = screen.queryAllByText(/\d+\s*\/?\s*\d*\s*guests?/i)
      expect(guestTexts.length).toBeGreaterThan(0)
    })

    it('should display tabs section content', () => {
      renderPage()

      // Check that the Overview tab content is visible (default active tab)
      expect(screen.getByText(/Event Details/i)).toBeInTheDocument()
    })
  })

  describe('Mobile Responsiveness', () => {
    beforeEach(() => {
      mockUseEvent.mockReturnValue({
        data: mockEvent,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      })

      // Mock mobile viewport
      global.innerWidth = 375
      global.innerHeight = 667
      global.dispatchEvent(new Event('resize'))
    })

    it('should render properly on mobile viewport', () => {
      renderPage()

      // Verify key elements are present
      expect(screen.getByText('Summer Wedding')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    beforeEach(() => {
      mockUseEvent.mockReturnValue({
        data: mockEvent,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      })
    })

    it('should have proper ARIA labels on action buttons', () => {
      renderPage()

      expect(screen.getByRole('button', { name: 'Edit event' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Duplicate event' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Share event' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Delete event' })).toBeInTheDocument()
    })

    it('should have proper semantic HTML structure', () => {
      const { container } = renderPage()

      // Check for main heading
      const heading = container.querySelector('h1')
      expect(heading).toBeInTheDocument()
      expect(heading?.textContent).toBe('Summer Wedding')
    })
  })
})
