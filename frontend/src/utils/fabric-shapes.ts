/**
 * Fabric.js shape factory utilities for seating charts
 *
 * FR-21: Interactive seating chart interface
 * Phase 6.1.3: Fabric.js Canvas Setup
 */

import * as fabric from 'fabric';
import { TableType, TableLayout, UUID } from '@/types';

// ============================================================================
// Type Definitions
// ============================================================================

export interface TableShapeOptions {
  id: UUID;
  tableNumber: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  capacity: number;
  assignedCount?: number;
  tableType: TableType;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  selectable?: boolean;
  hasControls?: boolean;
  evented?: boolean;
}

export interface TableColorScheme {
  fill: string;
  stroke: string;
  selectedFill: string;
  text: string;
  emptySeat: string;
  occupiedSeat: string;
}

export interface GridConfig {
  enabled: boolean;
  size: number;
  color: string;
  showLines: boolean;
}

// ============================================================================
// Theme-Aware Color Utilities
// ============================================================================

/**
 * Extract CSS variables from document root with theme-aware fallbacks
 */
function getCSSVariable(variableName: string, theme: 'light' | 'dark'): string {
  // Fallback colors for each theme
  const fallbacks: Record<'light' | 'dark', Record<string, string>> = {
    light: {
      '--muted': '#f9fafb',
      '--border': '#e5e7eb',
      '--primary': '#2563eb',
      '--foreground': '#171717'
    },
    dark: {
      '--muted': '#1f2937',
      '--border': '#374151',
      '--primary': '#3b82f6',
      '--foreground': '#ededed'
    }
  };

  if (typeof window === 'undefined') {
    // Return theme-appropriate fallback for SSR
    return fallbacks[theme][variableName] || '#808080';
  }

  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim();

  console.log('🎨 [CSS VARIABLE]', { variableName, value, theme });

  // If we got a valid hex color
  if (value && value.startsWith('#')) return value;

  // If we got an rgb value, convert to hex
  if (value && value.startsWith('rgb')) {
    const rgb = value.match(/\d+/g);
    if (rgb && rgb.length >= 3) {
      const hex = '#' + rgb.slice(0, 3).map(x => {
        const hex = parseInt(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      }).join('');
      return hex;
    }
  }

  // Fallback to theme-appropriate color instead of black
  const fallback = fallbacks[theme][variableName] || '#808080';
  console.log('⚠️ [CSS VARIABLE FALLBACK]', { variableName, fallback, theme });
  return fallback;
}

/**
 * Get theme-aware color scheme for table shapes
 */
export function getThemeAwareTableColors(theme: 'light' | 'dark'): TableColorScheme {
  return {
    fill: getCSSVariable('--muted', theme),
    stroke: getCSSVariable('--border', theme),
    selectedFill: getCSSVariable('--primary', theme),
    text: getCSSVariable('--foreground', theme),
    emptySeat: theme === 'dark' ? '#4b5563' : '#d1d5db',
    occupiedSeat: theme === 'dark' ? '#10b981' : '#059669',
  };
}

// ============================================================================
// Grid Utilities
// ============================================================================

/**
 * Snap a value to the nearest grid increment
 */
export function snapToGrid(value: number, gridSize: number): number {
  if (gridSize <= 0) return value;
  return Math.round(value / gridSize) * gridSize;
}

/**
 * Render grid lines on canvas
 */
export function renderGridLines(
  canvas: fabric.Canvas,
  config: GridConfig
): void {
  if (!config.enabled || !config.showLines) return;

  const canvasWidth = canvas.getWidth();
  const canvasHeight = canvas.getHeight();
  const gridSize = config.size;

  // Remove existing grid lines
  const existingGridLines = canvas.getObjects().filter(
    (obj) => (obj as fabric.Object & { isGridLine?: boolean }).isGridLine
  );
  existingGridLines.forEach((line) => canvas.remove(line));

  // Draw vertical lines (send to back to ensure they appear behind tables)
  for (let x = 0; x <= canvasWidth; x += gridSize) {
    const line = new fabric.Line([x, 0, x, canvasHeight], {
      stroke: config.color,
      strokeWidth: 1,
      strokeDashArray: [5, 5],
      selectable: false,
      evented: false,
      opacity: 0.3,
    }) as fabric.Line & { isGridLine?: boolean };
    line.isGridLine = true;
    canvas.add(line);
    canvas.sendObjectToBack(line);
  }

  // Draw horizontal lines
  for (let y = 0; y <= canvasHeight; y += gridSize) {
    const line = new fabric.Line([0, y, canvasWidth, y], {
      stroke: config.color,
      strokeWidth: 1,
      strokeDashArray: [5, 5],
      selectable: false,
      evented: false,
      opacity: 0.3,
    }) as fabric.Line & { isGridLine?: boolean };
    line.isGridLine = true;
    canvas.add(line);
    canvas.sendObjectToBack(line);
  }

  canvas.renderAll();
}

// ============================================================================
// Constraint Utilities
// ============================================================================

/**
 * Constrain an object to stay within canvas bounds
 */
export function constrainToCanvasBounds(
  obj: fabric.Object,
  canvas: fabric.Canvas
): void {
  const objBoundingRect = obj.getBoundingRect();
  const canvasWidth = canvas.getWidth();
  const canvasHeight = canvas.getHeight();

  let left = obj.left ?? 0;
  let top = obj.top ?? 0;

  // Track original position to detect if constraints were applied
  const originalLeft = left;
  const originalTop = top;

  // Constrain horizontal position
  if (objBoundingRect.left < 0) {
    left = Math.max(left - objBoundingRect.left, 0);
  }
  if (objBoundingRect.left + objBoundingRect.width > canvasWidth) {
    left = Math.min(left, canvasWidth - objBoundingRect.width);
  }

  // Constrain vertical position
  if (objBoundingRect.top < 0) {
    top = Math.max(top - objBoundingRect.top, 0);
  }
  if (objBoundingRect.top + objBoundingRect.height > canvasHeight) {
    top = Math.min(top, canvasHeight - objBoundingRect.height);
  }

  // Only update position if it actually changed due to constraints
  if (left !== originalLeft || top !== originalTop) {
    obj.set({ left, top });
    obj.setCoords();
  }
}

/**
 * Check if two tables overlap
 */
export function checkTableOverlap(
  table1: fabric.Object,
  table2: fabric.Object
): boolean {
  const rect1 = table1.getBoundingRect();
  const rect2 = table2.getBoundingRect();

  return !(
    rect1.left + rect1.width < rect2.left ||
    rect2.left + rect2.width < rect1.left ||
    rect1.top + rect1.height < rect2.top ||
    rect2.top + rect2.height < rect1.top
  );
}

// ============================================================================
// Shape Factory Functions
// ============================================================================

/**
 * Create a round table shape
 */
export function createRoundTable(
  options: TableShapeOptions
): fabric.Group {
  const radius = options.width / 2;
  const colors = getThemeAwareTableColors(
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );

  // Main circle
  const circle = new fabric.Circle({
    radius,
    fill: options.fill || colors.fill,
    stroke: options.stroke || colors.stroke,
    strokeWidth: options.strokeWidth ?? 2,
  });

  // Table number text
  const text = new fabric.Text(options.tableNumber, {
    fontSize: 16,
    fontFamily: 'var(--font-sans), sans-serif',
    fill: colors.text,
    originX: 'center',
    originY: 'center',
  });

  // Capacity indicator (small text below table number)
  const capacityText = new fabric.Text(
    `${options.assignedCount ?? 0}/${options.capacity}`,
    {
      fontSize: 12,
      fontFamily: 'var(--font-sans), sans-serif',
      fill: colors.text,
      originX: 'center',
      originY: 'center',
      top: 12,
    }
  );

  const group = new fabric.Group([circle, text, capacityText], {
    left: options.x,
    top: options.y,
    angle: options.rotation,
    selectable: options.selectable ?? true,
    hasControls: options.hasControls ?? true,
    evented: options.evented ?? true,
    lockScalingFlip: true,
  }) as fabric.Group & { data?: Record<string, unknown> };

  // Store metadata
  group.data = {
    id: options.id,
    tableNumber: options.tableNumber,
    tableType: options.tableType,
    capacity: options.capacity,
    assignedCount: options.assignedCount ?? 0,
  };

  return group;
}

/**
 * Create a rectangular table shape
 */
export function createRectangularTable(
  options: TableShapeOptions
): fabric.Group {
  const colors = getThemeAwareTableColors(
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );

  // Main rectangle with rounded corners
  const rect = new fabric.Rect({
    width: options.width,
    height: options.height,
    fill: options.fill || colors.fill,
    stroke: options.stroke || colors.stroke,
    strokeWidth: options.strokeWidth ?? 2,
    rx: 8,
    ry: 8,
  });

  // Table number text
  const text = new fabric.Text(options.tableNumber, {
    fontSize: 16,
    fontFamily: 'var(--font-sans), sans-serif',
    fill: colors.text,
    originX: 'center',
    originY: 'center',
    left: options.width / 2,
    top: options.height / 2 - 8,
  });

  // Capacity indicator
  const capacityText = new fabric.Text(
    `${options.assignedCount ?? 0}/${options.capacity}`,
    {
      fontSize: 12,
      fontFamily: 'var(--font-sans), sans-serif',
      fill: colors.text,
      originX: 'center',
      originY: 'center',
      left: options.width / 2,
      top: options.height / 2 + 8,
    }
  );

  const group = new fabric.Group([rect, text, capacityText], {
    left: options.x,
    top: options.y,
    angle: options.rotation,
    selectable: options.selectable ?? true,
    hasControls: options.hasControls ?? true,
    evented: options.evented ?? true,
    lockScalingFlip: true,
  }) as fabric.Group & { data?: Record<string, unknown> };

  // Store metadata
  group.data = {
    id: options.id,
    tableNumber: options.tableNumber,
    tableType: options.tableType,
    capacity: options.capacity,
    assignedCount: options.assignedCount ?? 0,
  };

  return group;
}

/**
 * Create a square table shape
 */
export function createSquareTable(
  options: TableShapeOptions
): fabric.Group {
  const size = Math.min(options.width, options.height);
  const colors = getThemeAwareTableColors(
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );

  // Main square with rounded corners
  const square = new fabric.Rect({
    width: size,
    height: size,
    fill: options.fill || colors.fill,
    stroke: options.stroke || colors.stroke,
    strokeWidth: options.strokeWidth ?? 2,
    rx: 8,
    ry: 8,
  });

  // Table number text
  const text = new fabric.Text(options.tableNumber, {
    fontSize: 16,
    fontFamily: 'var(--font-sans), sans-serif',
    fill: colors.text,
    originX: 'center',
    originY: 'center',
    left: size / 2,
    top: size / 2 - 8,
  });

  // Capacity indicator
  const capacityText = new fabric.Text(
    `${options.assignedCount ?? 0}/${options.capacity}`,
    {
      fontSize: 12,
      fontFamily: 'var(--font-sans), sans-serif',
      fill: colors.text,
      originX: 'center',
      originY: 'center',
      left: size / 2,
      top: size / 2 + 8,
    }
  );

  const group = new fabric.Group([square, text, capacityText], {
    left: options.x,
    top: options.y,
    angle: options.rotation,
    selectable: options.selectable ?? true,
    hasControls: options.hasControls ?? true,
    evented: options.evented ?? true,
    lockScalingFlip: true,
  }) as fabric.Group & { data?: Record<string, unknown> };

  // Store metadata
  group.data = {
    id: options.id,
    tableNumber: options.tableNumber,
    tableType: options.tableType,
    capacity: options.capacity,
    assignedCount: options.assignedCount ?? 0,
  };

  return group;
}

/**
 * Create a custom table shape (polygon or path)
 */
export function createCustomTable(
  options: TableShapeOptions
): fabric.Group {
  const colors = getThemeAwareTableColors(
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );

  // For custom tables, we'll use a rounded rectangle as a placeholder
  // In the future, this can be extended to support custom SVG paths
  const customShape = new fabric.Rect({
    width: options.width,
    height: options.height,
    fill: options.fill || colors.fill,
    stroke: options.stroke || colors.stroke,
    strokeWidth: options.strokeWidth ?? 2,
    rx: 12,
    ry: 12,
  });

  // Table number text
  const text = new fabric.Text(options.tableNumber, {
    fontSize: 16,
    fontFamily: 'var(--font-sans), sans-serif',
    fill: colors.text,
    originX: 'center',
    originY: 'center',
    left: options.width / 2,
    top: options.height / 2 - 8,
  });

  // Capacity indicator
  const capacityText = new fabric.Text(
    `${options.assignedCount ?? 0}/${options.capacity}`,
    {
      fontSize: 12,
      fontFamily: 'var(--font-sans), sans-serif',
      fill: colors.text,
      originX: 'center',
      originY: 'center',
      left: options.width / 2,
      top: options.height / 2 + 8,
    }
  );

  const group = new fabric.Group([customShape, text, capacityText], {
    left: options.x,
    top: options.y,
    angle: options.rotation,
    selectable: options.selectable ?? true,
    hasControls: options.hasControls ?? true,
    evented: options.evented ?? true,
    lockScalingFlip: true,
  }) as fabric.Group & { data?: Record<string, unknown> };

  // Store metadata
  group.data = {
    id: options.id,
    tableNumber: options.tableNumber,
    tableType: options.tableType,
    capacity: options.capacity,
    assignedCount: options.assignedCount ?? 0,
  };

  return group;
}

/**
 * Create table shape based on type
 */
export function createTableShape(
  tableLayout: TableLayout,
  options?: Partial<TableShapeOptions>
): fabric.Group {
  console.log("🏭 [CREATE TABLE SHAPE] Input data:", {
    tableLayout: {
      id: tableLayout.id,
      table_number: tableLayout.table_number,
      table_type: tableLayout.table_type,
      x_position: tableLayout.x_position,
      y_position: tableLayout.y_position,
      width: tableLayout.width,
      height: tableLayout.height,
      rotation: tableLayout.rotation,
      capacity: tableLayout.capacity,
    },
    options,
  });

  // Convert string coordinates to numbers (PostgreSQL Decimal types come as strings)
  const shapeOptions: TableShapeOptions = {
    id: tableLayout.id,
    tableNumber: tableLayout.table_number,
    x: typeof tableLayout.x_position === 'string' ? parseFloat(tableLayout.x_position) : tableLayout.x_position,
    y: typeof tableLayout.y_position === 'string' ? parseFloat(tableLayout.y_position) : tableLayout.y_position,
    width: typeof tableLayout.width === 'string' ? parseFloat(tableLayout.width) : tableLayout.width,
    height: typeof tableLayout.height === 'string' ? parseFloat(tableLayout.height) : tableLayout.height,
    rotation: typeof tableLayout.rotation === 'string' ? parseFloat(tableLayout.rotation) : tableLayout.rotation,
    capacity: tableLayout.capacity,
    tableType: tableLayout.table_type,
    ...options,
  };

  console.log("🏭 [CREATE TABLE SHAPE] Shape options (after number conversion):", shapeOptions);

  let shape: fabric.Group;
  switch (tableLayout.table_type) {
    case TableType.ROUND:
      shape = createRoundTable(shapeOptions);
      break;
    case TableType.RECTANGULAR:
      shape = createRectangularTable(shapeOptions);
      break;
    case TableType.SQUARE:
      shape = createSquareTable(shapeOptions);
      break;
    case TableType.CUSTOM:
      shape = createCustomTable(shapeOptions);
      break;
    default:
      shape = createRectangularTable(shapeOptions);
  }

  console.log("🏭 [CREATE TABLE SHAPE] Result shape:", {
    type: shape.type,
    left: shape.left,
    top: shape.top,
    width: shape.width,
    height: shape.height,
    angle: shape.angle,
    scaleX: shape.scaleX,
    scaleY: shape.scaleY,
    visible: shape.visible,
    opacity: shape.opacity,
    fill: shape.fill,
    stroke: shape.stroke,
    objectsLength: shape._objects?.length,
  });

  return shape;
}
