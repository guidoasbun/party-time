/**
 * Venue Layout Types
 * FR-21: The system shall provide an interactive seating chart interface.
 * Phase 6.2.2: Venue Layout Integration
 *
 * Defines types for floor plans, special areas, and venue metadata
 */

export enum SpecialAreaType {
  STAGE = "stage",
  DANCE_FLOOR = "dance_floor",
  BAR = "bar",
  BUFFET = "buffet",
  DJ_BOOTH = "dj_booth",
  PHOTO_BOOTH = "photo_booth",
  ENTRANCE = "entrance",
  EXIT = "exit",
  RESTROOM = "restroom",
  OBSTACLE = "obstacle",
}

// Phase 6.3.7: Shape type for special areas (rectangle or circle)
export type SpecialAreaShape = "rectangle" | "circle";

export const SPECIAL_AREA_LABELS: Record<SpecialAreaType, string> = {
  [SpecialAreaType.STAGE]: "Stage",
  [SpecialAreaType.DANCE_FLOOR]: "Dance Floor",
  [SpecialAreaType.BAR]: "Bar",
  [SpecialAreaType.BUFFET]: "Buffet",
  [SpecialAreaType.DJ_BOOTH]: "DJ Booth",
  [SpecialAreaType.PHOTO_BOOTH]: "Photo Booth",
  [SpecialAreaType.ENTRANCE]: "Entrance",
  [SpecialAreaType.EXIT]: "Exit",
  [SpecialAreaType.RESTROOM]: "Restroom",
  [SpecialAreaType.OBSTACLE]: "Obstacle/Wall",
};

export interface SpecialArea {
  id: string; // UUID
  type: SpecialAreaType;
  shape?: SpecialAreaShape; // Phase 6.3.7: Optional shape (defaults to "rectangle")
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // 0-360 degrees
  color?: string; // Optional custom color (hex)
  isObstacle: boolean; // Whether this area blocks table placement
  metadata?: Record<string, unknown>; // Flexible metadata storage
}

export interface FloorPlanSettings {
  opacity: number; // 0.0-1.0
  locked: boolean; // Prevent accidental dragging
  scale: number; // Scaling factor (1.0 = original size)
  offsetX?: number; // X offset for positioning
  offsetY?: number; // Y offset for positioning
  // Phase 6.3.7: Store applied scale values for size persistence across screen resizes
  appliedScaleX?: number; // Actual scaleX applied to image
  appliedScaleY?: number; // Actual scaleY applied to image
}

export interface AccessibilityPathSettings {
  enabled: boolean;
  width: number; // Path width in pixels (e.g., 120 for 48 inches)
  color: string; // Color for path visualization
}

export interface VenueMetadata {
  specialAreas: SpecialArea[];
  floorPlanSettings?: FloorPlanSettings;
  accessibilityPaths?: AccessibilityPathSettings;
}

export interface FloorPlanUploadData {
  file: File;
  preview: string; // base64 data URL
  dimensions: {
    width: number;
    height: number;
  };
}

// Default values
export const DEFAULT_FLOOR_PLAN_SETTINGS: FloorPlanSettings = {
  opacity: 0.5,
  locked: false,
  scale: 1.0,
  offsetX: 0,
  offsetY: 0,
};

export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilityPathSettings = {
  enabled: false,
  width: 120, // 48 inches wheelchair accessible
  color: "#22c55e", // green-500
};

// Default special area dimensions (in pixels, approximate feet conversion: 1 foot ≈ 30 pixels)
export const DEFAULT_SPECIAL_AREA_DIMENSIONS: Record<
  SpecialAreaType,
  { width: number; height: number }
> = {
  [SpecialAreaType.STAGE]: { width: 300, height: 200 }, // ~10x7 feet
  [SpecialAreaType.DANCE_FLOOR]: { width: 400, height: 400 }, // ~13x13 feet
  [SpecialAreaType.BAR]: { width: 180, height: 90 }, // ~6x3 feet
  [SpecialAreaType.BUFFET]: { width: 240, height: 90 }, // ~8x3 feet
  [SpecialAreaType.DJ_BOOTH]: { width: 150, height: 120 }, // ~5x4 feet
  [SpecialAreaType.PHOTO_BOOTH]: { width: 120, height: 120 }, // ~4x4 feet
  [SpecialAreaType.ENTRANCE]: { width: 100, height: 60 }, // ~3x2 feet
  [SpecialAreaType.EXIT]: { width: 100, height: 60 }, // ~3x2 feet
  [SpecialAreaType.RESTROOM]: { width: 150, height: 150 }, // ~5x5 feet
  [SpecialAreaType.OBSTACLE]: { width: 100, height: 100 }, // ~3x3 feet (custom)
};

// Theme-aware color defaults for special areas
export const SPECIAL_AREA_COLORS = {
  light: {
    [SpecialAreaType.STAGE]: "#10b981", // green-500 (emerald)
    [SpecialAreaType.DANCE_FLOOR]: "#8b5cf6", // violet-500
    [SpecialAreaType.BAR]: "#f59e0b", // amber-500
    [SpecialAreaType.BUFFET]: "#3b82f6", // blue-500 (primary)
    [SpecialAreaType.DJ_BOOTH]: "#ec4899", // pink-500
    [SpecialAreaType.PHOTO_BOOTH]: "#06b6d4", // cyan-500
    [SpecialAreaType.ENTRANCE]: "#22c55e", // green-500
    [SpecialAreaType.EXIT]: "#ef4444", // red-500 (destructive)
    [SpecialAreaType.RESTROOM]: "#6366f1", // indigo-500
    [SpecialAreaType.OBSTACLE]: "#dc2626", // red-600 (strong destructive)
  },
  dark: {
    [SpecialAreaType.STAGE]: "#34d399", // green-400 (brighter)
    [SpecialAreaType.DANCE_FLOOR]: "#a78bfa", // violet-400
    [SpecialAreaType.BAR]: "#fbbf24", // amber-400
    [SpecialAreaType.BUFFET]: "#60a5fa", // blue-400
    [SpecialAreaType.DJ_BOOTH]: "#f472b6", // pink-400
    [SpecialAreaType.PHOTO_BOOTH]: "#22d3ee", // cyan-400
    [SpecialAreaType.ENTRANCE]: "#4ade80", // green-400
    [SpecialAreaType.EXIT]: "#f87171", // red-400
    [SpecialAreaType.RESTROOM]: "#818cf8", // indigo-400
    [SpecialAreaType.OBSTACLE]: "#ef4444", // red-500
  },
} as const;

// Validation constants
export const MAX_FLOOR_PLAN_SIZE_MB = 5;
export const MAX_FLOOR_PLAN_SIZE_BYTES = MAX_FLOOR_PLAN_SIZE_MB * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/svg+xml",
];
export const ALLOWED_IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".svg"];
