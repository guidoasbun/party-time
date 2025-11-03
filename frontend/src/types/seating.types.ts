/**
 * Seating chart model types
 *
 * FR-21: The system shall provide an interactive seating chart interface
 * Phase 6.1.1 Seating Chart Data Models
 */

import { UUID, Timestamps } from "./common.types";
import { GuestSummary } from "./guest.types";

// ============================================================================
// Enums matching backend
// ============================================================================

export enum TableType {
  ROUND = "round",
  RECTANGULAR = "rectangular",
  SQUARE = "square",
  CUSTOM = "custom",
}

export enum VenueUnit {
  METERS = "meters",
  FEET = "feet",
}

// ============================================================================
// Seating Chart Types
// ============================================================================

export interface SeatingChartBase {
  name: string;
  venue_width: number;
  venue_height: number;
  venue_unit: VenueUnit;
  background_image_url?: string;
  chart_metadata?: Record<string, unknown>;
}

export interface SeatingChartCreate extends SeatingChartBase {
  event_id: UUID;
  version?: number;
  is_active?: boolean;
}

export interface SeatingChartUpdate {
  name?: string;
  venue_width?: number;
  venue_height?: number;
  venue_unit?: VenueUnit;
  background_image_url?: string;
  version?: number;
  is_active?: boolean;
  chart_metadata?: Record<string, unknown>;
}

export interface SeatingChart extends SeatingChartBase, Timestamps {
  id: UUID;
  event_id: UUID;
  version: number;
  is_active: boolean;
}

// ============================================================================
// Table Layout Types
// ============================================================================

export interface TableLayoutBase {
  table_number: string;
  table_type: TableType;
  x_position: number;
  y_position: number;
  width: number;
  height: number;
  rotation: number;
  capacity: number;
  table_metadata?: Record<string, unknown>;
}

export interface TableLayoutCreate extends TableLayoutBase {
  seating_chart_id: UUID;
}

export interface TableLayoutUpdate {
  table_number?: string;
  table_type?: TableType;
  x_position?: number;
  y_position?: number;
  width?: number;
  height?: number;
  rotation?: number;
  capacity?: number;
  table_metadata?: Record<string, unknown>;
}

export interface TableLayout extends TableLayoutBase, Timestamps {
  id: UUID;
  seating_chart_id: UUID;
}

// ============================================================================
// Seat Assignment Types
// ============================================================================

export interface SeatAssignmentBase {
  seat_number: number;
  seat_position?: Record<string, unknown>;
  notes?: string;
}

export interface SeatAssignmentCreate extends SeatAssignmentBase {
  table_layout_id: UUID;
  guest_id?: UUID;
}

export interface SeatAssignmentUpdate {
  guest_id?: UUID;
  seat_number?: number;
  seat_position?: Record<string, unknown>;
  notes?: string;
}

export interface SeatAssignment extends SeatAssignmentBase, Timestamps {
  id: UUID;
  table_layout_id: UUID;
  guest_id?: UUID;
}

// ============================================================================
// Composite/Summary Types
// ============================================================================

export interface SeatAssignmentWithGuest extends SeatAssignment {
  guest_name?: string;
  guest_email?: string;
  guest_rsvp_status?: string;
}

export interface TableLayoutWithSeats extends TableLayout {
  seat_assignments: SeatAssignment[];
  assigned_count: number;
  empty_seats: number;
}

export interface SeatingChartWithTables extends SeatingChart {
  tables: TableLayout[];
  total_tables: number;
  total_capacity: number;
  total_assigned: number;
}

export interface SeatingChartSummary extends Timestamps {
  id: UUID;
  event_id: UUID;
  name: string;
  version: number;
  is_active: boolean;
  total_tables: number;
  total_capacity: number;
  total_assigned: number;
}

// ============================================================================
// Bulk Operation Types
// ============================================================================

export interface BulkTableCreate {
  seating_chart_id: UUID;
  tables: TableLayoutBase[];
}

export interface BulkSeatAssignmentCreate {
  table_layout_id: UUID;
  assignments: SeatAssignmentBase[];
}

export interface AutoAssignRequest {
  seating_chart_id: UUID;
  guest_ids: UUID[];
  strategy?: "fill_tables" | "distribute" | "custom";
  preferences?: Record<string, unknown>;
}

// ============================================================================
// UI-Specific Types (for canvas interactions)
// ============================================================================

export interface CanvasPosition {
  x: number;
  y: number;
}

export interface CanvasDimensions {
  width: number;
  height: number;
}

export interface TableLayoutCanvas extends TableLayout {
  selected?: boolean;
  isDragging?: boolean;
  isResizing?: boolean;
}

export interface SeatPosition {
  angle?: number; // Angle around table (0-360 degrees)
  distance?: number; // Distance from table center
  x?: number; // Absolute x coordinate
  y?: number; // Absolute y coordinate
}

export interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  draggedTableId?: UUID;
}

export interface SelectionState {
  selectedTableIds: UUID[];
  selectedSeatIds: UUID[];
  selectionMode: "single" | "multiple";
}

export interface ZoomState {
  scale: number; // 0.1 to 5.0
  offsetX: number;
  offsetY: number;
}

// ============================================================================
// Form Types (for seating chart editor)
// ============================================================================

export interface SeatingChartFormData extends SeatingChartBase {
  event_id?: UUID;
}

export interface TableFormData extends TableLayoutBase {
  seating_chart_id?: UUID;
}

export interface SeatAssignmentFormData extends SeatAssignmentBase {
  table_layout_id?: UUID;
  guest?: GuestSummary;
}

// ============================================================================
// API Query/Filter Types
// ============================================================================

export interface SeatingChartFilters {
  event_id?: UUID;
  is_active?: boolean;
  version?: number;
}

export interface TableLayoutFilters {
  seating_chart_id?: UUID;
  table_type?: TableType;
  table_number?: string;
}

export interface SeatAssignmentFilters {
  table_layout_id?: UUID;
  guest_id?: UUID;
  assigned?: boolean; // true = has guest_id, false = no guest_id
}

// ============================================================================
// Validation Error Types
// ============================================================================

export interface SeatingValidationError {
  field: string;
  message: string;
  type: "capacity" | "overlap" | "bounds" | "assignment" | "general";
}

export interface TableOverlapError extends SeatingValidationError {
  type: "overlap";
  table_id: UUID;
  overlapping_table_id: UUID;
}

export interface CapacityError extends SeatingValidationError {
  type: "capacity";
  table_id: UUID;
  current_capacity: number;
  max_capacity: number;
}

// ============================================================================
// Export/Import Types
// ============================================================================

export interface SeatingChartExport {
  seating_chart: SeatingChart;
  tables: TableLayout[];
  seat_assignments: SeatAssignment[];
  export_date: string;
  version: string;
}

export interface SeatingChartImport {
  seating_chart: SeatingChartCreate;
  tables: TableLayoutBase[];
  seat_assignments: SeatAssignmentBase[];
}

// ============================================================================
// Statistics Types
// ============================================================================

export interface SeatingStatistics {
  total_tables: number;
  total_capacity: number;
  total_assigned: number;
  total_unassigned: number;
  assignment_percentage: number;
  tables_by_type: Record<TableType, number>;
  average_table_size: number;
  largest_table: number;
  smallest_table: number;
}

export interface TableStatistics {
  table_id: UUID;
  table_number: string;
  capacity: number;
  assigned: number;
  empty: number;
  fill_percentage: number;
  guest_names: string[];
}
