'use client'

/**
 * RSVPChart Component
 * Pure CSS donut chart displaying RSVP status breakdown
 */

import React from 'react'
import { RsvpStatus } from '@/types'
import { cn } from '@/lib/utils'

interface RSVPChartData {
  status: RsvpStatus
  count: number
  label: string
  color: string
  colorDark: string
}

interface RSVPChartProps {
  attending: number
  notAttending: number
  maybe: number
  pending: number
  className?: string
}

export function RSVPChart({
  attending,
  notAttending,
  maybe,
  pending,
  className
}: RSVPChartProps) {
  const total = attending + notAttending + maybe + pending

  // Prepare data for chart
  const data: RSVPChartData[] = [
    {
      status: RsvpStatus.ATTENDING,
      count: attending,
      label: 'Attending',
      color: '#10B981', // green-500
      colorDark: '#059669' // green-600
    },
    {
      status: RsvpStatus.NOT_ATTENDING,
      count: notAttending,
      label: 'Not Attending',
      color: '#EF4444', // red-500
      colorDark: '#DC2626' // red-600
    },
    {
      status: RsvpStatus.MAYBE,
      count: maybe,
      label: 'Maybe',
      color: '#F59E0B', // amber-500
      colorDark: '#D97706' // amber-600
    },
    {
      status: RsvpStatus.PENDING,
      count: pending,
      label: 'Pending',
      color: '#9CA3AF', // gray-400
      colorDark: '#6B7280' // gray-500
    }
  ].filter(item => item.count > 0)

  // Calculate percentages and angles for donut chart
  const segments = data.map(item => {
    const percentage = total > 0 ? (item.count / total) * 100 : 0
    return {
      ...item,
      percentage
    }
  })

  // Create conic gradient for donut chart
  let currentAngle = 0
  const gradientStops = segments.map(segment => {
    const startAngle = currentAngle
    const endAngle = currentAngle + (segment.percentage * 3.6) // 360 / 100
    currentAngle = endAngle

    return `var(--rsvp-${segment.status}) ${startAngle}deg ${endAngle}deg`
  }).join(', ')

  if (total === 0) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <div className="text-center">
          <p className="text-muted-foreground">No guest data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Chart */}
      <div className="flex items-center justify-center">
        <div className="relative w-64 h-64">
          {/* Donut chart using conic-gradient */}
          <div
            className="w-full h-full rounded-full"
            style={{
              background: `conic-gradient(${gradientStops})`,
              // CSS custom properties for colors (theme-aware)
              ['--rsvp-attending' as string]: segments.find(s => s.status === RsvpStatus.ATTENDING)?.color || '#10B981',
              ['--rsvp-not_attending' as string]: segments.find(s => s.status === RsvpStatus.NOT_ATTENDING)?.color || '#EF4444',
              ['--rsvp-maybe' as string]: segments.find(s => s.status === RsvpStatus.MAYBE)?.color || '#F59E0B',
              ['--rsvp-pending' as string]: segments.find(s => s.status === RsvpStatus.PENDING)?.color || '#9CA3AF'
            }}
          />

          {/* Center hole for donut effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-40 h-40 rounded-full bg-card shadow-sm flex flex-col items-center justify-center">
              <p className="text-4xl font-bold text-foreground">{total}</p>
              <p className="text-sm text-muted-foreground">Total Guests</p>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-4">
        {segments.map((segment) => (
          <div
            key={segment.status}
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 transition-colors hover:bg-muted"
          >
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: segment.color }}
              aria-hidden="true"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {segment.label}
              </p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold text-foreground">
                  {segment.count}
                </p>
                <p className="text-xs text-muted-foreground">
                  ({segment.percentage.toFixed(1)}%)
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Accessibility - Screen reader only text */}
      <div className="sr-only" role="status" aria-live="polite">
        RSVP Status breakdown: {attending} attending ({((attending / total) * 100).toFixed(1)}%),
        {notAttending} not attending ({((notAttending / total) * 100).toFixed(1)}%),
        {maybe} maybe ({((maybe / total) * 100).toFixed(1)}%),
        {pending} pending ({((pending / total) * 100).toFixed(1)}%)
      </div>
    </div>
  )
}
