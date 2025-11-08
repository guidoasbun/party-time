/**
 * SpecialAreas Component
 * FR-21: The system shall provide an interactive seating chart interface.
 * Phase 6.2.2: Venue Layout Integration
 *
 * Manage special venue areas (stage, dance floor, bar, buffet, obstacles, etc.)
 */

"use client";

import React, { useState, useCallback } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Drama,
  Music,
  Wine,
  Utensils,
  Disc3,
  Camera,
  DoorOpen,
  DoorClosed,
  Bath,
  Triangle,
  X,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  SpecialAreaType,
  SPECIAL_AREA_LABELS,
  type SpecialArea,
} from "@/types/venue.types";
import {
  createDefaultSpecialArea,
  getDefaultSpecialAreaColor,
} from "@/utils/venue-helpers";
import { v4 as uuidv4 } from "uuid";

interface SpecialAreasProps {
  specialAreas: SpecialArea[];
  onSpecialAreasChange: (areas: SpecialArea[]) => void;
  theme: "light" | "dark";
  disabled?: boolean;
}

// Icon mapping for special area types
const AREA_TYPE_ICONS: Record<
  SpecialAreaType,
  React.ComponentType<{ className?: string; color?: string }>
> = {
  [SpecialAreaType.STAGE]: Drama,
  [SpecialAreaType.DANCE_FLOOR]: Music,
  [SpecialAreaType.BAR]: Wine,
  [SpecialAreaType.BUFFET]: Utensils,
  [SpecialAreaType.DJ_BOOTH]: Disc3,
  [SpecialAreaType.PHOTO_BOOTH]: Camera,
  [SpecialAreaType.ENTRANCE]: DoorOpen,
  [SpecialAreaType.EXIT]: DoorClosed,
  [SpecialAreaType.RESTROOM]: Bath,
  [SpecialAreaType.OBSTACLE]: Triangle,
};

