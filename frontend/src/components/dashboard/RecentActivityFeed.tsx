'use client'

import * as React from 'react'
import {
  Calendar,
  Users,
  DollarSign,
  Mail,
  Edit3,
  Clock,
  Activity,
  ArrowRight
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { EventActivity } from '@/types/event.types'
import { useRecentActivity } from '@/hooks/api/useEventStats'

interface RecentActivityFeedProps {
  className?: string
  limit?: number
  showViewAll?: boolean
  onViewAll?: () => void
}

interface ActivityItemProps {
  activity: EventActivity
  isLast?: boolean
}

function getActivityIcon(actionType: EventActivity['action_type']) {
  const iconMap = {
    created: Calendar,
    updated: Edit3,
    guest_added: Users,
    rsvp_received: Mail,
    expense_added: DollarSign,
    budget_updated: DollarSign,
  }

  return iconMap[actionType] || Activity
}

function getActivityColor(actionType: EventActivity['action_type']) {
  const colorMap = {
    created: 'text-green-600 bg-green-100',
    updated: 'text-blue-600 bg-blue-100',
    guest_added: 'text-purple-600 bg-purple-100',
    rsvp_received: 'text-orange-600 bg-orange-100',
    expense_added: 'text-red-600 bg-red-100',
    budget_updated: 'text-yellow-600 bg-yellow-100',
  }

  return colorMap[actionType] || 'text-muted-foreground bg-muted'
}

function ActivityItem({ activity, isLast = false }: ActivityItemProps) {
  const Icon = getActivityIcon(activity.action_type)
  const colorClasses = getActivityColor(activity.action_type)

  const timeAgo = React.useMemo(() => {
    try {
      return formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })
    } catch {
      return 'Recently'
    }
  }, [activity.created_at])

  return (
    <div className="flex items-start space-x-3">
      {/* Timeline line and icon */}
      <div className="relative">
        <div className={cn(
          'flex items-center justify-center w-8 h-8 rounded-full',
          colorClasses
        )}>
          <Icon className="w-4 h-4" />
        </div>
        {!isLast && (
          <div className="absolute top-8 left-1/2 w-0.5 h-8 bg-border transform -translate-x-1/2" />
        )}
      </div>

      {/* Activity content */}
      <div className="flex-1 min-w-0 pb-8">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-card-foreground">
            {activity.user_name}
          </p>
          <p className="text-xs text-muted-foreground flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {timeAgo}
          </p>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {activity.description}
        </p>
      </div>
    </div>
  )
}

function ActivitySkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-start space-x-3 animate-pulse">
          <div className="w-8 h-8 bg-muted-foreground/20 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-muted-foreground/20 rounded w-1/4" />
              <div className="h-3 bg-muted-foreground/20 rounded w-16" />
            </div>
            <div className="h-4 bg-muted-foreground/20 rounded w-3/4" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyActivity() {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
        <Activity className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-medium text-card-foreground mb-1">
        No recent activity
      </h3>
      <p className="text-sm text-muted-foreground">
        Activity will appear here as you work on your events
      </p>
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <Activity className="w-8 h-8 text-destructive" />
      </div>
      <h3 className="text-sm font-medium text-card-foreground mb-1">
        Unable to load activity
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        There was an error loading your recent activity
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

export function RecentActivityFeed({
  className,
  limit = 10,
  showViewAll = true,
  onViewAll
}: RecentActivityFeedProps) {
  const {
    data: activities,
    isLoading,
    error,
    refetch
  } = useRecentActivity(limit)

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll()
    } else {
      // TODO: Navigate to full activity page when implemented
      console.log('View all activities')
    }
  }

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
            <Activity className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-card-foreground">
              Recent Activity
            </h2>
          </div>
          {showViewAll && activities && activities.length > 0 && (
            <button
              onClick={handleViewAll}
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
          <ActivitySkeleton />
        ) : error ? (
          <ErrorState onRetry={handleRetry} />
        ) : !activities || activities.length === 0 ? (
          <EmptyActivity />
        ) : (
          <div className="space-y-0">
            {activities.map((activity, index) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                isLast={index === activities.length - 1}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {activities && activities.length > 0 && !isLoading && (
        <div className="px-6 py-3 bg-muted border-t border-border rounded-b-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Showing {activities.length} recent {activities.length === 1 ? 'activity' : 'activities'}
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