/**
 * FR-8: The system shall provide a venue search interface.
 * Phase 7.1.1: Google Places API Integration
 * useEventVenues Hook (Phase 7.1.1: Google Places API Integration)
 *
 * React Query hook for event venue CRUD operations:
 * - List venues for an event
 * - Add/Update/Delete venues
 * - Reorder venues
 * - Optimistic updates
 */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { venueService } from "@/lib/api/services/venue.service";
import {
  EventVenue,
  EventVenueCreateRequest,
  EventVenueUpdateRequest,
} from "@/types/venue.types";
import { useToast } from "@/hooks/useToast";

// Query keys for event venues
export const eventVenueQueryKeys = {
  all: ["eventVenues"] as const,
  list: (eventId: string) =>
    [...eventVenueQueryKeys.all, "list", eventId] as const,
  detail: (eventId: string, venueId: string) =>
    [...eventVenueQueryKeys.all, "detail", eventId, venueId] as const,
};

interface UseEventVenuesOptions {
  enabled?: boolean;
}

/**
 * Hook for listing event venues
 */
export function useEventVenues(
  eventId: string | null,
  options: UseEventVenuesOptions = {}
) {
  const { enabled = true } = options;

  return useQuery<EventVenue[], Error>({
    queryKey: eventId
      ? eventVenueQueryKeys.list(eventId)
      : ["eventVenues", "list", null],
    queryFn: async () => {
      if (!eventId) {
        return [];
      }
      const response = await venueService.getEventVenues(eventId);
      return response.venues;
    },
    enabled: enabled && !!eventId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook for adding a venue to an event
 */
export function useAddEventVenue(eventId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<EventVenue, Error, EventVenueCreateRequest>({
    mutationFn: (data) => venueService.addVenueToEvent(eventId, data),
    onSuccess: (newVenue) => {
      // Invalidate and refetch the venues list
      queryClient.invalidateQueries({
        queryKey: eventVenueQueryKeys.list(eventId),
      });
      toast({
        title: "Venue Added",
        description: `${newVenue.name} has been added to your event.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add venue",
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook for updating an event venue
 */
interface MutationContext {
  previousVenues: EventVenue[] | undefined;
}

export function useUpdateEventVenue(eventId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    EventVenue,
    Error,
    { venueId: string; data: EventVenueUpdateRequest },
    MutationContext
  >({
    mutationFn: ({ venueId, data }) =>
      venueService.updateEventVenue(eventId, venueId, data),
    onMutate: async ({ venueId, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: eventVenueQueryKeys.list(eventId),
      });

      // Snapshot the previous value
      const previousVenues = queryClient.getQueryData<EventVenue[]>(
        eventVenueQueryKeys.list(eventId)
      );

      // Optimistically update
      if (previousVenues) {
        queryClient.setQueryData<EventVenue[]>(
          eventVenueQueryKeys.list(eventId),
          previousVenues.map((venue) =>
            venue.id === venueId ? { ...venue, ...data } : venue
          )
        );
      }

      return { previousVenues };
    },
    onError: (error, _, context) => {
      // Roll back on error
      if (context?.previousVenues) {
        queryClient.setQueryData(
          eventVenueQueryKeys.list(eventId),
          context.previousVenues
        );
      }
      toast({
        title: "Error",
        description: error.message || "Failed to update venue",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({
        queryKey: eventVenueQueryKeys.list(eventId),
      });
    },
    onSuccess: () => {
      toast({
        title: "Venue Updated",
        description: "Venue details have been updated.",
      });
    },
  });
}

/**
 * Hook for deleting an event venue
 */
export function useDeleteEventVenue(eventId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<void, Error, string, MutationContext>({
    mutationFn: (venueId) =>
      venueService.removeVenueFromEvent(eventId, venueId),
    onMutate: async (venueId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: eventVenueQueryKeys.list(eventId),
      });

      // Snapshot the previous value
      const previousVenues = queryClient.getQueryData<EventVenue[]>(
        eventVenueQueryKeys.list(eventId)
      );

      // Optimistically remove
      if (previousVenues) {
        queryClient.setQueryData<EventVenue[]>(
          eventVenueQueryKeys.list(eventId),
          previousVenues.filter((venue) => venue.id !== venueId)
        );
      }

      return { previousVenues };
    },
    onError: (error, _, context) => {
      // Roll back on error
      if (context?.previousVenues) {
        queryClient.setQueryData(
          eventVenueQueryKeys.list(eventId),
          context.previousVenues
        );
      }
      toast({
        title: "Error",
        description: error.message || "Failed to remove venue",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({
        queryKey: eventVenueQueryKeys.list(eventId),
      });
    },
    onSuccess: () => {
      toast({
        title: "Venue Removed",
        description: "The venue has been removed from your event.",
      });
    },
  });
}

/**
 * Hook for reordering event venues
 */
export function useReorderEventVenues(eventId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<EventVenue[], Error, string[], MutationContext>({
    mutationFn: async (venueIds) => {
      const response = await venueService.reorderEventVenues(eventId, venueIds);
      return response.venues;
    },
    onMutate: async (venueIds) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: eventVenueQueryKeys.list(eventId),
      });

      // Snapshot the previous value
      const previousVenues = queryClient.getQueryData<EventVenue[]>(
        eventVenueQueryKeys.list(eventId)
      );

      // Optimistically reorder
      if (previousVenues) {
        const venueMap = new Map(previousVenues.map((v) => [v.id, v]));
        const reorderedVenues = venueIds
          .map((id, index) => {
            const venue = venueMap.get(id);
            if (venue) {
              return { ...venue, display_order: index };
            }
            return null;
          })
          .filter((v): v is EventVenue => v !== null);

        queryClient.setQueryData<EventVenue[]>(
          eventVenueQueryKeys.list(eventId),
          reorderedVenues
        );
      }

      return { previousVenues };
    },
    onError: (error, _, context) => {
      // Roll back on error
      if (context?.previousVenues) {
        queryClient.setQueryData(
          eventVenueQueryKeys.list(eventId),
          context.previousVenues
        );
      }
      toast({
        title: "Error",
        description: error.message || "Failed to reorder venues",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({
        queryKey: eventVenueQueryKeys.list(eventId),
      });
    },
  });
}
