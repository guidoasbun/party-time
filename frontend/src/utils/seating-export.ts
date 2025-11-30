/**
 * FR-21: The system shall provide an interactive seating chart interface.
 * Phase 6.2.3: Export and Sharing Features
 *
 * Provides functions for exporting seating charts to various formats:
 * - PDF export with guest names
 * - High-resolution image export (PNG/JPEG)
 * - CSV guest seating list
 * - Table assignment cards
 * - Shareable links
 */

import jsPDF from "jspdf";
import * as fabric from "fabric";
import type { Canvas as FabricCanvas } from "fabric";
import {
  ExportOptions,
  ExportResult,
  GuestSeatingEntry,
  TableCard,
  RESOLUTION_DPI,
  PAPER_DIMENSIONS,
  DEFAULT_EXPORT_OPTIONS,
} from "@/types/seating-export.types";
import type {
  SeatingChartWithTables,
  SeatAssignment,
} from "@/types/seating.types";
import type { Guest } from "@/types/guest.types";
import { UUID } from "@/types/common.types";

// ============================================================================
// Canvas Preparation for Export
// FR-21: The system shall provide an interactive seating chart interface.
// Phase 6.2.3: Export and Sharing Features
// ============================================================================

/**
 * Prepare canvas for export by hiding floor plan and special areas based on options
 *
 * @param canvas - Fabric.js canvas instance
 * @param options - Export options with includeFloorPlan and includeSpecialAreas flags
 * @returns Restore function to call after export to restore hidden objects
 */
function prepareCanvasForExport(
  canvas: FabricCanvas,
  options: { includeFloorPlan: boolean; includeSpecialAreas: boolean }
): () => void {
  const hiddenObjects: fabric.Object[] = [];

  canvas.getObjects().forEach((obj) => {
    const customObj = obj as fabric.Object & {
      isFloorPlan?: boolean;
      data?: { areaType?: string };
    };

    // Floor plan has isFloorPlan: true marker (set in SeatingCanvas.tsx line 305)
    if (!options.includeFloorPlan && customObj.isFloorPlan) {
      obj.set("visible", false);
      hiddenObjects.push(obj);
    }
    // Special areas have data.areaType === "special"
    if (
      !options.includeSpecialAreas &&
      customObj.data?.areaType === "special"
    ) {
      obj.set("visible", false);
      hiddenObjects.push(obj);
    }
  });

  canvas.renderAll();

  // Return restore function
  return () => {
    hiddenObjects.forEach((obj) => obj.set("visible", true));
    canvas.renderAll();
  };
}

// ============================================================================
// Image Export Functions
// ============================================================================

/**
 * Export seating chart to high-resolution image (PNG/JPEG)
 *
 * @param fabricCanvas - Fabric.js canvas instance
 * @param options - Export options
 * @param eventName - Event name for filename
 * @returns Export result with blob and download URL
 */
export async function exportSeatingChartToImage(
  fabricCanvas: FabricCanvas | null,
  options: Partial<ExportOptions> = {},
  eventName: string = "Seating Chart"
): Promise<ExportResult> {
  try {
    if (!fabricCanvas) {
      return {
        success: false,
        error: "Canvas not available",
      };
    }

    const fullOptions = { ...DEFAULT_EXPORT_OPTIONS, ...options };
    const format = fullOptions.format === "svg" ? "png" : fullOptions.format;
    const dpi = RESOLUTION_DPI[fullOptions.resolution];
    const multiplier = dpi / 72; // Fabric.js uses 72 DPI as base

    // FR-21: Phase 6.3.9 - Prepare canvas by hiding floor plan/special areas based on options
    const restoreCanvas = prepareCanvasForExport(fabricCanvas, {
      includeFloorPlan: fullOptions.includeFloorPlan,
      includeSpecialAreas: fullOptions.includeSpecialAreas,
    });

    try {
      // Export canvas to data URL
      const dataURL = fabricCanvas.toDataURL({
        format: format === "jpeg" ? "jpeg" : "png",
        quality: 1,
        multiplier,
      });

      // Convert data URL to blob
      const response = await fetch(dataURL);
      const blob = await response.blob();

      // Create download URL
      const url = URL.createObjectURL(blob);
      const filename = `${sanitizeFilename(eventName)}-seating-chart.${format}`;

      return {
        success: true,
        filename,
        blob,
        url,
      };
    } finally {
      // Always restore canvas visibility
      restoreCanvas();
    }
  } catch (error) {
    console.error("Error exporting image:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to export image",
    };
  }
}

