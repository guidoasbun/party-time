/**
 * FR-21: The system shall provide an interactive seating chart interface.
 * Phase 6.2.5: Seating Chart Polish & Integration
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import { TableTemplates } from "./TableTemplates";
import {
  ChevronLeft,
  ChevronRight,
  Undo2,
  Redo2,
  Plus,
  Grid3x3,
  Table,
} from "lucide-react";

import SeatingCanvas from "./SeatingCanvas";
import { GuestSidebar } from "./GuestSidebar";
import { TableToolbar } from "./TableToolbar";
import { TableProperties } from "./TableProperties";
import { SeatAssignmentPanel } from "./SeatAssignmentPanel";
import { VenueLayout } from "./VenueLayout";
import { UnseatedGuestsIndicator } from "./UnseatedGuestsIndicator";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useToast } from "@/hooks/useToast";
import { useTheme } from "@/contexts/ThemeContext";
import type {
  SeatingChart,
  SeatingChartWithTables,
  TableLayout,
  TableLayoutWithSeats,
  TableLayoutCreate,
  SeatingChartUpdate,
  SeatAssignment,
  SeatingStatistics,
} from "@/types/seating.types";
import type { SpecialArea, FloorPlanSettings, VenueMetadata } from "@/types/venue.types";
import { TableType } from "@/types/seating.types";
import type { Guest } from "@/types/guest.types";
import { RsvpStatus } from "@/types/guest.types";
import type { Event } from "@/types/event.types";
import { cn } from "@/lib/utils";

interface SeatingEditorLayoutProps {
  event: Event;
  chart: SeatingChartWithTables | null;
  tables: TableLayout[];
  seatAssignments: SeatAssignment[];
  guests: Guest[];
  statistics?: SeatingStatistics | null;
  selectedTableId: string | null;
  canUndo: boolean;
  canRedo: boolean;
  onSelectTable: (tableId: string | null) => void;
  onUpdateTable: (tableId: string, data: Partial<TableLayout>) => Promise<void>;
  onDeleteTable: (tableId: string) => Promise<void>;
  onAssignGuest: (
    tableId: string,
    guestId: string,
    seatNumber?: number
  ) => Promise<void>;
  onUnassignSeat: (seatId: string) => Promise<void>;
  onSave: () => Promise<void>;
  onUndo: () => void;
  onRedo: () => void;
  onCreateTable: (
    tableData: Omit<TableLayoutCreate, "seating_chart_id">
  ) => Promise<TableLayout>;
  onBulkCreateTables: (
    tables: Omit<TableLayoutCreate, "seating_chart_id">[]
  ) => Promise<TableLayout[]>;
  onUpdateChart: (updates: SeatingChartUpdate) => Promise<SeatingChart>;
}

export function SeatingEditorLayout({
  event,
  chart,
  tables,
  seatAssignments,
  guests,
  statistics,
  selectedTableId,
  canUndo,
  canRedo,
  onSelectTable,
  onUpdateTable,
  onDeleteTable,
  onAssignGuest,
  onUnassignSeat,
  onSave,
  onUndo,
  onRedo,
  onCreateTable,
  onBulkCreateTables,
  onUpdateChart,
}: SeatingEditorLayoutProps) {
  const { toast } = useToast();
  const { resolvedTheme } = useTheme();
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [rightTab, setRightTab] = useState("tables");
  const [showGrid, setShowGrid] = useState(true);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [draggedGuestId, setDraggedGuestId] = useState<string | null>(null);
  // Track pending assignments to prevent race conditions / double-drops
  const [pendingAssignments, setPendingAssignments] = useState<Set<string>>(
    () => new Set()
  );

  // Phase 6.3.7: Local state for real-time venue layout updates
  const [localFloorPlanUrl, setLocalFloorPlanUrl] = useState<string | undefined>(
    chart?.background_image_url || undefined
  );
  const [localSpecialAreas, setLocalSpecialAreas] = useState<SpecialArea[]>(
    (chart?.chart_metadata?.specialAreas as SpecialArea[]) || []
  );
  const [localFloorPlanSettings, setLocalFloorPlanSettings] = useState<FloorPlanSettings | undefined>(
    (chart?.chart_metadata?.floorPlanSettings as FloorPlanSettings) || undefined
  );

  // Sync local venue state when chart data changes (e.g., after save or initial load)
  useEffect(() => {
    if (chart) {
      setLocalFloorPlanUrl(chart.background_image_url || undefined);
      setLocalSpecialAreas((chart.chart_metadata?.specialAreas as SpecialArea[]) || []);
      setLocalFloorPlanSettings((chart.chart_metadata?.floorPlanSettings as FloorPlanSettings) || undefined);
    }
  }, [chart]);

  // Filter guests for sidebar - include attending and pending
  // GuestSidebar and UnseatedGuestsIndicator will further filter to attending only
  const attendingGuests = guests.filter(
    (g) =>
      g.rsvp_status === RsvpStatus.ATTENDING ||
      g.rsvp_status === RsvpStatus.PENDING
  );

  // Get selected table details
  const selectedTable = tables.find((t) => t.id === selectedTableId);
  const selectedTableAssignments = selectedTable
    ? seatAssignments.filter((sa) => sa.table_layout_id === selectedTable.id)
    : [];

  // Handle table creation
  const handleCreateTable = useCallback(async () => {
    // Create a default table in the center of the canvas
    const centerX = (chart?.venue_width || 1200) / 2 - 50; // 50 is half of default width
    const centerY = (chart?.venue_height || 800) / 2 - 50; // 50 is half of default height
    const tableNumber = `Table ${tables.length + 1}`;

    await onCreateTable({
      table_number: tableNumber,
      table_type: TableType.ROUND,
      capacity: 8,
      width: 100,
      height: 100,
      x_position: centerX,
      y_position: centerY,
      rotation: 0,
    });
  }, [chart, tables.length, onCreateTable]);

  // Responsive adjustments
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setLeftSidebarOpen(false);
        setRightSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-full">
      {/* Left Sidebar - Guests */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out border-r bg-card",
          leftSidebarOpen ? "w-80" : "w-0"
        )}
      >
        {leftSidebarOpen && (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Guests</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLeftSidebarOpen(false)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
              <UnseatedGuestsIndicator
                guests={attendingGuests}
                seatingChart={chart ? { ...chart, tables } : undefined}
                seatAssignments={seatAssignments}
              />
            </div>
            <div className="flex-1 overflow-hidden">
              <GuestSidebar
                guests={attendingGuests}
                seatingChart={chart ? { ...chart, tables } : undefined}
                seatAssignments={seatAssignments}
                inline={true}
                onGuestDragStart={(guest) => {
                  // Set dragged guest ID for canvas to detect
                  setDraggedGuestId(guest.id);
                }}
                onGuestDragEnd={() => {
                  // Clear dragged guest ID when drag ends
                  setDraggedGuestId(null);
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Toggle button for left sidebar when closed */}
      {!leftSidebarOpen && (
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="h-full rounded-none"
            onClick={() => setLeftSidebarOpen(true)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Center - Canvas Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="border-b bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Undo/Redo */}
              <Button
                variant="outline"
                size="sm"
                onClick={onUndo}
                disabled={!canUndo}
                title="Undo (Cmd/Ctrl+Z)"
              >
                <Undo2 className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onRedo}
                disabled={!canRedo}
                title="Redo (Cmd/Ctrl+Shift+Z)"
              >
                <Redo2 className="h-4 w-4" />
              </Button>

              <div className="h-6 w-px bg-border mx-2" />

              {/* Table Toolbar */}
              <TableToolbar
                tableCount={tables.length}
                selectedTableIds={selectedTableId ? [selectedTableId] : []}
                onAddTable={handleCreateTable}
                onAddFromTemplate={() => {
                  // Open template modal
                  setShowTemplateModal(true);
                }}
                onDeleteSelected={
                  selectedTableId
                    ? async () => {
                        await onDeleteTable(selectedTableId);
                        toast({
                          title: "Table deleted",
                          description: "The selected table has been removed.",
                        });
                      }
                    : () => {}
                }
                onDuplicateSelected={async () => {
                  // Duplicate selected tables with offset positions
                  if (selectedTableId) {
                    const tableToClone = tables.find(
                      (t) => t.id === selectedTableId
                    );
                    if (tableToClone) {
                      const offset = 50; // Offset duplicated tables
                      const newTableNumber = `Table ${tables.length + 1}`;
                      await onCreateTable({
                        table_number: newTableNumber,
                        table_type: tableToClone.table_type,
                        capacity: tableToClone.capacity,
                        width: tableToClone.width,
                        height: tableToClone.height,
                        x_position: tableToClone.x_position + offset,
                        y_position: tableToClone.y_position + offset,
                        rotation: tableToClone.rotation,
                      });
                      toast({
                        title: "Table duplicated",
                        description: `Created ${newTableNumber}`,
                      });
                    }
                  }
                }}
              />

              <div className="h-6 w-px bg-border mx-2" />

              {/* Grid Toggle */}
              <Button
                variant={showGrid ? "default" : "outline"}
                size="sm"
                onClick={() => setShowGrid(!showGrid)}
                title="Toggle Grid"
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
            </div>

            {/* Zoom controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoomLevel(Math.min(5, zoomLevel * 1.2))}
                title="Zoom In"
              >
                +
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                {Math.round(zoomLevel * 100)}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoomLevel(Math.max(0.1, zoomLevel / 1.2))}
                title="Zoom Out"
              >
                -
              </Button>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative bg-muted/10">
          {chart ? (
            <SeatingCanvas
              seatingChart={{ ...chart, tables } as SeatingChartWithTables}
              tables={tables}
              onTableSelect={onSelectTable}
              onTableMove={(tableId, x, y) => {
                onUpdateTable(tableId, {
                  x_position: Number(x),
                  y_position: Number(y),
                });
              }}
              onTableRotate={(tableId, rotation) => {
                onUpdateTable(tableId, { rotation });
              }}
              onTableResize={(tableId, width, height) => {
                onUpdateTable(tableId, { width, height });
              }}
              // Phase 6.3.7: Use local venue state for real-time canvas updates
              floorPlanUrl={localFloorPlanUrl}
              floorPlanSettings={localFloorPlanSettings}
              specialAreas={localSpecialAreas}
              theme={resolvedTheme}
              zoomState={{ scale: zoomLevel, offsetX: 0, offsetY: 0 }}
              onZoomChange={(newZoom) => setZoomLevel(newZoom.scale)}
              // Phase 6.3.5: Drag-and-Drop Assignment Venue-Aware

              //FR-21: The system shall provide an interactive seating chart interface
              // Phase 6.3.5: Drag and Drop Assignments
              draggedGuestId={draggedGuestId}
              seatAssignments={seatAssignments}
              onGuestDrop={async (tableId, guestId) => {
                // Find table to validate capacity
                const table = tables.find((t) => t.id === tableId);
                if (!table) return;

                // Check if assignment is already in-flight (prevent double-drops)
                if (pendingAssignments.has(guestId)) {
                  console.warn("Assignment already in progress for this guest");
                  setDraggedGuestId(null);
                  return;
                }

                // Check if guest is already assigned to ANY table
                const existingAssignment = seatAssignments.find(
                  (sa) => sa.guest_id === guestId
                );
                if (existingAssignment) {
                  console.warn("Guest is already assigned to a table");
                  setDraggedGuestId(null);
                  return;
                }

                // Get existing seat numbers for this table
                const tableAssignments = seatAssignments.filter(
                  (sa) => sa.table_layout_id === tableId
                );
                const takenSeats = new Set(
                  tableAssignments.map((sa) => sa.seat_number)
                );

                // Find next available seat number (1-based)
                let nextSeat = 1;
                while (takenSeats.has(nextSeat) && nextSeat <= table.capacity) {
                  nextSeat++;
                }

                // Validate capacity
                if (nextSeat <= table.capacity) {
                  // Mark guest as pending to prevent race conditions
                  setPendingAssignments((prev) => new Set(prev).add(guestId));

                  try {
                    await onAssignGuest(tableId, guestId, nextSeat);
                  } finally {
                    // Always remove from pending, whether success or failure
                    setPendingAssignments((prev) => {
                      const next = new Set(prev);
                      next.delete(guestId);
                      return next;
                    });
                    // Clear dragged state
                    setDraggedGuestId(null);
                  }
                }
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <Table className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">
                  No seating chart created yet
                </p>
                <Button onClick={handleCreateTable}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Table
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Statistics Bar */}
        {statistics && (
          <div className="border-t bg-card p-2">
            <div className="flex items-center justify-center gap-6 text-sm">
              <span>
                <span className="text-muted-foreground">Tables:</span>{" "}
                <span className="font-medium">{statistics.total_tables}</span>
              </span>
              <span>
                <span className="text-muted-foreground">Capacity:</span>{" "}
                <span className="font-medium">{statistics.total_capacity}</span>
              </span>
              <span>
                <span className="text-muted-foreground">Seated:</span>{" "}
                <span className="font-medium">{statistics.total_assigned}</span>
              </span>
              <span>
                <span className="text-muted-foreground">Utilization:</span>{" "}
                <span className="font-medium">
                  {Math.round(statistics.assignment_percentage)}%
                </span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Toggle button for right sidebar when closed */}
      {!rightSidebarOpen && (
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="h-full rounded-none"
            onClick={() => setRightSidebarOpen(true)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Right Sidebar - Properties/Venue/Assignments */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out border-l bg-card",
          rightSidebarOpen ? "w-96" : "w-0"
        )}
      >
        {rightSidebarOpen && (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Properties</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRightSidebarOpen(false)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Tabs
              value={rightTab}
              onValueChange={setRightTab}
              className="flex-1"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="tables">Tables</TabsTrigger>
                <TabsTrigger value="venue">Venue</TabsTrigger>
                <TabsTrigger value="assignments">Seats</TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto">
                <TabsContent value="tables" className="p-4 space-y-4">
                  {selectedTable ? (
                    <TableProperties
                      table={selectedTable}
                      isOpen={true}
                      inline={true}
                      onClose={() => onSelectTable(null)}
                      onSave={(tableId, updates) =>
                        onUpdateTable(tableId, updates)
                      }
                      onDuplicate={async (tableId) => {
                        const tableToClone = tables.find(
                          (t) => t.id === tableId
                        );
                        if (tableToClone) {
                          const offset = 50;
                          const newTableNumber = `Table ${tables.length + 1}`;
                          await onCreateTable({
                            table_number: newTableNumber,
                            table_type: tableToClone.table_type,
                            capacity: tableToClone.capacity,
                            width: tableToClone.width,
                            height: tableToClone.height,
                            x_position: tableToClone.x_position + offset,
                            y_position: tableToClone.y_position + offset,
                            rotation: tableToClone.rotation,
                          });
                          toast({
                            title: "Table duplicated",
                            description: `Created ${newTableNumber}`,
                          });
                        }
                      }}
                      onDelete={async (tableId) => {
                        await onDeleteTable(tableId);
                        toast({
                          title: "Table deleted",
                          description: "The selected table has been removed.",
                        });
                      }}
                      onClearSeats={async (tableId) => {
                        const tableAssignments = seatAssignments.filter(
                          (sa) => sa.table_layout_id === tableId
                        );
                        for (const sa of tableAssignments) {
                          await onUnassignSeat(sa.id);
                        }
                        if (tableAssignments.length > 0) {
                          toast({
                            title: "Seats cleared",
                            description: `Removed ${tableAssignments.length} seat assignment${tableAssignments.length === 1 ? "" : "s"}.`,
                          });
                        }
                      }}
                    />
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground mb-4">
                        Select a table to view its properties or create new
                        tables from templates.
                      </p>
                    </>
                  )}
                </TabsContent>

                <TabsContent value="venue" className="p-4">
                  <VenueLayout
                    eventId={event.id}
                    seatingChartId={chart?.id || ""}
                    floorPlanUrl={chart?.background_image_url || undefined}
                    chartMetadata={chart?.chart_metadata || {}}
                    theme={resolvedTheme}
                    // Phase 6.3.7: Real-time canvas updates as venue layout changes
                    onChange={(floorPlanUrl: string | null, metadata: VenueMetadata) => {
                      setLocalFloorPlanUrl(floorPlanUrl || undefined);
                      setLocalSpecialAreas(metadata.specialAreas || []);
                      setLocalFloorPlanSettings(metadata.floorPlanSettings);
                    }}
                    onSave={async (floorPlanUrl, metadata) => {
                      // Update venue metadata
                      await onUpdateChart({
                        background_image_url: floorPlanUrl || undefined,
                        chart_metadata: metadata as unknown as Record<
                          string,
                          unknown
                        >,
                      });
                    }}
                  />
                </TabsContent>

                <TabsContent value="assignments" className="p-4">
                  {selectedTable ? (
                    <SeatAssignmentPanel
                      table={
                        {
                          ...selectedTable,
                          seat_assignments: selectedTableAssignments,
                          assigned_count: selectedTableAssignments.length,
                          empty_seats:
                            selectedTable.capacity -
                            selectedTableAssignments.length,
                        } as TableLayoutWithSeats
                      }
                      guests={guests}
                      isOpen={true}
                      inline={true}
                      onAssignSeat={async (
                        seatNumber: number,
                        guestId: string | null
                      ) => {
                        if (guestId) {
                          await onAssignGuest(
                            selectedTable.id,
                            guestId,
                            seatNumber
                          );
                        }
                      }}
                      onClearAllSeats={async () => {
                        // Clear all assignments for this table
                        for (const sa of selectedTableAssignments) {
                          await onUnassignSeat(sa.id);
                        }
                      }}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Select a table to manage seat assignments.
                    </p>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </div>
        )}
      </div>

      {/* Template Modal */}
      {showTemplateModal && chart && (
        <TableTemplates
          isOpen={showTemplateModal}
          onClose={() => setShowTemplateModal(false)}
          onApplyTemplate={async (templateTables) => {
            await onBulkCreateTables(templateTables);
            setShowTemplateModal(false);
            toast({
              title: "Template applied",
              description: `Created ${templateTables.length} table${templateTables.length === 1 ? "" : "s"} from template.`,
            });
          }}
          canvasWidth={chart.venue_width}
          canvasHeight={chart.venue_height}
          existingTableCount={tables.length}
        />
      )}
    </div>
  );
}
