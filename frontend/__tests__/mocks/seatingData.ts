/**
 * Mock data factories for seating chart testing
 * Phase 8.1: Comprehensive Testing Backfill
 */

import type {
  SeatingChart,
  SeatingChartWithTables,
  TableLayout,
  TableLayoutWithSeats,
  SeatAssignment,
  SeatAssignmentWithGuest,
  SeatingStatistics,
  TableStatistics,
  SeatingChartSummary,
} from '@/types/seating.types'

import { TableType as TableTypeEnum, VenueUnit as VenueUnitEnum } from '@/types/seating.types'

// Seating chart factory
export const createMockSeatingChart = (
  overrides: Partial<SeatingChart> = {}
): SeatingChart => ({
  id: 'chart-1',
  event_id: 'event-1',
  name: 'Main Reception Hall',
  venue_width: 1200,
  venue_height: 800,
  venue_unit: VenueUnitEnum.FEET,
  background_image_url: undefined,
  chart_metadata: undefined,
  version: 1,
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-15T00:00:00Z',
  ...overrides,
})

// Table layout factory
export const createMockTableLayout = (
  overrides: Partial<TableLayout> = {}
): TableLayout => ({
  id: 'table-1',
  seating_chart_id: 'chart-1',
  table_number: '1',
  table_type: TableTypeEnum.ROUND,
  x_position: 200,
  y_position: 200,
  width: 120,
  height: 120,
  rotation: 0,
  capacity: 8,
  table_metadata: undefined,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-15T00:00:00Z',
  ...overrides,
})

// Seat assignment factory
export const createMockSeatAssignment = (
  overrides: Partial<SeatAssignment> = {}
): SeatAssignment => ({
  id: 'seat-1',
  table_layout_id: 'table-1',
  guest_id: 'guest-1',
  seat_number: 1,
  seat_position: { angle: 0, distance: 60 },
  notes: undefined,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-15T00:00:00Z',
  ...overrides,
})

// Seat assignment with guest info factory
export const createMockSeatAssignmentWithGuest = (
  overrides: Partial<SeatAssignmentWithGuest> = {}
): SeatAssignmentWithGuest => ({
  ...createMockSeatAssignment(),
  guest_name: 'John Doe',
  guest_email: 'john@example.com',
  guest_rsvp_status: 'attending',
  ...overrides,
})

// Table layout with seats factory
export const createMockTableLayoutWithSeats = (
  overrides: Partial<TableLayoutWithSeats> = {}
): TableLayoutWithSeats => ({
  ...createMockTableLayout(),
  seat_assignments: [
    createMockSeatAssignment({ id: 'seat-1', seat_number: 1, guest_id: 'guest-1' }),
    createMockSeatAssignment({ id: 'seat-2', seat_number: 2, guest_id: 'guest-2' }),
    createMockSeatAssignment({ id: 'seat-3', seat_number: 3, guest_id: undefined }),
    createMockSeatAssignment({ id: 'seat-4', seat_number: 4, guest_id: undefined }),
  ],
  assigned_count: 2,
  empty_seats: 6,
  ...overrides,
})

// Seating chart with tables factory
export const createMockSeatingChartWithTables = (
  overrides: Partial<SeatingChartWithTables> = {}
): SeatingChartWithTables => ({
  ...createMockSeatingChart(),
  tables: [
    createMockTableLayout({
      id: 'table-1',
      table_number: '1',
      x_position: 200,
      y_position: 200,
    }),
    createMockTableLayout({
      id: 'table-2',
      table_number: '2',
      x_position: 400,
      y_position: 200,
    }),
    createMockTableLayout({
      id: 'table-3',
      table_number: '3',
      x_position: 300,
      y_position: 400,
      table_type: TableTypeEnum.RECTANGULAR,
      width: 180,
      height: 90,
      capacity: 10,
    }),
  ],
  total_tables: 3,
  total_capacity: 26,
  total_assigned: 12,
  venue_metadata: undefined,
  ...overrides,
})

// Seating chart summary factory
export const createMockSeatingChartSummary = (
  overrides: Partial<SeatingChartSummary> = {}
): SeatingChartSummary => ({
  id: 'chart-1',
  event_id: 'event-1',
  name: 'Main Reception Hall',
  version: 1,
  is_active: true,
  total_tables: 10,
  total_capacity: 80,
  total_assigned: 65,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-15T00:00:00Z',
  ...overrides,
})

// Seating statistics factory
export const createMockSeatingStatistics = (
  overrides: Partial<SeatingStatistics> = {}
): SeatingStatistics => ({
  total_tables: 10,
  total_capacity: 80,
  total_assigned: 65,
  total_unassigned: 15,
  assignment_percentage: 81.25,
  tables_by_type: {
    [TableTypeEnum.ROUND]: 6,
    [TableTypeEnum.RECTANGULAR]: 3,
    [TableTypeEnum.SQUARE]: 1,
    [TableTypeEnum.CUSTOM]: 0,
  },
  average_table_size: 8,
  largest_table: 12,
  smallest_table: 4,
  ...overrides,
})

