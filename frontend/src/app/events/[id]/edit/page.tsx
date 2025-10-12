"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { EventEditForm } from "@/components/events/EventEditForm";
import { EventDetailHeader } from "@/components/events/EventDetailHeader";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { useEvent } from "@/hooks/api/useEvents";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  // Fetch event data for the header
  const {
    data: event,
    isLoading: isEventLoading,
    error: eventError,
  } = useEvent(eventId);

  const handleSuccess = React.useCallback(
    (id: string) => {
      // Navigate to the event detail page after successful update
      router.push(`/events/${id}`);
    },
    [router]
  );

  const handleCancel = React.useCallback(() => {
    // Navigate back to the event detail page without saving
    router.push(`/events/${eventId}`);
  }, [router, eventId]);

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Navigation */}
      <div className="mb-6">
        <Breadcrumb className="mb-4" />
      </div>

      {/* Event Details Header */}
      {isEventLoading ? (
        <div className="mb-8 bg-card rounded-lg border border-border shadow-sm p-6">
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Loading event details...
              </p>
            </div>
          </div>
        </div>
      ) : eventError ? (
        <div className="mb-8 bg-card rounded-lg border border-destructive shadow-sm p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-destructive mb-2">
              Failed to Load Event
            </h3>
            <p className="text-sm text-muted-foreground">
              {eventError instanceof Error
                ? eventError.message
                : "The event could not be found."}
            </p>
          </div>
        </div>
      ) : event ? (
        <>
          <EventDetailHeader event={event} className="mb-8" />
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Edit Event</h1>
            <p className="text-muted-foreground mt-2">
              Update your event details and settings
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/events/${eventId}`)}
            className="-ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Event
          </Button>
        </>
      ) : null}

      {/* Edit Form */}
      <EventEditForm
        eventId={eventId}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}
