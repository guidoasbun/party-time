"use client";

/**
 * FR-6: The system shall display an RSVP submission page.
 * 5.1.3: RSVP Management Dashboard
 *
 * RSVPTimeline Component
 * Displays recent RSVP responses in chronological order
 */

import React from "react";
import { RSVPTimelineItem, RsvpStatus } from "@/types";
import { cn } from "@/lib/utils";
import { Clock, UserCheck, UserX, HelpCircle, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface RSVPTimelineProps {
  items: RSVPTimelineItem[];
  isLoading?: boolean;
  className?: string;
}

interface StatusConfig {
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  label: string;
}

const getStatusConfig = (status: RsvpStatus): StatusConfig => {
  const configs: Record<RsvpStatus, StatusConfig> = {
    [RsvpStatus.ATTENDING]: {
      icon: <UserCheck className="h-4 w-4" />,
      color: "text-green-700 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      label: "Attending",
    },
    [RsvpStatus.NOT_ATTENDING]: {
      icon: <UserX className="h-4 w-4" />,
      color: "text-red-700 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/30",
      label: "Not Attending",
    },
    [RsvpStatus.MAYBE]: {
      icon: <HelpCircle className="h-4 w-4" />,
      color: "text-amber-700 dark:text-amber-400",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
      label: "Maybe",
    },
    [RsvpStatus.PENDING]: {
      icon: <Clock className="h-4 w-4" />,
      color: "text-gray-700 dark:text-gray-400",
      bgColor: "bg-gray-100 dark:bg-gray-900/30",
      label: "Pending",
    },
  };
  return configs[status];
};

export function RSVPTimeline({
  items,
  isLoading,
  className,
}: RSVPTimelineProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-start gap-3 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center py-12",
          className
        )}
      >
        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <User className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-center">
          No RSVP responses yet
        </p>
        <p className="text-sm text-muted-foreground/70 text-center mt-1">
          Responses will appear here as guests submit their RSVPs
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Timeline items */}
      <div className="relative">
        {/* Vertical line */}
        <div
          className="absolute left-5 top-0 bottom-0 w-px bg-border"
          aria-hidden="true"
        />

        {/* Timeline items */}
        <div className="space-y-4">
          {items.map((item, index) => {
            const config = getStatusConfig(item.rsvp_status);
            const timeAgo = formatDistanceToNow(new Date(item.changed_at), {
              addSuffix: true,
            });

            return (
              <div
                key={item.id}
                className={cn(
                  "relative flex items-start gap-4 pl-2",
                  "transition-all hover:bg-muted/50 rounded-lg p-2 -ml-2"
                )}
              >
                {/* Status icon */}
                <div
                  className={cn(
                    "relative z-10 flex items-center justify-center",
                    "w-10 h-10 rounded-full border-2 border-background",
                    config.bgColor,
                    config.color
                  )}
                  aria-label={`${config.label} status`}
                >
                  {config.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-foreground truncate">
                      {item.guest_name}
                    </p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {timeAgo}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium",
                        config.bgColor,
                        config.color
                      )}
                    >
                      {config.label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Show count if there are items */}
      {items.length > 0 && (
        <div className="pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            Showing {items.length} recent{" "}
            {items.length === 1 ? "response" : "responses"}
          </p>
        </div>
      )}
    </div>
  );
}
