/**
 * FR-8: The system shall provide a venue search interface.
 * Phase 7.1.3: Venue Comparison Tool
 * VenueCompareBar Component
 *
 * Floating bottom bar showing selected venues for comparison.
 * Shows venue thumbnails, remove buttons, and "Compare Now" action.
 * Theme-aware styling using CSS variables from globals.css.
 */
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { CompareVenue, MIN_COMPARE_VENUES } from "@/types/venue.types";
import { X, GitCompareArrows, Trash2 } from "lucide-react";
import Image from "next/image";

interface VenueCompareBarProps {
  compareList: CompareVenue[];
  onRemove: (placeId: string) => void;
  onClear: () => void;
  onCompare: () => void;
  className?: string;
}

export function VenueCompareBar({
  compareList,
  onRemove,
  onClear,
  onCompare,
  className,
}: VenueCompareBarProps) {
  const canCompare = compareList.length >= MIN_COMPARE_VENUES;

  // Don't render if no venues selected
  if (compareList.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-background border-t border-border shadow-lg",
        "animate-in slide-in-from-bottom duration-300",
        className
      )}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Selected Venues */}
          <div className="flex items-center gap-3 overflow-x-auto">
            <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground shrink-0">
              <GitCompareArrows className="h-4 w-4" />
              <span>{compareList.length} selected</span>
            </div>

            <div className="flex items-center gap-2">
              {compareList.map((venue) => (
                <VenueCompareChip
                  key={venue.placeId}
                  venue={venue}
                  onRemove={() => onRemove(venue.placeId)}
                />
              ))}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear
            </Button>
            <Button
              onClick={onCompare}
              disabled={!canCompare}
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              <GitCompareArrows className="h-4 w-4 mr-2" />
              Compare{canCompare ? "" : ` (${MIN_COMPARE_VENUES - compareList.length} more)`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Individual venue chip in the compare bar
 */
interface VenueCompareChipProps {
  venue: CompareVenue;
  onRemove: () => void;
}

function VenueCompareChip({ venue, onRemove }: VenueCompareChipProps) {
  return (
    <div className="flex items-center gap-2 bg-muted rounded-full pl-1 pr-2 py-1">
      {/* Thumbnail */}
      <div className="relative h-8 w-8 rounded-full overflow-hidden bg-muted-foreground/20 shrink-0">
        {venue.photoUrl ? (
          <Image
            src={venue.photoUrl}
            alt={venue.name}
            fill
            className="object-cover"
            sizes="32px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <GitCompareArrows className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Name */}
      <span className="text-sm font-medium max-w-[120px] truncate">
        {venue.name}
      </span>

      {/* Remove Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="p-0.5 rounded-full hover:bg-background/80 text-muted-foreground hover:text-destructive transition-colors"
        title="Remove from comparison"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
