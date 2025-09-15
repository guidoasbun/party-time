'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  Trash2,
  AlertCircle,
  Plus,
  PartyPopper
} from 'lucide-react'
import { EventSummary } from '@/types/event.types'
import { EventCard } from './EventCard'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

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
  onEdit: (eventId: string) => void
  onDelete: (eventId: string) => void
  onView: (eventId: string) => void
  onBulkDelete?: (eventIds: string[]) => void
  onCreateEvent?: () => void
  viewMode?: 'grid' | 'list'
  onViewModeChange?: (mode: 'grid' | 'list') => void
  isLoading?: boolean
  error?: string | null
  pagination?: PaginationInfo
  onPageChange?: (page: number) => void
  enableInfiniteScroll?: boolean
  onLoadMore?: () => void
  hasMore?: boolean
  isLoadingMore?: boolean
  enableBulkSelection?: boolean
  emptyStateTitle?: string
  emptyStateMessage?: string
  className?: string
}

// Empty State Component
function EventEmptyState({
  title = "No events found",
  message = "Get started by creating your first event",
  onCreateEvent
}: {
  title?: string
  message?: string
  onCreateEvent?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
        <PartyPopper className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
        {message}
      </p>
      {onCreateEvent && (
        <Button onClick={onCreateEvent} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Event
        </Button>
      )}
    </div>
  )
}

// Loading Skeleton Component
function EventListSkeleton({ viewMode = 'grid', count = 6 }: { viewMode?: 'grid' | 'list', count?: number }) {
  const skeletons = Array.from({ length: count }, (_, i) => (
    <div key={i} className={cn(
      'animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg',
      viewMode === 'grid' ? 'h-64 p-6' : 'h-24 p-4'
    )}>
      <div className="space-y-3">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
      </div>
    </div>
  ))

  return (
    <div className={cn(
      'grid gap-4',
      viewMode === 'grid'
        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        : 'grid-cols-1'
    )}>
      {skeletons}
    </div>
  )
}

// View Toggle Component
function ViewToggle({
  viewMode,
  onChange
}: {
  viewMode: 'grid' | 'list'
  onChange: (mode: 'grid' | 'list') => void
}) {
  return (
    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      <Button
        variant={viewMode === 'grid' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('grid')}
        className="gap-1"
      >
        <Grid className="w-4 h-4" />
        <span className="hidden sm:inline">Grid</span>
      </Button>
      <Button
        variant={viewMode === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('list')}
        className="gap-1"
      >
        <List className="w-4 h-4" />
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
    <div className="flex items-center justify-between pt-6">
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} events
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={!has_previous}
          className="gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const pageNum = i + 1
            return (
              <Button
                key={pageNum}
                variant={page === pageNum ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                className="w-8 h-8"
              >
                {pageNum}
              </Button>
            )
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={!has_next}
          className="gap-1"
        >
          Next
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
  totalCount
}: {
  selectedCount: number
  onSelectAll: () => void
  onClearSelection: () => void
  onBulkDelete: () => void
  totalCount: number
}) {
  if (selectedCount === 0) return null

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
            {selectedCount} event{selectedCount !== 1 ? 's' : ''} selected
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={selectedCount === totalCount ? onClearSelection : onSelectAll}
              className="text-blue-700 dark:text-blue-300"
            >
              {selectedCount === totalCount ? 'Clear all' : 'Select all'}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBulkDelete}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 gap-1"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="text-gray-600 dark:text-gray-400"
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
  onBulkDelete,
  onCreateEvent,
  viewMode = 'grid',
  onViewModeChange,
  isLoading = false,
  error = null,
  pagination,
  onPageChange,
  enableInfiniteScroll = false,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
  enableBulkSelection = false,
  emptyStateTitle,
  emptyStateMessage,
  className
}: EventListProps) {
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set())
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Handle bulk selection
  const isEventSelected = useCallback((eventId: string) => {
    return selectedEvents.has(eventId)
  }, [selectedEvents])

  const toggleEventSelection = useCallback((eventId: string) => {
    const newSelected = new Set(selectedEvents)
    if (newSelected.has(eventId)) {
      newSelected.delete(eventId)
    } else {
      newSelected.add(eventId)
    }
    setSelectedEvents(newSelected)
  }, [selectedEvents])

  const selectAllEvents = useCallback(() => {
    setSelectedEvents(new Set(events.map(event => event.id)))
  }, [events])

  const clearSelection = useCallback(() => {
    setSelectedEvents(new Set())
  }, [])

  const handleBulkDelete = useCallback(() => {
    if (onBulkDelete && selectedEvents.size > 0) {
      onBulkDelete(Array.from(selectedEvents))
      clearSelection()
    }
  }, [onBulkDelete, selectedEvents, clearSelection])

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
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with view toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Events
          </h2>
          {!isLoading && events.length > 0 && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {pagination?.total || events.length} total
            </span>
          )}
        </div>

        {onViewModeChange && !isLoading && events.length > 0 && (
          <ViewToggle viewMode={viewMode} onChange={onViewModeChange} />
        )}
      </div>

      {/* Bulk selection bar */}
      {enableBulkSelection && onBulkDelete && (
        <BulkSelectionBar
          selectedCount={selectedEvents.size}
          onSelectAll={selectAllEvents}
          onClearSelection={clearSelection}
          onBulkDelete={handleBulkDelete}
          totalCount={events.length}
        />
      )}

      {/* Loading state */}
      {isLoading ? (
        <EventListSkeleton viewMode={viewMode} />
      ) : events.length === 0 ? (
        /* Empty state */
        <EventEmptyState
          title={emptyStateTitle}
          message={emptyStateMessage}
          onCreateEvent={onCreateEvent}
        />
      ) : (
        <>
          {/* Events grid/list */}
          <div className={cn(
            'grid gap-4',
            viewMode === 'grid'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1'
          )}>
            {events.map((event) => (
              <div key={event.id} className="relative">
                {enableBulkSelection && (
                  <div className="absolute top-2 left-2 z-10">
                    <input
                      type="checkbox"
                      checked={isEventSelected(event.id)}
                      onChange={() => toggleEventSelection(event.id)}
                      className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                  </div>
                )}
                <EventCard
                  event={event}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onView={onView}
                  viewMode={viewMode}
                />
              </div>
            ))}
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
    </div>
  )
}