'use client'

import * as React from 'react'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Eye,
  Edit,
  ArrowRight,
  CalendarDays,
  AlertCircle
} from 'lucide-react'
import { format, formatDistanceToNow, isToday, isTomorrow, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'
import { EventSummary, EventStatus, EventType } from '@/types/event.types'
import { useUpcomingEvents } from '@/hooks/api/useEventStats'

interface UpcomingEventsWidgetProps {
  className?: string
  limit?: number
  onEventClick?: (eventId: string) => void
  onEditEvent?: (eventId: string) => void
  onViewAll?: () => void
}

interface EventCardProps {
  event: EventSummary
  onEventClick?: (eventId: string) => void
  onEditEvent?: (eventId: string) => void
}

function getEventTypeEmoji(type: EventType): string {
  const emojiMap: Record<EventType, string> = {
    [EventType.WEDDING]: '💒',
    [EventType.BIRTHDAY]: '🎂',
    [EventType.ANNIVERSARY]: '💕',
    [EventType.GRADUATION]: '🎓',
    [EventType.BABY_SHOWER]: '👶',
    [EventType.BRIDAL_SHOWER]: '👰',
    [EventType.CORPORATE]: '🏢',
    [EventType.CONFERENCE]: '🏛️',
    [EventType.WORKSHOP]: '🔧',
    [EventType.FUNDRAISER]: '💰',
    [EventType.HOLIDAY_PARTY]: '🎄',
    [EventType.REUNION]: '👥',
    [EventType.OTHER]: '📅'
  }
  return emojiMap[type] || '📅'
}

function getStatusColor(status: EventStatus): string {
  const colorMap: Record<EventStatus, string> = {
    [EventStatus.DRAFT]: 'bg-gray-100 text-gray-700',
    [EventStatus.PLANNING]: 'bg-yellow-100 text-yellow-700',
    [EventStatus.CONFIRMED]: 'bg-green-100 text-green-700',
    [EventStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-700',
    [EventStatus.COMPLETED]: 'bg-emerald-100 text-emerald-700',
    [EventStatus.CANCELLED]: 'bg-red-100 text-red-700',
    [EventStatus.POSTPONED]: 'bg-orange-100 text-orange-700'
  }
  return colorMap[status] || 'bg-gray-100 text-gray-700'
}

function formatEventDate(dateString: string): { display: string; relative: string } {
  try {
    const date = parseISO(dateString)

    let display = format(date, 'MMM d, yyyy')
    let relative = formatDistanceToNow(date, { addSuffix: true })

    if (isToday(date)) {
      display = 'Today'
      relative = format(date, 'h:mm a')
    } else if (isTomorrow(date)) {
      display = 'Tomorrow'
      relative = format(date, 'h:mm a')
    }

    return { display, relative }
  } catch {
    return { display: 'Invalid date', relative: '' }
  }
}

function EventCard({ event, onEventClick, onEditEvent }: EventCardProps) {
  const { display: dateDisplay, relative: dateRelative } = formatEventDate(event.start_date)
  const typeEmoji = getEventTypeEmoji(event.type)
  const statusColor = getStatusColor(event.status)

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEventClick?.(event.id)
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEditEvent?.(event.id)
  }

  return (
    <div
      className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer group"
      onClick={() => onEventClick?.(event.id)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          <span className="text-lg">{typeEmoji}</span>
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {event.name}
            </h3>
            <span className={cn(
              'inline-block px-2 py-1 text-xs font-medium rounded-full mt-1',
              statusColor
            )}>
              {event.status.replace('_', ' ').toLowerCase()}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleViewClick}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="View event"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={handleEditClick}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-colors"
            title="Edit event"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Event details */}
      <div className="space-y-2">
        {/* Date and time */}
        <div className="flex items-center space-x-2 text-sm">
          <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="text-gray-900 font-medium">{dateDisplay}</span>
          {dateRelative && (
            <span className="text-gray-500">({dateRelative})</span>
          )}
        </div>

        {/* Location */}
        {event.venue_name && (
          <div className="flex items-center space-x-2 text-sm">
            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-600 truncate">{event.venue_name}</span>
          </div>
        )}

        {/* Guest count */}
        <div className="flex items-center space-x-2 text-sm">
          <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="text-gray-600">
            {event.confirmed_guests} of {event.guest_count} confirmed
          </span>
        </div>
      </div>
    </div>
  )
}

function EventsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 border border-gray-200 rounded-lg animate-pulse">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2 flex-1">
              <div className="w-6 h-6 bg-gray-200 rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-16" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-200 rounded" />
              <div className="h-3 bg-gray-200 rounded w-24" />
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-200 rounded" />
              <div className="h-3 bg-gray-200 rounded w-32" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CalendarDays className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-sm font-medium text-gray-900 mb-1">
        No upcoming events
      </h3>
      <p className="text-sm text-gray-500">
        Create your first event to see it here
      </p>
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-8 h-8 text-red-400" />
      </div>
      <h3 className="text-sm font-medium text-gray-900 mb-1">
        Unable to load events
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        There was an error loading your upcoming events
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Try again
        </button>
      )}
    </div>
  )
}

export function UpcomingEventsWidget({
  className,
  limit = 5,
  onEventClick,
  onEditEvent,
  onViewAll
}: UpcomingEventsWidgetProps) {
  const {
    data: events,
    isLoading,
    error,
    refetch
  } = useUpcomingEvents(limit)

  const handleRetry = () => {
    refetch()
  }

  return (
    <div className={cn(
      'bg-white rounded-lg shadow-sm border border-gray-200',
      className
    )}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Upcoming Events
            </h2>
          </div>
          {onViewAll && events && events.length > 0 && (
            <button
              onClick={onViewAll}
              className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <span>View all</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <EventsSkeleton />
        ) : error ? (
          <ErrorState onRetry={handleRetry} />
        ) : !events || events.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onEventClick={onEventClick}
                onEditEvent={onEditEvent}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {events && events.length > 0 && !isLoading && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">
              {events.length} upcoming {events.length === 1 ? 'event' : 'events'}
            </span>
            <button
              onClick={handleRetry}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  )
}