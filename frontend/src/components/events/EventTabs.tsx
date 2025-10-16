"use client";

/**
 * EventTabs Component
 * Main tabbed interface for event detail pages with URL-based tab persistence
 */

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  DollarSign,
  Calendar,
  Settings as SettingsIcon,
  FileText,
} from "lucide-react";
import type { Event, Guest, PaginatedResponse } from "@/types";
import { RSVPDashboard } from "./RSVPDashboard";
import { guestsService } from "@/lib/api/services";

interface EventTabsProps {
  event: Event;
}

type TabId = "overview" | "guests" | "budget" | "timeline" | "settings";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  content: React.ReactNode;
}

export function EventTabs({ event }: EventTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlTab = searchParams?.get("tab") as TabId | null;
  const [activeTab, setActiveTab] = useState<TabId>(urlTab || "overview");

  // console.log(event);

  // Update active tab when URL changes
  useEffect(() => {
    if (
      urlTab &&
      ["overview", "guests", "budget", "timeline", "settings"].includes(urlTab)
    ) {
      setActiveTab(urlTab);
    } else if (urlTab) {
      // Invalid tab, default to overview
      setActiveTab("overview");
    }
  }, [urlTab]);

  // Update URL when tab changes
  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("tab", tabId);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Handle keyboard navigation
  const handleKeyDown = (
    e: React.KeyboardEvent,
    tabId: TabId,
    index: number
  ) => {
    const tabs: TabId[] = [
      "overview",
      "guests",
      "budget",
      "timeline",
      "settings",
    ];

    if (e.key === "ArrowRight") {
      e.preventDefault();
      const nextIndex = (index + 1) % tabs.length;
      handleTabChange(tabs[nextIndex]);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prevIndex = (index - 1 + tabs.length) % tabs.length;
      handleTabChange(tabs[prevIndex]);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleTabChange(tabId);
    }
  };

  const tabs: Tab[] = [
    {
      id: "overview",
      label: "Overview",
      icon: FileText,
      content: <EventOverviewTabPlaceholder event={event} />,
    },
    {
      id: "guests",
      label: "Guests",
      icon: Users,
      badge: event.guest_count || 0,
      content: <GuestsTabPlaceholder event={event} />,
    },
    {
      id: "budget",
      label: "Budget",
      icon: DollarSign,
      badge: event.budget_total
        ? `$${(event.budget_total / 1000).toFixed(0)}k`
        : "0",
      content: <BudgetTabPlaceholder event={event} />,
    },
    {
      id: "timeline",
      label: "Timeline",
      icon: Calendar,
      content: <TimelineTabPlaceholder event={event} />,
    },
    {
      id: "settings",
      label: "Settings",
      icon: SettingsIcon,
      content: <SettingsTabPlaceholder event={event} />,
    },
  ];

  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm">
      {/* Tab Navigation */}
      <div className="border-b border-border overflow-x-auto">
        <nav
          className="flex space-x-1 px-4 min-w-max"
          role="tablist"
          aria-label="Event details tabs"
        >
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                aria-controls={`${tab.id}-panel`}
                id={`${tab.id}-tab`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => handleTabChange(tab.id)}
                onKeyDown={(e) => handleKeyDown(e, tab.id, index)}
                className={`
                  flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm
                  transition-colors whitespace-nowrap
                  ${
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  }
                  focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-card
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`
                    px-2 py-0.5 rounded-full text-xs font-semibold
                    ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }
                  `}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div
        role="tabpanel"
        id={`${activeTab}-panel`}
        aria-labelledby={`${activeTab}-tab`}
        className="p-6 bg-card text-card-foreground"
      >
        {activeTabContent}
      </div>
    </div>
  );
}

// Placeholder components (will be replaced with full implementations in future phases)

function EventOverviewTabPlaceholder({ event }: { event: Event }) {
  // Fetch guests for RSVP Dashboard

  // FR-6: The system shall display an RSVP submission page.
  // 5.1.3: RSVP Management Dashboard

  const { data: guestsResponse, isLoading: isGuestsLoading } = useQuery<
    PaginatedResponse<Guest>
  >({
    queryKey: ["guests", event.id],
    queryFn: () => guestsService.getGuests(event.id),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const guests = guestsResponse?.items || [];

  return (
    // FR-6: The system shall display an RSVP submission page.
    // 5.1.3: RSVP Management Dashboard

    <div className="space-y-8">
      {/* RSVP Dashboard Section */}
      {!isGuestsLoading && guests.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">
            RSVP Management
          </h3>
          <RSVPDashboard
            eventId={event.id}
            eventName={event.name}
            guests={guests}
            rsvpDeadline={undefined}
          />
        </div>
      )}

      {/* Event Details Section */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Event Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Description */}
          {event.description && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Description
              </label>
              <p className="text-foreground whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
          )}

          {/* Date & Time */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Start Date
            </label>
            <p className="text-foreground">
              {new Date(event.start_date).toLocaleString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          {event.end_date && (
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                End Date
              </label>
              <p className="text-foreground">
                {new Date(event.end_date).toLocaleString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          )}

          {/* Location */}
          {(event.venue_name || event.location) && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Location
              </label>
              <p className="text-foreground">
                {event.venue_name && (
                  <span className="font-medium">{event.venue_name}</span>
                )}
                {event.venue_name && event.venue_address && <br />}
                {event.venue_address || event.location}
              </p>
            </div>
          )}

          {/* Privacy */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Privacy
            </label>
            <p className="text-foreground">
              {event.is_public ? "Public Event" : "Private Event"}
            </p>
          </div>

          {/* Guest Limit */}
          {event.max_guests && (
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Guest Limit
              </label>
              <p className="text-foreground">
                {event.guest_count} / {event.max_guests} guests
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function GuestsTabPlaceholder({ event }: { event: Event }) {
  const router = useRouter();

  return (
    <div className="text-center py-12">
      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Guest Management
      </h3>
      <p className="text-muted-foreground mb-4">
        Current guest count:{" "}
        <span className="font-semibold">{event.guest_count || 0}</span>
      </p>
      <button
        onClick={() => router.push(`/events/${event.id}/guests`)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
      >
        <Users className="w-4 h-4" />
        Manage Guests
      </button>
    </div>
  );
}

function BudgetTabPlaceholder({ event }: { event: Event }) {
  const budgetPercentage = event.budget_total
    ? Math.round((event.total_expenses / event.budget_total) * 100)
    : 0;

  return (
    <div className="text-center py-12">
      <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Budget Tracking
      </h3>
      {event.budget_total ? (
        <div className="space-y-4">
          <div>
            <p className="text-muted-foreground">Total Budget</p>
            <p className="text-3xl font-bold text-foreground">
              ${event.budget_total.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Spent</p>
            <p className="text-2xl font-semibold text-foreground">
              ${event.total_expenses.toLocaleString()}
              <span className="text-sm text-muted-foreground ml-2">
                ({budgetPercentage}%)
              </span>
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Remaining</p>
            <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
              ${(event.budget_total - event.total_expenses).toLocaleString()}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground">No budget set</p>
      )}
      <p className="text-sm text-muted-foreground mt-6">
        Full budget management features coming in Phase 7
      </p>
    </div>
  );
}

function TimelineTabPlaceholder({ event }: { event: Event }) {
  const daysUntil = Math.ceil(
    (new Date(event.start_date).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <div className="text-center py-12">
      <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Event Timeline
      </h3>
      <p className="text-muted-foreground mb-4">
        {daysUntil > 0 ? (
          <>
            <span className="font-semibold text-2xl">{daysUntil}</span> days
            until event
          </>
        ) : daysUntil === 0 ? (
          <span className="font-semibold text-2xl">Event is today!</span>
        ) : (
          <span className="font-semibold">Event has passed</span>
        )}
      </p>
      <p className="text-sm text-muted-foreground">
        Timeline and milestone tracking coming soon
      </p>
    </div>
  );
}

function SettingsTabPlaceholder({ event }: { event: Event }) {
  return (
    <div className="text-center py-12">
      <SettingsIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Event Settings
      </h3>
      <p className="text-muted-foreground mb-4">
        Manage event preferences and configuration
      </p>
      <p className="text-sm text-muted-foreground">
        Event settings panel coming soon
      </p>
    </div>
  );
}
