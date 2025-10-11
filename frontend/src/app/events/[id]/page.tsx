"use client";

/**
 * Event detail page
 * Displays comprehensive event information with edit, delete, and share actions
 */

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { EventDetailHeader } from "@/components/events/EventDetailHeader";
import { EventActionButtons } from "@/components/events/EventActionButtons";
import { EventDetailSkeleton } from "@/components/events/EventDetailSkeleton";
import { EventTabs } from "@/components/events/EventTabs";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { useEvent } from "@/hooks/api/useEvents";
import type { UUID } from "@/types";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.id as UUID;

  const { data: event, isLoading, error, refetch } = useEvent(eventId);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <EventDetailSkeleton />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !event) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="space-y-6">
            {/* Breadcrumb */}
            <Breadcrumb />

            {/* Error message */}
            <ErrorMessage
              title="Failed to load event"
              message={
                error?.message ||
                "The event could not be found or you do not have permission to view it."
              }
              onRetry={
                error
                  ? () => {
                      void refetch();
                    }
                  : undefined
              }
            />

            {/* Back button */}
            <div className="flex justify-center">
              <button
                onClick={() => router.push("/dashboard")}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
              >
                ← Back to Dashboard
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
          {/* Event Header */}
          <EventDetailHeader event={event} />

          {/* Action Buttons Section */}
          <div className="flex justify-end">
            <EventActionButtons
              eventId={event.id}
              eventName={event.name}
              onDeleteSuccess={() => {
                router.push("/dashboard");
              }}
              onDuplicateSuccess={(newEventId) => {
                router.push(`/events/${newEventId}`);
              }}
            />
          </div>

          {/* Tabbed Interface - Phase 3.2.2 */}
          <EventTabs event={event} />
        </div>
      </div>
    </div>
  );
}
