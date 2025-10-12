/**
 * Smoke tests for guest forms and modals
 * Tests basic functionality of AddGuestModal, QuickAddGuest, and GuestDetailsDrawer
 */

import React from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AddGuestModal } from '@/components/guests/AddGuestModal'
import { QuickAddGuest } from '@/components/guests/QuickAddGuest'
import { GuestDetailsDrawer } from '@/components/guests/GuestDetailsDrawer'
import { guestsService } from '@/lib/api/services'
import { RsvpStatus } from '@/types'
import type { Guest } from '@/types'

// Mock the API service
jest.mock('@/lib/api/services', () => ({
  guestsService: {
    createGuest: jest.fn(),
    deleteGuest: jest.fn(),
    sendInvitations: jest.fn(),
    regenerateToken: jest.fn()
  }
}))

// Mock the toast hook
jest.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}))

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })

const mockGuest: Guest = {
  id: '123',
  event_id: 'event-123',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  rsvp_status: RsvpStatus.PENDING,
  plus_one_allowed: true,
  plus_one_name: 'Jane Smith',
  dietary_restrictions: 'Vegetarian',
  notes: 'Prefers window seat',
  invitation_sent_at: '2025-10-01T10:00:00Z',
  rsvp_responded_at: null,
  rsvp_token: 'ABC12345',
  created_at: '2025-10-01T09:00:00Z',
  updated_at: '2025-10-01T09:00:00Z'
}

describe('AddGuestModal', () => {
  const mockOnClose = jest.fn()
  const mockOnSuccess = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders when open', () => {
    const queryClient = createQueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <AddGuestModal
          open={true}
          onClose={mockOnClose}
          eventId="event-123"
          onSuccess={mockOnSuccess}
        />
      </QueryClientProvider>
    )

    expect(screen.getByText('Add New Guest')).toBeInTheDocument()
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    const queryClient = createQueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <AddGuestModal
          open={false}
          onClose={mockOnClose}
          eventId="event-123"
          onSuccess={mockOnSuccess}
        />
      </QueryClientProvider>
    )

    expect(screen.queryByText('Add New Guest')).not.toBeInTheDocument()
  })

  it('displays validation errors for empty required fields', async () => {
    const user = userEvent.setup()
    const queryClient = createQueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <AddGuestModal
          open={true}
          onClose={mockOnClose}
          eventId="event-123"
          onSuccess={mockOnSuccess}
        />
      </QueryClientProvider>
    )

    const saveButton = screen.getByRole('button', { name: /save & close/i })
    await user.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/last name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    const queryClient = createQueryClient()

    ;(guestsService.createGuest as jest.Mock).mockResolvedValue({
      ...mockGuest,
      id: 'new-guest-id'
    })

    render(
      <QueryClientProvider client={queryClient}>
        <AddGuestModal
          open={true}
          onClose={mockOnClose}
          eventId="event-123"
          onSuccess={mockOnSuccess}
        />
      </QueryClientProvider>
    )

    await user.type(screen.getByLabelText(/first name/i), 'John')
    await user.type(screen.getByLabelText(/last name/i), 'Doe')
    await user.type(screen.getByLabelText(/email address/i), 'john.doe@example.com')

    const saveButton = screen.getByRole('button', { name: /save & close/i })
    await user.click(saveButton)

    await waitFor(() => {
      expect(guestsService.createGuest).toHaveBeenCalledWith(
        'event-123',
        expect.objectContaining({
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          event_id: 'event-123'
        })
      )
      expect(mockOnSuccess).toHaveBeenCalled()
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('shows plus-one name field when plus-one is allowed', async () => {
    const user = userEvent.setup()
    const queryClient = createQueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <AddGuestModal
          open={true}
          onClose={mockOnClose}
          eventId="event-123"
          onSuccess={mockOnSuccess}
        />
      </QueryClientProvider>
    )

    expect(screen.queryByLabelText(/plus-one name/i)).not.toBeInTheDocument()

    const plusOneCheckbox = screen.getByLabelText(/allow plus-one guest/i)
    await user.click(plusOneCheckbox)

    expect(screen.getByLabelText(/plus-one name/i)).toBeInTheDocument()
  })
})

