/**
 * FloorPlanUpload Component
 * FR-21: The system shall provide an interactive seating chart interface.
 * Phase 6.2.2: Venue Layout Integration
 *
 * Upload and configure floor plan images with opacity and lock controls
 */

"use client";

import React, { useState, useCallback } from "react";
import { Image as ImageIcon, Lock, Unlock, Trash2 } from "lucide-react";
import { FileUpload } from "@/components/ui/FileUpload";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Slider } from "@/components/ui/Slider";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import {
  processFloorPlanUpload,
  validateImageFile,
} from "@/utils/venue-helpers";
import {
  MAX_FLOOR_PLAN_SIZE_BYTES,
  ALLOWED_IMAGE_TYPES,
  DEFAULT_FLOOR_PLAN_SETTINGS,
  type FloorPlanSettings,
} from "@/types/venue.types";

interface FloorPlanUploadProps {
  floorPlanUrl?: string;
  settings?: FloorPlanSettings;
  onFloorPlanUpload: (
    base64Url: string,
    dimensions: { width: number; height: number }
  ) => void;
  onFloorPlanRemove: () => void;
  onSettingsChange: (settings: FloorPlanSettings) => void;
  disabled?: boolean;
}

export function FloorPlanUpload({
  floorPlanUrl,
  settings = DEFAULT_FLOOR_PLAN_SETTINGS,
  onFloorPlanUpload,
  onFloorPlanRemove,
  onSettingsChange,
  disabled = false,
}: FloorPlanUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Handle file selection
  const handleFileSelect = useCallback(
    async (file: File) => {
      setUploadError(null);
      setIsUploading(true);

      try {
        // Validate file
        const validationError = validateImageFile(file);
        if (validationError) {
          setUploadError(validationError);
          setIsUploading(false);
          return;
        }

        // Process upload
        const uploadData = await processFloorPlanUpload(file);
        setSelectedFile(file);

        // Notify parent with base64 data
        onFloorPlanUpload(uploadData.preview, uploadData.dimensions);
      } catch (error) {
        console.error("Floor plan upload error:", error);
        setUploadError(
          error instanceof Error ? error.message : "Failed to upload floor plan"
        );
      } finally {
        setIsUploading(false);
      }
    },
    [onFloorPlanUpload]
  );

  // Handle file removal
  const handleFileRemove = useCallback(() => {
    setSelectedFile(null);
    setUploadError(null);
    onFloorPlanRemove();
  }, [onFloorPlanRemove]);

  // Handle opacity change
  const handleOpacityChange = useCallback(
    (value: number[]) => {
      const newSettings: FloorPlanSettings = {
        ...settings,
        opacity: value[0] / 100, // Convert 0-100 to 0-1
      };
      onSettingsChange(newSettings);
    },
    [settings, onSettingsChange]
  );

  // Toggle lock state
  const handleToggleLock = useCallback(() => {
    const newSettings: FloorPlanSettings = {
      ...settings,
      locked: !settings.locked,
    };
    onSettingsChange(newSettings);
  }, [settings, onSettingsChange]);

  const hasFloorPlan = !!floorPlanUrl;
  const opacityPercent = Math.round(settings.opacity * 100);

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div>
        <Label className="text-base font-semibold mb-3 block">
          Floor Plan Image
        </Label>

        {!hasFloorPlan ? (
          <FileUpload
            onFileSelect={handleFileSelect}
            onFileRemove={handleFileRemove}
            accept={ALLOWED_IMAGE_TYPES.join(",")}
            maxSize={MAX_FLOOR_PLAN_SIZE_BYTES}
            disabled={disabled || isUploading}
            selectedFile={selectedFile}
            error={uploadError}
          />
        ) : (
          <div className="space-y-4">
            {/* Floor Plan Preview */}
            <div className="relative border-2 border-border rounded-lg overflow-hidden bg-accent/30">
              <div className="aspect-video relative">
                <img
                  src={floorPlanUrl}
                  alt="Floor plan preview"
                  className="w-full h-full object-contain"
                  style={{ opacity: settings.opacity }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 hover:opacity-100 transition-opacity">
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleFileRemove}
                      disabled={disabled}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Alert */}
            <Alert>
              <ImageIcon className="h-4 w-4" />
              <AlertDescription>
                Floor plan is displayed on the canvas. Adjust opacity and lock
                settings below to prevent accidental changes.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>

      {/* Settings Section - Only show when floor plan exists */}
      {hasFloorPlan && (
        <div className="space-y-6 pt-4 border-t border-border">
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Floor Plan Settings
            </Label>
          </div>

          {/* Opacity Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="opacity-slider" className="text-sm font-medium">
                Opacity
              </Label>
              <span className="text-sm text-muted-foreground font-mono">
                {opacityPercent}%
              </span>
            </div>
            <Slider
              id="opacity-slider"
              min={0}
              max={100}
              step={5}
              value={[opacityPercent]}
              onValueChange={handleOpacityChange}
              disabled={disabled}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Adjust transparency to see tables through the floor plan
            </p>
          </div>

          {/* Lock Toggle */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="lock-toggle" className="text-sm font-medium">
                  Lock Floor Plan
                </Label>
                <p className="text-xs text-muted-foreground">
                  Prevent accidental dragging or resizing
                </p>
              </div>
              <Button
                id="lock-toggle"
                variant={settings.locked ? "default" : "outline"}
                size="sm"
                onClick={handleToggleLock}
                disabled={disabled}
                className="min-w-[100px]"
              >
                {settings.locked ? (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Locked
                  </>
                ) : (
                  <>
                    <Unlock className="h-4 w-4 mr-2" />
                    Unlocked
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      {!hasFloorPlan && (
        <Alert>
          <ImageIcon className="h-4 w-4" />
          <AlertDescription>
            <strong>Tip:</strong> Upload a floor plan image (PNG, JPG, or SVG)
            to visualize your venue layout. The image will be displayed as a
            background on the seating chart canvas.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
