'use client'

import { EventCard } from '@/components/events'
import { EventSummary, EventType, EventStatus } from '@/types/event.types'

const sampleEvent: EventSummary = {
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
}

const overBudgetEvent: EventSummary = {
  id: '2',
  name: 'Mom\'s Birthday Party',
  type: EventType.BIRTHDAY,
  status: EventStatus.IN_PROGRESS,
  start_date: '2025-02-28T18:00:00Z',
  venue_name: 'Family Restaurant',
  guest_count: 30,
  confirmed_guests: 28,
  budget_total: 2000,
  total_expenses: 2300,
  planner_name: 'Jessica Smith',
  created_at: '2025-01-10T09:15:00Z'
}

export default function TestEvents() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          EventCard Component Test
        </h1>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Grid View
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EventCard
                event={sampleEvent}
                onEdit={(id) => alert(`Edit: ${id}`)}
                onDelete={(id) => alert(`Delete: ${id}`)}
                onView={(id) => alert(`View: ${id}`)}
                viewMode="grid"
              />
              <EventCard
                event={overBudgetEvent}
                onEdit={(id) => alert(`Edit: ${id}`)}
                onDelete={(id) => alert(`Delete: ${id}`)}
                onView={(id) => alert(`View: ${id}`)}
                viewMode="grid"
              />
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              List View
            </h2>
            <div className="space-y-4">
              <EventCard
                event={sampleEvent}
                onEdit={(id) => alert(`Edit: ${id}`)}
                onDelete={(id) => alert(`Delete: ${id}`)}
                onView={(id) => alert(`View: ${id}`)}
                viewMode="list"
              />
              <EventCard
                event={overBudgetEvent}
                onEdit={(id) => alert(`Edit: ${id}`)}
                onDelete={(id) => alert(`Delete: ${id}`)}
                onView={(id) => alert(`View: ${id}`)}
                viewMode="list"
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}