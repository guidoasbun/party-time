/**
 * useSeatingChart Hook
 *
 * FR-21: The system shall provide an interactive seating chart interface.
 * Phase 6.2.5: Seating Chart Polish & Integration
 * Unified hook for seating chart state management, data fetching, autosave, and undo/redo
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { seatingService } from "@/lib/api/services";
import { useSeatingHistory } from "./useSeatingHistory";
import type {
  UUID,
  SeatingChartWithTables,
  SeatingStatistics,
  TableLayout,
  SeatAssignment,
  TableLayoutUpdate,
  TableLayoutCreate,
  SeatingChartUpdate,
  SaveStatus,
  UseSeatingChartReturn,
} from "@/types";
import { VenueUnit, TableType } from "@/types";

const AUTOSAVE_DELAY = 30000; // 30 seconds

interface UseSeatingChartOptions {
  eventId: UUID;
  enableAutosave?: boolean;
  autosaveDelay?: number;
}

/**
 * Custom hook for managing seating chart state with autosave and undo/redo
 */
export function useSeatingChart({
  eventId,
  enableAutosave = true,
  autosaveDelay = AUTOSAVE_DELAY,
}: UseSeatingChartOptions): UseSeatingChartReturn {
  const queryClient = useQueryClient();
  const [selectedTableId, setSelectedTableId] = useState<UUID | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Autosave timer ref
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingChangesRef = useRef<boolean>(false);

  // History management
  const history = useSeatingHistory();

  // ============================================================================
  // Data Fetching
  // ============================================================================

  /**
   * Fetch seating chart data
   */
  const {
    data: chart,
    isLoading,
    error,
    refetch: refetchChart,
  } = useQuery({
    queryKey: ["seatingChart", eventId],
    queryFn: async () => {
      try {
        // Try to get existing chart
        const charts = await seatingService.getSeatingChart(eventId);
        return charts;
      } catch (err) {
        // If no chart exists, create one
        // ApiException from api-client.ts has status property
        const apiError = err as { status?: number };
        if (apiError.status === 404) {
          const newChart = await seatingService.createSeatingChart(eventId, {
            event_id: eventId,
            name: "Seating Chart",
            venue_width: 1200,
            venue_height: 800,
            venue_unit: VenueUnit.FEET,
          });
          // When creating a new chart, it won't have tables yet
          return {
            ...newChart,
            tables: [],
            total_tables: 0,
            total_capacity: 0,
            total_assigned: 0,
          } as SeatingChartWithTables;
        }
        throw err;
      }
    },
    staleTime: 30000, // 30 seconds - reduced for more frequent updates
    retry: 1,
  });

  /**
   * Fetch statistics
   */
  const { data: statistics } = useQuery({
    queryKey: ["seatingStatistics", eventId, chart?.id],
    queryFn: async () => {
      if (!chart?.id) return null;
      return await seatingService.getStatistics(eventId, chart.id);
    },
    enabled: !!chart?.id,
    staleTime: 30000, // 30 seconds
  });

  // ============================================================================
  // Mutations
  // ============================================================================

  /**
   * Update table mutation
   */
  const updateTableMutation = useMutation({
    mutationFn: async ({
      tableId,
      updates,
    }: {
      tableId: UUID;
      updates: TableLayoutUpdate;
    }) => {
      if (!chart?.id) throw new Error("No chart loaded");
      return await seatingService.updateTable(
        eventId,
        chart.id,
        tableId,
        updates
      );
    },
    // IMPORTANT: Use onMutate for IMMEDIATE optimistic update before API call
    onMutate: async ({ tableId, updates }) => {
      console.log("🔄 [MUTATION] onMutate called:", { tableId, updates });

      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ["seatingChart", eventId] });

      // Snapshot the previous value for rollback
      const previousData = queryClient.getQueryData<SeatingChartWithTables>([
        "seatingChart",
        eventId,
      ]);

      // Optimistic update - immediately update cache with new position
      queryClient.setQueryData<SeatingChartWithTables>(
        ["seatingChart", eventId],
        (oldData) => {
          if (!oldData) return oldData;

          const oldTable = oldData.tables?.find((t) => t.id === tableId);
          console.log("🔄 [MUTATION] Applying optimistic update to cache:", {
            tableId,
            updates,
            oldTablePosition: oldTable
              ? { x: oldTable.x_position, y: oldTable.y_position }
              : null,
          });

          const newTables = (oldData.tables || []).map((t) =>
            t.id === tableId ? { ...t, ...updates } : t
          );

          const result = {
            ...oldData,
            tables: newTables,
          };

          console.log("🔄 [MUTATION] New cache data:", {
            tableId,
            newPosition: newTables.find((t) => t.id === tableId)
              ? {
                  x: newTables.find((t) => t.id === tableId)!.x_position,
                  y: newTables.find((t) => t.id === tableId)!.y_position,
                }
              : null,
          });

          return result;
        }
      );

      // Return context for rollback
      return { previousData, tableId, updates };
    },
    onSuccess: async (updatedTable, { tableId, updates }, context) => {
      console.log("✅ [MUTATION] onSuccess called:", {
        tableId,
        updates,
        updatedTable,
        serverPosition: updatedTable
          ? {
              x: updatedTable.x_position,
              y: updatedTable.y_position,
            }
          : null,
      });

      // Re-apply our optimistic update to ensure server response doesn't overwrite it
      // This is needed because React Query will replace cache with server response
      queryClient.setQueryData<SeatingChartWithTables>(
        ["seatingChart", eventId],
        (oldData) => {
          if (!oldData) return oldData;
          console.log("✅ [MUTATION] Re-applying update in onSuccess:", {
            tableId,
            updates,
          });

          // Use the updates from our original mutation, not from the server response
          // because the server response is the full table and might have stale position data
          // if another request was in flight
          const newTables = (oldData.tables || []).map((t) =>
            t.id === tableId ? { ...t, ...updates } : t
          );

          return {
            ...oldData,
            tables: newTables,
          };
        }
      );

      // Also invalidate statistics if capacity changed
      if (updates.capacity !== undefined) {
        queryClient.invalidateQueries({
          queryKey: ["seatingStatistics", eventId],
        });
      }
      markUnsavedChanges();
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(
          ["seatingChart", eventId],
          context.previousData
        );
      }
      console.error("Failed to update table:", (error as Error).message);
    },
  });

  /**
   * Delete table mutation
   */
  const deleteTableMutation = useMutation({
    mutationFn: async (tableId: UUID) => {
      if (!chart?.id) throw new Error("No chart loaded");
      return await seatingService.deleteTable(eventId, chart.id, tableId);
    },
    onSuccess: async () => {
      // Clear selection first to prevent any stale state
      setSelectedTableId(null);

      // Invalidate queries to trigger refetch - this is sufficient, no need for manual refetchChart()
      await queryClient.invalidateQueries({
        queryKey: ["seatingChart", eventId],
      });

      // Also invalidate statistics
      await queryClient.invalidateQueries({
        queryKey: ["seatingStatistics", eventId],
      });

      markUnsavedChanges();
    },
    onError: (error) => {
      console.error("Failed to delete table:", (error as Error).message);
    },
  });

  /**
   * Assign guest mutation with optimistic updates
   */
  const assignGuestMutation = useMutation({
    mutationFn: async ({
      tableId,
      guestId,
      seatNumber,
    }: {
      tableId: UUID;
      guestId: UUID;
      seatNumber: number;
    }) => {
      if (!chart?.id) throw new Error("No chart loaded");
      return await seatingService.assignSeat(eventId, chart.id, tableId, {
        table_layout_id: tableId,
        guest_id: guestId,
        seat_number: seatNumber,
      });
    },

    /**
     * FR-21: The system shall provide an interactive seating chart interface
     * Phase 6.3.5: Drag and Drop Assignments
     */
    onMutate: async ({ tableId, guestId, seatNumber }) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["seatingChart", eventId] });

      // Snapshot the previous value
      const previousChart = queryClient.getQueryData<SeatingChartWithTables>([
        "seatingChart",
        eventId,
      ]);

      // Optimistically update the cache
      if (previousChart) {
        const optimisticAssignment: SeatAssignment = {
          id: `temp-${Date.now()}` as UUID, // Temporary ID
          table_layout_id: tableId,
          guest_id: guestId,
          seat_number: seatNumber,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const updatedChart = {
          ...previousChart,
          tables: previousChart.tables.map((table) => {
            if (table.id === tableId && "seat_assignments" in table) {
              const tableWithSeats = table as typeof table & {
                seat_assignments: SeatAssignment[];
              };
              return {
                ...tableWithSeats,
                seat_assignments: [
                  ...tableWithSeats.seat_assignments,
                  optimisticAssignment,
                ],
              };
            }
            return table;
          }),
        };

        queryClient.setQueryData(["seatingChart", eventId], updatedChart);
      }

      // Return context with snapshot for rollback
      return { previousChart };
    },
    onError: (error, _variables, context) => {
      console.error("Failed to assign guest:", (error as Error).message);
      // Rollback to the previous value on error
      if (context?.previousChart) {
        queryClient.setQueryData(
          ["seatingChart", eventId],
          context.previousChart
        );
      }
    },
    onSuccess: () => {
      // Invalidate to get the real data from server
      queryClient.invalidateQueries({ queryKey: ["seatingChart", eventId] });
      queryClient.invalidateQueries({
        queryKey: ["seatingStatistics", eventId],
      });
      markUnsavedChanges();
      console.log("Guest assigned");
    },
  });

  /**
   * Unassign seat mutation
   */
  const unassignSeatMutation = useMutation({
    mutationFn: async (seatId: UUID) => {
      if (!chart?.id) throw new Error("No chart loaded");
      return await seatingService.removeSeatAssignment(
        eventId,
        chart.id,
        seatId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seatingChart", eventId] });
      queryClient.invalidateQueries({
        queryKey: ["seatingStatistics", eventId],
      });
      markUnsavedChanges();
    },
    onError: (error) => {
      console.error("Failed to unassign seat:", (error as Error).message);
    },
  });

  /**
   * Create table mutation
   */
  const createTableMutation = useMutation({
    mutationFn: async (
      tableData: Omit<TableLayoutCreate, "seating_chart_id">
    ) => {
      if (!chart?.id) throw new Error("No chart loaded");
      return await seatingService.createTable(eventId, chart.id, {
        ...tableData,
        seating_chart_id: chart.id,
      });
    },
    onSuccess: async (newTable) => {
      // Invalidate and refetch the chart to get fresh data from backend
      await queryClient.invalidateQueries({
        queryKey: ["seatingChart", eventId],
      });
      await refetchChart();

      // Also invalidate statistics
      queryClient.invalidateQueries({
        queryKey: ["seatingStatistics", eventId],
      });
      markUnsavedChanges();
    },
    onError: (error) => {
      console.error("Failed to create table:", (error as Error).message);
    },
  });

  /**
   * Bulk create tables mutation
   */
  const bulkCreateTablesMutation = useMutation({
    mutationFn: async (
      tables: Omit<TableLayoutCreate, "seating_chart_id">[]
    ) => {
      if (!chart?.id) throw new Error("No chart loaded");
      return await seatingService.bulkCreateTables(eventId, chart.id, {
        seating_chart_id: chart.id,
        tables: tables as any[], // TableLayoutBase[]
      });
    },
    onSuccess: async (newTables) => {
      // Invalidate and refetch the chart to get fresh data from backend
      await queryClient.invalidateQueries({
        queryKey: ["seatingChart", eventId],
      });
      await refetchChart();

      // Also invalidate statistics
      queryClient.invalidateQueries({
        queryKey: ["seatingStatistics", eventId],
      });
      markUnsavedChanges();
    },
    onError: (error) => {
      console.error("Failed to create tables:", (error as Error).message);
    },
  });

  /**
   * Update chart mutation (for venue metadata)
   */
  const updateChartMutation = useMutation({
    mutationFn: async (updates: SeatingChartUpdate) => {
      if (!chart?.id) throw new Error("No chart loaded");
      return await seatingService.updateSeatingChart(
        eventId,
        chart.id,
        updates
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seatingChart", eventId] });
      markUnsavedChanges();
    },
    onError: (error) => {
      console.error("Failed to update chart:", (error as Error).message);
    },
  });

  // ============================================================================
  // Autosave Logic
  // ============================================================================

  /**
   * Mark that there are unsaved changes and trigger autosave
   */
  const markUnsavedChanges = useCallback(() => {
    setHasUnsavedChanges(true);
    setSaveStatus("unsaved");
    pendingChangesRef.current = true;

    if (!enableAutosave) return;

    // Clear existing timer
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    // Set new autosave timer
    autosaveTimerRef.current = setTimeout(() => {
      if (pendingChangesRef.current) {
        save();
      }
    }, autosaveDelay);
  }, [enableAutosave, autosaveDelay]);

  /**
   * Manual save function
   *
   * Note: Changes are automatically saved to the server via individual mutations
   * (createTable, updateTable, deleteTable, etc.). This function just acknowledges
   * the save and updates the UI state. We do NOT refetch here because that would
   * overwrite the optimistic updates in the cache with potentially stale server data.
   */
  const save = useCallback(async () => {
    if (!chart?.id || !pendingChangesRef.current) return;

    setSaveStatus("saving");

    try {
      // All changes are already saved via mutations (optimistic updates + API calls)
      // Just acknowledge the save without refetching
      //
      // If we need to ensure the server has the latest data, we could add
      // a dedicated "sync" endpoint in the future, but for now we trust
      // that the individual mutations have saved the data correctly.

      setHasUnsavedChanges(false);
      setSaveStatus("saved");
      setLastSaved(new Date());
      pendingChangesRef.current = false;

      console.log(
        "Seating chart saved - changes already persisted via mutations"
      );
    } catch (error) {
      setSaveStatus("error");
      console.error("Failed to save seating chart:", (error as Error).message);
    }
  }, [chart?.id]);

  // ============================================================================
  // Undo/Redo Logic
  // ============================================================================

  /**
   * Undo last action
   */
  const undo = useCallback(() => {
    const action = history.undo();

    if (!action) {
      console.log("Nothing to undo");
      return;
    }

    // Handle different action types
    switch (action.type) {
      case "table_move":
      case "table_resize":
      case "table_rotate":
      case "table_update":
        // Restore previous table state
        if (action.inverseData && action.data) {
          const { tableId, updates } = action.inverseData as {
            tableId: UUID;
            updates: TableLayoutUpdate;
          };
          updateTableMutation.mutate({ tableId, updates });
        }
        break;

      case "guest_assign":
        // Unassign guest
        if (action.data) {
          const { seatId } = action.data as { seatId: UUID };
          unassignSeatMutation.mutate(seatId);
        }
        break;

      case "guest_unassign":
        // Reassign guest
        if (action.inverseData) {
          const { tableId, guestId, seatNumber } = action.inverseData as {
            tableId: UUID;
            guestId: UUID;
            seatNumber: number;
          };
          assignGuestMutation.mutate({ tableId, guestId, seatNumber });
        }
        break;

      default:
        break;
    }

    console.log("Undo successful");
  }, [history, updateTableMutation, unassignSeatMutation, assignGuestMutation]);

  /**
   * Redo last undone action
   */
  const redo = useCallback(() => {
    const action = history.redo();

    if (!action) {
      console.log("Nothing to redo");
      return;
    }

    // Handle different action types (same as undo but using action.data instead of inverseData)
    switch (action.type) {
      case "table_move":
      case "table_resize":
      case "table_rotate":
      case "table_update":
        if (action.data) {
          const { tableId, updates } = action.data as {
            tableId: UUID;
            updates: TableLayoutUpdate;
          };
          updateTableMutation.mutate({ tableId, updates });
        }
        break;

      case "guest_assign":
        if (action.data) {
          const { tableId, guestId, seatNumber } = action.data as {
            tableId: UUID;
            guestId: UUID;
            seatNumber: number;
          };
          assignGuestMutation.mutate({ tableId, guestId, seatNumber });
        }
        break;

      case "guest_unassign":
        if (action.data) {
          const { seatId } = action.data as { seatId: UUID };
          unassignSeatMutation.mutate(seatId);
        }
        break;

      default:
        break;
    }

    console.log("Redo successful");
  }, [history, updateTableMutation, assignGuestMutation, unassignSeatMutation]);

  // ============================================================================
  // Keyboard Shortcuts
  // ============================================================================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

      // Cmd/Ctrl + Z: Undo
      if (ctrlOrCmd && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }

      // Cmd/Ctrl + Shift + Z: Redo
      if (ctrlOrCmd && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        redo();
      }

      // Note: Cmd/Ctrl + S (Save) and Delete/Backspace (Delete table) are handled
      // by the SeatingEditPage component to provide toast feedback

      // Escape: Deselect table
      if (e.key === "Escape") {
        setSelectedTableId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [undo, redo]);

  // ============================================================================
  // Cleanup
  // ============================================================================

  useEffect(() => {
    return () => {
      // Clear autosave timer on unmount
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, []);

  // ============================================================================
  // Return Value
  // ============================================================================

  // Extract tables and seat assignments from chart
  const tables: TableLayout[] = chart?.tables || [];
  const seatAssignments: SeatAssignment[] = tables.flatMap((table) => {
    if ("seat_assignments" in table) {
      return (table as unknown as { seat_assignments: SeatAssignment[] })
        .seat_assignments;
    }
    return [];
  });

  return {
    // Data
    chart: chart || null,
    tables,
    seatAssignments,
    statistics: statistics || null,

    // State
    selectedTableId,
    isLoading,
    error: error as Error | null,

    // Autosave
    saveStatus,
    lastSaved,
    hasUnsavedChanges,

    // History
    canUndo: history.canUndo,
    canRedo: history.canRedo,

    // Methods
    save,
    undo,
    redo,
    selectTable: setSelectedTableId,
    refetch: async () => {
      await refetchChart();
    },
    updateTable: async (tableId: UUID, updates: TableLayoutUpdate) => {
      // Record action in history before update
      const table = tables.find((t) => t.id === tableId);
      if (table) {
        history.recordAction({
          type: "table_update",
          data: { tableId, updates },
          inverseData: {
            tableId,
            updates: {
              x_position: table.x_position,
              y_position: table.y_position,
              width: table.width,
              height: table.height,
              rotation: table.rotation,
              capacity: table.capacity,
              table_number: table.table_number,
              table_type: table.table_type,
            },
          },
        });
      }

      await updateTableMutation.mutateAsync({ tableId, updates });
    },
    deleteTable: async (tableId: UUID) => {
      // Record action in history before delete
      const table = tables.find((t) => t.id === tableId);
      if (table) {
        history.recordAction({
          type: "table_delete",
          data: { tableId },
          inverseData: { table }, // Store full table data for potential undo
        });
      }

      await deleteTableMutation.mutateAsync(tableId);
    },
    assignGuest: async (tableId: UUID, guestId: UUID, seatNumber: number) => {
      // Record action in history
      history.recordAction({
        type: "guest_assign",
        data: { tableId, guestId, seatNumber },
      });

      await assignGuestMutation.mutateAsync({ tableId, guestId, seatNumber });
    },
    unassignSeat: async (seatId: UUID) => {
      // Find seat to store for undo
      const seat = seatAssignments.find((s) => s.id === seatId);

      if (seat) {
        history.recordAction({
          type: "guest_unassign",
          data: { seatId },
          inverseData: {
            tableId: seat.table_layout_id,
            guestId: seat.guest_id,
            seatNumber: seat.seat_number,
          },
        });
      }

      await unassignSeatMutation.mutateAsync(seatId);
    },
    createTable: async (
      tableData: Omit<TableLayoutCreate, "seating_chart_id">
    ) => {
      const newTable = await createTableMutation.mutateAsync(tableData);

      // Record action for undo
      history.recordAction({
        type: "table_add",
        data: { tableId: newTable.id },
        inverseData: null,
      });

      return newTable;
    },
    bulkCreateTables: async (
      tables: Omit<TableLayoutCreate, "seating_chart_id">[]
    ) => {
      return await bulkCreateTablesMutation.mutateAsync(tables);
    },
    updateChart: async (updates: SeatingChartUpdate) => {
      return await updateChartMutation.mutateAsync(updates);
    },
  };
}
