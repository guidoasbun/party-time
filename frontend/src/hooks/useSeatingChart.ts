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
  SaveStatus,
  UseSeatingChartReturn,
} from "@/types";
import { VenueUnit } from "@/types";

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
          console.log("No seating chart found, creating default chart...");
          const newChart = await seatingService.createSeatingChart(eventId, {
            event_id: eventId,
            name: "Seating Chart",
            venue_width: 1200,
            venue_height: 800,
            venue_unit: VenueUnit.FEET,
          });
          return newChart as unknown as SeatingChartWithTables;
        }
        throw err;
      }
    },
    staleTime: 60000, // 1 minute
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seatingChart", eventId] });
      queryClient.invalidateQueries({
        queryKey: ["seatingStatistics", eventId],
      });
      markUnsavedChanges();
    },
    onError: (error) => {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seatingChart", eventId] });
      queryClient.invalidateQueries({
        queryKey: ["seatingStatistics", eventId],
      });
      setSelectedTableId(null);
      markUnsavedChanges();
      console.log("Table deleted");
    },
    onError: (error) => {
      console.error("Failed to delete table:", (error as Error).message);
    },
  });

  /**
   * Assign guest mutation
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seatingChart", eventId] });
      queryClient.invalidateQueries({
        queryKey: ["seatingStatistics", eventId],
      });
      markUnsavedChanges();
      console.log("Guest assigned");
    },
    onError: (error) => {
      console.error("Failed to assign guest:", (error as Error).message);
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
      console.log("Seat unassigned");
    },
    onError: (error) => {
      console.error("Failed to unassign seat:", (error as Error).message);
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
   */
  const save = useCallback(async () => {
    if (!chart?.id || !pendingChangesRef.current) return;

    setSaveStatus("saving");

    try {
      // Force refetch to save current state
      await refetchChart();

      setHasUnsavedChanges(false);
      setSaveStatus("saved");
      setLastSaved(new Date());
      pendingChangesRef.current = false;

      console.log("Seating chart saved");
    } catch (error) {
      setSaveStatus("error");
      console.error("Failed to save seating chart:", (error as Error).message);
    }
  }, [chart?.id, refetchChart]);

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

      // Cmd/Ctrl + S: Manual save
      if (ctrlOrCmd && e.key === "s") {
        e.preventDefault();
        save();
      }

      // Delete/Backspace: Delete selected table
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedTableId &&
        !e.ctrlKey &&
        !e.metaKey
      ) {
        // Only if not in an input field
        const target = e.target as HTMLElement;
        if (
          target.tagName !== "INPUT" &&
          target.tagName !== "TEXTAREA" &&
          !target.isContentEditable
        ) {
          e.preventDefault();
          deleteTableMutation.mutate(selectedTableId);
        }
      }

      // Escape: Deselect table
      if (e.key === "Escape") {
        setSelectedTableId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [undo, redo, save, selectedTableId, deleteTableMutation]);

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
  };
}
