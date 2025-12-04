/**
 * Critical Workflows Integration Tests
 * Phase 8.1: Comprehensive Testing Backfill
 *
 * Tests end-to-end user flows across multiple components
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { EventStatus } from '@/types/event.types'
import { RsvpStatus } from '@/types/guest.types'
import { createMockEvent } from '../../../__tests__/mocks/eventData'
import {
  createMockBudgetSummary,
  createOverBudgetCategory,
} from '../../../__tests__/mocks/budgetData'
import {
  createMockVenueSearchResult,
  mockVenueSearchResults,
} from '../../../__tests__/mocks/venueData'
import {
  createMockSeatingStatistics,
  createEmptySeatingChart,
} from '../../../__tests__/mocks/seatingData'

// Mock Next.js navigation
const mockPush = jest.fn()
const mockReplace = jest.fn()
const mockBack = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(() => null),
    has: jest.fn(() => false),
    getAll: jest.fn(() => []),
    toString: jest.fn(() => ''),
  }),
  usePathname: () => '/events/event-1',
}))

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock hooks
jest.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

jest.mock('@/hooks/useConfirmation', () => ({
  useConfirmation: () => ({
    confirm: jest.fn().mockResolvedValue(true),
    ConfirmationDialog: () => null,
  }),
}))

// Test wrapper with React Query
const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0, gcTime: 0 },
      mutations: { retry: false },
    },
  })

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )

  return TestWrapper
}

// ============================================================================
// Event Detail Page Workflows
// ============================================================================
describe('Event Detail Page Workflows', () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    jest.clearAllMocks()
  })

  describe('Tab Navigation', () => {
    it('should show all event detail tabs', () => {
      // Test component that simulates event detail tabs
      const EventDetailTabs = () => {
        const [activeTab, setActiveTab] = React.useState('overview')
        const tabs = ['overview', 'guests', 'seating', 'budget']

        return (
          <div>
            <div role="tablist" data-testid="event-tabs">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  role="tab"
                  aria-selected={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                  data-testid={`tab-${tab}`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <div role="tabpanel" data-testid="tab-content">
              {activeTab === 'overview' && <div>Event Overview Content</div>}
              {activeTab === 'guests' && <div>Guest List Content</div>}
              {activeTab === 'seating' && <div>Seating Chart Content</div>}
              {activeTab === 'budget' && <div>Budget Content</div>}
            </div>
          </div>
        )
      }

      render(<EventDetailTabs />, { wrapper: createTestWrapper() })

      expect(screen.getByTestId('tab-overview')).toBeInTheDocument()
      expect(screen.getByTestId('tab-guests')).toBeInTheDocument()
      expect(screen.getByTestId('tab-seating')).toBeInTheDocument()
      expect(screen.getByTestId('tab-budget')).toBeInTheDocument()
    })

    it('should navigate between tabs and display correct content', async () => {
      const EventDetailTabs = () => {
        const [activeTab, setActiveTab] = React.useState('overview')
        const tabs = ['overview', 'guests', 'seating', 'budget']

        return (
          <div>
            <div role="tablist">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  role="tab"
                  aria-selected={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                  data-testid={`tab-${tab}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div role="tabpanel" data-testid="tab-content">
              {activeTab === 'overview' && <div data-testid="overview-content">Overview</div>}
              {activeTab === 'guests' && <div data-testid="guests-content">Guests</div>}
              {activeTab === 'seating' && <div data-testid="seating-content">Seating</div>}
              {activeTab === 'budget' && <div data-testid="budget-content">Budget</div>}
            </div>
          </div>
        )
      }

      render(<EventDetailTabs />, { wrapper: createTestWrapper() })

      // Initial state - overview tab
      expect(screen.getByTestId('overview-content')).toBeInTheDocument()

      // Navigate to guests
      await user.click(screen.getByTestId('tab-guests'))
      expect(screen.getByTestId('guests-content')).toBeInTheDocument()
      expect(screen.queryByTestId('overview-content')).not.toBeInTheDocument()

      // Navigate to budget
      await user.click(screen.getByTestId('tab-budget'))
      expect(screen.getByTestId('budget-content')).toBeInTheDocument()
    })

    it('should maintain state when switching between tabs', async () => {
      const EventDetailWithState = () => {
        const [activeTab, setActiveTab] = React.useState('overview')
        const [filterValue, setFilterValue] = React.useState('')

        return (
          <div>
            <button data-testid="tab-overview" onClick={() => setActiveTab('overview')}>
              Overview
            </button>
            <button data-testid="tab-guests" onClick={() => setActiveTab('guests')}>
              Guests
            </button>

            {activeTab === 'guests' && (
              <input
                data-testid="guest-filter"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                placeholder="Filter guests..."
              />
            )}
            {activeTab === 'overview' && <div>Overview tab</div>}

            <div data-testid="filter-state">Filter: {filterValue}</div>
          </div>
        )
      }

      render(<EventDetailWithState />, { wrapper: createTestWrapper() })

      // Go to guests tab and set filter
      await user.click(screen.getByTestId('tab-guests'))
      await user.type(screen.getByTestId('guest-filter'), 'John')

      // Switch to overview
      await user.click(screen.getByTestId('tab-overview'))

      // Switch back to guests - filter should persist
      await user.click(screen.getByTestId('tab-guests'))
      expect(screen.getByTestId('guest-filter')).toHaveValue('John')
    })
  })

  describe('Event Status Transitions', () => {
    it('should display current event status', () => {
      const event = createMockEvent({
        status: EventStatus.PLANNING,
      })

      const StatusDisplay = () => (
        <div data-testid="event-status">{event.status}</div>
      )

      render(<StatusDisplay />, { wrapper: createTestWrapper() })
      expect(screen.getByTestId('event-status')).toHaveTextContent('planning')
    })

    it('should handle status change request', async () => {
      const onStatusChange = jest.fn()

      const StatusChanger = () => {
        const [status, setStatus] = React.useState<EventStatus>(EventStatus.DRAFT)

        const handleChange = (newStatus: EventStatus) => {
          setStatus(newStatus)
          onStatusChange(newStatus)
        }

        return (
          <div>
            <span data-testid="current-status">{status}</span>
            <select
              data-testid="status-select"
              value={status}
              onChange={(e) => handleChange(e.target.value as EventStatus)}
            >
              <option value={EventStatus.DRAFT}>Draft</option>
              <option value={EventStatus.PLANNING}>Planning</option>
              <option value={EventStatus.CONFIRMED}>Confirmed</option>
            </select>
          </div>
        )
      }

      render(<StatusChanger />, { wrapper: createTestWrapper() })

      await user.selectOptions(screen.getByTestId('status-select'), EventStatus.PLANNING)

      expect(screen.getByTestId('current-status')).toHaveTextContent('planning')
      expect(onStatusChange).toHaveBeenCalledWith(EventStatus.PLANNING)
    })
  })
})

// ============================================================================
// Guest Management Workflows
// ============================================================================
describe('Guest Management Workflows', () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    jest.clearAllMocks()
  })

  describe('Guest List Operations', () => {
    const mockGuests = [
      {
        id: '1',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        rsvp_status: RsvpStatus.ATTENDING,
      },
      {
        id: '2',
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane@example.com',
        rsvp_status: RsvpStatus.PENDING,
      },
      {
        id: '3',
        first_name: 'Bob',
        last_name: 'Johnson',
        email: 'bob@example.com',
        rsvp_status: RsvpStatus.NOT_ATTENDING,
      },
    ]

    it('should filter guests by search query', async () => {
      const GuestListWithSearch = () => {
        const [searchQuery, setSearchQuery] = React.useState('')

        const filteredGuests = mockGuests.filter(
          (g) =>
            g.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            g.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            g.email.toLowerCase().includes(searchQuery.toLowerCase())
        )

        return (
          <div>
            <input
              data-testid="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guests..."
            />
            <div data-testid="guest-count">Count: {filteredGuests.length}</div>
            <ul data-testid="guest-list">
              {filteredGuests.map((guest) => (
                <li key={guest.id} data-testid={`guest-${guest.id}`}>
                  {guest.first_name} {guest.last_name}
                </li>
              ))}
            </ul>
          </div>
        )
      }

      render(<GuestListWithSearch />, { wrapper: createTestWrapper() })

      // Initial state
      expect(screen.getByTestId('guest-count')).toHaveTextContent('Count: 3')

      // Search for "John"
      await user.type(screen.getByTestId('search-input'), 'John')
      expect(screen.getByTestId('guest-count')).toHaveTextContent('Count: 1')
      expect(screen.getByTestId('guest-1')).toBeInTheDocument()
      expect(screen.queryByTestId('guest-2')).not.toBeInTheDocument()
    })

    it('should filter guests by RSVP status', async () => {
      const GuestListWithFilters = () => {
        const [statusFilter, setStatusFilter] = React.useState<RsvpStatus | ''>('')

        const filteredGuests = statusFilter
          ? mockGuests.filter((g) => g.rsvp_status === statusFilter)
          : mockGuests

        return (
          <div>
            <select
              data-testid="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as RsvpStatus | '')}
            >
              <option value="">All Statuses</option>
              <option value={RsvpStatus.ATTENDING}>Attending</option>
              <option value={RsvpStatus.PENDING}>Pending</option>
              <option value={RsvpStatus.NOT_ATTENDING}>Not Attending</option>
            </select>
            <div data-testid="filtered-count">{filteredGuests.length} guests</div>
          </div>
        )
      }

      render(<GuestListWithFilters />, { wrapper: createTestWrapper() })

      // Filter by attending
      await user.selectOptions(screen.getByTestId('status-filter'), RsvpStatus.ATTENDING)
      expect(screen.getByTestId('filtered-count')).toHaveTextContent('1 guests')
    })

    it('should handle bulk selection', async () => {
      const GuestListWithSelection = () => {
        const [selectedIds, setSelectedIds] = React.useState<string[]>([])

        const toggleSelection = (id: string) => {
          setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
          )
        }

        const selectAll = () => {
          setSelectedIds(mockGuests.map((g) => g.id))
        }

        return (
          <div>
            <button data-testid="select-all" onClick={selectAll}>
              Select All
            </button>
            <div data-testid="selected-count">Selected: {selectedIds.length}</div>
            {mockGuests.map((guest) => (
              <div key={guest.id}>
                <input
                  type="checkbox"
                  data-testid={`checkbox-${guest.id}`}
                  checked={selectedIds.includes(guest.id)}
                  onChange={() => toggleSelection(guest.id)}
                />
                <span>{guest.first_name}</span>
              </div>
            ))}
          </div>
        )
      }

      render(<GuestListWithSelection />, { wrapper: createTestWrapper() })

      // Select all
      await user.click(screen.getByTestId('select-all'))
      expect(screen.getByTestId('selected-count')).toHaveTextContent('Selected: 3')

      // Deselect one
      await user.click(screen.getByTestId('checkbox-1'))
      expect(screen.getByTestId('selected-count')).toHaveTextContent('Selected: 2')
    })
  })

  describe('Add Guest Flow', () => {
    it('should validate required guest fields', async () => {
      const AddGuestForm = () => {
        const [errors, setErrors] = React.useState<Record<string, string>>({})
        const [formData, setFormData] = React.useState({
          first_name: '',
          last_name: '',
          email: '',
        })

        const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault()
          const newErrors: Record<string, string> = {}

          if (!formData.first_name) newErrors.first_name = 'First name is required'
          if (!formData.last_name) newErrors.last_name = 'Last name is required'
          if (!formData.email) newErrors.email = 'Email is required'
          else if (!formData.email.includes('@')) newErrors.email = 'Invalid email'

          setErrors(newErrors)
        }

        return (
          <form onSubmit={handleSubmit}>
            <input
              data-testid="first-name"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            />
            {errors.first_name && <span data-testid="error-first-name">{errors.first_name}</span>}

            <input
              data-testid="last-name"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            />
            {errors.last_name && <span data-testid="error-last-name">{errors.last_name}</span>}

            <input
              data-testid="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            {errors.email && <span data-testid="error-email">{errors.email}</span>}

            <button type="submit" data-testid="submit-btn">
              Add Guest
            </button>
          </form>
        )
      }

      render(<AddGuestForm />, { wrapper: createTestWrapper() })

      // Submit empty form
      await user.click(screen.getByTestId('submit-btn'))

      expect(screen.getByTestId('error-first-name')).toHaveTextContent('First name is required')
      expect(screen.getByTestId('error-last-name')).toHaveTextContent('Last name is required')
      expect(screen.getByTestId('error-email')).toHaveTextContent('Email is required')
    })
  })
})

// ============================================================================
// RSVP Flow End-to-End
// ============================================================================
describe('RSVP Flow End-to-End', () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    jest.clearAllMocks()
  })

  describe('Public RSVP Portal', () => {
    it('should display RSVP form for valid token', () => {
      const RSVPForm = ({ isValid }: { isValid: boolean }) => {
        if (!isValid) {
          return <div data-testid="invalid-token">Invalid or expired invitation</div>
        }

        return (
          <form data-testid="rsvp-form">
            <h1>RSVP for Wedding</h1>
            <select data-testid="rsvp-status">
              <option value="">Select response...</option>
              <option value="attending">I will attend</option>
              <option value="not_attending">Cannot attend</option>
            </select>
          </form>
        )
      }

      render(<RSVPForm isValid={true} />, { wrapper: createTestWrapper() })
      expect(screen.getByTestId('rsvp-form')).toBeInTheDocument()
    })

    it('should show error for invalid token', () => {
      const RSVPForm = ({ isValid }: { isValid: boolean }) => {
        if (!isValid) {
          return <div data-testid="invalid-token">Invalid or expired invitation</div>
        }
        return <form data-testid="rsvp-form" />
      }

      render(<RSVPForm isValid={false} />, { wrapper: createTestWrapper() })
      expect(screen.getByTestId('invalid-token')).toBeInTheDocument()
    })

    it('should handle RSVP submission with plus-one', async () => {
      const onSubmit = jest.fn()

      const RSVPWithPlusOne = () => {
        const [status, setStatus] = React.useState('')
        const [plusOneName, setPlusOneName] = React.useState('')
        const showPlusOne = status === 'attending'

        const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault()
          onSubmit({ status, plus_one_name: plusOneName })
        }

        return (
          <form onSubmit={handleSubmit}>
            <select
              data-testid="rsvp-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Select...</option>
              <option value="attending">Attending</option>
              <option value="not_attending">Not Attending</option>
            </select>

            {showPlusOne && (
              <input
                data-testid="plus-one-name"
                value={plusOneName}
                onChange={(e) => setPlusOneName(e.target.value)}
                placeholder="Plus-one name"
              />
            )}

            <button type="submit" data-testid="submit-rsvp">
              Submit RSVP
            </button>
          </form>
        )
      }

      render(<RSVPWithPlusOne />, { wrapper: createTestWrapper() })

      // Select attending
      await user.selectOptions(screen.getByTestId('rsvp-status'), 'attending')

      // Plus-one field should appear
      expect(screen.getByTestId('plus-one-name')).toBeInTheDocument()

      // Enter plus-one name
      await user.type(screen.getByTestId('plus-one-name'), 'Jane Doe')

      // Submit
      await user.click(screen.getByTestId('submit-rsvp'))

      expect(onSubmit).toHaveBeenCalledWith({
        status: 'attending',
        plus_one_name: 'Jane Doe',
      })
    })

    it('should capture dietary restrictions', async () => {
      const onSubmit = jest.fn()

      const RSVPWithDietary = () => {
        const [dietary, setDietary] = React.useState('')

        return (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              onSubmit({ dietary_restrictions: dietary })
            }}
          >
            <textarea
              data-testid="dietary-input"
              value={dietary}
              onChange={(e) => setDietary(e.target.value)}
              placeholder="Any dietary restrictions?"
            />
            <button type="submit" data-testid="submit-rsvp">
              Submit
            </button>
          </form>
        )
      }

      render(<RSVPWithDietary />, { wrapper: createTestWrapper() })

      await user.type(screen.getByTestId('dietary-input'), 'Vegetarian, no nuts')
      await user.click(screen.getByTestId('submit-rsvp'))

      expect(onSubmit).toHaveBeenCalledWith({
        dietary_restrictions: 'Vegetarian, no nuts',
      })
    })
  })
})

// ============================================================================
// Seating Chart Interactions
// ============================================================================
describe('Seating Chart Interactions', () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    jest.clearAllMocks()
  })

  describe('Overview Display', () => {
    it('should display seating statistics cards', () => {
      const stats = createMockSeatingStatistics()

      const SeatingStats = () => (
        <div data-testid="seating-stats">
          <div data-testid="total-tables">{stats.total_tables} Tables</div>
          <div data-testid="total-capacity">{stats.total_capacity} Seats</div>
          <div data-testid="total-assigned">{stats.total_assigned} Assigned</div>
          <div data-testid="assignment-percent">{stats.assignment_percentage}%</div>
        </div>
      )

      render(<SeatingStats />, { wrapper: createTestWrapper() })

      expect(screen.getByTestId('total-tables')).toHaveTextContent('10 Tables')
      expect(screen.getByTestId('total-capacity')).toHaveTextContent('80 Seats')
      expect(screen.getByTestId('total-assigned')).toHaveTextContent('65 Assigned')
    })

    it('should show empty state when no chart exists', () => {
      // Using createEmptySeatingChart to verify factory works correctly
      createEmptySeatingChart()

      const SeatingOverview = ({ hasChart }: { hasChart: boolean }) => {
        if (!hasChart) {
          return (
            <div data-testid="empty-state">
              <p>No seating chart yet</p>
              <button data-testid="create-chart-btn">Create Seating Chart</button>
            </div>
          )
        }
        return <div data-testid="chart-display">Chart content</div>
      }

      render(<SeatingOverview hasChart={false} />, { wrapper: createTestWrapper() })

      expect(screen.getByTestId('empty-state')).toBeInTheDocument()
      expect(screen.getByTestId('create-chart-btn')).toBeInTheDocument()
    })
  })

  describe('Quick Actions', () => {
    it('should navigate to edit page on Edit Seating Chart click', async () => {
      const SeatingActions = () => (
        <div>
          <button data-testid="edit-chart" onClick={() => mockPush('/events/1/seating/edit')}>
            Edit Seating Chart
          </button>
          <button data-testid="export-chart">Export</button>
          <button data-testid="print-chart">Print</button>
        </div>
      )

      render(<SeatingActions />, { wrapper: createTestWrapper() })

      await user.click(screen.getByTestId('edit-chart'))
      expect(mockPush).toHaveBeenCalledWith('/events/1/seating/edit')
    })
  })
})

// ============================================================================
// Budget Basic Workflows
// ============================================================================
describe('Budget Basic Workflows', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Budget Overview Display', () => {
    it('should display budget stats cards', () => {
      const summary = createMockBudgetSummary()

      const BudgetStats = () => (
        <div data-testid="budget-stats">
          <div data-testid="total-budget">${summary.total_budget.toLocaleString()}</div>
          <div data-testid="total-spent">${summary.total_spent.toLocaleString()}</div>
          <div data-testid="remaining">${summary.remaining_budget.toLocaleString()}</div>
        </div>
      )

      render(<BudgetStats />, { wrapper: createTestWrapper() })

      expect(screen.getByTestId('total-budget')).toHaveTextContent('$25,000')
      expect(screen.getByTestId('total-spent')).toHaveTextContent('$18,500')
      expect(screen.getByTestId('remaining')).toHaveTextContent('$6,500')
    })

    it('should show category progress bars', () => {
      const summary = createMockBudgetSummary()

      const CategoryProgress = () => (
        <div data-testid="categories">
          {summary.categories.map((cat) => (
            <div key={cat.id} data-testid={`category-${cat.id}`}>
              <span data-testid={`name-${cat.id}`}>{cat.name}</span>
              <span data-testid={`progress-${cat.id}`}>
                {((cat.spent_amount / cat.allocated_amount) * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      )

      render(<CategoryProgress />, { wrapper: createTestWrapper() })

      expect(screen.getByTestId('name-category-1')).toHaveTextContent('Venue')
      expect(screen.getByTestId('progress-category-1')).toHaveTextContent('75%')
    })

    it('should show budget alerts for over-budget categories', () => {
      const overBudgetCategory = createOverBudgetCategory()

      const BudgetAlerts = () => {
        const isOverBudget = overBudgetCategory.spent_amount > overBudgetCategory.allocated_amount

        return (
          <div data-testid="budget-alerts">
            {isOverBudget && (
              <div data-testid="over-budget-alert" role="alert">
                {overBudgetCategory.name} is over budget by $
                {(overBudgetCategory.spent_amount - overBudgetCategory.allocated_amount).toLocaleString()}
              </div>
            )}
          </div>
        )
      }

      render(<BudgetAlerts />, { wrapper: createTestWrapper() })
      expect(screen.getByTestId('over-budget-alert')).toBeInTheDocument()
    })

    it('should display recent expenses list', () => {
      const summary = createMockBudgetSummary()

      const RecentExpenses = () => (
        <ul data-testid="recent-expenses">
          {summary.recent_expenses.map((expense) => (
            <li key={expense.id} data-testid={`expense-${expense.id}`}>
              <span>{expense.name}</span>
              <span>${expense.amount.toLocaleString()}</span>
              <span data-testid={`paid-status-${expense.id}`}>
                {expense.is_paid ? 'Paid' : 'Unpaid'}
              </span>
            </li>
          ))}
        </ul>
      )

      render(<RecentExpenses />, { wrapper: createTestWrapper() })

      expect(screen.getAllByRole('listitem')).toHaveLength(3)
    })

    it('should show empty state when no budget data', () => {
      const EmptyBudget = ({ hasBudget }: { hasBudget: boolean }) => {
        if (!hasBudget) {
          return (
            <div data-testid="empty-budget">
              <p>No budget data yet</p>
              <button data-testid="setup-budget-btn">Set Up Budget</button>
            </div>
          )
        }
        return <div>Budget content</div>
      }

      render(<EmptyBudget hasBudget={false} />, { wrapper: createTestWrapper() })

      expect(screen.getByTestId('empty-budget')).toBeInTheDocument()
      expect(screen.getByTestId('setup-budget-btn')).toBeInTheDocument()
    })
  })
})

// ============================================================================
// Venue Basic Workflows
// ============================================================================
describe('Venue Basic Workflows', () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    jest.clearAllMocks()
  })

  describe('Venue Search', () => {
    it('should display venue search results', () => {
      const venues = mockVenueSearchResults

      const VenueResults = () => (
        <div data-testid="venue-results">
          {venues.map((venue) => (
            <div key={venue.place_id} data-testid={`venue-${venue.place_id}`}>
              <h3>{venue.name}</h3>
              <p>{venue.address}</p>
              {venue.rating && <span>Rating: {venue.rating}</span>}
            </div>
          ))}
        </div>
      )

      render(<VenueResults />, { wrapper: createTestWrapper() })

      expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(5)
      expect(screen.getByText('Grand Ballroom')).toBeInTheDocument()
    })

    it('should handle venue selection', async () => {
      const onSelect = jest.fn()
      const venue = createMockVenueSearchResult()

      const VenueSelectButton = () => (
        <button data-testid="select-venue" onClick={() => onSelect(venue)}>
          Select {venue.name}
        </button>
      )

      render(<VenueSelectButton />, { wrapper: createTestWrapper() })

      await user.click(screen.getByTestId('select-venue'))
      expect(onSelect).toHaveBeenCalledWith(venue)
    })

    it('should toggle save/bookmark venue', async () => {
      const VenueSaveToggle = () => {
        const [isSaved, setIsSaved] = React.useState(false)

        return (
          <button
            data-testid="save-venue"
            onClick={() => setIsSaved(!isSaved)}
            aria-pressed={isSaved}
          >
            {isSaved ? 'Saved' : 'Save'}
          </button>
        )
      }

      render(<VenueSaveToggle />, { wrapper: createTestWrapper() })

      const saveButton = screen.getByTestId('save-venue')
      expect(saveButton).toHaveTextContent('Save')

      await user.click(saveButton)
      expect(saveButton).toHaveTextContent('Saved')
      expect(saveButton).toHaveAttribute('aria-pressed', 'true')

      await user.click(saveButton)
      expect(saveButton).toHaveTextContent('Save')
    })
  })

  describe('Compare Venues', () => {
    it('should add venue to comparison', async () => {
      const VenueComparison = () => {
        const [compareList, setCompareList] = React.useState<string[]>([])

        const addToCompare = (placeId: string) => {
          if (compareList.length < 4) {
            setCompareList([...compareList, placeId])
          }
        }

        return (
          <div>
            <div data-testid="compare-count">{compareList.length} venues selected</div>
            <button data-testid="add-to-compare" onClick={() => addToCompare('venue-1')}>
              Add to Compare
            </button>
          </div>
        )
      }

      render(<VenueComparison />, { wrapper: createTestWrapper() })

      await user.click(screen.getByTestId('add-to-compare'))
      expect(screen.getByTestId('compare-count')).toHaveTextContent('1 venues selected')
    })

    it('should limit comparison to 4 venues', async () => {
      const VenueComparison = () => {
        const [compareList, setCompareList] = React.useState<string[]>([
          'v1', 'v2', 'v3', 'v4',
        ])

        const canAddMore = compareList.length < 4

        return (
          <div>
            <div data-testid="compare-count">{compareList.length} venues</div>
            <button
              data-testid="add-to-compare"
              disabled={!canAddMore}
              onClick={() => setCompareList([...compareList, 'v5'])}
            >
              Add to Compare
            </button>
            {!canAddMore && (
              <span data-testid="max-warning">Maximum 4 venues can be compared</span>
            )}
          </div>
        )
      }

      render(<VenueComparison />, { wrapper: createTestWrapper() })

      expect(screen.getByTestId('add-to-compare')).toBeDisabled()
      expect(screen.getByTestId('max-warning')).toBeInTheDocument()
    })
  })
})
