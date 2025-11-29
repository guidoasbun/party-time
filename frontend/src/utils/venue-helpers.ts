/**
 * Venue Layout Helper Functions
 * FR-21: The system shall provide an interactive seating chart interface.
 * Phase 6.2.2: Venue Layout Integration
 *
 * Utility functions for venue operations including image processing,
 * validation, special area creation, and collision detection
 */

import * as fabric from "fabric";
import {
  SpecialArea,
  SpecialAreaType,
  FloorPlanUploadData,
  SPECIAL_AREA_COLORS,
  MAX_FLOOR_PLAN_SIZE_BYTES,
  ALLOWED_IMAGE_TYPES,
  DEFAULT_SPECIAL_AREA_DIMENSIONS,
  SPECIAL_AREA_LABELS,
} from "@/types/venue.types";
import type { TableLayout } from "@/types/seating.types";

/**
 * Convert File object to base64 data URL
 */
export async function convertImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to convert image to base64"));
      }
    };

    reader.onerror = () => {
      reject(new Error("Error reading file"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Get image dimensions from data URL or image element
 */
export async function getImageDimensions(
  dataUrl: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    img.src = dataUrl;
  });
}

/**
 * Validate image file (type and size)
 * Returns error message if validation fails, null if valid
 */
export function validateImageFile(file: File): string | null {
  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    const allowedExts = ALLOWED_IMAGE_TYPES.map((type) =>
      type.replace("image/", ".")
    ).join(", ");
    return `Invalid file type. Allowed types: ${allowedExts}`;
  }

  // Check file size
  if (file.size > MAX_FLOOR_PLAN_SIZE_BYTES) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const maxSizeMB = (MAX_FLOOR_PLAN_SIZE_BYTES / (1024 * 1024)).toFixed(0);
    return `File too large (${sizeMB}MB). Maximum size: ${maxSizeMB}MB`;
  }

  // File size warning (3MB+)
  const warningThreshold = 3 * 1024 * 1024;
  if (file.size > warningThreshold) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    console.warn(
      `Large file size (${sizeMB}MB). Consider compressing for better performance.`
    );
  }

  return null; // Valid
}

/**
 * Process file upload and create FloorPlanUploadData
 */
export async function processFloorPlanUpload(
  file: File
): Promise<FloorPlanUploadData> {
  // Validate file
  const validationError = validateImageFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  // Convert to base64
  const preview = await convertImageToBase64(file);

  // Get dimensions
  const dimensions = await getImageDimensions(preview);

  return {
    file,
    preview,
    dimensions,
  };
}

/**
 * Get default color for special area type based on theme
 */
export function getDefaultSpecialAreaColor(
  type: SpecialAreaType,
  theme: "light" | "dark"
): string {
  return SPECIAL_AREA_COLORS[theme][type];
}

/**
 * Get default dimensions for special area type
 */
export function getDefaultSpecialAreaDimensions(type: SpecialAreaType): {
  width: number;
  height: number;
} {
  return DEFAULT_SPECIAL_AREA_DIMENSIONS[type];
}

/**
 * Create a new special area with default values
 */
export function createDefaultSpecialArea(
  type: SpecialAreaType,
  theme: "light" | "dark",
  position?: { x: number; y: number }
): Omit<SpecialArea, "id"> {
  const dimensions = getDefaultSpecialAreaDimensions(type);
  const color = getDefaultSpecialAreaColor(type, theme);

  return {
    type,
    label: SPECIAL_AREA_LABELS[type],
    x: position?.x ?? 100,
    y: position?.y ?? 100,
    width: dimensions.width,
    height: dimensions.height,
    rotation: 0,
    color,
    isObstacle: type === SpecialAreaType.OBSTACLE,
  };
}

/**
 * Create Fabric.js shape for special area
 * Returns a Fabric.Group containing the shape and label
 */
export function createSpecialAreaShape(
  area: SpecialArea,
  theme: "light" | "dark"
): fabric.Group {
  const color = area.color || getDefaultSpecialAreaColor(area.type, theme);
  const strokeColor = theme === "dark" ? "#ffffff" : "#000000";
  const textColor = theme === "dark" ? "#ffffff" : "#000000";

  // Create rectangle shape
  const rect = new fabric.Rect({
    width: area.width,
    height: area.height,
    fill: color,
    opacity: area.isObstacle ? 0.3 : 0.5,
    stroke: area.isObstacle ? "#dc2626" : strokeColor,
    strokeWidth: area.isObstacle ? 3 : 2,
    strokeDashArray: area.isObstacle ? [10, 5] : undefined,
    rx: 8,
    ry: 8,
  });

  // Create label text
  const text = new fabric.Text(area.label, {
    fontSize: 14,
    fontFamily: "Inter, system-ui, sans-serif",
    fill: textColor,
    textAlign: "center",
    originX: "center",
    originY: "center",
  });

  // Create group
  const group = new fabric.Group([rect, text], {
    left: area.x,
    top: area.y,
    angle: area.rotation,
    selectable: true,
    hasControls: true,
    hasBorders: true,
    lockScalingFlip: true,
  });

  // Store area ID in group data
  group.set("data", { areaId: area.id, areaType: "special" });

  return group;
}

