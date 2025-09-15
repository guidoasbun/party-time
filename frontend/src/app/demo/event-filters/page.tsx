'use client'

import * as React from 'react'
import { EventType, EventStatus, EventFilters as EventFiltersType, EventSummary } from '@/types/event.types'
import { EventFilters } from '@/components/events/EventFilters'
import { EventList } from '@/components/events/EventList'

// Sample events data for testing
const sampleEvents: EventSummary[] = [
  {
    id: '1',
    name: 'Sarah & John\'s Wedding',
    type: EventType.WEDDING,
    status: EventStatus.PLANNING,
    start_date: '2024-06-15T16:00:00Z',
    venue_name: 'Grand Ballroom',
    guest_count: 150,
    confirmed_guests: 120,
    budget_total: 25000,
    total_expenses: 18500,
    planner_name: 'Sarah Johnson',
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Emily\'s 30th Birthday Party',
    type: EventType.BIRTHDAY,
    status: EventStatus.CONFIRMED,
    start_date: '2024-03-22T19:00:00Z',
    venue_name: 'Rooftop Terrace',
    guest_count: 45,
    confirmed_guests: 42,
    budget_total: 3500,
    total_expenses: 2800,
    planner_name: 'Emily Davis',
    created_at: '2024-02-01T14:30:00Z'
  },
  {
    id: '3',
    name: 'Tech Conference 2024',
    type: EventType.CONFERENCE,
    status: EventStatus.IN_PROGRESS,
    start_date: '2024-02-10T09:00:00Z',
    venue_name: 'Convention Center',
    guest_count: 500,
    confirmed_guests: 480,
    budget_total: 75000,
    total_expenses: 68000,
    planner_name: 'Mike Rodriguez',
    created_at: '2024-01-05T11:00:00Z'
  },
  {
    id: '4',
    name: 'Baby Shower for Lisa',
    type: EventType.BABY_SHOWER,
    status: EventStatus.DRAFT,
    start_date: '2024-04-12T14:00:00Z',
    venue_name: 'Garden Pavilion',
    guest_count: 25,
    confirmed_guests: 0,
    budget_total: 1200,
    total_expenses: 300,
    planner_name: 'Lisa Chen',
    created_at: '2024-03-01T16:00:00Z'
  },
  {
    id: '5',
    name: 'Company Holiday Party',
    type: EventType.HOLIDAY_PARTY,
    status: EventStatus.COMPLETED,
    start_date: '2023-12-15T18:00:00Z',
    venue_name: 'Downtown Hotel',
    guest_count: 200,
    confirmed_guests: 185,
    budget_total: 15000,
    total_expenses: 14200,
    planner_name: 'Corporate Events',
    created_at: '2023-11-01T09:00:00Z'
  },
  {
    id: '6',
    name: 'Charity Fundraiser Gala',
    type: EventType.FUNDRAISER,
    status: EventStatus.CANCELLED,
    start_date: '2024-05-20T19:00:00Z',
    venue_name: 'City Hall',
    guest_count: 300,
    confirmed_guests: 0,
    budget_total: 50000,
    total_expenses: 5000,
    planner_name: 'Charity Foundation',
    created_at: '2024-02-15T12:00:00Z'
  }
]

