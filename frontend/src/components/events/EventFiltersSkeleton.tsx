'use client'

import React from 'react'
import { Skeleton, SkeletonButton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'

interface EventFiltersSkeletonProps {
  className?: string
  layout?: 'compact' | 'full'
  showAdvanced?: boolean
}

export function EventFiltersSkeleton({
  className,
  layout = 'full',
  showAdvanced = true
}: EventFiltersSkeletonProps) {
  if (layout === 'compact') {
    return (
      <div className={cn(
        'bg-card rounded-lg border border-border p-4',
        'flex items-center gap-4 flex-wrap',
        className
      )}>
        {/* Search input */}
        <div className="flex-1 min-w-64">
          <Skeleton className="h-10 w-full rounded-md" />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-2">
          <SkeletonButton size="md" variant="outline" />
          <SkeletonButton size="md" variant="outline" />
          <SkeletonButton size="md" variant="ghost" />
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      'bg-card rounded-lg border border-border p-6 space-y-6',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <SkeletonButton size="sm" variant="ghost" />
      </div>

      {/* Main filters row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search input */}
        <div className="sm:col-span-2">
          <Skeleton className="h-4 w-16 mb-2" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>

        {/* Event type dropdown */}
        <div>
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>

        {/* Status dropdown */}
        <div>
          <Skeleton className="h-4 w-12 mb-2" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </div>

      {/* Status filter chips */}
      <div>
        <Skeleton className="h-4 w-24 mb-3" />
        <div className="flex items-center gap-2 flex-wrap">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton
              key={i}
              className="h-8 w-16 rounded-full"
            />
          ))}
        </div>
      </div>

      {showAdvanced && (
        <>
          {/* Advanced filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Date range */}
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 flex-1 rounded-md" />
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-10 flex-1 rounded-md" />
              </div>
            </div>

            {/* Location filter */}
            <div>
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>

            {/* Guest count range */}
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 flex-1 rounded-md" />
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-10 flex-1 rounded-md" />
              </div>
            </div>
          </div>

          {/* Budget range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 flex-1 rounded-md" />
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-10 flex-1 rounded-md" />
              </div>
            </div>
            <div className="flex items-end">
              <SkeletonButton size="md" variant="outline" />
            </div>
          </div>

          {/* Quick date filters */}
          <div>
            <Skeleton className="h-4 w-28 mb-3" />
            <div className="flex items-center gap-2 flex-wrap">
              {['Today', 'This Week', 'This Month', 'Next Month'].map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-8 w-20 rounded-md"
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex items-center gap-2">
          <SkeletonButton size="sm" variant="ghost" />
          <SkeletonButton size="sm" />
        </div>
      </div>
    </div>
  )
}

// Minimal skeleton for inline filters
export function InlineEventFiltersSkeleton({
  className
}: {
  className?: string
}) {
  return (
    <div className={cn(
      'flex items-center gap-3 py-2',
      className
    )}>
      {/* Search */}
      <Skeleton className="h-8 w-48 rounded-md" />

      {/* Filter chips */}
      <div className="flex items-center gap-2">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton
            key={i}
            className="h-8 w-16 rounded-full"
          />
        ))}
      </div>

      {/* More filters button */}
      <SkeletonButton size="sm" variant="ghost" />
    </div>
  )
}

// Loading overlay for when filters are being applied
export function FilterLoadingOverlay({
  className
}: {
  className?: string
}) {
  return (
    <div className={cn(
      'absolute inset-0 bg-background/50 backdrop-blur-sm',
      'flex items-center justify-center rounded-lg z-10',
      className
    )}>
      <div className="bg-card rounded-lg border border-border p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="animate-spin">
            <Skeleton variant="circular" className="h-5 w-5" />
          </div>
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  )
}

// Mobile-specific filter skeleton
export function MobileEventFiltersSkeleton({
  className
}: {
  className?: string
}) {
  return (
    <div className={cn(
      'bg-card rounded-lg border border-border',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Skeleton className="h-5 w-16" />
        <SkeletonButton size="sm" variant="ghost" />
      </div>

      {/* Filter sections */}
      <div className="p-4 space-y-4">
        {/* Search */}
        <div>
          <Skeleton className="h-4 w-12 mb-2" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>

        {/* Categories */}
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i}>
            <Skeleton className="h-4 w-20 mb-2" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }, (_, j) => (
                <Skeleton
                  key={j}
                  className="h-8 w-16 rounded-full"
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-4 border-t border-border">
        <SkeletonButton size="md" variant="ghost" />
        <SkeletonButton size="md" />
      </div>
    </div>
  )
}