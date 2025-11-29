/**
 * VenueLayout Component
 * FR-21: The system shall provide an interactive seating chart interface.
 * Phase 6.2.2: Venue Layout Integration
 *
 * Main venue layout manager combining floor plan upload and special areas management
 */

"use client";

import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import {
  Save,
  Image as ImageIcon,
  MapPin,
  Settings as SettingsIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useToast } from "@/hooks/useToast";
import { FloorPlanUpload } from "./FloorPlanUpload";
import { SpecialAreas } from "./SpecialAreas";
import {
  type VenueMetadata,
  type SpecialArea,
  type FloorPlanSettings,
  DEFAULT_FLOOR_PLAN_SETTINGS,
} from "@/types/venue.types";
import { parseVenueMetadata } from "@/utils/venue-helpers";

interface VenueLayoutProps {
  eventId: string;
  seatingChartId: string;
  floorPlanUrl?: string;
  chartMetadata?: Record<string, unknown>;
  theme: "light" | "dark";
  // Phase 6.3.7: Optional callback for real-time canvas updates (before save)
  onChange?: (floorPlanUrl: string | null, metadata: VenueMetadata) => void;
  onSave: (
    floorPlanUrl: string | null,
    metadata: VenueMetadata
  ) => Promise<void>;
  disabled?: boolean;
  // Phase 6.3.7: External special areas from canvas (for drag/resize sync)
  externalSpecialAreas?: SpecialArea[];
}

