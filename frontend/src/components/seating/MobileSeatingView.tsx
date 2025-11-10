"use client";

/**
 * MobileSeatingView Component
 *
 * FR-21: The system shall provide an interactive seating chart interface.
 * Phase 6.2.4: Mobile & Tablet Views
 * Read-only seating chart optimized for mobile devices
 *
 * Features:
 * - Responsive canvas container with proper sizing
 * - Read-only mode (no editing)
 * - Touch-friendly navigation
 * - Find My Seat integration
 * - Responsive toolbar
 * - Theme-aware styling
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import * as fabric from "fabric";
import SeatingCanvas from "./SeatingCanvas";
import FindMySeat from "./FindMySeat";
import ResponsiveToolbar from "./ResponsiveToolbar";
import { cn } from "@/lib/utils";
import type {
  MobileSeatingViewProps,
  ZoomState,
  GuestSearchResult,
  UUID,
} from "@/types";

export default function MobileSeatingView({
  seatingChart,
  tables,
  guests = [],
  readOnly = true,
  showFindMySeat = true,
  className,
  theme = "light",
}: MobileSeatingViewProps) {
  const [zoomState, setZoomState] = useState<ZoomState>({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  });
  const [highlightedTableId, setHighlightedTableId] = useState<UUID | null>(
    null
  );
  const [isMobile, setIsMobile] = useState(false);
  const canvasRef = useRef<fabric.Canvas | null>(null);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle zoom changes
  const handleZoomChange = useCallback((newZoom: ZoomState) => {
    setZoomState(newZoom);
  }, []);

  // Handle guest found from search
  const handleGuestFound = useCallback((result: GuestSearchResult) => {
    console.log("Guest found:", result);
    // Optionally zoom to the table or center the view
  }, []);

  // Handle table highlighting
  const handleHighlightTable = useCallback((tableId: UUID | null) => {
    setHighlightedTableId(tableId);

    // Optionally highlight the table on canvas by changing its appearance
    if (canvasRef.current && tableId) {
      const canvas = canvasRef.current;
      const allObjects = canvas.getObjects() as (fabric.Group & {
        data?: { id?: string };
      })[];

      allObjects.forEach((obj) => {
        if (obj.data?.id === tableId) {
          // Highlight effect (e.g., add a glow or change stroke)
          obj.set({
            stroke: "#f59e0b", // Amber highlight color
            strokeWidth: 4,
          });
        } else if (obj.data?.id) {
          // Reset other tables
          obj.set({
            stroke: undefined,
            strokeWidth: 0,
          });
        }
      });

      canvas.renderAll();
    }
  }, []);

  // Handle canvas ready
  const handleCanvasReady = useCallback((canvas: fabric.Canvas) => {
    canvasRef.current = canvas;
  }, []);

  return (
    <div className={cn("flex flex-col h-full w-full", className)}>
      {/* Find My Seat Section (Mobile/Tablet) */}
      {showFindMySeat && guests.length > 0 && (
        <div className="p-4 bg-background border-b border-border">
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Find Your Seat
          </h2>
          <FindMySeat
            seatingChart={seatingChart}
            guests={guests}
            onGuestFound={handleGuestFound}
            onHighlightTable={handleHighlightTable}
          />
        </div>
      )}

      {/* Seating Chart Section */}
      <div className="flex-1 relative bg-background p-4">
        {/* Responsive Toolbar */}
        <div
          className={cn(
            isMobile
              ? "fixed bottom-4 right-4 z-20"
              : "absolute top-4 right-4 z-10"
          )}
        >
          <ResponsiveToolbar
            canvasRef={canvasRef}
            zoomState={zoomState}
            onZoomChange={handleZoomChange}
            isMobile={isMobile}
          />
        </div>

        {/* Canvas Container */}
        <div
          className={cn(
            "w-full rounded-lg overflow-hidden border border-border",
            "min-h-[400px] sm:min-h-[500px] md:min-h-[600px] lg:min-h-[700px]"
          )}
        >
          <SeatingCanvas
            seatingChart={seatingChart}
            tables={tables}
            readOnly={readOnly}
            zoomState={zoomState}
            onZoomChange={handleZoomChange}
            theme={theme}
            className="h-full"
            onCanvasReady={handleCanvasReady}
          />
        </div>

        {/* Legend/Info Section (optional) */}
        <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-border">
          <p className="text-xs text-muted-foreground text-center">
            {isMobile
              ? "📱 Pinch to zoom • Tap to view table details"
              : "🖱️ Scroll to zoom • Click to view table details"}
          </p>
        </div>
      </div>

      {/* Event Info Footer (Mobile) */}
      {isMobile && (
        <div className="p-4 bg-muted/30 border-t border-border">
          <div className="text-center">
            <h3 className="text-sm font-semibold text-foreground mb-1">
              {seatingChart.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {seatingChart.total_tables} tables • {seatingChart.total_capacity}{" "}
              seats
              {seatingChart.total_assigned > 0 && (
                <span> • {seatingChart.total_assigned} assigned</span>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
