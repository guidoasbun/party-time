/**
 * SeatingChartTab Component
 * FR-21: The system shall provide an interactive seating chart interface.
 * Phase 6.2.5: Seating Chart Polish & Integration
 * Main seating chart editor integrated into event details page
 */

"use client";

import React, { useState, useEffect } from "react";
import { LayoutGrid, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { useSeatingChart } from "@/hooks/useSeatingChart";
import { useEventGuests } from "@/hooks/useEventGuests";
import MobileSeatingView from "./MobileSeatingView";
import { SeatingOverview } from "./SeatingOverview";
import { cn } from "@/lib/utils";
import type { Event } from "@/types";

interface SeatingChartTabProps {
  event: Event;
  className?: string;
}

/**
 * Main seating chart tab component
 */
export function SeatingChartTab({ event, className }: SeatingChartTabProps) {
  const [isMobile, setIsMobile] = useState(false);

  // Seating chart hook with autosave
  const seatingChart = useSeatingChart({
    eventId: event.id,
    enableAutosave: true,
  });

  const { chart, statistics, isLoading, error, refetch } = seatingChart;

  // Fetch guests for headcount calculation
  const { guests } = useEventGuests(event.id);

  // Detect mobile/tablet viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // < lg breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // ============================================================================
  // Loading State
  // ============================================================================

  if (isLoading) {
    return (
      <div className={cn("space-y-4 p-6", className)}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-[600px] w-full rounded-lg" />
      </div>
    );
  }

  // ============================================================================
  // Error State
  // ============================================================================

  if (error) {
    return (
      <div className={cn("p-6", className)}>
        <Alert className="border-red-200 bg-red-50 dark:bg-red-950/30">
          <AlertDescription>
            <span className="text-red-600 dark:text-red-400">
              Failed to load seating chart: {error.message}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="ml-4"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // ============================================================================
  // Empty State (No chart created yet)
  // ============================================================================

  if (!chart) {
    return (
      <div className={cn("p-6", className)}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutGrid className="h-5 w-5" />
              No Seating Chart Yet
            </CardTitle>
            <CardDescription>
              Create a seating chart to start planning your event seating
              arrangements.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => refetch()}>
              <Plus className="mr-2 h-4 w-4" />
              Create Seating Chart
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============================================================================
  // Mobile View
  // ============================================================================

  if (isMobile) {
    return (
      <MobileSeatingView
        seatingChart={chart}
        tables={chart.tables || []}
        readOnly={true}
        showFindMySeat={true}
        className={className}
      />
    );
  }

  // ============================================================================
  // Desktop View - Read-Only Overview
  /**
   * FR-21: The system shall provide an interactive seating chart interface.
   * Phase 6.3.1: Basic Tab Integration With Read Only View
   */
  // ============================================================================

  return (
    <div className={cn("p-6", className)}>
      <SeatingOverview
        event={event}
        chart={chart}
        statistics={statistics}
        tables={chart.tables || []}
        guests={guests || []}
        isLoading={isLoading}
        onCreateChart={() => refetch()}
      />
    </div>
  );
}

/**
 * Skeleton loading state for seating chart tab
 */
export function SeatingChartTabSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <Skeleton className="h-[600px] w-full rounded-lg" />
    </div>
  );
}
