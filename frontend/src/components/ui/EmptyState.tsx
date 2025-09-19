'use client'

import React from 'react'
import {
  PartyPopper,
  Search,
  Filter,
  Calendar,
  Users,
  Plus,
  FileX,
  Inbox,
  MapPin,
  DollarSign,
  Clock,
  Archive,
  AlertCircle
} from 'lucide-react'
import { Button } from './Button'
import { cn } from '@/lib/utils'

export type EmptyStateVariant =
  | 'default'
  | 'search'
  | 'filter'
  | 'events'
  | 'guests'
  | 'venues'
  | 'budget'
  | 'recent'
  | 'upcoming'
  | 'archived'
  | 'error'

interface EmptyStateProps {
  variant?: EmptyStateVariant
  title?: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  illustration?: React.ReactNode
  primaryAction?: {
    label: string
    onClick: () => void
    icon?: React.ComponentType<{ className?: string }>
  }
  secondaryAction?: {
    label: string
    onClick: () => void
    variant?: 'default' | 'outline' | 'ghost'
  }
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showBackground?: boolean
}

const variantConfig = {
  default: {
    icon: Inbox,
    title: 'No items found',
    description: 'There are no items to display at the moment.',
    bgColor: 'bg-gray-50 dark:bg-gray-800/50'
  },
  search: {
    icon: Search,
    title: 'No search results',
    description: 'We couldn\'t find any results matching your search. Try adjusting your search terms.',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20'
  },
  filter: {
    icon: Filter,
    title: 'No matches found',
    description: 'No items match your current filters. Try adjusting or clearing your filters.',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20'
  },
  events: {
    icon: PartyPopper,
    title: 'No events yet',
    description: 'Start planning your first event and bring your celebration to life!',
    bgColor: 'bg-pink-50 dark:bg-pink-900/20'
  },
  guests: {
    icon: Users,
    title: 'No guests added',
    description: 'Add guests to your event to start managing your guest list.',
    bgColor: 'bg-green-50 dark:bg-green-900/20'
  },
  venues: {
    icon: MapPin,
    title: 'No venues found',
    description: 'Search for venues in your area or add a custom venue location.',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20'
  },
  budget: {
    icon: DollarSign,
    title: 'No budget items',
    description: 'Start tracking your event expenses by adding budget categories and items.',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20'
  },
  recent: {
    icon: Clock,
    title: 'No recent activity',
    description: 'Recent changes and updates to your events will appear here.',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20'
  },
  upcoming: {
    icon: Calendar,
    title: 'No upcoming events',
    description: 'All your upcoming events will be displayed here.',
    bgColor: 'bg-sky-50 dark:bg-sky-900/20'
  },
  archived: {
    icon: Archive,
    title: 'No archived events',
    description: 'Completed or archived events will appear here.',
    bgColor: 'bg-gray-50 dark:bg-gray-800/50'
  },
  error: {
    icon: AlertCircle,
    title: 'Unable to load',
    description: 'We encountered an error while loading this content.',
    bgColor: 'bg-red-50 dark:bg-red-900/20'
  }
}

const sizeConfig = {
  sm: {
    container: 'py-8 px-4',
    icon: 'w-12 h-12',
    title: 'text-lg',
    description: 'text-sm',
    spacing: 'space-y-3'
  },
  md: {
    container: 'py-12 px-6',
    icon: 'w-16 h-16',
    title: 'text-xl',
    description: 'text-base',
    spacing: 'space-y-4'
  },
  lg: {
    container: 'py-16 px-8',
    icon: 'w-20 h-20',
    title: 'text-2xl',
    description: 'text-lg',
    spacing: 'space-y-6'
  }
}

