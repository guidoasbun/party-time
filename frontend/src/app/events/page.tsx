"use client";

/**
 * Events List Page - Full-page dedicated events list
 * Phase 3.2.6: Events List Page
 */

import React, { useCallback, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Plus } from "lucide-react";
import { EventList } from "@/components/events/EventList";
import { EventFilters } from "@/components/events/EventFilters";
import { EventsPageHeader } from "@/components/events/EventsPageHeader";
import { Button } from "@/components/ui/Button";
import { EventsPageSkeleton } from "@/components/ui/LoadingStates";
import { useEvents } from "@/hooks/api/useEvents";
import { useViewPreferences } from "@/hooks/useViewPreferences";
import {
  EventFilters as EventFiltersType,
} from "@/types/event.types";
import { SortOption, SortDirection } from "@/types/preferences.types";
import { UserProfileResponse } from "@/types/auth.types";
import { cn } from "@/lib/utils";

// Force dynamic rendering - this page uses client-side features

function EventsPageContent() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // User profile state
  const [userInfo, setUserInfo] = useState<UserProfileResponse | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);

  // View preferences with persistence
  const {
    preferences,
    setViewMode,
    setSortBy,
    setSortDirection,
    setShowFilters,
    setCompactMode,
  } = useViewPreferences({
    persistToLocalStorage: true,
    storageKey: "events-page-preferences",
    syncWithUrl: false, // Disable URL sync to avoid SSR issues
    defaultPreferences: {
      viewMode: "grid",
      itemsPerPage: 20,
      showFilters: true,
      sortBy: "date",
      sortDirection: "desc",
      compactMode: false,
    },
  });

  // Controlled filters state (like demo page)
  const [filters, setFilters] = useState<EventFiltersType>({
    search: '',
    types: [],
    statuses: [],
    date_range: {},
    location: '',
    budget_range: {},
    guest_count_range: {}
  });

  // Fetch ALL events from API (no filters on API side)
  const {
    data: eventsData,
    isLoading,
    error,
    refetch,
  } = useEvents({
    page: 1,
    limit: 1000, // Get all events
  });

  // Client-side filtering (same logic as demo page)
  const filteredEvents = useMemo(() => {
    if (!eventsData?.items) return [];

    return eventsData.items.filter(event => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          (event.name?.toLowerCase() || '').includes(searchLower) ||
          (event.venue_name?.toLowerCase() || '').includes(searchLower) ||
          (event.planner_name?.toLowerCase() || '').includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Type filter
      if (filters.types.length > 0 && !filters.types.includes(event.type)) {
        return false;
      }

      // Status filter
      if (filters.statuses.length > 0 && !filters.statuses.includes(event.status)) {
        return false;
      }

      // Date range filter
      if (filters.date_range.start || filters.date_range.end) {
        const eventDate = new Date(event.start_date).toISOString().split('T')[0];
        if (filters.date_range.start && eventDate < filters.date_range.start) {
          return false;
        }
        if (filters.date_range.end && eventDate > filters.date_range.end) {
          return false;
        }
      }

      // Location filter
      if (filters.location) {
        const venueName = event.venue_name?.toLowerCase() || '';
        if (!venueName.includes(filters.location.toLowerCase())) {
          return false;
        }
      }

      // Budget range filter
      if (filters.budget_range?.min || filters.budget_range?.max) {
        const budget = event.budget_total || 0;
        if (filters.budget_range.min && budget < filters.budget_range.min) {
          return false;
        }
        if (filters.budget_range.max && budget > filters.budget_range.max) {
          return false;
        }
      }

      // Guest count range filter
      if (filters.guest_count_range?.min || filters.guest_count_range?.max) {
        const guestCount = event.guest_count || 0;
        if (filters.guest_count_range.min && guestCount < filters.guest_count_range.min) {
          return false;
        }
        if (filters.guest_count_range.max && guestCount > filters.guest_count_range.max) {
          return false;
        }
      }

      return true;
    });
  }, [eventsData?.items, filters]);

  // Check if there are active filters
  const hasActiveFilters = useMemo(() => {
    return (
      !!filters.search ||
      filters.types.length > 0 ||
      filters.statuses.length > 0 ||
      !!filters.date_range.start ||
      !!filters.date_range.end ||
      !!filters.location ||
      !!filters.budget_range?.min ||
      !!filters.budget_range?.max ||
      !!filters.guest_count_range?.min ||
      !!filters.guest_count_range?.max
    );
  }, [filters]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      types: [],
      statuses: [],
      date_range: {},
      location: '',
      budget_range: {},
      guest_count_range: {}
    });
  }, []);

  // Fetch user information
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated" && session?.idToken) {
      const fetchUserInfo = async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/me`, {
            headers: {
              Authorization: `Bearer ${session.idToken}`,
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            const data = await response.json();
            setUserInfo(data);
          } else {
            setUserError("Failed to fetch user information");
          }
        } catch (error) {
          setUserError("Error connecting to backend");
          console.error("Error fetching user info:", error);
        } finally {
          setUserLoading(false);
        }
      };

      fetchUserInfo();
    }
  }, [status, session?.idToken, router]);

  // Event handlers
  const handleViewModeChange = useCallback(
    (mode: "grid" | "list") => {
      setViewMode(mode);
    },
    [setViewMode]
  );

  const handleSortChange = useCallback(
    (sortBy: SortOption, sortDirection: SortDirection) => {
      setSortBy(sortBy);
      setSortDirection(sortDirection);
    },
    [setSortBy, setSortDirection]
  );

  const handleFilterToggle = useCallback(() => {
    setShowFilters(!preferences.showFilters);
  }, [preferences.showFilters, setShowFilters]);

  const handleCompactModeToggle = useCallback(() => {
    setCompactMode(!preferences.compactMode);
  }, [preferences.compactMode, setCompactMode]);

  const handleCreateEvent = useCallback(() => {
    router.push("/events/new");
  }, [router]);

  const handleViewEvent = useCallback(
    (eventId: string) => {
      router.push(`/events/${eventId}`);
    },
    [router]
  );

  const handleEditEvent = useCallback(
    (eventId: string) => {
      router.push(`/events/${eventId}/edit`);
    },
    [router]
  );

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  // Loading state for auth/user
  if (status === "loading" || userLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <EventsPageSkeleton />
        </div>
      </div>
    );
  }

  // Redirect if unauthenticated (shouldn't reach here due to useEffect)
  if (status === "unauthenticated") {
    return null;
  }

  // Don't render if no user info yet
  if (!userInfo) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <EventsPageSkeleton />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* Page Container */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Page Header */}
          <EventsPageHeader
            totalEvents={filteredEvents.length}
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

          {/* Compact Mode Toggle */}
          {preferences.showFilters && (
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <input
                  id="compact-mode"
                  type="checkbox"
                  checked={preferences.compactMode}
                  onChange={handleCompactModeToggle}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer"
                />
                <label
                  htmlFor="compact-mode"
                  className="text-sm font-medium text-foreground cursor-pointer select-none"
                >
                  Compact Mode
                </label>
              </div>
              <div className="text-sm text-muted-foreground">
                Toggle between full and compact filter layouts
              </div>
            </div>
          )}

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
                    onChange={setFilters}
                    compact={preferences.compactMode}
                    showAdvanced={!preferences.compactMode}
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
                    onChange={setFilters}
                    compact={preferences.compactMode}
                    showAdvanced={!preferences.compactMode}
                    enableAnimations={true}
                  />
                </div>
              )}

              {/* Event List */}
              <EventList
                events={filteredEvents}
                viewMode={preferences.viewMode}
                onViewModeChange={handleViewModeChange}
                isLoading={isLoading}
                error={error?.message || null}
                onRetry={handleRetry}
                onView={handleViewEvent}
                onEdit={handleEditEvent}
                onCreateEvent={handleCreateEvent}
                enableBulkSelection={false}
                enableEventActions={true}
                emptyStateTitle={
                  hasActiveFilters
                    ? "No events match your filters"
                    : "No events yet"
                }
                emptyStateMessage={
                  hasActiveFilters
                    ? "Try adjusting your filters to see more results"
                    : "Get started by creating your first event"
                }
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
  );
}

export default function EventsPage() {
  return <EventsPageContent />;
}
