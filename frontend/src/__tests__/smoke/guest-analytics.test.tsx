/**
 * Smoke tests for Guest Analytics Dashboard components
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GuestOverview } from '@/components/guests/GuestOverview'
import { RSVPChart } from '@/components/guests/RSVPChart'
import { ExportGuests } from '@/components/guests/ExportGuests'
import { RsvpStatus, Guest, UUID } from '@/types'
import * as guestsService from '@/lib/api/services/guests.service'

// Mock the services
jest.mock('@/lib/api/services/guests.service', () => ({
  guestsService: {
    getGuestStats: jest.fn(),
    getDietaryRestrictions: jest.fn()
  }
}))

// Mock guests data
const mockGuests: Guest[] = [
  {
    id: '1' as UUID,
    event_id: 'event-1' as UUID,
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    rsvp_status: RsvpStatus.ATTENDING,
    plus_one_allowed: true,
    plus_one_name: 'Jane Doe',
    dietary_restrictions: 'Vegetarian',
    notes: 'Allergic to nuts',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '2' as UUID,
    event_id: 'event-1' as UUID,
    first_name: 'Alice',
    last_name: 'Smith',
    email: 'alice@example.com',
    rsvp_status: RsvpStatus.PENDING,
    plus_one_allowed: false,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '3' as UUID,
    event_id: 'event-1' as UUID,
    first_name: 'Bob',
    last_name: 'Johnson',
    email: 'bob@example.com',
    rsvp_status: RsvpStatus.NOT_ATTENDING,
    plus_one_allowed: true,
    dietary_restrictions: 'Gluten-free',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '4' as UUID,
    event_id: 'event-1' as UUID,
    first_name: 'Carol',
    last_name: 'Williams',
    email: 'carol@example.com',
    rsvp_status: RsvpStatus.MAYBE,
    plus_one_allowed: false,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  }
]

const mockStats = {
  total_guests: 4,
  attending_guests: 1,
  not_attending_guests: 1,
  pending_guests: 1,
  maybe_guests: 1,
  plus_ones_allowed: 2,
  plus_ones_confirmed: 1,
  dietary_restrictions_count: 2,
  response_rate: 75,
  invitation_sent_count: 4
}

const mockDietaryGuests = mockGuests.filter(g => g.dietary_restrictions)

// Create query client for testing
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false }
    }
  })

// Wrapper component with QueryClient
function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = createTestQueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('RSVPChart Component', () => {
  it('renders chart with correct data', () => {
    render(
      <RSVPChart
        attending={10}
        notAttending={5}
        maybe={3}
        pending={2}
      />
    )

    expect(screen.getByText('20')).toBeInTheDocument() // Total
    expect(screen.getByText('Attending')).toBeInTheDocument()
    expect(screen.getByText('Not Attending')).toBeInTheDocument()
    expect(screen.getByText('Maybe')).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()
  })

  it('displays percentages correctly', () => {
    render(
      <RSVPChart
        attending={10}
        notAttending={5}
        maybe={3}
        pending={2}
      />
    )

    expect(screen.getByText('(50.0%)')).toBeInTheDocument() // 10/20 = 50%
  })

  it('shows empty state when no guests', () => {
    render(
      <RSVPChart
        attending={0}
        notAttending={0}
        maybe={0}
        pending={0}
      />
    )

    expect(screen.getByText('No guest data available')).toBeInTheDocument()
  })

  it('filters out zero-count statuses', () => {
    render(
      <RSVPChart
        attending={10}
        notAttending={0}
        maybe={0}
        pending={5}
      />
    )

    expect(screen.getByText('Attending')).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(screen.queryByText('Not Attending')).not.toBeInTheDocument()
    expect(screen.queryByText('Maybe')).not.toBeInTheDocument()
  })

  it('includes accessibility text for screen readers', () => {
    const { container } = render(
      <RSVPChart
        attending={10}
        notAttending={5}
        maybe={3}
        pending={2}
      />
    )

    const srOnly = container.querySelector('.sr-only')
    expect(srOnly).toBeInTheDocument()
    expect(srOnly?.textContent).toContain('RSVP Status breakdown')
  })
})

describe('ExportGuests Component', () => {
  it('renders export buttons', () => {
    render(
      <ExportGuests
        guests={mockGuests}
        eventId="event-1" as UUID
        eventName="Test Event"
      />
    )

    expect(screen.getByText('Export CSV')).toBeInTheDocument()
    expect(screen.getByText('Print List')).toBeInTheDocument()
  })

  it('disables buttons when no guests', () => {
    render(
      <ExportGuests
        guests={[]}
        eventId="event-1" as UUID
      />
    )

    const exportButton = screen.getByText('Export CSV').closest('button')
    const printButton = screen.getByText('Print List').closest('button')

    expect(exportButton).toBeDisabled()
    expect(printButton).toBeDisabled()
  })

  it('toggles options panel', () => {
    render(
      <ExportGuests
        guests={mockGuests}
        eventId="event-1" as UUID
      />
    )

    const optionsButton = screen.getByText('Show Options')
    fireEvent.click(optionsButton)

    expect(screen.getByText('Export Options')).toBeInTheDocument()
    expect(screen.getByText('Filter by RSVP Status')).toBeInTheDocument()
  })

  it('displays filtered count', () => {
    render(
      <ExportGuests
        guests={mockGuests}
        eventId="event-1" as UUID
      />
    )

    fireEvent.click(screen.getByText('Show Options'))

    expect(screen.getByText('4 of 4 guests will be exported')).toBeInTheDocument()
  })

  it('filters by RSVP status', () => {
    render(
      <ExportGuests
        guests={mockGuests}
        eventId="event-1" as UUID
      />
    )

    fireEvent.click(screen.getByText('Show Options'))

    const statusSelect = screen.getByLabelText('Filter by RSVP Status')
    fireEvent.change(statusSelect, { target: { value: RsvpStatus.ATTENDING } })

    expect(screen.getByText('1 of 4 guests will be exported')).toBeInTheDocument()
  })

  it('filters by dietary restrictions only', () => {
    render(
      <ExportGuests
        guests={mockGuests}
        eventId="event-1" as UUID
      />
    )

    fireEvent.click(screen.getByText('Show Options'))

    const dietaryCheckbox = screen.getByLabelText('Only guests with dietary restrictions')
    fireEvent.click(dietaryCheckbox)

    expect(screen.getByText('2 of 4 guests will be exported')).toBeInTheDocument()
  })

  it('allows field selection', () => {
    render(
      <ExportGuests
        guests={mockGuests}
        eventId="event-1" as UUID
      />
    )

    fireEvent.click(screen.getByText('Show Options'))

    expect(screen.getByLabelText('Name')).toBeChecked()
    expect(screen.getByLabelText('Email')).toBeChecked()
    expect(screen.getByLabelText('Phone')).toBeChecked()
    expect(screen.getByLabelText('RSVP Status')).toBeChecked()
  })

  it('generates CSV with correct data', () => {
    // Mock URL.createObjectURL
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url')
    global.URL.revokeObjectURL = jest.fn()

    // Mock document.createElement and appendChild
    const mockLink = {
      href: '',
      download: '',
      click: jest.fn()
    }
    jest.spyOn(document, 'createElement').mockReturnValue(mockLink as unknown as HTMLElement)
    jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as unknown as Node)
    jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as unknown as Node)

    render(
      <ExportGuests
        guests={mockGuests}
        eventId="event-1" as UUID
        eventName="Test Event"
      />
    )

    const exportButton = screen.getByText('Export CSV')
    fireEvent.click(exportButton)

    expect(mockLink.click).toHaveBeenCalled()
    expect(mockLink.download).toContain('Test Event-guests')
  })
})

describe('GuestOverview Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Setup mocks
    jest.spyOn(guestsService, 'guestsService', 'get').mockReturnValue({
      getGuestStats: jest.fn().mockResolvedValue(mockStats),
      getDietaryRestrictions: jest.fn().mockResolvedValue(mockDietaryGuests)
    } as never)
  })

  it('renders all statistics cards', async () => {
    render(
      <TestWrapper>
        <GuestOverview
          eventId="event-1" as UUID
          eventName="Test Event"
          guests={mockGuests}
        />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Total Guests')).toBeInTheDocument()
      expect(screen.getByText('Attending')).toBeInTheDocument()
      expect(screen.getByText('Pending')).toBeInTheDocument()
      expect(screen.getByText('Declined')).toBeInTheDocument()
    })
  })

  it('displays correct guest counts', async () => {
    render(
      <TestWrapper>
        <GuestOverview
          eventId="event-1" as UUID
          guests={mockGuests}
        />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('4')).toBeInTheDocument() // Total
      expect(screen.getByText('1')).toBeInTheDocument() // Attending
    })
  })

  it('shows response rate', async () => {
    render(
      <TestWrapper>
        <GuestOverview
          eventId="event-1" as UUID
          guests={mockGuests}
        />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Response Rate')).toBeInTheDocument()
      expect(screen.getByText('75%')).toBeInTheDocument()
    })
  })

  it('displays plus ones statistics', async () => {
    render(
      <TestWrapper>
        <GuestOverview
          eventId="event-1" as UUID
          guests={mockGuests}
        />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Plus Ones')).toBeInTheDocument()
      expect(screen.getByText('1/2')).toBeInTheDocument()
    })
  })

  it('shows dietary restrictions count', async () => {
    render(
      <TestWrapper>
        <GuestOverview
          eventId="event-1" as UUID
          guests={mockGuests}
        />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Dietary Restrictions')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
    })
  })

  it('renders RSVP breakdown chart', async () => {
    render(
      <TestWrapper>
        <GuestOverview
          eventId="event-1" as UUID
          guests={mockGuests}
        />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('RSVP Breakdown')).toBeInTheDocument()
    })
  })

  it('lists dietary restrictions details', async () => {
    render(
      <TestWrapper>
        <GuestOverview
          eventId="event-1" as UUID
          guests={mockGuests}
        />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Vegetarian')).toBeInTheDocument()
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument()
      expect(screen.getByText('Gluten-free')).toBeInTheDocument()
    })
  })

  it('shows empty state for dietary restrictions', async () => {
    jest.spyOn(guestsService, 'guestsService', 'get').mockReturnValue({
      getGuestStats: jest.fn().mockResolvedValue(mockStats),
      getDietaryRestrictions: jest.fn().mockResolvedValue([])
    } as never)

    render(
      <TestWrapper>
        <GuestOverview
          eventId="event-1" as UUID
          guests={mockGuests}
        />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('No dietary restrictions reported')).toBeInTheDocument()
    })
  })

  it('includes export functionality', async () => {
    render(
      <TestWrapper>
        <GuestOverview
          eventId="event-1" as UUID
          eventName="Test Event"
          guests={mockGuests}
        />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Export Guest List')).toBeInTheDocument()
      expect(screen.getByText('Export CSV')).toBeInTheDocument()
    })
  })

  it('shows loading state', () => {
    jest.spyOn(guestsService, 'guestsService', 'get').mockReturnValue({
      getGuestStats: jest.fn().mockImplementation(() => new Promise(() => {})),
      getDietaryRestrictions: jest.fn().mockImplementation(() => new Promise(() => {}))
    } as never)

    render(
      <TestWrapper>
        <GuestOverview
          eventId="event-1" as UUID
          guests={mockGuests}
        />
      </TestWrapper>
    )

    const loadingElements = document.querySelectorAll('.animate-pulse')
    expect(loadingElements.length).toBeGreaterThan(0)
  })

  it('handles error state gracefully', async () => {
    jest.spyOn(guestsService, 'guestsService', 'get').mockReturnValue({
      getGuestStats: jest.fn().mockRejectedValue(new Error('Failed to fetch stats')),
      getDietaryRestrictions: jest.fn().mockResolvedValue([])
    } as never)

    render(
      <TestWrapper>
        <GuestOverview
          eventId="event-1" as UUID
          guests={mockGuests}
        />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Failed to load guest statistics')).toBeInTheDocument()
    })
  })
})
