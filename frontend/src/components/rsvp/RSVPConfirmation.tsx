/**
 * FR-6: The system shall display an RSVP submission page 5.1.2
 * FR-6: RSVP Submission
 * Phase 5: RSVP & Email Systems -
 * 5.1.2: RSVP Frontend Portal
 *
 * RSVP confirmation page with celebration animation
 */

"use client";

import * as React from "react";
import {
  Check,
  Calendar,
  MapPin,
  Clock,
  Mail,
  Share2,
  Edit,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { RsvpStatus } from "@/types/guest.types";
import type {
  RSVPSubmissionResponse,
  RSVPEventDetailsResponse,
} from "@/types/rsvp.types";

interface RSVPConfirmationProps {
  submission: RSVPSubmissionResponse;
  eventDetails: RSVPEventDetailsResponse;
  isUpdate?: boolean;
  previousStatus?: RsvpStatus;
  onEditClick?: () => void;
  className?: string;
}

export function RSVPConfirmation({
  submission,
  eventDetails,
  isUpdate = false,
  previousStatus,
  onEditClick,
  className,
}: RSVPConfirmationProps) {
  const [showConfetti, setShowConfetti] = React.useState(true);

  React.useEffect(() => {
    // Hide confetti after animation completes
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Determine status color and message
  const getStatusInfo = () => {
    const baseInfo = {
      [RsvpStatus.ATTENDING]: {
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-50 dark:bg-green-950/30",
        borderColor: "border-green-200 dark:border-green-800",
        icon: <Check className="w-12 h-12" />,
        titleNew: "You're All Set!",
        titleUpdate: "RSVP Updated Successfully!",
        messageNew: "We're excited to celebrate with you!",
        messageUpdate: "Your attendance confirmation has been updated.",
      },
      [RsvpStatus.NOT_ATTENDING]: {
        color: "text-amber-600 dark:text-amber-400",
        bgColor: "bg-amber-50 dark:bg-amber-950/30",
        borderColor: "border-amber-200 dark:border-amber-800",
        icon: <Mail className="w-12 h-12" />,
        titleNew: "We'll Miss You!",
        titleUpdate: "RSVP Updated Successfully!",
        messageNew: "Thank you for letting us know. You'll be missed!",
        messageUpdate: "Your response has been updated. You'll be missed!",
      },
      [RsvpStatus.MAYBE]: {
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-50 dark:bg-blue-950/30",
        borderColor: "border-blue-200 dark:border-blue-800",
        icon: <Clock className="w-12 h-12" />,
        titleNew: "Response Received!",
        titleUpdate: "RSVP Updated Successfully!",
        messageNew: "Let us know when you can confirm!",
        messageUpdate: "Your tentative response has been updated.",
      },
      [RsvpStatus.PENDING]: {
        color: "text-gray-600 dark:text-gray-400",
        bgColor: "bg-gray-50 dark:bg-gray-950/30",
        borderColor: "border-gray-200 dark:border-gray-800",
        icon: <Check className="w-12 h-12" />,
        titleNew: "Thank You!",
        titleUpdate: "RSVP Updated Successfully!",
        messageNew: "Your response has been recorded.",
        messageUpdate: "Your response has been updated.",
      },
    };

    const info =
      baseInfo[submission.rsvp_status] || baseInfo[RsvpStatus.PENDING];

    return {
      ...info,
      title: isUpdate ? info.titleUpdate : info.titleNew,
      message: isUpdate ? info.messageUpdate : info.messageNew,
    };
  };

  const statusInfo = getStatusInfo();

  // Format event date
  const formatEventDate = () => {
    if (!eventDetails.event.start_date) return "Date TBD";

    try {
      const startDate = new Date(eventDetails.event.start_date);
      const endDate = eventDetails.event.end_date
        ? new Date(eventDetails.event.end_date)
        : null;

      if (endDate && endDate.getTime() !== startDate.getTime()) {
        return `${format(
          startDate,
          "EEEE, MMMM d, yyyy 'at' h:mm a"
        )} - ${format(endDate, "h:mm a")}`;
      }

      return format(startDate, "EEEE, MMMM d, yyyy 'at' h:mm a");
    } catch (error) {
      return "Date TBD";
    }
  };

  // Add to calendar functionality
  const handleAddToCalendar = () => {
    if (!eventDetails.event.start_date) return;

    try {
      const startDate = new Date(eventDetails.event.start_date);
      const endDate = eventDetails.event.end_date
        ? new Date(eventDetails.event.end_date)
        : new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours

      // Format dates for Google Calendar
      const formatCalendarDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      };

      const params = new URLSearchParams({
        action: "TEMPLATE",
        text: eventDetails.event.name,
        dates: `${formatCalendarDate(startDate)}/${formatCalendarDate(
          endDate
        )}`,
        details: eventDetails.event.description || "",
        location: eventDetails.event.location || "",
      });

      const calendarUrl = `https://calendar.google.com/calendar/render?${params.toString()}`;
      window.open(calendarUrl, "_blank");
    } catch (error) {
      console.error("Failed to add to calendar:", error);
    }
  };

  // Share event functionality
  const handleShare = async () => {
    const shareData = {
      title: eventDetails.event.name,
      text: `Join me at ${eventDetails.event.name}!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert("Event link copied to clipboard!");
      }
    } catch (error) {
      console.error("Failed to share:", error);
    }
  };

  return (
    <div className={cn("space-y-8 animate-bounceIn", className)}>
      {/* Confetti Effect (CSS-based) */}
      {showConfetti && submission.rsvp_status === RsvpStatus.ATTENDING && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-fadeOut"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-10px`,
                backgroundColor: [
                  "#3b82f6",
                  "#10b981",
                  "#f59e0b",
                  "#ef4444",
                  "#8b5cf6",
                ][Math.floor(Math.random() * 5)],
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
                transform: `translateY(${100 + Math.random() * 20}vh) rotate(${
                  Math.random() * 360
                }deg)`,
              }}
            />
          ))}
        </div>
      )}

      {/* Success Message */}
      <div
        className={cn(
          "text-center p-8 rounded-lg border-2",
          statusInfo.bgColor,
          statusInfo.borderColor
        )}
      >
        <div
          className={cn(
            "w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center",
            statusInfo.bgColor,
            statusInfo.color
          )}
        >
          {statusInfo.icon}
        </div>
        <h1 className="text-3xl font-bold mb-2">{statusInfo.title}</h1>
        <p className="text-lg text-muted-foreground mb-4">
          {statusInfo.message}
        </p>
        <p className="text-sm text-muted-foreground">
          Confirmation sent to{" "}
          <span className="font-medium">{eventDetails.guest.email}</span>
        </p>
      </div>

      {/* Event Details Summary */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold mb-4">Event Details</h2>

        <div className="space-y-3">
          {/* Event Name */}
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">{eventDetails.event.name}</p>
              <p className="text-sm text-muted-foreground">
                {eventDetails.event.type}
              </p>
            </div>
          </div>

          {/* Date & Time */}
          {eventDetails.event.start_date && (
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Date & Time</p>
                <p className="text-sm text-muted-foreground">
                  {formatEventDate()}
                </p>
              </div>
            </div>
          )}

          {/* Location */}
          {(eventDetails.event.location || eventDetails.event.venue_name) && (
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Location</p>
                {eventDetails.event.venue_name && (
                  <p className="text-sm font-medium">
                    {eventDetails.event.venue_name}
                  </p>
                )}
                {eventDetails.event.venue_address && (
                  <p className="text-sm text-muted-foreground">
                    {eventDetails.event.venue_address}
                  </p>
                )}
                {!eventDetails.event.venue_name &&
                  eventDetails.event.location && (
                    <p className="text-sm text-muted-foreground">
                      {eventDetails.event.location}
                    </p>
                  )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RSVP Details Summary */}
      <div className="bg-muted/50 rounded-lg p-6 space-y-3">
        <h3 className="font-semibold mb-3">Your RSVP Details</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Guest Name</p>
            <p className="font-medium">
              {eventDetails.guest.first_name} {eventDetails.guest.last_name}
            </p>
          </div>

          <div>
            <p className="text-muted-foreground">Status</p>
            <p className={cn("font-medium capitalize", statusInfo.color)}>
              {submission.rsvp_status.replace("_", " ")}
            </p>
          </div>

          {eventDetails.plus_one_name && (
            <div>
              <p className="text-muted-foreground">Plus-One</p>
              <p className="font-medium">{eventDetails.plus_one_name}</p>
            </div>
          )}

          {eventDetails.meal_preference && (
            <div>
              <p className="text-muted-foreground">Meal Preference</p>
              <p className="font-medium">{eventDetails.meal_preference}</p>
            </div>
          )}

          {eventDetails.dietary_restrictions && (
            <div className="sm:col-span-2">
              <p className="text-muted-foreground">Dietary Restrictions</p>
              <p className="font-medium">{eventDetails.dietary_restrictions}</p>
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground pt-2 border-t border-border">
          Submitted on{" "}
          {format(
            new Date(submission.submitted_at),
            "MMMM d, yyyy 'at' h:mm a"
          )}
        </p>
      </div>

      {/* Status Comparison for Updates */}
      {isUpdate &&
        previousStatus &&
        previousStatus !== submission.rsvp_status && (
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="font-semibold text-center mb-4">
              Your RSVP has been updated
            </h3>
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="text-center">
                <p className="text-muted-foreground mb-1">Previous:</p>
                <p className="font-medium capitalize">
                  {previousStatus.replace("_", " ")}
                </p>
              </div>
              <div className="text-2xl text-muted-foreground">→</div>
              <div className="text-center">
                <p className="text-muted-foreground mb-1">New:</p>
                <p className={cn("font-medium capitalize", statusInfo.color)}>
                  {submission.rsvp_status.replace("_", " ")}
                </p>
              </div>
            </div>
          </div>
        )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          onClick={handleAddToCalendar}
          variant="outline"
          className="gap-2"
        >
          <Calendar className="w-4 h-4" />
          Add to Calendar
        </Button>

        <Button onClick={handleShare} variant="outline" className="gap-2">
          <Share2 className="w-4 h-4" />
          Share Event
        </Button>

        <Button
          onClick={onEditClick || (() => window.location.reload())}
          variant="default"
          className="gap-2"
        >
          <Edit className="w-4 h-4" />
          Edit My RSVP
        </Button>
      </div>

      {/* Thank You Message */}
      {eventDetails.custom_message && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 text-center">
          <p className="text-sm font-medium text-primary mb-2">
            Message from {eventDetails.host_name}:
          </p>
          <p className="text-muted-foreground italic">
            &quot;{eventDetails.custom_message}&quot;
          </p>
        </div>
      )}

      {/* Footer Note */}
      <div className="text-center text-sm text-muted-foreground pt-4 border-t border-border">
        <p>
          Need to make changes? You can update your RSVP anytime using this
          link.
        </p>
        <p className="mt-2">
          Questions? Contact{" "}
          <span className="font-medium">{eventDetails.host_name}</span>
        </p>
      </div>
    </div>
  );
}
