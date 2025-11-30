/**
 * SaveIndicator Component
 *
 * FR-21: The system shall provide an interactive seating chart interface.
 * Phase 6.3.12: Polish & Performance
 * Displays autosave status for seating chart with enhanced animations
 */

"use client";

import React, { useEffect, useState, useRef } from "react";
import { Check, AlertCircle, Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SaveStatus } from "@/types/seating.types";

interface SaveIndicatorProps {
  status: SaveStatus;
  lastSaved: Date | null;
  className?: string;
  showLabel?: boolean;
}

/**
 * Visual indicator for autosave status with enhanced animations
 */
export function SaveIndicator({
  status,
  lastSaved,
  className,
  showLabel = true,
}: SaveIndicatorProps) {
  // Track previous status for animation triggers
  const prevStatusRef = useRef<SaveStatus>(status);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  // Detect transition from "saving" to "saved" and trigger success animation
  useEffect(() => {
    if (prevStatusRef.current === "saving" && status === "saved") {
      setShowSuccessAnimation(true);
      // Reset animation after it completes
      const timer = setTimeout(() => {
        setShowSuccessAnimation(false);
      }, 600); // Match animation duration
      return () => clearTimeout(timer);
    }
    prevStatusRef.current = status;
  }, [status]);

  // Format last saved time
  const formatLastSaved = (date: Date): string => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // seconds

    if (diff < 60) {
      return "Just now";
    } else if (diff < 3600) {
      const minutes = Math.floor(diff / 60);
      return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    } else {
      const hours = Math.floor(diff / 3600);
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    }
  };

  // Get status details
  const getStatusDetails = () => {
    switch (status) {
      case "saved":
        return {
          icon: Check,
          label: lastSaved ? `Saved ${formatLastSaved(lastSaved)}` : "Saved",
          color: "text-green-600 dark:text-green-400",
          bgColor: "bg-green-50 dark:bg-green-950/30",
          iconClassName: "text-green-600 dark:text-green-400",
        };

      case "saving":
        return {
          icon: Loader2,
          label: "Saving...",
          color: "text-blue-600 dark:text-blue-400",
          bgColor: "bg-blue-50 dark:bg-blue-950/30",
          iconClassName: "text-blue-600 dark:text-blue-400 animate-spin",
        };

      case "unsaved":
        return {
          icon: Save,
          label: "Unsaved changes",
          color: "text-yellow-600 dark:text-yellow-400",
          bgColor: "bg-yellow-50 dark:bg-yellow-950/30",
          iconClassName: "text-yellow-600 dark:text-yellow-400",
        };

      case "error":
        return {
          icon: AlertCircle,
          label: "Error saving",
          color: "text-red-600 dark:text-red-400",
          bgColor: "bg-red-50 dark:bg-red-950/30",
          iconClassName: "text-red-600 dark:text-red-400",
        };

      default:
        return {
          icon: Save,
          label: "Unknown",
          color: "text-gray-600 dark:text-gray-400",
          bgColor: "bg-gray-50 dark:bg-gray-950/30",
          iconClassName: "text-gray-600 dark:text-gray-400",
        };
    }
  };

  const details = getStatusDetails();
  const Icon = details.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium",
        "transition-all duration-200 ease-in-out",
        details.bgColor,
        details.color,
        // Success animation - subtle scale pulse
        showSuccessAnimation && "animate-pulse",
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={details.label}
    >
      <Icon
        className={cn(
          "h-4 w-4 transition-transform duration-200",
          details.iconClassName,
          // Success checkmark animation - scale bounce
          showSuccessAnimation && status === "saved" && "scale-125"
        )}
        aria-hidden="true"
      />
      {showLabel && (
        <span className="whitespace-nowrap transition-opacity duration-200">
          {details.label}
        </span>
      )}
    </div>
  );
}

/**
 * Compact save indicator (icon only)
 */
export function SaveIndicatorCompact({
  status,
  className,
}: {
  status: SaveStatus;
  className?: string;
}) {
  return (
    <SaveIndicator
      status={status}
      lastSaved={null}
      showLabel={false}
      className={className}
    />
  );
}
