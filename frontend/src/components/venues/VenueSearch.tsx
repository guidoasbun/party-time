/**
 * FR-8: The system shall provide a venue search interface.
 * Phase 7.1.1: Google Places API Integration
 * VenueSearch Component (Phase 7.1.1: Google Places API Integration)
 *
 * Search interface for finding venues via Google Places API.
 * Features:
 * - Search input with debounce
 * - Location input (address or "use my location")
 * - Filter dropdowns: venue type, rating
 * - Loading, empty, error states
 * - Theme-aware styling
 */
"use client";

import * as React from "react";
import { useState, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";
import { VenueCard, VenueCardSkeleton } from "./VenueCard";
import {
  VenueSearchParams,
  VenueSearchResult,
  VenueSearchResponse,
} from "@/types/venue.types";
import { venueService } from "@/lib/api/services/venue.service";
import {
  Search,
  MapPin,
  Navigation,
  Loader2,
  AlertCircle,
  Building2,
} from "lucide-react";

interface VenueSearchProps {
  onVenueSelect?: (venue: VenueSearchResult) => void;
  onVenueClick?: (venue: VenueSearchResult) => void;
  selectedVenueId?: string;
  className?: string;
  defaultQuery?: string;
}

// Venue type options for filter
const VENUE_TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "restaurant", label: "Restaurant" },
  { value: "event_venue", label: "Event Venue" },
  { value: "banquet_hall", label: "Banquet Hall" },
  { value: "hotel", label: "Hotel" },
  { value: "wedding_venue", label: "Wedding Venue" },
  { value: "conference_center", label: "Conference Center" },
  { value: "bar", label: "Bar / Night Club" },
  { value: "park", label: "Park / Outdoor" },
  { value: "community_center", label: "Community Center" },
];

// Rating options for filter
const RATING_OPTIONS = [
  { value: "", label: "Any Rating" },
  { value: "3", label: "3+ Stars" },
  { value: "3.5", label: "3.5+ Stars" },
  { value: "4", label: "4+ Stars" },
  { value: "4.5", label: "4.5+ Stars" },
];

// Radius options (in meters)
const RADIUS_OPTIONS = [
  { value: "5000", label: "5 km" },
  { value: "10000", label: "10 km" },
  { value: "25000", label: "25 km" },
  { value: "50000", label: "50 km" },
];

export function VenueSearch({
  onVenueSelect,
  onVenueClick,
  selectedVenueId,
  className,
  defaultQuery = "",
}: VenueSearchProps) {
  // Search state
  const [query, setQuery] = useState(defaultQuery);
  const [locationQuery, setLocationQuery] = useState("");
  const [venueType, setVenueType] = useState("");
  const [minRating, setMinRating] = useState("");
  const [radius, setRadius] = useState("25000");

  // Results state
  const [results, setResults] = useState<VenueSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Location state
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Debounce timer
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Search function
  const performSearch = useCallback(async () => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const params: VenueSearchParams = {
        query: query.trim(),
        radius: parseInt(radius),
        max_results: 20,
      };

      // Add location if available
      if (userLocation) {
        params.latitude = userLocation.latitude;
        params.longitude = userLocation.longitude;
      }

      // Add filters
      if (venueType) {
        params.venue_type = venueType;
      }
      if (minRating) {
        params.min_rating = parseFloat(minRating);
      }

      const response: VenueSearchResponse = await venueService.searchVenues(
        params
      );
      setResults(response.results);
    } catch (err) {
      console.error("Venue search error:", err);
      setError("Failed to search venues. Please try again.");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [query, userLocation, venueType, minRating, radius]);

  // Debounced search on query change
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch();
      }, 300); // 300ms debounce
    } else {
      setResults([]);
      setHasSearched(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, performSearch]);

  // Re-search when filters change
  useEffect(() => {
    if (hasSearched && query.trim()) {
      performSearch();
    }
  }, [venueType, minRating, radius, userLocation]);

  // Get user's current location
  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setIsGettingLocation(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationQuery("Current location");
        setIsGettingLocation(false);
      },
      (err) => {
        console.error("Geolocation error:", err);
        setError("Failed to get your location. Please enter it manually.");
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // Clear location
  const clearLocation = useCallback(() => {
    setUserLocation(null);
    setLocationQuery("");
  }, []);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Input */}
      <div className="space-y-2">
        <Label htmlFor="venue-search">Search Venues</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="venue-search"
            type="text"
            placeholder="Search for venues (e.g., 'wedding venue', 'hotel conference room')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Location Input */}
      <div className="space-y-2">
        <Label htmlFor="venue-location">Location</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="venue-location"
              type="text"
              placeholder="Enter location or use current"
              value={locationQuery}
              onChange={(e) => {
                setLocationQuery(e.target.value);
                // In a full implementation, we'd geocode this address
              }}
              className="pl-10"
              disabled={!!userLocation}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={userLocation ? clearLocation : getUserLocation}
            disabled={isGettingLocation}
            title={userLocation ? "Clear location" : "Use my location"}
            className="px-3"
          >
            {isGettingLocation ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Navigation
                className={cn("h-4 w-4", userLocation && "text-primary")}
              />
            )}
          </Button>
        </div>
      </div>

      {/* Filters Row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Venue Type Filter */}
        <div className="space-y-1">
          <Label className="text-xs">Venue Type</Label>
          <Select
            options={VENUE_TYPE_OPTIONS}
            value={venueType}
            onValueChange={(value) => setVenueType(value as string)}
            placeholder="All Types"
          />
        </div>

        {/* Rating Filter */}
        <div className="space-y-1">
          <Label className="text-xs">Min Rating</Label>
          <Select
            options={RATING_OPTIONS}
            value={minRating}
            onValueChange={(value) => setMinRating(value as string)}
            placeholder="Any Rating"
          />
        </div>

        {/* Radius Filter */}
        <div className="space-y-1">
          <Label className="text-xs">Search Radius</Label>
          <Select
            options={RADIUS_OPTIONS}
            value={radius}
            onValueChange={(value) => setRadius(value as string)}
            placeholder="25 km"
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results */}
      <div className="space-y-3">
        {/* Loading State */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <VenueCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Results List */}
        {!isLoading && results.length > 0 && (
          <>
            <p className="text-sm text-muted-foreground">
              {results.length} venue{results.length !== 1 ? "s" : ""} found
            </p>
            <div className="space-y-3">
              {results.map((venue) => (
                <VenueCard
                  key={venue.place_id}
                  venue={venue}
                  onClick={onVenueClick}
                  onSelect={onVenueSelect}
                  selected={selectedVenueId === venue.place_id}
                />
              ))}
            </div>
          </>
        )}

        {/* Empty State */}
        {!isLoading && hasSearched && results.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 font-semibold text-foreground">
              No venues found
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        )}

        {/* Initial State */}
        {!isLoading && !hasSearched && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
            <Search className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 font-semibold text-foreground">
              Search for venues
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter a search term to find venues near you
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
