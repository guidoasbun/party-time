'use client'

import * as React from 'react'
import {
  Clock,
  MapPin,
  Users,
  Eye,
  Edit,
  MoreHorizontal,
  ArrowRight,
  History,
  AlertCircle
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'
import { EventSummary, EventStatus, EventType } from '@/types/event.types'
import { useEvents } from '@/hooks/api/useEvents'

interface RecentEventsSectionProps {
  className?: string
  limit?: number
  onEventClick?: (eventId: string) => void
  onEditEvent?: (eventId: string) => void
  onViewAll?: () => void
}

interface EventRowProps {
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

function getStatusBadge(status: EventStatus): { text: string; className: string } {
  const statusMap: Record<EventStatus, { text: string; className: string }> = {
    [EventStatus.DRAFT]: { text: 'Draft', className: 'bg-gray-100 text-gray-700' },
    [EventStatus.PLANNING]: { text: 'Planning', className: 'bg-yellow-100 text-yellow-700' },
    [EventStatus.CONFIRMED]: { text: 'Confirmed', className: 'bg-green-100 text-green-700' },
    [EventStatus.IN_PROGRESS]: { text: 'In Progress', className: 'bg-blue-100 text-blue-700' },
    [EventStatus.COMPLETED]: { text: 'Completed', className: 'bg-emerald-100 text-emerald-700' },
    [EventStatus.CANCELLED]: { text: 'Cancelled', className: 'bg-red-100 text-red-700' },
    [EventStatus.POSTPONED]: { text: 'Postponed', className: 'bg-orange-100 text-orange-700' }
  }
  return statusMap[status] || { text: status, className: 'bg-muted text-muted-foreground' }
}

function formatEventDate(dateString: string): string {
  try {
    const date = parseISO(dateString)
    return format(date, 'MMM d, yyyy')
  } catch {
    return 'Invalid date'
  }
}

function EventRow({ event, onEventClick, onEditEvent }: EventRowProps) {
  const typeEmoji = getEventTypeEmoji(event.type)
  const { text: statusText, className: statusClassName } = getStatusBadge(event.status)
  const formattedDate = formatEventDate(event.start_date)

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEventClick?.(event.id)
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEditEvent?.(event.id)
  }

  const rsvpRate = event.guest_count > 0
    ? Math.round((event.confirmed_guests / event.guest_count) * 100)
    : 0

  return (
    <div
      className="group flex items-center justify-between p-4 hover:bg-muted border-b border-border/50 last:border-b-0 cursor-pointer transition-colors"
      onClick={() => onEventClick?.(event.id)}
    >
      {/* Event info */}
      <div className="flex items-center space-x-4 min-w-0 flex-1">
        {/* Type emoji */}
        <div className="text-lg flex-shrink-0">
          {typeEmoji}
        </div>

        {/* Event details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-3 mb-1">
            <h3 className="font-medium text-card-foreground truncate group-hover:text-primary transition-colors">
              {event.name}
            </h3>
            <span className={cn(
              'inline-block px-2 py-1 text-xs font-medium rounded-full flex-shrink-0',
              statusClassName
            )}>
              {statusText}
            </span>
          </div>

          {/* Meta information */}
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{formattedDate}</span>
            </div>

            {event.venue_name && (
              <div className="flex items-center space-x-1">
                <MapPin className="w-3 h-3" />
                <span className="truncate max-w-32">{event.venue_name}</span>
              </div>
            )}

            <div className="flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span>{event.confirmed_guests}/{event.guest_count}</span>
              {event.guest_count > 0 && (
                <span className="text-xs text-muted-foreground/80">({rsvpRate}%)</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
        <button
          onClick={(e) => {
            e.stopPropagation()
            // TODO: Show dropdown menu
          }}
          className="p-1.5 text-muted-foreground hover:text-card-foreground hover:bg-muted rounded transition-colors"
          title="More options"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function EventsSkeleton() {
  return (
    <div className="space-y-0">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center justify-between p-4 border-b border-border/50 last:border-b-0 animate-pulse">
          <div className="flex items-center space-x-4 flex-1">
            <div className="w-6 h-6 bg-muted-foreground/20 rounded" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-3">
                <div className="h-4 bg-muted-foreground/20 rounded w-48" />
                <div className="h-4 bg-muted-foreground/20 rounded w-16" />
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-3 bg-muted-foreground/20 rounded w-20" />
                <div className="h-3 bg-muted-foreground/20 rounded w-24" />
                <div className="h-3 bg-muted-foreground/20 rounded w-16" />
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-muted-foreground/20 rounded" />
            <div className="w-6 h-6 bg-muted-foreground/20 rounded" />
            <div className="w-6 h-6 bg-muted-foreground/20 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
        <History className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-medium text-card-foreground mb-1">
        No recent events
      </h3>
      <p className="text-sm text-muted-foreground">
        Your recently created events will appear here
      </p>
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-8 h-8 text-destructive" />
      </div>
      <h3 className="text-sm font-medium text-card-foreground mb-1">
        Unable to load events
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        There was an error loading your recent events
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

export function RecentEventsSection({
  className,
  limit = 10,
  onEventClick,
  onEditEvent,
  onViewAll
}: RecentEventsSectionProps) {
  const {
    data: eventsData,
    isLoading,
    error,
    refetch
  } = useEvents({
    limit,
    sort_by: 'created_at',
    sort_order: 'desc'
  })

  const events = eventsData?.items || []

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
            <History className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-card-foreground">
              Recent Events
            </h2>
          </div>
          {onViewAll && events.length > 0 && (
            <button
              onClick={onViewAll}
              className="flex items-center space-x-1 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            >
              <span>View all</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Your most recently created events
        </p>
      </div>

      {/* Content */}
      <div className="overflow-hidden">
        {isLoading ? (
          <EventsSkeleton />
        ) : error ? (
          <ErrorState onRetry={handleRetry} />
        ) : events.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-0">
            {events.map((event) => (
              <EventRow
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
      {events.length > 0 && !isLoading && (
        <div className="px-6 py-3 bg-muted border-t border-border rounded-b-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Showing {events.length} recent {events.length === 1 ? 'event' : 'events'}
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