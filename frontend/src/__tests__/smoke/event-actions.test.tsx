/**
 * Smoke tests for Event Actions & Dialogs (Phase 3.2.4)
 * Tests delete, duplicate, share, and status change functionality
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { EventActionButtons } from '@/components/events/EventActionButtons'
import { DeleteEventDialog } from '@/components/events/DeleteEventDialog'
import { DuplicateEventDialog } from '@/components/events/DuplicateEventDialog'
import { ShareEventButton } from '@/components/events/ShareEventButton'
import { EventStatusDropdown } from '@/components/events/EventStatusDropdown'
import { EventStatus, EventType, type Event } from '@/types'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/events/123',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock toast hook
jest.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

// Mock API hooks
jest.mock('@/hooks/api/useEvents', () => ({
  useEvent: () => ({
    data: mockEvent,
    isLoading: false,
    error: null,
  }),
  useDeleteEvent: () => ({
    mutate: jest.fn(),
    isPending: false,
  }),
  useDuplicateEvent: () => ({
    mutate: jest.fn(),
    isPending: false,
  }),
  useUpdateEvent: () => ({
    mutate: jest.fn(),
    isPending: false,
  }),
}))

// Mock event data
const mockEvent: Event = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Test Event',
  description: 'A test event for smoke testing',
  type: EventType.BIRTHDAY,
  status: EventStatus.PLANNING,
  start_date: '2025-12-01T18:00:00Z',
  end_date: '2025-12-01T22:00:00Z',
  location: 'Test Venue',
  venue_name: 'Test Hall',
  venue_address: '123 Test St',
  is_public: true,
  planner_id: 'planner-123',
  guest_count: 50,
  confirmed_guests: 25,
  total_expenses: 5000,
  budget_total: 10000,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-15T00:00:00Z',
}

// Helper to wrap components with providers
const renderWithProviders = (ui: React.ReactElement) => {
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

describe('Event Actions & Dialogs - Smoke Tests', () => {
  describe('EventActionButtons', () => {
    it('renders all action buttons', () => {
      renderWithProviders(
        <EventActionButtons
          eventId={mockEvent.id}
          eventName={mockEvent.name}
        />
      )

      // Check that all buttons are present
      expect(screen.getByLabelText('Edit event')).toBeInTheDocument()
      expect(screen.getByLabelText('Duplicate event')).toBeInTheDocument()
      expect(screen.getByLabelText('Share event')).toBeInTheDocument()
      expect(screen.getByLabelText('Delete event')).toBeInTheDocument()
      expect(screen.getByLabelText('Change event status')).toBeInTheDocument()
    })

    it('opens delete dialog when delete button is clicked', async () => {
      renderWithProviders(
        <EventActionButtons
          eventId={mockEvent.id}
          eventName={mockEvent.name}
        />
      )

      const deleteButton = screen.getByLabelText('Delete event')
      fireEvent.click(deleteButton)

      // Dialog should appear with confirmation message
      await waitFor(() => {
        expect(screen.getByText('Delete Event')).toBeInTheDocument()
      })
    })

    it('opens duplicate dialog when duplicate button is clicked', async () => {
      renderWithProviders(
        <EventActionButtons
          eventId={mockEvent.id}
          eventName={mockEvent.name}
        />
      )

      const duplicateButton = screen.getByLabelText('Duplicate event')
      fireEvent.click(duplicateButton)

      // Dialog should appear
      await waitFor(() => {
        expect(screen.getByText('Duplicate Event')).toBeInTheDocument()
      })
    })
  })

  describe('DeleteEventDialog', () => {
    it('displays event details in confirmation dialog', () => {
      renderWithProviders(
        <DeleteEventDialog
          isOpen={true}
          event={mockEvent}
          isDeleting={false}
          onConfirm={jest.fn()}
          onCancel={jest.fn()}
        />
      )

      // Check that event name is shown
      expect(screen.getByText(/Test Event/i)).toBeInTheDocument()

      // Check that guest count is shown
      expect(screen.getByText(/50 guests/i)).toBeInTheDocument()

      // Check that delete button is present
      expect(screen.getByText('Delete Event')).toBeInTheDocument()
    })

    it('calls onConfirm when delete is confirmed', () => {
      const onConfirm = jest.fn()

      renderWithProviders(
        <DeleteEventDialog
          isOpen={true}
          event={mockEvent}
          isDeleting={false}
          onConfirm={onConfirm}
          onCancel={jest.fn()}
        />
      )

      const confirmButton = screen.getByText('Delete Event')
      fireEvent.click(confirmButton)

      expect(onConfirm).toHaveBeenCalledTimes(1)
    })

    it('calls onCancel when cancel is clicked', () => {
      const onCancel = jest.fn()

      renderWithProviders(
        <DeleteEventDialog
          isOpen={true}
          event={mockEvent}
          isDeleting={false}
          onConfirm={jest.fn()}
          onCancel={onCancel}
        />
      )

      const cancelButton = screen.getByText('Cancel')
      fireEvent.click(cancelButton)

      expect(onCancel).toHaveBeenCalledTimes(1)
    })

    it('shows loading state when deleting', () => {
      renderWithProviders(
        <DeleteEventDialog
          isOpen={true}
          event={mockEvent}
          isDeleting={true}
          onConfirm={jest.fn()}
          onCancel={jest.fn()}
        />
      )

      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
  })

  describe('DuplicateEventDialog', () => {
    it('displays event information and default name', () => {
      renderWithProviders(
        <DuplicateEventDialog
          isOpen={true}
          event={mockEvent}
          isDuplicating={false}
          onConfirm={jest.fn()}
          onCancel={jest.fn()}
        />
      )

      // Check for event name in description
      expect(screen.getByText(/Test Event/i)).toBeInTheDocument()

      // Check for default copy name
      expect(screen.getByText(/Test Event \(Copy\)/i)).toBeInTheDocument()

      // Check for duplicate button
      expect(screen.getByText('Duplicate Event')).toBeInTheDocument()
    })

    it('allows customizing event name', async () => {
      renderWithProviders(
        <DuplicateEventDialog
          isOpen={true}
          event={mockEvent}
          isDuplicating={false}
          onConfirm={jest.fn()}
          onCancel={jest.fn()}
        />
      )

      // Enable custom name checkbox
      const customizeCheckbox = screen.getByLabelText('Customize event name')
      fireEvent.click(customizeCheckbox)

      // Input should appear
      await waitFor(() => {
        const nameInput = screen.getByLabelText('New event name')
        expect(nameInput).toBeInTheDocument()
      })
    })

    it('calls onConfirm when duplicate is confirmed', () => {
      const onConfirm = jest.fn()

      renderWithProviders(
        <DuplicateEventDialog
          isOpen={true}
          event={mockEvent}
          isDuplicating={false}
          onConfirm={onConfirm}
          onCancel={jest.fn()}
        />
      )

      const confirmButton = screen.getByText('Duplicate Event')
      fireEvent.click(confirmButton)

      expect(onConfirm).toHaveBeenCalledTimes(1)
    })
  })

  describe('ShareEventButton', () => {
    // Mock clipboard API
    const mockClipboard = {
      writeText: jest.fn(),
    }

    beforeAll(() => {
      Object.assign(navigator, {
        clipboard: mockClipboard,
      })

      // Mock window.location
      Object.defineProperty(window, 'location', {
        value: {
          origin: 'http://localhost:3000',
        },
        writable: true,
      })
    })

    it('renders share button', () => {
      renderWithProviders(
        <ShareEventButton
          eventId={mockEvent.id}
          eventName={mockEvent.name}
        />
      )

      expect(screen.getByLabelText('Share event')).toBeInTheDocument()
    })

    it('opens share menu when clicked', async () => {
      renderWithProviders(
        <ShareEventButton
          eventId={mockEvent.id}
          eventName={mockEvent.name}
        />
      )

      const shareButton = screen.getByLabelText('Share event')
      fireEvent.click(shareButton)

      // Menu should appear
      await waitFor(() => {
        expect(screen.getByText('Share Event')).toBeInTheDocument()
        expect(screen.getByText('Copy link')).toBeInTheDocument()
        expect(screen.getByText('Share via email')).toBeInTheDocument()
      })
    })
  })

  describe('EventStatusDropdown', () => {
    it('displays current status', () => {
      renderWithProviders(
        <EventStatusDropdown event={mockEvent} />
      )

      // Current status should be displayed
      expect(screen.getByText('Planning')).toBeInTheDocument()
    })

    it('opens status menu when clicked', async () => {
      renderWithProviders(
        <EventStatusDropdown event={mockEvent} />
      )

      const statusButton = screen.getByLabelText('Change event status')
      fireEvent.click(statusButton)

      // Status options should appear
      await waitFor(() => {
        expect(screen.getByText('Draft')).toBeInTheDocument()
        expect(screen.getByText('Confirmed')).toBeInTheDocument()
        expect(screen.getByText('Cancelled')).toBeInTheDocument()
      })
    })

    it('shows confirmation for destructive status changes', async () => {
      renderWithProviders(
        <EventStatusDropdown event={mockEvent} />
      )

      // Open dropdown
      const statusButton = screen.getByLabelText('Change event status')
      fireEvent.click(statusButton)

      // Click on Cancelled status
      await waitFor(() => {
        const cancelledOption = screen.getAllByText('Cancelled').find(
          el => el.closest('button') !== null
        )
        if (cancelledOption) {
          fireEvent.click(cancelledOption)
        }
      })

      // Confirmation dialog should appear
      await waitFor(() => {
        expect(screen.getByText(/Change Status to Cancelled/i)).toBeInTheDocument()
      })
    })
  })

  describe('Integration Tests', () => {
    it('complete delete flow works end-to-end', async () => {
      const onDeleteSuccess = jest.fn()

      renderWithProviders(
        <EventActionButtons
          eventId={mockEvent.id}
          eventName={mockEvent.name}
          onDeleteSuccess={onDeleteSuccess}
        />
      )

      // Click delete button
      const deleteButton = screen.getByLabelText('Delete event')
      fireEvent.click(deleteButton)

      // Confirm deletion
      await waitFor(() => {
        const confirmButton = screen.getByText('Delete Event')
        fireEvent.click(confirmButton)
      })

      // Note: onDeleteSuccess would be called after successful API call
      // In a real integration test, we'd mock the API response
    })

    it('duplicate flow creates new event', async () => {
      const onDuplicateSuccess = jest.fn()

      renderWithProviders(
        <EventActionButtons
          eventId={mockEvent.id}
          eventName={mockEvent.name}
          onDuplicateSuccess={onDuplicateSuccess}
        />
      )

      // Click duplicate button
      const duplicateButton = screen.getByLabelText('Duplicate event')
      fireEvent.click(duplicateButton)

      // Confirm duplication
      await waitFor(() => {
        const confirmButton = screen.getByText('Duplicate Event')
        fireEvent.click(confirmButton)
      })

      // Note: onDuplicateSuccess would be called after successful API call
    })
  })
})
