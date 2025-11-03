'use client';

/**
 * Seating chart canvas component using Fabric.js
 *
 * FR-21: Interactive seating chart interface
 * Phase 6.1.3: Fabric.js Canvas Setup
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as fabric from 'fabric';
import {
  SeatingChartWithTables,
  TableLayout,
  UUID,
  ZoomState,
} from '@/types';
import {
  createTableShape,
  snapToGrid,
  constrainToCanvasBounds,
  GridConfig,
  renderGridLines,
} from '@/utils/fabric-shapes';

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
  theme?: 'light' | 'dark';
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
  className = '',
  gridConfig = { enabled: true, size: 20, color: '#e5e7eb', showLines: true },
  zoomState = { scale: 1, offsetX: 0, offsetY: 0 },
  onZoomChange,
  theme = 'light',
}: SeatingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Debounce timer for API updates
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

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
      backgroundColor: theme === 'dark' ? '#0a0a0a' : '#ffffff',
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
  // Render Tables
  // ============================================================================

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !isInitialized) return;

    // Clear existing table objects (but keep grid lines)
    const existingTables = canvas.getObjects().filter(
      (obj) => !(obj as fabric.Object & { isGridLine?: boolean }).isGridLine
    );
    existingTables.forEach((obj) => canvas.remove(obj));

    // Render grid lines
    if (gridConfig.enabled && gridConfig.showLines) {
      renderGridLines(canvas, gridConfig);
    }

    // Add table shapes
    tables.forEach((table) => {
      const tableShape = createTableShape(table, {
        selectable: !readOnly,
        hasControls: !readOnly,
      });

      canvas.add(tableShape);
    });

    canvas.renderAll();
  }, [tables, isInitialized, readOnly, gridConfig]);

  // ============================================================================
  // Theme Change Handling
  // ============================================================================

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Update canvas background color
    canvas.backgroundColor = theme === 'dark' ? '#0a0a0a' : '#ffffff';
    canvas.renderAll();

    // Re-render all tables to update colors
    const tableObjects = canvas.getObjects().filter(
      (obj) => !(obj as fabric.Object & { isGridLine?: boolean }).isGridLine
    );

    tableObjects.forEach((obj) => {
      const data = (obj as fabric.Group & { data?: Record<string, unknown> }).data;
      if (data && data.id) {
        const table = tables.find((t) => t.id === data.id);
        if (table) {
          canvas.remove(obj);
          const newShape = createTableShape(table, {
            selectable: !readOnly,
            hasControls: !readOnly,
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

    canvas.on('mouse:wheel', handleWheel);

    return () => {
      canvas.off('mouse:wheel', handleWheel);
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
        debounceTimerRef.current = setTimeout(() => {
          onTableMove(tableId, obj.left ?? 0, obj.top ?? 0);
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
      if (onTableResize && obj.scaleX && obj.scaleY) {
        const boundingRect = obj.getBoundingRect();
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
          onTableResize(tableId, boundingRect.width, boundingRect.height);
        }, 500);
      }
    },
    [gridConfig, onTableMove, onTableRotate, onTableResize]
  );

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.on('object:modified', handleObjectModified);

    return () => {
      canvas.off('object:modified', handleObjectModified);
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

      const obj = selected[0] as fabric.Group & { data?: Record<string, unknown> };
      const data = obj.data;

      if (data && data.id) {
        onTableSelect(data.id as UUID);
      }
    };

    const handleDeselection = () => {
      onTableSelect(null);
    };

    canvas.on('selection:created', handleSelection);
    canvas.on('selection:updated', handleSelection);
    canvas.on('selection:cleared', handleDeselection);

    return () => {
      canvas.off('selection:created', handleSelection);
      canvas.off('selection:updated', handleSelection);
      canvas.off('selection:cleared', handleDeselection);
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

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
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
