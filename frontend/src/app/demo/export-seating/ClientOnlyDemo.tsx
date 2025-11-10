/**
 * Export Seating Chart Demo - Client-Only Component
 *
 * FR-21: The system shall provide an interactive seating chart interface.
 * Phase 6.2.3: Export and Sharing Features
 */

"use client";

import React, { useState, useRef, useMemo } from "react";
import SeatingCanvas from "@/components/seating/SeatingCanvas";
import ExportSeating from "@/components/seating/ExportSeating";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { Canvas as FabricCanvas } from "fabric";
import { FileText, Table2, Users, ArrowLeft, Info } from "lucide-react";
import type {
  SeatingChartWithTables,
  TableLayout,
  SeatAssignment,
  Guest,
  UUID,
  TableType,
} from "@/types";
import { VenueUnit, RsvpStatus } from "@/types";

// Mock data for demo
const MOCK_EVENT_ID: UUID = "e1234567-89ab-cdef-0123-456789abcdef" as UUID;

const MOCK_SEATING_CHART: SeatingChartWithTables = {
  id: "c1234567-89ab-cdef-0123-456789abcdef" as UUID,
  event_id: MOCK_EVENT_ID,
  name: "Grand Ballroom Seating",
  venue_width: 1200,
  venue_height: 800,
  venue_unit: VenueUnit.FEET,
  version: 1,
  is_active: true,
  total_tables: 10,
  total_capacity: 80,
  total_assigned: 45,
  tables: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const MOCK_TABLES: TableLayout[] = [
  {
    id: "t1" as UUID,
    seating_chart_id: MOCK_SEATING_CHART.id,
    table_number: "1",
    table_type: "round" as TableType,
    x_position: 100,
    y_position: 100,
    width: 80,
    height: 80,
    rotation: 0,
    capacity: 8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "t2" as UUID,
    seating_chart_id: MOCK_SEATING_CHART.id,
    table_number: "2",
    table_type: "round" as TableType,
    x_position: 250,
    y_position: 100,
    width: 80,
    height: 80,
    rotation: 0,
    capacity: 8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "t3" as UUID,
    seating_chart_id: MOCK_SEATING_CHART.id,
    table_number: "3",
    table_type: "rectangular" as TableType,
    x_position: 100,
    y_position: 250,
    width: 120,
    height: 60,
    rotation: 0,
    capacity: 10,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "t4" as UUID,
    seating_chart_id: MOCK_SEATING_CHART.id,
    table_number: "4",
    table_type: "round" as TableType,
    x_position: 100,
    y_position: 400,
    width: 80,
    height: 80,
    rotation: 0,
    capacity: 8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "t5" as UUID,
    seating_chart_id: MOCK_SEATING_CHART.id,
    table_number: "5",
    table_type: "round" as TableType,
    x_position: 250,
    y_position: 400,
    width: 80,
    height: 80,
    rotation: 0,
    capacity: 8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const MOCK_GUESTS: Guest[] = [
  {
    id: "g1" as UUID,
    event_id: MOCK_EVENT_ID,
    first_name: "John",
    last_name: "Smith",
    email: "john.smith@example.com",
    phone: "+1-555-0101",
    rsvp_status: RsvpStatus.ATTENDING,
    plus_one_allowed: true,
    plus_one_name: "Jane Smith",
    dietary_restrictions: "Vegetarian",
    invitation_sent_at: new Date().toISOString(),
    rsvp_token: "ABC12345",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "g2" as UUID,
    event_id: MOCK_EVENT_ID,
    first_name: "Sarah",
    last_name: "Johnson",
    email: "sarah.johnson@example.com",
    phone: "+1-555-0102",
    rsvp_status: RsvpStatus.ATTENDING,
    plus_one_allowed: false,
    dietary_restrictions: "Gluten-Free",
    invitation_sent_at: new Date().toISOString(),
    rsvp_token: "DEF67890",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "g3" as UUID,
    event_id: MOCK_EVENT_ID,
    first_name: "Michael",
    last_name: "Chen",
    email: "michael.chen@example.com",
    phone: "+1-555-0103",
    rsvp_status: RsvpStatus.ATTENDING,
    plus_one_allowed: true,
    plus_one_name: "Lisa Chen",
    dietary_restrictions: "None",
    invitation_sent_at: new Date().toISOString(),
    rsvp_token: "GHI11111",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "g4" as UUID,
    event_id: MOCK_EVENT_ID,
    first_name: "Emily",
    last_name: "Davis",
    email: "emily.davis@example.com",
    phone: "+1-555-0104",
    rsvp_status: RsvpStatus.ATTENDING,
    plus_one_allowed: false,
    dietary_restrictions: "Vegan",
    invitation_sent_at: new Date().toISOString(),
    rsvp_token: "JKL22222",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "g5" as UUID,
    event_id: MOCK_EVENT_ID,
    first_name: "David",
    last_name: "Martinez",
    email: "david.martinez@example.com",
    phone: "+1-555-0105",
    rsvp_status: RsvpStatus.ATTENDING,
    plus_one_allowed: true,
    dietary_restrictions: "Kosher",
    invitation_sent_at: new Date().toISOString(),
    rsvp_token: "MNO33333",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const MOCK_SEAT_ASSIGNMENTS: SeatAssignment[] = [
  {
    id: "sa1" as UUID,
    table_layout_id: "t1" as UUID,
    guest_id: "g1" as UUID,
    seat_number: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "sa2" as UUID,
    table_layout_id: "t1" as UUID,
    guest_id: "g2" as UUID,
    seat_number: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "sa3" as UUID,
    table_layout_id: "t2" as UUID,
    guest_id: "g3" as UUID,
    seat_number: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "sa4" as UUID,
    table_layout_id: "t3" as UUID,
    guest_id: "g4" as UUID,
    seat_number: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "sa5" as UUID,
    table_layout_id: "t3" as UUID,
    guest_id: "g5" as UUID,
    seat_number: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function ClientOnlyDemo() {
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const [tables] = useState<TableLayout[]>(MOCK_TABLES);
  const [seatAssignments] = useState<SeatAssignment[]>(MOCK_SEAT_ASSIGNMENTS);

  // Phase 6.2.3: Capture canvas reference when ready
  const handleCanvasReady = (canvas: FabricCanvas) => {
    fabricCanvasRef.current = canvas;
  };

  // Build seating chart with current state
  const seatingChart: SeatingChartWithTables = useMemo(() => {
    const tablesWithSeats = tables.map((table) => {
      const tableAssignments = seatAssignments.filter(
        (a) => a.table_layout_id === table.id
      );

      return {
        ...table,
        seat_assignments: tableAssignments,
        assigned_count: tableAssignments.length,
        empty_seats: table.capacity - tableAssignments.length,
      };
    });

    return {
      ...MOCK_SEATING_CHART,
      tables: tablesWithSeats,
      total_assigned: seatAssignments.length,
    };
  }, [tables, seatAssignments]);

  // Note: Fabric canvas reference would be exposed by SeatingCanvas in production
  // For this demo, we pass null and show the export UI functionality

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Demos
            </Button>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Export & Sharing Demo</h1>
              <p className="text-muted-foreground mb-4">
                Phase 6.2.3: Comprehensive export and sharing features for
                seating charts
              </p>

              {/* Info Banner */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg mb-4">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-900 dark:text-blue-100">
                  <p className="font-medium mb-1">Available Export Formats:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>PDF with event details and guest names</li>
                    <li>High-resolution images (PNG, JPEG, SVG)</li>
                    <li>Print-optimized view with table cards</li>
                    <li>Table assignment cards (2-6 per page)</li>
                    <li>CSV guest seating list</li>
                    <li>Shareable read-only links</li>
                  </ul>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Table2 className="w-4 h-4 text-muted-foreground" />
                  <span>{seatingChart.total_tables} tables</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {seatingChart.total_assigned}/{seatingChart.total_capacity}{" "}
                    guests seated
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <Badge variant="outline">
                    {MOCK_GUESTS.length} guests total
                  </Badge>
                </div>
              </div>
            </div>

            {/* Export Button */}
            <div>
              <ExportSeating
                fabricCanvas={fabricCanvasRef.current}
                chart={seatingChart}
                guests={MOCK_GUESTS}
                seatAssignments={seatAssignments}
                eventId={MOCK_EVENT_ID}
                eventName="Sarah & Michael's Wedding"
                eventDate="June 15, 2024"
                venueName="Grand Ballroom, The Plaza Hotel"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div
          className="bg-card border border-border rounded-lg p-4"
          style={{ height: "700px" }}
        >
          <SeatingCanvas
            seatingChart={seatingChart}
            tables={tables}
            readOnly={false}
            theme="light"
            onCanvasReady={handleCanvasReady}
          />
        </div>

        {/* Instructions */}
        <div className="mt-6 p-6 bg-card border border-border rounded-lg">
          <h2 className="text-lg font-semibold mb-4">
            How to Test Export Features
          </h2>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <span className="font-semibold text-foreground">1.</span>
              <span>
                Click the &ldquo;Export&rdquo; button in the top-right corner to
                open the export dialog
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-foreground">2.</span>
              <span>
                Adjust export options (resolution, paper size, orientation,
                inclusions)
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-foreground">3.</span>
              <span>Try different export formats:</span>
            </li>
            <ul className="ml-9 space-y-2 mt-2">
              <li>
                • <strong>Export as PDF</strong>: Downloads PDF with seating
                chart image and metadata
              </li>
              <li>
                • <strong>Export as PNG/JPEG</strong>: Downloads high-resolution
                image
              </li>
              <li>
                • <strong>Export as SVG</strong>: Downloads scalable vector
                graphic
              </li>
              <li>
                • <strong>Print View</strong>: Opens browser print dialog with
                formatted layout
              </li>
              <li>
                • <strong>Table Assignment Cards</strong>: PDF with printable
                cards for each table
              </li>
              <li>
                • <strong>Guest Seating List (CSV)</strong>: Spreadsheet with
                all seat assignments
              </li>
              <li>
                • <strong>Copy Share Link</strong>: Copies shareable URL to
                clipboard
              </li>
            </ul>
            <li className="flex gap-3">
              <span className="font-semibold text-foreground">4.</span>
              <span>
                Test different print options (cards per page, sort order)
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-foreground">5.</span>
              <span>
                Verify exports work in both light and dark theme modes
              </span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
