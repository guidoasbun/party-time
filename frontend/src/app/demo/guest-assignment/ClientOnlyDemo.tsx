"use client";

/**
 * Guest Assignment Demo - Client-Only Component
 *
 * Phase 6.1.5: Guest Assignment System
 * Integrates all guest assignment components with state management
 */

import React, { useState, useCallback, useMemo } from "react";
import SeatingCanvas from "@/components/seating/SeatingCanvas";
import { GuestSidebar } from "@/components/seating/GuestSidebar";
import { SeatAssignmentPanel } from "@/components/seating/SeatAssignmentPanel";
import { UnseatedGuestsIndicator } from "@/components/seating/UnseatedGuestsIndicator";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/hooks/useToast";
import {
  Wand2,
  Trash2,
  BarChart3,
  ChevronLeft,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  SeatingChartWithTables,
  TableLayout,
  TableLayoutWithSeats,
  SeatAssignment,
  Guest,
  UUID,
} from "@/types";

interface ClientOnlyDemoProps {
  seatingChart: SeatingChartWithTables;
  tables: TableLayout[];
  guests: Guest[];
}

export default function ClientOnlyDemo({
  seatingChart: initialChart,
  tables: initialTables,
  guests: initialGuests,
}: ClientOnlyDemoProps) {
  const { toast } = useToast();

  // State management
  const [tables, setTables] = useState<TableLayout[]>(initialTables);
  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  const [seatAssignments, setSeatAssignments] = useState<SeatAssignment[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<UUID | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [draggedGuest, setDraggedGuest] = useState<Guest | null>(null);

  // Build seating chart with current state (including seat assignments)
  const seatingChart: SeatingChartWithTables = useMemo(() => {
    // Map tables to include their seat assignments
    const tablesWithSeats = tables.map((table) => {
      const tableAssignments = seatAssignments.filter(
        (a) => a.table_layout_id === table.id
      );

      return {
        ...table,
        seat_assignments: tableAssignments,
        assigned_count: tableAssignments.length,
        empty_seats: table.capacity - tableAssignments.length,
      };
    });

    return {
      ...initialChart,
      tables: tablesWithSeats,
      total_assigned: seatAssignments.length,
    };
  }, [initialChart, tables, seatAssignments]);

  // Get selected table with seat assignments
  const selectedTable: TableLayoutWithSeats | null = useMemo(() => {
    if (!selectedTableId) return null;

    const table = tables.find((t) => t.id === selectedTableId);
    if (!table) return null;

    const tableAssignments = seatAssignments.filter(
      (a) => a.table_layout_id === selectedTableId
    );

    return {
      ...table,
      seat_assignments: tableAssignments,
      assigned_count: tableAssignments.length,
      empty_seats: table.capacity - tableAssignments.length,
    };
  }, [selectedTableId, tables, seatAssignments]);

  // Handle table selection from canvas
  const handleTableSelect = useCallback((tableId: UUID | null) => {
    setSelectedTableId(tableId);
    setIsPanelOpen(tableId !== null);
  }, []);

  // Handle guest drag start
  const handleGuestDragStart = useCallback((guest: Guest) => {
    setDraggedGuest(guest);
  }, []);

  // Handle guest drag end
  const handleGuestDragEnd = useCallback(() => {
    setDraggedGuest(null);
  }, []);

  // Handle drop on canvas (assign to table)
  const handleCanvasDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();

      const guestId = e.dataTransfer.getData("guestId");
      const guestName = e.dataTransfer.getData("guestName");

      if (!guestId) {
        setDraggedGuest(null);
        return;
      }

      // Get drop coordinates relative to the canvas container
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Find the table at the drop position
      let targetTable: TableLayout | null = null;
      let minDistance = Infinity;

      // Use simple distance calculation to find nearest table
      for (const table of tables) {
        // Calculate distance from drop point to table center
        const tableCenterX = table.x_position + table.width / 2;
        const tableCenterY = table.y_position + table.height / 2;
        const distance = Math.sqrt(
          Math.pow(x - tableCenterX, 2) + Math.pow(y - tableCenterY, 2)
        );

        // Check if drop point is within table bounds (with some tolerance)
        const tolerance = 20;
        const isWithinBounds =
          x >= table.x_position - tolerance &&
          x <= table.x_position + table.width + tolerance &&
          y >= table.y_position - tolerance &&
          y <= table.y_position + table.height + tolerance;

        if (isWithinBounds && distance < minDistance) {
          minDistance = distance;
          targetTable = table;
        }
      }

      setDraggedGuest(null);

      if (!targetTable) {
        toast({
          title: "No table found",
          description: "Please drop the guest directly on a table",
          variant: "default",
        });
        return;
      }

      // Check if table has available seats
      const tableAssignments = seatAssignments.filter(
        (a) => a.table_layout_id === targetTable.id
      );

      if (tableAssignments.length >= targetTable.capacity) {
        toast({
          title: "Table is full",
          description: `Table ${targetTable.table_number} has no available seats`,
          variant: "destructive",
        });
        return;
      }

      // Check if guest is already assigned
      const existingAssignment = seatAssignments.find(
        (a) => a.guest_id === guestId
      );

      if (existingAssignment) {
        toast({
          title: "Guest already assigned",
          description: `${guestName} is already assigned to a seat`,
          variant: "default",
        });
        return;
      }

      // Find next available seat number
      const occupiedSeats = tableAssignments.map((a) => a.seat_number);
      let seatNumber = 1;
      while (occupiedSeats.includes(seatNumber)) {
        seatNumber++;
      }

      // Create new assignment
      const newAssignment: SeatAssignment = {
        id: `assignment-${Date.now()}` as UUID,
        table_layout_id: targetTable.id,
        guest_id: guestId as UUID,
        seat_number: seatNumber,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setSeatAssignments((prev) => [...prev, newAssignment]);

      toast({
        title: "Guest assigned",
        description: `${guestName} assigned to Table ${targetTable.table_number}, Seat ${seatNumber}`,
        variant: "success",
      });
    },
    [tables, seatAssignments, toast]
  );

  // Handle seat assignment
  const handleAssignSeat = useCallback(
    async (seatNumber: number, guestId: UUID | null) => {
      if (!selectedTableId) return;

      setIsLoading(true);

      try {
        if (guestId === null) {
          // Remove assignment
          setSeatAssignments((prev) =>
            prev.filter(
              (a) =>
                !(
                  a.table_layout_id === selectedTableId &&
                  a.seat_number === seatNumber
                )
            )
          );

          toast({
            title: "Guest unassigned",
            description: `Seat ${seatNumber} is now empty`,
            variant: "success",
          });
        } else {
          // Add assignment
          const newAssignment: SeatAssignment = {
            id: `assignment-${Date.now()}` as UUID,
            table_layout_id: selectedTableId,
            guest_id: guestId,
            seat_number: seatNumber,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          setSeatAssignments((prev) => [...prev, newAssignment]);

          const guest = guests.find((g) => g.id === guestId);
          toast({
            title: "Guest assigned",
            description: `${guest?.first_name} ${guest?.last_name} assigned to seat ${seatNumber}`,
            variant: "success",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update seat assignment",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [selectedTableId, guests, toast]
  );

  // Handle clear all seats for table
  const handleClearAllSeats = useCallback(async () => {
    if (!selectedTableId) return;

    setIsLoading(true);

    try {
      setSeatAssignments((prev) =>
        prev.filter((a) => a.table_layout_id !== selectedTableId)
      );

      toast({
        title: "All seats cleared",
        description: `All guests removed from table ${selectedTable?.table_number}`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear seats",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedTableId, selectedTable, toast]);

  // Handle auto-fill table
  const handleAutoFillTable = useCallback(async () => {
    if (!selectedTable) return;

    setIsLoading(true);

    try {
      // Find unseated guests
      const unseatedGuests = guests.filter(
        (g) =>
          g.rsvp_status === "attending" &&
          !seatAssignments.some((a) => a.guest_id === g.id)
      );

      const availableSeats = selectedTable.empty_seats;
      const guestsToAssign = unseatedGuests.slice(0, availableSeats);

      if (guestsToAssign.length === 0) {
        toast({
          title: "No guests to assign",
          description: "All attending guests are already seated",
          variant: "default",
        });
        return;
      }

      // Create assignments
      const newAssignments: SeatAssignment[] = guestsToAssign.map(
        (guest, index) => {
          // Find next available seat number
          const occupiedSeats = seatAssignments
            .filter((a) => a.table_layout_id === selectedTable.id)
            .map((a) => a.seat_number);

          let seatNumber = 1;
          while (occupiedSeats.includes(seatNumber)) {
            seatNumber++;
          }
          occupiedSeats.push(seatNumber);

          return {
            id: `assignment-${Date.now()}-${index}` as UUID,
            table_layout_id: selectedTable.id,
            guest_id: guest.id,
            seat_number: seatNumber,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        }
      );

      setSeatAssignments((prev) => [...prev, ...newAssignments]);

      toast({
        title: "Table auto-filled",
        description: `${guestsToAssign.length} guests assigned to table ${selectedTable.table_number}`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to auto-fill table",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedTable, guests, seatAssignments, toast]);

  // Handle auto-assign all guests
  const handleAutoAssignAll = useCallback(async () => {
    setIsLoading(true);

    try {
      // Find unseated guests
      const unseatedGuests = guests.filter(
        (g) =>
          g.rsvp_status === "attending" &&
          !seatAssignments.some((a) => a.guest_id === g.id)
      );

      if (unseatedGuests.length === 0) {
        toast({
          title: "No guests to assign",
          description: "All attending guests are already seated",
          variant: "default",
        });
        return;
      }

      // Calculate total available capacity
      const totalCapacity = tables.reduce((sum, t) => sum + t.capacity, 0);
      const availableSeats = totalCapacity - seatAssignments.length;

      if (availableSeats < unseatedGuests.length) {
        toast({
          title: "Insufficient capacity",
          description: `Only ${availableSeats} seats available for ${unseatedGuests.length} guests`,
          variant: "default",
        });
      }

      // Distribute guests across tables (fill strategy)
      const newAssignments: SeatAssignment[] = [];
      let guestIndex = 0;

      for (const table of tables) {
        if (guestIndex >= unseatedGuests.length) break;

        const tableAssignments = seatAssignments.filter(
          (a) => a.table_layout_id === table.id
        );
        const availableSeatsInTable = table.capacity - tableAssignments.length;

        for (let seat = 1; seat <= table.capacity && guestIndex < unseatedGuests.length; seat++) {
          if (tableAssignments.some((a) => a.seat_number === seat)) continue;

          const guest = unseatedGuests[guestIndex];
          newAssignments.push({
            id: `assignment-${Date.now()}-${guestIndex}` as UUID,
            table_layout_id: table.id,
            guest_id: guest.id,
            seat_number: seat,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

          guestIndex++;
        }
      }

      setSeatAssignments((prev) => [...prev, ...newAssignments]);

      toast({
        title: "Auto-assignment complete",
        description: `${newAssignments.length} guests assigned to seats`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to auto-assign guests",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [guests, tables, seatAssignments, toast]);

  // Handle clear all assignments
  const handleClearAll = useCallback(async () => {
    if (
      !window.confirm(
        `Remove all ${seatAssignments.length} seat assignments?`
      )
    ) {
      return;
    }

    setIsLoading(true);

    try {
      setSeatAssignments([]);

      toast({
        title: "All assignments cleared",
        description: "All guests have been unassigned from seats",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear assignments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [seatAssignments.length, toast]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalCapacity = tables.reduce((sum, t) => sum + t.capacity, 0);
    const totalAssigned = seatAssignments.length;
    const attendingGuests = guests.filter((g) => g.rsvp_status === "attending");
    const unseatedCount = attendingGuests.filter(
      (g) => !seatAssignments.some((a) => a.guest_id === g.id)
    ).length;

    return {
      totalCapacity,
      totalAssigned,
      availableSeats: totalCapacity - totalAssigned,
      unseatedCount,
      percentageFilled:
        totalCapacity > 0 ? (totalAssigned / totalCapacity) * 100 : 0,
    };
  }, [tables, seatAssignments, guests]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-4 sticky top-0 z-40">
        <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Guest Assignment Demo
              </h1>
              <p className="text-sm text-muted-foreground">
                Phase 6.1.5 - Drag guests to tables and manage seat assignments
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAutoAssignAll}
              disabled={isLoading || statistics.unseatedCount === 0}
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Auto-Assign All ({statistics.unseatedCount})
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              disabled={isLoading || seatAssignments.length === 0}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>

            <div className="w-px h-8 bg-border" />

            {/* Statistics */}
            <div className="flex items-center gap-4 px-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
                <div className="text-sm">
                  <span className="font-semibold text-foreground">
                    {statistics.totalAssigned}/{statistics.totalCapacity}
                  </span>
                  <span className="text-muted-foreground ml-1">seats</span>
                </div>
              </div>

              <Badge
                variant={
                  statistics.percentageFilled >= 80
                    ? "secondary"
                    : statistics.percentageFilled >= 50
                    ? "outline"
                    : "default"
                }
                className={
                  statistics.percentageFilled >= 80
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : statistics.percentageFilled >= 50
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    : ""
                }
              >
                {statistics.percentageFilled.toFixed(0)}% filled
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative flex-1">
        {/* Canvas Area */}
        <div
          className={cn(
            "transition-all duration-300",
            isSidebarOpen ? "mr-80" : "mr-0"
          )}
          onDrop={handleCanvasDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <SeatingCanvas
            seatingChart={seatingChart}
            tables={tables}
            onTableSelect={handleTableSelect}
            readOnly={true}
            gridConfig={{ enabled: true, size: 20, color: '#e5e7eb', showLines: true }}
            className={isPanelOpen ? "h-[500px]" : "h-[700px]"}
          />
        </div>

        {/* Guest Sidebar */}
        <GuestSidebar
          guests={guests}
          seatingChart={seatingChart}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          onGuestDragStart={handleGuestDragStart}
          onGuestDragEnd={handleGuestDragEnd}
        />

        {/* Unseated Guests Indicator */}
        <UnseatedGuestsIndicator
          guests={guests}
          seatingChart={seatingChart}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Seat Assignment Panel */}
        <SeatAssignmentPanel
          table={selectedTable}
          guests={guests}
          isOpen={isPanelOpen}
          onClose={() => {
            setIsPanelOpen(false);
            setSelectedTableId(null);
          }}
          onAssignSeat={handleAssignSeat}
          onClearAllSeats={handleClearAllSeats}
          onAutoFillTable={handleAutoFillTable}
          isLoading={isLoading}
        />
      </div>

      {/* Instructions */}
      {seatAssignments.length === 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30">
          <div className="bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-medium">
              Try dragging guests from the sidebar to tables, or click &quot;Auto-Assign All&quot;
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
