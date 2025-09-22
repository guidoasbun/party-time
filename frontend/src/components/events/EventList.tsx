'use client'

import React, { useEffect, useRef, useCallback } from 'react'
import {
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  Trash2,
  AlertCircle,
  Plus,
  PartyPopper,
  Archive
} from 'lucide-react'
import { EventSummary } from '@/types/event.types'
import { EventCard } from './EventCard'
import { Button } from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { useEventActions } from '@/hooks/useEventActions'
import { cn } from '@/lib/utils'
import { ANIMATION_CLASSES, PRESET_ANIMATIONS, getAnimationClass } from '@/lib/animations'
import { useStaggeredAnimation } from '@/hooks/useAnimatedMount'

// Supporting Types
interface PaginationInfo {
  page: number
  limit: number
  total: number
  has_next: boolean
  has_previous: boolean
}

interface EventListProps {
  events: EventSummary[]
  onEdit?: (eventId: string) => void
  onDelete?: (eventId: string) => void
  onView?: (eventId: string) => void
  onDuplicate?: (eventId: string) => void
  onArchive?: (eventId: string) => void
  onCreateEvent?: () => void
  viewMode?: 'grid' | 'list'
  onViewModeChange?: (mode: 'grid' | 'list') => void
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
  pagination?: PaginationInfo
  onPageChange?: (page: number) => void
  enableInfiniteScroll?: boolean
  onLoadMore?: () => void
  hasMore?: boolean
  isLoadingMore?: boolean
  enableBulkSelection?: boolean
  enableEventActions?: boolean
  emptyStateTitle?: string
  emptyStateMessage?: string
  className?: string
  /** Enable enhanced animations */
  enableAnimations?: boolean
  /** Enable staggered card animations */
  enableStaggeredAnimations?: boolean
  /** Animation duration for view mode transitions */
  viewTransitionDuration?: number
}

// Empty State Component
function EventEmptyState({
  title = "No events found",
  message = "Get started by creating your first event",
  onCreateEvent,
  animated = true
}: {
  title?: string
  message?: string
  onCreateEvent?: () => void
  animated?: boolean
}) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-16 px-6 text-center",
      animated && getAnimationClass('animate-fadeIn')
    )}>
      <div className={cn(
        "w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6",
        animated && getAnimationClass('animate-bounceIn animate-delay-200')
      )}>
        <PartyPopper className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className={cn(
        "text-lg font-semibold text-gray-900 dark:text-white mb-2",
        animated && getAnimationClass('animate-slideInUp animate-delay-300')
      )}>
        {title}
      </h3>
      <p className={cn(
        "text-gray-500 dark:text-gray-400 mb-6 max-w-sm",
        animated && getAnimationClass('animate-slideInUp animate-delay-500')
      )}>
        {message}
      </p>
      {onCreateEvent && (
        <Button
          onClick={onCreateEvent}
          className={cn(
            "gap-2",
            animated && [
              getAnimationClass('animate-slideInUp animate-delay-700'),
              'hover:scale-105 transition-transform duration-200'
            ]
          )}
        >
          <Plus className="w-4 h-4" />
          Create Event
        </Button>
      )}
    </div>
  )
}

// Loading Skeleton Component
function EventListSkeleton({
  viewMode = 'grid',
  count = 6,
  animated = true
}: {
  viewMode?: 'grid' | 'list'
  count?: number
  animated?: boolean
}) {
  const skeletons = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={cn(
        'bg-gray-200 dark:bg-gray-700 rounded-lg',
        viewMode === 'grid' ? 'h-64 sm:h-72 p-4 sm:p-6' : 'h-24 sm:h-28 p-3 sm:p-4',
        animated && [
          'skeleton-enhanced',
          getAnimationClass('animate-fadeIn'),
          `animate-delay-${Math.min(i * 100, 500)}`
        ]
      )}
      style={animated ? { animationDelay: `${i * 50}ms` } : undefined}
    >
      <div className="space-y-2 sm:space-y-3">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
        {viewMode === 'grid' && (
          <>
            <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-full mt-4"></div>
            <div className="flex gap-2 mt-3">
              <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
          </>
        )}
      </div>
    </div>
  ))

  return (
    <div className={cn(
      'grid gap-3 sm:gap-4',
      viewMode === 'grid'
        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        : 'grid-cols-1'
    )}>
      {skeletons}
    </div>
  )
}