export function EmptyState({
  variant = 'default',
  title,
  description,
  icon,
  illustration,
  primaryAction,
  secondaryAction,
  className,
  size = 'md',
  showBackground = true
}: EmptyStateProps) {
  const config = variantConfig[variant]
  const sizeStyles = sizeConfig[size]
  const IconComponent = icon || config.icon

  const displayTitle = title || config.title
  const displayDescription = description || config.description

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        sizeStyles.container,
        showBackground && config.bgColor,
        showBackground && 'rounded-lg border border-border',
        className
      )}
    >
      <div className={cn('flex flex-col items-center', sizeStyles.spacing)}>
        {/* Illustration or Icon */}
        {illustration ? (
          <div className="mb-2">
            {illustration}
          </div>
        ) : (
          <div className={cn(
            'rounded-full p-4 mb-2',
            'bg-muted/50 border border-border/50',
            sizeStyles.icon === 'w-12 h-12' && 'p-3',
            sizeStyles.icon === 'w-20 h-20' && 'p-5'
          )}>
            <IconComponent
              className={cn(
                sizeStyles.icon,
                'text-muted-foreground'
              )}
              aria-hidden="true"
            />
          </div>
        )}

        {/* Content */}
        <div className={cn('max-w-md space-y-2', sizeStyles.spacing)}>
          <h3 className={cn(
            'font-semibold text-foreground',
            sizeStyles.title
          )}>
            {displayTitle}
          </h3>

          <p className={cn(
            'text-muted-foreground leading-relaxed',
            sizeStyles.description
          )}>
            {displayDescription}
          </p>
        </div>

        {/* Actions */}
        {(primaryAction || secondaryAction) && (
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {primaryAction && (
              <Button
                onClick={primaryAction.onClick}
                className="gap-2"
                size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
              >
                {primaryAction.icon && (
                  <primaryAction.icon className="w-4 h-4" />
                )}
                {primaryAction.label}
              </Button>
            )}

            {secondaryAction && (
              <Button
                variant={secondaryAction.variant || 'outline'}
                onClick={secondaryAction.onClick}
                size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
              >
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Specialized empty state components for common scenarios
export function EventsEmptyState({
  onCreateEvent,
  ...props
}: Omit<EmptyStateProps, 'variant' | 'primaryAction'> & {
  onCreateEvent?: () => void
}) {
  return (
    <EmptyState
      variant="events"
      primaryAction={onCreateEvent ? {
        label: 'Create Your First Event',
        onClick: onCreateEvent,
        icon: Plus
      } : undefined}
      {...props}
    />
  )
}

export function SearchEmptyState({
  searchTerm,
  onClearSearch,
  ...props
}: Omit<EmptyStateProps, 'variant' | 'description' | 'secondaryAction'> & {
  searchTerm?: string
  onClearSearch?: () => void
}) {
  return (
    <EmptyState
      variant="search"
      description={
        searchTerm
          ? `No results found for "${searchTerm}". Try different keywords or check your spelling.`
          : 'No search results found. Try different keywords.'
      }
      secondaryAction={onClearSearch ? {
        label: 'Clear Search',
        onClick: onClearSearch,
        variant: 'ghost'
      } : undefined}
      {...props}
    />
  )
}

export function FilterEmptyState({
  onClearFilters,
  filterCount,
  ...props
}: Omit<EmptyStateProps, 'variant' | 'description' | 'secondaryAction'> & {
  onClearFilters?: () => void
  filterCount?: number
}) {
  return (
    <EmptyState
      variant="filter"
      description={
        filterCount
          ? `No items match your ${filterCount} active filter${filterCount > 1 ? 's' : ''}. Try adjusting or clearing some filters.`
          : 'No items match your current filters. Try adjusting or clearing your filters.'
      }
      secondaryAction={onClearFilters ? {
        label: 'Clear Filters',
        onClick: onClearFilters,
        variant: 'outline'
      } : undefined}
      {...props}
    />
  )
}

export function GuestsEmptyState({
  onAddGuest,
  onImportGuests,
  ...props
}: Omit<EmptyStateProps, 'variant' | 'primaryAction' | 'secondaryAction'> & {
  onAddGuest?: () => void
  onImportGuests?: () => void
}) {
  return (
    <EmptyState
      variant="guests"
      primaryAction={onAddGuest ? {
        label: 'Add Guest',
        onClick: onAddGuest,
        icon: Plus
      } : undefined}
      secondaryAction={onImportGuests ? {
        label: 'Import Guests',
        onClick: onImportGuests,
        variant: 'outline'
      } : undefined}
      {...props}
    />
  )
}

export function VenuesEmptyState({
  onSearchVenues,
  onAddCustomVenue,
  ...props
}: Omit<EmptyStateProps, 'variant' | 'primaryAction' | 'secondaryAction'> & {
  onSearchVenues?: () => void
  onAddCustomVenue?: () => void
}) {
  return (
    <EmptyState
      variant="venues"
      primaryAction={onSearchVenues ? {
        label: 'Search Venues',
        onClick: onSearchVenues,
        icon: Search
      } : undefined}
      secondaryAction={onAddCustomVenue ? {
        label: 'Add Custom Venue',
        onClick: onAddCustomVenue,
        variant: 'outline'
      } : undefined}
      {...props}
    />
  )
}

export function ErrorEmptyState({
  onRetry,
  errorMessage,
  ...props
}: Omit<EmptyStateProps, 'variant' | 'description' | 'primaryAction'> & {
  onRetry?: () => void
  errorMessage?: string
}) {
  return (
    <EmptyState
      variant="error"
      description={errorMessage || 'We encountered an error while loading this content. Please try again.'}
      primaryAction={onRetry ? {
        label: 'Try Again',
        onClick: onRetry
      } : undefined}
      {...props}
    />
  )
}

// Loading-specific empty state (used during loading)
export function LoadingEmptyState({
  message = 'Loading...',
  ...props
}: Omit<EmptyStateProps, 'variant' | 'title' | 'icon'> & {
  message?: string
}) {
  return (
    <EmptyState
      title={message}
      description=""
      icon={() => (
        <div className="animate-spin">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      )}
      showBackground={false}
      {...props}
    />
  )
}