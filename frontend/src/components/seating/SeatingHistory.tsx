/**
 * SeatingHistory Component
 *
 * FR-21: The system shall provide an interactive seating chart interface.
 * Phase 6.2.5: Seating Chart Polish & Integration
 * Provides UI controls for undo/redo functionality
 */

"use client";

import React from "react";
import { Undo2, Redo2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface SeatingHistoryProps {
  canUndo: boolean;
  canRedo: boolean;
  undoCount?: number;
  redoCount?: number;
  onUndo: () => void;
  onRedo: () => void;
  className?: string;
  showLabels?: boolean;
}

/**
 * Undo/Redo controls for seating chart
 */
export function SeatingHistory({
  canUndo,
  canRedo,
  undoCount = 0,
  redoCount = 0,
  onUndo,
  onRedo,
  className,
  showLabels = false,
}: SeatingHistoryProps) {
  // Detect OS for keyboard shortcut display
  const isMac =
    typeof navigator !== "undefined" &&
    navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const modKey = isMac ? "⌘" : "Ctrl";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Undo Button */}
      <Button
        variant="outline"
        size={showLabels ? "md" : "sm"}
        onClick={onUndo}
        disabled={!canUndo}
        title={`Undo${
          undoCount > 0 ? ` (${undoCount} actions)` : ""
        } - ${modKey} + Z`}
        className={cn(
          "relative",
          !showLabels && "w-9 h-9 p-0",
          !canUndo && "cursor-not-allowed opacity-50"
        )}
        aria-label={`Undo${undoCount > 0 ? ` (${undoCount} actions)` : ""}`}
      >
        <Undo2 className="h-4 w-4" />
        {showLabels && <span className="ml-2">Undo</span>}
        {undoCount > 0 && !showLabels && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {undoCount > 9 ? "9+" : undoCount}
          </span>
        )}
      </Button>

      {/* Redo Button */}
      <Button
        variant="outline"
        size={showLabels ? "md" : "sm"}
        onClick={onRedo}
        disabled={!canRedo}
        title={`Redo${
          redoCount > 0 ? ` (${redoCount} actions)` : ""
        } - ${modKey} + Shift + Z`}
        className={cn(
          "relative",
          !showLabels && "w-9 h-9 p-0",
          !canRedo && "cursor-not-allowed opacity-50"
        )}
        aria-label={`Redo${redoCount > 0 ? ` (${redoCount} actions)` : ""}`}
      >
        <Redo2 className="h-4 w-4" />
        {showLabels && <span className="ml-2">Redo</span>}
        {redoCount > 0 && !showLabels && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {redoCount > 9 ? "9+" : redoCount}
          </span>
        )}
      </Button>
    </div>
  );
}

/**
 * Compact undo/redo controls (icon-only buttons)
 */
export function SeatingHistoryCompact({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  className,
}: Omit<SeatingHistoryProps, "showLabels" | "undoCount" | "redoCount">) {
  return (
    <SeatingHistory
      canUndo={canUndo}
      canRedo={canRedo}
      onUndo={onUndo}
      onRedo={onRedo}
      showLabels={false}
      className={className}
    />
  );
}
