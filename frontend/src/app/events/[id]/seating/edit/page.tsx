/**
 * FR-21: The system shall provide an interactive seating chart interface.
 * Phase 6.2.5: Seating Chart Polish & Integration
 */

"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, HelpCircle, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

import { useSeatingChart } from "@/hooks/useSeatingChart";
import { useEvent } from "@/hooks/useEvent";
import { useEventGuests } from "@/hooks/useEventGuests";
import { SeatingEditorLayout } from "@/components/seating/SeatingEditorLayout";
import MobileSeatingView from "@/components/seating/MobileSeatingView";
import { SaveIndicator } from "@/components/seating/SaveIndicator";
import { SeatingHelp } from "@/components/seating/SeatingHelp";
import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { useToast } from "@/hooks/useToast";
import { useTheme } from "@/contexts/ThemeContext";

export default function SeatingEditPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { resolvedTheme } = useTheme();
  const eventId = params.id as string;
  const [showHelp, setShowHelp] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport for responsive layout
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch event data
  const {
    event,
    isLoading: eventLoading,
    error: eventError,
  } = useEvent(eventId);

  // Fetch seating chart with all features
  const {
    chart,
    tables,
    seatAssignments,
    statistics,
    selectedTableId,
    isLoading: chartLoading,
    error: chartError,
    saveStatus,
    lastSaved,
    hasUnsavedChanges,
    canUndo,
    canRedo,
    selectTable,
    updateTable,
    deleteTable,
    assignGuest,
    unassignSeat,
    save,
    undo,
    redo,
    refetch: refetchChart,
    createTable,
    bulkCreateTables,
    updateChart,
  } = useSeatingChart({ eventId, enableAutosave: true });

  // Fetch guests for assignment
  const {
    guests,
    isLoading: guestsLoading,
    error: guestsError,
    refetch: refetchGuests,
  } = useEventGuests(eventId);

  // Loading state
  const isLoading = eventLoading || chartLoading || guestsLoading;

  // Combined error state
  const error = eventError || chartError || guestsError;

  // Navigation guard for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Handle back navigation with unsaved changes
  const handleBack = () => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      );
      if (!confirmLeave) return;
    }
    setIsNavigating(true);
    router.push(`/events/${eventId}?tab=seating`);
  };

  // Handle save with toast notification
  const handleSave = async () => {
    try {
      await save();
      toast({
        title: "Seating chart saved",
        description: "Your changes have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Failed to save seating chart. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Help dialog
      if (e.key === "?" && e.shiftKey) {
        e.preventDefault();
        setShowHelp(true);
        return;
      }

      // Save (Cmd/Ctrl + S)
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (hasUnsavedChanges) {
          handleSave();
        }
        return;
      }

      // Delete selected table (Delete or Backspace key)
      /**
       * FR-21: The system shall provide an interactive seating chart interface.
       * Phase 6.2.5: Seating Chart Polish & Integration
       */
      if ((e.key === "Delete" || e.key === "Backspace") && selectedTableId) {
        // Don't trigger if user is typing in an input
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
          return;
        }
        e.preventDefault();
        deleteTable(selectedTableId)
          .then(() => {
            toast({
              title: "Table deleted",
              description: "The selected table has been removed.",
            });
          })
          .catch((error) => {
            console.error("Delete failed:", error);
            toast({
              title: "Delete failed",
              description: "Failed to delete the table. Please try again.",
              variant: "destructive",
            });
          });
        return;
      }

      // Undo/Redo handled by useSeatingChart hook
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [hasUnsavedChanges, selectedTableId, deleteTable]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading seating chart...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <ErrorMessage
          title="Failed to load seating chart"
          message={
            error.message ||
            "An error occurred while loading the seating chart."
          }
          onRetry={() => {
            refetchChart();
            refetchGuests();
          }}
        />
      </div>
    );
  }

  // No event found
  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex flex-col items-center justify-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h2 className="text-xl font-semibold">Event not found</h2>
          <p className="text-muted-foreground">
            The event you are looking for does not exist.
          </p>
          <Link href="/events">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen flex flex-col bg-background">
        {/* Header */}
        <div className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="space-y-4">
              {/* Breadcrumb */}
              <Breadcrumb />

              {/* Title and Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBack}
                    disabled={isNavigating}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Overview
                  </Button>
                  <div>
                    <h1 className="text-2xl font-bold">Edit Seating Chart</h1>
                    <p className="text-sm text-muted-foreground">
                      {event.name} •{" "}
                      {new Date(event.start_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Save Indicator */}
                  <SaveIndicator status={saveStatus} lastSaved={lastSaved} />

                  {/* Manual Save Button (shown when changes pending) */}
                  {hasUnsavedChanges && (
                    <Button
                      onClick={handleSave}
                      disabled={saveStatus === "saving"}
                      size="sm"
                    >
                      Save Changes
                    </Button>
                  )}

                  {/* Help Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowHelp(true)}
                  >
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Help
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Editor - Responsive: Mobile vs Desktop */}
        <div className="flex-1 overflow-hidden">
          {isMobile && chart ? (
            // Mobile: Read-only view with Find My Seat
            <MobileSeatingView
              seatingChart={{
                ...chart,
                tables: tables || [],
                total_tables: tables?.length || 0,
                total_capacity:
                  tables?.reduce((sum, t) => sum + t.capacity, 0) || 0,
                total_assigned: seatAssignments?.length || 0,
              }}
              tables={tables || []}
              guests={guests || []}
              readOnly={true}
              showFindMySeat={true}
              theme={resolvedTheme}
            />
          ) : (
            // Desktop: Full editor
            <SeatingEditorLayout
              event={event}
              chart={chart}
              tables={tables || []}
              seatAssignments={seatAssignments || []}
              guests={guests || []}
              statistics={statistics}
              selectedTableId={selectedTableId}
              canUndo={canUndo}
              canRedo={canRedo}
              onSelectTable={selectTable}
              onUpdateTable={updateTable}
              onDeleteTable={deleteTable}
              onAssignGuest={(tableId, guestId, seatNumber) =>
                assignGuest(tableId, guestId, seatNumber || 0)
              }
              onUnassignSeat={unassignSeat}
              onSave={handleSave}
              onUndo={undo}
              onRedo={redo}
              onCreateTable={createTable}
              onBulkCreateTables={bulkCreateTables}
              onUpdateChart={updateChart}
              onRefresh={refetchChart}
            />
          )}
        </div>
      </div>

      {/* Help Dialog */}
      {showHelp && (
        <div onClick={() => setShowHelp(false)} className="fixed inset-0 z-50">
          <SeatingHelp />
        </div>
      )}
    </>
  );
}
