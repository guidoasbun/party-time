'use client'

import React from 'react'
import { cn } from '@/lib/utils'

// Base Skeleton component
export interface SkeletonProps {
  className?: string
  variant?: 'default' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
  children?: React.ReactNode
}

export function Skeleton({
  className,
  variant = 'default',
  width,
  height,
  animation = 'pulse',
  children,
  ...props
}: SkeletonProps & React.HTMLAttributes<HTMLDivElement>) {
  const baseClasses = cn(
    'bg-gray-200 dark:bg-gray-700',
    {
      'animate-pulse': animation === 'pulse',
      'animate-shimmer': animation === 'wave',
      'rounded-md': variant === 'default',
      'rounded-full': variant === 'circular',
      'rounded-lg': variant === 'rectangular',
    },
    className
  )

  const styles: React.CSSProperties = {}
  if (width) styles.width = typeof width === 'number' ? `${width}px` : width
  if (height) styles.height = typeof height === 'number' ? `${height}px` : height

  return (
    <div className={baseClasses} style={styles} {...props}>
      {children}
    </div>
  )
}

// Text skeleton component
export interface SkeletonTextProps {
  lines?: number
  className?: string
  width?: string | string[]
  spacing?: 'tight' | 'normal' | 'loose'
  size?: 'sm' | 'base' | 'lg' | 'xl'
}

export function SkeletonText({
  lines = 1,
  className,
  width = '100%',
  spacing = 'normal',
  size = 'base'
}: SkeletonTextProps) {
  const widths = Array.isArray(width) ? width : Array(lines).fill(width)

  const spaceClasses = {
    tight: 'space-y-1',
    normal: 'space-y-2',
    loose: 'space-y-3'
  }

  const heightClasses = {
    sm: 'h-3',
    base: 'h-4',
    lg: 'h-5',
    xl: 'h-6'
  }

  return (
    <div className={cn(spaceClasses[spacing], className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          className={cn(heightClasses[size], 'rounded')}
          style={{ width: widths[i] || widths[0] }}
        />
      ))}
    </div>
  )
}

// Card skeleton component
export interface SkeletonCardProps {
  className?: string
  showHeader?: boolean
  showFooter?: boolean
  headerHeight?: number
  contentLines?: number
  footerHeight?: number
  padding?: 'sm' | 'md' | 'lg'
}

export function SkeletonCard({
  className,
  showHeader = true,
  showFooter = false,
  headerHeight = 48,
  contentLines = 3,
  footerHeight = 40,
  padding = 'md'
}: SkeletonCardProps) {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  }

  return (
    <div className={cn(
      'bg-card rounded-lg border border-border shadow-sm',
      paddingClasses[padding],
      className
    )}>
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <Skeleton height={headerHeight} width="60%" />
          <Skeleton variant="circular" width={32} height={32} />
        </div>
      )}

      <div className="space-y-3">
        <SkeletonText lines={contentLines} width={['100%', '85%', '70%']} />
      </div>

      {showFooter && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t">
          <Skeleton height={footerHeight} width="40%" />
          <div className="flex gap-2">
            <Skeleton width={80} height={32} className="rounded" />
            <Skeleton width={80} height={32} className="rounded" />
          </div>
        </div>
      )}
    </div>
  )
}

// Button skeleton component
export interface SkeletonButtonProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'ghost'
  fullWidth?: boolean
}

export function SkeletonButton({
  className,
  size = 'md',
  variant = 'default',
  fullWidth = false
}: SkeletonButtonProps) {
  const sizeClasses = {
    sm: 'h-8 px-3',
    md: 'h-10 px-4',
    lg: 'h-11 px-6'
  }

  const variantClasses = {
    default: 'bg-gray-200 dark:bg-gray-700',
    outline: 'border border-gray-200 dark:border-gray-700 bg-transparent',
    ghost: 'bg-gray-100 dark:bg-gray-800'
  }

  return (
    <Skeleton
      className={cn(
        'rounded-md',
        sizeClasses[size],
        variantClasses[variant],
        fullWidth && 'w-full',
        className
      )}
    />
  )
}

// Avatar skeleton component
export interface SkeletonAvatarProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function SkeletonAvatar({
  className,
  size = 'md'
}: SkeletonAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  return (
    <Skeleton
      variant="circular"
      className={cn(sizeClasses[size], className)}
    />
  )
}

// List item skeleton component
export interface SkeletonListItemProps {
  className?: string
  showAvatar?: boolean
  showActions?: boolean
  avatarSize?: 'sm' | 'md' | 'lg'
  actionCount?: number
}

export function SkeletonListItem({
  className,
  showAvatar = true,
  showActions = true,
  avatarSize = 'md',
  actionCount = 2
}: SkeletonListItemProps) {
  return (
    <div className={cn('flex items-center gap-3 py-3', className)}>
      {showAvatar && <SkeletonAvatar size={avatarSize} />}

      <div className="flex-1 min-w-0">
        <SkeletonText lines={2} width={['70%', '50%']} spacing="tight" />
      </div>

      {showActions && (
        <div className="flex gap-2">
          {Array.from({ length: actionCount }, (_, i) => (
            <SkeletonButton key={i} size="sm" variant="ghost" />
          ))}
        </div>
      )}
    </div>
  )
}

// Grid skeleton component
export interface SkeletonGridProps {
  className?: string
  columns?: number
  gap?: 'sm' | 'md' | 'lg'
  itemCount?: number
  itemComponent?: React.ComponentType<{ className?: string }>
}

export function SkeletonGrid({
  className,
  columns = 3,
  gap = 'md',
  itemCount = 6,
  itemComponent: ItemComponent = SkeletonCard
}: SkeletonGridProps) {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  }

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <div className={cn(
      'grid',
      gridCols[columns as keyof typeof gridCols] || `grid-cols-${columns}`,
      gapClasses[gap],
      className
    )}>
      {Array.from({ length: itemCount }, (_, i) => (
        <ItemComponent key={i} />
      ))}
    </div>
  )
}