/**
 * Export seating chart to SVG format
 *
 * @param fabricCanvas - Fabric.js canvas instance
 * @param eventName - Event name for filename
 * @param options - Export options for floor plan/special areas inclusion
 * @returns Export result with SVG content
 */
export async function exportSeatingChartToSVG(
  fabricCanvas: FabricCanvas | null,
  eventName: string = "Seating Chart",
  options: Partial<ExportOptions> = {}
): Promise<ExportResult> {
  try {
    if (!fabricCanvas) {
      return {
        success: false,
        error: "Canvas not available",
      };
    }

    const fullOptions = { ...DEFAULT_EXPORT_OPTIONS, ...options };

    // FR-21: Phase 6.3.9 - Prepare canvas by hiding floor plan/special areas based on options
    const restoreCanvas = prepareCanvasForExport(fabricCanvas, {
      includeFloorPlan: fullOptions.includeFloorPlan,
      includeSpecialAreas: fullOptions.includeSpecialAreas,
    });

    try {
      // Export canvas to SVG
      const svgString = fabricCanvas.toSVG();
      const blob = new Blob([svgString], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const filename = `${sanitizeFilename(eventName)}-seating-chart.svg`;

      return {
        success: true,
        filename,
        blob,
        url,
      };
    } finally {
      // Always restore canvas visibility
      restoreCanvas();
    }
  } catch (error) {
    console.error("Error exporting SVG:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to export SVG",
    };
  }
}

// ============================================================================
// PDF Export Functions
// ============================================================================

/**
 * Export seating chart to PDF with embedded image
 *
 * @param fabricCanvas - Fabric.js canvas instance
 * @param chart - Seating chart data with tables
 * @param eventName - Event name
 * @param eventDate - Event date
 * @param venueName - Venue name
 * @param options - Export options
 * @returns Export result with PDF blob
 */
export async function exportSeatingChartToPDF(
  fabricCanvas: FabricCanvas | null,
  chart: SeatingChartWithTables,
  eventName: string,
  eventDate?: string,
  venueName?: string,
  options: Partial<ExportOptions> = {}
): Promise<ExportResult> {
  try {
    if (!fabricCanvas) {
      return {
        success: false,
        error: "Canvas not available",
      };
    }

    const fullOptions = { ...DEFAULT_EXPORT_OPTIONS, ...options };
    const paperSize = fullOptions.paperSize || "letter";
    const orientation = fullOptions.orientation || "landscape";
    const dimensions = PAPER_DIMENSIONS[paperSize];

    // FR-21: Phase 6.3.9 - Prepare canvas by hiding floor plan/special areas based on options
    const restoreCanvas = prepareCanvasForExport(fabricCanvas, {
      includeFloorPlan: fullOptions.includeFloorPlan,
      includeSpecialAreas: fullOptions.includeSpecialAreas,
    });

    try {
      // Create PDF
      const pdf = new jsPDF({
        orientation,
        unit: "in",
        format: [dimensions.width, dimensions.height],
      });

      // Add header
      addPDFHeader(pdf, eventName, dimensions, eventDate, venueName);

      // Export canvas to high-res image
      const multiplier = 2; // 144 DPI for PDF
      const imageData = fabricCanvas.toDataURL({
        format: "png",
        quality: 1,
        multiplier,
      });

      // Calculate image dimensions to fit on page with margins
      const margin = 0.5; // 0.5 inch margins
      const maxWidth = dimensions.width - 2 * margin;
      const maxHeight = dimensions.height - 2.5 * margin; // Extra space for header

      const canvasWidth = fabricCanvas.getWidth();
      const canvasHeight = fabricCanvas.getHeight();
      const aspectRatio = canvasWidth / canvasHeight;

      let imgWidth = maxWidth;
      let imgHeight = imgWidth / aspectRatio;

      if (imgHeight > maxHeight) {
        imgHeight = maxHeight;
        imgWidth = imgHeight * aspectRatio;
      }

      // Center image horizontally
      const xPos = (dimensions.width - imgWidth) / 2;
      const yPos = 1.5; // Below header

      // Add image to PDF
      pdf.addImage(imageData, "PNG", xPos, yPos, imgWidth, imgHeight);

      // Add footer
      addPDFFooter(pdf, chart, dimensions);

      // Generate blob
      const pdfBlob = pdf.output("blob");
      const url = URL.createObjectURL(pdfBlob);
      const filename = `${sanitizeFilename(eventName)}-seating-chart.pdf`;

      return {
        success: true,
        filename,
        blob: pdfBlob,
        url,
      };
    } finally {
      // Always restore canvas visibility
      restoreCanvas();
    }
  } catch (error) {
    console.error("Error exporting PDF:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to export PDF",
    };
  }
}

/**
 * Add header to PDF
 */
function addPDFHeader(
  pdf: jsPDF,
  eventName: string,
  dimensions: { width: number; height: number },
  eventDate?: string,
  venueName?: string
): void {
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.text(eventName, dimensions.width / 2, 0.5, { align: "center" });

  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");
  let yPos = 0.75;

  if (eventDate) {
    pdf.text(`Date: ${eventDate}`, dimensions.width / 2, yPos, {
      align: "center",
    });
    yPos += 0.2;
  }

  if (venueName) {
    pdf.text(`Venue: ${venueName}`, dimensions.width / 2, yPos, {
      align: "center",
    });
  }
}

/**
 * Add footer to PDF
 */
function addPDFFooter(
  pdf: jsPDF,
  chart: SeatingChartWithTables,
  dimensions: { width: number; height: number }
): void {
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(128, 128, 128);

  const footerText = `Seating Chart: ${chart.name} • Total Tables: ${chart.total_tables} • Total Capacity: ${chart.total_capacity}`;
  pdf.text(footerText, dimensions.width / 2, dimensions.height - 0.3, {
    align: "center",
  });

  const timestamp = new Date().toLocaleDateString();
  pdf.text(
    `Generated: ${timestamp}`,
    dimensions.width / 2,
    dimensions.height - 0.15,
    {
      align: "center",
    }
  );
}

// ============================================================================
// Table Assignment Cards PDF
// ============================================================================

/**
 * Generate PDF with table assignment cards (2-4 per page)
 *
 * @param tableCards - Array of table card data
 * @param eventName - Event name
 * @param cardsPerPage - Number of cards per page (2, 4, or 6)
 * @returns Export result with PDF blob
 */
export async function generateTableAssignmentCardsPDF(
  tableCards: TableCard[],
  eventName: string,
  cardsPerPage: 2 | 4 | 6 = 4
): Promise<ExportResult> {
  try {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "in",
      format: "letter",
    });

    const pageWidth = 8.5;
    const pageHeight = 11;
    const margin = 0.5;

    // Calculate card dimensions based on cards per page
    const cols = cardsPerPage === 2 ? 1 : 2;
    const rows = cardsPerPage === 2 ? 2 : cardsPerPage === 4 ? 2 : 3;

    const cardWidth = (pageWidth - margin * (cols + 1)) / cols;
    const cardHeight = (pageHeight - margin * (rows + 1)) / rows;

    let cardIndex = 0;

    for (const card of tableCards) {
      // Add new page if needed
      if (cardIndex > 0 && cardIndex % cardsPerPage === 0) {
        pdf.addPage();
      }

      const position = cardIndex % cardsPerPage;
      const col = position % cols;
      const row = Math.floor(position / cols);

      const x = margin + col * (cardWidth + margin);
      const y = margin + row * (cardHeight + margin);

      // Draw card border
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.02);
      pdf.rect(x, y, cardWidth, cardHeight);

      // Add table number (large, centered)
      pdf.setFontSize(36);
      pdf.setFont("helvetica", "bold");
      pdf.text(`Table ${card.table_number}`, x + cardWidth / 2, y + 0.8, {
        align: "center",
      });

      // Add table type and capacity
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        `${card.table_type} • Capacity: ${card.capacity}`,
        x + cardWidth / 2,
        y + 1.1,
        { align: "center" }
      );

      // Add horizontal line
      pdf.setLineWidth(0.01);
      pdf.line(x + 0.3, y + 1.3, x + cardWidth - 0.3, y + 1.3);

      // Add guest list
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      let guestYPos = y + 1.6;

      if (card.guests.length === 0) {
        pdf.setTextColor(128, 128, 128);
        pdf.text("No guests assigned", x + cardWidth / 2, guestYPos, {
          align: "center",
        });
      } else {
        pdf.setTextColor(0, 0, 0);
        for (const guest of card.guests) {
          if (guestYPos + 0.2 > y + cardHeight - 0.2) break; // Don't overflow card

          const guestText = `${guest.seat_number}. ${guest.name}`;
          pdf.text(guestText, x + 0.3, guestYPos);

          if (guest.dietary_restrictions) {
            pdf.setFontSize(8);
            pdf.setTextColor(100, 100, 100);
            pdf.text(
              `  ${guest.dietary_restrictions}`,
              x + 0.3,
              guestYPos + 0.15
            );
            guestYPos += 0.15;
            pdf.setFontSize(10);
            pdf.setTextColor(0, 0, 0);
          }

          guestYPos += 0.25;
        }
      }

      cardIndex++;
    }

    const pdfBlob = pdf.output("blob");
    const url = URL.createObjectURL(pdfBlob);
    const filename = `${sanitizeFilename(eventName)}-table-cards.pdf`;

    return {
      success: true,
      filename,
      blob: pdfBlob,
      url,
    };
  } catch (error) {
    console.error("Error generating table cards PDF:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate table cards",
    };
  }
}

