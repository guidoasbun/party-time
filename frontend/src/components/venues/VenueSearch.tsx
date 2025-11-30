/**
 * FR-8: The system shall provide a venue search interface.
 * Phase 7.1.1: Google Places API Integration
 * Phase 7.1.2: Venue Search UI Enhancement
 * VenueSearch Component
 *
 * Search interface for finding venues via Google Places API.
 * Features:
 * - Search input with debounce
 * - Location input (address or "use my location")
 * - Filter dropdowns: venue type, rating, price level
 * - Open Now toggle filter
 * - Sort dropdown (relevance, rating, price)
 * - Loading, empty, error states
 * - Theme-aware styling
 */
"use client";

import * as React from "react";
import { useState, useCallback, useEffect, useRef, useMemo } from "react";
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
  VenueSortOption,
  PRICE_LEVEL_FILTER_OPTIONS,
  VENUE_SORT_OPTIONS,
} from "@/types/venue.types";
import { venueService } from "@/lib/api/services/venue.service";
import {
  Search,
  MapPin,
  Navigation,
  Loader2,
  AlertCircle,
  Building2,
  Clock,
  Bookmark,
} from "lucide-react";

interface VenueSearchProps {
  onVenueSelect?: (venue: VenueSearchResult) => void;
  onVenueClick?: (venue: VenueSearchResult) => void;
  onResultsChange?: (results: VenueSearchResult[]) => void;
  selectedVenueId?: string;
  isSaved?: (placeId: string) => boolean;
  onToggleSave?: (venue: VenueSearchResult) => void;
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
  onResultsChange,
  selectedVenueId,
  isSaved,
  onToggleSave,
  className,
  defaultQuery = "",
}: VenueSearchProps) {
  // Search state
  const [query, setQuery] = useState(defaultQuery);
  const [locationQuery, setLocationQuery] = useState("");
  const [venueType, setVenueType] = useState("");
  const [minRating, setMinRating] = useState("");
  const [radius, setRadius] = useState("25000");
  // Phase 7.1.2: New filter states
  const [priceLevel, setPriceLevel] = useState("");
  const [openNow, setOpenNow] = useState(false);
  const [sortBy, setSortBy] = useState<VenueSortOption>("relevance");

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
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Debounce timers
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const geocodeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Notify parent when results change
  useEffect(() => {
    onResultsChange?.(results);
  }, [results, onResultsChange]);

  // Phase 7.1.2: Client-side filtering and sorting
  const filteredAndSortedResults = useMemo(() => {
    let filtered = [...results];

    // Filter by price level
    if (priceLevel) {
      const targetPrice = parseInt(priceLevel);
      filtered = filtered.filter(
        (v) => v.price_level !== undefined && v.price_level === targetPrice
      );
    }

    // Filter by open now
    if (openNow) {
      filtered = filtered.filter((v) => v.open_now === true);
    }

    // Sort results
    switch (sortBy) {
      case "rating_desc":
        filtered.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case "price_asc":
        filtered.sort((a, b) => (a.price_level ?? 5) - (b.price_level ?? 5));
        break;
      case "price_desc":
        filtered.sort((a, b) => (b.price_level ?? 0) - (a.price_level ?? 0));
        break;
      case "relevance":
      default:
        // Keep original order (API returns relevance-sorted)
        break;
    }

    return filtered;
  }, [results, priceLevel, openNow, sortBy]);

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
    setLocationError(null);
  }, []);

  // Geocode an address/city/zipcode to coordinates
  const geocodeLocation = useCallback(async (address: string) => {
    if (!address.trim()) {
      setUserLocation(null);
      setLocationError(null);
      return;
    }

    setIsGeocoding(true);
    setLocationError(null);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        setLocationError("Google Maps API key not configured");
        return;
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${apiKey}`
      );

      const data = await response.json();

      if (data.status === "OK" && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        setUserLocation({
          latitude: location.lat,
          longitude: location.lng,
        });
        // Update with formatted address
        if (data.results[0].formatted_address) {
          setLocationQuery(data.results[0].formatted_address);
        }
        setLocationError(null);
      } else if (data.status === "ZERO_RESULTS") {
        setLocationError(
          "Location not found. Try a different city or zipcode."
        );
        setUserLocation(null);
      } else {
        setLocationError(`Geocoding failed: ${data.status}`);
        setUserLocation(null);
      }
    } catch (err) {
      console.error("Geocoding error:", err);
      setLocationError("Failed to find location. Please try again.");
      setUserLocation(null);
    } finally {
      setIsGeocoding(false);
    }
  }, []);

  // Handle location input change with debounce
  const handleLocationChange = useCallback(
    (value: string) => {
      setLocationQuery(value);
      setLocationError(null);

      // Clear any pending geocode
      if (geocodeTimeoutRef.current) {
        clearTimeout(geocodeTimeoutRef.current);
      }

      // Clear location immediately if input is cleared
      if (!value.trim()) {
        setUserLocation(null);
        return;
      }

      // Debounce geocoding (500ms)
      geocodeTimeoutRef.current = setTimeout(() => {
        geocodeLocation(value);
      }, 500);
    },
    [geocodeLocation]
  );

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
            {isGeocoding ? (
              <Loader2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground animate-spin" />
            ) : (
              <MapPin
                className={cn(
                  "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2",
                  userLocation ? "text-primary" : "text-muted-foreground"
                )}
              />
            )}
            <Input
              id="venue-location"
              type="text"
              placeholder="Enter city, zipcode, or address"
              value={locationQuery}
              onChange={(e) => handleLocationChange(e.target.value)}
              className={cn("pl-10", userLocation && "border-primary/50")}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={userLocation ? clearLocation : getUserLocation}
            disabled={isGettingLocation || isGeocoding}
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
        {locationError && (
          <p className="text-xs text-destructive">{locationError}</p>
        )}
        {userLocation && !locationError && (
          <p className="text-xs text-muted-foreground">
            Searching near: {locationQuery}
          </p>
        )}
      </div>

      {/* Filters Row 1 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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

        {/* Price Level Filter - Phase 7.1.2 */}
        <div className="space-y-1">
          <Label className="text-xs">Price Level</Label>
          <Select
            options={PRICE_LEVEL_FILTER_OPTIONS.map((opt) => ({
              value: opt.value,
              label: opt.label,
            }))}
            value={priceLevel}
            onValueChange={(value) => setPriceLevel(value as string)}
            placeholder="Any Price"
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

      {/* Filters Row 2 - Phase 7.1.2 */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Open Now Toggle */}
        <button
          type="button"
          onClick={() => setOpenNow(!openNow)}
          className={cn(
            "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
            openNow
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-background text-muted-foreground hover:bg-accent"
          )}
        >
          <Clock className="h-4 w-4" />
          <span>Open Now</span>
        </button>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Sort by:</Label>
          <Select
            options={VENUE_SORT_OPTIONS.map((opt) => ({
              value: opt.value,
              label: opt.label,
            }))}
            value={sortBy}
            onValueChange={(value) => setSortBy(value as VenueSortOption)}
            placeholder="Relevance"
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
        {!isLoading && filteredAndSortedResults.length > 0 && (
          <>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {filteredAndSortedResults.length === results.length
                  ? `${results.length} venue${
                      results.length !== 1 ? "s" : ""
                    } found`
                  : `${filteredAndSortedResults.length} of ${
                      results.length
                    } venue${results.length !== 1 ? "s" : ""} shown`}
              </p>
              <p className="text-md font-semibold text-muted-foreground/70 flex items-center gap-1">
                <Bookmark className="h-3 w-3" />
                Click the bookmark to save venues, then compare in the
                &quot;Saved&quot; tab
              </p>
            </div>
            <div className="space-y-3">
              {filteredAndSortedResults.map((venue) => (
                <VenueCard
                  key={venue.place_id}
                  venue={venue}
                  onClick={onVenueClick}
                  onSelect={onVenueSelect}
                  selected={selectedVenueId === venue.place_id}
                  isSaved={isSaved?.(venue.place_id)}
                  onToggleSave={onToggleSave}
                />
              ))}
            </div>
          </>
        )}

        {/* Empty State - No results from search */}
        {!isLoading && hasSearched && results.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 font-semibold text-foreground">
              No venues found
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your search query
            </p>
          </div>
        )}

        {/* Empty State - Filters removed all results */}
        {!isLoading &&
          hasSearched &&
          results.length > 0 &&
          filteredAndSortedResults.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 font-semibold text-foreground">
                No matching venues
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {results.length} venue{results.length !== 1 ? "s" : ""} found,
                but none match your filters
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
