"use client";

/**
 * FR-6: The system shall display an RSVP submission page.
 * 5.1.3: RSVP Management Dashboard
 *
 * RSVPDashboard Component
 * Comprehensive RSVP management dashboard for event planners
 * Displays stats, chart, timeline, countdown, and reminder actions
 */

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { RSVPChart } from "@/components/guests/RSVPChart";
import { RSVPTimeline } from "./RSVPTimeline";
import { RSVPDeadlineCountdown } from "./RSVPDeadlineCountdown";
import { guestsService } from "@/lib/api/services";
import { Guest, UUID, RsvpStatus, RSVPTimelineItem } from "@/types";
import { cn } from "@/lib/utils";
import {
  Users,
  UserCheck,
  Clock,
  UserX,
  Send,
  Download,
  TrendingUp,
} from "lucide-react";

// Simple toast replacement (can be replaced with actual toast library later)
const toast = {
  success: (title: string, options?: { description?: string }) => {
    console.log("[SUCCESS]", title, options?.description || "");
    alert(
      `✓ ${title}${options?.description ? "\n" + options.description : ""}`
    );
  },
  error: (title: string, options?: { description?: string }) => {
    console.error("[ERROR]", title, options?.description || "");
    alert(
      `✗ ${title}${options?.description ? "\n" + options.description : ""}`
    );
  },
  info: (message: string) => {
    console.info("[INFO]", message);
    alert(`ℹ ${message}`);
  },
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ): Promise<T> => {
    console.log("[LOADING]", messages.loading);
    return promise.then(
      (result) => {
        console.log("[SUCCESS]", messages.success);
        alert(`✓ ${messages.success}`);
        return result;
      },
      (error) => {
        console.error("[ERROR]", messages.error, error);
        alert(`✗ ${messages.error}`);
        throw error;
      }
    );
  },
};

interface RSVPDashboardProps {
  eventId: UUID;
  eventName?: string;
  guests: Guest[];
  rsvpDeadline?: string | null;
  className?: string;
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: "blue" | "green" | "amber" | "red" | "purple";
  subtitle?: string;
  className?: string;
}

