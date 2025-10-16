"use client";

/**
 * FR-6: The system shall display an RSVP submission page.
 * 5.1.3: RSVP Management Dashboard
 *
 * RSVPDeadlineCountdown Component
 * Displays countdown timer to RSVP deadline with visual urgency indicators
 */

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Clock, AlertCircle, CheckCircle, Calendar } from "lucide-react";
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  isPast,
  parseISO,
} from "date-fns";

interface RSVPDeadlineCountdownProps {
  deadline?: string | null;
  className?: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  isPastDeadline: boolean;
  urgencyLevel: "safe" | "warning" | "urgent" | "passed";
}

function calculateTimeRemaining(deadline: string): TimeRemaining {
  const deadlineDate = parseISO(deadline);
  const now = new Date();

  if (isPast(deadlineDate)) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      isPastDeadline: true,
      urgencyLevel: "passed",
    };
  }

  const totalDays = differenceInDays(deadlineDate, now);
  const totalHours = differenceInHours(deadlineDate, now);
  const totalMinutes = differenceInMinutes(deadlineDate, now);

  const days = totalDays;
  const hours = totalHours % 24;
  const minutes = totalMinutes % 60;

  // Determine urgency level
  let urgencyLevel: TimeRemaining["urgencyLevel"] = "safe";
  if (totalDays < 1) {
    urgencyLevel = "urgent"; // Less than 1 day
  } else if (totalDays < 7) {
    urgencyLevel = "warning"; // Less than 1 week
  }

  return {
    days,
    hours,
    minutes,
    isPastDeadline: false,
    urgencyLevel,
  };
}

export function RSVPDeadlineCountdown({
  deadline,
  className,
}: RSVPDeadlineCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(
    null
  );

  // Update countdown every minute
  useEffect(() => {
    if (!deadline) return;

    const updateTime = () => {
      setTimeRemaining(calculateTimeRemaining(deadline));
    };

    // Initial update
    updateTime();

    // Update every minute
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, [deadline]);

  // No deadline set
  if (!deadline) {
    return (
      <div
        className={cn(
          "p-4 bg-muted/50 rounded-lg border border-border",
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              No RSVP Deadline Set
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Guests can respond at any time
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (!timeRemaining) {
    return (
      <div
        className={cn(
          "p-4 bg-muted/50 rounded-lg border border-border animate-pulse",
          className
        )}
      >
        <div className="h-16" />
      </div>
    );
  }

  // Deadline passed
  if (timeRemaining.isPastDeadline) {
    return (
      <div
        className={cn(
          "p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800",
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-red-700 dark:text-red-400">
              RSVP Deadline Passed
            </p>
            <p className="text-xs text-red-600 dark:text-red-500 mt-0.5">
              The deadline for responding has ended
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Determine styling based on urgency
  const urgencyStyles = {
    safe: {
      bg: "bg-green-50 dark:bg-green-900/20",
      border: "border-green-200 dark:border-green-800",
      text: "text-green-700 dark:text-green-400",
      icon: <CheckCircle className="h-5 w-5" />,
      label: "Plenty of Time",
    },
    warning: {
      bg: "bg-amber-50 dark:bg-amber-900/20",
      border: "border-amber-200 dark:border-amber-800",
      text: "text-amber-700 dark:text-amber-400",
      icon: <Clock className="h-5 w-5" />,
      label: "Deadline Approaching",
    },
    urgent: {
      bg: "bg-red-50 dark:bg-red-900/20",
      border: "border-red-200 dark:border-red-800",
      text: "text-red-700 dark:text-red-400",
      icon: <AlertCircle className="h-5 w-5" />,
      label: "Urgent - Less than 24 hours!",
    },
    passed: {
      bg: "bg-gray-50 dark:bg-gray-900/20",
      border: "border-gray-200 dark:border-gray-800",
      text: "text-gray-700 dark:text-gray-400",
      icon: <AlertCircle className="h-5 w-5" />,
      label: "Deadline Passed",
    },
  };

  const style = urgencyStyles[timeRemaining.urgencyLevel];

  return (
    <div
      className={cn("p-4 rounded-lg border", style.bg, style.border, className)}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={cn("flex-shrink-0", style.text)}>{style.icon}</div>
        <div className="flex-1">
          <p className={cn("text-sm font-medium", style.text)}>{style.label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Time until RSVP deadline
          </p>
        </div>
      </div>

      {/* Countdown display */}
      <div className="grid grid-cols-3 gap-3">
        {/* Days */}
        <div className="text-center">
          <div className={cn("text-2xl font-bold", style.text)}>
            {timeRemaining.days}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {timeRemaining.days === 1 ? "Day" : "Days"}
          </div>
        </div>

        {/* Hours */}
        <div className="text-center">
          <div className={cn("text-2xl font-bold", style.text)}>
            {timeRemaining.hours}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {timeRemaining.hours === 1 ? "Hour" : "Hours"}
          </div>
        </div>

        {/* Minutes */}
        <div className="text-center">
          <div className={cn("text-2xl font-bold", style.text)}>
            {timeRemaining.minutes}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {timeRemaining.minutes === 1 ? "Min" : "Mins"}
          </div>
        </div>
      </div>
    </div>
  );
}
