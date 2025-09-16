"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { DashboardLayout, DashboardStatsSection, DashboardMainContent, DashboardFiltersSection, DashboardSection } from "@/components/dashboard/DashboardLayout"
import { DashboardSections } from "@/components/dashboard/DashboardSections"
import { StatsCards } from "@/components/dashboard/StatsCards"
import { EventList } from "@/components/events/EventList"
import { EventFilters } from "@/components/events/EventFilters"
import { FAB } from "@/components/ui/FAB"
import { useEvents } from "@/hooks/api/useEvents"
import { UserProfileResponse } from "@/types/auth.types"
import { EventFilters as EventFiltersType, EventSearchParams } from "@/types/event.types"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<UserProfileResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtersCollapsed, setFiltersCollapsed] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [dashboardView, setDashboardView] = useState<'overview' | 'events'>('overview')
  const [eventFilters, setEventFilters] = useState<EventFiltersType>({
    search: '',
    types: [],
    statuses: [],
    date_range: {},
    location: '',
    budget_range: {},
    guest_count_range: {}
  })

  // Convert EventFilters to backend API params
  const searchParams: EventSearchParams = {
    skip: 0,
    limit: 100,
    type: eventFilters.types.length > 0 ? eventFilters.types : undefined,
    status: eventFilters.statuses.length > 0 ? eventFilters.statuses : undefined,
    include_relations: true,
    // Note: Backend doesn't support search, location, date range, budget, or guest count yet
    // These filters would need to be implemented backend-side or filtered client-side
  }

  // Fetch events with current filters
  const {
    data: eventsData,
    isLoading: eventsLoading,
    error: eventsError
  } = useEvents(searchParams)

  const fetchUserInfo = useCallback(async () => {
    try {
      if (!session?.idToken) return

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
        setError("Failed to fetch user information")
      }
    } catch (error) {
      setError("Error connecting to backend")
      console.error("Error fetching user info:", error)
    } finally {
      setLoading(false)
    }
  }, [session?.idToken])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (status === "authenticated" && session?.idToken) {
      fetchUserInfo()
    }
  }, [status, session, router, fetchUserInfo])

  // Event action handlers
  const handleCreateEvent = () => {
    router.push('/events/new')
  }

  const handleEditEvent = (eventId: string) => {
    router.push(`/events/${eventId}/edit`)
  }

  const handleDeleteEvent = (eventId: string) => {
    // TODO: Implement delete confirmation and API call
    console.log('Delete event:', eventId)
  }

  const handleViewEvent = (eventId: string) => {
    router.push(`/events/${eventId}`)
  }

  const handleBulkDelete = (eventIds: string[]) => {
    // TODO: Implement bulk delete
    console.log('Bulk delete events:', eventIds)
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return null // Will redirect
  }

  if (error) {
    return (
      <DashboardLayout>
        <DashboardSection>
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Connection Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">Make sure your backend server is running on port 8000</p>
          </div>
        </DashboardSection>
      </DashboardLayout>
    )
  }

  if (!userInfo) {
    return (
      <DashboardLayout>
        <DashboardSection>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading user information...</p>
          </div>
        </DashboardSection>
      </DashboardLayout>
    )
  }

  return (
    <>
      <DashboardHeader
        user={userInfo}
        onSignOut={() => signOut({ callbackUrl: "/" })}
      />

      <div className="max-w-7xl mx-auto px-6 py-6">
        <DashboardLayout>
        {/* Dashboard View Toggle */}
        <div className="mb-6">
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1 w-fit">
            <button
              onClick={() => setDashboardView('overview')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                dashboardView === 'overview'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Dashboard Overview
            </button>
            <button
              onClick={() => setDashboardView('events')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                dashboardView === 'events'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Events Management
            </button>
          </div>
        </div>

        {/* Dashboard Content */}
        {dashboardView === 'overview' ? (
          /* New Dashboard Sections */
          <DashboardSections />
        ) : (
          /* Original Events Management View */
          <>
            {/* Dashboard Statistics */}
            <DashboardStatsSection>
              <StatsCards />
            </DashboardStatsSection>

            {/* Filters Section */}
            <DashboardFiltersSection
              isCollapsed={filtersCollapsed}
              onToggle={() => setFiltersCollapsed(!filtersCollapsed)}
            >
              <EventFilters
                value={eventFilters}
                onChange={setEventFilters}
                compact={filtersCollapsed}
              />
            </DashboardFiltersSection>

            {/* Main Events Section */}
            <DashboardMainContent>
              <DashboardSection
                title="Your Events"
                description="Manage and organize all your events"
                fullWidth
              >
                <EventList
                  events={eventsData?.items || []}
                  onEdit={handleEditEvent}
                  onDelete={handleDeleteEvent}
                  onView={handleViewEvent}
                  onBulkDelete={handleBulkDelete}
                  onCreateEvent={handleCreateEvent}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  isLoading={eventsLoading}
                  error={eventsError?.message || null}
                  pagination={{
                    page: eventsData?.page || 1,
                    limit: eventsData?.limit || 10,
                    total: eventsData?.total || 0,
                    has_next: eventsData?.has_next || false,
                    has_previous: eventsData?.has_previous || false,
                  }}
                  enableBulkSelection={true}
                  emptyStateTitle="No events found"
                  emptyStateMessage="Start planning your first event to see it here"
                />
              </DashboardSection>
            </DashboardMainContent>
          </>
        )}
      </DashboardLayout>
      </div>

      {/* Floating Action Button */}
      <FAB
        onClick={handleCreateEvent}
        label="Create New Event"
      />
    </>
  )
}