// ============================================================================
// CSV Export Functions
// ============================================================================

/**
 * Generate CSV export of guest seating list
 *
 * @param guestSeatingList - Array of guest seating entries
 * @param eventName - Event name for filename
 * @param sortBy - Sort order ('name' or 'table')
 * @returns Export result with CSV blob
 */
export function generateGuestSeatingListCSV(
  guestSeatingList: GuestSeatingEntry[],
  eventName: string,
  sortBy: "name" | "table" = "table"
): ExportResult {
  try {
    // Sort data
    const sorted = [...guestSeatingList].sort((a, b) => {
      if (sortBy === "name") {
        return a.guest_name.localeCompare(b.guest_name);
      } else {
        // Sort by table number (natural sort for "1", "2", "10", etc.)
        const tableA = parseInt(a.table_number) || a.table_number;
        const tableB = parseInt(b.table_number) || b.table_number;
        if (tableA < tableB) return -1;
        if (tableA > tableB) return 1;
        return a.seat_number - b.seat_number;
      }
    });

    // CSV headers
    const headers = [
      "Table Number",
      "Seat Number",
      "Guest Name",
      "Email",
      "RSVP Status",
      "Dietary Restrictions",
      "Meal Preference",
    ];

    // CSV rows
    const rows = sorted.map((entry) => [
      entry.table_number,
      entry.seat_number.toString(),
      entry.guest_name,
      entry.email || "",
      entry.rsvp_status,
      entry.dietary_restrictions || "",
      entry.meal_preference || "",
    ]);

    // Build CSV string
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    // Create blob
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const filename = `${sanitizeFilename(eventName)}-guest-seating-list.csv`;

    return {
      success: true,
      filename,
      blob,
      url,
    };
  } catch (error) {
    console.error("Error generating CSV:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate CSV",
    };
  }
}

