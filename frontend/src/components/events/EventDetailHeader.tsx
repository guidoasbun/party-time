'use client'

/**
 * Event detail header component
 * Displays event title, type, status, date, and location information
 */

import React from 'react'
import { Calendar, MapPin, Users } from 'lucide-react'
import { format } from 'date-fns'
import { EventStatusBadge } from './EventStatusBadge'
import { cn } from '@/lib/utils'
import type { Event, EventType } from '@/types'
import {
  Heart,
  Cake,
  Calendar as CalendarIcon,
  GraduationCap,
  Baby,
  Sparkles,
  Building,
  Users as UsersIcon,
  Presentation,
  HandHeart,
  PartyPopper,
  UserCheck,
  MoreHorizontal
} from 'lucide-react'

// Icon mapping for event types
const EVENT_TYPE_ICONS = {
  wedding: Heart,
  birthday: Cake,
  anniversary: CalendarIcon,
  graduation: GraduationCap,
  baby_shower: Baby,
  bridal_shower: Sparkles,
  corporate: Building,
  conference: UsersIcon,
  workshop: Presentation,
  fundraiser: HandHeart,
  holiday_party: PartyPopper,
  reunion: UserCheck,
  other: MoreHorizontal,
} as const

// Display names for event types
const EVENT_TYPE_LABELS = {
  wedding: 'Wedding',
  birthday: 'Birthday',
  anniversary: 'Anniversary',
  graduation: 'Graduation',
  baby_shower: 'Baby Shower',
  bridal_shower: 'Bridal Shower',
  corporate: 'Corporate Event',
  conference: 'Conference',
  workshop: 'Workshop',
  fundraiser: 'Fundraiser',
  holiday_party: 'Holiday Party',
  reunion: 'Reunion',
  other: 'Other',
} as const

interface EventDetailHeaderProps {
  event: Event
  className?: string
}

export function EventDetailHeader({ event, className }: EventDetailHeaderProps) {
  const TypeIcon = EVENT_TYPE_ICONS[event.type as keyof typeof EVENT_TYPE_ICONS] || MoreHorizontal
  const typeLabel = EVENT_TYPE_LABELS[event.type as keyof typeof EVENT_TYPE_LABELS] || 'Other'

  const formatEventDate = (startDate: string, endDate?: string) => {
    try {
      const start = new Date(startDate)

      if (!endDate) {
        return format(start, 'PPP p')
      }

      const end = new Date(endDate)
      const isSameDay = format(start, 'yyyy-MM-dd') === format(end, 'yyyy-MM-dd')

      if (isSameDay) {
        return `${format(start, 'PPP')} • ${format(start, 'p')} - ${format(end, 'p')}`
      }

      return `${format(start, 'PPP p')} - ${format(end, 'PPP p')}`
    } catch (error) {
      return startDate
    }
  }

  const getLocationDisplay = () => {
    if (event.venue_name) {
      return event.venue_address
        ? `${event.venue_name}, ${event.venue_address}`
        : event.venue_name
    }
    return event.location || 'Location not specified'
  }

  return (
    <div className={cn('bg-card rounded-lg border border-border shadow-sm p-6', className)}>
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        {/* Left side - Event information */}
        <div className="flex-1 space-y-4">
          {/* Event type and status badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border border-blue-300 dark:border-blue-700">
              <TypeIcon className="h-3.5 w-3.5" />
              {typeLabel}
            </span>
            <EventStatusBadge status={event.status} />
            {event.is_public && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground border border-border">
                Public
              </span>
            )}
          </div>

          {/* Event title */}
          <h1 className="text-3xl font-bold text-foreground leading-tight">
            {event.name}
          </h1>

          {/* Event description */}
          {event.description && (
            <p className="text-muted-foreground text-base leading-relaxed">
              {event.description}
            </p>
          )}

          {/* Event details */}
          <div className="space-y-2 text-sm">
            {/* Date and time */}
            <div className="flex items-start gap-2 text-foreground">
              <Calendar className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{formatEventDate(event.start_date, event.end_date)}</span>
            </div>

            {/* Location */}
            <div className="flex items-start gap-2 text-foreground">
              <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{getLocationDisplay()}</span>
            </div>

            {/* Guest count */}
            {(event.guest_count > 0 || event.max_guests) && (
              <div className="flex items-center gap-2 text-foreground">
                <Users className="h-5 w-5 flex-shrink-0" />
                <span>
                  {event.guest_count > 0 && `${event.guest_count} guest${event.guest_count !== 1 ? 's' : ''}`}
                  {event.guest_count > 0 && event.max_guests && ' • '}
                  {event.max_guests && `Max: ${event.max_guests}`}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
