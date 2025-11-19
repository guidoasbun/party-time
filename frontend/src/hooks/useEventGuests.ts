/**
 * FR-21: The system shall provide an interactive seating chart interface.
 * Phase 6.2.5: Seating Chart Polish & Integration
 */

import { useQuery } from "@tanstack/react-query";
import { guestsService } from "@/lib/api/services/guests.service";
import type { Guest } from "@/types/guest.types";

interface UseEventGuestsOptions {
  enabled?: boolean;
}

export function useEventGuests(
  eventId: string,
  options?: UseEventGuestsOptions
) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["event-guests", eventId],
    queryFn: () => guestsService.getGuests(eventId),
    enabled: options?.enabled !== false && !!eventId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  // Extract the items from the paginated response
  const guests = data?.items || [];

  return {
    guests,
    isLoading,
    error,
    refetch,
  };
}
