/**
 * Venue Layout Demo - Client Component
 * FR-21: The system shall provide an interactive seating chart interface.
 * Phase 6.2.2: Venue Layout Integration
 *
 * Client-side only component for venue layout demonstration
 */

"use client";

import React, { useState } from "react";
import { VenueLayout } from "@/components/seating/VenueLayout";
import { useTheme } from "@/contexts/ThemeContext";
import type { VenueMetadata } from "@/types/venue.types";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Info, CheckCircle2 } from "lucide-react";

export default function ClientOnlyDemo() {
  const { resolvedTheme } = useTheme();
  const theme = (resolvedTheme || "light") as "light" | "dark";

  // Mock state
  const [floorPlanUrl, setFloorPlanUrl] = useState<string | undefined>(
    undefined
  );
  const [chartMetadata, setChartMetadata] = useState<Record<string, unknown>>(
    {}
  );
  const [saveCount, setSaveCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Mock event and seating chart IDs
  const mockEventId = "demo-event-001";
  const mockSeatingChartId = "demo-chart-001";

  // Handle save (mock implementation)
  const handleSave = async (
    floorPlanUrl: string | null,
    metadata: VenueMetadata
  ): Promise<void> => {
    setIsSaving(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Update mock state
    setFloorPlanUrl(floorPlanUrl || undefined);
    setChartMetadata(metadata as unknown as Record<string, unknown>);
    setSaveCount((prev) => prev + 1);

    setIsSaving(false);

    console.log("Venue layout saved:", {
      floorPlanUrl,
      metadata,
    });
  };

  // Reset demo
  const handleReset = () => {
    setFloorPlanUrl(undefined);
    setChartMetadata({});
    setSaveCount(0);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          Venue Layout Demo
        </h1>
        <p className="text-lg text-muted-foreground">
          Phase 6.2.2: Upload floor plans, define special areas, and configure
          venue layout
        </p>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Instructions
          </CardTitle>
          <CardDescription>
            Test the venue layout features in this interactive demo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <h3 className="font-semibold mb-2">1. Floor Plan</h3>
              <p className="text-sm text-muted-foreground">
                Upload a floor plan image (PNG, JPG, or SVG). Adjust opacity and
                lock settings.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">2. Special Areas</h3>
              <p className="text-sm text-muted-foreground">
                Add venue features like stage, dance floor, bar, and obstacles.
                Edit dimensions and positions.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">3. Save</h3>
              <p className="text-sm text-muted-foreground">
                Click Save Changes to persist your venue layout. View the saved
                data in the console.
              </p>
            </div>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Demo Mode:</strong> This is a demonstration page. Changes
              are saved to local state only and won&apos;t persist after page
              reload.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Status */}
      {saveCount > 0 && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-900 dark:text-green-100">
            Venue layout saved <strong>{saveCount}</strong> time
            {saveCount > 1 ? "s" : ""}. Check the browser console for saved
            data.
          </AlertDescription>
        </Alert>
      )}

      {/* Venue Layout Component */}
      <Card>
        <CardContent className="pt-6">
          <VenueLayout
            eventId={mockEventId}
            seatingChartId={mockSeatingChartId}
            floorPlanUrl={floorPlanUrl}
            chartMetadata={chartMetadata}
            theme={theme}
            onSave={handleSave}
            disabled={isSaving}
          />
        </CardContent>
      </Card>

      {/* Debug Info */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
          <CardDescription>
            Current venue layout state (for development)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium mb-1">Floor Plan Status:</p>
              <p className="text-sm text-muted-foreground">
                {floorPlanUrl ? (
                  <span className="text-green-600 dark:text-green-400">
                    ✓ Uploaded ({floorPlanUrl.substring(0, 50)}...)
                  </span>
                ) : (
                  <span className="text-muted-foreground">Not uploaded</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Special Areas:</p>
              <p className="text-sm text-muted-foreground">
                {chartMetadata && "specialAreas" in chartMetadata
                  ? `${
                      (chartMetadata.specialAreas as unknown[]).length
                    } area(s)`
                  : "0 areas"}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Chart Metadata:</p>
            <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-60">
              {JSON.stringify(chartMetadata, null, 2)}
            </pre>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
              Reset Demo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                console.log("Current state:", { floorPlanUrl, chartMetadata })
              }
            >
              Log State to Console
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Features List */}
      <Card>
        <CardHeader>
          <CardTitle>Phase 6.2.2 Features</CardTitle>
          <CardDescription>Venue Layout Integration checklist</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <span>
                Floor plan upload with drag-and-drop (PNG, JPG, SVG, max 5MB)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <span>Opacity control (0-100%) for floor plan transparency</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <span>Lock/unlock floor plan to prevent accidental changes</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <span>
                10 special area types (Stage, Dance Floor, Bar, Buffet, DJ
                Booth, Photo Booth, Entrance, Exit, Restroom, Obstacle)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <span>
                Edit area properties (label, dimensions, position, rotation,
                color)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <span>
                Obstacle markers for blocking table placement (visual indicator)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <span>Theme-aware colors for all special areas</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <span>
                Tabbed interface (Floor Plan, Special Areas, Settings)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <span>Base64 storage for floor plans (5MB max)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <span>JSONB metadata storage for special areas</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <span>Unsaved changes indicator</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <span>Form validation with error messages</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
