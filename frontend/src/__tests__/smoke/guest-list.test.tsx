/**
 * Smoke tests for Guest List Interface (Phase 4.2.1)
 * Basic tests to verify core functionality works
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GuestList } from '@/components/guests/GuestList'
import { GuestTable } from '@/components/guests/GuestTable'
import { GuestSearchBar } from '@/components/guests/GuestSearchBar'
import { GuestFilters } from '@/components/guests/GuestFilters'
import { BulkActionsMenu } from '@/components/guests/BulkActionsMenu'
import { RsvpStatus, type Guest } from '@/types'

// Mock dependencies
vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}))

vi.mock('@/lib/api/services', () => ({
  guestsService: {
    updateGuest: vi.fn().mockResolvedValue({}),
    bulkDeleteGuests: vi.fn().mockResolvedValue({}),
    bulkUpdateGuestsStatus: vi.fn().mockResolvedValue({}),
    sendInvitations: vi.fn().mockResolvedValue({}),
    exportGuests: vi.fn().mockResolvedValue({})
  }
}))

// Test data
const mockGuests: Guest[] = [
  {
    id: '1',
    event_id: 'event-1',
    email: 'john@example.com',
    first_name: 'John',
    last_name: 'Doe',
    phone: '555-0100',
    rsvp_status: RsvpStatus.ATTENDING,
    plus_one_allowed: true,
    plus_one_name: 'Jane Doe',
    dietary_restrictions: 'Vegetarian',
    notes: null,
    invitation_sent_at: null,
    rsvp_responded_at: null,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '2',
    event_id: 'event-1',
    email: 'alice@example.com',
    first_name: 'Alice',
    last_name: 'Smith',
    phone: '555-0101',
    rsvp_status: RsvpStatus.PENDING,
    plus_one_allowed: false,
    plus_one_name: null,
    dietary_restrictions: null,
    notes: null,
    invitation_sent_at: null,
    rsvp_responded_at: null,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '3',
    event_id: 'event-1',
    email: 'bob@example.com',
    first_name: 'Bob',
    last_name: 'Johnson',
    phone: '555-0102',
    rsvp_status: RsvpStatus.NOT_ATTENDING,
    plus_one_allowed: true,
    plus_one_name: null,
    dietary_restrictions: 'Gluten-free',
    notes: null,
    invitation_sent_at: null,
    rsvp_responded_at: null,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  }
]

// Helper to create query client
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })

describe('GuestSearchBar', () => {
  it('renders search input', () => {
    render(
      <GuestSearchBar value="" onValueChange={vi.fn()} />
    )

    expect(screen.getByPlaceholderText(/search guests/i)).toBeInTheDocument()
  })

  it('calls onValueChange with debounce', async () => {
    const onValueChange = vi.fn()
    render(
      <GuestSearchBar value="" onValueChange={onValueChange} debounceMs={100} />
    )

    const input = screen.getByPlaceholderText(/search guests/i)
    fireEvent.change(input, { target: { value: 'john' } })

    // Should not call immediately
    expect(onValueChange).not.toHaveBeenCalled()

    // Should call after debounce
    await waitFor(() => {
      expect(onValueChange).toHaveBeenCalledWith('john')
    }, { timeout: 200 })
  })

  it('shows clear button when has value', () => {
    render(
      <GuestSearchBar value="test" onValueChange={vi.fn()} />
    )

    expect(screen.getByLabelText(/clear search/i)).toBeInTheDocument()
  })
})

describe('GuestFilters', () => {
  const defaultFilters = {
    rsvp_statuses: [],
    plus_one_filter: 'all' as const,
    dietary_restrictions: 'all' as const
  }

  it('renders filter button', () => {
    render(
      <GuestFilters filters={defaultFilters} onFiltersChange={vi.fn()} />
    )

    expect(screen.getByText(/filters/i)).toBeInTheDocument()
  })

  it('shows active filter count', () => {
    const activeFilters = {
      rsvp_statuses: [RsvpStatus.ATTENDING, RsvpStatus.PENDING],
      plus_one_filter: 'allowed' as const,
      dietary_restrictions: 'all' as const
    }

    render(
      <GuestFilters filters={activeFilters} onFiltersChange={vi.fn()} />
    )

    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('expands filter controls on button click', () => {
    render(
      <GuestFilters filters={defaultFilters} onFiltersChange={vi.fn()} />
    )

    const filterButton = screen.getByText(/filters/i)
    fireEvent.click(filterButton)

    expect(screen.getByText(/rsvp status/i)).toBeInTheDocument()
    expect(screen.getByText(/plus-one status/i)).toBeInTheDocument()
  })
})

describe('BulkActionsMenu', () => {
  it('does not render when no guests selected', () => {
    const { container } = render(
      <BulkActionsMenu
        selectedGuestIds={[]}
        onDelete={vi.fn()}
        onUpdateStatus={vi.fn()}
        onSendInvitations={vi.fn()}
        onExport={vi.fn()}
      />
    )

    expect(container.firstChild).toBeNull()
  })

  it('renders with selected count', () => {
    render(
      <BulkActionsMenu
        selectedGuestIds={['1', '2']}
        onDelete={vi.fn()}
        onUpdateStatus={vi.fn()}
        onSendInvitations={vi.fn()}
        onExport={vi.fn()}
      />
    )

    expect(screen.getByText('2 Selected')).toBeInTheDocument()
  })

  it('opens dropdown menu on click', () => {
    render(
      <BulkActionsMenu
        selectedGuestIds={['1', '2']}
        onDelete={vi.fn()}
        onUpdateStatus={vi.fn()}
        onSendInvitations={vi.fn()}
        onExport={vi.fn()}
      />
    )

    const button = screen.getByText('2 Selected')
    fireEvent.click(button)

    expect(screen.getByText(/mark as attending/i)).toBeInTheDocument()
    expect(screen.getByText(/send invitations/i)).toBeInTheDocument()
    expect(screen.getByText(/delete selected/i)).toBeInTheDocument()
  })
})

describe('GuestTable', () => {
  const mockProps = {
    guests: mockGuests,
    selectedIds: [],
    onSelectionChange: vi.fn(),
    onUpdateGuest: vi.fn(),
    sortBy: 'first_name' as keyof Guest,
    sortOrder: 'asc' as const,
    onSort: vi.fn()
  }

  it('renders guest table with data', () => {
    render(<GuestTable {...mockProps} />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument()
  })

  it('displays RSVP status badges', () => {
    render(<GuestTable {...mockProps} />)

    expect(screen.getByText('Attending')).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(screen.getByText('Not Attending')).toBeInTheDocument()
  })

  it('shows select all checkbox', () => {
    render(<GuestTable {...mockProps} />)

    const selectAllCheckbox = screen.getByLabelText(/select all guests/i)
    expect(selectAllCheckbox).toBeInTheDocument()
  })

  it('handles individual guest selection', () => {
    const onSelectionChange = vi.fn()
    render(<GuestTable {...mockProps} onSelectionChange={onSelectionChange} />)

    const checkbox = screen.getByLabelText(/select john doe/i)
    fireEvent.click(checkbox)

    expect(onSelectionChange).toHaveBeenCalledWith(['1'])
  })

  it('displays empty state when no guests', () => {
    render(<GuestTable {...mockProps} guests={[]} />)

    expect(screen.getByText('No guests found')).toBeInTheDocument()
  })
})

describe('GuestList Integration', () => {
  const mockProps = {
    eventId: 'event-1',
    guests: mockGuests,
    isLoading: false,
    error: null,
    totalCount: 3,
    onRefresh: vi.fn()
  }

  it('renders guest list with all components', () => {
    const queryClient = createTestQueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <GuestList {...mockProps} />
      </QueryClientProvider>
    )

    expect(screen.getByPlaceholderText(/search guests/i)).toBeInTheDocument()
    expect(screen.getByText(/filters/i)).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('displays loading state', () => {
    const queryClient = createTestQueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <GuestList {...mockProps} isLoading={true} />
      </QueryClientProvider>
    )

    expect(screen.getByText(/loading guests/i)).toBeInTheDocument()
  })

  it('displays error state with retry button', () => {
    const queryClient = createTestQueryClient()
    const onRefresh = vi.fn()

    render(
      <QueryClientProvider client={queryClient}>
        <GuestList {...mockProps} error={new Error('Test error')} onRefresh={onRefresh} />
      </QueryClientProvider>
    )

    expect(screen.getByText(/error loading guests/i)).toBeInTheDocument()

    const retryButton = screen.getByText(/try again/i)
    fireEvent.click(retryButton)

    expect(onRefresh).toHaveBeenCalled()
  })

  it('shows guest count correctly', () => {
    const queryClient = createTestQueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <GuestList {...mockProps} />
      </QueryClientProvider>
    )

    expect(screen.getByText(/showing 3 of 3 guests/i)).toBeInTheDocument()
  })

  it('filters guests by search query', async () => {
    const queryClient = createTestQueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <GuestList {...mockProps} />
      </QueryClientProvider>
    )

    const searchInput = screen.getByPlaceholderText(/search guests/i)
    fireEvent.change(searchInput, { target: { value: 'john' } })

    await waitFor(() => {
      expect(screen.getByText(/showing 1 of 3 guests/i)).toBeInTheDocument()
    })
  })

  it('renders add guest button', () => {
    const queryClient = createTestQueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <GuestList {...mockProps} />
      </QueryClientProvider>
    )

    expect(screen.getByText(/add guest/i)).toBeInTheDocument()
  })
})
