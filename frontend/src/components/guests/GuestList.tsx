'use client'

/**
 * GuestList Component
 * Container component that manages guest list state and coordinates all guest management features
 */

import React, { useState, useCallback, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { GuestTable } from './GuestTable'
import { GuestSearchBar } from './GuestSearchBar'
import { GuestFilters, type GuestFilterValues } from './GuestFilters'
import { BulkActionsMenu } from './BulkActionsMenu'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { ChevronLeft, ChevronRight, UserPlus } from 'lucide-react'
import { guestsService } from '@/lib/api/services'
import { RsvpStatus, type Guest, type GuestSearchParams, type GuestUpdate, type UUID } from '@/types'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'

interface GuestListProps {
  eventId: UUID
  guests: Guest[]
  isLoading?: boolean
  error?: Error | null
  totalCount?: number
  onRefresh?: () => void
  className?: string
}

const PAGE_SIZE_OPTIONS = [
  { value: '10', label: '10 per page' },
  { value: '25', label: '25 per page' },
  { value: '50', label: '50 per page' },
  { value: '100', label: '100 per page' }
]

export function GuestList({
  eventId,
  guests,
  isLoading = false,
  error = null,
  totalCount = 0,
  onRefresh,
  className
}: GuestListProps) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // State management
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<GuestFilterValues>({
    rsvp_statuses: [],
    plus_one_filter: 'all',
    dietary_restrictions: 'all'
  })
  const [selectedIds, setSelectedIds] = useState<UUID[]>([])
  const [sortBy, setSortBy] = useState<keyof Guest>('first_name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [isUpdating, setIsUpdating] = useState(false)

  // Filter guests client-side based on filters and search
  const filteredGuests = useMemo(() => {
    let filtered = [...guests]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (guest) =>
          guest.first_name.toLowerCase().includes(query) ||
          guest.last_name.toLowerCase().includes(query) ||
          guest.email.toLowerCase().includes(query) ||
          guest.phone?.toLowerCase().includes(query)
      )
    }

    // Apply RSVP status filter
    if (filters.rsvp_statuses.length > 0) {
      filtered = filtered.filter((guest) => filters.rsvp_statuses.includes(guest.rsvp_status))
    }

    // Apply plus-one filter
    if (filters.plus_one_filter === 'allowed') {
      filtered = filtered.filter((guest) => guest.plus_one_allowed)
    } else if (filters.plus_one_filter === 'confirmed') {
      filtered = filtered.filter((guest) => guest.plus_one_allowed && guest.plus_one_name)
    }

    // Apply dietary restrictions filter
    if (filters.dietary_restrictions === 'has') {
      filtered = filtered.filter((guest) => guest.dietary_restrictions)
    } else if (filters.dietary_restrictions === 'none') {
      filtered = filtered.filter((guest) => !guest.dietary_restrictions)
    }

    return filtered
  }, [guests, searchQuery, filters])

  // Sort guests
  const sortedGuests = useMemo(() => {
    const sorted = [...filteredGuests]
    sorted.sort((a, b) => {
      const aVal = a[sortBy]
      const bVal = b[sortBy]

      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  }, [filteredGuests, sortBy, sortOrder])

  // Paginate guests
  const paginatedGuests = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return sortedGuests.slice(startIndex, startIndex + pageSize)
  }, [sortedGuests, currentPage, pageSize])

  const totalPages = Math.ceil(sortedGuests.length / pageSize)

  // Handlers
  const handleSort = (field: keyof Guest) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  const handleUpdateGuest = async (guestId: UUID, data: GuestUpdate) => {
    try {
      setIsUpdating(true)
      await guestsService.updateGuest(eventId, guestId, data)

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['guests', eventId] })

      toast({
        title: 'Guest updated',
        description: 'Guest information has been updated successfully.',
        variant: 'success'
      })

      if (onRefresh) {
        onRefresh()
      }
    } catch (err) {
      toast({
        title: 'Update failed',
        description: err instanceof Error ? err.message : 'Failed to update guest',
        variant: 'destructive'
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleBulkDelete = async (guestIds: UUID[]) => {
    if (!confirm(`Are you sure you want to delete ${guestIds.length} guest(s)?`)) {
      return
    }

    try {
      setIsUpdating(true)
      await guestsService.bulkDeleteGuests(eventId, guestIds)

      setSelectedIds([])
      await queryClient.invalidateQueries({ queryKey: ['guests', eventId] })

      toast({
        title: 'Guests deleted',
        description: `Successfully deleted ${guestIds.length} guest(s).`,
        variant: 'success'
      })

      if (onRefresh) {
        onRefresh()
      }
    } catch (err) {
      toast({
        title: 'Delete failed',
        description: err instanceof Error ? err.message : 'Failed to delete guests',
        variant: 'destructive'
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleBulkUpdateStatus = async (guestIds: UUID[], status: RsvpStatus) => {
    try {
      setIsUpdating(true)
      await guestsService.bulkUpdateGuestsStatus(eventId, guestIds, status)

      setSelectedIds([])
      await queryClient.invalidateQueries({ queryKey: ['guests', eventId] })

      toast({
        title: 'Status updated',
        description: `Updated RSVP status for ${guestIds.length} guest(s).`,
        variant: 'success'
      })

      if (onRefresh) {
        onRefresh()
      }
    } catch (err) {
      toast({
        title: 'Update failed',
        description: err instanceof Error ? err.message : 'Failed to update guest status',
        variant: 'destructive'
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSendInvitations = async (guestIds: UUID[]) => {
    try {
      setIsUpdating(true)
      await guestsService.sendInvitations(eventId, guestIds)

      setSelectedIds([])

      toast({
        title: 'Invitations sent',
        description: `Sent invitations to ${guestIds.length} guest(s).`,
        variant: 'success'
      })
    } catch (err) {
      toast({
        title: 'Send failed',
        description: err instanceof Error ? err.message : 'Failed to send invitations',
        variant: 'destructive'
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleExport = async (guestIds: UUID[]) => {
    try {
      setIsUpdating(true)
      await guestsService.exportGuests(eventId, 'csv', {
        include_fields: ['email', 'first_name', 'last_name', 'phone', 'rsvp_status']
      })

      toast({
        title: 'Export successful',
        description: `Exported ${guestIds.length} guest(s) to CSV.`,
        variant: 'success'
      })
    } catch (err) {
      toast({
        title: 'Export failed',
        description: err instanceof Error ? err.message : 'Failed to export guests',
        variant: 'destructive'
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePageSizeChange = (value: string | string[]) => {
    const sizeValue = Array.isArray(value) ? value[0] : value
    setPageSize(parseInt(sizeValue, 10))
    setCurrentPage(1) // Reset to first page
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">Error loading guests: {error.message}</p>
        {onRefresh && (
          <Button onClick={onRefresh} className="mt-4">
            Try Again
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 w-full sm:max-w-md">
          <GuestSearchBar value={searchQuery} onValueChange={setSearchQuery} />
        </div>

        <div className="flex items-center gap-2">
          <BulkActionsMenu
            selectedGuestIds={selectedIds}
            onDelete={handleBulkDelete}
            onUpdateStatus={handleBulkUpdateStatus}
            onSendInvitations={handleSendInvitations}
            onExport={handleExport}
          />

          <Button variant="default" size="sm" className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add Guest
          </Button>
        </div>
      </div>

      {/* Filters */}
      <GuestFilters filters={filters} onFiltersChange={setFilters} />

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {paginatedGuests.length} of {sortedGuests.length} guests
          {sortedGuests.length !== guests.length && ` (${guests.length} total)`}
        </span>
      </div>

      {/* Guest Table */}
      {isLoading ? (
        <div className="text-center py-12 border border-border rounded-lg bg-card">
          <p className="text-muted-foreground">Loading guests...</p>
        </div>
      ) : (
        <GuestTable
          guests={paginatedGuests}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onUpdateGuest={handleUpdateGuest}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          isUpdating={isUpdating}
        />
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Items per page:</span>
            <Select
              options={PAGE_SIZE_OPTIONS}
              value={pageSize.toString()}
              onValueChange={handlePageSizeChange}
              className="w-40"
            />
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
