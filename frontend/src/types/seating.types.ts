/**
 * Seating chart model types
 *
 * FR-21: The system shall provide an interactive seating chart interface
 * Phase 6.1.1 Seating Chart Data Models
 * Phase 6.2.2 Venue Layout Integration
 */

import { UUID, Timestamps } from "./common.types";
import { GuestSummary } from "./guest.types";
import type { VenueMetadata } from "./venue.types";

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
  // Phase 6.2.2: Venue Layout Integration
  venue_metadata?: VenueMetadata; // Parsed from chart_metadata JSONB
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
  strategy?: "fill_tables" | "distribute" | "custom" | "smart";
  preferences?: Record<string, unknown>;
}

// ============================================================================
// Smart Seating Types (Phase 6.2.1)
// ============================================================================
// FR-21: The system shall provide an interactive seating chart interface
// Phase 6.2.1 Smart Seating Features
export interface SmartAssignPreferences {
  prioritize_dietary: boolean;
  weight_dietary: number; // 0.0-1.0
  keep_plus_ones_together: boolean;
  group_by_organization: boolean;
  weight_organization: number; // 0.0-1.0
  group_families: boolean;
  weight_family: number; // 0.0-1.0
  cluster_meal_preferences: boolean;
  weight_meal: number; // 0.0-1.0
  balance_tables: boolean;
}

export interface SuggestionScore {
  guest_id: UUID;
  guest_name: string;
  table_id: UUID;
  table_number: string;
  seat_number: number;
  total_score: number; // 0.0-1.0
  breakdown: Record<string, number>; // e.g., { dietary: 0.8, organization: 0.6 }
  reasoning: string[]; // Human-readable explanations
  confidence: "high" | "medium" | "low";
}

export interface SmartAssignRequest {
  seating_chart_id: UUID;
  guest_ids: UUID[];
  strategy: "smart";
  preferences?: SmartAssignPreferences;
}

export interface SmartAssignResponse {
  seating_chart_id: UUID;
  strategy: string;
  total_guests: number;
  already_assigned: number;
  newly_assigned: number;
  total_capacity: number;
  remaining_capacity: number;
  assignments: Array<{
    guest_id: string;
    guest_name: string;
    table_id: string;
    table_number: string;
    seat_number: number;
  }>;
  suggestions: SuggestionScore[];
  statistics: SmartSeatingStatistics;
}

export interface SmartSeatingStatistics {
  avg_confidence_score: number;
  confidence_distribution: {
    high: number;
    medium: number;
    low: number;
  };
  dietary_groups_formed: number;
  families_seated_together: number;
  plus_ones_paired: number;
  organization_clusters: number;
  total_suggestions: number;
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

// FR-21: The system shall provide an interactive seating chart interface.
// Phase 6.2.4: Mobile & Tablet Views
// ============================================================================
// Mobile & Tablet View Types (Phase 6.2.4)
// ============================================================================

export interface GuestSearchResult {
  guest_id: UUID;
  guest_name: string;
  table_id?: UUID;
  table_number?: string;
  seat_number?: number;
  is_seated: boolean;
}

export interface FindMySeatProps {
  seatingChart: SeatingChartWithTables;
  guests: Array<{
    id: UUID;
    first_name: string;
    last_name: string;
    email: string;
  }>;
  onGuestFound?: (result: GuestSearchResult) => void;
  onHighlightTable?: (tableId: UUID | null) => void;
  className?: string;
}

export interface MobileSeatingViewProps {
  seatingChart: SeatingChartWithTables;
  tables: TableLayout[];
  guests?: Array<{
    id: UUID;
    first_name: string;
    last_name: string;
    email: string;
  }>;
  readOnly?: boolean;
  showFindMySeat?: boolean;
  className?: string;
  theme?: "light" | "dark";
}

export interface TouchGestureState {
  isPinching: boolean;
  initialDistance: number;
  initialScale: number;
  touchStartX: number;
  touchStartY: number;
}

// ============================================================================
// Phase 6.2.5: Seating Chart Polish & Integration Types
/*
 * FR-21: The system shall provide an interactive seating chart interface.
 * Phase 6.2.5: Seating Chart Polish & Integration
 */
// ============================================================================

// Autosave types
export type SaveStatus = "saved" | "saving" | "unsaved" | "error";

export interface AutosaveState {
  status: SaveStatus;
  lastSaved: Date | null;
  error?: string;
}

// History types
export type HistoryActionType =
  | "table_add"
  | "table_delete"
  | "table_move"
  | "table_resize"
  | "table_rotate"
  | "table_update"
  | "guest_assign"
  | "guest_unassign"
  | "bulk_operation";

export interface HistoryAction<T = unknown> {
  id: string;
  type: HistoryActionType;
  timestamp: Date;
  data: T; // Current state
  inverseData?: T; // State to restore for undo
}

export interface HistoryState {
  undoStack: HistoryAction[];
  redoStack: HistoryAction[];
  maxSize: number;
}

// Keyboard shortcut types
export type ShortcutCategory =
  | "canvas"
  | "table"
  | "guest"
  | "navigation"
  | "general";

export interface KeyboardShortcut {
  key: string;
  modifiers?: ("ctrl" | "shift" | "alt" | "meta")[];
  label: string;
  description: string;
  category: ShortcutCategory;
}

// Hook return types
export interface UseSeatingChartReturn {
  // Data
  chart: SeatingChartWithTables | null;
  tables: TableLayout[];
  seatAssignments: SeatAssignment[];
  statistics: SeatingStatistics | null;

  // State
  selectedTableId: UUID | null;
  isLoading: boolean;
  error: Error | null;

  // Autosave
  saveStatus: SaveStatus;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;

  // History
  canUndo: boolean;
  canRedo: boolean;

  // Methods
  save: () => Promise<void>;
  undo: () => void;
  redo: () => void;
  selectTable: (tableId: UUID | null) => void;
  refetch: () => Promise<void>;
  updateTable: (tableId: UUID, updates: TableLayoutUpdate) => Promise<void>;
  deleteTable: (tableId: UUID) => Promise<void>;
  assignGuest: (
    tableId: UUID,
    guestId: UUID,
    seatNumber: number
  ) => Promise<void>;
  unassignSeat: (seatId: UUID) => Promise<void>;
  createTable: (tableData: Omit<TableLayoutCreate, 'seating_chart_id'>) => Promise<TableLayout>;
  bulkCreateTables: (tables: Omit<TableLayoutCreate, 'seating_chart_id'>[]) => Promise<TableLayout[]>;
  updateChart: (updates: SeatingChartUpdate) => Promise<SeatingChart>;
}

export interface UseSeatingHistoryReturn {
  // State
  canUndo: boolean;
  canRedo: boolean;
  undoCount: number;
  redoCount: number;

  // Methods
  undo: () => HistoryAction | null;
  redo: () => HistoryAction | null;
  recordAction: (action: Omit<HistoryAction, "id" | "timestamp">) => void;
  clearHistory: () => void;
  getHistory: () => HistoryState;
}
