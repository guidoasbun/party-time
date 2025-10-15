"use client";

/**
 * Guest List Page
 * Full-page guest management interface for event organizers
 */

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { GuestList } from "@/components/guests/GuestList";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { EventDetailHeader } from "@/components/events/EventDetailHeader";
import { useQuery } from "@tanstack/react-query";
import { guestsService } from "@/lib/api/services";
import { useEvent } from "@/hooks/api/useEvents";
import { GuestOverview } from "@/components/guests/GuestOverview";
import type { UUID, PaginatedResponse, Guest, Event } from "@/types";

export default function GuestsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.id as UUID;

  // Fetch event data using React Query (cached for 5 minutes)
  const {
    data: event,
    isLoading: isEventLoading,
    error: eventError,
    refetch: refetchEvent,
  } = useEvent(eventId);

  // Fetch guests using React Query
  const {
    data: guestsResponse,
    isLoading: isGuestsLoading,
    error: guestsError,
    refetch: refetchGuests,
  } = useQuery<PaginatedResponse<Guest>>({
    queryKey: ["guests", eventId],
    queryFn: () => guestsService.getGuests(eventId),
    enabled: !!eventId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const guests = guestsResponse?.items || [];
  const totalCount = guestsResponse?.total || 0;
  const isLoading = isEventLoading || isGuestsLoading;
  const error = eventError || guestsError;

  // Error state
  if (error && !isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="space-y-6">
            {/* Breadcrumb */}
            <Breadcrumb />

            {/* Error message */}
            <ErrorMessage
              title="Failed to load data"
              message={
                error instanceof Error
                  ? error.message
                  : "Unable to load event or guest list. Please try again."
              }
              onRetry={() => {
                void refetchEvent();
                void refetchGuests();
              }}
            />

            {/* Back button */}
            <div className="flex justify-center">
              <button
                onClick={() => router.push(`/events/${eventId}`)}
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                ← Back to Event Details
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="space-y-6">
          {/* Breadcrumb Navigation */}
          <Breadcrumb />

          {/* Event Detail Header */}
          {event && <EventDetailHeader event={event} />}

          {/* Page Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Guest Management
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your event guest list, RSVPs, and invitations
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/events/${eventId}`)}
                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                ← Back to Event
              </button>
            </div>
          </div>

          {/* Guest Overview Component */}
          <GuestOverview
            eventId={eventId}
            eventName={event?.name}
            guests={guests}
          />

          {/* Guest List Component */}
          <GuestList
            eventId={eventId}
            guests={guests}
            isLoading={isGuestsLoading}
            error={guestsError ? (guestsError as Error) : null}
            totalCount={totalCount}
            onRefresh={() => {
              void refetchGuests();
            }}
          />
        </div>
      </div>
    </div>
  );
}
