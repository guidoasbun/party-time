"use client";

/**
 * Guest Assignment Demo Page
 *
 * FR-21: The system shall provide an interactive seating chart interface.
 * Phase 6.1.5: Guest Assignment System
 *
 * Demonstrates the complete guest assignment system with:
 * - GuestSidebar (drag-and-drop unseated guests)
 * - SeatingCanvas (drop zones for table assignment)
 * - SeatAssignmentPanel (detailed seat management)
 * - UnseatedGuestsIndicator (real-time statistics)
 *
 * Built in Phase 6.1.5 - Guest Assignment System
 */

import dynamic from "next/dynamic";
import type {
  SeatingChartWithTables,
  TableLayout,
  Guest,
  UUID,
} from "@/types";
import { TableType, VenueUnit, RsvpStatus } from "@/types";

// Dynamically import the client component to avoid SSR
const ClientOnlyDemo = dynamic(() => import("./ClientOnlyDemo"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-muted-foreground">Loading guest assignment demo...</div>
    </div>
  ),
});

// ============================================================================
// Mock Data - Guests
// ============================================================================

const MOCK_GUESTS: Guest[] = [
  // Attending guests (will show in sidebar)
  {
    id: "guest-001" as UUID,
    event_id: "demo-event-001" as UUID,
    first_name: "John",
    last_name: "Doe",
    email: "john.doe@example.com",
    phone: "+1234567890",
    rsvp_status: RsvpStatus.ATTENDING,
    rsvp_token: "ABC12345",
    plus_one_allowed: false,
    invitation_sent_at: new Date("2024-01-15").toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "guest-002" as UUID,
    event_id: "demo-event-001" as UUID,
    first_name: "Jane",
    last_name: "Smith",
    email: "jane.smith@example.com",
    phone: "+1234567891",
    rsvp_status: RsvpStatus.ATTENDING,
    rsvp_token: "DEF67890",
    plus_one_allowed: false,
    invitation_sent_at: new Date("2024-01-15").toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "guest-003" as UUID,
    event_id: "demo-event-001" as UUID,
    first_name: "Michael",
    last_name: "Johnson",
    email: "michael.j@example.com",
    phone: "+1234567892",
    rsvp_status: RsvpStatus.ATTENDING,
    rsvp_token: "GHI11111",
    plus_one_allowed: true,
    invitation_sent_at: new Date("2024-01-15").toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "guest-004" as UUID,
    event_id: "demo-event-001" as UUID,
    first_name: "Emily",
    last_name: "Davis",
    email: "emily.davis@example.com",
    phone: "+1234567893",
    rsvp_status: RsvpStatus.ATTENDING,
    rsvp_token: "JKL22222",
    plus_one_allowed: false,
    invitation_sent_at: new Date("2024-01-15").toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "guest-005" as UUID,
    event_id: "demo-event-001" as UUID,
    first_name: "Robert",
    last_name: "Wilson",
    email: "robert.w@example.com",
    phone: "+1234567894",
    rsvp_status: RsvpStatus.ATTENDING,
    rsvp_token: "MNO33333",
    plus_one_allowed: false,
    invitation_sent_at: new Date("2024-01-16").toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "guest-006" as UUID,
    event_id: "demo-event-001" as UUID,
    first_name: "Sarah",
    last_name: "Martinez",
    email: "sarah.m@example.com",
    phone: "+1234567895",
    rsvp_status: RsvpStatus.ATTENDING,
    rsvp_token: "PQR44444",
    plus_one_allowed: true,
    invitation_sent_at: new Date("2024-01-16").toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "guest-007" as UUID,
    event_id: "demo-event-001" as UUID,
    first_name: "David",
    last_name: "Anderson",
    email: "david.a@example.com",
    phone: "+1234567896",
    rsvp_status: RsvpStatus.ATTENDING,
    rsvp_token: "STU55555",
    plus_one_allowed: false,
    invitation_sent_at: new Date("2024-01-17").toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "guest-008" as UUID,
    event_id: "demo-event-001" as UUID,
    first_name: "Lisa",
    last_name: "Taylor",
    email: "lisa.t@example.com",
    phone: "+1234567897",
    rsvp_status: RsvpStatus.ATTENDING,
    rsvp_token: "VWX66666",
    plus_one_allowed: false,
    invitation_sent_at: new Date("2024-01-17").toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "guest-009" as UUID,
    event_id: "demo-event-001" as UUID,
    first_name: "James",
    last_name: "Thomas",
    email: "james.t@example.com",
    phone: "+1234567898",
    rsvp_status: RsvpStatus.ATTENDING,
    rsvp_token: "YZA77777",
    plus_one_allowed: false,
    invitation_sent_at: new Date("2024-01-18").toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "guest-010" as UUID,
    event_id: "demo-event-001" as UUID,
    first_name: "Jessica",
    last_name: "Moore",
    email: "jessica.m@example.com",
    phone: "+1234567899",
    rsvp_status: RsvpStatus.ATTENDING,
    rsvp_token: "BCD88888",
    plus_one_allowed: true,
    invitation_sent_at: new Date("2024-01-18").toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Pending guests (won't show in unseated list by default)
  {
    id: "guest-011" as UUID,
    event_id: "demo-event-001" as UUID,
    first_name: "Mark",
    last_name: "Garcia",
    email: "mark.g@example.com",
    rsvp_status: RsvpStatus.PENDING,
    rsvp_token: "EFG99999",
    plus_one_allowed: false,
    invitation_sent_at: new Date("2024-01-19").toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "guest-012" as UUID,
    event_id: "demo-event-001" as UUID,
    first_name: "Amanda",
    last_name: "Lee",
    email: "amanda.l@example.com",
    rsvp_status: RsvpStatus.PENDING,
    rsvp_token: "HIJ00000",
    plus_one_allowed: false,
    invitation_sent_at: new Date("2024-01-19").toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// ============================================================================
// Mock Data - Seating Chart & Tables
// ============================================================================

const MOCK_TABLES: TableLayout[] = [
  // Table 1 - Round (8 capacity)
  {
    id: "table-001" as UUID,
    seating_chart_id: "demo-chart-001" as UUID,
    table_number: "1",
    table_type: TableType.ROUND,
    x_position: 200,
    y_position: 200,
    width: 120,
    height: 120,
    rotation: 0,
    capacity: 8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Table 2 - Round (6 capacity)
  {
    id: "table-002" as UUID,
    seating_chart_id: "demo-chart-001" as UUID,
    table_number: "2",
    table_type: TableType.ROUND,
    x_position: 450,
    y_position: 200,
    width: 100,
    height: 100,
    rotation: 0,
    capacity: 6,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Table 3 - Rectangular (10 capacity)
  {
    id: "table-003" as UUID,
    seating_chart_id: "demo-chart-001" as UUID,
    table_number: "3",
    table_type: TableType.RECTANGULAR,
    x_position: 200,
    y_position: 400,
    width: 200,
    height: 100,
    rotation: 0,
    capacity: 10,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Table 4 - Square (4 capacity)
  {
    id: "table-004" as UUID,
    seating_chart_id: "demo-chart-001" as UUID,
    table_number: "4",
    table_type: TableType.SQUARE,
    x_position: 650,
    y_position: 200,
    width: 100,
    height: 100,
    rotation: 0,
    capacity: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const MOCK_SEATING_CHART: SeatingChartWithTables = {
  id: "demo-chart-001" as UUID,
  event_id: "demo-event-001" as UUID,
  name: "Wedding Reception Layout",
  venue_width: 1000,
  venue_height: 700,
  venue_unit: VenueUnit.FEET,
  version: 1,
  is_active: true,
  tables: MOCK_TABLES,
  total_tables: MOCK_TABLES.length,
  total_capacity: MOCK_TABLES.reduce((sum, t) => sum + t.capacity, 0),
  total_assigned: 0, // Will be calculated in ClientOnlyDemo
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// ============================================================================
// Component
// ============================================================================

export default function GuestAssignmentDemo() {
  return (
    <ClientOnlyDemo
      seatingChart={MOCK_SEATING_CHART}
      tables={MOCK_TABLES}
      guests={MOCK_GUESTS}
    />
  );
}
