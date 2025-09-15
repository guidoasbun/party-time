'use client'

import { useState } from 'react'
import { EventList } from '@/components/events/EventList'
import { EventSummary, EventType, EventStatus } from '@/types/event.types'
import { Button } from '@/components/ui/Button'
import { RefreshCw, Settings, Plus } from 'lucide-react'

// Mock data for testing with fixed dates to prevent hydration issues
const createMockEvent = (id: string, overrides: Partial<EventSummary> = {}): EventSummary => ({
  id,
  name: `Event ${id}`,
  type: EventType.BIRTHDAY,
  status: EventStatus.PLANNING,
  start_date: '2025-10-15T14:30:00.000Z', // Fixed date
  venue_name: `Venue ${id}`,
  guest_count: 50,
  confirmed_guests: 35,
  budget_total: 25000,
  total_expenses: 15000,
  planner_name: 'John Doe',
  created_at: '2024-01-01T00:00:00.000Z',
  ...overrides
})

const mockEvents: EventSummary[] = [
  createMockEvent('1', {
    name: 'Sarah\'s 30th Birthday Party',
    type: EventType.BIRTHDAY,
    status: EventStatus.CONFIRMED,
    start_date: '2025-10-03T19:30:00.000Z',
    venue_name: 'Downtown Community Center',
    guest_count: 45,
    confirmed_guests: 32,
    budget_total: 15000,
    total_expenses: 8500
  }),
  createMockEvent('2', {
    name: 'Annual Company Retreat',
    type: EventType.CORPORATE,
    status: EventStatus.PLANNING,
    start_date: '2025-11-15T09:00:00.000Z',
    venue_name: 'Mountain Resort & Spa',
    guest_count: 120,
    confirmed_guests: 89,
    budget_total: 75000,
    total_expenses: 45000
  }),
  createMockEvent('3', {
    name: 'Emma & James Wedding',
    type: EventType.WEDDING,
    status: EventStatus.CONFIRMED,
    start_date: '2025-09-20T16:00:00.000Z',
    venue_name: 'Garden Valley Estate',
    guest_count: 180,
    confirmed_guests: 165,
    budget_total: 120000,
    total_expenses: 95000
  }),
  createMockEvent('4', {
    name: 'Tech Conference 2024',
    type: EventType.CONFERENCE,
    status: EventStatus.IN_PROGRESS,
    start_date: '2025-12-05T08:30:00.000Z',
    venue_name: 'Convention Center',
    guest_count: 500,
    confirmed_guests: 423,
    budget_total: 200000,
    total_expenses: 180000
  }),
  createMockEvent('5', {
    name: 'Graduation Celebration',
    type: EventType.GRADUATION,
    status: EventStatus.DRAFT,
    start_date: '2025-05-18T15:00:00.000Z',
    venue_name: 'University Hall',
    guest_count: 80,
    confirmed_guests: 12,
    budget_total: 25000,
    total_expenses: 3000
  }),
  createMockEvent('6', {
    name: 'Baby Shower for Lisa',
    type: EventType.BABY_SHOWER,
    status: EventStatus.COMPLETED,
    start_date: '2025-08-22T14:00:00.000Z',
    venue_name: 'Rose Garden Café',
    guest_count: 25,
    confirmed_guests: 23,
    budget_total: 8000,
    total_expenses: 7200
  })
]

// Demo scenarios
type DemoScenario = 'normal' | 'loading' | 'empty' | 'error' | 'large-dataset'

