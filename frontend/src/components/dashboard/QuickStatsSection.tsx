'use client'

import * as React from 'react'
import { TrendingUp, TrendingDown, Calendar, Users, DollarSign, PartyPopper, Clock, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatsCards } from './StatsCards'
import { useDashboardStats } from '@/hooks/api/useEventStats'

interface QuickStatsSectionProps {
  className?: string
}

interface TrendItemProps {
  label: string
  value: string
  trend: number
  icon: React.ElementType
  color: 'blue' | 'green' | 'purple' | 'orange'
}

function TrendItem({ label, value, trend, icon: Icon, color }: TrendItemProps) {
  const isPositive = trend >= 0

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  }

  return (
    <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
      <div className={cn(
        'flex items-center justify-center w-8 h-8 rounded-full',
        colorClasses[color]
      )}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">{label}</span>
          <div className="flex items-center space-x-1">
            {isPositive ? (
              <TrendingUp className="w-3 h-3 text-green-500" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-500" />
            )}
            <span className={cn(
              'text-xs font-medium',
              isPositive ? 'text-green-600' : 'text-red-600'
            )}>
              {Math.abs(trend)}%
            </span>
          </div>
        </div>
        <span className="text-lg font-semibold text-foreground">{value}</span>
      </div>
    </div>
  )
}

function QuickInsights() {
  const { data: stats, isLoading } = useDashboardStats()

  if (isLoading || !stats) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-3 p-3 bg-muted rounded-lg animate-pulse">
            <div className="w-8 h-8 bg-muted-foreground/20 rounded-full" />
            <div className="flex-1">
              <div className="h-4 bg-muted-foreground/20 rounded w-3/4 mb-2" />
              <div className="h-5 bg-muted-foreground/20 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  const insights = [
    {
      label: 'This Month',
      value: `${stats.upcomingEvents} events`,
      trend: 15,
      icon: Calendar,
      color: 'blue' as const
    },
    {
      label: 'Total Guests',
      value: stats.totalGuests.toLocaleString(),
      trend: 8,
      icon: Users,
      color: 'green' as const
    },
    {
      label: 'RSVP Rate',
      value: `${stats.avgRsvpRate}%`,
      trend: 5,
      icon: CheckCircle,
      color: 'purple' as const
    }
  ]

  return (
    <div className="space-y-3">
      {insights.map((insight, index) => (
        <TrendItem key={index} {...insight} />
      ))}
    </div>
  )
}

function StatsSummary() {
  const { data: stats, isLoading, error } = useDashboardStats()

  if (error) {
    return (
      <div className="text-center py-4">
        <div className="text-red-500 mb-2">
          <PartyPopper className="w-8 h-8 mx-auto opacity-50" />
        </div>
        <p className="text-sm text-red-600">Unable to load statistics</p>
      </div>
    )
  }

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="text-center py-4 animate-pulse">
            <div className="w-8 h-8 bg-muted-foreground/20 rounded mx-auto mb-2" />
            <div className="h-4 bg-muted-foreground/20 rounded w-3/4 mx-auto mb-1" />
            <div className="h-3 bg-muted-foreground/20 rounded w-1/2 mx-auto" />
          </div>
        ))}
      </div>
    )
  }

  const summaryItems = [
    {
      label: 'Total Events',
      value: stats.totalEvents,
      icon: Calendar,
      color: 'text-blue-600'
    },
    {
      label: 'Active Events',
      value: stats.upcomingEvents,
      icon: Clock,
      color: 'text-orange-600'
    },
    {
      label: 'Completed',
      value: stats.completedEvents,
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      label: 'Total Budget',
      value: `$${(stats.totalBudget / 1000).toFixed(0)}k`,
      icon: DollarSign,
      color: 'text-purple-600'
    }
  ]

  return (
    <div className="grid grid-cols-2 gap-4">
      {summaryItems.map((item, index) => (
        <div key={index} className="text-center py-4">
          <item.icon className={cn('w-8 h-8 mx-auto mb-2', item.color)} />
          <div className="text-2xl font-bold text-foreground">
            {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
          </div>
          <div className="text-sm text-muted-foreground">{item.label}</div>
        </div>
      ))}
    </div>
  )
}

export function QuickStatsSection({ className }: QuickStatsSectionProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Main Stats Cards */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Dashboard Overview
        </h2>
        <StatsCards />
      </div>

      {/* Quick Insights and Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Insights */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-card-foreground">
              Quick Insights
            </h3>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <QuickInsights />
        </div>

        {/* Summary Stats */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-card-foreground">
              At a Glance
            </h3>
            <PartyPopper className="w-5 h-5 text-purple-500" />
          </div>
          <StatsSummary />
        </div>
      </div>
    </div>
  )
}