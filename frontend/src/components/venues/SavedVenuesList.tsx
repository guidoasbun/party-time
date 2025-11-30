/**
 * FR-8: The system shall provide a venue search interface.
 * Phase 7.1.2: Venue Search UI Enhancement
 * SavedVenuesList Component
 *
 * Displays saved/shortlisted venues for an event with actions to:
 * - View venue details
 * - Add venue to event
 * - Remove from saved list
 * - Clear all saved venues
 */
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SavedVenue, PRICE_LEVEL_LABELS } from "@/types/venue.types";
import {
  Bookmark,
  MapPin,
  Star,
  Trash2,
  Plus,
  ExternalLink,
  Loader2,
  GitCompareArrows,
} from "lucide-react";
import Image from "next/image";

interface SavedVenuesListProps {
  savedVenues: SavedVenue[];
  onAddToEvent?: (venue: SavedVenue) => void;
  onRemove: (placeId: string) => void;
  onViewDetails?: (placeId: string) => void;
  onClearAll?: () => void;
  isLoading?: boolean;
  // Phase 7.1.3: Comparison props
  isInCompare?: (placeId: string) => boolean;
  onToggleCompare?: (venue: SavedVenue) => void;
  canAddToCompare?: boolean;
  compareCount?: number;
  onCompare?: () => void;
  className?: string;
}

export function SavedVenuesList({
  savedVenues,
  onAddToEvent,
  onRemove,
  onViewDetails,
  onClearAll,
  isLoading = false,
  isInCompare,
  onToggleCompare,
  canAddToCompare = true,
  compareCount = 0,
  onCompare,
  className,
}: SavedVenuesListProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-12", className)}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-sm text-muted-foreground">Loading saved venues...</p>
      </div>
    );
  }

  // Empty state
  if (savedVenues.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center",
          className
        )}
      >
        <Bookmark className="h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 font-semibold text-foreground">No saved venues</h3>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          Save venues from search results to create a shortlist for comparison
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with count, compare status, and actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">
            {savedVenues.length} saved venue{savedVenues.length !== 1 ? "s" : ""}
          </p>
          {compareCount > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <GitCompareArrows className="h-3 w-3" />
              {compareCount} selected
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onCompare && compareCount >= 2 && (
            <Button
              variant="default"
              size="sm"
              onClick={onCompare}
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              <GitCompareArrows className="mr-1 h-3 w-3" />
              Compare
            </Button>
          )}
          {onClearAll && savedVenues.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="mr-1 h-3 w-3" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Saved venues list */}
      <div className="space-y-3">
        {savedVenues.map((venue) => (
          <SavedVenueCard
            key={venue.placeId}
            venue={venue}
            onAddToEvent={onAddToEvent}
            onRemove={onRemove}
            onViewDetails={onViewDetails}
            isInCompare={isInCompare?.(venue.placeId) ?? false}
            onToggleCompare={onToggleCompare}
            canAddToCompare={canAddToCompare}
          />
        ))}
      </div>
    </div>
  );
}

interface SavedVenueCardProps {
  venue: SavedVenue;
  onAddToEvent?: (venue: SavedVenue) => void;
  onRemove: (placeId: string) => void;
  onViewDetails?: (placeId: string) => void;
  // Phase 7.1.3: Comparison props
  isInCompare?: boolean;
  onToggleCompare?: (venue: SavedVenue) => void;
  canAddToCompare?: boolean;
}

function SavedVenueCard({
  venue,
  onAddToEvent,
  onRemove,
  onViewDetails,
  isInCompare = false,
  onToggleCompare,
  canAddToCompare = true,
}: SavedVenueCardProps) {
  return (
    <Card className="transition-colors hover:border-primary/50">
      <CardContent className="p-3">
        <div className="flex gap-3">
          {/* Photo */}
          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
            {venue.photoUrl ? (
              <Image
                src={venue.photoUrl}
                alt={venue.name}
                fill
                className="object-cover"
                sizes="80px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <MapPin className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-1 flex-col justify-between min-w-0">
            <div>
              <h4 className="font-medium text-foreground line-clamp-1">
                {venue.name}
              </h4>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {venue.address}
              </p>
            </div>

            {/* Rating and Price */}
            <div className="flex items-center gap-3 text-xs">
              {venue.rating && (
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {venue.rating.toFixed(1)}
                </span>
              )}
              {venue.priceLevel !== undefined && venue.priceLevel !== null && (
                <span className="text-muted-foreground">
                  {PRICE_LEVEL_LABELS[venue.priceLevel]}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="mt-2 flex items-center gap-2">
              {/* Compare Toggle */}
              {onToggleCompare && (
                <Button
                  variant={isInCompare ? "default" : "outline"}
                  size="sm"
                  onClick={() => onToggleCompare(venue)}
                  disabled={!isInCompare && !canAddToCompare}
                  className={cn(
                    "h-7 px-2 text-xs",
                    isInCompare && "bg-violet-600 hover:bg-violet-700 text-white"
                  )}
                  title={
                    isInCompare
                      ? "Remove from comparison"
                      : !canAddToCompare
                        ? "Maximum 4 venues can be compared"
                        : "Add to comparison"
                  }
                >
                  <GitCompareArrows className="mr-1 h-3 w-3" />
                  {isInCompare ? "Selected" : "Compare"}
                </Button>
              )}
              {onViewDetails && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails(venue.placeId)}
                  className="h-7 px-2 text-xs"
                >
                  <ExternalLink className="mr-1 h-3 w-3" />
                  Details
                </Button>
              )}
              {onAddToEvent && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onAddToEvent(venue)}
                  className="h-7 px-2 text-xs"
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Add to Event
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(venue.placeId)}
                className="h-7 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
