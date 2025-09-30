'use client'

import * as React from 'react'
import {
  Heart,
  Cake,
  Calendar,
  GraduationCap,
  Baby,
  Sparkles,
  Building,
  Users,
  Presentation,
  HandHeart,
  PartyPopper,
  UserCheck,
  Sparkle,
  MoreHorizontal
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { EventType } from '@/types/event.types'

// Icon mapping for event types
const EVENT_TYPE_ICONS = {
  [EventType.WEDDING]: Heart,
  [EventType.BIRTHDAY]: Cake,
  [EventType.ANNIVERSARY]: Calendar,
  [EventType.GRADUATION]: GraduationCap,
  [EventType.BABY_SHOWER]: Baby,
  [EventType.BRIDAL_SHOWER]: Sparkles,
  [EventType.CORPORATE]: Building,
  [EventType.CONFERENCE]: Users,
  [EventType.WORKSHOP]: Presentation,
  [EventType.FUNDRAISER]: HandHeart,
  [EventType.HOLIDAY_PARTY]: PartyPopper,
  [EventType.REUNION]: UserCheck,
  [EventType.CELEBRATION]: Sparkle,
  [EventType.OTHER]: MoreHorizontal,
} as const

// Display names for event types
const EVENT_TYPE_LABELS = {
  [EventType.WEDDING]: 'Wedding',
  [EventType.BIRTHDAY]: 'Birthday',
  [EventType.ANNIVERSARY]: 'Anniversary',
  [EventType.GRADUATION]: 'Graduation',
  [EventType.BABY_SHOWER]: 'Baby Shower',
  [EventType.BRIDAL_SHOWER]: 'Bridal Shower',
  [EventType.CORPORATE]: 'Corporate Event',
  [EventType.CONFERENCE]: 'Conference',
  [EventType.WORKSHOP]: 'Workshop',
  [EventType.FUNDRAISER]: 'Fundraiser',
  [EventType.HOLIDAY_PARTY]: 'Holiday Party',
  [EventType.REUNION]: 'Reunion',
  [EventType.CELEBRATION]: 'Celebration',
  [EventType.OTHER]: 'Other',
} as const

export interface EventTypeSelectorProps {
  value?: EventType
  onChange: (value: EventType) => void
  error?: string
  disabled?: boolean
  className?: string
  'aria-label'?: string
}

export function EventTypeSelector({
  value,
  onChange,
  error,
  disabled = false,
  className,
  'aria-label': ariaLabel = 'Select event type'
}: EventTypeSelectorProps) {
  const handleKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLButtonElement>, eventType: EventType) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onChange(eventType)
    }
  }, [onChange])

  return (
    <div className={cn("space-y-2", className)}>
      <div
        role="radiogroup"
        aria-label={ariaLabel}
        aria-invalid={!!error}
        aria-describedby={error ? 'event-type-error' : undefined}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
      >
        {Object.values(EventType).map((eventType) => {
          const IconComponent = EVENT_TYPE_ICONS[eventType]
          const isSelected = value === eventType
          const label = EVENT_TYPE_LABELS[eventType]

          return (
            <button
              key={eventType}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`Select ${label}`}
              disabled={disabled}
              onClick={() => onChange(eventType)}
              onKeyDown={(e) => handleKeyDown(e, eventType)}
              className={cn(
                "group relative flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all duration-200",
                "hover:bg-accent hover:text-accent-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50",
                isSelected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:border-primary/50",
                error && !isSelected && "border-destructive/50"
              )}
            >
              <IconComponent
                className={cn(
                  "h-6 w-6 mb-2 transition-colors",
                  isSelected ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
                aria-hidden="true"
              />
              <span className={cn(
                "text-xs font-medium text-center leading-tight",
                isSelected ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
              )}>
                {label}
              </span>

              {/* Selection indicator */}
              {isSelected && (
                <div
                  className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full border-2 border-background"
                  aria-hidden="true"
                />
              )}
            </button>
          )
        })}
      </div>

      {error && (
        <p
          id="event-type-error"
          role="alert"
          className="text-sm text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  )
}

// Export types and constants for testing
export { EVENT_TYPE_ICONS, EVENT_TYPE_LABELS }