'use client'

import {
  Calendar,
  CalendarDays,
  Users,
  DollarSign
} from 'lucide-react'
import { StatCard } from './StatCard'
import { useDashboardStats } from '@/hooks/api/useEventStats'
import { cn } from '@/lib/utils'

interface StatsCardsProps {
  className?: string
  showComparisons?: boolean
  previousPeriodData?: {
    totalEvents?: number
    upcomingEvents?: number
    totalGuests?: number
    totalBudget?: number
  }
}

export function StatsCards({
  className,
  showComparisons = true,
  previousPeriodData
}: StatsCardsProps) {
  const { data: stats, isLoading, error } = useDashboardStats()

  if (error) {
    return (
      <div className={cn(
        "rounded-lg border border-red-200 bg-red-50 p-6",
        className
      )}>
        <div className="flex items-center gap-2 text-red-800">
          <Calendar className="h-5 w-5" />
          <p className="font-medium">Failed to load dashboard statistics</p>
        </div>
        <p className="mt-2 text-sm text-red-600">
          {error.message || 'An error occurred while fetching data.'}
        </p>
      </div>
    )
  }

  const cards = [
    {
      title: 'Total Events',
      value: stats?.totalEvents ?? 0,
      previousValue: showComparisons ? previousPeriodData?.totalEvents : undefined,
      icon: Calendar,
      testId: 'total-events-card'
    },
    {
      title: 'Upcoming Events',
      value: stats?.upcomingEvents ?? 0,
      previousValue: showComparisons ? previousPeriodData?.upcomingEvents : undefined,
      icon: CalendarDays,
      testId: 'upcoming-events-card'
    },
    {
      title: 'Total Guests',
      value: stats?.totalGuests ?? 0,
      previousValue: showComparisons ? previousPeriodData?.totalGuests : undefined,
      icon: Users,
      testId: 'total-guests-card'
    },
    {
      title: 'Total Budget',
      value: stats?.totalBudget ?? 0,
      previousValue: showComparisons ? previousPeriodData?.totalBudget : undefined,
      icon: DollarSign,
      prefix: '$',
      testId: 'total-budget-card'
    }
  ]

  return (
    <div className={cn(className)}>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => (
          <StatCard
            key={card.testId}
            title={card.title}
            value={card.value}
            previousValue={card.previousValue}
            icon={card.icon}
            prefix={card.prefix}
            loading={isLoading}
            className="min-h-[120px]"
            data-testid={card.testId}
          />
        ))}
      </div>
    </div>
  )
}

// Loading state component for when we need to show just the loading cards
export function StatsCardsLoading({ className }: { className?: string }) {
  return (
    <div className={cn(className)}>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCard
            key={i}
            title=""
            value={0}
            icon={Calendar}
            loading={true}
            className="min-h-[120px]"
          />
        ))}
      </div>
    </div>
  )
}

// Error state component
export function StatsCardsError({
  error,
  onRetry,
  className
}: {
  error: Error
  onRetry?: () => void
  className?: string
}) {
  return (
    <div className={cn(
      "rounded-lg border border-red-200 bg-red-50 p-8 text-center",
      className
    )}>
      <Calendar className="mx-auto h-12 w-12 text-red-400 mb-4" />
      <h3 className="text-lg font-semibold text-red-800 mb-2">
        Failed to Load Statistics
      </h3>
      <p className="text-red-600 mb-4">
        {error.message || 'An error occurred while fetching dashboard data.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Try Again
        </button>
      )}
    </div>
  )
}