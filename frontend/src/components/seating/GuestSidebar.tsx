"use client";

/**
 * GuestSidebar Component
 *
 * Phase 6.1.5: Guest Assignment System
 * Collapsible sidebar showing unassigned guests with drag-drop support
 *
 * Features:
 * - Display list of unseated guests with RSVP status badges
 * - Search functionality with debouncing
 * - Filter by RSVP status (attending/pending/maybe)
 * - HTML5 drag-and-drop to canvas tables
 * - Unseated counter with color coding
 * - Collapse/expand toggle
 * - Theme-aware styling
 */

import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  HelpCircle,
  Filter,
  UtensilsCrossed,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import type { Guest, RsvpStatus, UUID, SeatingChartWithTables } from "@/types";
import { RsvpStatus as RsvpStatusEnum } from "@/types";

interface GuestSidebarProps {
  guests: Guest[];
  seatingChart?: SeatingChartWithTables | null;
  /** Optional direct seat assignments - if provided, used instead of chart.tables.seat_assignments */
  seatAssignments?: Array<{ guest_id?: string }>;
  isOpen?: boolean;
  /** When true, renders as inline block element instead of fixed sidebar */
  inline?: boolean;
  onToggle?: () => void;
  onGuestDragStart?: (guest: Guest) => void;
  onGuestDragEnd?: () => void;
  className?: string;
}

interface RsvpFilterOption {
  value: RsvpStatus | "all";
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
}

/**
 * Get RSVP status configuration for styling
 */
const getRsvpStatusConfig = (status: RsvpStatus) => {
  const configs = {
    [RsvpStatusEnum.ATTENDING]: {
      label: "Attending",
      icon: CheckCircle2,
      bgColor: "bg-green-100 dark:bg-green-900/30",
      textColor: "text-green-800 dark:text-green-300",
      borderColor: "border-green-300 dark:border-green-700",
    },
    [RsvpStatusEnum.NOT_ATTENDING]: {
      label: "Not Attending",
      icon: XCircle,
      bgColor: "bg-red-100 dark:bg-red-900/30",
      textColor: "text-red-800 dark:text-red-300",
      borderColor: "border-red-300 dark:border-red-700",
    },
    [RsvpStatusEnum.PENDING]: {
      label: "Pending",
      icon: Clock,
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
      textColor: "text-amber-800 dark:text-amber-300",
      borderColor: "border-amber-300 dark:border-amber-700",
    },
    [RsvpStatusEnum.MAYBE]: {
      label: "Maybe",
      icon: HelpCircle,
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      textColor: "text-blue-800 dark:text-blue-300",
      borderColor: "border-blue-300 dark:border-blue-700",
    },
  };
  return configs[status] || configs[RsvpStatusEnum.PENDING];
};

/**
 * Check if a guest is already seated in the chart
 * @param guestId - The guest ID to check
 * @param chart - The seating chart (optional, used if seatAssignments not provided)
 * @param seatAssignments - Direct seat assignments array (takes precedence over chart)
 */
const isGuestSeated = (
  guestId: UUID,
  chart?: SeatingChartWithTables | null,
  seatAssignments?: Array<{ guest_id?: string }>
): boolean => {
  // If seatAssignments array is provided directly, use it (more up-to-date)
  if (seatAssignments) {
    return seatAssignments.some((sa) => sa.guest_id === guestId);
  }

  // Fallback to checking chart.tables.seat_assignments
  if (!chart || !chart.tables) return false;

  // Check if any table has a seat assignment for this guest
  // For TableLayoutWithSeats[], we check seat_assignments
  for (const table of chart.tables) {
    if ("seat_assignments" in table && Array.isArray(table.seat_assignments)) {
      const hasAssignment = table.seat_assignments.some(
        (assignment) => assignment.guest_id === guestId
      );
      if (hasAssignment) return true;
    }
  }

  return false;
};

/**
 * Get guest initials for avatar
 */
const getGuestInitials = (guest: Guest): string => {
  const firstInitial = guest.first_name?.charAt(0)?.toUpperCase() || "";
  const lastInitial = guest.last_name?.charAt(0)?.toUpperCase() || "";
  return `${firstInitial}${lastInitial}` || "G";
};

