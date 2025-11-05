'use client'

/**
 * UnseatedGuestsIndicator Component
 *
 * Phase 6.1.5: Guest Assignment System
 * Persistent floating badge showing unseated guest count
 *
 * Features:
 * - Real-time calculation of unseated guests
 * - Color coding: green (all seated), yellow (50-79%), red (<50%)
 * - Click to toggle GuestSidebar
 * - Pulse animation when count changes
 * - Auto-refresh on assignment changes
 */

import React, { useState, useEffect, useMemo } from 'react'
import { Users, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import type { Guest, SeatingChartWithTables, UUID } from '@/types'
import { RsvpStatus as RsvpStatusEnum } from '@/types'

interface UnseatedGuestsIndicatorProps {
  guests: Guest[]
  seatingChart?: SeatingChartWithTables | null
  onClick?: () => void
  className?: string
}

/**
 * Check if a guest is already seated in the chart
 */
const isGuestSeated = (guestId: UUID, chart?: SeatingChartWithTables | null): boolean => {
  if (!chart || !chart.tables) return false

  // Check if any table has a seat assignment for this guest
  // For TableLayoutWithSeats[], we check seat_assignments
  for (const table of chart.tables) {
    if ('seat_assignments' in table && Array.isArray(table.seat_assignments)) {
      const hasAssignment = table.seat_assignments.some(
        (assignment) => assignment.guest_id === guestId
      )
      if (hasAssignment) return true
    }
  }

  return false
}

/**
 * Get color variant based on seating percentage
 */
const getVariant = (
  unseatedCount: number,
  totalAttending: number
): 'success' | 'default' | 'destructive' => {
  if (unseatedCount === 0) return 'success'

  const percentageSeated = totalAttending > 0
    ? ((totalAttending - unseatedCount) / totalAttending) * 100
    : 0

  if (percentageSeated >= 80) return 'success'
  if (percentageSeated >= 50) return 'default'
  return 'destructive'
}

/**
 * Get icon based on status
 */
const getIcon = (variant: 'success' | 'default' | 'destructive') => {
  switch (variant) {
    case 'success':
      return CheckCircle2
    case 'default':
      return Users
    case 'destructive':
      return AlertCircle
    default:
      return Users
  }
}

export function UnseatedGuestsIndicator({
  guests,
  seatingChart,
  onClick,
  className
}: UnseatedGuestsIndicatorProps) {
  const [previousCount, setPreviousCount] = useState<number | null>(null)
  const [shouldPulse, setShouldPulse] = useState(false)

  // Calculate unseated guests (attending guests without seat assignments)
  const { unseatedCount, totalAttending, percentageSeated } = useMemo(() => {
    const attendingGuests = guests.filter(g => g.rsvp_status === RsvpStatusEnum.ATTENDING)
    const unseatedGuests = attendingGuests.filter(g => !isGuestSeated(g.id, seatingChart))

    const totalAttending = attendingGuests.length
    const unseatedCount = unseatedGuests.length
    const percentageSeated = totalAttending > 0
      ? ((totalAttending - unseatedCount) / totalAttending) * 100
      : 0

    return {
      unseatedCount,
      totalAttending,
      percentageSeated
    }
  }, [guests, seatingChart])

  // Trigger pulse animation when count changes
  useEffect(() => {
    if (previousCount !== null && previousCount !== unseatedCount) {
      setShouldPulse(true)
      const timer = setTimeout(() => setShouldPulse(false), 1000)
      return () => clearTimeout(timer)
    }
    setPreviousCount(unseatedCount)
  }, [unseatedCount, previousCount])

  // Determine variant and icon
  const variant = getVariant(unseatedCount, totalAttending)
  const Icon = getIcon(variant)

  // Status message
  const statusMessage = useMemo(() => {
    if (unseatedCount === 0) {
      return 'All guests seated!'
    }
    if (totalAttending === 0) {
      return 'No attending guests'
    }
    return `${unseatedCount} of ${totalAttending} guests unseated`
  }, [unseatedCount, totalAttending])

  return (
    <button
      onClick={onClick}
      className={cn(
        'fixed top-20 right-4 z-30',
        'flex items-center gap-2 px-4 py-2 rounded-full shadow-lg',
        'transition-all duration-300 hover:scale-105 active:scale-95',
        'border-2',
        variant === 'success' && 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700',
        variant === 'default' && 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700',
        variant === 'destructive' && 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700',
        shouldPulse && 'animate-pulse',
        className
      )}
      aria-label={statusMessage}
    >
      {/* Icon */}
      <Icon
        className={cn(
          'w-5 h-5',
          variant === 'success' && 'text-green-700 dark:text-green-300',
          variant === 'default' && 'text-yellow-700 dark:text-yellow-300',
          variant === 'destructive' && 'text-red-700 dark:text-red-300'
        )}
      />

      {/* Badge with count */}
      <div className="flex flex-col items-start">
        <Badge
          variant={variant === 'success' ? 'secondary' : variant}
          className={cn(
            'text-sm font-semibold px-2',
            variant === 'success' && 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            variant === 'default' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            variant === 'destructive' && ''
          )}
        >
          {unseatedCount === 0 ? '✓' : unseatedCount} Unseated
        </Badge>

        {totalAttending > 0 && (
          <span
            className={cn(
              'text-xs font-medium mt-0.5',
              variant === 'success' && 'text-green-700 dark:text-green-300',
              variant === 'default' && 'text-yellow-700 dark:text-yellow-300',
              variant === 'destructive' && 'text-red-700 dark:text-red-300'
            )}
          >
            {percentageSeated.toFixed(0)}% seated
          </span>
        )}
      </div>

      {/* Visual indicator dot (pulsing if has unseated) */}
      {unseatedCount > 0 && (
        <span className="relative flex h-3 w-3">
          <span
            className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              variant === 'default' && 'bg-yellow-400',
              variant === 'destructive' && 'bg-red-400'
            )}
          />
          <span
            className={cn(
              'relative inline-flex rounded-full h-3 w-3',
              variant === 'default' && 'bg-yellow-500',
              variant === 'destructive' && 'bg-red-500'
            )}
          />
        </span>
      )}
    </button>
  )
}