export default function EventFiltersDemo() {
  const [filters, setFilters] = React.useState<EventFiltersType>({
    search: '',
    types: [],
    statuses: [],
    date_range: {},
    location: '',
    budget_range: {},
    guest_count_range: {}
  })

  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid')
  const [showCompactFilters, setShowCompactFilters] = React.useState(false)

  // Filter events based on current filters
  const filteredEvents = React.useMemo(() => {
    return sampleEvents.filter(event => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch =
          event.name.toLowerCase().includes(searchLower) ||
          event.venue_name?.toLowerCase().includes(searchLower) ||
          event.planner_name.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      // Type filter
      if (filters.types.length > 0 && !filters.types.includes(event.type)) {
        return false
      }

      // Status filter
      if (filters.statuses.length > 0 && !filters.statuses.includes(event.status)) {
        return false
      }

      // Date range filter
      if (filters.date_range.start || filters.date_range.end) {
        const eventDate = new Date(event.start_date).toISOString().split('T')[0]
        if (filters.date_range.start && eventDate < filters.date_range.start) {
          return false
        }
        if (filters.date_range.end && eventDate > filters.date_range.end) {
          return false
        }
      }

      // Location filter
      if (filters.location && event.venue_name) {
        if (!event.venue_name.toLowerCase().includes(filters.location.toLowerCase())) {
          return false
        }
      }

      // Budget range filter
      if (filters.budget_range?.min || filters.budget_range?.max) {
        const budget = event.budget_total || 0
        if (filters.budget_range.min && budget < filters.budget_range.min) {
          return false
        }
        if (filters.budget_range.max && budget > filters.budget_range.max) {
          return false
        }
      }

      // Guest count range filter
      if (filters.guest_count_range?.min || filters.guest_count_range?.max) {
        if (filters.guest_count_range.min && event.guest_count < filters.guest_count_range.min) {
          return false
        }
        if (filters.guest_count_range.max && event.guest_count > filters.guest_count_range.max) {
          return false
        }
      }

      return true
    })
  }, [filters])

  const handleEventEdit = (eventId: string) => {
    console.log('Edit event:', eventId)
  }

  const handleEventDelete = (eventId: string) => {
    console.log('Delete event:', eventId)
  }

  const handleEventView = (eventId: string) => {
    console.log('View event:', eventId)
  }

  const handleCreateEvent = () => {
    console.log('Create new event')
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Event Filters Demo</h1>
          <p className="text-muted-foreground">
            Test the event filtering functionality with sample data. Filters include search, event types,
            status, date ranges, location, budget range, and guest count.
          </p>
        </div>

        {/* Filter Mode Toggle */}
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <label htmlFor="compact-mode" className="text-sm font-medium">
              Compact Mode:
            </label>
            <input
              id="compact-mode"
              type="checkbox"
              checked={showCompactFilters}
              onChange={(e) => setShowCompactFilters(e.target.checked)}
              className="rounded"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            Toggle between full and compact filter layouts
          </div>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <EventFilters
              value={filters}
              onChange={setFilters}
              compact={showCompactFilters}
              showAdvanced={!showCompactFilters}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Results Summary */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground">
                Showing {filteredEvents.length} of {sampleEvents.length} events
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">View:</span>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 text-sm rounded ${
                    viewMode === 'grid'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 text-sm rounded ${
                    viewMode === 'list'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background text-muted-foreground hover:text-foreground'
                  }`}
                >
                  List
                </button>
              </div>
            </div>

            {/* Event List */}
            <EventList
              events={filteredEvents}
              onEdit={handleEventEdit}
              onDelete={handleEventDelete}
              onView={handleEventView}
              onCreateEvent={handleCreateEvent}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              emptyStateTitle="No events match your filters"
              emptyStateMessage="Try adjusting your search criteria or clearing some filters to see more events."
            />
          </div>
        </div>

        {/* Filter State Debug Panel */}
        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Current Filter State (Debug)</h3>
          <pre className="text-sm bg-background p-3 rounded border overflow-auto">
            {JSON.stringify(filters, null, 2)}
          </pre>
        </div>

        {/* Sample Events Data */}
        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Sample Events Data</h3>
          <div className="text-sm space-y-2">
            {sampleEvents.map(event => (
              <div key={event.id} className="p-2 bg-background rounded border">
                <div className="font-medium">{event.name}</div>
                <div className="text-muted-foreground text-xs">
                  {event.type} • {event.status} • {event.guest_count} guests •
                  ${event.budget_total?.toLocaleString()} budget • {event.venue_name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testing Instructions */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold mb-3 text-blue-900 dark:text-blue-100">
            Testing Instructions
          </h3>
          <div className="text-sm space-y-2 text-blue-800 dark:text-blue-200">
            <p><strong>Search:</strong> Try searching for &quot;wedding&quot;, &quot;tech&quot;, or &quot;birthday&quot;</p>
            <p><strong>Event Types:</strong> Filter by Wedding, Birthday, Conference, etc.</p>
            <p><strong>Status:</strong> Click status chips to filter by Planning, Confirmed, Completed, etc.</p>
            <p><strong>Date Range:</strong> Use date pickers or quick filters (Today, This Week, etc.)</p>
            <p><strong>Location:</strong> Search for venues like &quot;ballroom&quot;, &quot;terrace&quot;, or &quot;center&quot;</p>
            <p><strong>Budget:</strong> Set min/max budget ranges (e.g., 1000-20000)</p>
            <p><strong>Guest Count:</strong> Filter by guest count ranges (e.g., 50-200)</p>
            <p><strong>Combine filters:</strong> Use multiple filters together for refined results</p>
          </div>
        </div>
      </div>
    </div>
  )
}