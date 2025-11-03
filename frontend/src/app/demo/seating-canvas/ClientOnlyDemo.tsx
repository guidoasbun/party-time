"use client";

/**
 * FR-21: The system shall provide an interactive seating chart interface.
 * Phase 6 - 6.1.3 Fabric.JS Canvas Setup
 *
 * Client-only wrapper for Seating Canvas Demo
 * Prevents SSR issues with useTheme hook
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import SeatingCanvas from "@/components/seating/SeatingCanvas";
import CanvasControls from "@/components/seating/CanvasControls";
import { useTheme } from "@/contexts/ThemeContext";
import {
  ArrowLeft,
  Sun,
  Moon,
  Monitor,
  Info,
  Table as TableIcon,
  Users,
  MapPin,
} from "lucide-react";
import type {
  SeatingChartWithTables,
  TableLayout,
  ZoomState,
  UUID,
} from "@/types";
import { TableType, VenueUnit } from "@/types";

interface ClientOnlyDemoProps {
  seatingChart: SeatingChartWithTables;
  tables: TableLayout[];
}

export default function ClientOnlyDemo({
  seatingChart,
  tables,
}: ClientOnlyDemoProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [selectedTableId, setSelectedTableId] = useState<UUID | null>(null);
  const [zoomState, setZoomState] = useState<ZoomState>({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  });
  const [isPanMode, setIsPanMode] = useState(false);
  const [gridConfig, setGridConfig] = useState({
    enabled: true,
    size: 20,
    color: "#e5e7eb",
    showLines: true,
  });
  const [readOnlyMode, setReadOnlyMode] = useState(false);

  // Prevent hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const selectedTable = tables.find((t) => t.id === selectedTableId);
  const canvasRef = { current: null };

  const handleThemeToggle = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const getThemeIcon = () => {
    if (theme === "light") return <Sun className="w-5 h-5" />;
    if (theme === "dark") return <Moon className="w-5 h-5" />;
    return <Monitor className="w-5 h-5" />;
  };

  const getThemeLabel = () => {
    if (theme === "light") return "Light";
    if (theme === "dark") return "Dark";
    return "System";
  };

  // Show loading state during SSR/hydration
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading canvas...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Link href="/demo">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Demos
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold">Seating Canvas Demo</h1>
            <p className="text-muted-foreground mt-1">
              Interactive Fabric.js canvas for seating chart management (Phase
              6.1.3)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleThemeToggle}
              className="flex items-center gap-2"
            >
              {getThemeIcon()}
              <span>{getThemeLabel()}</span>
            </Button>
          </div>
        </div>

        {/* Instructions Card */}
        <Card className="p-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold mb-2">How to Use</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>
                  <strong>Click</strong> on a table to select it
                </li>
                <li>
                  <strong>Drag</strong> tables to move them (grid snapping
                  enabled by default)
                </li>
                <li>
                  <strong>Rotate</strong> tables using the rotation handle
                </li>
                <li>
                  <strong>Resize</strong> tables using the corner handles
                </li>
                <li>
                  <strong>Zoom</strong> with mouse wheel, slider, or buttons
                </li>
                <li>
                  <strong>Pan</strong> by enabling pan mode or dragging the
                  canvas
                </li>
                <li>
                  <strong>Toggle Grid</strong> to show/hide grid lines
                </li>
                <li>
                  <strong>Read-Only Mode</strong> to prevent editing
                </li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
          {/* Left Sidebar - Controls and Info */}
          <div className="space-y-6">
            {/* Canvas Controls */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <TableIcon className="w-4 h-4" />
                Canvas Controls
              </h3>
              <CanvasControls
                canvasRef={canvasRef}
                zoomState={zoomState}
                onZoomChange={setZoomState}
                isPanMode={isPanMode}
                onPanModeToggle={() => setIsPanMode(!isPanMode)}
                gridConfig={gridConfig}
                onGridToggle={() =>
                  setGridConfig((prev) => ({
                    ...prev,
                    showLines: !prev.showLines,
                  }))
                }
              />
            </Card>

            {/* Mode Toggles */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Display Mode</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={readOnlyMode}
                    onChange={(e) => setReadOnlyMode(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-sm">Read-Only Mode</span>
                </label>
                <p className="text-xs text-muted-foreground">
                  Disable editing and dragging
                </p>
              </div>
            </Card>

            {/* Chart Statistics */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Chart Statistics
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Tables:</span>
                  <span className="font-medium">
                    {seatingChart.total_tables}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Capacity:</span>
                  <span className="font-medium">
                    {seatingChart.total_capacity} seats
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Venue Size:</span>
                  <span className="font-medium">
                    {seatingChart.venue_width} x {seatingChart.venue_height}{" "}
                    {seatingChart.venue_unit}
                  </span>
                </div>
              </div>
            </Card>

            {/* Selected Table Info */}
            {selectedTable && (
              <Card className="p-4 border-primary">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Selected Table
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Table Number:</span>
                    <span className="font-medium">
                      {selectedTable.table_number}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Table Type:</span>
                    <span className="font-medium capitalize">
                      {selectedTable.table_type}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Capacity:</span>
                    <span className="font-medium">
                      {selectedTable.capacity} seats
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Position:</span>
                    <span className="font-medium">
                      ({Math.round(selectedTable.x_position)},{" "}
                      {Math.round(selectedTable.y_position)})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Size:</span>
                    <span className="font-medium">
                      {Math.round(selectedTable.width)} x{" "}
                      {Math.round(selectedTable.height)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rotation:</span>
                    <span className="font-medium">
                      {Math.round(selectedTable.rotation)}°
                    </span>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Right Side - Canvas */}
          <Card className="p-6">
            <div className="mb-4">
              <h3 className="font-semibold text-lg">{seatingChart.name}</h3>
              <p className="text-sm text-muted-foreground">
                {tables.length} tables •{" "}
                {tables.reduce((sum, t) => sum + t.capacity, 0)} total seats
              </p>
            </div>

            <SeatingCanvas
              seatingChart={seatingChart}
              tables={tables}
              onTableSelect={setSelectedTableId}
              onTableMove={(tableId, x, y) => {
                console.log(`Table ${tableId} moved to (${x}, ${y})`);
              }}
              onTableResize={(tableId, width, height) => {
                console.log(`Table ${tableId} resized to ${width}x${height}`);
              }}
              onTableRotate={(tableId, rotation) => {
                console.log(`Table ${tableId} rotated to ${rotation}°`);
              }}
              readOnly={readOnlyMode}
              gridConfig={gridConfig}
              zoomState={zoomState}
              onZoomChange={setZoomState}
              theme={resolvedTheme === "dark" ? "dark" : "light"}
            />
          </Card>
        </div>

        {/* Footer Note */}
        <Card className="p-4 bg-muted/50">
          <p className="text-sm text-muted-foreground text-center">
            This is a demo with mock data. In production, tables can be added,
            edited, and guests can be assigned to seats.
          </p>
        </Card>
      </div>
    </div>
  );
}
