/**
 * FR-8: The system shall provide a venue search interface.
 * Phase 7.1.3: Venue Comparison Tool
 * VenueCompareModal Component
 *
 * Side-by-side comparison modal for 2-4 venues.
 * Fetches detailed venue info and displays comparison grid.
 * Theme-aware styling using CSS variables from globals.css.
 */
"use client";

import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  CompareVenue,
  VenueDetails,
  PRICE_LEVEL_LABELS,
  getVenueTypeLabel,
} from "@/types/venue.types";
import { venueService } from "@/lib/api/services/venue.service";
import {
  Star,
  MapPin,
  Phone,
  Globe,
  Clock,
  ExternalLink,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";

interface VenueCompareModalProps {
  open: boolean;
  onClose: () => void;
  compareList: CompareVenue[];
  onSelectVenue?: (placeId: string) => void;
  onRemoveFromCompare?: (placeId: string) => void;
}

interface VenueDetailState {
  data: VenueDetails | null;
  loading: boolean;
  error: string | null;
}

export function VenueCompareModal({
  open,
  onClose,
  compareList,
  onSelectVenue,
  onRemoveFromCompare,
}: VenueCompareModalProps) {
  const [venueDetails, setVenueDetails] = useState<
    Record<string, VenueDetailState>
  >({});

  // Fetch venue details when modal opens
  useEffect(() => {
    if (!open || compareList.length === 0) return;

    const fetchDetails = async () => {
      // Initialize loading states
      const initialState: Record<string, VenueDetailState> = {};
      compareList.forEach((venue) => {
        initialState[venue.placeId] = { data: null, loading: true, error: null };
      });
      setVenueDetails(initialState);

      // Fetch each venue's details
      await Promise.all(
        compareList.map(async (venue) => {
          try {
            const details = await venueService.getVenueDetails(venue.placeId);
            setVenueDetails((prev) => ({
              ...prev,
              [venue.placeId]: { data: details, loading: false, error: null },
            }));
          } catch {
            setVenueDetails((prev) => ({
              ...prev,
              [venue.placeId]: {
                data: null,
                loading: false,
                error: "Failed to load venue details",
              },
            }));
          }
        })
      );
    };

    fetchDetails();
  }, [open, compareList]);

  // Get today's day index (0 = Sunday, 6 = Saturday)
  const getTodaysHours = useCallback((details: VenueDetails): string => {
    if (!details.opening_hours?.weekday_text) return "Hours not available";
    const today = new Date().getDay();
    // weekday_text is indexed 0-6 for Monday-Sunday, but getDay() returns 0 for Sunday
    const dayIndex = today === 0 ? 6 : today - 1;
    return details.opening_hours.weekday_text[dayIndex] || "Hours not available";
  }, []);

  // Render loading skeleton for a column
  const renderSkeleton = () => (
    <div className="space-y-4 animate-pulse">
      <div className="h-40 bg-muted rounded-lg" />
      <div className="h-4 bg-muted rounded w-3/4" />
      <div className="h-4 bg-muted rounded w-1/2" />
      <div className="h-4 bg-muted rounded w-2/3" />
      <div className="h-4 bg-muted rounded w-1/2" />
    </div>
  );

  // Render error state for a column
  const renderError = (placeId: string, error: string) => (
    <div className="flex flex-col items-center justify-center h-full py-8 text-center">
      <AlertCircle className="h-8 w-8 text-destructive mb-2" />
      <p className="text-sm text-muted-foreground">{error}</p>
      {onRemoveFromCompare && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemoveFromCompare(placeId)}
          className="mt-2"
        >
          Remove
        </Button>
      )}
    </div>
  );

  // Render venue column
  const renderVenueColumn = (venue: CompareVenue) => {
    const state = venueDetails[venue.placeId];

    if (!state || state.loading) {
      return renderSkeleton();
    }

    if (state.error || !state.data) {
      return renderError(venue.placeId, state.error || "No data available");
    }

    const details = state.data;
    const primaryType = details.types[0];

    return (
      <div className="space-y-4">
        {/* Photo */}
        <div className="relative h-40 w-full rounded-lg overflow-hidden bg-muted">
          {details.photos[0]?.url ? (
            <Image
              src={details.photos[0].url}
              alt={details.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 25vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <MapPin className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          {/* Remove button */}
          {onRemoveFromCompare && (
            <button
              onClick={() => onRemoveFromCompare(venue.placeId)}
              className="absolute top-2 right-2 p-1 rounded-full bg-background/80 hover:bg-background text-muted-foreground hover:text-destructive transition-colors"
              title="Remove from comparison"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Name & Type */}
        <div>
          <h3 className="font-semibold text-foreground line-clamp-2">
            {details.name}
          </h3>
          {primaryType && (
            <Badge variant="secondary" className="mt-1 text-xs">
              {getVenueTypeLabel(primaryType)}
            </Badge>
          )}
        </div>

        {/* Rating */}
        <CompareRow label="Rating">
          {details.rating ? (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-medium">{details.rating.toFixed(1)}</span>
              {details.user_ratings_total && (
                <span className="text-muted-foreground text-sm">
                  ({details.user_ratings_total.toLocaleString()})
                </span>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">No rating</span>
          )}
        </CompareRow>

        {/* Price Level */}
        <CompareRow label="Price">
          {details.price_level !== undefined && details.price_level !== null ? (
            <span className="font-medium">
              {PRICE_LEVEL_LABELS[details.price_level]}
            </span>
          ) : (
            <span className="text-muted-foreground">Not available</span>
          )}
        </CompareRow>

        {/* Address */}
        <CompareRow label="Address">
          <div className="flex items-start gap-1">
            <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
            <span className="text-sm">{details.formatted_address}</span>
          </div>
        </CompareRow>

        {/* Phone */}
        <CompareRow label="Phone">
          {details.phone ? (
            <a
              href={`tel:${details.phone}`}
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <Phone className="h-4 w-4" />
              {details.phone}
            </a>
          ) : (
            <span className="text-muted-foreground">Not available</span>
          )}
        </CompareRow>

        {/* Website */}
        <CompareRow label="Website">
          {details.website ? (
            <a
              href={details.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <Globe className="h-4 w-4" />
              Visit Website
              <ExternalLink className="h-3 w-3" />
            </a>
          ) : (
            <span className="text-muted-foreground">Not available</span>
          )}
        </CompareRow>

        {/* Opening Hours */}
        <CompareRow label="Hours Today">
          <div className="flex items-start gap-1">
            <Clock className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
            <div className="text-sm">
              <span>{getTodaysHours(details)}</span>
              {details.opening_hours?.open_now !== undefined && (
                <Badge
                  variant={details.opening_hours.open_now ? "default" : "destructive"}
                  className={cn(
                    "ml-2 text-xs",
                    details.opening_hours.open_now &&
                      "bg-green-600 hover:bg-green-700"
                  )}
                >
                  {details.opening_hours.open_now ? "Open" : "Closed"}
                </Badge>
              )}
            </div>
          </div>
        </CompareRow>

        {/* Review Snippet */}
        {details.reviews[0] && (
          <CompareRow label="Top Review">
            <div className="text-sm">
              <div className="flex items-center gap-1 mb-1">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span className="font-medium">{details.reviews[0].rating}</span>
                <span className="text-muted-foreground text-xs">
                  by {details.reviews[0].author_name}
                </span>
              </div>
              <p className="text-muted-foreground line-clamp-2 text-xs">
                &quot;{details.reviews[0].text}&quot;
              </p>
            </div>
          </CompareRow>
        )}

        {/* Select Button */}
        {onSelectVenue && (
          <Button
            onClick={() => onSelectVenue(venue.placeId)}
            className="w-full mt-4"
          >
            Select This Venue
          </Button>
        )}

        {/* Google Maps Link */}
        {details.url && (
          <a
            href={details.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            View on Google Maps
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    );
  };

  // Check if all venues are loading
  const isLoading = compareList.some(
    (venue) => !venueDetails[venue.placeId] || venueDetails[venue.placeId].loading
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Compare Venues"
      size="xl"
      className="max-w-6xl"
    >
      <div className="min-h-[400px]">
        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading venue details...</span>
          </div>
        )}

        {/* Comparison Grid */}
        <div
          className={cn(
            "grid gap-6",
            compareList.length === 2 && "grid-cols-1 md:grid-cols-2",
            compareList.length === 3 && "grid-cols-1 md:grid-cols-3",
            compareList.length >= 4 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          )}
        >
          {compareList.map((venue) => (
            <div
              key={venue.placeId}
              className="border border-border rounded-lg p-4 bg-card"
            >
              {renderVenueColumn(venue)}
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

/**
 * Helper component for comparison rows
 */
interface CompareRowProps {
  label: string;
  children: React.ReactNode;
}

function CompareRow({ label, children }: CompareRowProps) {
  return (
    <div className="space-y-1">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </span>
      <div className="text-foreground">{children}</div>
    </div>
  );
}