// View Toggle Component
function ViewToggle({
  viewMode,
  onChange,
  animated = true
}: {
  viewMode: 'grid' | 'list'
  onChange: (mode: 'grid' | 'list') => void
  animated?: boolean
}) {
  return (
    <div className={cn(
      "flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1",
      animated && "transition-all duration-300 ease-in-out"
    )}>
      <Button
        variant={viewMode === 'grid' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('grid')}
        className={cn(
          "gap-1 min-h-[44px] min-w-[44px] px-2 sm:px-3",
          animated && [
            "transition-all duration-200 ease-in-out",
            "hover:scale-105 active:scale-95",
            viewMode === 'grid' && "shadow-sm"
          ]
        )}
        title="Grid view"
      >
        <Grid className={cn(
          "w-4 h-4",
          animated && "transition-transform duration-200",
          viewMode === 'grid' && animated && "scale-110"
        )} />
        <span className="hidden sm:inline">Grid</span>
      </Button>
      <Button
        variant={viewMode === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('list')}
        className={cn(
          "gap-1 min-h-[44px] min-w-[44px] px-2 sm:px-3",
          animated && [
            "transition-all duration-200 ease-in-out",
            "hover:scale-105 active:scale-95",
            viewMode === 'list' && "shadow-sm"
          ]
        )}
        title="List view"
      >
        <List className={cn(
          "w-4 h-4",
          animated && "transition-transform duration-200",
          viewMode === 'list' && animated && "scale-110"
        )} />
        <span className="hidden sm:inline">List</span>
      </Button>
    </div>
  )
}

// Pagination Controls Component
function PaginationControls({
  pagination,
  onPageChange
}: {
  pagination: PaginationInfo
  onPageChange: (page: number) => void
}) {
  const { page, total, limit, has_previous, has_next } = pagination
  const totalPages = Math.ceil(total / limit)

  if (totalPages <= 1) return null

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6">
      <div className="text-sm text-gray-500 dark:text-gray-400 order-2 sm:order-1">
        Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} events
      </div>

      <div className="flex items-center gap-2 order-1 sm:order-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={!has_previous}
          className="gap-1 min-h-[44px] px-3"
          title="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        {/* Page numbers - show fewer on mobile */}
        <div className="flex items-center gap-1">
          {/* Show 3 pages on mobile, 5 on desktop */}
          <div className="flex items-center gap-1 sm:hidden">
            {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 1, totalPages - 2))
              const pageNum = start + i
              if (pageNum > totalPages) return null

              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                  className="min-w-[44px] min-h-[44px]"
                >
                  {pageNum}
                </Button>
              )
            })}
          </div>
          <div className="hidden sm:flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = i + 1
              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                  className="min-w-[44px] min-h-[44px]"
                >
                  {pageNum}
                </Button>
              )
            })}
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={!has_next}
          className="gap-1 min-h-[44px] px-3"
          title="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

// Bulk Selection Bar Component
function BulkSelectionBar({
  selectedCount,
  onSelectAll,
  onClearSelection,
  onBulkDelete,
  onBulkArchive,
  totalCount,
  isLoading = false
}: {
  selectedCount: number
  onSelectAll: () => void
  onClearSelection: () => void
  onBulkDelete: () => void
  onBulkArchive: () => void
  totalCount: number
  isLoading?: boolean
}) {
  if (selectedCount === 0) return null

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4 mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
            {selectedCount} event{selectedCount !== 1 ? 's' : ''} selected
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={selectedCount === totalCount ? onClearSelection : onSelectAll}
              className="text-blue-700 dark:text-blue-300 min-h-[44px] px-3"
              disabled={isLoading}
            >
              {selectedCount === totalCount ? 'Clear all' : 'Select all'}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBulkArchive}
            disabled={isLoading}
            className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 gap-1 min-h-[44px] px-2 sm:px-3"
          >
            <Archive className="w-4 h-4" />
            <span className="hidden sm:inline">Archive</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onBulkDelete}
            disabled={isLoading}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 gap-1 min-h-[44px] px-2 sm:px-3"
            title="Delete selected events"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Delete</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            disabled={isLoading}
            className="text-gray-600 dark:text-gray-400 min-h-[44px] px-3"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

