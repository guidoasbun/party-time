'use client'

/**
 * Events List Page - Full-page dedicated events list
 * Phase 3.2.6: Events List Page
 */

import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Plus } from 'lucide-react'
import { EventList } from '@/components/events/EventList'
import { EventFilters } from '@/components/events/EventFilters'
import { EventsPageHeader } from '@/components/events/EventsPageHeader'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { Button } from '@/components/ui/Button'
import { useEvents } from '@/hooks/api/useEvents'
import { useEventFilters } from '@/hooks/useEventFilters'
import { useViewPreferences } from '@/hooks/useViewPreferences'
import { EventSearchParams, EventFilters as EventFiltersType } from '@/types/event.types'
import { SortOption, SortDirection } from '@/types/preferences.types'
import { UserProfileResponse } from '@/types/auth.types'
import { cn } from '@/lib/utils'

// Force dynamic rendering - this page uses client-side features

function EventsPageContent() {
  const router = useRouter()
  const { data: session, status } = useSession()

  // User profile state
  const [userInfo, setUserInfo] = useState<UserProfileResponse | null>(null)
  const [userLoading, setUserLoading] = useState(true)
  const [userError, setUserError] = useState<string | null>(null)

  // View preferences with persistence
  const {
    preferences,
    setViewMode,
    setSortBy,
    setSortDirection,
    setShowFilters,
  } = useViewPreferences({
    persistToLocalStorage: true,
    storageKey: 'events-page-preferences',
    syncWithUrl: false, // Disable URL sync to avoid SSR issues
    defaultPreferences: {
      viewMode: 'grid',
      itemsPerPage: 20,
      showFilters: true,
      sortBy: 'date',
      sortDirection: 'desc',
    },
  })

  // Event filters
  const {
    filters,
    debouncedFilters,
    clearFilters,
    hasActiveFilters,
  } = useEventFilters({
    persistToLocalStorage: true,
    storageKey: 'events-page-filters',
    syncWithUrl: false, // Disable URL sync to avoid SSR issues
  })

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)

  // Build search params for API
  const searchParams: EventSearchParams = {
    page: currentPage,
    limit: preferences.itemsPerPage,
    search: debouncedFilters.search,
    event_types: debouncedFilters.types.length > 0 ? debouncedFilters.types : undefined,
    statuses: debouncedFilters.statuses.length > 0 ? debouncedFilters.statuses : undefined,
    start_date: debouncedFilters.date_range?.start,
    end_date: debouncedFilters.date_range?.end,
    location: debouncedFilters.location,
    min_budget: debouncedFilters.budget_range?.min,
    max_budget: debouncedFilters.budget_range?.max,
    min_guests: debouncedFilters.guest_count_range?.min,
    max_guests: debouncedFilters.guest_count_range?.max,
    sort_by: preferences.sortBy,
    sort_direction: preferences.sortDirection,
  }

  // Fetch events
  const {
    data: eventsData,
    isLoading,
    error,
    refetch,
  } = useEvents(searchParams)

  // Debug logging
  useEffect(() => {
    console.log('[EventsPage] Events data:', eventsData)
    console.log('[EventsPage] Is loading:', isLoading)
    console.log('[EventsPage] Error:', error)
    console.log('[EventsPage] Search params:', searchParams)
  }, [eventsData, isLoading, error, searchParams])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedFilters])

  // Fetch user information
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (status === "authenticated" && session?.idToken) {
      const fetchUserInfo = async () => {
        try {
          const response = await fetch("http://localhost:8000/api/v1/auth/me", {
            headers: {
              "Authorization": `Bearer ${session.idToken}`,
              "Content-Type": "application/json",
            },
          })

          if (response.ok) {
            const data = await response.json()
            setUserInfo(data)
          } else {
            setUserError("Failed to fetch user information")
          }
        } catch (error) {
          setUserError("Error connecting to backend")
          console.error("Error fetching user info:", error)
        } finally {
          setUserLoading(false)
        }
      }

      fetchUserInfo()
    }
  }, [status, session?.idToken, router])

  // Event handlers
  const handleViewModeChange = useCallback((mode: 'grid' | 'list') => {
    setViewMode(mode)
  }, [setViewMode])

  const handleSortChange = useCallback((sortBy: SortOption, sortDirection: SortDirection) => {
    setSortBy(sortBy)
    setSortDirection(sortDirection)
    setCurrentPage(1) // Reset to first page when sorting changes
  }, [setSortBy, setSortDirection])

  const handleFilterToggle = useCallback(() => {
    setShowFilters(!preferences.showFilters)
  }, [preferences.showFilters, setShowFilters])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    // Scroll to top on page change
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleCreateEvent = useCallback(() => {
    router.push('/events/new')
  }, [router])

  const handleViewEvent = useCallback((eventId: string) => {
    router.push(`/events/${eventId}`)
  }, [router])

  const handleEditEvent = useCallback((eventId: string) => {
    router.push(`/events/${eventId}/edit`)
  }, [router])

  const handleFiltersChange = useCallback((_newFilters: EventFiltersType) => {
    // Filters are already managed by useEventFilters
    // This callback is for any additional actions when filters change
  }, [])

  const handleRetry = useCallback(() => {
    refetch()
  }, [refetch])

  // Loading state for auth/user
  if (status === "loading" || userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center px-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect if unauthenticated (shouldn't reach here due to useEffect)
  if (status === "unauthenticated") {
    return null
  }

  // Don't render if no user info yet
  if (!userInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center px-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading user information...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Dashboard Header with Theme Toggle */}
      <DashboardHeader
        user={userInfo}
        onSignOut={() => signOut({ callbackUrl: "/" })}
      />

      <div className="min-h-screen bg-background">
        {/* Page Container */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Page Header */}
        <EventsPageHeader
          totalEvents={eventsData?.total || 0}
          viewMode={preferences.viewMode}
          onViewModeChange={handleViewModeChange}
          sortBy={preferences.sortBy}
          sortDirection={preferences.sortDirection}
          onSortChange={handleSortChange}
          showFilters={preferences.showFilters}
          onFilterToggle={handleFilterToggle}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
          onCreateEvent={handleCreateEvent}
        />

        {/* Main Content - Two Column Layout */}
        <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Filters Sidebar - Desktop */}
          {preferences.showFilters && (
            <aside
              className={cn(
                "lg:col-span-3",
                "hidden lg:block",
                "transition-all duration-300"
              )}
            >
              <div className="sticky top-6">
                <EventFilters
                  value={filters}
                  onChange={handleFiltersChange}
                  compact={false}
                  showAdvanced={true}
                  enableAnimations={true}
                />
              </div>
            </aside>
          )}

          {/* Events List */}
          <main
            className={cn(
              preferences.showFilters ? "lg:col-span-9" : "lg:col-span-12",
              "transition-all duration-300"
            )}
          >
            {/* Mobile Filters */}
            {preferences.showFilters && (
              <div className="lg:hidden mb-6">
                <EventFilters
                  value={filters}
                  onChange={handleFiltersChange}
                  compact={true}
                  showAdvanced={false}
                  enableAnimations={true}
                />
              </div>
            )}

            {/* Event List */}
            <EventList
              events={eventsData?.items || []}
              viewMode={preferences.viewMode}
              onViewModeChange={handleViewModeChange}
              isLoading={isLoading}
              error={error?.message || null}
              onRetry={handleRetry}
              pagination={eventsData ? {
                page: eventsData.page,
                limit: eventsData.limit,
                total: eventsData.total,
                has_next: eventsData.has_next,
                has_previous: eventsData.has_previous,
              } : undefined}
              onPageChange={handlePageChange}
              onView={handleViewEvent}
              onEdit={handleEditEvent}
              onCreateEvent={handleCreateEvent}
              enableBulkSelection={false}
              enableEventActions={true}
              emptyStateTitle={hasActiveFilters ? "No events match your filters" : "No events yet"}
              emptyStateMessage={hasActiveFilters
                ? "Try adjusting your filters to see more results"
                : "Get started by creating your first event"}
              enableAnimations={true}
              enableStaggeredAnimations={true}
            />
          </main>
        </div>

          {/* Floating Action Button (FAB) - Mobile */}
          <div className="lg:hidden">
            <Button
              onClick={handleCreateEvent}
              className={cn(
                "fixed bottom-6 right-6 z-50",
                "h-14 w-14 rounded-full shadow-lg",
                "bg-primary text-primary-foreground",
                "hover:bg-primary/90 hover:shadow-xl",
                "transition-all duration-200",
                "hover:scale-110 active:scale-95",
                "flex items-center justify-center",
                "touch-manipulation"
              )}
              size="lg"
              title="Create new event"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default function EventsPage() {
  return <EventsPageContent />
}
