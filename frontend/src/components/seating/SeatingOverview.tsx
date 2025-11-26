/**
 * FR-21: The system shall provide an interactive seating chart interface.
 * Phase 6.3.1: Basic Tab Integration With Read Only View
 */

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Edit,
  Download,
  Printer,
  Image as ImageIcon,
  MapPin,
  CheckCircle,
  XCircle,
  Table as TableIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SeatingStatsCards } from "./SeatingStatsCards";
import type {
  SeatingChartWithTables,
  SeatingStatistics,
  TableLayout,
  TableType,
} from "@/types/seating.types";
import type { Event } from "@/types/event.types";
import type { Guest } from "@/types/guest.types";

/**
 * Props for the SeatingOverview component
 */
export interface SeatingOverviewProps {
  /**
   * The event being displayed
   */
  event: Event;
  /**
   * The seating chart data with tables
   */
  chart: SeatingChartWithTables | null;
  /**
   * Statistics about the seating chart
   */
  statistics: SeatingStatistics | null;
  /**
   * List of tables in the seating chart
   */
  tables: TableLayout[];
  /**
   * Guest list for headcount calculation
   */
  guests?: Guest[];
  /**
   * Loading state
   */
  isLoading?: boolean;
  /**
   * Callback for creating a new seating chart
   */
  onCreateChart?: () => void;
}

/**
 * SeatingOverview Component
 *
 * Read-only overview of the seating chart for the event detail tab.
 * Displays statistics, quick actions, venue status, and table summary.
 *
 * Features:
 * - Statistics cards showing capacity, seated, unseated, utilization
 * - Quick action buttons (Edit, Export, Print)
 * - Venue layout status (floor plan configured or not)
 * - Table summary by type
 * - Empty state when no chart exists
 *
 * @example
 * ```tsx
 * <SeatingOverview
 *   event={event}
 *   chart={chart}
 *   statistics={statistics}
 *   tables={tables}
 *   isLoading={false}
 * />
 * ```
 */
export function SeatingOverview({
  event,
  chart,
  statistics,
  tables,
  guests = [],
  isLoading = false,
  onCreateChart,
}: SeatingOverviewProps): React.ReactElement {
  const router = useRouter();

  // Handle navigation to edit page
  const handleEditSeating = (): void => {
    router.push(`/events/${event.id}/seating/edit`);
  };

  // Handle export action (placeholder for Phase 6.3.2)
  const handleExport = (): void => {
    // This will be implemented in Phase 6.3.2
    console.log("Export seating chart");
  };

  // Handle print action (placeholder for Phase 6.3.2)
  const handlePrint = (): void => {
    // This will be implemented in Phase 6.3.2
    console.log("Print seating chart");
  };

  // Show empty state if no chart exists
  if (!chart && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <TableIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle>No Seating Chart</CardTitle>
            <CardDescription>
              Create a seating chart to organize your guests and manage table
              assignments.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={onCreateChart || handleEditSeating} size="lg">
              <Edit className="mr-2 h-4 w-4" />
              Create Seating Chart
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if venue layout is configured
  const hasFloorPlan =
    chart?.background_image_url != null &&
    chart.background_image_url.length > 0;
  const hasSpecialAreas =
    chart?.venue_metadata?.specialAreas != null &&
    chart.venue_metadata.specialAreas.length > 0;
  const venueConfigured = hasFloorPlan || hasSpecialAreas;

  // Calculate table summary by type
  const tablesByType = getTablesByType(tables);

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Seating Statistics</h2>
        <SeatingStatsCards statistics={statistics} guests={guests} isLoading={isLoading} />
      </section>

      {/* Quick Actions */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Manage your seating chart, export data, or print table
              assignments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleEditSeating} variant="default">
                <Edit className="mr-2 h-4 w-4" />
                Edit Seating Chart
              </Button>
              <Button onClick={handleExport} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button onClick={handlePrint} variant="outline">
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Venue Layout Status */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Venue Layout</CardTitle>
            <CardDescription>
              Floor plan and special areas configuration status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Floor Plan Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Floor Plan</span>
                </div>
                {hasFloorPlan ? (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Configured
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1">
                    <XCircle className="h-3 w-3" />
                    Not Configured
                  </Badge>
                )}
              </div>

              {/* Special Areas Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Special Areas</span>
                </div>
                {hasSpecialAreas ? (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    {chart.venue_metadata?.specialAreas?.length || 0} area
                    {(chart.venue_metadata?.specialAreas?.length || 0) !== 1
                      ? "s"
                      : ""}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1">
                    <XCircle className="h-3 w-3" />
                    Not Configured
                  </Badge>
                )}
              </div>

              {/* Venue Configuration Hint */}
              {!venueConfigured && (
                <div className="mt-4 p-3 bg-muted rounded-md">
                  <p className="text-xs text-muted-foreground">
                    Tip: Add a floor plan and special areas in the edit view to
                    create a more detailed seating arrangement.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Table Summary */}
      {tables.length > 0 && (
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Table Summary</CardTitle>
              <CardDescription>
                Overview of tables by type and capacity.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(tablesByType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TableIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium capitalize">
                        {type}
                      </span>
                    </div>
                    <Badge variant="outline">
                      {count} table{count !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                ))}

                {/* Average Table Size */}
                {statistics && statistics.average_table_size > 0 && (
                  <div className="mt-4 pt-3 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Average table size
                      </span>
                      <span className="font-medium">
                        {Math.round(statistics.average_table_size)} guests
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-muted-foreground">
                        Largest table
                      </span>
                      <span className="font-medium">
                        {statistics.largest_table} guests
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-muted-foreground">
                        Smallest table
                      </span>
                      <span className="font-medium">
                        {statistics.smallest_table} guests
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}

/**
 * Helper function to group tables by type
 */
function getTablesByType(tables: TableLayout[]): Record<TableType, number> {
  const summary: Record<TableType, number> = {
    round: 0,
    rectangular: 0,
    square: 0,
    custom: 0,
  };

  tables.forEach((table) => {
    summary[table.table_type] = (summary[table.table_type] || 0) + 1;
  });

  // Filter out types with 0 count
  return Object.fromEntries(
    Object.entries(summary).filter(([, count]) => count > 0)
  ) as Record<TableType, number>;
}
