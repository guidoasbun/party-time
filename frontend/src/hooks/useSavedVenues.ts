/**
 * FR-8: The system shall provide a venue search interface.
 * Phase 7.1.2: Venue Search UI Enhancement
 * useSavedVenues Hook
 *
 * SSR-safe localStorage persistence for per-event saved venues (shortlist).
 * Follows the pattern from useViewPreferences.
 */
"use client";

import { useState, useCallback, useEffect } from "react";
import { SavedVenue, VenueSearchResult } from "@/types/venue.types";

const STORAGE_KEY_PREFIX = "party-time-saved-venues-";

interface UseSavedVenuesReturn {
  savedVenues: SavedVenue[];
  saveVenue: (venue: VenueSearchResult) => void;
  unsaveVenue: (placeId: string) => void;
  isSaved: (placeId: string) => boolean;
  clearAll: () => void;
  isLoading: boolean;
}

/**
 * Load saved venues from localStorage (SSR-safe)
 */
function loadFromStorage(eventId: string): SavedVenue[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${eventId}`);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    // Validate structure
    return parsed.filter(
      (item): item is SavedVenue =>
        typeof item === "object" &&
        typeof item.placeId === "string" &&
        typeof item.name === "string" &&
        typeof item.address === "string" &&
        typeof item.savedAt === "string"
    );
  } catch (error) {
    console.warn("Failed to load saved venues from localStorage:", error);
    return [];
  }
}

/**
 * Save venues to localStorage (SSR-safe)
 */
function saveToStorage(eventId: string, venues: SavedVenue[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${eventId}`, JSON.stringify(venues));
  } catch (error) {
    console.warn("Failed to save venues to localStorage:", error);
  }
}

/**
 * Hook for managing saved/shortlisted venues per event
 */
export function useSavedVenues(eventId: string): UseSavedVenuesReturn {
  const [savedVenues, setSavedVenues] = useState<SavedVenue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    const loaded = loadFromStorage(eventId);
    setSavedVenues(loaded);
    setIsLoading(false);
  }, [eventId]);

  // Save venue to shortlist
  const saveVenue = useCallback(
    (venue: VenueSearchResult) => {
      setSavedVenues((prev) => {
        // Don't add duplicates
        if (prev.some((v) => v.placeId === venue.place_id)) {
          return prev;
        }

        const newVenue: SavedVenue = {
          placeId: venue.place_id,
          name: venue.name,
          address: venue.address,
          photoUrl: venue.photo_url,
          rating: venue.rating,
          priceLevel: venue.price_level,
          savedAt: new Date().toISOString(),
        };

        const updated = [...prev, newVenue];
        saveToStorage(eventId, updated);
        return updated;
      });
    },
    [eventId]
  );

  // Remove venue from shortlist
  const unsaveVenue = useCallback(
    (placeId: string) => {
      setSavedVenues((prev) => {
        const updated = prev.filter((v) => v.placeId !== placeId);
        saveToStorage(eventId, updated);
        return updated;
      });
    },
    [eventId]
  );

  // Check if venue is saved
  const isSaved = useCallback(
    (placeId: string) => {
      return savedVenues.some((v) => v.placeId === placeId);
    },
    [savedVenues]
  );

  // Clear all saved venues
  const clearAll = useCallback(() => {
    setSavedVenues([]);
    saveToStorage(eventId, []);
  }, [eventId]);

  return {
    savedVenues,
    saveVenue,
    unsaveVenue,
    isSaved,
    clearAll,
    isLoading,
  };
}
