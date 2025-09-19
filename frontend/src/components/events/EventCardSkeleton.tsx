'use client'

import React from 'react'
import { Skeleton, SkeletonText, SkeletonButton, SkeletonAvatar } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'

interface EventCardSkeletonProps {
  className?: string
  viewMode?: 'grid' | 'list'
  showActions?: boolean
  count?: number
}

function SingleEventCardSkeleton({
  className,
  viewMode = 'grid',
  showActions = true
}: Omit<EventCardSkeletonProps, 'count'>) {
  if (viewMode === 'list') {
    return (
      <div className={cn(
        'bg-card rounded-lg border border-border p-4 shadow-sm',
        'flex items-center gap-4',
        className
      )}>
        {/* Event type icon skeleton */}
        <SkeletonAvatar size="md" />

        {/* Event info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0 mr-4">
              {/* Event name */}
              <Skeleton className="h-5 w-48 mb-2" />

              {/* Date and location */}
              <div className="flex items-center gap-4 text-sm">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>

            {/* Status badge */}
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>

          {/* Additional info row */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        </div>

        {/* Action buttons */}
        {showActions && (
          <div className="flex items-center gap-2">
            <SkeletonButton size="sm" variant="ghost" />
            <SkeletonButton size="sm" variant="ghost" />
            <SkeletonButton size="sm" variant="ghost" />
          </div>
        )}
      </div>
    )
  }

  // Grid view
  return (
    <div className={cn(
      'bg-card rounded-lg border border-border p-6 shadow-sm',
      'hover:shadow-md transition-shadow duration-200',
      className
    )}>
      {/* Header with status and menu */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <SkeletonAvatar size="sm" />
          <div>
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>

      {/* Event details */}
      <div className="space-y-4">
        {/* Event name */}
        <Skeleton className="h-6 w-full" />

        {/* Date and time */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>

        {/* Guest info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>

        {/* Budget progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </div>

      {/* Action buttons */}
      {showActions && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
          <div className="flex gap-2">
            <SkeletonButton size="sm" variant="outline" />
            <SkeletonButton size="sm" variant="outline" />
          </div>
          <SkeletonButton size="sm" />
        </div>
      )}
    </div>
  )
}

export function EventCardSkeleton({
  className,
  viewMode = 'grid',
  showActions = true,
  count = 1
}: EventCardSkeletonProps) {
  if (count === 1) {
    return (
      <SingleEventCardSkeleton
        className={className}
        viewMode={viewMode}
        showActions={showActions}
      />
    )
  }

  return (
    <div className={cn(
      viewMode === 'grid'
        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
        : 'space-y-4',
      className
    )}>
      {Array.from({ length: count }, (_, i) => (
        <SingleEventCardSkeleton
          key={i}
          viewMode={viewMode}
          showActions={showActions}
        />
      ))}
    </div>
  )
}

// Export the single component for standalone use
export { SingleEventCardSkeleton }

// Specialized skeletons for different contexts
export function EventGridSkeleton({
  className,
  count = 6
}: {
  className?: string
  count?: number
}) {
  return (
    <EventCardSkeleton
      className={className}
      viewMode="grid"
      count={count}
      showActions={true}
    />
  )
}

export function EventListSkeleton({
  className,
  count = 5
}: {
  className?: string
  count?: number
}) {
  return (
    <EventCardSkeleton
      className={className}
      viewMode="list"
      count={count}
      showActions={true}
    />
  )
}

// Compact version for dashboard widgets
export function EventCardCompactSkeleton({
  className,
  count = 3
}: {
  className?: string
  count?: number
}) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-3">
            <SkeletonAvatar size="sm" />
            <div className="flex-1 min-w-0">
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}