/**
 * FR-21: The system shall provide an interactive seating chart interface.
 * Phase 6.3.1: Basic Tab Integration With Read Only View
 */

"use client";

import React, { useMemo } from "react";
import { Users, UserX, Table, PieChart, UserPlus, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { SeatingStatistics } from "@/types/seating.types";
import type { Guest } from "@/types/guest.types";
import { RsvpStatus } from "@/types/guest.types";

/**
 * Props for the SeatingStatsCards component
 */
export interface SeatingStatsCardsProps {
  /**
   * Statistics data for the seating chart
   */
  statistics: SeatingStatistics | null;
  /**
   * Guest list to calculate headcount including plus-ones
   */
  guests?: Guest[];
  /**
   * Loading state
   */
  isLoading?: boolean;
}

/**
 * Statistics card configuration
 */
interface StatCard {
  id: string;
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  color: string;
}

/**
 * SeatingStatsCards Component
 *
 * Displays four statistics cards showing seating chart metrics:
 * - Total Capacity
 * - Seated Guests
 * - Unseated Guests
 * - Utilization %
 *
 * Features:
 * - Responsive grid layout (1 col mobile → 2 col tablet → 4 col desktop)
 * - Theme-aware colors using CSS variables
 * - Loading skeleton states
 * - Icons from lucide-react
 *
 * @example
 * ```tsx
 * <SeatingStatsCards
 *   statistics={statistics}
 *   isLoading={false}
 * />
 * ```
 */
export function SeatingStatsCards({
  statistics,
  guests = [],
  isLoading = false,
}: SeatingStatsCardsProps): React.ReactElement {
  // Calculate headcount including plus-ones
  const { totalAttending, plusOneCount, totalHeadcount } = useMemo(() => {
    const attendingGuests = guests.filter(g => g.rsvp_status === RsvpStatus.ATTENDING);
    const totalAttending = attendingGuests.length;
    const plusOneCount = attendingGuests.filter(
      g => g.plus_one_name && g.plus_one_name.trim() !== ''
    ).length;
    const totalHeadcount = totalAttending + plusOneCount;

    return { totalAttending, plusOneCount, totalHeadcount };
  }, [guests]);

  // Show loading skeleton
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 w-24 bg-muted rounded"></div>
              </CardTitle>
              <div className="h-4 w-4 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted rounded mb-1"></div>
              <div className="h-3 w-32 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Show empty state if no statistics
  if (!statistics) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Capacity", icon: Table },
          { title: "Seated Guests", icon: Users },
          { title: "Unseated Guests", icon: UserX },
          { title: "Utilization", icon: PieChart },
        ].map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">No data available</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Calculate utilization percentage
  const utilizationPercentage =
    statistics.total_capacity > 0
      ? Math.round(
          (statistics.total_assigned / statistics.total_capacity) * 100
        )
      : 0;

  // Check if headcount exceeds capacity
  const isOverCapacity = totalHeadcount > statistics.total_capacity;

  // Define statistics cards
  const statCards: StatCard[] = [
    {
      id: "capacity",
      title: "Total Capacity",
      value: statistics.total_capacity,
      icon: Table,
      description: `${statistics.total_tables} table${
        statistics.total_tables !== 1 ? "s" : ""
      }`,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      id: "seated",
      title: "Seated Guests",
      value: statistics.total_assigned,
      icon: Users,
      description:
        statistics.total_assigned === 1
          ? "1 guest assigned"
          : `${statistics.total_assigned} guests assigned`,
      color: "text-green-600 dark:text-green-400",
    },
    {
      id: "unseated",
      title: "Unseated Guests",
      value: statistics.total_unassigned,
      icon: UserX,
      description:
        statistics.total_unassigned === 1
          ? "1 guest remaining"
          : `${statistics.total_unassigned} guests remaining`,
      color: "text-orange-600 dark:text-orange-400",
    },
    {
      id: "utilization",
      title: "Utilization",
      value: `${utilizationPercentage}%`,
      icon: PieChart,
      description: getUtilizationDescription(utilizationPercentage),
      color: getUtilizationColor(utilizationPercentage),
    },
  ];

  // Add headcount card if there are plus-ones
  if (plusOneCount > 0) {
    statCards.push({
      id: "headcount",
      title: "Total Headcount",
      value: totalHeadcount,
      icon: isOverCapacity ? AlertTriangle : UserPlus,
      description: `${totalAttending} guests + ${plusOneCount} plus-one${plusOneCount !== 1 ? 's' : ''}`,
      color: isOverCapacity
        ? "text-red-600 dark:text-red-400"
        : "text-purple-600 dark:text-purple-400",
    });
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card) => (
        <Card key={card.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            {card.description && (
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Get utilization description based on percentage
 */
function getUtilizationDescription(percentage: number): string {
  if (percentage === 0) {
    return "No guests seated";
  } else if (percentage === 100) {
    return "Fully seated";
  } else if (percentage >= 80) {
    return "Nearly full";
  } else if (percentage >= 50) {
    return "Half full";
  } else {
    return "Low utilization";
  }
}

/**
 * Get utilization color based on percentage
 */
function getUtilizationColor(percentage: number): string {
  if (percentage === 0) {
    return "text-gray-600 dark:text-gray-400";
  } else if (percentage === 100) {
    return "text-green-600 dark:text-green-400";
  } else if (percentage >= 80) {
    return "text-blue-600 dark:text-blue-400";
  } else if (percentage >= 50) {
    return "text-yellow-600 dark:text-yellow-400";
  } else {
    return "text-orange-600 dark:text-orange-400";
  }
}
