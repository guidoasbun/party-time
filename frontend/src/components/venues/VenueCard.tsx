/**
 * FR-8: The system shall provide a venue search interface.
 * Phase 7.1.1: Google Places API Integration
 * VenueCard Component (Phase 7.1.1: Google Places API Integration)
 *
 * Displays a venue in search results with photo, name, rating, address, and price level.
 * Theme-aware styling using CSS variables from globals.css.
 */
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  VenueSearchResult,
  PRICE_LEVEL_LABELS,
  getVenueTypeLabel,
} from "@/types/venue.types";
import { Star, MapPin, Clock, ExternalLink, Bookmark } from "lucide-react";
import Image from "next/image";

interface VenueCardProps {
  venue: VenueSearchResult;
  onClick?: (venue: VenueSearchResult) => void;
  onSelect?: (venue: VenueSearchResult) => void;
  selected?: boolean;
  isSaved?: boolean;
  onToggleSave?: (venue: VenueSearchResult) => void;
  className?: string;
}

export function VenueCard({
  venue,
  onClick,
  onSelect,
  selected = false,
  isSaved = false,
  onToggleSave,
  className,
}: VenueCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(venue);
    }
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(venue);
    }
  };

  const handleToggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleSave) {
      onToggleSave(venue);
    }
  };

  // Get primary venue type for display
  const primaryType = venue.types[0];
  const typeLabel = primaryType ? getVenueTypeLabel(primaryType) : undefined;

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/50",
        selected && "ring-2 ring-primary border-primary",
        className
      )}
      onClick={handleClick}
    >
      <CardContent className="p-0">
        <div className="flex gap-4">
          {/* Venue Photo */}
          <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-l-lg bg-muted">
            {venue.photo_url ? (
              <Image
                src={venue.photo_url}
                alt={venue.name}
                fill
                className="object-cover"
                sizes="128px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <MapPin className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            {/* Save/Bookmark Button */}
            {onToggleSave && (
              <button
                onClick={handleToggleSave}
                className={cn(
                  "absolute right-2 top-2 rounded-full p-1.5 transition-colors",
                  isSaved
                    ? "bg-primary text-primary-foreground"
                    : "bg-background/80 text-muted-foreground hover:bg-background hover:text-primary"
                )}
                title={isSaved ? "Remove from saved" : "Save venue"}
              >
                <Bookmark
                  className={cn("h-4 w-4", isSaved && "fill-current")}
                />
              </button>
            )}
          </div>

          {/* Venue Info */}
          <div className="flex flex-1 flex-col justify-between py-3 pr-4">
            <div>
              {/* Name and Type */}
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-foreground line-clamp-1">
                  {venue.name}
                </h3>
                {typeLabel && (
                  <Badge variant="secondary" className="flex-shrink-0 text-xs">
                    {typeLabel}
                  </Badge>
                )}
              </div>

              {/* Address */}
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {venue.address}
              </p>
            </div>

            {/* Rating, Price, Status */}
            <div className="mt-2 flex items-center gap-4 text-sm">
              {/* Rating */}
              {venue.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-medium">{venue.rating.toFixed(1)}</span>
                  {venue.user_ratings_total && (
                    <span className="text-muted-foreground">
                      ({venue.user_ratings_total.toLocaleString()})
                    </span>
                  )}
                </div>
              )}

              {/* Price Level */}
              {venue.price_level !== undefined &&
                venue.price_level !== null && (
                  <span className="text-muted-foreground">
                    {PRICE_LEVEL_LABELS[venue.price_level]}
                  </span>
                )}

              {/* Open Now Status */}
              {venue.open_now !== undefined && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span
                    className={cn(
                      "text-xs font-medium",
                      venue.open_now ? "text-green-600" : "text-red-500"
                    )}
                  >
                    {venue.open_now ? "Open" : "Closed"}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {onSelect && (
              <div className="mt-2 flex justify-end">
                <button
                  onClick={handleSelect}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    selected
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary/10 text-primary hover:bg-primary/20"
                  )}
                >
                  {selected ? "Selected" : "Select"}
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton loader for VenueCard
 */
export function VenueCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex gap-4">
          <div className="h-32 w-32 flex-shrink-0 animate-pulse rounded-l-lg bg-muted" />
          <div className="flex flex-1 flex-col justify-between py-3 pr-4">
            <div>
              <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
              <div className="mt-2 h-4 w-full animate-pulse rounded bg-muted" />
              <div className="mt-1 h-4 w-2/3 animate-pulse rounded bg-muted" />
            </div>
            <div className="mt-2 flex gap-4">
              <div className="h-4 w-16 animate-pulse rounded bg-muted" />
              <div className="h-4 w-12 animate-pulse rounded bg-muted" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
