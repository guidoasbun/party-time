/**
 * FR-8: The system shall provide a venue search interface.
 * Phase 7.1.3: Venue Comparison Tool
 * useVenueComparison Hook
 *
 * State management for venue comparison selection.
 * Manages a list of venues to compare (max 4).
 * Local state only - no persistence needed.
 */
"use client";

import { useState, useCallback, useMemo } from "react";
import {
  CompareVenue,
  UseVenueComparisonReturn,
  MAX_COMPARE_VENUES,
} from "@/types/venue.types";

/**
 * Hook for managing venue comparison selection state
 */
export function useVenueComparison(): UseVenueComparisonReturn {
  const [compareList, setCompareList] = useState<CompareVenue[]>([]);

  // Add venue to comparison list
  const addToCompare = useCallback((venue: CompareVenue) => {
    setCompareList((prev) => {
      // Don't add duplicates
      if (prev.some((v) => v.placeId === venue.placeId)) {
        return prev;
      }
      // Don't exceed max
      if (prev.length >= MAX_COMPARE_VENUES) {
        return prev;
      }
      return [...prev, venue];
    });
  }, []);

  // Remove venue from comparison list
  const removeFromCompare = useCallback((placeId: string) => {
    setCompareList((prev) => prev.filter((v) => v.placeId !== placeId));
  }, []);

  // Clear all venues from comparison
  const clearCompare = useCallback(() => {
    setCompareList([]);
  }, []);

  // Check if venue is in comparison list
  const isInCompare = useCallback(
    (placeId: string) => {
      return compareList.some((v) => v.placeId === placeId);
    },
    [compareList]
  );

  // Can add more venues?
  const canAddMore = useMemo(
    () => compareList.length < MAX_COMPARE_VENUES,
    [compareList.length]
  );

  // Current count
  const compareCount = compareList.length;

  return {
    compareList,
    addToCompare,
    removeFromCompare,
    clearCompare,
    isInCompare,
    canAddMore,
    compareCount,
  };
}
