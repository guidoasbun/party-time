/**
 * FR-8: The system shall provide a venue search interface.
 * Phase 7.1.2: Venue Search UI Enhancement
 * VenueSearchWithMap Component
 *
 * Split-view layout combining search results with an interactive map.
 * Features:
 * - Responsive split layout: 60% list / 40% map on desktop (lg:), stacked on mobile
 * - List/Map view toggle for mobile
 * - Synced selection: click card → highlight marker, click marker → scroll to card
 * - Map auto-fits bounds to show all search result markers
 * - Theme-aware styling
 */
"use client";

import * as React from "react";
import { useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { VenueSearch } from "./VenueSearch";
import { VenueMap } from "./VenueMap";
import { VenueDetails } from "./VenueDetails";
import { VenueSearchResult, VenueDetails as VenueDetailsType } from "@/types/venue.types";
import { List, Map, MapPin } from "lucide-react";

type MobileView = "list" | "map";

interface VenueSearchWithMapProps {
  onVenueSelect?: (venue: VenueDetailsType) => void;
  eventId?: string;
  isSaved?: (placeId: string) => boolean;
  onToggleSave?: (venue: VenueSearchResult) => void;
  className?: string;
}

export function VenueSearchWithMap({
  onVenueSelect,
  eventId,
  isSaved,
  onToggleSave,
  className,
}: VenueSearchWithMapProps) {
  // Track search results for map markers
  const [searchResults, setSearchResults] = useState<VenueSearchResult[]>([]);
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const [detailsPlaceId, setDetailsPlaceId] = useState<string | null>(null);

  // Mobile view toggle
  const [mobileView, setMobileView] = useState<MobileView>("list");

  // Refs for scroll syncing
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Handle venue click from search results
  const handleVenueClick = useCallback((venue: VenueSearchResult) => {
    setSelectedVenueId(venue.place_id);
    setDetailsPlaceId(venue.place_id);
  }, []);

  // Handle marker click on map
  const handleMarkerSelect = useCallback((venueId: string) => {
    setSelectedVenueId(venueId);

    // Scroll to card on desktop
    const cardElement = cardRefs.current[venueId];
    if (cardElement && listContainerRef.current) {
      cardElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    // On mobile, switch to list view when marker is clicked
    setMobileView("list");
  }, []);

  // Clear selection when search changes
  const handleSearchResults = useCallback((results: VenueSearchResult[]) => {
    setSearchResults(results);
    setSelectedVenueId(null);
  }, []);

  // Convert search results to map markers
  const mapVenues = searchResults.map((venue) => ({
    id: venue.place_id,
    name: venue.name,
    latitude: venue.location.latitude,
    longitude: venue.location.longitude,
    address: venue.address,
    rating: venue.rating,
  }));

  return (
    <div className={cn("relative", className)}>
      {/* Mobile View Toggle */}
      <div className="mb-4 flex lg:hidden">
        <div className="inline-flex rounded-lg border bg-background p-1">
          <Button
            variant={mobileView === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setMobileView("list")}
            className="gap-2"
          >
            <List className="h-4 w-4" />
            List
          </Button>
          <Button
            variant={mobileView === "map" ? "default" : "ghost"}
            size="sm"
            onClick={() => setMobileView("map")}
            className="gap-2"
          >
            <Map className="h-4 w-4" />
            Map
          </Button>
        </div>
        {searchResults.length > 0 && (
          <span className="ml-auto self-center text-sm text-muted-foreground">
            {searchResults.length} venue{searchResults.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Split View Layout */}
      <div className="flex flex-col lg:flex-row lg:gap-4">
        {/* Search Results Panel */}
        <div
          ref={listContainerRef}
          className={cn(
            "lg:w-3/5 lg:block",
            mobileView === "list" ? "block" : "hidden"
          )}
        >
          <VenueSearch
            onVenueClick={handleVenueClick}
            onVenueSelect={handleVenueClick}
            onResultsChange={handleSearchResults}
            selectedVenueId={selectedVenueId ?? undefined}
            isSaved={isSaved}
            onToggleSave={onToggleSave}
            className="max-h-[calc(100vh-200px)] overflow-y-auto lg:max-h-none lg:overflow-visible"
          />
        </div>

        {/* Map Panel */}
        <div
          className={cn(
            "lg:w-2/5 lg:block lg:sticky lg:top-4 lg:self-start",
            mobileView === "map" ? "block" : "hidden"
          )}
        >
          {searchResults.length > 0 ? (
            <VenueMap
              venues={mapVenues}
              selectedVenueId={selectedVenueId ?? undefined}
              onVenueSelect={handleMarkerSelect}
              height="500px"
              showInfoWindows={true}
              className="rounded-lg border"
            />
          ) : (
            <div className="flex h-[500px] flex-col items-center justify-center rounded-lg border border-dashed bg-muted/50">
              <MapPin className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 font-semibold text-foreground">
                No venues to display
              </h3>
              <p className="mt-1 text-sm text-muted-foreground text-center max-w-xs">
                Search for venues to see them on the map
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Venue Details Modal */}
      {detailsPlaceId && (
        <VenueDetails
          placeId={detailsPlaceId}
          isOpen={!!detailsPlaceId}
          onClose={() => setDetailsPlaceId(null)}
          onSelect={onVenueSelect}
        />
      )}
    </div>
  );
}
