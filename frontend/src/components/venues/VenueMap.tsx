/**
 * FR-8: The system shall provide a venue search interface.
 * Phase 7.1.1: Google Places API Integration
 * VenueMap Component (Phase 7.1.1: Google Places API Integration)
 *
 * Interactive Google Map for displaying venue locations:
 * - Single or multiple venue markers
 * - Theme-aware styling (light/dark mode)
 * - Info windows with venue details
 * - Click-to-select functionality
 * - Responsive sizing
 */
"use client";

import * as React from "react";
import { useState, useCallback, useMemo } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import { MAP_STYLES } from "@/types/venue.types";
import { Loader2, MapPin } from "lucide-react";

// Map container styling
const containerStyle = {
  width: "100%",
  height: "100%",
};

// Default center (US center - will be overridden by venues or user location)
const defaultCenter = {
  lat: 39.8283,
  lng: -98.5795,
};

// Map options for clean display
const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  gestureHandling: "cooperative",
};

interface VenueMarker {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  rating?: number;
}

interface VenueMapProps {
  venues: VenueMarker[];
  selectedVenueId?: string;
  onVenueSelect?: (venueId: string) => void;
  height?: string;
  zoom?: number;
  showInfoWindows?: boolean;
  className?: string;
}

// Libraries to load
const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = [
  "places",
];

export function VenueMap({
  venues,
  selectedVenueId,
  onVenueSelect,
  height = "400px",
  zoom = 12,
  showInfoWindows = true,
  className,
}: VenueMapProps) {
  const { resolvedTheme } = useTheme();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);

  // Load Google Maps script
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  // Calculate center from venues
  const center = useMemo(() => {
    if (venues.length === 0) return defaultCenter;

    if (venues.length === 1) {
      return {
        lat: venues[0].latitude,
        lng: venues[0].longitude,
      };
    }

    // Calculate average center for multiple venues
    const avgLat =
      venues.reduce((sum, v) => sum + v.latitude, 0) / venues.length;
    const avgLng =
      venues.reduce((sum, v) => sum + v.longitude, 0) / venues.length;
    return { lat: avgLat, lng: avgLng };
  }, [venues]);

  // Get theme-appropriate map styles (deep clone to make mutable for Google Maps)
  const mapStyle = useMemo((): google.maps.MapTypeStyle[] => {
    const theme = resolvedTheme === "dark" ? "dark" : "light";
    // Deep clone to remove readonly constraints
    return JSON.parse(JSON.stringify(MAP_STYLES[theme]));
  }, [resolvedTheme]);

  // Handle map load
  const onLoad = useCallback(
    (mapInstance: google.maps.Map) => {
      setMap(mapInstance);

      // Fit bounds if multiple venues
      if (venues.length > 1) {
        const bounds = new google.maps.LatLngBounds();
        venues.forEach((venue) => {
          bounds.extend({ lat: venue.latitude, lng: venue.longitude });
        });
        mapInstance.fitBounds(bounds, 50);
      }
    },
    [venues]
  );

  // Handle map unmount
  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Handle marker click
  const handleMarkerClick = (venueId: string) => {
    if (showInfoWindows) {
      setActiveMarkerId(activeMarkerId === venueId ? null : venueId);
    }
    onVenueSelect?.(venueId);
  };

  // Handle info window close
  const handleInfoWindowClose = () => {
    setActiveMarkerId(null);
  };

  // Loading state
  if (!isLoaded) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-lg bg-muted",
          className
        )}
        style={{ height }}
      >
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (loadError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-lg bg-muted",
          className
        )}
        style={{ height }}
      >
        <div className="text-center">
          <MapPin className="mx-auto h-8 w-8 text-destructive" />
          <p className="mt-2 text-sm text-destructive">
            Failed to load map. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  // Empty state
  if (venues.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-lg bg-muted",
          className
        )}
        style={{ height }}
      >
        <div className="text-center">
          <MapPin className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            No venues to display
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("overflow-hidden rounded-lg", className)}
      style={{ height }}
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={venues.length === 1 ? zoom : undefined}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          ...mapOptions,
          styles: mapStyle,
        }}
      >
        {venues.map((venue) => (
          <Marker
            key={venue.id}
            position={{ lat: venue.latitude, lng: venue.longitude }}
            title={venue.name}
            onClick={() => handleMarkerClick(venue.id)}
            animation={
              selectedVenueId === venue.id
                ? google.maps.Animation.BOUNCE
                : undefined
            }
            icon={
              selectedVenueId === venue.id
                ? {
                    url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                  }
                : undefined
            }
          >
            {/* Info Window */}
            {showInfoWindows && activeMarkerId === venue.id && (
              <InfoWindow
                position={{ lat: venue.latitude, lng: venue.longitude }}
                onCloseClick={handleInfoWindowClose}
              >
                <div className="max-w-[200px] p-1">
                  <h3 className="font-semibold text-gray-900">{venue.name}</h3>
                  {venue.address && (
                    <p className="mt-1 text-xs text-gray-600">
                      {venue.address}
                    </p>
                  )}
                  {venue.rating && (
                    <p className="mt-1 text-xs text-gray-600">
                      Rating: {venue.rating.toFixed(1)} / 5
                    </p>
                  )}
                  {onVenueSelect && (
                    <button
                      onClick={() => onVenueSelect(venue.id)}
                      className="mt-2 text-xs font-medium text-blue-600 hover:underline"
                    >
                      View Details
                    </button>
                  )}
                </div>
              </InfoWindow>
            )}
          </Marker>
        ))}
      </GoogleMap>
    </div>
  );
}

// Export a loading placeholder for SSR
export function VenueMapSkeleton({
  height = "400px",
  className,
}: {
  height?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex animate-pulse items-center justify-center rounded-lg bg-muted",
        className
      )}
      style={{ height }}
    >
      <MapPin className="h-12 w-12 text-muted-foreground/50" />
    </div>
  );
}
