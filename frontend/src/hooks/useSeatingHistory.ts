/**
 * useSeatingHistory Hook
 *
 * FR-21: The system shall provide an interactive seating chart interface.
 * Phase 6.2.5: Seating Chart Polish & Integration
 * Provides undo/redo functionality for seating chart operations
 */

import { useState, useCallback, useRef } from "react";
import {
  HistoryAction,
  HistoryState,
  UseSeatingHistoryReturn,
} from "@/types/seating.types";

const MAX_HISTORY_SIZE = 50; // Maximum undo/redo actions to store

/**
 * Custom hook for managing undo/redo history for seating chart operations
 */
export function useSeatingHistory(): UseSeatingHistoryReturn {
  const [historyState, setHistoryState] = useState<HistoryState>({
    undoStack: [],
    redoStack: [],
    maxSize: MAX_HISTORY_SIZE,
  });

  // Use ref to access current state in callbacks without re-renders
  const historyRef = useRef(historyState);
  historyRef.current = historyState;

  /**
   * Record a new action in history
   * Clears redo stack when new action is recorded
   */
  const recordAction = useCallback(
    (action: Omit<HistoryAction, "id" | "timestamp">) => {
      const newAction: HistoryAction = {
        ...action,
        id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
      };

      setHistoryState((prev) => {
        const newUndoStack = [...prev.undoStack, newAction];

        // Keep only last MAX_HISTORY_SIZE actions
        if (newUndoStack.length > prev.maxSize) {
          newUndoStack.shift(); // Remove oldest action
        }

        return {
          ...prev,
          undoStack: newUndoStack,
          redoStack: [], // Clear redo stack when new action is recorded
        };
      });
    },
    []
  );

  /**
   * Undo the last action
   * Returns the action that was undone, or null if nothing to undo
   */
  const undo = useCallback((): HistoryAction | null => {
    const current = historyRef.current;

    if (current.undoStack.length === 0) {
      return null;
    }

    const actionToUndo = current.undoStack[current.undoStack.length - 1];
    const newUndoStack = current.undoStack.slice(0, -1);
    const newRedoStack = [...current.redoStack, actionToUndo];

    setHistoryState({
      ...current,
      undoStack: newUndoStack,
      redoStack: newRedoStack,
    });

    return actionToUndo;
  }, []);

  /**
   * Redo the last undone action
   * Returns the action that was redone, or null if nothing to redo
   */
  const redo = useCallback((): HistoryAction | null => {
    const current = historyRef.current;

    if (current.redoStack.length === 0) {
      return null;
    }

    const actionToRedo = current.redoStack[current.redoStack.length - 1];
    const newRedoStack = current.redoStack.slice(0, -1);
    const newUndoStack = [...current.undoStack, actionToRedo];

    setHistoryState({
      ...current,
      undoStack: newUndoStack,
      redoStack: newRedoStack,
    });

    return actionToRedo;
  }, []);

  /**
   * Clear all history
   */
  const clearHistory = useCallback(() => {
    setHistoryState({
      undoStack: [],
      redoStack: [],
      maxSize: MAX_HISTORY_SIZE,
    });
  }, []);

  /**
   * Get current history state
   */
  const getHistory = useCallback((): HistoryState => {
    return historyRef.current;
  }, []);

  return {
    // State
    canUndo: historyState.undoStack.length > 0,
    canRedo: historyState.redoStack.length > 0,
    undoCount: historyState.undoStack.length,
    redoCount: historyState.redoStack.length,

    // Methods
    undo,
    redo,
    recordAction,
    clearHistory,
    getHistory,
  };
}
