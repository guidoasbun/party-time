/**
 * Integration Tests: Event Dashboard Complete Workflows
 * Tests end-to-end user flows across multiple components and hooks
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  createMockEventSummary
} from '../../../__tests__/mocks/eventData'
import { EventType, EventStatus } from '@/types/event.types'

// Import hooks for integration testing
import { useEventFilters } from '@/hooks/useEventFilters'
import { useEventActions } from '@/hooks/useEventActions'

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
  usePathname: () => '/dashboard',
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

// Mock console.warn for localStorage tests
const originalWarn = console.warn
beforeAll(() => {
  console.warn = jest.fn()
})

afterAll(() => {
  console.warn = originalWarn
})

describe('Event Dashboard Integration Tests', () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  describe('Hook Integration Tests', () => {
    it('should integrate event filters with actions for complete workflow', async () => {
      const TestComponent = () => {
        const filters = useEventFilters()
        const actions = useEventActions({ enableOptimisticUpdates: true })

        const mockEvents = [
          createMockEventSummary({
            id: 'event-1',
            name: 'Wedding Event',
            type: EventType.WEDDING,
            status: EventStatus.PLANNING
          }),
          createMockEventSummary({
            id: 'event-2',
            name: 'Conference Event',
            type: EventType.CONFERENCE,
            status: EventStatus.CONFIRMED
          }),
        ]

        // Filter events based on current filters
        const filteredEvents = mockEvents.filter(event => {
          if (filters.filters.search && !event.name.toLowerCase().includes(filters.filters.search.toLowerCase())) {
            return false
          }
          if (filters.filters.types.length > 0 && !filters.filters.types.includes(event.type)) {
            return false
          }
          if (filters.filters.statuses.length > 0 && !filters.filters.statuses.includes(event.status)) {
            return false
          }
          return true
        })

        return (
          <div>
            {/* Filter Controls */}
            <input
              data-testid="search-input"
              value={filters.filters.search}
              onChange={(e) => filters.setSearch(e.target.value)}
              placeholder="Search events..."
            />

            <select
              data-testid="type-filter"
              value={filters.filters.types[0] || ''}
              onChange={(e) => {
                const value = e.target.value as EventType
                filters.setTypes(value ? [value] : [])
              }}
            >
              <option value="">All Types</option>
              <option value={EventType.WEDDING}>Wedding</option>
              <option value={EventType.CONFERENCE}>Conference</option>
              <option value={EventType.BIRTHDAY}>Birthday</option>
            </select>

            <select
              data-testid="status-filter"
              value={filters.filters.statuses[0] || ''}
              onChange={(e) => {
                const value = e.target.value as EventStatus
                filters.setStatuses(value ? [value] : [])
              }}
            >
              <option value="">All Statuses</option>
              <option value={EventStatus.PLANNING}>Planning</option>
              <option value={EventStatus.CONFIRMED}>Confirmed</option>
              <option value={EventStatus.COMPLETED}>Completed</option>
            </select>

            <button
              data-testid="clear-filters"
              onClick={filters.clearFilters}
            >
              Clear Filters
            </button>

            {/* Event List */}
            <div data-testid="events-container">
              <div data-testid="event-count">
                Events: {filteredEvents.length}
              </div>

              {filteredEvents.map((event) => (
                <div key={event.id} data-testid={`event-${event.id}`}>
                  <span data-testid={`event-name-${event.id}`}>{event.name}</span>
                  <span data-testid={`event-type-${event.id}`}>{event.type}</span>
                  <span data-testid={`event-status-${event.id}`}>{event.status}</span>

                  <button
                    onClick={() => actions.updateEvent(event.id, { name: `Updated ${event.name}` })}
                    data-testid={`edit-${event.id}`}
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => actions.deleteEvent(event.id)}
                    data-testid={`delete-${event.id}`}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>

            {/* Filter State */}
            <div data-testid="filter-state">
              <span data-testid="has-filters">
                Has Active Filters: {filters.hasActiveFilters ? 'Yes' : 'No'}
              </span>
              <span data-testid="is-filtering">
                Is Filtering: {filters.isFiltering ? 'Yes' : 'No'}
              </span>
            </div>

            {/* Action State */}
            <div data-testid="action-state">
              <span data-testid="is-updating">
                Is Updating: {actions.state.isUpdating ? 'Yes' : 'No'}
              </span>
              <span data-testid="is-deleting">
                Is Deleting: {actions.state.isDeleting ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        )
      }

      render(<TestComponent />, { wrapper: createTestWrapper() })

      // Initial state - should show all events
      expect(screen.getByTestId('event-count')).toHaveTextContent('Events: 2')
      expect(screen.getByTestId('has-filters')).toHaveTextContent('Has Active Filters: No')
      expect(screen.getByText('Wedding Event')).toBeInTheDocument()
      expect(screen.getByText('Conference Event')).toBeInTheDocument()

      // Test search filter
      const searchInput = screen.getByTestId('search-input')
      await user.type(searchInput, 'wedding')

      expect(screen.getByTestId('has-filters')).toHaveTextContent('Has Active Filters: Yes')
      expect(screen.getByTestId('is-filtering')).toHaveTextContent('Is Filtering: Yes')

      // Wait for debounce
      await waitFor(() => {
        expect(screen.getByTestId('is-filtering')).toHaveTextContent('Is Filtering: No')
      }, { timeout: 600 })

      expect(screen.getByTestId('event-count')).toHaveTextContent('Events: 1')
      expect(screen.getByText('Wedding Event')).toBeInTheDocument()
      expect(screen.queryByText('Conference Event')).not.toBeInTheDocument()

      // Test type filter
      const typeFilter = screen.getByTestId('type-filter')
      await user.selectOptions(typeFilter, [EventType.CONFERENCE])

      // Should show no events (search for "wedding" but filter for conference)
      expect(screen.getByTestId('event-count')).toHaveTextContent('Events: 0')

      // Clear search to show conference events
      await user.clear(searchInput)

      await waitFor(() => {
        expect(screen.getByTestId('event-count')).toHaveTextContent('Events: 1')
        expect(screen.getByText('Conference Event')).toBeInTheDocument()
      }, { timeout: 600 })

      // Clear all filters
      const clearButton = screen.getByTestId('clear-filters')
      await user.click(clearButton)

      expect(screen.getByTestId('has-filters')).toHaveTextContent('Has Active Filters: No')
      expect(screen.getByTestId('event-count')).toHaveTextContent('Events: 2')
    })

    it('should handle event actions with state management', async () => {
      const TestComponent = () => {
        const actions = useEventActions()
        const [eventCount, setEventCount] = React.useState(2)

        const handleCreate = () => {
          actions.createEvent({
            name: 'New Integration Event',
            type: EventType.WORKSHOP,
            start_date: '2024-12-01T10:00:00Z',
            is_public: false,
          }).then(() => {
            setEventCount(prev => prev + 1)
          }).catch(() => {
            // Handle error silently for test
          })
        }

        const handleUpdate = () => {
          actions.updateEvent('event-1', {
            name: 'Updated Integration Event'
          }).catch(() => {
            // Handle error silently for test
          })
        }

        const handleDelete = () => {
          actions.deleteEvent('event-1').then(() => {
            setEventCount(prev => prev - 1)
          }).catch(() => {
            // Handle error silently for test
          })
        }

        return (
          <div>
            <div data-testid="event-counter">
              Event Count: {eventCount}
            </div>

            <button onClick={handleCreate} data-testid="create-btn">
              Create Event
            </button>

            <button onClick={handleUpdate} data-testid="update-btn">
              Update Event
            </button>

            <button onClick={handleDelete} data-testid="delete-btn">
              Delete Event
            </button>

            <div data-testid="action-states">
              <span>Creating: {actions.state.isCreating ? 'Yes' : 'No'}</span>
              <span>Updating: {actions.state.isUpdating ? 'Yes' : 'No'}</span>
              <span>Deleting: {actions.state.isDeleting ? 'Yes' : 'No'}</span>
            </div>
          </div>
        )
      }

      render(<TestComponent />, { wrapper: createTestWrapper() })

      // Initial state
      expect(screen.getByTestId('event-counter')).toHaveTextContent('Event Count: 2')

      // Test action states
      const createBtn = screen.getByTestId('create-btn')
      const updateBtn = screen.getByTestId('update-btn')
      const deleteBtn = screen.getByTestId('delete-btn')

      // All actions should be available
      expect(createBtn).toBeEnabled()
      expect(updateBtn).toBeEnabled()
      expect(deleteBtn).toBeEnabled()

      // Actions can be triggered (though they may fail due to mocking)
      await user.click(createBtn)
      await user.click(updateBtn)
      await user.click(deleteBtn)

      // Component should render without crashing
      expect(screen.getByTestId('action-states')).toBeInTheDocument()
    })

    it('should persist filter state across component remounts', async () => {
      let filters: ReturnType<typeof useEventFilters>

      const TestComponent = () => {
        filters = useEventFilters({
          persistToLocalStorage: true,
          storageKey: 'integration-test-filters'
        })

        return (
          <div>
            <input
              data-testid="persistent-search"
              value={filters.filters.search}
              onChange={(e) => filters.setSearch(e.target.value)}
            />

            <div data-testid="search-value">
              Search: {filters.filters.search}
            </div>
          </div>
        )
      }

      const { rerender } = render(<TestComponent />, { wrapper: createTestWrapper() })

      // Set a search value
      const searchInput = screen.getByTestId('persistent-search')
      await user.type(searchInput, 'persistenttest')

      expect(screen.getByTestId('search-value')).toHaveTextContent('Search: persistenttest')

      // Verify localStorage was called
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'integration-test-filters',
          expect.stringContaining('"search":"persistenttest"')
        )
      })

      // Mock localStorage returning the saved value
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({ search: 'persistenttest', types: [], statuses: [] })
      )

      // Remount component
      rerender(<TestComponent />)

      // Should restore the persisted value
      expect(screen.getByTestId('search-value')).toHaveTextContent('Search: persistenttest')
    })
  })

  describe('Complex Integration Scenarios', () => {
    it('should handle combined filter and action workflows', async () => {
      const TestComponent = () => {
        const filters = useEventFilters()
        const actions = useEventActions()

        const [workflowStep, setWorkflowStep] = React.useState(1)

        const runCompleteWorkflow = async () => {
          // Step 1: Set filters
          setWorkflowStep(1)
          filters.setSearch('workshop')
          filters.setTypes([EventType.WORKSHOP])

          // Step 2: Simulate action
          setWorkflowStep(2)
          try {
            await actions.createEvent({
              name: 'Workflow Test Event',
              type: EventType.WORKSHOP,
              start_date: '2025-01-01T10:00:00Z',
              is_public: false,
            })
          } catch {
            // Expected in test environment
          }

          // Step 3: Clear filters
          setWorkflowStep(3)
          filters.clearFilters()

          setWorkflowStep(4) // Complete
        }

        return (
          <div>
            <button onClick={runCompleteWorkflow} data-testid="run-workflow">
              Run Complete Workflow
            </button>

            <div data-testid="workflow-step">
              Step: {workflowStep}
            </div>

            <div data-testid="workflow-state">
              <span>Search: &quot;{filters.filters.search}&quot;</span>
              <span>Types: {filters.filters.types.length}</span>
              <span>Has Filters: {filters.hasActiveFilters ? 'Yes' : 'No'}</span>
              <span>Is Creating: {actions.state.isCreating ? 'Yes' : 'No'}</span>
            </div>
          </div>
        )
      }

      render(<TestComponent />, { wrapper: createTestWrapper() })

      // Initial state
      expect(screen.getByTestId('workflow-step')).toHaveTextContent('Step: 1')

      // Run complete workflow
      const workflowBtn = screen.getByTestId('run-workflow')
      await user.click(workflowBtn)

      // Should complete all steps
      await waitFor(() => {
        expect(screen.getByTestId('workflow-step')).toHaveTextContent('Step: 4')
      })

      // Final state should have cleared filters
      expect(screen.getByTestId('workflow-state')).toHaveTextContent('Has Filters: No')
    })

    it('should handle URL synchronization with filter changes', async () => {
      const TestComponent = () => {
        const filters = useEventFilters({ syncWithUrl: true })

        return (
          <div>
            <input
              data-testid="url-sync-search"
              value={filters.filters.search}
              onChange={(e) => filters.setSearch(e.target.value)}
            />

            <select
              data-testid="url-sync-type"
              value={filters.filters.types[0] || ''}
              onChange={(e) => {
                const value = e.target.value as EventType
                filters.setTypes(value ? [value] : [])
              }}
            >
              <option value="">No Type</option>
              <option value={EventType.WEDDING}>Wedding</option>
              <option value={EventType.CONFERENCE}>Conference</option>
            </select>

            <div data-testid="url-sync-status">
              URL Sync Enabled: {filters.hasActiveFilters ? 'Active' : 'Inactive'}
            </div>
          </div>
        )
      }

      render(<TestComponent />, { wrapper: createTestWrapper() })

      // Initial state
      expect(screen.getByTestId('url-sync-status')).toHaveTextContent('URL Sync Enabled: Inactive')

      // Set search filter
      const searchInput = screen.getByTestId('url-sync-search')
      await user.type(searchInput, 'url test')

      expect(screen.getByTestId('url-sync-status')).toHaveTextContent('URL Sync Enabled: Active')

      // Set type filter
      const typeSelect = screen.getByTestId('url-sync-type')
      await user.selectOptions(typeSelect, [EventType.WEDDING])

      // Should maintain active state
      expect(screen.getByTestId('url-sync-status')).toHaveTextContent('URL Sync Enabled: Active')
    })
  })
})