describe('QuickAddGuest', () => {
  const mockOnSuccess = jest.fn()
  const mockOnCancel = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders collapsed initially', () => {
    render(
      <QuickAddGuest
        eventId="event-123"
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByText('Quick Add Guest')).toBeInTheDocument()
    expect(screen.queryByPlaceholderText(/first name/i)).not.toBeInTheDocument()
  })

  it('expands when clicked', async () => {
    const user = userEvent.setup()

    render(
      <QuickAddGuest
        eventId="event-123"
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    await user.click(screen.getByText('Quick Add Guest'))

    expect(screen.getByPlaceholderText(/first name/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/last name/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/email@example.com/i)).toBeInTheDocument()
  })

  it('shows all input fields when expanded', async () => {
    const user = userEvent.setup()

    render(
      <QuickAddGuest
        eventId="event-123"
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    await user.click(screen.getByText('Quick Add Guest'))

    // Verify all three fields are present
    expect(screen.getByPlaceholderText(/first name/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/last name/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/email@example.com/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add guest/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('cancels and collapses on cancel button', async () => {
    const user = userEvent.setup()

    render(
      <QuickAddGuest
        eventId="event-123"
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    await user.click(screen.getByText('Quick Add Guest'))
    expect(screen.getByPlaceholderText(/first name/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    await waitFor(() => {
      expect(screen.queryByPlaceholderText(/first name/i)).not.toBeInTheDocument()
    })
  })
})

describe('GuestDetailsDrawer', () => {
  const mockOnClose = jest.fn()
  const mockOnEdit = jest.fn()
  const mockOnDelete = jest.fn()
  const mockOnSendInvitation = jest.fn()
  const mockOnRegenerateToken = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders guest details when open', () => {
    render(
      <GuestDetailsDrawer
        open={true}
        onClose={mockOnClose}
        guest={mockGuest}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onSendInvitation={mockOnSendInvitation}
        onRegenerateToken={mockOnRegenerateToken}
      />
    )

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getAllByText('john.doe@example.com').length).toBeGreaterThan(0)
    expect(screen.getAllByText('+1 (555) 123-4567').length).toBeGreaterThan(0)
    expect(screen.getByText('Vegetarian')).toBeInTheDocument()
    expect(screen.getByText('Prefers window seat')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(
      <GuestDetailsDrawer
        open={false}
        onClose={mockOnClose}
        guest={mockGuest}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
  })

  it('displays RSVP status correctly', () => {
    render(
      <GuestDetailsDrawer
        open={true}
        onClose={mockOnClose}
        guest={mockGuest}
      />
    )

    expect(screen.getByText('Pending')).toBeInTheDocument()
  })

  it('displays plus-one information', () => {
    render(
      <GuestDetailsDrawer
        open={true}
        onClose={mockOnClose}
        guest={mockGuest}
      />
    )

    expect(screen.getByText('Plus-one allowed')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
  })

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup()

    // Mock window.confirm
    global.confirm = jest.fn(() => true)

    render(
      <GuestDetailsDrawer
        open={true}
        onClose={mockOnClose}
        guest={mockGuest}
        onDelete={mockOnDelete}
      />
    )

    const deleteButton = screen.getByRole('button', { name: /delete guest/i })
    await user.click(deleteButton)

    expect(mockOnDelete).toHaveBeenCalledWith(mockGuest.id)
  })

  it('calls onSendInvitation when send invite button is clicked', async () => {
    const user = userEvent.setup()

    render(
      <GuestDetailsDrawer
        open={true}
        onClose={mockOnClose}
        guest={mockGuest}
        onSendInvitation={mockOnSendInvitation}
      />
    )

    const sendButton = screen.getByRole('button', { name: /send invite/i })
    await user.click(sendButton)

    expect(mockOnSendInvitation).toHaveBeenCalledWith(mockGuest.id)
  })

  it('displays all action buttons when handlers provided', () => {
    render(
      <GuestDetailsDrawer
        open={true}
        onClose={mockOnClose}
        guest={mockGuest}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onSendInvitation={mockOnSendInvitation}
        onRegenerateToken={mockOnRegenerateToken}
      />
    )

    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send invite/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /regenerate token/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete guest/i })).toBeInTheDocument()
  })

  it('hides action buttons when handlers not provided', () => {
    render(
      <GuestDetailsDrawer
        open={true}
        onClose={mockOnClose}
        guest={mockGuest}
      />
    )

    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /send invite/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /regenerate token/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /delete guest/i })).not.toBeInTheDocument()
  })
})
