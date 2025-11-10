"use client";

/**
 * ResponsiveToolbar Component
 *
 * FR-21: The system shall provide an interactive seating chart interface.
 * Phase 6.2.4: Mobile & Tablet Views
 * Mobile-optimized toolbar for seating chart controls
 *
 * Features:
 * - Responsive layout (vertical on mobile, horizontal on desktop)
 * - Touch-friendly buttons (44px min height)
 * - Floating action button layout for mobile
 * - Essential controls only on small screens
 * - Theme-aware styling
 */

import React, { useCallback, useState } from "react";
import * as fabric from "fabric";
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, Menu, X } from "lucide-react";
import { ZoomState } from "@/types";
import { cn } from "@/lib/utils";

export interface ResponsiveToolbarProps {
  canvasRef: React.RefObject<fabric.Canvas | null>;
  zoomState: ZoomState;
  onZoomChange: (newZoom: ZoomState) => void;
  className?: string;
  isMobile?: boolean;
}

export default function ResponsiveToolbar({
  canvasRef,
  zoomState,
  onZoomChange,
  className = "",
  isMobile = false,
}: ResponsiveToolbarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

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
    if (isMobile) {
      setIsExpanded(false);
    }
  }, [canvasRef, onZoomChange, isMobile]);

  const handleFitToScreen = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();

    // Get bounding box of all objects
    const allObjects = canvas
      .getObjects()
      .filter(
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
    if (isMobile) {
      setIsExpanded(false);
    }
  }, [canvasRef, onZoomChange, handleResetZoom, isMobile]);

  const zoomPercentage = Math.round(zoomState.scale * 100);

  // ============================================================================
  // Mobile Floating Action Button Layout
  // ============================================================================

  if (isMobile) {
    return (
      <div className={cn("fixed bottom-4 right-4 z-20", className)}>
        {/* Expanded Controls */}
        {isExpanded && (
          <div className="mb-3 flex flex-col gap-2 bg-card border border-border rounded-lg p-2 shadow-xl">
            {/* Zoom Percentage Display */}
            <div className="text-center py-2 px-3 bg-muted rounded-md">
              <span className="text-sm font-medium text-foreground">
                {zoomPercentage}%
              </span>
            </div>

            {/* Zoom In */}
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoomState.scale >= 5}
              className={cn(
                "flex items-center justify-center gap-2 h-11 px-4 rounded-md",
                "bg-secondary hover:bg-secondary/80 text-foreground",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-colors font-medium"
              )}
              aria-label="Zoom In"
            >
              <ZoomIn className="w-5 h-5" />
              <span>Zoom In</span>
            </button>

            {/* Zoom Out */}
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoomState.scale <= 0.1}
              className={cn(
                "flex items-center justify-center gap-2 h-11 px-4 rounded-md",
                "bg-secondary hover:bg-secondary/80 text-foreground",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-colors font-medium"
              )}
              aria-label="Zoom Out"
            >
              <ZoomOut className="w-5 h-5" />
              <span>Zoom Out</span>
            </button>

            {/* Reset Zoom */}
            <button
              type="button"
              onClick={handleResetZoom}
              className={cn(
                "flex items-center justify-center gap-2 h-11 px-4 rounded-md",
                "bg-secondary hover:bg-secondary/80 text-foreground",
                "transition-colors font-medium"
              )}
              aria-label="Reset Zoom"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Reset</span>
            </button>

            {/* Fit to Screen */}
            <button
              type="button"
              onClick={handleFitToScreen}
              className={cn(
                "flex items-center justify-center gap-2 h-11 px-4 rounded-md",
                "bg-secondary hover:bg-secondary/80 text-foreground",
                "transition-colors font-medium"
              )}
              aria-label="Fit to Screen"
            >
              <Maximize2 className="w-5 h-5" />
              <span>Fit to Screen</span>
            </button>
          </div>
        )}

        {/* Toggle Button */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "w-14 h-14 rounded-full shadow-lg",
            "bg-primary text-primary-foreground",
            "hover:bg-primary/90",
            "flex items-center justify-center",
            "transition-all duration-200",
            isExpanded && "rotate-90"
          )}
          aria-label={isExpanded ? "Close controls" : "Open controls"}
          aria-expanded={isExpanded}
        >
          {isExpanded ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>
    );
  }

  // ============================================================================
  // Desktop/Tablet Horizontal Layout
  // ============================================================================

  return (
    <div
      className={cn(
        "flex items-center gap-2 bg-card border border-border rounded-lg p-2 shadow-lg",
        className
      )}
    >
      {/* Zoom Out */}
      <button
        type="button"
        onClick={handleZoomOut}
        disabled={zoomState.scale <= 0.1}
        className={cn(
          "p-2.5 rounded-md",
          "bg-secondary hover:bg-secondary/80",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "transition-colors"
        )}
        title="Zoom Out"
        aria-label="Zoom Out"
      >
        <ZoomOut className="w-5 h-5" />
      </button>

      {/* Zoom Percentage */}
      <div className="px-3 py-2 bg-muted rounded-md min-w-[70px] text-center">
        <span className="text-sm font-medium text-foreground">
          {zoomPercentage}%
        </span>
      </div>

      {/* Zoom In */}
      <button
        type="button"
        onClick={handleZoomIn}
        disabled={zoomState.scale >= 5}
        className={cn(
          "p-2.5 rounded-md",
          "bg-secondary hover:bg-secondary/80",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "transition-colors"
        )}
        title="Zoom In"
        aria-label="Zoom In"
      >
        <ZoomIn className="w-5 h-5" />
      </button>

      {/* Divider */}
      <div className="h-8 w-px bg-border mx-1" />

      {/* Reset Zoom */}
      <button
        type="button"
        onClick={handleResetZoom}
        className={cn(
          "p-2.5 rounded-md",
          "bg-secondary hover:bg-secondary/80",
          "transition-colors"
        )}
        title="Reset Zoom"
        aria-label="Reset Zoom"
      >
        <RotateCcw className="w-5 h-5" />
      </button>

      {/* Fit to Screen */}
      <button
        type="button"
        onClick={handleFitToScreen}
        className={cn(
          "p-2.5 rounded-md",
          "bg-secondary hover:bg-secondary/80",
          "transition-colors"
        )}
        title="Fit to Screen"
        aria-label="Fit to Screen"
      >
        <Maximize2 className="w-5 h-5" />
      </button>
    </div>
  );
}
