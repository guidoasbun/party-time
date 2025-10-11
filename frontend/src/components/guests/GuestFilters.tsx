'use client'

/**
 * GuestFilters Component
 * Filter controls for guest list with filter chips display
 */

import React from 'react'
import { X, Filter } from 'lucide-react'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { RsvpStatus } from '@/types'
import { cn } from '@/lib/utils'

export interface GuestFilterValues {
  rsvp_statuses: RsvpStatus[]
  plus_one_filter: 'all' | 'allowed' | 'confirmed'
  dietary_restrictions: 'all' | 'has' | 'none'
}

interface GuestFiltersProps {
  filters: GuestFilterValues
  onFiltersChange: (filters: GuestFilterValues) => void
  className?: string
}

const rsvpStatusOptions = [
  { value: RsvpStatus.ATTENDING, label: 'Attending' },
  { value: RsvpStatus.NOT_ATTENDING, label: 'Not Attending' },
  { value: RsvpStatus.PENDING, label: 'Pending' },
  { value: RsvpStatus.MAYBE, label: 'Maybe' }
]

const plusOneOptions = [
  { value: 'all', label: 'All Guests' },
  { value: 'allowed', label: 'Plus-One Allowed' },
  { value: 'confirmed', label: 'Plus-One Confirmed' }
]

const dietaryOptions = [
  { value: 'all', label: 'All Dietary Preferences' },
  { value: 'has', label: 'Has Restrictions' },
  { value: 'none', label: 'No Restrictions' }
]

export function GuestFilters({
  filters,
  onFiltersChange,
  className
}: GuestFiltersProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)

  const hasActiveFilters =
    filters.rsvp_statuses.length > 0 ||
    filters.plus_one_filter !== 'all' ||
    filters.dietary_restrictions !== 'all'

  const clearAllFilters = () => {
    onFiltersChange({
      rsvp_statuses: [],
      plus_one_filter: 'all',
      dietary_restrictions: 'all'
    })
  }

  const removeRsvpStatus = (status: RsvpStatus) => {
    onFiltersChange({
      ...filters,
      rsvp_statuses: filters.rsvp_statuses.filter(s => s !== status)
    })
  }

  const getRsvpStatusLabel = (status: RsvpStatus): string => {
    const option = rsvpStatusOptions.find(opt => opt.value === status)
    return option?.label || status
  }

  const getPlusOneLabel = (): string | null => {
    if (filters.plus_one_filter === 'all') return null
    const option = plusOneOptions.find(opt => opt.value === filters.plus_one_filter)
    return option?.label || null
  }

  const getDietaryLabel = (): string | null => {
    if (filters.dietary_restrictions === 'all') return null
    const option = dietaryOptions.find(opt => opt.value === filters.dietary_restrictions)
    return option?.label || null
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
              {filters.rsvp_statuses.length +
                (filters.plus_one_filter !== 'all' ? 1 : 0) +
                (filters.dietary_restrictions !== 'all' ? 1 : 0)}
            </span>
          )}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Filter Controls */}
      {isExpanded && (
        <div className="space-y-4 p-4 border border-border rounded-lg bg-card">
          {/* RSVP Status Filter */}
          <Select
            label="RSVP Status"
            options={rsvpStatusOptions}
            value={filters.rsvp_statuses}
            onValueChange={(value) => {
              onFiltersChange({
                ...filters,
                rsvp_statuses: value as RsvpStatus[]
              })
            }}
            placeholder="All RSVP Statuses"
            multiple
          />

          {/* Plus-One Filter */}
          <Select
            label="Plus-One Status"
            options={plusOneOptions}
            value={filters.plus_one_filter}
            onValueChange={(value) => {
              onFiltersChange({
                ...filters,
                plus_one_filter: value as 'all' | 'allowed' | 'confirmed'
              })
            }}
            placeholder="Select plus-one filter"
          />

          {/* Dietary Restrictions Filter */}
          <Select
            label="Dietary Restrictions"
            options={dietaryOptions}
            value={filters.dietary_restrictions}
            onValueChange={(value) => {
              onFiltersChange({
                ...filters,
                dietary_restrictions: value as 'all' | 'has' | 'none'
              })
            }}
            placeholder="Select dietary filter"
          />
        </div>
      )}

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {/* RSVP Status Chips */}
          {filters.rsvp_statuses.map(status => (
            <div
              key={status}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm font-medium"
            >
              <span>{getRsvpStatusLabel(status)}</span>
              <button
                type="button"
                onClick={() => removeRsvpStatus(status)}
                className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors"
                aria-label={`Remove ${getRsvpStatusLabel(status)} filter`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}

          {/* Plus-One Chip */}
          {getPlusOneLabel() && (
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-sm font-medium">
              <span>{getPlusOneLabel()}</span>
              <button
                type="button"
                onClick={() => onFiltersChange({ ...filters, plus_one_filter: 'all' })}
                className="hover:bg-green-200 dark:hover:bg-green-800 rounded-full p-0.5 transition-colors"
                aria-label="Remove plus-one filter"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Dietary Chip */}
          {getDietaryLabel() && (
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-sm font-medium">
              <span>{getDietaryLabel()}</span>
              <button
                type="button"
                onClick={() => onFiltersChange({ ...filters, dietary_restrictions: 'all' })}
                className="hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-0.5 transition-colors"
                aria-label="Remove dietary filter"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
