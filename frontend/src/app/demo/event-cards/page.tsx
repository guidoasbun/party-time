'use client'

import { useState } from 'react'
import { EventCard } from '@/components/events'
import { EventSummary, EventType, EventStatus } from '@/types/event.types'
import { Button } from '@/components/ui/Button'

const mockEvents: EventSummary[] = [
  {
    id: '1',
    name: 'Sarah & John\'s Wedding',
    type: EventType.WEDDING,
    status: EventStatus.CONFIRMED,
    start_date: '2025-06-15T15:00:00Z',
    venue_name: 'Grand Ballroom Hotel',
    guest_count: 150,
    confirmed_guests: 120,
    budget_total: 50000,
    total_expenses: 35000,
    planner_name: 'Emily Johnson',
    created_at: '2025-01-01T10:00:00Z'
  },
  {
    id: '2',
    name: 'Tech Conference 2025',
    type: EventType.CONFERENCE,
    status: EventStatus.PLANNING,
    start_date: '2025-03-22T09:00:00Z',
    venue_name: 'Convention Center',
    guest_count: 500,
    confirmed_guests: 200,
    budget_total: 75000,
    total_expenses: 25000,
    planner_name: 'Mike Chen',
    created_at: '2024-12-15T14:30:00Z'
  },
  {
    id: '3',
    name: 'Mom\'s 60th Birthday',
    type: EventType.BIRTHDAY,
    status: EventStatus.IN_PROGRESS,
    start_date: '2025-02-28T18:00:00Z',
    venue_name: 'Family Restaurant',
    guest_count: 30,
    confirmed_guests: 28,
    budget_total: 2000,
    total_expenses: 2100,
    planner_name: 'Jessica Smith',
    created_at: '2025-01-10T09:15:00Z'
  },
  {
    id: '4',
    name: 'Annual Fundraiser Gala',
    type: EventType.FUNDRAISER,
    status: EventStatus.DRAFT,
    start_date: '2025-09-15T19:00:00Z',
    venue_name: 'City Hall',
    guest_count: 200,
    confirmed_guests: 0,
    budget_total: undefined,
    total_expenses: 0,
    planner_name: 'Robert Wilson',
    created_at: '2025-01-05T16:45:00Z'
  },
  {
    id: '5',
    name: 'Product Launch Party',
    type: EventType.CORPORATE,
    status: EventStatus.COMPLETED,
    start_date: '2024-12-10T17:00:00Z',
    venue_name: 'Rooftop Bar',
    guest_count: 80,
    confirmed_guests: 75,
    budget_total: 15000,
    total_expenses: 14500,
    planner_name: 'Laura Martinez',
    created_at: '2024-11-01T11:20:00Z'
  },
  {
    id: '6',
    name: 'Company Holiday Party',
    type: EventType.HOLIDAY_PARTY,
    status: EventStatus.CANCELLED,
    start_date: '2024-12-20T18:00:00Z',
    venue_name: 'Office Space',
    guest_count: 100,
    confirmed_guests: 45,
    budget_total: 8000,
    total_expenses: 1200,
    planner_name: 'David Lee',
    created_at: '2024-11-15T13:30:00Z'
  }
]

export default function EventCardDemo() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const handleEdit = (eventId: string) => {
    alert(`Edit event: ${eventId}`)
  }

  const handleDelete = (eventId: string) => {
    alert(`Delete event: ${eventId}`)
  }

  const handleView = (eventId: string) => {
    alert(`View event: ${eventId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Event Card Component Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Showcase of the EventCard component with different events, statuses, and view modes.
          </p>
          
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              onClick={() => setViewMode('grid')}
            >
              Grid View
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
            >
              List View
            </Button>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
                viewMode="grid"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {mockEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
                viewMode="list"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}