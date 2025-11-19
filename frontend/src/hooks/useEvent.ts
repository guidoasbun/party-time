/**
 * FR-21: The system shall provide an interactive seating chart interface.
 * Phase 6.2.5: Seating Chart Polish & Integration
 */

import { useQuery } from "@tanstack/react-query";
import { eventsService } from "@/lib/api/services/events.service";
import type { Event } from "@/types/event.types";

interface UseEventOptions {
  enabled?: boolean;
}

export function useEvent(eventId: string, options?: UseEventOptions) {
  const {
    data: event,
    isLoading,
    error,
    refetch,
  } = useQuery<Event, Error>({
    queryKey: ["event", eventId],
    queryFn: () => eventsService.getEvent(eventId),
    enabled: options?.enabled !== false && !!eventId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  return {
    event,
    isLoading,
    error,
    refetch,
  };
}
