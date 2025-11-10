"use client";

/**
 * Mobile Seating View Demo - Client Component
 *
 * FR-21: The system shall provide an interactive seating chart interface.
 * Phase 6.2.4: Mobile & Tablet Views
 * Demonstrates responsive seating chart with Find My Seat feature
 */

import React, { useState, useEffect } from "react";
import { ArrowLeft, Info, Smartphone, Tablet, Monitor } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import MobileSeatingView from "@/components/seating/MobileSeatingView";
import type {
  SeatingChartWithTables,
  TableLayout,
  TableLayoutWithSeats,
  SeatAssignment,
  UUID,
} from "@/types";
import { TableType, VenueUnit } from "@/types";

export default function ClientOnlyDemo() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Wait for client-side mounting
  useEffect(() => {
    setMounted(true);

    // Detect theme from HTML class
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");

    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          const isDark = document.documentElement.classList.contains("dark");
          setTheme(isDark ? "dark" : "light");
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // ============================================================================
  // Mock Data
  // ============================================================================

  // Mock guests
  const mockGuests = [
    {
      id: "guest-1" as UUID,
      first_name: "Alice",
      last_name: "Johnson",
      email: "alice.johnson@email.com",
    },
    {
      id: "guest-2" as UUID,
      first_name: "Bob",
      last_name: "Smith",
      email: "bob.smith@email.com",
    },
    {
      id: "guest-3" as UUID,
      first_name: "Carol",
      last_name: "Williams",
      email: "carol.williams@email.com",
    },
    {
      id: "guest-4" as UUID,
      first_name: "David",
      last_name: "Brown",
      email: "david.brown@email.com",
    },
    {
      id: "guest-5" as UUID,
      first_name: "Emma",
      last_name: "Davis",
      email: "emma.davis@email.com",
    },
    {
      id: "guest-6" as UUID,
      first_name: "Frank",
      last_name: "Miller",
      email: "frank.miller@email.com",
    },
    {
      id: "guest-7" as UUID,
      first_name: "Grace",
      last_name: "Wilson",
      email: "grace.wilson@email.com",
    },
    {
      id: "guest-8" as UUID,
      first_name: "Henry",
      last_name: "Moore",
      email: "henry.moore@email.com",
    },
    {
      id: "guest-9" as UUID,
      first_name: "Ivy",
      last_name: "Taylor",
      email: "ivy.taylor@email.com",
    },
    {
      id: "guest-10" as UUID,
      first_name: "Jack",
      last_name: "Anderson",
      email: "jack.anderson@email.com",
    },
  ];

  // Mock seat assignments
  const mockSeatAssignments: SeatAssignment[] = [
    // Table 1
    {
      id: "seat-1" as UUID,
      table_layout_id: "table-1" as UUID,
      guest_id: "guest-1" as UUID,
      seat_number: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "seat-2" as UUID,
      table_layout_id: "table-1" as UUID,
      guest_id: "guest-2" as UUID,
      seat_number: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "seat-3" as UUID,
      table_layout_id: "table-1" as UUID,
      guest_id: "guest-3" as UUID,
      seat_number: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    // Table 2
    {
      id: "seat-4" as UUID,
      table_layout_id: "table-2" as UUID,
      guest_id: "guest-4" as UUID,
      seat_number: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "seat-5" as UUID,
      table_layout_id: "table-2" as UUID,
      guest_id: "guest-5" as UUID,
      seat_number: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    // Table 3
    {
      id: "seat-6" as UUID,
      table_layout_id: "table-3" as UUID,
      guest_id: "guest-6" as UUID,
      seat_number: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "seat-7" as UUID,
      table_layout_id: "table-3" as UUID,
      guest_id: "guest-7" as UUID,
      seat_number: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "seat-8" as UUID,
      table_layout_id: "table-3" as UUID,
      guest_id: "guest-8" as UUID,
      seat_number: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    // Table 4
    {
      id: "seat-9" as UUID,
      table_layout_id: "table-4" as UUID,
      guest_id: "guest-9" as UUID,
      seat_number: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "seat-10" as UUID,
      table_layout_id: "table-4" as UUID,
      guest_id: "guest-10" as UUID,
      seat_number: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  // Mock tables with seat assignments
  const mockTables: TableLayoutWithSeats[] = [
    {
      id: "table-1" as UUID,
      seating_chart_id: "chart-1" as UUID,
      table_number: "1",
      table_type: TableType.ROUND,
      x_position: 100,
      y_position: 100,
      width: 120,
      height: 120,
      rotation: 0,
      capacity: 6,
      seat_assignments: mockSeatAssignments.filter(
        (s) => s.table_layout_id === "table-1"
      ),
      assigned_count: 3,
      empty_seats: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "table-2" as UUID,
      seating_chart_id: "chart-1" as UUID,
      table_number: "2",
      table_type: TableType.RECTANGULAR,
      x_position: 300,
      y_position: 100,
      width: 160,
      height: 80,
      rotation: 0,
      capacity: 8,
      seat_assignments: mockSeatAssignments.filter(
        (s) => s.table_layout_id === "table-2"
      ),
      assigned_count: 2,
      empty_seats: 6,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "table-3" as UUID,
      seating_chart_id: "chart-1" as UUID,
      table_number: "3",
      table_type: TableType.ROUND,
      x_position: 100,
      y_position: 280,
      width: 100,
      height: 100,
      rotation: 0,
      capacity: 4,
      seat_assignments: mockSeatAssignments.filter(
        (s) => s.table_layout_id === "table-3"
      ),
      assigned_count: 3,
      empty_seats: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "table-4" as UUID,
      seating_chart_id: "chart-1" as UUID,
      table_number: "4",
      table_type: TableType.SQUARE,
      x_position: 280,
      y_position: 280,
      width: 100,
      height: 100,
      rotation: 45,
      capacity: 4,
      seat_assignments: mockSeatAssignments.filter(
        (s) => s.table_layout_id === "table-4"
      ),
      assigned_count: 2,
      empty_seats: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "table-5" as UUID,
      seating_chart_id: "chart-1" as UUID,
      table_number: "5",
      table_type: TableType.ROUND,
      x_position: 450,
      y_position: 280,
      width: 110,
      height: 110,
      rotation: 0,
      capacity: 5,
      seat_assignments: [],
      assigned_count: 0,
      empty_seats: 5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  // Mock seating chart
  const mockSeatingChart: SeatingChartWithTables = {
    id: "chart-1" as UUID,
    event_id: "event-1" as UUID,
    name: "Wedding Reception Seating",
    venue_width: 600,
    venue_height: 400,
    venue_unit: VenueUnit.FEET,
    version: 1,
    is_active: true,
    tables: mockTables as TableLayout[],
    total_tables: mockTables.length,
    total_capacity: mockTables.reduce((sum, t) => sum + t.capacity, 0),
    total_assigned: mockTables.reduce((sum, t) => sum + t.assigned_count, 0),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/demo">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Demos
                </Button>
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                  Mobile Seating View
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Phase 6.2.4: Responsive seating charts with touch gestures
                </p>
              </div>
            </div>
            <Badge variant="outline" className="hidden sm:flex">
              Phase 6.2.4
            </Badge>
          </div>
        </div>
      </header>

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Testing Instructions
              </h3>
              <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                <li className="flex items-center gap-2">
                  <Smartphone className="w-3 h-3 flex-shrink-0" />
                  <span>
                    <strong>Mobile (320px-767px):</strong> Find My Seat search,
                    pinch-to-zoom, floating toolbar
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Tablet className="w-3 h-3 flex-shrink-0" />
                  <span>
                    <strong>Tablet (768px-1023px):</strong> Touch gestures,
                    responsive toolbar
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Monitor className="w-3 h-3 flex-shrink-0" />
                  <span>
                    <strong>Desktop (1024px+):</strong> Full controls, optimal
                    layout
                  </span>
                </li>
              </ul>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                💡 Try searching for guests: Alice Johnson, Bob Smith, Carol
                Williams, etc.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Seating View Component */}
      <div className="h-[calc(100vh-200px)] sm:h-[calc(100vh-220px)]">
        <MobileSeatingView
          seatingChart={mockSeatingChart}
          tables={mockTables as TableLayout[]}
          guests={mockGuests}
          readOnly={true}
          showFindMySeat={true}
          theme={theme}
        />
      </div>

      {/* Footer Stats */}
      <footer className="border-t border-border bg-muted/30 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {mockSeatingChart.total_tables} Tables
              </Badge>
              <Badge variant="outline">
                {mockSeatingChart.total_capacity} Total Seats
              </Badge>
              <Badge variant="outline">
                {mockSeatingChart.total_assigned} Assigned
              </Badge>
            </div>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">
              Phase 6.2.4: Mobile & Tablet Views Complete
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
