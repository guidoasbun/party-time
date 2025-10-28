"use client";

import * as React from "react";
import { EventForm } from "./EventForm";
import { useEvent } from "@/hooks/api/useEvents";
import { transformApiDataForForm } from "@/lib/utils/form";
import { EventCreateFormData } from "@/lib/validations/event";
import { Loader2 } from "lucide-react";

interface EventEditFormProps {
  eventId: string;
  onSuccess?: (eventId: string) => void;
  onCancel?: () => void;
  className?: string;
}

export function EventEditForm({
  eventId,
  onSuccess,
  onCancel,
  className,
}: EventEditFormProps) {
  const { data: event, isLoading, error } = useEvent(eventId);

  // Transform API event data to form format
  const initialFormData = React.useMemo(():
    | Partial<EventCreateFormData>
    | undefined => {
    if (!event) return undefined;

    return transformApiDataForForm({
      name: event.name,
      description: event.description,
      type: event.type,
      status: event.status,
      start_date: event.start_date,
      end_date: event.end_date,
      location: event.location,
      venue_name: event.venue_name,
      venue_address: event.venue_address,
      venue_google_place_id: event.venue_google_place_id,
      max_guests: event.max_guests,
      budget_total: event.budget_total,
      is_public: event.is_public,
      // RSVP customization fields
      allow_plus_ones: event.allow_plus_ones,
      meal_options: event.meal_options,
      custom_questions: event.custom_questions,
      dietary_restrictions_enabled: event.dietary_restrictions_enabled,
      rsvp_deadline: event.rsvp_deadline,
    });
  }, [event]);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Loading event details...
          </p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error || !event) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-destructive mb-2">
            Failed to Load Event
          </h3>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "The event could not be found or you do not have permission to edit it."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <EventForm
        mode="edit"
        eventId={eventId}
        initialData={initialFormData}
        formId={`edit-${eventId}`}
        onSuccess={onSuccess}
        onCancel={onCancel}
        className={className}
      />
    </>
  );
}
