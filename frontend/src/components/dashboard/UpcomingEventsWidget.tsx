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
    [EventType.CELEBRATION]: '🎉',
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
    [EventStatus.ACTIVE]: 'bg-green-100 text-green-700',
    [EventStatus.COMPLETED]: 'bg-emerald-100 text-emerald-700',
    [EventStatus.CANCELLED]: 'bg-red-100 text-red-700',
    [EventStatus.POSTPONED]: 'bg-orange-100 text-orange-700'
  }
  return colorMap[status] || 'bg-muted text-muted-foreground'
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
      className="p-4 border border-border rounded-lg hover:border-border/80 hover:shadow-sm transition-all cursor-pointer group"
      onClick={() => onEventClick?.(event.id)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          <span className="text-lg">{typeEmoji}</span>
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-card-foreground truncate group-hover:text-primary transition-colors">
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
            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors"
            title="View event"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={handleEditClick}
            className="p-1.5 text-muted-foreground hover:text-card-foreground hover:bg-muted rounded transition-colors"
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
          <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="text-card-foreground font-medium">{dateDisplay}</span>
          {dateRelative && (
            <span className="text-muted-foreground">({dateRelative})</span>
          )}
        </div>

        {/* Location */}
        {event.venue_name && (
          <div className="flex items-center space-x-2 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground truncate">{event.venue_name}</span>
          </div>
        )}

        {/* Guest count */}
        <div className="flex items-center space-x-2 text-sm">
          <Users className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="text-muted-foreground">
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
        <div key={i} className="p-4 border border-border rounded-lg animate-pulse">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2 flex-1">
              <div className="w-6 h-6 bg-muted-foreground/20 rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted-foreground/20 rounded w-3/4" />
                <div className="h-3 bg-muted-foreground/20 rounded w-16" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-muted-foreground/20 rounded" />
              <div className="h-3 bg-muted-foreground/20 rounded w-24" />
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-muted-foreground/20 rounded" />
              <div className="h-3 bg-muted-foreground/20 rounded w-32" />
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
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
        <CalendarDays className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-medium text-card-foreground mb-1">
        No upcoming events
      </h3>
      <p className="text-sm text-muted-foreground">
        Create your first event to see it here
      </p>
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-8 h-8 text-destructive" />
      </div>
      <h3 className="text-sm font-medium text-card-foreground mb-1">
        Unable to load events
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        There was an error loading your upcoming events
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm text-primary hover:text-primary/80 font-medium"
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
      'bg-card rounded-lg shadow-sm border border-border',
      className
    )}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-card-foreground">
              Upcoming Events
            </h2>
          </div>
          {onViewAll && events && events.length > 0 && (
            <button
              onClick={onViewAll}
              className="flex items-center space-x-1 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
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
        <div className="px-6 py-3 bg-muted border-t border-border rounded-b-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {events.length} upcoming {events.length === 1 ? 'event' : 'events'}
            </span>
            <button
              onClick={handleRetry}
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  )
}