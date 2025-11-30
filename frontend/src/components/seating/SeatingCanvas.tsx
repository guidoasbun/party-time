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
import {
  createSpecialAreaShape,
  getObstacles,
  validateGuestDrop,
} from "@/utils/venue-helpers";

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
  // Phase 6.3.7: Floor plan position and scale persistence
  onFloorPlanMove?: (x: number, y: number, scaleX?: number, scaleY?: number) => void;
  onSpecialAreaSelect?: (areaId: string | null) => void;
  onSpecialAreaMove?: (areaId: string, x: number, y: number) => void;
  // Phase 6.3.7: Special area update callback for canvas drag/resize
  onSpecialAreaUpdate?: (
    areaId: string,
    updates: {
      x?: number;
      y?: number;
      width?: number;
      height?: number;
      rotation?: number;
    }
  ) => void;
  // FR-21: The system shall provide an interactive seating chart interface.
  // Phase 6.2.3: Export and Sharing Features
  onCanvasReady?: (canvas: fabric.Canvas) => void;
  // Phase 6.3.5: Drag-and-Drop Assignment Venue-Aware
  onGuestDrop?: (tableId: UUID, guestId: string) => void;
  draggedGuestId?: string | null;
  seatAssignments?: Array<{ table_layout_id: string; guest_id?: string }>;
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
  onFloorPlanMove,
  onSpecialAreaSelect,
  onSpecialAreaMove,
  onSpecialAreaUpdate,
  // FR-21: The system shall provide an interactive seating chart interface.
  // Phase 6.2.3: Export and Sharing Features
  onCanvasReady,
  // Phase 6.3.5: Drag-and-Drop Assignment Venue-Aware
  onGuestDrop,
  draggedGuestId,
  seatAssignments = [],
}: SeatingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Phase 6.3.5: Drag-and-Drop Assignment Venue-Aware
  const [hoveredTableId, setHoveredTableId] = useState<string | null>(null);
  const [isDropValid, setIsDropValid] = useState(false);
  const originalTableStylesRef = useRef<
    Map<
      string,
      {
        stroke: string | undefined;
        strokeWidth: number;
        strokeDashArray: number[] | undefined;
      }
    >
  >(new Map());

  // Debounce timers for API updates - one per table to prevent conflicts
  const debounceTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Pending updates to batch together (position, rotation, resize)
  const pendingUpdatesRef = useRef<
    Map<
      string,
      {
        x?: number;
        y?: number;
        rotation?: number;
        width?: number;
        height?: number;
      }
    >
  >(new Map());

  // Track which objects are currently being manipulated
  const activeObjectsRef = useRef<Set<string>>(new Set());

  // Track last drag end time to prevent snap-back from delayed state updates
  const lastDragEndRef = useRef<number>(0);

  // Track which tables have been dragged and their current canvas positions
  // This prevents stale state from overwriting canvas positions
  const draggedPositionsRef = useRef<Map<string, { x: number; y: number }>>(
    new Map()
  );

  // Store callbacks in refs to avoid stale closures
  const onTableMoveRef = useRef(onTableMove);
  const onTableRotateRef = useRef(onTableRotate);
  const onTableResizeRef = useRef(onTableResize);
  const onSpecialAreaUpdateRef = useRef(onSpecialAreaUpdate);
  const onFloorPlanMoveRef = useRef(onFloorPlanMove);

  // Keep refs synchronized with latest callbacks
  useEffect(() => {
    onTableMoveRef.current = onTableMove;
    onTableRotateRef.current = onTableRotate;
    onTableResizeRef.current = onTableResize;
    onSpecialAreaUpdateRef.current = onSpecialAreaUpdate;
    onFloorPlanMoveRef.current = onFloorPlanMove;
  }, [onTableMove, onTableRotate, onTableResize, onSpecialAreaUpdate, onFloorPlanMove]);

  // Track floor plan image object
  const floorPlanImageRef = useRef<fabric.Image | null>(null);
  // FR-21: The system shall provide an interactive seating chart interface.
  // Phase 6.2.4: Mobile & Tablet Views
  // Phase 6.2.4: Touch gesture state for pinch-to-zoom
  const touchStateRef = useRef<{
    isPinching: boolean;
    initialDistance: number;
    initialScale: number;
    lastTouchX: number;
    lastTouchY: number;
  }>({
    isPinching: false,
    initialDistance: 0,
    initialScale: 1,
    lastTouchX: 0,
    lastTouchY: 0,
  });

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

    // FR-21: The system shall provide an interactive seating chart interface.
    // Phase 6.2.3: Export and Sharing Features
    if (onCanvasReady) {
      onCanvasReady(canvas);
    }

    // Cleanup on unmount
    return () => {
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, readOnly, onCanvasReady]);

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
      fabric.Image.fromURL(floorPlanUrl, { crossOrigin: "anonymous" }).then(
        (img) => {
          if (!img) return;

          const settings = floorPlanSettings || {
            opacity: 0.5,
            locked: false,
            scale: 1,
          };

          // Phase 6.3.7: Scale persistence - use stored scale if available, otherwise calculate
          const canvasWidth = canvas.getWidth();
          const canvasHeight = canvas.getHeight();
          const imgWidth = img.width || 1;
          const imgHeight = img.height || 1;

          let scaleX: number;
          let scaleY: number;

          if (settings.appliedScaleX !== undefined && settings.appliedScaleY !== undefined) {
            // Use stored scale values for consistent size across screen changes
            scaleX = settings.appliedScaleX;
            scaleY = settings.appliedScaleY;
          } else {
            // First time - calculate based on canvas size
            const calculatedScaleX = (canvasWidth * settings.scale) / imgWidth;
            const calculatedScaleY = (canvasHeight * settings.scale) / imgHeight;
            const scale = Math.min(calculatedScaleX, calculatedScaleY);
            scaleX = scale;
            scaleY = scale;
          }

          img.set({
            scaleX: scaleX,
            scaleY: scaleY,
            opacity: settings.opacity,
            selectable: !settings.locked && !readOnly,
            evented: !settings.locked && !readOnly,
            hasControls: false,
            hasBorders: false,
            lockMovementX: settings.locked,
            lockMovementY: settings.locked,
          });

          // Phase 6.3.7: Position floor plan
          // Use absolute positioning - floor plan stays at fixed coordinates
          // This keeps floor plan, tables, and special areas all using the same coordinate system
          // Note: Future enhancement (Option A) would use relative positioning for responsive scaling
          const centerX = (canvasWidth - img.width! * scaleX) / 2;
          const centerY = (canvasHeight - img.height! * scaleY) / 2;

          // Use stored absolute position if available, otherwise center
          const left = settings.offsetX !== undefined ? settings.offsetX : centerX;
          const top = settings.offsetY !== undefined ? settings.offsetY : centerY;

          img.set({ left, top });

          // Store reference
          floorPlanImageRef.current = img;

          // Mark as floor plan so it doesn't get removed
          (img as any).isFloorPlan = true;

          // Add to canvas as bottom layer
          canvas.add(img);
          canvas.sendObjectToBack(img);

          canvas.renderAll();
        }
      );
    }
  }, [floorPlanUrl, floorPlanSettings, isInitialized, readOnly]);

  // ============================================================================
  // Render Special Areas
  // ============================================================================

  // Track which special areas are currently being manipulated on canvas
  const activeSpecialAreasRef = useRef<Set<string>>(new Set());
  const lastSpecialAreaModifiedRef = useRef<number>(0);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !isInitialized) return;

    // Skip updates if a special area was recently modified on canvas
    // This prevents snap-back when state updates from onSpecialAreaUpdate
    const timeSinceModified = Date.now() - lastSpecialAreaModifiedRef.current;
    if (timeSinceModified < 500) {
      return;
    }

    // Get existing special area objects on canvas
    const existingAreaObjects = canvas
      .getObjects()
      .filter(
        (obj) =>
          (obj as fabric.Group & { data?: { areaType?: string } }).data
            ?.areaType === "special"
      ) as (fabric.Group & { data?: { areaId?: string } })[];

    // Create a map of existing areas by ID
    const existingAreaMap = new Map<
      string,
      fabric.Group & { data?: { areaId?: string } }
    >();
    existingAreaObjects.forEach((obj) => {
      if (obj.data?.areaId) {
        existingAreaMap.set(obj.data.areaId, obj);
      }
    });

    // Create a set of current area IDs
    const currentAreaIds = new Set(specialAreas.map((a) => a.id));

    // Remove areas that no longer exist
    existingAreaObjects.forEach((obj) => {
      if (obj.data?.areaId && !currentAreaIds.has(obj.data.areaId)) {
        canvas.remove(obj);
      }
    });

    // Update existing areas or add new ones
    specialAreas.forEach((area) => {
      const existing = existingAreaMap.get(area.id);

      if (existing) {
        // Skip position/size updates if this area is being actively manipulated
        if (activeSpecialAreasRef.current.has(area.id)) {
          return;
        }

        // Get the shape from the group to check dimensions
        // Phase 6.3.7: Handle both rectangle and circle shapes
        const items = existing.getObjects();
        const shape = items[0] as fabric.Rect | fabric.Circle | undefined;
        const existingData = (existing as fabric.Group & { data?: { shapeType?: string } }).data;
        const isCircle = existingData?.shapeType === "circle" || area.shape === "circle";

        // Check if position/rotation changed
        const positionChanged =
          Math.abs((existing.left ?? 0) - area.x) > 2 ||
          Math.abs((existing.top ?? 0) - area.y) > 2 ||
          Math.abs((existing.angle ?? 0) - area.rotation) > 2;

        // Check if dimensions changed
        let dimensionsChanged = false;
        if (shape) {
          if (isCircle) {
            const circle = shape as fabric.Circle;
            const expectedRadius = Math.min(area.width, area.height) / 2;
            dimensionsChanged = Math.abs((circle.radius ?? 0) - expectedRadius) > 2;
          } else {
            const rect = shape as fabric.Rect;
            dimensionsChanged =
              Math.abs((rect.width ?? 0) - area.width) > 2 ||
              Math.abs((rect.height ?? 0) - area.height) > 2;
          }
        }

        // Check if shape type changed (need to recreate the object)
        const shapeTypeChanged = (existingData?.shapeType || "rectangle") !== (area.shape || "rectangle");

        if (shapeTypeChanged) {
          // Shape type changed - remove old and recreate with new shape
          canvas.remove(existing);
          const areaShape = createSpecialAreaShape(area, theme);
          areaShape.set({
            selectable: !readOnly,
            hasControls: !readOnly,
            evented: !readOnly,
          });
          canvas.add(areaShape);
        } else {
          if (positionChanged) {
            existing.set({
              left: area.x,
              top: area.y,
              angle: area.rotation,
            });
            existing.setCoords();
          }

          // Update dimensions if changed (from Properties panel manual input)
          if (dimensionsChanged && shape) {
            if (isCircle) {
              const circle = shape as fabric.Circle;
              const newRadius = Math.min(area.width, area.height) / 2;
              circle.set({ radius: newRadius });
            } else {
              const rect = shape as fabric.Rect;
              rect.set({
                width: area.width,
                height: area.height,
              });
            }
            existing.setCoords();
          }
        }
      } else {
        // Create new area shape
        const areaShape = createSpecialAreaShape(area, theme);
        areaShape.set({
          selectable: !readOnly,
          hasControls: !readOnly,
          evented: !readOnly,
        });
        canvas.add(areaShape);
      }
    });

    // Ensure proper z-index layering:
    // 1. Floor plan (bottom)
    if (floorPlanImageRef.current) {
      canvas.sendObjectToBack(floorPlanImageRef.current);
    }
    // 2. Special areas (middle) - bring each forward after floor plan
    specialAreas.forEach((area) => {
      const areaObj = canvas
        .getObjects()
        .find(
          (obj) =>
            (obj as fabric.Group & { data?: { areaId?: string } }).data
              ?.areaId === area.id
        );
      if (areaObj) {
        canvas.bringObjectForward(areaObj);
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

    if (!canvas || !isInitialized) {
      return;
    }

    // CRITICAL: Skip canvas rebuild if any tables are being actively dragged
    // This prevents React Query refetches from wiping out in-progress drags
    if (activeObjectsRef.current.size > 0) {
      return;
    }

    // CRITICAL: Skip position updates if a drag operation completed recently
    // This prevents stale state from React Query from overwriting the new position
    // Increased to 5 seconds to allow for API call, cache update, and React re-render
    const timeSinceDrag = Date.now() - lastDragEndRef.current;
    if (timeSinceDrag < 5000) {
      return;
    }

    // Get existing table objects (exclude grid lines, floor plan, and special areas)
    const existingTableObjects = canvas.getObjects().filter((obj) => {
      const customObj = obj as fabric.Object & {
        isGridLine?: boolean;
        isFloorPlan?: boolean;
        data?: Record<string, unknown>;
      };
      // Keep objects that are NOT grid lines, NOT floor plans, and NOT special areas
      return (
        !customObj.isGridLine &&
        !customObj.isFloorPlan &&
        customObj.data?.areaType !== "special"
      );
    }) as (fabric.Group & { data?: Record<string, unknown> })[];

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
        const isActiveObject = activeObjectsRef.current.has(table.id);

        // Only update position if it differs significantly AND table isn't being moved
        const positionChanged =
          Math.abs((existing.left ?? 0) - table.x_position) > 2 ||
          Math.abs((existing.top ?? 0) - table.y_position) > 2 ||
          Math.abs((existing.angle ?? 0) - table.rotation) > 2;

        // Check if we have a stored dragged position for this table
        const storedDragPosition = draggedPositionsRef.current.get(table.id);
        const stateMatchesDrag =
          storedDragPosition &&
          Math.abs(table.x_position - storedDragPosition.x) < 5 &&
          Math.abs(table.y_position - storedDragPosition.y) < 5;

        if (positionChanged && !isActiveObject) {
          // If we have a stored drag position and the incoming state doesn't match it,
          // the state is stale - skip the sync
          if (storedDragPosition && !stateMatchesDrag) {
            // Skip position sync - state is stale, canvas has correct position
          } else {
            existing.set({
              left: table.x_position,
              top: table.y_position,
              angle: table.rotation,
            });
            existing.setCoords();

            // Clear the stored drag position since state now matches canvas
            if (stateMatchesDrag) {
              draggedPositionsRef.current.delete(table.id);
            }
          }
        } else if (!positionChanged) {
          // Clear stored position if state and canvas match
          if (storedDragPosition) {
            draggedPositionsRef.current.delete(table.id);
          }
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

    // Render grid lines if enabled
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

    // CRITICAL: Skip table recreation if drag operation in progress or recently completed
    // This prevents the theme effect from recreating tables with stale positions
    if (activeObjectsRef.current.size > 0) {
      return;
    }

    const timeSinceDrag = Date.now() - lastDragEndRef.current;
    if (timeSinceDrag < 5000) {
      return;
    }

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
      if (!canvas || !target) {
        return;
      }

      // Phase 6.3.7: Handle floor plan move
      // Store absolute position and scale - keeps floor plan, tables, and special areas in same coordinate system
      // Note: Future enhancement (Option A) would use relative positioning for responsive scaling
      const customObj = target as fabric.Object & { isFloorPlan?: boolean };
      if (customObj.isFloorPlan) {
        const left = target.left ?? 0;
        const top = target.top ?? 0;
        const currentScaleX = target.scaleX ?? 1;
        const currentScaleY = target.scaleY ?? 1;

        // Store absolute position and scale values for persistence
        if (onFloorPlanMoveRef.current) {
          onFloorPlanMoveRef.current(left, top, currentScaleX, currentScaleY);
        }
        return;
      }

      const obj = target as fabric.Group & { data?: Record<string, unknown> };
      const data = obj.data;

      if (!data) {
        return;
      }

      // Phase 6.3.7: Handle special area modifications
      if (data.areaType === "special" && data.areaId) {
        const areaId = data.areaId as string;

        // Record modification time to prevent snap-back from state updates
        lastSpecialAreaModifiedRef.current = Date.now();

        // Mark this area as being actively manipulated
        activeSpecialAreasRef.current.add(areaId);

        // Get the shape (first child) from the group to calculate dimensions
        // Phase 6.3.7: Handle both rectangle and circle shapes
        const items = obj.getObjects();
        const shape = items[0] as fabric.Rect | fabric.Circle | undefined;
        const text = items[1] as fabric.FabricText | undefined;
        const isCircle = data.shapeType === "circle";

        let width: number | undefined;
        let height: number | undefined;

        // Check if scaling occurred (resize via handles)
        const hasScale =
          obj.scaleX !== undefined &&
          obj.scaleY !== undefined &&
          (obj.scaleX !== 1 || obj.scaleY !== 1);

        if (shape && hasScale) {
          if (isCircle) {
            // For circles, calculate new radius from scale
            const circle = shape as fabric.Circle;
            const currentRadius = circle.radius || 0;
            // Use the minimum scale to maintain circular shape
            const scaleFactor = Math.min(obj.scaleX || 1, obj.scaleY || 1);
            const newRadius = Math.round(currentRadius * scaleFactor);

            // Update circle radius
            circle.set({ radius: newRadius });

            // Width and height are both diameter for circles
            width = newRadius * 2;
            height = newRadius * 2;
          } else {
            // Rectangle: calculate actual dimensions from scale
            const rect = shape as fabric.Rect;
            width = Math.round((rect.width || 0) * (obj.scaleX || 1));
            height = Math.round((rect.height || 0) * (obj.scaleY || 1));

            // Update the internal rect's dimensions to match the scaled size
            rect.set({
              width: width,
              height: height,
            });
          }

          // Re-center the text within the new shape dimensions
          if (text) {
            text.set({
              left: 0,
              top: 0,
            });
          }

          // Reset group scale to 1 after updating internal dimensions
          obj.scaleX = 1;
          obj.scaleY = 1;

          // Update the group's internal cache
          obj.setCoords();
        } else if (shape) {
          // No scaling - just moving or rotating, use current shape dimensions
          if (isCircle) {
            const circle = shape as fabric.Circle;
            const radius = circle.radius || 0;
            width = radius * 2;
            height = radius * 2;
          } else {
            const rect = shape as fabric.Rect;
            width = rect.width;
            height = rect.height;
          }
        }

        // Apply grid snap for special areas too
        let left = obj.left ?? 0;
        let top = obj.top ?? 0;
        if (gridConfig.enabled) {
          left = snapToGrid(left, gridConfig.size);
          top = snapToGrid(top, gridConfig.size);
          obj.set({ left, top });
        }

        obj.setCoords();
        canvas.renderAll();

        // Call the update callback immediately (no debounce needed for special areas)
        if (onSpecialAreaUpdateRef.current) {
          onSpecialAreaUpdateRef.current(areaId, {
            x: left,
            y: top,
            width,
            height,
            rotation: obj.angle ?? 0,
          });
        }

        // Clear active status after a short delay to allow state updates
        setTimeout(() => {
          activeSpecialAreasRef.current.delete(areaId);
        }, 1000);

        return; // Don't process as table
      }

      // Tables require data.id
      if (!data.id) {
        return;
      }

      const tableId = data.id as UUID;

      // Record drag end time to prevent snap-back from stale state updates
      lastDragEndRef.current = Date.now();

      let left = obj.left ?? 0;
      let top = obj.top ?? 0;

      // Apply grid snap
      if (gridConfig.enabled) {
        left = snapToGrid(left, gridConfig.size);
        top = snapToGrid(top, gridConfig.size);
        obj.set({ left, top });
      }

      // Store the final canvas position for this table AFTER grid snap
      // This will be used to verify incoming state updates
      draggedPositionsRef.current.set(tableId, { x: left, y: top });

      // Constrain to canvas bounds
      constrainToCanvasBounds(obj, canvas);

      obj.setCoords();
      canvas.renderAll();

      // Get or create pending updates for this table
      const existingUpdates = pendingUpdatesRef.current.get(tableId) || {};

      // Always update position (the main operation when dragging)
      const finalLeft = obj.left ?? 0;
      const finalTop = obj.top ?? 0;
      existingUpdates.x = finalLeft;
      existingUpdates.y = finalTop;

      // Handle rotation - always include current rotation
      if (obj.angle !== undefined) {
        existingUpdates.rotation = obj.angle % 360;
      }

      // Handle resize (scaling)
      if (obj.scaleX && obj.scaleY && (obj.scaleX !== 1 || obj.scaleY !== 1)) {
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
          existingUpdates.width = Math.round(originalWidth * obj.scaleX);
          existingUpdates.height = Math.round(originalHeight * obj.scaleY);

          // Reset scale to 1 and update actual dimensions
          obj.scaleX = 1;
          obj.scaleY = 1;
          obj.setCoords();
        }
      }

      // Store the pending updates
      pendingUpdatesRef.current.set(tableId, existingUpdates);

      // Clear existing timer and set new one
      const existingTimer = debounceTimersRef.current.get(tableId);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      const timer = setTimeout(() => {
        const updates = pendingUpdatesRef.current.get(tableId);
        if (!updates) return;

        // Call position update if position changed
        if (
          updates.x !== undefined &&
          updates.y !== undefined &&
          onTableMoveRef.current
        ) {
          onTableMoveRef.current(tableId, updates.x, updates.y);
        }

        // Call rotation update if rotation changed (and there's no position update)
        // If there's a position update, we include rotation in onTableMove via the update object
        if (
          updates.rotation !== undefined &&
          onTableRotateRef.current &&
          updates.x === undefined
        ) {
          onTableRotateRef.current(tableId, updates.rotation);
        }

        // Call resize update if dimensions changed
        if (
          updates.width !== undefined &&
          updates.height !== undefined &&
          onTableResizeRef.current
        ) {
          onTableResizeRef.current(tableId, updates.width, updates.height);
        }

        // Clear pending updates
        pendingUpdatesRef.current.delete(tableId);

        // Clear AFTER calling callbacks to allow state to update first
        // Increased delay to ensure React Query mutation and optimistic update complete
        setTimeout(() => {
          activeObjectsRef.current.delete(tableId);
          debounceTimersRef.current.delete(tableId);
        }, 1000); // 1 second delay to ensure mutation completes
      }, 500);

      debounceTimersRef.current.set(tableId, timer);
    },
    [gridConfig]
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
        const tableId = obj.data.id as string;
        if (!activeObjectsRef.current.has(tableId)) {
          activeObjectsRef.current.add(tableId);
        }
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
  // Touch Gesture Handling (Phase 6.2.4: Pinch-to-Zoom)
  // ============================================================================

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    const canvasElement = canvasRef.current;
    if (!canvas || !canvasElement) return;

    // Calculate distance between two touch points
    const getTouchDistance = (touches: TouchList): number => {
      if (touches.length < 2) return 0;
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    // Get center point between two touches
    const getTouchCenter = (touches: TouchList): { x: number; y: number } => {
      if (touches.length < 2) {
        return { x: touches[0].clientX, y: touches[0].clientY };
      }
      return {
        x: (touches[0].clientX + touches[1].clientX) / 2,
        y: (touches[0].clientY + touches[1].clientY) / 2,
      };
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // Two-finger pinch gesture started
        e.preventDefault();
        touchStateRef.current.isPinching = true;
        touchStateRef.current.initialDistance = getTouchDistance(e.touches);
        touchStateRef.current.initialScale = canvas.getZoom();

        const center = getTouchCenter(e.touches);
        touchStateRef.current.lastTouchX = center.x;
        touchStateRef.current.lastTouchY = center.y;
      } else if (e.touches.length === 1) {
        // Single touch (potential pan gesture)
        touchStateRef.current.lastTouchX = e.touches[0].clientX;
        touchStateRef.current.lastTouchY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && touchStateRef.current.isPinching) {
        // Pinch-to-zoom
        e.preventDefault();

        const currentDistance = getTouchDistance(e.touches);
        const scale =
          (currentDistance / touchStateRef.current.initialDistance) *
          touchStateRef.current.initialScale;

        // Constrain zoom (0.1x to 5.0x)
        const constrainedScale = Math.max(0.1, Math.min(5, scale));

        // Get center point for zoom
        const center = getTouchCenter(e.touches);
        const rect = canvasElement.getBoundingClientRect();
        const point = new fabric.Point(
          center.x - rect.left,
          center.y - rect.top
        );

        // Apply zoom
        canvas.zoomToPoint(point, constrainedScale);

        // Emit zoom change
        if (onZoomChange && canvas.viewportTransform) {
          onZoomChange({
            scale: constrainedScale,
            offsetX: canvas.viewportTransform[4],
            offsetY: canvas.viewportTransform[5],
          });
        }

        canvas.renderAll();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        // End pinch gesture
        touchStateRef.current.isPinching = false;
      }
    };

    // Add touch event listeners
    canvasElement.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    canvasElement.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    canvasElement.addEventListener("touchend", handleTouchEnd);
    canvasElement.addEventListener("touchcancel", handleTouchEnd);

    return () => {
      canvasElement.removeEventListener("touchstart", handleTouchStart);
      canvasElement.removeEventListener("touchmove", handleTouchMove);
      canvasElement.removeEventListener("touchend", handleTouchEnd);
      canvasElement.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [onZoomChange]);

  // ============================================================================
  // FR-21: The system shall provide an interactive seating chart interface
  // Phase 6.3.5: Drag and Drop Assignments
  // ============================================================================

  /**
   * Find table object at canvas coordinates using Fabric.js hit-testing
   */
  const getTableAtPoint = useCallback(
    (clientX: number, clientY: number): TableLayout | null => {
      const canvas = fabricCanvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return null;

      // Convert client coordinates to canvas coordinates
      const rect = container.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      // Account for zoom/pan
      const zoom = canvas.getZoom();
      const vpt = canvas.viewportTransform;
      const canvasX = (x - (vpt?.[4] || 0)) / zoom;
      const canvasY = (y - (vpt?.[5] || 0)) / zoom;

      // Find objects at this point
      const objects = canvas.getObjects();
      for (let i = objects.length - 1; i >= 0; i--) {
        const obj = objects[i] as fabric.Object & {
          data?: { id?: string; areaType?: string };
          isGridLine?: boolean;
          isFloorPlan?: boolean;
        };

        // Skip non-table objects
        if (
          obj.isGridLine ||
          obj.isFloorPlan ||
          obj.data?.areaType === "special"
        ) {
          continue;
        }

        // Check if point is within object bounds
        if (
          obj.data?.id &&
          obj.containsPoint(new fabric.Point(canvasX, canvasY))
        ) {
          const table = tables.find((t) => t.id === obj.data?.id);
          if (table) return table;
        }
      }

      return null;
    },
    [tables]
  );

  /**
   * Highlight a table during drag hover
   */
  const highlightTable = useCallback((tableId: string, valid: boolean) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const obj = canvas.getObjects().find((o) => {
      const data = (o as fabric.Object & { data?: { id?: string } }).data;
      return data?.id === tableId;
    }) as fabric.Group | undefined;

    if (!obj) return;

    // Get the first child (the shape) from the group
    const items = obj.getObjects();
    const shape = items[0];
    if (!shape) return;

    // Store original styles if not already stored
    if (!originalTableStylesRef.current.has(tableId)) {
      originalTableStylesRef.current.set(tableId, {
        stroke: shape.stroke as string | undefined,
        strokeWidth: shape.strokeWidth || 2,
        strokeDashArray: shape.strokeDashArray as number[] | undefined,
      });
    }

    // Apply highlight styles
    shape.set({
      stroke: valid ? "#22c55e" : "#ef4444", // green-500 / red-500
      strokeWidth: 4,
      strokeDashArray: valid ? undefined : [8, 4],
    });

    canvas.renderAll();
  }, []);

  /**
   * Reset table highlight to original styles
   */
  const resetTableHighlight = useCallback((tableId: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const original = originalTableStylesRef.current.get(tableId);
    if (!original) return;

    const obj = canvas.getObjects().find((o) => {
      const data = (o as fabric.Object & { data?: { id?: string } }).data;
      return data?.id === tableId;
    }) as fabric.Group | undefined;

    if (!obj) return;

    const items = obj.getObjects();
    const shape = items[0];
    if (!shape) return;

    // Restore original styles
    shape.set({
      stroke: original.stroke,
      strokeWidth: original.strokeWidth,
      strokeDashArray: original.strokeDashArray,
    });

    originalTableStylesRef.current.delete(tableId);
    canvas.renderAll();
  }, []);

  /**
   * Handle drag over event - detect table and show visual feedback
   */
  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";

      if (!draggedGuestId) return;

      const table = getTableAtPoint(e.clientX, e.clientY);

      // If we moved to a different table or no table
      if (table?.id !== hoveredTableId) {
        // Reset previous highlight
        if (hoveredTableId) {
          resetTableHighlight(hoveredTableId);
        }

        if (table) {
          // Validate this drop
          const obstacles = getObstacles(specialAreas);
          const tableAssignments = seatAssignments.filter(
            (sa) => sa.table_layout_id === table.id
          ).length;

          // Note: We don't have guest plus-one info here, so assume no plus-one for now
          // The actual validation with plus-one happens in SeatingEditorLayout
          const validation = validateGuestDrop(
            table,
            obstacles,
            tableAssignments,
            false // Will be properly validated in drop handler
          );

          setHoveredTableId(table.id);
          setIsDropValid(validation.valid);
          highlightTable(table.id, validation.valid);
        } else {
          setHoveredTableId(null);
          setIsDropValid(false);
        }
      }
    },
    [
      draggedGuestId,
      hoveredTableId,
      specialAreas,
      seatAssignments,
      getTableAtPoint,
      highlightTable,
      resetTableHighlight,
    ]
  );

  /**
   * Handle drag leave event - reset visual feedback
   */
  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      // Only reset if leaving the container entirely
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const { clientX, clientY } = e;
      if (
        clientX < rect.left ||
        clientX > rect.right ||
        clientY < rect.top ||
        clientY > rect.bottom
      ) {
        if (hoveredTableId) {
          resetTableHighlight(hoveredTableId);
          setHoveredTableId(null);
          setIsDropValid(false);
        }
      }
    },
    [hoveredTableId, resetTableHighlight]
  );

  /**
   * Handle drop event - assign guest to table
   */
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();

      const guestId = e.dataTransfer.getData("guestId");
      if (!guestId) return;

      const table = getTableAtPoint(e.clientX, e.clientY);

      // Reset highlight
      if (hoveredTableId) {
        resetTableHighlight(hoveredTableId);
        setHoveredTableId(null);
        setIsDropValid(false);
      }

      if (table && onGuestDrop) {
        // Validate before calling
        const obstacles = getObstacles(specialAreas);
        const tableAssignments = seatAssignments.filter(
          (sa) => sa.table_layout_id === table.id
        ).length;

        const validation = validateGuestDrop(
          table,
          obstacles,
          tableAssignments,
          false // Plus-one validation happens in parent
        );

        if (validation.valid) {
          onGuestDrop(table.id as UUID, guestId);
        } else {
          console.warn("Drop rejected:", validation.reason);
        }
      }
    },
    [
      getTableAtPoint,
      hoveredTableId,
      onGuestDrop,
      specialAreas,
      seatAssignments,
      resetTableHighlight,
    ]
  );

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[600px] border border-border rounded-lg overflow-hidden ${className}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
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