// Table statistics factory
export const createMockTableStatistics = (
  overrides: Partial<TableStatistics> = {}
): TableStatistics => ({
  table_id: 'table-1',
  table_number: '1',
  capacity: 8,
  assigned: 6,
  empty: 2,
  fill_percentage: 75,
  guest_names: ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Brown', 'Charlie Wilson', 'Diana Lee'],
  ...overrides,
})

// Mock collections
export const mockTables: TableLayout[] = [
  createMockTableLayout({
    id: 'table-1',
    table_number: '1',
    table_type: TableTypeEnum.ROUND,
    x_position: 200,
    y_position: 200,
    capacity: 8,
  }),
  createMockTableLayout({
    id: 'table-2',
    table_number: '2',
    table_type: TableTypeEnum.ROUND,
    x_position: 400,
    y_position: 200,
    capacity: 8,
  }),
  createMockTableLayout({
    id: 'table-3',
    table_number: '3',
    table_type: TableTypeEnum.RECTANGULAR,
    x_position: 300,
    y_position: 400,
    width: 180,
    height: 90,
    capacity: 10,
  }),
  createMockTableLayout({
    id: 'table-4',
    table_number: 'Head Table',
    table_type: TableTypeEnum.RECTANGULAR,
    x_position: 300,
    y_position: 100,
    width: 240,
    height: 60,
    capacity: 6,
  }),
]

export const mockSeatAssignments: SeatAssignment[] = [
  createMockSeatAssignment({ id: 'seat-1', table_layout_id: 'table-1', seat_number: 1, guest_id: 'guest-1' }),
  createMockSeatAssignment({ id: 'seat-2', table_layout_id: 'table-1', seat_number: 2, guest_id: 'guest-2' }),
  createMockSeatAssignment({ id: 'seat-3', table_layout_id: 'table-1', seat_number: 3, guest_id: 'guest-3' }),
  createMockSeatAssignment({ id: 'seat-4', table_layout_id: 'table-2', seat_number: 1, guest_id: 'guest-4' }),
  createMockSeatAssignment({ id: 'seat-5', table_layout_id: 'table-2', seat_number: 2, guest_id: 'guest-5' }),
]

// Empty seating chart (no tables)
export const createEmptySeatingChart = (): SeatingChartWithTables =>
  createMockSeatingChartWithTables({
    tables: [],
    total_tables: 0,
    total_capacity: 0,
    total_assigned: 0,
  })

// Fully assigned seating chart
export const createFullyAssignedSeatingChart = (): SeatingChartWithTables =>
  createMockSeatingChartWithTables({
    total_tables: 10,
    total_capacity: 80,
    total_assigned: 80,
  })

// Different table types for testing
export const createRoundTable = (id: string, tableNumber: string): TableLayout =>
  createMockTableLayout({
    id,
    table_number: tableNumber,
    table_type: TableTypeEnum.ROUND,
    width: 120,
    height: 120,
    capacity: 8,
  })

export const createRectangularTable = (id: string, tableNumber: string): TableLayout =>
  createMockTableLayout({
    id,
    table_number: tableNumber,
    table_type: TableTypeEnum.RECTANGULAR,
    width: 180,
    height: 90,
    capacity: 10,
  })

export const createSquareTable = (id: string, tableNumber: string): TableLayout =>
  createMockTableLayout({
    id,
    table_number: tableNumber,
    table_type: TableTypeEnum.SQUARE,
    width: 100,
    height: 100,
    capacity: 4,
  })

// Chart with venue metadata (floor plan)
export const createChartWithFloorPlan = (): SeatingChartWithTables =>
  createMockSeatingChartWithTables({
    background_image_url: 'https://example.com/floorplan.png',
    venue_metadata: {
      specialAreas: [
        {
          id: 'stage-1',
          type: 'stage' as const,
          label: 'Main Stage',
          x: 100,
          y: 50,
          width: 300,
          height: 100,
          rotation: 0,
          isObstacle: true,
        },
        {
          id: 'dance-1',
          type: 'dance_floor' as const,
          label: 'Dance Floor',
          x: 450,
          y: 300,
          width: 200,
          height: 200,
          rotation: 0,
          isObstacle: false,
        },
      ],
      floorPlanSettings: {
        opacity: 0.5,
        locked: false,
        scale: 1.0,
      },
    },
  })

// Statistics for empty chart
export const createEmptySeatingStatistics = (): SeatingStatistics =>
  createMockSeatingStatistics({
    total_tables: 0,
    total_capacity: 0,
    total_assigned: 0,
    total_unassigned: 0,
    assignment_percentage: 0,
    tables_by_type: {
      [TableTypeEnum.ROUND]: 0,
      [TableTypeEnum.RECTANGULAR]: 0,
      [TableTypeEnum.SQUARE]: 0,
      [TableTypeEnum.CUSTOM]: 0,
    },
    average_table_size: 0,
    largest_table: 0,
    smallest_table: 0,
  })