export function GuestSidebar({
  guests,
  seatingChart,
  seatAssignments,
  isOpen = true,
  inline = false,
  onToggle,
  onGuestDragStart,
  onGuestDragEnd,
  className,
}: GuestSidebarProps) {
  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedRsvpFilter, setSelectedRsvpFilter] = useState<
    RsvpStatus | "all"
  >("all");
  const [showFilters, setShowFilters] = useState(false);
  const [draggedGuestId, setDraggedGuestId] = useState<UUID | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Calculate unseated guests (attending guests without seat assignments)
  const unseatedGuests = useMemo(() => {
    return guests.filter((guest) => {
      // Only show attending guests (primary filter)
      if (guest.rsvp_status !== RsvpStatusEnum.ATTENDING) return false;

      // Check if guest is not seated - use seatAssignments if provided (more up-to-date)
      const isSeated = isGuestSeated(guest.id, seatingChart, seatAssignments);
      return !isSeated;
    });
  }, [guests, seatingChart, seatAssignments]);

  // Apply search and RSVP filters
  const filteredGuests = useMemo(() => {
    let filtered = [...unseatedGuests];

    // Apply search filter
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (guest) =>
          guest.first_name.toLowerCase().includes(query) ||
          guest.last_name.toLowerCase().includes(query) ||
          guest.email.toLowerCase().includes(query)
      );
    }

    // Apply RSVP status filter (if showing all statuses)
    if (selectedRsvpFilter !== "all") {
      filtered = filtered.filter(
        (guest) => guest.rsvp_status === selectedRsvpFilter
      );
    }

    return filtered;
  }, [unseatedGuests, debouncedSearch, selectedRsvpFilter]);

  // RSVP filter options
  const rsvpFilterOptions: RsvpFilterOption[] = useMemo(() => {
    const attendingCount = unseatedGuests.filter(
      (g) => g.rsvp_status === RsvpStatusEnum.ATTENDING
    ).length;
    const pendingCount = unseatedGuests.filter(
      (g) => g.rsvp_status === RsvpStatusEnum.PENDING
    ).length;
    const maybeCount = unseatedGuests.filter(
      (g) => g.rsvp_status === RsvpStatusEnum.MAYBE
    ).length;

    return [
      {
        value: "all",
        label: "All Statuses",
        icon: Users,
        count: unseatedGuests.length,
      },
      {
        value: RsvpStatusEnum.ATTENDING,
        label: "Attending",
        icon: CheckCircle2,
        count: attendingCount,
      },
      {
        value: RsvpStatusEnum.PENDING,
        label: "Pending",
        icon: Clock,
        count: pendingCount,
      },
      {
        value: RsvpStatusEnum.MAYBE,
        label: "Maybe",
        icon: HelpCircle,
        count: maybeCount,
      },
    ];
  }, [unseatedGuests]);

  // Drag handlers
  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>, guest: Guest) => {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("guestId", guest.id);
      e.dataTransfer.setData(
        "guestName",
        `${guest.first_name} ${guest.last_name}`
      );
      setDraggedGuestId(guest.id);
      onGuestDragStart?.(guest);
    },
    [onGuestDragStart]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedGuestId(null);
    onGuestDragEnd?.();
  }, [onGuestDragEnd]);

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery("");
    setDebouncedSearch("");
  };

  return (
    /*
     * FR-21: The system shall provide an interactive seating chart interface.
     * Phase 6.2.4: Mobile & Tablet Views
     */
    <>
      {/* Phase 6.2.4: Mobile backdrop overlay - only show when not inline */}
      {!inline && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      <div
        className={cn(
          "bg-card border-l border-border shadow-lg",
          "flex flex-col",
          inline
            ? "relative w-full h-full"
            : [
                // Phase 6.2.4: Responsive positioning
                "fixed right-0 top-0 h-full",
                "transform transition-all duration-300 ease-in-out",
                // Mobile: Full overlay drawer with higher z-index
                "md:relative md:z-10 z-30",
                // Width: Full width on mobile, fixed on desktop
                isOpen ? "translate-x-0" : "translate-x-full",
                isOpen ? "w-full sm:w-96 md:w-80" : "w-0",
              ],
          className
        )}
      >
        {/* Toggle Button - only show when not inline */}
        {!inline && (
          <button
            onClick={onToggle}
            className={cn(
              "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full",
              "w-8 h-16 bg-card border border-r-0 border-border rounded-l-lg",
              "flex items-center justify-center",
              "hover:bg-accent transition-colors",
              "shadow-md"
            )}
            aria-label={isOpen ? "Close guest sidebar" : "Open guest sidebar"}
          >
            {isOpen ? (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        )}

        {/* Sidebar Content */}
        {isOpen && (
          <>
            {/* Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-foreground">
                  Unseated Guests
                </h2>
                <Badge
                  variant={
                    unseatedGuests.length === 0 ? "secondary" : "outline"
                  }
                  className={cn(
                    "text-xs",
                    unseatedGuests.length === 0
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  )}
                >
                  {unseatedGuests.length} unseated
                </Badge>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search guests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-9"
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Filter Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="w-full mt-2 justify-start"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {selectedRsvpFilter !== "all" && (
                  <Badge variant="default" className="ml-auto text-xs">
                    1 active
                  </Badge>
                )}
              </Button>

              {/* Filter Options */}
              {showFilters && (
                <div className="mt-2 space-y-1 p-2 bg-muted/50 rounded-lg">
                  {rsvpFilterOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = selectedRsvpFilter === option.value;

                    return (
                      <button
                        key={option.value}
                        onClick={() => setSelectedRsvpFilter(option.value)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 rounded-md",
                          "text-sm transition-colors",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent text-foreground"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <span>{option.label}</span>
                        </div>
                        <Badge
                          variant={isSelected ? "secondary" : "outline"}
                          className="text-xs"
                        >
                          {option.count}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Guest List - max height for ~8-10 guests visible with scrolling */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[600px]">
              {filteredGuests.length === 0 ? (
                <div className="text-center py-8">
                  <User className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {unseatedGuests.length === 0
                      ? "All guests are seated!"
                      : "No guests match your search"}
                  </p>
                </div>
              ) : (
                filteredGuests.map((guest) => {
                  const statusConfig = getRsvpStatusConfig(guest.rsvp_status);
                  const StatusIcon = statusConfig.icon;
                  const isDragging = draggedGuestId === guest.id;

                  return (
                    <div
                      key={guest.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, guest)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border border-border",
                        "bg-card hover:bg-accent cursor-move transition-all",
                        "active:scale-95",
                        isDragging && "opacity-50 scale-95"
                      )}
                    >
                      {/* Avatar */}
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {getGuestInitials(guest)}
                        </span>
                      </div>

                      {/* Guest Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {guest.first_name} {guest.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {guest.email}
                        </p>
                        {/* Dietary restrictions and plus-one info */}
                        <div className="flex items-center gap-2 mt-1">
                          {guest.dietary_restrictions && (
                            <span
                              className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400"
                              title={`Dietary: ${guest.dietary_restrictions}`}
                            >
                              <UtensilsCrossed className="w-3 h-3" />
                              <span className="truncate max-w-[80px]">
                                {guest.dietary_restrictions}
                              </span>
                            </span>
                          )}
                          {guest.plus_one_name && (
                            <span
                              className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400"
                              title={`Plus one: ${guest.plus_one_name}`}
                            >
                              <UserPlus className="w-3 h-3" />
                              <span className="truncate max-w-[60px]">
                                {guest.plus_one_name}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* RSVP Status Badge */}
                      <div className="flex-shrink-0">
                        <div
                          className={cn(
                            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                            statusConfig.bgColor,
                            statusConfig.textColor
                          )}
                        >
                          <StatusIcon className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-muted/50">
              <p className="text-xs text-muted-foreground text-center">
                Drag guests to tables on the canvas to assign seats
              </p>
            </div>
          </>
        )}
      </div>
    </>
  );
}
