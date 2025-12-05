'use client'

/**
 * Loading State Components
 * Phase 8.2: UI Polish - Consistent loading skeletons across the app
 */

import React from 'react'
import { cn } from '@/lib/utils'
import { Skeleton, SkeletonCard, SkeletonText, SkeletonGrid } from './Skeleton'

// ============================================================================
// Page-Level Loading States
// ============================================================================

/**
 * Dashboard page loading skeleton
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Recent Events Section */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Events list page loading skeleton
 */
export function EventsPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Filters skeleton */}
      <div className="p-4 bg-card rounded-lg border border-border">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      {/* Event cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <EventCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

/**
 * Guest list page loading skeleton
 */
export function GuestListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 bg-card rounded-lg border border-border">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-12" />
          </div>
        ))}
      </div>

      {/* Table header */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 flex-1 max-w-sm" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Table rows */}
        <div className="divide-y divide-border">
          {Array.from({ length: 8 }).map((_, i) => (
            <GuestRowSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Event detail page loading skeleton
 */
export function EventDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-32" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-24" />
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <SkeletonCard contentLines={4} showFooter />
          <SkeletonCard contentLines={3} />
        </div>
        <div className="space-y-4">
          <SkeletonCard contentLines={6} />
          <SkeletonCard contentLines={4} />
        </div>
      </div>
    </div>
  )
}

/**
 * Form page loading skeleton
 */
export function FormSkeleton({ fields = 6 }: { fields?: number }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Form fields */}
      <div className="bg-card rounded-lg border border-border p-6 space-y-6">
        {Array.from({ length: fields }).map((_, i) => (
          <FormFieldSkeleton key={i} />
        ))}

        {/* Submit button */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Component-Level Loading States
// ============================================================================

/**
 * Stat card loading skeleton
 */
export function StatCardSkeleton() {
  return (
    <div className="p-6 bg-card rounded-lg border border-border">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton variant="circular" width={48} height={48} />
      </div>
      <Skeleton className="h-3 w-32 mt-4" />
    </div>
  )
}

/**
 * Event card loading skeleton
 */
export function EventCardSkeleton() {
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* Image placeholder */}
      <Skeleton className="h-40 w-full rounded-none" />

      <div className="p-4 space-y-3">
        {/* Title and status */}
        <div className="flex items-start justify-between">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>

        {/* Date and location */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton variant="circular" width={16} height={16} />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton variant="circular" width={16} height={16} />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <Skeleton className="h-4 w-24" />
          <div className="flex gap-1">
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="circular" width={32} height={32} />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Guest table row loading skeleton
 */
export function GuestRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4">
      <Skeleton className="h-5 w-5 rounded" />
      <Skeleton variant="circular" width={40} height={40} />
      <div className="flex-1 min-w-0">
        <Skeleton className="h-5 w-32 mb-1" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-6 w-20 rounded-full hidden sm:block" />
      <Skeleton className="h-6 w-16 rounded-full hidden md:block" />
      <div className="flex gap-1">
        <Skeleton variant="circular" width={32} height={32} />
        <Skeleton variant="circular" width={32} height={32} />
      </div>
    </div>
  )
}

/**
 * Form field loading skeleton
 */
export function FormFieldSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-full" />
    </div>
  )
}

/**
 * Navigation item loading skeleton
 */
export function NavItemSkeleton() {
  return (
    <div className="flex items-center gap-3 px-3 py-2">
      <Skeleton variant="circular" width={20} height={20} />
      <Skeleton className="h-4 w-24" />
    </div>
  )
}

// ============================================================================
// Inline Loading States
// ============================================================================

interface InlineLoaderProps {
  text?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

/**
 * Inline loading spinner with optional text
 */
export function InlineLoader({ text, size = 'md', className }: InlineLoaderProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-current border-t-transparent text-primary',
          sizeClasses[size]
        )}
        role="status"
        aria-label="Loading"
      />
      {text && (
        <span className={cn('text-muted-foreground', textSizeClasses[size])}>
          {text}
        </span>
      )}
    </div>
  )
}

// ============================================================================
// Full Page Loading States
// ============================================================================

interface PageLoaderProps {
  message?: string
  className?: string
}

/**
 * Full page centered loading state
 */
export function PageLoader({ message = 'Loading...', className }: PageLoaderProps) {
  return (
    <div
      className={cn(
        'min-h-[400px] flex items-center justify-center',
        className
      )}
    >
      <div className="text-center px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
        <p className="mt-4 text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

/**
 * Full screen loading overlay
 */
export function FullScreenLoader({ message = 'Loading...' }: PageLoaderProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="text-center px-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto" />
        <p className="mt-6 text-lg text-foreground">{message}</p>
      </div>
    </div>
  )
}
