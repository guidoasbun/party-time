/**
 * FR-8: The system shall provide a venue search interface.
 * Phase 7.1.1: Google Places API Integration
 * useVenueSearch Hook (Phase 7.1.1: Google Places API Integration)
 *
 * React Query hook for venue search operations:
 * - Search venues with debouncing
 * - Get venue details
 * - Caching and invalidation
 */
"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { venueService } from "@/lib/api/services/venue.service";
import {
  VenueSearchParams,
  VenueSearchResponse,
  VenueDetails,
} from "@/types/venue.types";

// Query keys for cache management
export const venueQueryKeys = {
  all: ["venues"] as const,
  search: (params: VenueSearchParams) =>
    [...venueQueryKeys.all, "search", params] as const,
  details: (placeId: string) =>
    [...venueQueryKeys.all, "details", placeId] as const,
  photos: (placeId: string) =>
    [...venueQueryKeys.all, "photos", placeId] as const,
};

interface UseVenueSearchOptions {
  enabled?: boolean;
  staleTime?: number;
}

/**
 * Hook for searching venues
 */
export function useVenueSearch(
  params: VenueSearchParams | null,
  options: UseVenueSearchOptions = {}
) {
  const { enabled = true, staleTime = 5 * 60 * 1000 } = options; // 5 minutes default

  return useQuery<VenueSearchResponse, Error>({
    queryKey: params
      ? venueQueryKeys.search(params)
      : ["venues", "search", null],
    queryFn: async () => {
      if (!params) {
        return { results: [], total_results: 0, query: "", cached: false };
      }
      return venueService.searchVenues(params);
    },
    enabled: enabled && !!params?.query && params.query.trim().length > 0,
    staleTime,
    gcTime: 30 * 60 * 1000, // 30 minutes cache time
  });
}

/**
 * Hook for getting venue details
 */
export function useVenueDetails(
  placeId: string | null,
  options: UseVenueSearchOptions = {}
) {
  const { enabled = true, staleTime = 10 * 60 * 1000 } = options; // 10 minutes default

  return useQuery<VenueDetails, Error>({
    queryKey: placeId
      ? venueQueryKeys.details(placeId)
      : ["venues", "details", null],
    queryFn: async () => {
      if (!placeId) {
        throw new Error("Place ID is required");
      }
      return venueService.getVenueDetails(placeId);
    },
    enabled: enabled && !!placeId,
    staleTime,
    gcTime: 60 * 60 * 1000, // 1 hour cache time
  });
}

/**
 * Hook for prefetching venue details
 */
export function usePrefetchVenueDetails() {
  const queryClient = useQueryClient();

  const prefetch = async (placeId: string) => {
    await queryClient.prefetchQuery({
      queryKey: venueQueryKeys.details(placeId),
      queryFn: () => venueService.getVenueDetails(placeId),
      staleTime: 10 * 60 * 1000,
    });
  };

  return { prefetch };
}

/**
 * Hook for invalidating venue search cache
 */
export function useInvalidateVenueSearch() {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await queryClient.invalidateQueries({
      queryKey: venueQueryKeys.all,
    });
  };

  return { invalidate };
}
