'use client'

/**
 * Loading skeleton for event detail page
 */

import React from 'react'
import { Skeleton, SkeletonText, SkeletonButton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'

interface EventDetailSkeletonProps {
  className?: string
}

export function EventDetailSkeleton({ className }: EventDetailSkeletonProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton width={60} height={16} />
        <Skeleton width={16} height={16} variant="circular" />
        <Skeleton width={80} height={16} />
        <Skeleton width={16} height={16} variant="circular" />
        <Skeleton width={120} height={16} />
      </div>

      {/* Header Section */}
      <div className="bg-card rounded-lg border border-border shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          {/* Left side - Event info */}
          <div className="flex-1 space-y-3">
            {/* Event type and status badges */}
            <div className="flex items-center gap-2">
              <Skeleton width={80} height={24} className="rounded-full" />
              <Skeleton width={90} height={24} className="rounded-full" />
            </div>

            {/* Event title */}
            <Skeleton width="60%" height={32} />

            {/* Event details */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton variant="circular" width={20} height={20} />
                <Skeleton width={180} height={20} />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton variant="circular" width={20} height={20} />
                <Skeleton width={160} height={20} />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton variant="circular" width={20} height={20} />
                <Skeleton width={140} height={20} />
              </div>
            </div>
          </div>

          {/* Right side - Action buttons */}
          <div className="flex flex-wrap gap-2">
            <SkeletonButton size="md" />
            <SkeletonButton size="md" />
            <SkeletonButton size="md" />
            <SkeletonButton size="md" variant="outline" />
          </div>
        </div>
      </div>

      {/* Content placeholder for tabs/sections */}
      <div className="bg-card rounded-lg border border-border shadow-sm p-6">
        <div className="space-y-4">
          <Skeleton width="40%" height={24} />
          <SkeletonText lines={3} width={['100%', '90%', '85%']} />
        </div>
      </div>
    </div>
  )
}
