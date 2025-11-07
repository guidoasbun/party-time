"use client";

/**
 * Seating chart canvas component using Fabric.js
 *
 * FR-21: Interactive seating chart interface
 * Phase 6.1.3: Fabric.js Canvas Setup
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as fabric from "fabric";
import { SeatingChartWithTables, TableLayout, UUID, ZoomState } from "@/types";
import {
  createTableShape,
  snapToGrid,
  constrainToCanvasBounds,
  GridConfig,
  renderGridLines,
} from "@/utils/fabric-shapes";
import type { SpecialArea, FloorPlanSettings } from "@/types/venue.types";
import { createSpecialAreaShape } from "@/utils/venue-helpers";

// ============================================================================
// Type Definitions
// ============================================================================

export interface SeatingCanvasProps {
  seatingChart: SeatingChartWithTables;
  tables: TableLayout[];
  onTableSelect?: (tableId: UUID | null) => void;
  onTableMove?: (tableId: UUID, x: number, y: number) => void;
  onTableResize?: (tableId: UUID, width: number, height: number) => void;
  onTableRotate?: (tableId: UUID, rotation: number) => void;
  readOnly?: boolean;
  className?: string;
  gridConfig?: GridConfig;
  zoomState?: ZoomState;
  onZoomChange?: (newZoom: ZoomState) => void;
  theme?: "light" | "dark";
  // Phase 6.2.2: Venue Layout Integration
  floorPlanUrl?: string;
  floorPlanSettings?: FloorPlanSettings;
  specialAreas?: SpecialArea[];
  onSpecialAreaSelect?: (areaId: string | null) => void;
  onSpecialAreaMove?: (areaId: string, x: number, y: number) => void;
}

// ============================================================================
// Component
// ============================================================================

export default function SeatingCanvas({
  seatingChart,
  tables,
  onTableSelect,
  onTableMove,
  onTableResize,
  onTableRotate,
  readOnly = false,
  className = "",
  gridConfig = { enabled: true, size: 20, color: "#e5e7eb", showLines: true },
  zoomState = { scale: 1, offsetX: 0, offsetY: 0 },
  onZoomChange,
  theme = "light",
  // Phase 6.2.2: Venue Layout Integration
  floorPlanUrl,
  floorPlanSettings,
  specialAreas = [],
  onSpecialAreaSelect,
  onSpecialAreaMove,
}: SeatingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Debounce timer for API updates
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Track which object is currently being manipulated
  const activeObjectRef = useRef<string | null>(null);

  // Track floor plan image object
  const floorPlanImageRef = useRef<fabric.Image | null>(null);

  // ============================================================================
  // Canvas Initialization
  // ============================================================================

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || isInitialized) return;

    // Calculate canvas dimensions based on container
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight || 600;

    // Initialize Fabric canvas
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: containerWidth,
      height: containerHeight,
      backgroundColor: theme === "dark" ? "#0a0a0a" : "#ffffff",
      selection: !readOnly, // Enable multi-select in edit mode
      preserveObjectStacking: true,
    });

    fabricCanvasRef.current = canvas;
    setIsInitialized(true);

    // Cleanup on unmount
    return () => {
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, readOnly]);

  // ============================================================================
  // Render Floor Plan
  // ============================================================================

  // Venue Layout Demo - Client Component
  // FR-21: The system shall provide an interactive seating chart interface.
  // Phase 6.2.2: Venue Layout Integration
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !isInitialized) return;

    // Remove existing floor plan if it exists
    if (floorPlanImageRef.current) {
      canvas.remove(floorPlanImageRef.current);
      floorPlanImageRef.current = null;
    }

    // Add new floor plan if URL provided
    if (floorPlanUrl) {
      fabric.Image.fromURL(
        floorPlanUrl,
        (img) => {
          if (!img) return;

          const settings = floorPlanSettings || {
            opacity: 0.5,
            locked: false,
            scale: 1,
          };

          // Scale image to fit canvas while maintaining aspect ratio
          const canvasWidth = canvas.getWidth();
          const canvasHeight = canvas.getHeight();
          const imgWidth = img.width || 1;
          const imgHeight = img.height || 1;

          const scaleX = (canvasWidth * settings.scale) / imgWidth;
          const scaleY = (canvasHeight * settings.scale) / imgHeight;
          const scale = Math.min(scaleX, scaleY);

          img.set({
            scaleX: scale,
            scaleY: scale,
            opacity: settings.opacity,
            selectable: !settings.locked && !readOnly,
            evented: !settings.locked && !readOnly,
            hasControls: false,
            hasBorders: false,
            lockMovementX: settings.locked,
            lockMovementY: settings.locked,
          });

          // Position at canvas center
          img.set({
            left: (canvasWidth - img.width! * scale) / 2,
            top: (canvasHeight - img.height! * scale) / 2,
          });

          // Store reference
          floorPlanImageRef.current = img;

          // Add to canvas as bottom layer
          canvas.add(img);
          img.sendToBack();

          canvas.renderAll();
        },
        { crossOrigin: "anonymous" }
      );
    }
  }, [floorPlanUrl, floorPlanSettings, isInitialized, readOnly]);

  // ============================================================================
  // Render Special Areas
  // ============================================================================

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !isInitialized) return;

    // Remove existing special area objects
    const existingAreas = canvas
      .getObjects()
      .filter(
        (obj) =>
          (obj as fabric.Group & { data?: { areaType?: string } }).data
            ?.areaType === "special"
      );
    existingAreas.forEach((obj) => canvas.remove(obj));

    // Add special areas
    specialAreas.forEach((area) => {
      const areaShape = createSpecialAreaShape(area, theme);
      areaShape.set({
        selectable: !readOnly,
        hasControls: !readOnly,
        evented: !readOnly,
      });
      canvas.add(areaShape);
    });

    // Ensure proper z-index layering:
    // 1. Floor plan (bottom)
    if (floorPlanImageRef.current) {
      floorPlanImageRef.current.sendToBack();
    }
    // 2. Special areas (middle)
    specialAreas.forEach((area) => {
      const areaObj = canvas
        .getObjects()
        .find(
          (obj) =>
            (obj as fabric.Group & { data?: { areaId?: string } }).data
              ?.areaId === area.id
        );
      if (areaObj) {
        areaObj.bringForward();
      }
    });
    // 3. Tables stay on top automatically

    canvas.renderAll();
  }, [specialAreas, isInitialized, theme, readOnly]);

  // ============================================================================
  // Render Tables
  // ============================================================================

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !isInitialized) return;

    // Get existing table objects
    const existingTableObjects = canvas
      .getObjects()
      .filter(
        (obj) => !(obj as fabric.Object & { isGridLine?: boolean }).isGridLine
      ) as (fabric.Group & { data?: Record<string, unknown> })[];

    // Create a map of existing tables by ID
    const existingTableMap = new Map<
      string,
      fabric.Group & { data?: Record<string, unknown> }
    >();
    existingTableObjects.forEach((obj) => {
      if (obj.data && obj.data.id) {
        existingTableMap.set(obj.data.id as string, obj);
      }
    });

    // Create a set of current table IDs
    const currentTableIds = new Set(tables.map((t) => t.id));

    // Remove tables that no longer exist
    existingTableObjects.forEach((obj) => {
      if (
        obj.data &&
        obj.data.id &&
        !currentTableIds.has(obj.data.id as string)
      ) {
        canvas.remove(obj);
      }
    });

    // Update existing tables or add new ones
    tables.forEach((table) => {
      const existing = existingTableMap.get(table.id);

      if (existing) {
        // Skip position updates if this table is currently being manipulated
        const isActiveObject = activeObjectRef.current === table.id;

        // Only update position if it differs significantly AND table isn't being moved
        const positionChanged =
          Math.abs((existing.left ?? 0) - table.x_position) > 2 ||
          Math.abs((existing.top ?? 0) - table.y_position) > 2 ||
          Math.abs((existing.angle ?? 0) - table.rotation) > 2;

        console.log("📍 Position sync check:", {
          tableId: table.id,
          isActiveObject,
          activeObjectRef: activeObjectRef.current,
          positionChanged,
          fabricPos: { x: existing.left, y: existing.top },
          statePos: { x: table.x_position, y: table.y_position },
        });

        if (positionChanged && !isActiveObject) {
          console.log("✅ Syncing position from state to Fabric");
          existing.set({
            left: table.x_position,
            top: table.y_position,
            angle: table.rotation,
          });
          existing.setCoords();
        } else if (isActiveObject) {
          console.log("⏭️ Skipping position sync - table is being dragged");
        }

        // Update metadata
        if (existing.data) {
          existing.data.tableNumber = table.table_number;
          existing.data.capacity = table.capacity;
          existing.data.assignedCount =
            "assigned_count" in table ? table.assigned_count ?? 0 : 0;
        }
      } else {
        // Create new table shape
        const tableShape = createTableShape(table, {
          selectable: !readOnly,
          hasControls: !readOnly,
          evented: !readOnly,
        });
        canvas.add(tableShape);
      }
    });

    // Render grid lines
    if (gridConfig.enabled && gridConfig.showLines) {
      renderGridLines(canvas, gridConfig);
    }

    canvas.renderAll();
  }, [tables, isInitialized, readOnly, gridConfig]);

  // ============================================================================
  // Theme Change Handling
  // ============================================================================

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Update canvas background color
    canvas.backgroundColor = theme === "dark" ? "#0a0a0a" : "#ffffff";
    canvas.renderAll();

    // Re-render all tables to update colors
    const tableObjects = canvas
      .getObjects()
      .filter(
        (obj) => !(obj as fabric.Object & { isGridLine?: boolean }).isGridLine
      );

    tableObjects.forEach((obj) => {
      const data = (obj as fabric.Group & { data?: Record<string, unknown> })
        .data;
      if (data && data.id) {
        const table = tables.find((t) => t.id === data.id);
        if (table) {
          canvas.remove(obj);
          const newShape = createTableShape(table, {
            selectable: !readOnly,
            hasControls: !readOnly,
            evented: !readOnly,
          });
          canvas.add(newShape);
        }
      }
    });

    canvas.renderAll();
  }, [theme, tables, readOnly]);

  // ============================================================================
  // Zoom and Pan
  // ============================================================================

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Apply zoom state
    canvas.setZoom(zoomState.scale);
    canvas.viewportTransform = [
      zoomState.scale,
      0,
      0,
      zoomState.scale,
      zoomState.offsetX,
      zoomState.offsetY,
    ];
    canvas.renderAll();
  }, [zoomState]);

  // Mouse wheel zoom
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleWheel = (opt: any) => {
      const delta = opt.e.deltaY;
      let zoom = canvas.getZoom();
      zoom *= 0.999 ** delta;

      // Constrain zoom (0.1x to 5.0x)
      zoom = Math.max(0.1, Math.min(5, zoom));

      // Zoom to mouse point
      const point = new fabric.Point(opt.e.offsetX, opt.e.offsetY);
      canvas.zoomToPoint(point, zoom);

      opt.e.preventDefault();
      opt.e.stopPropagation();

      // Emit zoom change
      if (onZoomChange && canvas.viewportTransform) {
        onZoomChange({
          scale: zoom,
          offsetX: canvas.viewportTransform[4],
          offsetY: canvas.viewportTransform[5],
        });
      }
    };

    canvas.on("mouse:wheel", handleWheel);

    return () => {
      canvas.off("mouse:wheel", handleWheel);
    };
  }, [onZoomChange]);

  // ============================================================================
  // Object Modification Events
  // ============================================================================

  const handleObjectModified = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (e: any) => {
      const canvas = fabricCanvasRef.current;
      const target = e.target as fabric.Object | undefined;
      if (!canvas || !target) return;

      const obj = target as fabric.Group & { data?: Record<string, unknown> };
      const data = obj.data;

      if (!data || !data.id) return;

      const tableId = data.id as UUID;
      let left = obj.left ?? 0;
      let top = obj.top ?? 0;

      // Apply grid snap
      if (gridConfig.enabled) {
        left = snapToGrid(left, gridConfig.size);
        top = snapToGrid(top, gridConfig.size);
        obj.set({ left, top });
      }

      // Constrain to canvas bounds
      constrainToCanvasBounds(obj, canvas);
      obj.setCoords();
      canvas.renderAll();

      // Debounced API update for position
      if (onTableMove) {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }

        const finalLeft = obj.left ?? 0;
        const finalTop = obj.top ?? 0;

        // Keep activeObjectRef set during the debounce period
        // to prevent position sync from resetting to old state values

        debounceTimerRef.current = setTimeout(() => {
          console.log("🔄 Calling onTableMove:", {
            tableId,
            x: finalLeft,
            y: finalTop,
            activeObject: activeObjectRef.current,
          });
          onTableMove(tableId, finalLeft, finalTop);

          // Clear AFTER calling onTableMove to allow state to update first
          // This prevents the position sync from running until the state is updated
          setTimeout(() => {
            activeObjectRef.current = null;
            console.log("🔓 Cleared activeObjectRef after state update");
          }, 100); // Small delay to ensure state update propagates
        }, 500);
      }

      // Handle rotation
      if (onTableRotate && obj.angle !== undefined) {
        const rotation = obj.angle % 360;
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
          onTableRotate(tableId, rotation);
        }, 500);
      }

      // Handle resize (scaling)
      if (
        onTableResize &&
        obj.scaleX &&
        obj.scaleY &&
        (obj.scaleX !== 1 || obj.scaleY !== 1)
      ) {
        // Get the original dimensions from the first object in the group
        const items = obj.getObjects();
        if (items && items.length > 0) {
          const firstItem = items[0] as fabric.Object;
          let originalWidth = 0;
          let originalHeight = 0;

          if ("radius" in firstItem && typeof firstItem.radius === "number") {
            // Round table
            originalWidth = originalHeight = firstItem.radius * 2;
          } else if ("width" in firstItem && "height" in firstItem) {
            // Rectangular/square table
            originalWidth = (firstItem.width as number) || 0;
            originalHeight = (firstItem.height as number) || 0;
          }

          // Calculate new dimensions based on scale
          const newWidth = Math.round(originalWidth * obj.scaleX);
          const newHeight = Math.round(originalHeight * obj.scaleY);

          // Reset scale to 1 and update actual dimensions
          obj.scaleX = 1;
          obj.scaleY = 1;
          obj.setCoords();

          if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
          }
          debounceTimerRef.current = setTimeout(() => {
            onTableResize(tableId, newWidth, newHeight);
          }, 500);
        }
      }
    },
    [gridConfig, onTableMove, onTableRotate, onTableResize]
  );

  // Track object being moved
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleObjectMoving = (e: any) => {
      const target = e.target as fabric.Object | undefined;
      if (!target) return;

      const obj = target as fabric.Group & { data?: Record<string, unknown> };
      if (obj.data && obj.data.id) {
        activeObjectRef.current = obj.data.id as string;
        console.log("🚀 Started dragging table:", obj.data.id);
      }
    };

    canvas.on("object:moving", handleObjectMoving);

    return () => {
      canvas.off("object:moving", handleObjectMoving);
    };
  }, []);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const handleModified = (e: Parameters<typeof handleObjectModified>[0]) => {
      // Note: activeObjectRef is cleared in the debounce timer to prevent race conditions
      console.log("🛑 Finished dragging table");
      handleObjectModified(e);
    };

    canvas.on("object:modified", handleModified);

    return () => {
      canvas.off("object:modified", handleModified);
    };
  }, [handleObjectModified]);

  // ============================================================================
  // Object Selection Events
  // ============================================================================

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !onTableSelect) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSelection = (e: any) => {
      const selected = e.selected as fabric.Object[] | undefined;
      if (!selected || selected.length === 0) {
        onTableSelect(null);
        return;
      }

      const obj = selected[0] as fabric.Group & {
        data?: Record<string, unknown>;
      };
      const data = obj.data;

      if (data && data.id) {
        onTableSelect(data.id as UUID);
      }
    };

    const handleDeselection = () => {
      onTableSelect(null);
    };

    canvas.on("selection:created", handleSelection);
    canvas.on("selection:updated", handleSelection);
    canvas.on("selection:cleared", handleDeselection);

    return () => {
      canvas.off("selection:created", handleSelection);
      canvas.off("selection:updated", handleSelection);
      canvas.off("selection:cleared", handleDeselection);
    };
  }, [onTableSelect]);

  // ============================================================================
  // Window Resize Handling
  // ============================================================================

  useEffect(() => {
    const handleResize = () => {
      const canvas = fabricCanvasRef.current;
      const container = containerRef.current;

      if (!canvas || !container) return;

      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight || 600;

      canvas.setDimensions({
        width: newWidth,
        height: newHeight,
      });

      // Re-render grid lines if enabled
      if (gridConfig.enabled && gridConfig.showLines) {
        renderGridLines(canvas, gridConfig);
      }

      canvas.renderAll();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [gridConfig]);

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[600px] border border-border rounded-lg overflow-hidden ${className}`}
    >
      <canvas ref={canvasRef} />
      {!isInitialized && (
        <div className="absolute inset-0 flex items-center justify-center bg-background">
          <div className="text-muted-foreground">Loading canvas...</div>
        </div>
      )}
    </div>
  );
}