/**
 * Check if a rectangle intersects with another rectangle
 * Used for collision detection
 */
export function rectanglesIntersect(
  rect1: { x: number; y: number; width: number; height: number },
  rect2: { x: number; y: number; width: number; height: number }
): boolean {
  return !(
    rect1.x + rect1.width < rect2.x ||
    rect2.x + rect2.width < rect1.x ||
    rect1.y + rect1.height < rect2.y ||
    rect2.y + rect2.height < rect1.y
  );
}

/**
 * Check if a table collides with any obstacles
 * Returns true if collision detected
 */
export function checkTableObstacleCollision(
  table: TableLayout,
  obstacles: SpecialArea[]
): boolean {
  const tableRect = {
    x: table.x_position,
    y: table.y_position,
    width: table.width,
    height: table.height,
  };

  for (const obstacle of obstacles) {
    if (!obstacle.isObstacle) continue;

    const obstacleRect = {
      x: obstacle.x,
      y: obstacle.y,
      width: obstacle.width,
      height: obstacle.height,
    };

    if (rectanglesIntersect(tableRect, obstacleRect)) {
      return true;
    }
  }

  return false;
}

/**
 * Get list of obstacles from special areas
 */
export function getObstacles(specialAreas: SpecialArea[]): SpecialArea[] {
  return specialAreas.filter((area) => area.isObstacle);
}

/**
 * Calculate total area covered by special areas (in square pixels)
 */
export function calculateTotalSpecialAreaCoverage(
  specialAreas: SpecialArea[]
): number {
  return specialAreas.reduce((total, area) => {
    return total + area.width * area.height;
  }, 0);
}

/**
 * Validate special area position (within canvas bounds)
 */
export function validateSpecialAreaPosition(
  area: SpecialArea,
  canvasWidth: number,
  canvasHeight: number
): boolean {
  return (
    area.x >= 0 &&
    area.y >= 0 &&
    area.x + area.width <= canvasWidth &&
    area.y + area.height <= canvasHeight
  );
}

/**
 * Constrain special area to canvas bounds
 */
export function constrainSpecialAreaToCanvas(
  area: SpecialArea,
  canvasWidth: number,
  canvasHeight: number
): SpecialArea {
  return {
    ...area,
    x: Math.max(0, Math.min(area.x, canvasWidth - area.width)),
    y: Math.max(0, Math.min(area.y, canvasHeight - area.height)),
  };
}

/**
 * Parse venue metadata from chart_metadata JSONB field
 */
export function parseVenueMetadata(
  chartMetadata: Record<string, unknown> | null | undefined
): {
  specialAreas: SpecialArea[];
  floorPlanSettings:
    | { opacity: number; locked: boolean; scale: number }
    | undefined;
} {
  if (!chartMetadata) {
    return { specialAreas: [], floorPlanSettings: undefined };
  }

  const specialAreas = Array.isArray(chartMetadata.specialAreas)
    ? (chartMetadata.specialAreas as SpecialArea[])
    : [];

  const floorPlanSettings = chartMetadata.floorPlanSettings as
    | { opacity: number; locked: boolean; scale: number }
    | undefined;

  return { specialAreas, floorPlanSettings };
}

/**
 * Validation result for guest drop operation
 * Phase 6.3.5: Drag-and-Drop Assignment Venue-Aware
 */
export interface GuestDropValidation {
  valid: boolean;
  reason?: string;
}

/**
 * Validate if a guest can be dropped/assigned to a table
 * Checks for obstacle collisions and capacity constraints
 * Phase 6.3.5: Drag-and-Drop Assignment Venue-Aware
 */
export function validateGuestDrop(
  table: TableLayout,
  obstacles: SpecialArea[],
  currentAssignments: number,
  guestHasPlusOne: boolean
): GuestDropValidation {
  // Check if table overlaps with any obstacles
  if (checkTableObstacleCollision(table, obstacles)) {
    return { valid: false, reason: "Table overlaps with obstacle" };
  }

  // Check capacity (including plus-one if applicable)
  const seatsNeeded = guestHasPlusOne ? 2 : 1;
  const availableSeats = table.capacity - currentAssignments;

  if (seatsNeeded > availableSeats) {
    if (availableSeats === 0) {
      return { valid: false, reason: "Table is full" };
    }
    return {
      valid: false,
      reason: `Only ${availableSeats} seat(s) available, need ${seatsNeeded}`,
    };
  }

  return { valid: true };
}