export default function EventListDemoPage() {
  const [scenario, setScenario] = useState<DemoScenario>('normal')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [enableInfiniteScroll, setEnableInfiniteScroll] = useState(false)
  const [enableBulkSelection, setEnableBulkSelection] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Generate large dataset for testing
  const generateLargeDataset = () => {
    return Array.from({ length: 50 }, (_, i) =>
      createMockEvent(`large-${i}`, {
        name: `Event ${i + 1}`,
        type: Object.values(EventType)[i % Object.values(EventType).length],
        status: Object.values(EventStatus)[i % Object.values(EventStatus).length]
      })
    )
  }

  const getEventsForScenario = () => {
    switch (scenario) {
      case 'loading':
        return []
      case 'empty':
        return []
      case 'error':
        return []
      case 'large-dataset':
        return generateLargeDataset()
      default:
        return mockEvents
    }
  }

  const getPaginationInfo = () => {
    if (enableInfiniteScroll) return undefined

    const events = getEventsForScenario()
    const limit = 6
    const total = events.length
    const totalPages = Math.ceil(total / limit)

    return {
      page: currentPage,
      limit,
      total,
      has_next: currentPage < totalPages,
      has_previous: currentPage > 1
    }
  }

  const getCurrentPageEvents = () => {
    if (enableInfiniteScroll) return getEventsForScenario()

    const events = getEventsForScenario()
    const limit = 6
    const startIndex = (currentPage - 1) * limit
    return events.slice(startIndex, startIndex + limit)
  }

  const handleLoadMore = () => {
    setIsLoadingMore(true)
    setTimeout(() => {
      setIsLoadingMore(false)
    }, 1000)
  }

  const handleEdit = (eventId: string) => {
    console.log('Edit event:', eventId)
    alert(`Edit event: ${eventId}`)
  }

  const handleDelete = (eventId: string) => {
    console.log('Delete event:', eventId)
    alert(`Delete event: ${eventId}`)
  }

  const handleView = (eventId: string) => {
    console.log('View event:', eventId)
    alert(`View event: ${eventId}`)
  }

  const handleBulkDelete = (eventIds: string[]) => {
    console.log('Bulk delete events:', eventIds)
    alert(`Bulk delete ${eventIds.length} events: ${eventIds.join(', ')}`)
  }

  const handleCreateEvent = () => {
    console.log('Create new event')
    alert('Create new event clicked!')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            EventList Component Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test all features of the EventList component including different view modes, loading states, and interactions.
          </p>
        </div>

        {/* Demo Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Demo Controls
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Scenario Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Test Scenario
              </label>
              <select
                value={scenario}
                onChange={(e) => setScenario(e.target.value as DemoScenario)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="normal">Normal (6 events)</option>
                <option value="loading">Loading State</option>
                <option value="empty">Empty State</option>
                <option value="error">Error State</option>
                <option value="large-dataset">Large Dataset (50 events)</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                View Mode
              </label>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  List
                </Button>
              </div>
            </div>

            {/* Feature Toggles */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Features
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={enableInfiniteScroll}
                    onChange={(e) => setEnableInfiniteScroll(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Infinite Scroll</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={enableBulkSelection}
                    onChange={(e) => setEnableBulkSelection(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Bulk Selection</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Actions
              </label>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreateEvent}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* EventList Component */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <EventList
            events={getCurrentPageEvents()}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            onBulkDelete={enableBulkSelection ? handleBulkDelete : undefined}
            onCreateEvent={handleCreateEvent}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            isLoading={scenario === 'loading'}
            error={scenario === 'error' ? 'Failed to load events. Please try again.' : null}
            pagination={getPaginationInfo()}
            onPageChange={setCurrentPage}
            enableInfiniteScroll={enableInfiniteScroll}
            onLoadMore={handleLoadMore}
            hasMore={scenario === 'large-dataset' && enableInfiniteScroll}
            isLoadingMore={isLoadingMore}
            enableBulkSelection={enableBulkSelection}
            emptyStateTitle={scenario === 'empty' ? 'No events found' : undefined}
            emptyStateMessage={scenario === 'empty' ? 'Try adjusting your filters or create a new event to get started.' : undefined}
          />
        </div>

        {/* Debug Info */}
        <div className="mt-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Debug Info</h3>
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <p>Current Scenario: <strong>{scenario}</strong></p>
            <p>View Mode: <strong>{viewMode}</strong></p>
            <p>Infinite Scroll: <strong>{enableInfiniteScroll ? 'Enabled' : 'Disabled'}</strong></p>
            <p>Bulk Selection: <strong>{enableBulkSelection ? 'Enabled' : 'Disabled'}</strong></p>
            <p>Current Page: <strong>{currentPage}</strong></p>
            <p>Total Events: <strong>{getEventsForScenario().length}</strong></p>
            <p>Displayed Events: <strong>{getCurrentPageEvents().length}</strong></p>
          </div>
        </div>
      </div>
    </div>
  )
}