export function VenueLayout({
  eventId,
  seatingChartId,
  floorPlanUrl: initialFloorPlanUrl,
  chartMetadata,
  theme,
  onChange,
  onSave,
  disabled = false,
  externalSpecialAreas,
}: VenueLayoutProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Parse initial venue metadata - memoize to prevent recreation on every render
  const initialData = useMemo(
    () => parseVenueMetadata(chartMetadata),
    [chartMetadata]
  );

  // Phase 6.3.7: Store initial values in refs for stable comparison
  // These refs only update when chartMetadata changes (e.g., after save)
  const initialSpecialAreasRef = useRef<string>(
    JSON.stringify(initialData.specialAreas)
  );
  const initialFloorPlanSettingsRef = useRef<string>(
    JSON.stringify(initialData.floorPlanSettings || DEFAULT_FLOOR_PLAN_SETTINGS)
  );

  // Update refs when initialData changes (after save or initial load)
  useEffect(() => {
    initialSpecialAreasRef.current = JSON.stringify(initialData.specialAreas);
    initialFloorPlanSettingsRef.current = JSON.stringify(
      initialData.floorPlanSettings || DEFAULT_FLOOR_PLAN_SETTINGS
    );
  }, [initialData]);

  // Local state
  const [floorPlanUrl, setFloorPlanUrl] = useState<string | undefined>(
    initialFloorPlanUrl
  );
  const [floorPlanSettings, setFloorPlanSettings] = useState<FloorPlanSettings>(
    initialData.floorPlanSettings || DEFAULT_FLOOR_PLAN_SETTINGS
  );
  const [specialAreas, setSpecialAreas] = useState<SpecialArea[]>(
    initialData.specialAreas
  );

  // Phase 6.3.7: Track if we're currently syncing to prevent circular updates
  const isSyncingFromExternalRef = useRef(false);

  // Phase 6.3.7: Sync external special areas from canvas drag/resize
  // This allows canvas modifications to update VenueLayout's internal state
  useEffect(() => {
    if (externalSpecialAreas && externalSpecialAreas.length > 0) {
      // Only update if the external areas differ from current state
      const externalJson = JSON.stringify(externalSpecialAreas);
      const currentJson = JSON.stringify(specialAreas);
      if (externalJson !== currentJson) {
        // Mark that we're syncing from external to prevent onChange from triggering circular update
        isSyncingFromExternalRef.current = true;
        setSpecialAreas(externalSpecialAreas);
        // Reset after a microtask to allow the state update to complete
        queueMicrotask(() => {
          isSyncingFromExternalRef.current = false;
        });
      }
    }
  }, [externalSpecialAreas]); // Intentionally not including specialAreas to avoid infinite loop

  // Track unsaved changes - compare against stable refs, not fresh objects
  useEffect(() => {
    const hasChanges =
      floorPlanUrl !== initialFloorPlanUrl ||
      JSON.stringify(specialAreas) !== initialSpecialAreasRef.current ||
      JSON.stringify(floorPlanSettings) !== initialFloorPlanSettingsRef.current;

    setHasUnsavedChanges(hasChanges);
  }, [floorPlanUrl, specialAreas, floorPlanSettings, initialFloorPlanUrl]);

  // Phase 6.3.7: Notify parent of changes for real-time canvas updates
  // Skip if we're syncing FROM external (to prevent circular updates)
  useEffect(() => {
    if (onChange && !isSyncingFromExternalRef.current) {
      onChange(floorPlanUrl || null, {
        specialAreas,
        floorPlanSettings: floorPlanUrl ? floorPlanSettings : undefined,
      });
    }
  }, [floorPlanUrl, specialAreas, floorPlanSettings, onChange]);

  // Handle floor plan upload
  const handleFloorPlanUpload = useCallback(
    (base64Url: string, dimensions: { width: number; height: number }) => {
      setFloorPlanUrl(base64Url);
      toast({
        title: "Floor plan uploaded",
        description: `Image dimensions: ${dimensions.width} × ${dimensions.height}px`,
      });
    },
    [toast]
  );

  // Handle floor plan removal
  const handleFloorPlanRemove = useCallback(() => {
    setFloorPlanUrl(undefined);
    setFloorPlanSettings(DEFAULT_FLOOR_PLAN_SETTINGS);
    toast({
      title: "Floor plan removed",
      description: "The floor plan has been removed from the venue layout.",
    });
  }, [toast]);

  // Handle floor plan settings change
  const handleFloorPlanSettingsChange = useCallback(
    (settings: FloorPlanSettings) => {
      setFloorPlanSettings(settings);
    },
    []
  );

  // Handle special areas change
  const handleSpecialAreasChange = useCallback((areas: SpecialArea[]) => {
    setSpecialAreas(areas);
  }, []);

  // Save venue layout
  const handleSave = useCallback(async () => {
    if (!hasUnsavedChanges) {
      toast({
        title: "No changes to save",
        description: "The venue layout is already up to date.",
      });
      return;
    }

    setIsSaving(true);

    try {
      const venueMetadata: VenueMetadata = {
        specialAreas,
        floorPlanSettings: floorPlanUrl ? floorPlanSettings : undefined,
      };

      await onSave(floorPlanUrl || null, venueMetadata);

      setHasUnsavedChanges(false);

      toast({
        title: "Venue layout saved",
        description: "Your venue layout has been successfully saved.",
      });
    } catch (error) {
      console.error("Error saving venue layout:", error);
      toast({
        title: "Error saving venue layout",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [
    floorPlanUrl,
    floorPlanSettings,
    specialAreas,
    hasUnsavedChanges,
    onSave,
    toast,
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Venue Layout</h2>
          <p className="text-muted-foreground">
            Configure your venue floor plan and special areas
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={disabled || isSaving || !hasUnsavedChanges}
          size="lg"
        >
          <Save className="h-5 w-5 mr-2" />
          {isSaving
            ? "Saving..."
            : hasUnsavedChanges
            ? "Save Changes"
            : "Saved"}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="floor-plan" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="floor-plan" className="gap-2">
            <ImageIcon className="h-4 w-4" />
            Floor Plan
          </TabsTrigger>
          <TabsTrigger value="special-areas" className="gap-2">
            <MapPin className="h-4 w-4" />
            Special Areas
            {specialAreas.length > 0 && (
              <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                {specialAreas.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <SettingsIcon className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Floor Plan Tab */}
        <TabsContent value="floor-plan" className="space-y-4 mt-6">
          <FloorPlanUpload
            floorPlanUrl={floorPlanUrl}
            settings={floorPlanSettings}
            onFloorPlanUpload={handleFloorPlanUpload}
            onFloorPlanRemove={handleFloorPlanRemove}
            onSettingsChange={handleFloorPlanSettingsChange}
            disabled={disabled}
          />
        </TabsContent>

        {/* Special Areas Tab */}
        <TabsContent value="special-areas" className="space-y-4 mt-6">
          <SpecialAreas
            specialAreas={specialAreas}
            onSpecialAreasChange={handleSpecialAreasChange}
            theme={theme}
            disabled={disabled}
          />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4 mt-6">
          <div className="rounded-lg border border-border p-6 bg-card">
            <h3 className="text-lg font-semibold mb-4">Venue Dimensions</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Venue dimensions are automatically determined by the canvas size.
              You can adjust the canvas dimensions in the seating chart
              settings.
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Floor Plan</p>
                  <p className="text-sm text-muted-foreground">
                    {floorPlanUrl ? (
                      <span className="text-green-600 dark:text-green-400">
                        ✓ Uploaded
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        Not uploaded
                      </span>
                    )}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Special Areas</p>
                  <p className="text-sm text-muted-foreground">
                    {specialAreas.length} area(s)
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Obstacles</p>
                <p className="text-sm text-muted-foreground">
                  {specialAreas.filter((a) => a.isObstacle).length} obstacle(s)
                </p>
              </div>

              {floorPlanUrl && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Floor Plan Settings</p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>
                      Opacity: {Math.round(floorPlanSettings.opacity * 100)}%
                    </p>
                    <p>
                      Status: {floorPlanSettings.locked ? "Locked" : "Unlocked"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Future: Accessibility Paths */}
          <div className="rounded-lg border border-border p-6 bg-card opacity-50">
            <h3 className="text-lg font-semibold mb-2">Accessibility Paths</h3>
            <p className="text-sm text-muted-foreground">
              Coming soon: Configure accessibility paths for wheelchair access
              and emergency exits.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Unsaved Changes Indicator */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-6 right-6 bg-amber-500 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse">
          <p className="text-sm font-medium">You have unsaved changes</p>
        </div>
      )}
    </div>
  );
}