// ============================================================================
// Share Link Functions
// ============================================================================

/**
 * Generate shareable link for seating chart (frontend-only, no backend token)
 *
 * @param eventId - Event ID
 * @param chartId - Seating chart ID
 * @returns Shareable URL
 */
export function generateShareableLink(eventId: UUID, chartId: UUID): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/seating/share/${eventId}/${chartId}`;
}

/**
 * Copy text to clipboard
 *
 * @param text - Text to copy
 * @returns Promise that resolves when copy is successful
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
}

// ============================================================================
// Data Transformation Functions
// ============================================================================

/**
 * Transform seating chart data to guest seating entries
 *
 * @param chart - Seating chart with tables
 * @param guests - Array of guests
 * @param seatAssignments - Array of seat assignments
 * @returns Array of guest seating entries
 */
export function transformToGuestSeatingList(
  chart: SeatingChartWithTables,
  guests: Guest[],
  seatAssignments: SeatAssignment[]
): GuestSeatingEntry[] {
  const entries: GuestSeatingEntry[] = [];

  // Create guest lookup map
  const guestMap = new Map(guests.map((g) => [g.id, g]));

  // Process each table
  for (const table of chart.tables) {
    // Get assignments for this table
    const tableAssignments = seatAssignments.filter(
      (sa) => sa.table_layout_id === table.id && sa.guest_id
    );

    for (const assignment of tableAssignments) {
      const guest = guestMap.get(assignment.guest_id!);
      if (!guest) continue;

      entries.push({
        guest_id: guest.id,
        guest_name: `${guest.first_name} ${guest.last_name}`,
        table_number: table.table_number,
        seat_number: assignment.seat_number,
        email: guest.email,
        dietary_restrictions: guest.dietary_restrictions || undefined,
        meal_preference: guest.meal_preference || undefined,
        rsvp_status: guest.rsvp_status || "pending",
      });
    }
  }

  return entries;
}

/**
 * Transform tables to table card data
 *
 * @param chart - Seating chart with tables
 * @param guests - Array of guests
 * @param seatAssignments - Array of seat assignments
 * @returns Array of table cards
 */
export function transformToTableCards(
  chart: SeatingChartWithTables,
  guests: Guest[],
  seatAssignments: SeatAssignment[]
): TableCard[] {
  const cards: TableCard[] = [];

  // Create guest lookup map
  const guestMap = new Map(guests.map((g) => [g.id, g]));

  // Process each table
  for (const table of chart.tables) {
    // Get assignments for this table
    const tableAssignments = seatAssignments.filter(
      (sa) => sa.table_layout_id === table.id && sa.guest_id
    );

    // Sort by seat number
    tableAssignments.sort((a, b) => a.seat_number - b.seat_number);

    const tableGuests = tableAssignments.map((assignment) => {
      const guest = guestMap.get(assignment.guest_id!);
      return {
        name: guest
          ? `${guest.first_name} ${guest.last_name}`
          : "Unknown Guest",
        seat_number: assignment.seat_number,
        dietary_restrictions: guest?.dietary_restrictions || undefined,
      };
    });

    cards.push({
      table_id: table.id,
      table_number: table.table_number,
      table_type: table.table_type,
      capacity: table.capacity,
      guests: tableGuests,
    });
  }

  // Sort by table number (natural sort)
  cards.sort((a, b) => {
    const numA = parseInt(a.table_number) || a.table_number;
    const numB = parseInt(b.table_number) || b.table_number;
    if (numA < numB) return -1;
    if (numA > numB) return 1;
    return 0;
  });

  return cards;
}

// ============================================================================
// Download Helper Functions
// ============================================================================

/**
 * Trigger download of a blob
 *
 * @param blob - Blob to download
 * @param filename - Filename for download
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Sanitize filename for safe downloads
 *
 * @param filename - Original filename
 * @returns Sanitized filename
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9_\-]/gi, "_")
    .replace(/_+/g, "_")
    .toLowerCase();
}
