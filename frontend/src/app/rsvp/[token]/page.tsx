/**
 * FR-6: The system shall display an RSVP submission page 5.1.2
 * Public RSVP page - no authentication required
 */

"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle, Calendar, Loader2, MapPin } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { RSVPForm } from "@/components/rsvp/RSVPForm";
import { RSVPConfirmation } from "@/components/rsvp/RSVPConfirmation";
import { RSVPHeader } from "@/components/rsvp/RSVPHeader";
import {
  getRSVPEventDetails,
  submitRSVPResponse,
  isRateLimitError,
  getRateLimitRetryAfter,
} from "@/lib/api/services/rsvp.service";
import type {
  RSVPEventDetailsResponse,
  RSVPSubmissionResponse,
} from "@/types/rsvp.types";
import type { RSVPFormData } from "@/lib/validations/rsvp";
import { RsvpStatus } from "@/types/guest.types";

type PageState =
  | "loading"
  | "form"
  | "submitting"
  | "confirmation"
  | "error"
  | "expired"
  | "rate-limited";

export default function RSVPPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [pageState, setPageState] = React.useState<PageState>("loading");
  const [eventDetails, setEventDetails] =
    React.useState<RSVPEventDetailsResponse | null>(null);
  const [submissionResponse, setSubmissionResponse] =
    React.useState<RSVPSubmissionResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [retryAfter, setRetryAfter] = React.useState<number | null>(null);
  const [previousStatus, setPreviousStatus] = React.useState<RsvpStatus | null>(
    null
  );
  const [isUpdate, setIsUpdate] = React.useState(false);

  // Validate token and load event details on mount
  React.useEffect(() => {
    const loadEventDetails = async () => {
      if (!token) {
        setError("Invalid RSVP link");
        setPageState("error");
        return;
      }

      try {
        setPageState("loading");
        const details = await getRSVPEventDetails(token);
        setEventDetails(details);

        // Check if this is an update (guest has already responded)
        if (details.current_rsvp_status && details.current_rsvp_status !== "pending") {
          setIsUpdate(true);
          setPreviousStatus(details.current_rsvp_status);
        }

        setPageState("form");
      } catch (err) {
        console.error("Failed to load event details:", err);

        // Check for rate limiting
        if (isRateLimitError(err)) {
          const retrySeconds = getRateLimitRetryAfter(err);
          setRetryAfter(retrySeconds);
          setError(
            `Too many requests. Please try again ${
              retrySeconds ? `in ${retrySeconds} seconds` : "later"
            }.`
          );
          setPageState("rate-limited");
          return;
        }

        // Check for expired token (410 status)
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load event details";

        if (errorMessage.includes("expired")) {
          setError("This RSVP link has expired. Please contact the event host.");
          setPageState("expired");
        } else {
          setError(errorMessage);
          setPageState("error");
        }
      }
    };

    loadEventDetails();
  }, [token]);

  // Handle form submission
  const handleRSVPSubmit = async (data: RSVPFormData) => {
    try {
      setPageState("submitting");

      // Store the current status before submitting (for update detection)
      const currentStatus = eventDetails?.current_rsvp_status;
      if (
        currentStatus &&
        currentStatus !== "pending" &&
        currentStatus !== data.rsvp_status
      ) {
        setPreviousStatus(currentStatus);
        setIsUpdate(true);
      }

      // Submit RSVP response
      const response = await submitRSVPResponse(token, {
        rsvp_status: data.rsvp_status,
        plus_one_name: data.plus_one_name || undefined,
        dietary_restrictions: data.dietary_restrictions || undefined,
        meal_preference: data.meal_preference || undefined,
        notes: data.notes || undefined,
      });

      setSubmissionResponse(response);
      setPageState("confirmation");

      // Update event details with submitted data
      if (eventDetails) {
        setEventDetails({
          ...eventDetails,
          current_rsvp_status: response.rsvp_status,
          plus_one_name: data.plus_one_name || undefined,
          dietary_restrictions: data.dietary_restrictions || undefined,
          meal_preference: data.meal_preference || undefined,
        });
      }
    } catch (err) {
      console.error("RSVP submission failed:", err);

      // Check for rate limiting
      if (isRateLimitError(err)) {
        const retrySeconds = getRateLimitRetryAfter(err);
        setRetryAfter(retrySeconds);
        setError(
          `Too many requests. Please try again ${
            retrySeconds ? `in ${retrySeconds} seconds` : "later"
          }.`
        );
        setPageState("rate-limited");
        return;
      }

      const errorMessage =
        err instanceof Error ? err.message : "Failed to submit RSVP";
      setError(errorMessage);
      setPageState("error");
    }
  };

  // Handle retry after rate limit
  const handleRetry = () => {
    setError(null);
    setRetryAfter(null);
    router.refresh();
  };

  // Handle edit RSVP click
  const handleEditRSVP = () => {
    setPageState("form");
    setSubmissionResponse(null);
  };

  // Format event date for header
  const formatHeaderDate = () => {
    if (!eventDetails?.event.start_date) return null;

    try {
      const startDate = new Date(eventDetails.event.start_date);
      return format(startDate, "EEEE, MMMM d, yyyy");
    } catch (error) {
      return null;
    }
  };

  // Render loading state
  if (pageState === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-lg text-muted-foreground">
            Loading event details...
          </p>
        </div>
      </div>
    );
  }

  // Render error states
  if (pageState === "error" || pageState === "expired" || pageState === "rate-limited") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-card border border-border rounded-lg p-8 text-center space-y-4">
            <div
              className={cn(
                "w-16 h-16 rounded-full mx-auto flex items-center justify-center",
                pageState === "expired"
                  ? "bg-amber-100 dark:bg-amber-950/30"
                  : "bg-red-100 dark:bg-red-950/30"
              )}
            >
              <AlertCircle
                className={cn(
                  "w-8 h-8",
                  pageState === "expired"
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-red-600 dark:text-red-400"
                )}
              />
            </div>

            <h1 className="text-2xl font-bold">
              {pageState === "expired"
                ? "Link Expired"
                : pageState === "rate-limited"
                ? "Too Many Requests"
                : "Oops!"}
            </h1>

            <p className="text-muted-foreground">{error}</p>

            {pageState === "rate-limited" && retryAfter && (
              <div className="bg-muted/50 rounded-lg p-4 text-sm">
                <p>
                  Please wait <span className="font-semibold">{retryAfter}</span>{" "}
                  seconds before trying again.
                </p>
              </div>
            )}

            <div className="pt-4">
              {pageState === "rate-limited" ? (
                <Button onClick={handleRetry} variant="outline">
                  Retry Now
                </Button>
              ) : (
                <Button onClick={() => router.push("/")} variant="outline">
                  Go to Homepage
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render main content
  return (
    <div className="min-h-screen bg-background">
      {/* RSVP Header with Theme Toggle and Login */}
      <RSVPHeader />

      {/* Header with Event Details */}
      {eventDetails && (
        <header className="bg-card border-b border-border">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center space-y-3">
              <h1 className="text-3xl sm:text-4xl font-bold">
                {eventDetails.event.name}
              </h1>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-muted-foreground">
                {formatHeaderDate() && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{formatHeaderDate()}</span>
                  </div>
                )}

                {(eventDetails.event.location ||
                  eventDetails.event.venue_name) && (
                  <>
                    <span className="hidden sm:inline text-muted-foreground/50">
                      •
                    </span>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">
                        {eventDetails.event.venue_name ||
                          eventDetails.event.location}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {eventDetails.event.description && (
                <p className="text-muted-foreground max-w-2xl mx-auto mt-4">
                  {eventDetails.event.description}
                </p>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {pageState === "submitting" && (
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
            <p className="text-lg text-muted-foreground">
              Submitting your RSVP...
            </p>
          </div>
        )}

        {pageState === "form" && eventDetails && (
          <div className="bg-card border border-border rounded-lg p-6 sm:p-8">
            <RSVPForm
              eventDetails={eventDetails}
              token={token}
              onSubmit={handleRSVPSubmit}
              onCancel={() => router.push("/")}
            />
          </div>
        )}

        {pageState === "confirmation" && submissionResponse && eventDetails && (
          <RSVPConfirmation
            submission={submissionResponse}
            eventDetails={eventDetails}
            isUpdate={isUpdate}
            previousStatus={previousStatus || undefined}
            onEditClick={handleEditRSVP}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>
            Powered by{" "}
            <span className="font-semibold text-foreground">Party-Time</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
