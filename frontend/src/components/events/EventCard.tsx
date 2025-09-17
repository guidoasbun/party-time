'use client'

import { format } from 'date-fns'
import { useState, useEffect } from 'react'
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Edit,
  Trash2,
  Eye,
  Clock,
  Copy,
  Archive
} from 'lucide-react'
import { EventSummary, EventType } from '@/types/event.types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { EventStatusBadge } from './EventStatusBadge'

interface EventCardProps {
  event: EventSummary
  onEdit?: (eventId: string) => void
  onDelete?: (eventId: string) => void
  onView?: (eventId: string) => void
  onDuplicate?: (eventId: string) => void
  onArchive?: (eventId: string) => void
  viewMode?: 'grid' | 'list'
  showActions?: boolean
}

const eventTypeLabels: Record<EventType, string> = {
  [EventType.WEDDING]: 'Wedding',
  [EventType.BIRTHDAY]: 'Birthday',
  [EventType.ANNIVERSARY]: 'Anniversary',
  [EventType.GRADUATION]: 'Graduation',
  [EventType.BABY_SHOWER]: 'Baby Shower',
  [EventType.BRIDAL_SHOWER]: 'Bridal Shower',
  [EventType.CORPORATE]: 'Corporate',
  [EventType.CONFERENCE]: 'Conference',
  [EventType.WORKSHOP]: 'Workshop',
  [EventType.FUNDRAISER]: 'Fundraiser',
  [EventType.HOLIDAY_PARTY]: 'Holiday Party',
  [EventType.REUNION]: 'Reunion',
  [EventType.OTHER]: 'Other'
}

function BudgetProgressBar({ budgetTotal, totalExpenses }: { budgetTotal?: number; totalExpenses: number }) {
  if (!budgetTotal || budgetTotal === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <DollarSign className="h-4 w-4" />
        <span>No budget set</span>
      </div>
    )
  }

  const percentage = Math.min((totalExpenses / budgetTotal) * 100, 100)
  const isOverBudget = totalExpenses > budgetTotal

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1">
          <DollarSign className="h-4 w-4" />
          <span className="font-medium">Budget</span>
        </div>
        <span className={cn(
          'font-medium text-xs sm:text-sm',
          isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'
        )}>
          ${totalExpenses.toLocaleString()} / ${budgetTotal.toLocaleString()}
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={cn(
            'h-2 rounded-full transition-all duration-300',
            isOverBudget
              ? 'bg-red-500 dark:bg-red-400'
              : percentage > 80
                ? 'bg-yellow-500 dark:bg-yellow-400'
                : 'bg-green-500 dark:bg-green-400'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export function EventCard({
  event,
  onEdit,
  onDelete,
  onView,
  onDuplicate,
  onArchive,
  viewMode = 'grid',
  showActions = true
}: EventCardProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Use safe date formatting to prevent hydration mismatches
  const eventDate = new Date(event.start_date)
  const formattedDate = isClient
    ? format(eventDate, 'MMM dd, yyyy')
    : eventDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        timeZone: 'UTC'
      })
  const formattedTime = isClient
    ? format(eventDate, 'h:mm a')
    : eventDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC'
      })
  
  const rsvpRate = event.guest_count > 0 
    ? Math.round((event.confirmed_guests / event.guest_count) * 100)
    : 0

  if (viewMode === 'list') {
    return (
      <div className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 hover:shadow-md transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600">
        {/* Mobile: Stack layout, Desktop: Horizontal layout */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {event.name}
                </h3>
                {/* Mobile: Stack info vertically, Desktop: Horizontal */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">{eventTypeLabels[event.type]}</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{formattedDate} at {formattedTime}</span>
                  </div>
                  {event.venue_name && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{event.venue_name}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="ml-2 flex-shrink-0">
                <EventStatusBadge status={event.status} />
              </div>
            </div>

            {/* Mobile: Stack metrics, Desktop: Horizontal */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                <Users className="h-4 w-4 flex-shrink-0" />
                <span>{event.confirmed_guests}/{event.guest_count} confirmed ({rsvpRate}%)</span>
              </div>

              <div className="flex-1 sm:max-w-xs">
                <BudgetProgressBar
                  budgetTotal={event.budget_total}
                  totalExpenses={event.total_expenses}
                />
              </div>
            </div>
          </div>

          {/* Actions - Always visible on mobile, hover on desktop */}
          {showActions && (
            <div className="flex items-center gap-1 sm:ml-4 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-200 dark:border-gray-700">
              {onView && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(event.id)}
                  title="View event"
                  className="min-h-[44px] min-w-[44px] p-2 sm:p-1"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(event.id)}
                  title="Edit event"
                  className="min-h-[44px] min-w-[44px] p-2 sm:p-1"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDuplicate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDuplicate(event.id)}
                  title="Duplicate event"
                  className="min-h-[44px] min-w-[44px] p-2 sm:p-1"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
              {onArchive && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onArchive(event.id)}
                  title="Archive event"
                  className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 min-h-[44px] min-w-[44px] p-2 sm:p-1"
                >
                  <Archive className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(event.id)}
                  title="Delete event"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 min-h-[44px] min-w-[44px] p-2 sm:p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Grid view - Mobile responsive
  return (
    <div className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6 hover:shadow-lg transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600 hover:-translate-y-1">
      {/* Header */}
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate mb-1">
            {event.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {eventTypeLabels[event.type]}
          </p>
        </div>
        <div className="ml-2 flex-shrink-0">
          <EventStatusBadge status={event.status} />
        </div>
      </div>

      {/* Event Details */}
      <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
        {/* Date and Time - Stack on very small screens */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2 sm:ml-2">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span>{formattedTime}</span>
          </div>
        </div>

        {event.venue_name && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{event.venue_name}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 flex-shrink-0" />
            <span>{event.confirmed_guests}/{event.guest_count} confirmed</span>
          </div>
          <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded w-fit">
            {rsvpRate}% RSVP
          </span>
        </div>
      </div>

      {/* Budget Progress */}
      <div className="mb-3 sm:mb-4">
        <BudgetProgressBar
          budgetTotal={event.budget_total}
          totalExpenses={event.total_expenses}
        />
      </div>

      {/* Actions - Always visible on mobile, hover on desktop */}
      {showActions && (
        <div className="flex justify-end gap-1 sm:gap-2 pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-700 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
          {onView && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(event.id)}
              title="View event"
              className="min-h-[44px] min-w-[44px] p-2 sm:p-1"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(event.id)}
              title="Edit event"
              className="min-h-[44px] min-w-[44px] p-2 sm:p-1"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {onDuplicate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDuplicate(event.id)}
              title="Duplicate event"
              className="min-h-[44px] min-w-[44px] p-2 sm:p-1"
            >
              <Copy className="h-4 w-4" />
            </Button>
          )}
          {onArchive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onArchive(event.id)}
              title="Archive event"
              className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 min-h-[44px] min-w-[44px] p-2 sm:p-1"
            >
              <Archive className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(event.id)}
              title="Delete event"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 min-h-[44px] min-w-[44px] p-2 sm:p-1"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}