export function SpecialAreas({
  specialAreas,
  onSpecialAreasChange,
  theme,
  disabled = false,
}: SpecialAreasProps) {
  const [editingAreaId, setEditingAreaId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAreaType, setNewAreaType] = useState<SpecialAreaType>(
    SpecialAreaType.STAGE
  );

  // Add new special area
  const handleAddArea = useCallback(() => {
    const newArea: SpecialArea = {
      id: uuidv4(),
      ...createDefaultSpecialArea(newAreaType, theme),
    };

    onSpecialAreasChange([...specialAreas, newArea]);
    setShowAddForm(false);
    setNewAreaType(SpecialAreaType.STAGE);
  }, [newAreaType, theme, specialAreas, onSpecialAreasChange]);

  // Update special area
  const handleUpdateArea = useCallback(
    (areaId: string, updates: Partial<SpecialArea>) => {
      const updatedAreas = specialAreas.map((area) =>
        area.id === areaId ? { ...area, ...updates } : area
      );
      onSpecialAreasChange(updatedAreas);
    },
    [specialAreas, onSpecialAreasChange]
  );

  // Delete special area
  const handleDeleteArea = useCallback(
    (areaId: string) => {
      const updatedAreas = specialAreas.filter((area) => area.id !== areaId);
      onSpecialAreasChange(updatedAreas);
      if (editingAreaId === areaId) {
        setEditingAreaId(null);
      }
    },
    [specialAreas, editingAreaId, onSpecialAreasChange]
  );

  // Get icon component for area type
  const getAreaIcon = (type: SpecialAreaType) => {
    const IconComponent = AREA_TYPE_ICONS[type];
    return IconComponent;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-semibold">Special Areas</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Add and configure venue features like stage, dance floor, bar, and
            obstacles
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          disabled={disabled || showAddForm}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Area
        </Button>
      </div>

      {/* Add New Area Form */}
      {showAddForm && (
        <Card className="border-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Add New Special Area</CardTitle>
            <CardDescription>
              Select the type of area to add to your venue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Select
                label="Area Type"
                options={Object.values(SpecialAreaType).map((type) => ({
                  value: type,
                  label: SPECIAL_AREA_LABELS[type],
                }))}
                value={newAreaType}
                onValueChange={(value) =>
                  setNewAreaType(value as SpecialAreaType)
                }
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddForm(false)}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleAddArea}>
                <Check className="h-4 w-4 mr-2" />
                Add Area
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Special Areas List */}
      {specialAreas.length === 0 ? (
        <Alert>
          <Triangle className="h-4 w-4" />
          <AlertDescription>
            No special areas added yet. Click <strong>Add Area</strong> to get
            started.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-3">
          {specialAreas.map((area) => {
            const IconComponent = getAreaIcon(area.type);
            const isEditing = editingAreaId === area.id;
            const areaColor =
              area.color || getDefaultSpecialAreaColor(area.type, theme);

            return (
              <Card key={area.id} className={isEditing ? "border-primary" : ""}>
                <CardContent className="pt-4">
                  {!isEditing ? (
                    // View Mode
                    <div className="flex items-start gap-3">
                      <div
                        className="p-2 rounded-lg flex-shrink-0"
                        style={{ backgroundColor: `${areaColor}20` }}
                      >
                        <IconComponent
                          className="h-5 w-5"
                          color={areaColor}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-medium text-sm">
                              {area.label}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {SPECIAL_AREA_LABELS[area.type]}
                              {area.isObstacle && (
                                <span className="ml-2 text-destructive font-medium">
                                  • Obstacle
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingAreaId(area.id)}
                              disabled={disabled}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteArea(area.id)}
                              disabled={disabled}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                          <div>
                            Position: ({area.x.toFixed(0)}, {area.y.toFixed(0)})
                          </div>
                          <div>
                            Size: {area.width.toFixed(0)} ×{" "}
                            {area.height.toFixed(0)}
                          </div>
                          <div>Rotation: {area.rotation}°</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Edit Mode
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="p-2 rounded-lg flex-shrink-0"
                          style={{ backgroundColor: `${areaColor}20` }}
                        >
                          <IconComponent
                            className="h-5 w-5"
                            color={areaColor}
                          />
                        </div>
                        <div className="flex-1">
                          <Label
                            htmlFor={`area-label-${area.id}`}
                            className="text-sm"
                          >
                            Label
                          </Label>
                          <Input
                            id={`area-label-${area.id}`}
                            value={area.label}
                            onChange={(e) =>
                              handleUpdateArea(area.id, {
                                label: e.target.value,
                              })
                            }
                            disabled={disabled}
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label
                            htmlFor={`area-width-${area.id}`}
                            className="text-sm"
                          >
                            Width (px)
                          </Label>
                          <Input
                            id={`area-width-${area.id}`}
                            type="number"
                            value={area.width}
                            onChange={(e) =>
                              handleUpdateArea(area.id, {
                                width: parseFloat(e.target.value) || 0,
                              })
                            }
                            disabled={disabled}
                            min={10}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor={`area-height-${area.id}`}
                            className="text-sm"
                          >
                            Height (px)
                          </Label>
                          <Input
                            id={`area-height-${area.id}`}
                            type="number"
                            value={area.height}
                            onChange={(e) =>
                              handleUpdateArea(area.id, {
                                height: parseFloat(e.target.value) || 0,
                              })
                            }
                            disabled={disabled}
                            min={10}
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label
                            htmlFor={`area-x-${area.id}`}
                            className="text-sm"
                          >
                            X Position
                          </Label>
                          <Input
                            id={`area-x-${area.id}`}
                            type="number"
                            value={area.x}
                            onChange={(e) =>
                              handleUpdateArea(area.id, {
                                x: parseFloat(e.target.value) || 0,
                              })
                            }
                            disabled={disabled}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor={`area-y-${area.id}`}
                            className="text-sm"
                          >
                            Y Position
                          </Label>
                          <Input
                            id={`area-y-${area.id}`}
                            type="number"
                            value={area.y}
                            onChange={(e) =>
                              handleUpdateArea(area.id, {
                                y: parseFloat(e.target.value) || 0,
                              })
                            }
                            disabled={disabled}
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label
                          htmlFor={`area-rotation-${area.id}`}
                          className="text-sm"
                        >
                          Rotation (0-360°)
                        </Label>
                        <Input
                          id={`area-rotation-${area.id}`}
                          type="number"
                          value={area.rotation}
                          onChange={(e) =>
                            handleUpdateArea(area.id, {
                              rotation: parseFloat(e.target.value) || 0,
                            })
                          }
                          disabled={disabled}
                          min={0}
                          max={360}
                          className="mt-1"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`area-obstacle-${area.id}`}
                          checked={area.isObstacle}
                          onCheckedChange={(checked) =>
                            handleUpdateArea(area.id, {
                              isObstacle: checked === true,
                            })
                          }
                          disabled={disabled}
                        />
                        <Label
                          htmlFor={`area-obstacle-${area.id}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          Mark as obstacle (blocks table placement)
                        </Label>
                      </div>

                      <div className="flex gap-2 justify-end pt-2 border-t border-border">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingAreaId(null)}
                        >
                          Done
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Summary */}
      {specialAreas.length > 0 && (
        <Alert>
          <Triangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{specialAreas.length}</strong> special area(s) added.{" "}
            <strong>{specialAreas.filter((a) => a.isObstacle).length}</strong>{" "}
            marked as obstacles.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