// Main EventList Component
export function EventList({
  events,
  onEdit,
  onDelete,
  onView,
  onDuplicate,
  onArchive,
  onCreateEvent,
  viewMode = 'grid',
  onViewModeChange,
  isLoading = false,
  error = null,
  onRetry,
  pagination,
  onPageChange,
  enableInfiniteScroll = false,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
  enableBulkSelection = false,
  enableEventActions = true,
  emptyStateTitle,
  emptyStateMessage,
  className,
  enableAnimations = true,
  enableStaggeredAnimations = true,
  viewTransitionDuration = 400
}: EventListProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Initialize event actions if enabled
  const eventActions = useEventActions({
    enableToasts: true,
    enableOptimisticUpdates: true,
    enableUndo: true
  })

  // Set total count for bulk actions
  React.useEffect(() => {
    if (enableEventActions) {
      eventActions.setTotalCount(events.length)
    }
  }, [events.length, enableEventActions])

  // Staggered animations for events
  const { itemStates, startAnimation } = useStaggeredAnimation({
    items: events,
    animation: {
      type: 'slide',
      direction: 'up',
      duration: 300,
      stagger: enableStaggeredAnimations,
      staggerDelay: 50
    },
    autoStart: enableAnimations && enableStaggeredAnimations && !isLoading
  })

  // Trigger animations when view mode changes
  const [prevViewMode, setPrevViewMode] = React.useState(viewMode)
  React.useEffect(() => {
    if (prevViewMode !== viewMode && enableAnimations) {
      // Small delay to allow DOM to update
      setTimeout(startAnimation, 50)
    }
    setPrevViewMode(viewMode)
  }, [viewMode, prevViewMode, enableAnimations, startAnimation])

  // Event action handlers
  const handleEdit = useCallback((eventId: string) => {
    if (onEdit) {
      onEdit(eventId)
    }
  }, [onEdit])

  const handleDelete = useCallback(async (eventId: string) => {
    if (enableEventActions) {
      try {
        await eventActions.deleteEvent(eventId)
      } catch (error) {
        console.error('Failed to delete event:', error)
      }
    } else if (onDelete) {
      onDelete(eventId)
    }
  }, [enableEventActions, eventActions, onDelete])

  const handleView = useCallback((eventId: string) => {
    if (onView) {
      onView(eventId)
    }
  }, [onView])

  const handleDuplicate = useCallback(async (eventId: string) => {
    if (enableEventActions) {
      try {
        await eventActions.duplicateEvent(eventId)
      } catch (error) {
        console.error('Failed to duplicate event:', error)
      }
    } else if (onDuplicate) {
      onDuplicate(eventId)
    }
  }, [enableEventActions, eventActions, onDuplicate])

  const handleArchive = useCallback(async (eventId: string) => {
    if (enableEventActions) {
      try {
        await eventActions.archiveEvent(eventId)
      } catch (error) {
        console.error('Failed to archive event:', error)
      }
    } else if (onArchive) {
      onArchive(eventId)
    }
  }, [enableEventActions, eventActions, onArchive])

  // Bulk action handlers
  const handleBulkDelete = useCallback(async () => {
    if (enableEventActions && eventActions.hasSelection) {
      try {
        await eventActions.bulkDeleteEvents(eventActions.getSelectedEvents())
      } catch (error) {
        console.error('Failed to delete events:', error)
      }
    }
  }, [enableEventActions, eventActions])

  const handleBulkArchive = useCallback(async () => {
    if (enableEventActions && eventActions.hasSelection) {
      try {
        await eventActions.bulkArchiveEvents(eventActions.getSelectedEvents())
      } catch (error) {
        console.error('Failed to archive events:', error)
      }
    }
  }, [enableEventActions, eventActions])

  // Infinite scroll implementation
  useEffect(() => {
    if (!enableInfiniteScroll || !hasMore || isLoadingMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore?.()
        }
      },
      { threshold: 0.1 }
    )

    const currentRef = loadMoreRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [enableInfiniteScroll, hasMore, isLoadingMore, onLoadMore])

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Failed to load events
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
          {error}
        </p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            Retry
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className={cn('space-y-3 sm:space-y-4', className)}>
      {/* Header with view toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div className="flex items-center gap-3 sm:gap-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            Events
          </h2>
          {!isLoading && events.length > 0 && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {pagination?.total || events.length} total
            </span>
          )}
        </div>

        {onViewModeChange && !isLoading && events.length > 0 && (
          <ViewToggle
            viewMode={viewMode}
            onChange={onViewModeChange}
            animated={enableAnimations}
          />
        )}
      </div>

      {/* Bulk selection bar */}
      {enableBulkSelection && enableEventActions && (
        <BulkSelectionBar
          selectedCount={eventActions.state.bulkSelection.selectedIds.size}
          onSelectAll={eventActions.selectAllEvents}
          onClearSelection={eventActions.deselectAllEvents}
          onBulkDelete={handleBulkDelete}
          onBulkArchive={handleBulkArchive}
          totalCount={events.length}
          isLoading={eventActions.state.isBulkOperating}
        />
      )}

      {/* Loading state */}
      {isLoading ? (
        <EventListSkeleton
          viewMode={viewMode}
          animated={enableAnimations}
        />
      ) : events.length === 0 ? (
        /* Empty state */
        <EventEmptyState
          title={emptyStateTitle}
          message={emptyStateMessage}
          onCreateEvent={onCreateEvent}
          animated={enableAnimations}
        />
      ) : (
        <>
          {/* Events grid/list - Mobile-first responsive */}
          <div
            className={cn(
              'grid gap-3 sm:gap-4',
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1',
              enableAnimations && [
                'view-transition',
                'will-change-transform'
              ]
            )}
            style={enableAnimations ? {
              transitionDuration: `${viewTransitionDuration}ms`
            } : undefined}
          >
            {events.map((event, index) => {
              const animationState = enableStaggeredAnimations ? itemStates[index] : 'entered'
              const animationDelay = enableStaggeredAnimations ? index * 50 : 0

              return (
                <div
                  key={event.id}
                  className={cn(
                    "relative",
                    enableAnimations && animationState === 'entering' && getAnimationClass('animate-slideInUp'),
                    enableAnimations && animationState === 'exiting' && getAnimationClass('animate-slideOutDown')
                  )}
                  style={enableAnimations && animationDelay > 0 ? {
                    animationDelay: `${animationDelay}ms`
                  } : undefined}
                >
                  {enableBulkSelection && enableEventActions && (
                    <div className={cn(
                      "absolute top-3 left-3 z-10",
                      enableAnimations && "transition-opacity duration-200",
                      enableAnimations && "hover:scale-110"
                    )}>
                      <input
                        type="checkbox"
                        checked={eventActions.state.bulkSelection.isSelectAll || eventActions.state.bulkSelection.selectedIds.has(event.id)}
                        onChange={() => eventActions.toggleEventSelection(event.id)}
                        className={cn(
                          "w-5 h-5 text-blue-600 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer",
                          enableAnimations && "transition-all duration-150 hover:shadow-md"
                        )}
                        style={{ minWidth: '20px', minHeight: '20px' }}
                        title="Select event"
                      />
                    </div>
                  )}
                  <EventCard
                    event={event}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                    onDuplicate={handleDuplicate}
                    onArchive={handleArchive}
                    viewMode={viewMode}
                    animated={enableAnimations}
                    animationDelay={animationDelay}
                    animateOnMount={enableStaggeredAnimations}
                  />
                </div>
              )
            })}
          </div>

          {/* Infinite scroll loading indicator */}
          {enableInfiniteScroll && hasMore && (
            <div ref={loadMoreRef} className="flex justify-center py-4">
              {isLoadingMore && (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              )}
            </div>
          )}

          {/* Pagination controls */}
          {!enableInfiniteScroll && pagination && onPageChange && (
            <PaginationControls
              pagination={pagination}
              onPageChange={onPageChange}
            />
          )}
        </>
      )}

      {/* Confirmation Dialog */}
      {enableEventActions && eventActions.state.pendingConfirmation && (
        <ConfirmDialog
          open={true}
          onClose={eventActions.hideConfirmation}
          onConfirm={eventActions.confirmAction}
          title={eventActions.state.pendingConfirmation.config.title}
          description={eventActions.state.pendingConfirmation.config.description}
          confirmText={eventActions.state.pendingConfirmation.config.confirmText}
          cancelText={eventActions.state.pendingConfirmation.config.cancelText}
          variant={eventActions.state.pendingConfirmation.config.variant}
          icon={eventActions.state.pendingConfirmation.config.icon}
          isLoading={eventActions.state.isDeleting || eventActions.state.isArchiving || eventActions.state.isBulkOperating}
        />
      )}
    </div>
  )
}