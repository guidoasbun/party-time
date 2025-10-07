"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback, useMemo } from "react"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { DashboardLayout, DashboardStatsSection, DashboardMainContent, DashboardFiltersSection, DashboardSection } from "@/components/dashboard/DashboardLayout"
import { DashboardSections } from "@/components/dashboard/DashboardSections"
import { StatsCards } from "@/components/dashboard/StatsCards"
import { EventList } from "@/components/events/EventList"
import { EventFilters } from "@/components/events/EventFilters"
import { FAB } from "@/components/ui/FAB"
import { useEvents } from "@/hooks/api/useEvents"
import { UserProfileResponse } from "@/types/auth.types"
import { EventFilters as EventFiltersType } from "@/types/event.types"

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

  // Fetch ALL events from API (no filters)
  const {
    data: eventsData,
    isLoading: eventsLoading,
    error: eventsError
  } = useEvents({
    page: 1,
    limit: 1000, // Get all events
  })

  // Client-side filtering (same logic as /events page)
  const filteredEvents = useMemo(() => {
    if (!eventsData?.items) return [];

    return eventsData.items.filter(event => {
      // Search filter
      if (eventFilters.search) {
        const searchLower = eventFilters.search.toLowerCase();
        const matchesSearch =
          (event.name?.toLowerCase() || '').includes(searchLower) ||
          (event.venue_name?.toLowerCase() || '').includes(searchLower) ||
          (event.planner_name?.toLowerCase() || '').includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Type filter
      if (eventFilters.types.length > 0 && !eventFilters.types.includes(event.type)) {
        return false;
      }

      // Status filter
      if (eventFilters.statuses.length > 0 && !eventFilters.statuses.includes(event.status)) {
        return false;
      }

      // Date range filter
      if (eventFilters.date_range.start || eventFilters.date_range.end) {
        const eventDate = new Date(event.start_date).toISOString().split('T')[0];
        if (eventFilters.date_range.start && eventDate < eventFilters.date_range.start) {
          return false;
        }
        if (eventFilters.date_range.end && eventDate > eventFilters.date_range.end) {
          return false;
        }
      }

      // Location filter
      if (eventFilters.location) {
        const venueName = event.venue_name?.toLowerCase() || '';
        if (!venueName.includes(eventFilters.location.toLowerCase())) {
          return false;
        }
      }

      // Budget range filter
      if (eventFilters.budget_range?.min || eventFilters.budget_range?.max) {
        const budget = event.budget_total || 0;
        if (eventFilters.budget_range.min && budget < eventFilters.budget_range.min) {
          return false;
        }
        if (eventFilters.budget_range.max && budget > eventFilters.budget_range.max) {
          return false;
        }
      }

      // Guest count range filter
      if (eventFilters.guest_count_range?.min || eventFilters.guest_count_range?.max) {
        const guestCount = event.guest_count || 0;
        if (eventFilters.guest_count_range.min && guestCount < eventFilters.guest_count_range.min) {
          return false;
        }
        if (eventFilters.guest_count_range.max && guestCount > eventFilters.guest_count_range.max) {
          return false;
        }
      }

      return true;
    });
  }, [eventsData?.items, eventFilters])

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
            setError("Failed to fetch user information")
          }
        } catch (error) {
          setError("Error connecting to backend")
          console.error("Error fetching user info:", error)
        } finally {
          setLoading(false)
        }
      }

      fetchUserInfo()
    }
  }, [status, session?.idToken, router])

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center px-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
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
            <div className="text-destructive mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-card-foreground mb-2">Connection Error</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <p className="text-sm text-muted-foreground">Make sure your backend server is running on port 8000</p>
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading user information...</p>
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

      <DashboardLayout>
        {/* Dashboard View Toggle - Mobile responsive */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center bg-muted rounded-lg p-1 w-full sm:w-fit overflow-x-auto">
            <button
              onClick={() => setDashboardView('overview')}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-colors min-h-[44px] ${
                dashboardView === 'overview'
                  ? 'bg-card text-card-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-card-foreground'
              }`}
            >
              <span className="whitespace-nowrap">Dashboard Overview</span>
            </button>
            <button
              onClick={() => setDashboardView('events')}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-colors min-h-[44px] ${
                dashboardView === 'events'
                  ? 'bg-card text-card-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-card-foreground'
              }`}
            >
              <span className="whitespace-nowrap">Events Management</span>
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
                  events={filteredEvents}
                  onEdit={handleEditEvent}
                  onDelete={handleDeleteEvent}
                  onView={handleViewEvent}
                  onCreateEvent={handleCreateEvent}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  isLoading={eventsLoading}
                  error={eventsError?.message || null}
                  enableBulkSelection={true}
                  enableEventActions={true}
                  emptyStateTitle="No events found"
                  emptyStateMessage="Start planning your first event to see it here"
                />
              </DashboardSection>
            </DashboardMainContent>
          </>
        )}
      </DashboardLayout>

      {/* Floating Action Button */}
      <FAB
        onClick={handleCreateEvent}
        label="Create New Event"
      />
    </>
  )
}