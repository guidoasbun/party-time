'use client';

/**
 * Canvas control panel for zoom, pan, and grid controls
 *
 * FR-21: Interactive seating chart interface
 * Phase 6.1.3: Fabric.js Canvas Setup
 */

import React, { useCallback } from 'react';
import * as fabric from 'fabric';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Hand,
  Grid3x3,
  RotateCcw,
} from 'lucide-react';
import { ZoomState } from '@/types';
import { GridConfig } from '@/utils/fabric-shapes';
import { cn } from '@/lib/utils';

// ============================================================================
// Type Definitions
// ============================================================================

export interface CanvasControlsProps {
  canvasRef: React.RefObject<fabric.Canvas | null>;
  zoomState: ZoomState;
  onZoomChange: (newZoom: ZoomState) => void;
  isPanMode: boolean;
  onPanModeToggle: () => void;
  gridConfig: GridConfig;
  onGridToggle: () => void;
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export default function CanvasControls({
  canvasRef,
  zoomState,
  onZoomChange,
  isPanMode,
  onPanModeToggle,
  gridConfig,
  onGridToggle,
  className = '',
}: CanvasControlsProps) {
  // ============================================================================
  // Zoom Controls
  // ============================================================================

  const handleZoomIn = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let newZoom = zoomState.scale * 1.2;
    newZoom = Math.min(5, newZoom); // Max 5x

    canvas.setZoom(newZoom);

    if (canvas.viewportTransform) {
      onZoomChange({
        scale: newZoom,
        offsetX: canvas.viewportTransform[4],
        offsetY: canvas.viewportTransform[5],
      });
    }

    canvas.renderAll();
  }, [canvasRef, zoomState, onZoomChange]);

  const handleZoomOut = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let newZoom = zoomState.scale / 1.2;
    newZoom = Math.max(0.1, newZoom); // Min 0.1x

    canvas.setZoom(newZoom);

    if (canvas.viewportTransform) {
      onZoomChange({
        scale: newZoom,
        offsetX: canvas.viewportTransform[4],
        offsetY: canvas.viewportTransform[5],
      });
    }

    canvas.renderAll();
  }, [canvasRef, zoomState, onZoomChange]);

  const handleResetZoom = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.setZoom(1);
    canvas.viewportTransform = [1, 0, 0, 1, 0, 0];

    onZoomChange({
      scale: 1,
      offsetX: 0,
      offsetY: 0,
    });

    canvas.renderAll();
  }, [canvasRef, onZoomChange]);

  const handleFitToScreen = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();

    // Get bounding box of all objects
    const allObjects = canvas.getObjects().filter(
      (obj) => !(obj as fabric.Object & { isGridLine?: boolean }).isGridLine
    );

    if (allObjects.length === 0) {
      handleResetZoom();
      return;
    }

    // Calculate bounds
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    allObjects.forEach((obj) => {
      const rect = obj.getBoundingRect();
      minX = Math.min(minX, rect.left);
      minY = Math.min(minY, rect.top);
      maxX = Math.max(maxX, rect.left + rect.width);
      maxY = Math.max(maxY, rect.top + rect.height);
    });

    const objectsWidth = maxX - minX;
    const objectsHeight = maxY - minY;

    // Calculate zoom to fit with padding
    const padding = 50;
    const scaleX = (canvasWidth - padding * 2) / objectsWidth;
    const scaleY = (canvasHeight - padding * 2) / objectsHeight;
    const newZoom = Math.min(scaleX, scaleY, 5); // Max 5x

    // Calculate center offset
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const offsetX = canvasWidth / 2 - centerX * newZoom;
    const offsetY = canvasHeight / 2 - centerY * newZoom;

    canvas.setZoom(newZoom);
    canvas.viewportTransform = [newZoom, 0, 0, newZoom, offsetX, offsetY];

    onZoomChange({
      scale: newZoom,
      offsetX,
      offsetY,
    });

    canvas.renderAll();
  }, [canvasRef, onZoomChange, handleResetZoom]);

  const handleZoomSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const newZoom = parseFloat(e.target.value);
      canvas.setZoom(newZoom);

      if (canvas.viewportTransform) {
        onZoomChange({
          scale: newZoom,
          offsetX: canvas.viewportTransform[4],
          offsetY: canvas.viewportTransform[5],
        });
      }

      canvas.renderAll();
    },
    [canvasRef, onZoomChange]
  );

  // ============================================================================
  // Render
  // ============================================================================

  const zoomPercentage = Math.round(zoomState.scale * 100);

  return (
    <div
      className={cn(
        // Phase 6.2.4: Responsive layout
        'flex flex-col gap-2 bg-card border border-border rounded-lg shadow-lg',
        // Responsive padding: smaller on mobile
        'p-2 sm:p-3',
        className
      )}
    >
      {/* Zoom Controls */}
      <div className="flex flex-col gap-2">
        <div className="text-xs font-medium text-muted-foreground">Zoom</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoomState.scale <= 0.1}
            className={cn(
              // Phase 6.2.4: Touch-friendly button size
              'p-2 sm:p-2.5 rounded-md',
              'bg-secondary hover:bg-secondary/80',
              'disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
              // Minimum 44px touch target on mobile
              'min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0'
            )}
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <div className="flex flex-col items-center gap-1 flex-1">
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={zoomState.scale}
              onChange={handleZoomSliderChange}
              className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
              aria-label="Zoom Slider"
            />
            <span className="text-xs font-mono text-muted-foreground">
              {zoomPercentage}%
            </span>
          </div>
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoomState.scale >= 5}
            className={cn(
              'p-2 sm:p-2.5 rounded-md',
              'bg-secondary hover:bg-secondary/80',
              'disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
              'min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0'
            )}
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleResetZoom}
            className="flex-1 p-2 rounded-md bg-secondary hover:bg-secondary/80 transition-colors text-xs flex items-center justify-center gap-1"
            title="Reset Zoom"
            aria-label="Reset Zoom"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
          <button
            type="button"
            onClick={handleFitToScreen}
            className="flex-1 p-2 rounded-md bg-secondary hover:bg-secondary/80 transition-colors text-xs flex items-center justify-center gap-1"
            title="Fit to Screen"
            aria-label="Fit to Screen"
          >
            <Maximize2 className="w-3 h-3" />
            <span>Fit</span>
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* View Controls */}
      <div className="flex flex-col gap-2">
        <div className="text-xs font-medium text-muted-foreground">View</div>
        <button
          type="button"
          onClick={onPanModeToggle}
          className={`p-2 rounded-md transition-colors text-xs flex items-center justify-center gap-2 ${
            isPanMode
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary hover:bg-secondary/80'
          }`}
          title={isPanMode ? 'Exit Pan Mode' : 'Enter Pan Mode'}
          aria-label={isPanMode ? 'Exit Pan Mode' : 'Enter Pan Mode'}
          aria-pressed={isPanMode}
        >
          <Hand className="w-4 h-4" />
          <span>Pan Mode</span>
        </button>
        <button
          type="button"
          onClick={onGridToggle}
          className={`p-2 rounded-md transition-colors text-xs flex items-center justify-center gap-2 ${
            gridConfig.showLines
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary hover:bg-secondary/80'
          }`}
          title={gridConfig.showLines ? 'Hide Grid' : 'Show Grid'}
          aria-label={gridConfig.showLines ? 'Hide Grid' : 'Show Grid'}
          aria-pressed={gridConfig.showLines}
        >
          <Grid3x3 className="w-4 h-4" />
          <span>Grid</span>
        </button>
      </div>

      {/* Grid Size Info */}
      {gridConfig.enabled && gridConfig.showLines && (
        <div className="text-xs text-muted-foreground text-center">
          Grid: {gridConfig.size}px
        </div>
      )}
    </div>
  );
}
