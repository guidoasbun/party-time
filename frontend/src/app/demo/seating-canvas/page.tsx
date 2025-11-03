"use client";

/**
 * Seating Canvas Demo Page
 *
 * FR-21: The system shall provide an interactive seating chart interface.
 * Phase 6 - 6.1.3 Fabric.JS Canvas Setup
 *
 * Demonstrates the interactive Fabric.js canvas for seating charts
 * Built in Phase 6.1.3 - Fabric.js Canvas Setup
 */

import dynamic from "next/dynamic";
import type { SeatingChartWithTables, TableLayout, UUID } from "@/types";
import { TableType, VenueUnit } from "@/types";

// Dynamically import the client component to avoid SSR
const ClientOnlyDemo = dynamic(() => import("./ClientOnlyDemo"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-muted-foreground">Loading canvas...</div>
    </div>
  ),
});

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_SEATING_CHART: SeatingChartWithTables = {
  id: "demo-chart-001" as UUID,
  event_id: "demo-event-001" as UUID,
  name: "Grand Ballroom Layout",
  venue_width: 1000,
  venue_height: 800,
  venue_unit: VenueUnit.FEET,
  version: 1,
  is_active: true,
  tables: [], // Will be populated below
  total_tables: 10,
  total_capacity: 80,
  total_assigned: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const MOCK_TABLES: TableLayout[] = [
  // Round tables
  {
    id: "table-001" as UUID,
    seating_chart_id: "demo-chart-001" as UUID,
    table_number: "1",
    table_type: TableType.ROUND,
    x_position: 150,
    y_position: 150,
    width: 120,
    height: 120,
    rotation: 0,
    capacity: 8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "table-002" as UUID,
    seating_chart_id: "demo-chart-001" as UUID,
    table_number: "2",
    table_type: TableType.ROUND,
    x_position: 350,
    y_position: 150,
    width: 100,
    height: 100,
    rotation: 0,
    capacity: 6,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "table-003" as UUID,
    seating_chart_id: "demo-chart-001" as UUID,
    table_number: "3",
    table_type: TableType.ROUND,
    x_position: 550,
    y_position: 150,
    width: 120,
    height: 120,
    rotation: 0,
    capacity: 8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Rectangular tables
  {
    id: "table-004" as UUID,
    seating_chart_id: "demo-chart-001" as UUID,
    table_number: "4",
    table_type: TableType.RECTANGULAR,
    x_position: 150,
    y_position: 350,
    width: 200,
    height: 100,
    rotation: 0,
    capacity: 10,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "table-005" as UUID,
    seating_chart_id: "demo-chart-001" as UUID,
    table_number: "5",
    table_type: TableType.RECTANGULAR,
    x_position: 450,
    y_position: 350,
    width: 180,
    height: 90,
    rotation: 15,
    capacity: 8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "table-006" as UUID,
    seating_chart_id: "demo-chart-001" as UUID,
    table_number: "6",
    table_type: TableType.RECTANGULAR,
    x_position: 100,
    y_position: 550,
    width: 220,
    height: 110,
    rotation: 0,
    capacity: 12,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Square tables
  {
    id: "table-007" as UUID,
    seating_chart_id: "demo-chart-001" as UUID,
    table_number: "7",
    table_type: TableType.SQUARE,
    x_position: 750,
    y_position: 150,
    width: 100,
    height: 100,
    rotation: 45,
    capacity: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "table-008" as UUID,
    seating_chart_id: "demo-chart-001" as UUID,
    table_number: "8",
    table_type: TableType.SQUARE,
    x_position: 750,
    y_position: 350,
    width: 120,
    height: 120,
    rotation: 0,
    capacity: 6,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Head table (long rectangular)
  {
    id: "table-009" as UUID,
    seating_chart_id: "demo-chart-001" as UUID,
    table_number: "Head",
    table_type: TableType.RECTANGULAR,
    x_position: 400,
    y_position: 550,
    width: 300,
    height: 80,
    rotation: 0,
    capacity: 14,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Custom table
  {
    id: "table-010" as UUID,
    seating_chart_id: "demo-chart-001" as UUID,
    table_number: "10",
    table_type: TableType.CUSTOM,
    x_position: 750,
    y_position: 550,
    width: 140,
    height: 100,
    rotation: 30,
    capacity: 6,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

MOCK_SEATING_CHART.tables = MOCK_TABLES;

// ============================================================================
// Component
// ============================================================================

export default function SeatingCanvasDemo() {
  return (
    <ClientOnlyDemo seatingChart={MOCK_SEATING_CHART} tables={MOCK_TABLES} />
  );
}
