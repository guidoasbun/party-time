/**
 * Seating chart service module
 *
 * FR-21: Interactive seating chart interface
 * Phase 6.1.2: Seating Chart API Endpoints
 * Phase 6.1.3: Fabric.js Canvas Setup
 */

import { api, withRetry } from "@/lib/api-client";
import {
  UUID,
  API_ENDPOINTS,
  SeatingChart,
  SeatingChartCreate,
  SeatingChartUpdate,
  SeatingChartWithTables,
  TableLayout,
  TableLayoutCreate,
  TableLayoutUpdate,
  TableLayoutWithSeats,
  SeatAssignment,
  SeatAssignmentCreate,
  SeatAssignmentUpdate,
  BulkTableCreate,
  AutoAssignRequest,
  SeatingStatistics,
} from "@/types";

/**
 * Seating chart service class with typed methods
 */
export class SeatingService {
  // ============================================================================
  // Seating Chart Methods
  // ============================================================================

  /**
   * Create a new seating chart for an event
   */
  async createSeatingChart(
    eventId: UUID,
    data: SeatingChartCreate
  ): Promise<SeatingChart> {
    return api.post<SeatingChart, SeatingChartCreate>(
      API_ENDPOINTS.SEATING.CREATE(eventId),
      data,
      withRetry({ attempts: 2 })
    );
  }

  /**
   * Get a seating chart with all tables
   */
  async getSeatingChart(
    eventId: UUID,
    chartId: UUID
  ): Promise<SeatingChartWithTables> {
    return api.get<SeatingChartWithTables>(
      API_ENDPOINTS.SEATING.GET_CHART(eventId, chartId),
      undefined,
      withRetry({ attempts: 2 })
    );
  }

  /**
   * Update a seating chart
   */
  async updateSeatingChart(
    eventId: UUID,
    chartId: UUID,
    data: SeatingChartUpdate
  ): Promise<SeatingChart> {
    return api.put<SeatingChart, SeatingChartUpdate>(
      API_ENDPOINTS.SEATING.UPDATE_CHART(eventId, chartId),
      data
    );
  }

  /**
   * Delete a seating chart
   */
  async deleteSeatingChart(eventId: UUID, chartId: UUID): Promise<void> {
    return api.delete(API_ENDPOINTS.SEATING.DELETE_CHART(eventId, chartId));
  }

  // ============================================================================
  // Table Layout Methods
  // ============================================================================

  /**
   * Create a new table in the seating chart
   */
  async createTable(
    eventId: UUID,
    chartId: UUID,
    data: TableLayoutCreate
  ): Promise<TableLayout> {
    return api.post<TableLayout, TableLayoutCreate>(
      API_ENDPOINTS.SEATING.CREATE_TABLE(eventId, chartId),
      data
    );
  }

  /**
   * Bulk create multiple tables
   */
  async bulkCreateTables(
    eventId: UUID,
    chartId: UUID,
    data: BulkTableCreate
  ): Promise<TableLayout[]> {
    return api.post<TableLayout[], BulkTableCreate>(
      API_ENDPOINTS.SEATING.BULK_CREATE_TABLES(eventId, chartId),
      data
    );
  }

  /**
   * Get a specific table with seat assignments
   */
  async getTable(
    eventId: UUID,
    chartId: UUID,
    tableId: UUID
  ): Promise<TableLayoutWithSeats> {
    return api.get<TableLayoutWithSeats>(
      API_ENDPOINTS.SEATING.GET_TABLE(eventId, chartId, tableId),
      undefined,
      withRetry({ attempts: 2 })
    );
  }

  /**
   * Update a table's properties
   */
  async updateTable(
    eventId: UUID,
    chartId: UUID,
    tableId: UUID,
    data: TableLayoutUpdate
  ): Promise<TableLayout> {
    return api.put<TableLayout, TableLayoutUpdate>(
      API_ENDPOINTS.SEATING.UPDATE_TABLE(eventId, chartId, tableId),
      data
    );
  }

  /**
   * Update table position (optimized for frequent canvas updates)
   */
  async updateTablePosition(
    eventId: UUID,
    chartId: UUID,
    tableId: UUID,
    x: number,
    y: number
  ): Promise<TableLayout> {
    return this.updateTable(eventId, chartId, tableId, {
      x_position: x,
      y_position: y,
    });
  }

  /**
   * Update table rotation
   */
  async updateTableRotation(
    eventId: UUID,
    chartId: UUID,
    tableId: UUID,
    rotation: number
  ): Promise<TableLayout> {
    return this.updateTable(eventId, chartId, tableId, {
      rotation,
    });
  }

  /**
   * Update table dimensions
   */
  async updateTableDimensions(
    eventId: UUID,
    chartId: UUID,
    tableId: UUID,
    width: number,
    height: number
  ): Promise<TableLayout> {
    return this.updateTable(eventId, chartId, tableId, {
      width,
      height,
    });
  }

  /**
   * Delete a table
   */
  async deleteTable(
    eventId: UUID,
    chartId: UUID,
    tableId: UUID
  ): Promise<void> {
    return api.delete(
      API_ENDPOINTS.SEATING.DELETE_TABLE(eventId, chartId, tableId)
    );
  }

  // ============================================================================
  // Seat Assignment Methods
  // ============================================================================

  /**
   * Assign a guest to a seat
   */
  async assignSeat(
    eventId: UUID,
    chartId: UUID,
    tableId: UUID,
    data: SeatAssignmentCreate
  ): Promise<SeatAssignment> {
    return api.post<SeatAssignment, SeatAssignmentCreate>(
      API_ENDPOINTS.SEATING.ASSIGN_SEAT(eventId, chartId, tableId),
      data
    );
  }

  /**
   * Update a seat assignment
   */
  async updateSeatAssignment(
    eventId: UUID,
    chartId: UUID,
    seatId: UUID,
    data: SeatAssignmentUpdate
  ): Promise<SeatAssignment> {
    return api.put<SeatAssignment, SeatAssignmentUpdate>(
      API_ENDPOINTS.SEATING.UPDATE_SEAT(eventId, chartId, seatId),
      data
    );
  }

  /**
   * Remove a guest from a seat
   */
  async removeSeatAssignment(
    eventId: UUID,
    chartId: UUID,
    seatId: UUID
  ): Promise<void> {
    return api.delete(
      API_ENDPOINTS.SEATING.DELETE_SEAT(eventId, chartId, seatId)
    );
  }

  // ============================================================================
  // Advanced Operations
  // ============================================================================

  /**
   * Auto-assign guests to tables
   */
  async autoAssignGuests(
    eventId: UUID,
    chartId: UUID,
    data: AutoAssignRequest
  ): Promise<SeatAssignment[]> {
    return api.post<SeatAssignment[], AutoAssignRequest>(
      API_ENDPOINTS.SEATING.AUTO_ASSIGN(eventId, chartId),
      data
    );
  }

  /**
   * Get seating statistics
   */
  async getStatistics(
    eventId: UUID,
    chartId: UUID
  ): Promise<SeatingStatistics> {
    return api.get<SeatingStatistics>(
      API_ENDPOINTS.SEATING.STATISTICS(eventId, chartId),
      undefined,
      withRetry({ attempts: 2 })
    );
  }
}

/**
 * Singleton instance of the seating service
 */
export const seatingService = new SeatingService();
