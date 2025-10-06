"use client";

/**
 * Events Page Header Component
 * Displays page title, event count, view controls, sort options, and actions
 */

import React from "react";
import { Plus, Filter, X, Grid, List, SortAsc, SortDesc } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { SortOption, SortDirection } from "@/types/preferences.types";
import { cn } from "@/lib/utils";

interface EventsPageHeaderProps {
  totalEvents: number;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  sortBy: SortOption;
  sortDirection: SortDirection;
  onSortChange: (sortBy: SortOption, sortDirection: SortDirection) => void;
  showFilters: boolean;
  onFilterToggle: () => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onCreateEvent: () => void;
  className?: string;
}

const sortOptions = [
  { value: "date", label: "Event Date" },
  { value: "name", label: "Name" },
  { value: "status", label: "Status" },
  { value: "created", label: "Created Date" },
  { value: "guests", label: "Guest Count" },
  { value: "budget", label: "Budget" },
] as const;

export function EventsPageHeader({
  totalEvents,
  viewMode,
  onViewModeChange,
  sortBy,
  sortDirection,
  onSortChange,
  showFilters,
  onFilterToggle,
  hasActiveFilters,
  onClearFilters,
  onCreateEvent,
  className,
}: EventsPageHeaderProps) {
  const handleSortByChange = (value: string | string[]) => {
    const newSortBy = Array.isArray(value) ? value[0] : value;
    onSortChange(newSortBy as SortOption, sortDirection);
  };

  const handleSortDirectionToggle = () => {
    const newDirection = sortDirection === "asc" ? "desc" : "asc";
    onSortChange(sortBy, newDirection);
  };

  return (
    <div className={cn("space-y-4 sm:space-y-6", className)}>
      {/* Title and Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Events
          </h1>
          <span className="text-sm sm:text-base text-muted-foreground">
            {totalEvents} {totalEvents === 1 ? "event" : "events"}
          </span>
        </div>

        {/* Create Event Button - Desktop */}
        <Button
          onClick={onCreateEvent}
          className="hidden lg:flex gap-2 min-h-[44px]"
          size="md"
        >
          <Plus className="h-5 w-5" />
          Create Event
        </Button>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        {/* Left Controls - Filter & Sort */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Filter Toggle */}
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={onFilterToggle}
            className={cn(
              "gap-2 min-h-[44px] justify-start sm:justify-center",
              showFilters && "shadow-sm"
            )}
          >
            <Filter className="h-4 w-4" />
            <span className="sm:inline">
              {showFilters ? "Hide Filters" : "Show Filters"}
            </span>
            {hasActiveFilters && (
              <span className="ml-1 h-2 w-2 rounded-full bg-primary animate-pulse" />
            )}
          </Button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="gap-2 min-h-[44px] text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </Button>
          )}

          {/* Sort Controls */}
          <div className="flex gap-2 items-center">
            {/* Sort By Dropdown */}
            <div className="flex-1 sm:w-48">
              <Select
                options={sortOptions.map((opt) => ({
                  value: opt.value,
                  label: opt.label,
                }))}
                value={sortBy}
                onValueChange={handleSortByChange}
                placeholder="Sort by..."
                className="min-h-[44px]"
              />
            </div>

            {/* Sort Direction Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSortDirectionToggle}
              className="min-h-[44px] min-w-[44px] px-3"
              title={sortDirection === "asc" ? "Ascending" : "Descending"}
            >
              {sortDirection === "asc" ? (
                <SortAsc className="h-4 w-4" />
              ) : (
                <SortDesc className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Right Controls - View Mode Toggle */}
        {/* <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("grid")}
            className={cn(
              "gap-1 min-h-[44px] min-w-[44px] px-2 sm:px-3",
              "transition-all duration-200",
              viewMode === "grid" && "shadow-sm"
            )}
            title="Grid view"
          >
            <Grid className="h-4 w-4" />
            <span className="hidden sm:inline">Grid</span>
          </Button>

          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("list")}
            className={cn(
              "gap-1 min-h-[44px] min-w-[44px] px-2 sm:px-3",
              "transition-all duration-200",
              viewMode === "list" && "shadow-sm"
            )}
            title="List view"
          >
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">List</span>
          </Button>
        </div> */}
      </div>
    </div>
  );
}