function StatCard({
  title,
  value,
  icon,
  color,
  subtitle,
  className,
}: StatCardProps) {
  const colorClasses = {
    blue: {
      bg: "bg-blue-100 dark:bg-blue-900/30",
      icon: "text-blue-700 dark:text-blue-400",
      text: "text-blue-700 dark:text-blue-400",
    },
    green: {
      bg: "bg-green-100 dark:bg-green-900/30",
      icon: "text-green-700 dark:text-green-400",
      text: "text-green-700 dark:text-green-400",
    },
    amber: {
      bg: "bg-amber-100 dark:bg-amber-900/30",
      icon: "text-amber-700 dark:text-amber-400",
      text: "text-amber-700 dark:text-amber-400",
    },
    red: {
      bg: "bg-red-100 dark:bg-red-900/30",
      icon: "text-red-700 dark:text-red-400",
      text: "text-red-700 dark:text-red-400",
    },
    purple: {
      bg: "bg-purple-100 dark:bg-purple-900/30",
      icon: "text-purple-700 dark:text-purple-400",
      text: "text-purple-700 dark:text-purple-400",
    },
  };

  const colors = colorClasses[color];

  return (
    <Card className={cn("transition-all hover:shadow-md", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {title}
            </p>
            <p className={cn("text-3xl font-bold", colors.text)}>{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div
            className={cn(
              "h-12 w-12 rounded-full flex items-center justify-center",
              colors.bg
            )}
          >
            <div className={colors.icon}>{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function RSVPDashboard({
  eventId,
  eventName,
  guests,
  rsvpDeadline,
  className,
}: RSVPDashboardProps) {
  const queryClient = useQueryClient();
  const [isSendingReminders, setIsSendingReminders] = useState(false);

  // Fetch RSVP timeline
  const {
    data: timelineItems,
    isLoading: isTimelineLoading,
    error: timelineError,
  } = useQuery<RSVPTimelineItem[]>({
    queryKey: ["rsvp-timeline", eventId],
    queryFn: () => guestsService.getRSVPTimeline(eventId, 20),
    staleTime: 30 * 1000, // 30 seconds - more frequent updates for live tracking
    refetchInterval: 60 * 1000, // Auto-refresh every minute
  });

  // Calculate statistics
  const totalGuests = guests.length;
  const attendingGuests = guests.filter(
    (g) => g.rsvp_status === RsvpStatus.ATTENDING
  ).length;
  const notAttendingGuests = guests.filter(
    (g) => g.rsvp_status === RsvpStatus.NOT_ATTENDING
  ).length;
  const maybeGuests = guests.filter(
    (g) => g.rsvp_status === RsvpStatus.MAYBE
  ).length;
  const pendingGuests = guests.filter(
    (g) => g.rsvp_status === RsvpStatus.PENDING
  ).length;

  const responsesReceived = attendingGuests + notAttendingGuests + maybeGuests;
  const responseRate =
    totalGuests > 0 ? Math.round((responsesReceived / totalGuests) * 100) : 0;

  // Send reminders mutation
  const sendRemindersMutation = useMutation({
    mutationFn: async () => {
      const pendingGuestIds = guests
        .filter((g) => g.rsvp_status === RsvpStatus.PENDING)
        .map((g) => g.id);

      if (pendingGuestIds.length === 0) {
        throw new Error("No pending guests to send reminders to");
      }

      return guestsService.sendReminders(eventId, pendingGuestIds);
    },
    onSuccess: (data) => {
      toast.success(
        `Successfully sent ${data.sent_count} reminder${
          data.sent_count === 1 ? "" : "s"
        }`,
        {
          description:
            data.failed_count > 0
              ? `${data.failed_count} reminder${
                  data.failed_count === 1 ? "" : "s"
                } failed to send`
              : undefined,
        }
      );
      // Invalidate guests query to refresh data
      queryClient.invalidateQueries({ queryKey: ["guests", eventId] });
    },
    onError: (error) => {
      toast.error("Failed to send reminders", {
        description:
          error instanceof Error ? error.message : "An error occurred",
      });
    },
    onSettled: () => {
      setIsSendingReminders(false);
    },
  });

  const handleSendReminders = async () => {
    if (pendingGuests === 0) {
      toast.info("No pending guests to send reminders to");
      return;
    }

    setIsSendingReminders(true);
    sendRemindersMutation.mutate();
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Invited"
          value={totalGuests}
          icon={<Users className="h-6 w-6" />}
          color="blue"
          subtitle="Guest list size"
        />

        <StatCard
          title="Confirmed"
          value={attendingGuests}
          icon={<UserCheck className="h-6 w-6" />}
          color="green"
          subtitle={`${
            totalGuests > 0
              ? Math.round((attendingGuests / totalGuests) * 100)
              : 0
          }% of total`}
        />

        <StatCard
          title="Pending"
          value={pendingGuests}
          icon={<Clock className="h-6 w-6" />}
          color="amber"
          subtitle="Awaiting response"
        />

        <StatCard
          title="Response Rate"
          value={`${responseRate}%`}
          icon={<TrendingUp className="h-6 w-6" />}
          color="purple"
          subtitle={`${responsesReceived} of ${totalGuests}`}
        />
      </div>

      {/* RSVP Deadline Countdown */}
      <RSVPDeadlineCountdown deadline={rsvpDeadline} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RSVP Breakdown Chart */}
        <Card>
          <CardHeader>
            <CardTitle>RSVP Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <RSVPChart
              attending={attendingGuests}
              notAttending={notAttendingGuests}
              maybe={maybeGuests}
              pending={pendingGuests}
            />
          </CardContent>
        </Card>

        {/* Recent Responses Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[400px] overflow-y-auto">
              <RSVPTimeline
                items={timelineItems || []}
                isLoading={isTimelineLoading}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>RSVP Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Send Reminders Button */}
            <button
              onClick={handleSendReminders}
              disabled={pendingGuests === 0 || isSendingReminders}
              className={cn(
                "flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium",
                "transition-colors",
                pendingGuests > 0 && !isSendingReminders
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              <Send className="h-4 w-4" />
              <span>
                {isSendingReminders
                  ? "Sending..."
                  : `Send Reminders to ${pendingGuests} Pending Guest${
                      pendingGuests === 1 ? "" : "s"
                    }`}
              </span>
            </button>

            {/* Export Button */}
            <button
              onClick={() => {
                toast.promise(
                  guestsService.exportGuests(eventId, "csv", {
                    include_fields: [
                      "first_name",
                      "last_name",
                      "email",
                      "rsvp_status",
                    ],
                  }),
                  {
                    loading: "Exporting guest list...",
                    success: "Guest list exported successfully",
                    error: "Failed to export guest list",
                  }
                );
              }}
              className={cn(
                "flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium",
                "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                "transition-colors"
              )}
            >
              <Download className="h-4 w-4" />
              <span>Export RSVP List</span>
            </button>
          </div>

          {/* Helper text */}
          <p className="text-sm text-muted-foreground mt-4">
            Send automated reminder emails to guests who haven&apos;t responded
            yet, or export the complete RSVP list with current status.
          </p>
        </CardContent>
      </Card>

      {/* Error display for timeline */}
      {timelineError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">
            Failed to load RSVP timeline
          </p>
        </div>
      )}
    </div>
  );
}
