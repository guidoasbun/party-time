/**
 * FR-21: The system shall provide an interactive seating chart interface.
 * Phase 6.2.3: Export and Sharing Features
 *
 * Provides UI for exporting seating charts in multiple formats:
 * - PDF export with guest names
 * - High-resolution image export (PNG/JPEG/SVG)
 * - Print view with table cards and guest list
 * - CSV guest seating list
 * - Shareable links
 */

"use client";

import React, { useState } from "react";
import type { Canvas as FabricCanvas } from "fabric";
import {
  Download,
  FileText,
  Image,
  Printer,
  Share2,
  FileSpreadsheet,
  X,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import type {
  SeatingChartWithTables,
  SeatAssignment,
} from "@/types/seating.types";
import type { Guest } from "@/types/guest.types";
import type {
  ExportOptions,
  ExportFormat,
  ResolutionLevel,
  PaperSize,
  Orientation,
  PrintOptions,
} from "@/types/seating-export.types";
import {
  DEFAULT_EXPORT_OPTIONS,
  DEFAULT_PRINT_OPTIONS,
} from "@/types/seating-export.types";
import {
  exportSeatingChartToImage,
  exportSeatingChartToPDF,
  exportSeatingChartToSVG,
  generateGuestSeatingListCSV,
  generateTableAssignmentCardsPDF,
  generateShareableLink,
  copyToClipboard,
  downloadBlob,
  transformToGuestSeatingList,
  transformToTableCards,
} from "@/utils/seating-export";
import { openPrintDialog } from "./PrintView";
import { UUID } from "@/types/common.types";

/**
 * Venue metadata for export/print views
 */
interface VenueMetadata {
  hasFloorPlan: boolean;
  specialAreas: Array<{ type: string; label: string }>;
}

interface ExportSeatingProps {
  fabricCanvas: FabricCanvas | null;
  chart: SeatingChartWithTables;
  guests: Guest[];
  seatAssignments: SeatAssignment[];
  eventId: UUID;
  eventName: string;
  eventDate?: string;
  venueName?: string;
  venueMetadata?: VenueMetadata;
}

export default function ExportSeating(props: ExportSeatingProps) {
  const {
    fabricCanvas,
    chart,
    guests,
    seatAssignments,
    eventId,
    eventName,
    eventDate,
    venueName,
    venueMetadata,
  } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>(
    DEFAULT_EXPORT_OPTIONS
  );
  const [printOptions, setPrintOptions] = useState<PrintOptions>(
    DEFAULT_PRINT_OPTIONS
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Show success message briefly
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Show error message
  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(null), 5000);
  };

  // Handle PDF export
  const handleExportPDF = async () => {
    setIsExporting(true);
    setErrorMessage(null);

    try {
      const result = await exportSeatingChartToPDF(
        fabricCanvas,
        chart,
        eventName,
        eventDate,
        venueName,
        exportOptions
      );

      if (result.success && result.blob && result.filename) {
        downloadBlob(result.blob, result.filename);
        showSuccess("PDF exported successfully!");
      } else {
        showError(result.error || "Failed to export PDF");
      }
    } catch (error) {
      showError("An unexpected error occurred while exporting PDF");
      console.error("PDF export error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle image export
  const handleExportImage = async (format: ExportFormat) => {
    setIsExporting(true);
    setErrorMessage(null);

    try {
      let result;
      if (format === "svg") {
        result = await exportSeatingChartToSVG(
          fabricCanvas,
          eventName,
          exportOptions
        );
      } else {
        result = await exportSeatingChartToImage(
          fabricCanvas,
          { ...exportOptions, format },
          eventName
        );
      }

      if (result.success && result.blob && result.filename) {
        downloadBlob(result.blob, result.filename);
        showSuccess(`${format.toUpperCase()} exported successfully!`);
      } else {
        showError(result.error || "Failed to export image");
      }
    } catch (error) {
      showError("An unexpected error occurred while exporting image");
      console.error("Image export error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle print
  const handlePrint = () => {
    try {
      openPrintDialog({
        chart,
        guests,
        seatAssignments,
        eventName,
        eventDate,
        venueName,
        options: printOptions,
        venueMetadata,
      });
      showSuccess("Print dialog opened");
    } catch (error) {
      showError("Failed to open print dialog");
      console.error("Print error:", error);
    }
  };

  // Handle table cards PDF
  const handleExportTableCards = async () => {
    setIsExporting(true);
    setErrorMessage(null);

    try {
      const tableCards = transformToTableCards(chart, guests, seatAssignments);
      const result = await generateTableAssignmentCardsPDF(
        tableCards,
        eventName,
        printOptions.cardsPerPage
      );

      if (result.success && result.blob && result.filename) {
        downloadBlob(result.blob, result.filename);
        showSuccess("Table cards exported successfully!");
      } else {
        showError(result.error || "Failed to export table cards");
      }
    } catch (error) {
      showError("An unexpected error occurred while exporting table cards");
      console.error("Table cards export error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle CSV export
  const handleExportCSV = () => {
    try {
      const guestSeatingList = transformToGuestSeatingList(
        chart,
        guests,
        seatAssignments
      );
      // Map sortBy - CSV only supports 'name' or 'table', default 'status' to 'name'
      const sortBy: "name" | "table" =
        printOptions.sortGuestListBy === "status"
          ? "name"
          : printOptions.sortGuestListBy;
      const result = generateGuestSeatingListCSV(
        guestSeatingList,
        eventName,
        sortBy
      );

      if (result.success && result.blob && result.filename) {
        downloadBlob(result.blob, result.filename);
        showSuccess("Guest seating list exported successfully!");
      } else {
        showError(result.error || "Failed to export CSV");
      }
    } catch (error) {
      showError("An unexpected error occurred while exporting CSV");
      console.error("CSV export error:", error);
    }
  };

  // Handle share link
  const handleGenerateShareLink = async () => {
    try {
      const shareUrl = generateShareableLink(eventId, chart.id);
      const copied = await copyToClipboard(shareUrl);

      if (copied) {
        showSuccess("Share link copied to clipboard!");
      } else {
        showError("Failed to copy share link");
      }
    } catch (error) {
      showError("Failed to generate share link");
      console.error("Share link error:", error);
    }
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="md"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <Download className="w-4 h-4" />
        Export
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-background rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Export Seating Chart</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Success/Error Messages */}
          {successMessage && (
            <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
              <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm text-green-800 dark:text-green-200">
                {successMessage}
              </span>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <X className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span className="text-sm text-red-800 dark:text-red-200">
                {errorMessage}
              </span>
            </div>
          )}

          {/* Export Options */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Export Options</h3>

            {/* Resolution */}
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">
                Resolution
              </label>
              <select
                value={exportOptions.resolution}
                onChange={(e) =>
                  setExportOptions({
                    ...exportOptions,
                    resolution: e.target.value as ResolutionLevel,
                  })
                }
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
              >
                <option value="screen">Screen (72 DPI)</option>
                <option value="web">Web (150 DPI)</option>
                <option value="print">Print (300 DPI)</option>
                <option value="professional">Professional (600 DPI)</option>
              </select>
            </div>

            {/* Inclusion Options */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={exportOptions.includeGuestNames}
                  onChange={(e) =>
                    setExportOptions({
                      ...exportOptions,
                      includeGuestNames: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300"
                />
                Include guest names
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={exportOptions.includeFloorPlan}
                  onChange={(e) =>
                    setExportOptions({
                      ...exportOptions,
                      includeFloorPlan: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300"
                />
                Include floor plan
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={exportOptions.includeSpecialAreas}
                  onChange={(e) =>
                    setExportOptions({
                      ...exportOptions,
                      includeSpecialAreas: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300"
                />
                Include special areas
              </label>
            </div>

            {/* PDF Options */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">
                  Paper Size
                </label>
                <select
                  value={exportOptions.paperSize}
                  onChange={(e) =>
                    setExportOptions({
                      ...exportOptions,
                      paperSize: e.target.value as PaperSize,
                    })
                  }
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                >
                  <option value="letter">Letter (8.5&quot; × 11&quot;)</option>
                  <option value="a4">A4 (8.27&quot; × 11.69&quot;)</option>
                  <option value="tabloid">Tabloid (11&quot; × 17&quot;)</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">
                  Orientation
                </label>
                <select
                  value={exportOptions.orientation}
                  onChange={(e) =>
                    setExportOptions({
                      ...exportOptions,
                      orientation: e.target.value as Orientation,
                    })
                  }
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                >
                  <option value="landscape">Landscape</option>
                  <option value="portrait">Portrait</option>
                </select>
              </div>
            </div>

            {/* Print Options */}
            <div className="pt-4 border-t border-border">
              <h3 className="text-sm font-medium mb-3">Print Options</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">
                    Cards Per Page
                  </label>
                  <select
                    value={printOptions.cardsPerPage}
                    onChange={(e) =>
                      setPrintOptions({
                        ...printOptions,
                        cardsPerPage: parseInt(e.target.value) as 2 | 4 | 6,
                      })
                    }
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                  >
                    <option value="2">2 cards per page</option>
                    <option value="4">4 cards per page</option>
                    <option value="6">6 cards per page</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">
                    Sort Guests By
                  </label>
                  <select
                    value={printOptions.sortGuestListBy}
                    onChange={(e) =>
                      setPrintOptions({
                        ...printOptions,
                        sortGuestListBy: e.target.value as
                          | "name"
                          | "table"
                          | "status",
                      })
                    }
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                  >
                    <option value="table">Table number</option>
                    <option value="name">Guest name</option>
                    <option value="status">RSVP status</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Export Actions */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Export Formats</h3>

            {/* PDF Export */}
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={handleExportPDF}
              disabled={isExporting}
            >
              <FileText className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">Export as PDF</div>
                <div className="text-xs text-muted-foreground">
                  Seating chart with event details
                </div>
              </div>
            </Button>

            {/* Image Exports */}
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={() => handleExportImage("png")}
              disabled={isExporting}
            >
              <Image className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">Export as PNG</div>
                <div className="text-xs text-muted-foreground">
                  High-resolution image
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={() => handleExportImage("jpeg")}
              disabled={isExporting}
            >
              <Image className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">Export as JPEG</div>
                <div className="text-xs text-muted-foreground">
                  Smaller file size
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={() => handleExportImage("svg")}
              disabled={isExporting}
            >
              <Image className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">Export as SVG</div>
                <div className="text-xs text-muted-foreground">
                  Vector format (scalable)
                </div>
              </div>
            </Button>

            {/* Print */}
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={handlePrint}
              disabled={isExporting}
            >
              <Printer className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">Print View</div>
                <div className="text-xs text-muted-foreground">
                  Print-optimized layout with table cards
                </div>
              </div>
            </Button>

            {/* Table Cards PDF */}
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={handleExportTableCards}
              disabled={isExporting}
            >
              <FileText className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">Table Assignment Cards</div>
                <div className="text-xs text-muted-foreground">
                  Printable cards for each table
                </div>
              </div>
            </Button>

            {/* CSV Export */}
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={handleExportCSV}
              disabled={isExporting}
            >
              <FileSpreadsheet className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">Guest Seating List (CSV)</div>
                <div className="text-xs text-muted-foreground">
                  Spreadsheet with all assignments
                </div>
              </div>
            </Button>

            {/* Share Link */}
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={handleGenerateShareLink}
              disabled={isExporting}
            >
              <Share2 className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">Copy Share Link</div>
                <div className="text-xs text-muted-foreground">
                  Share read-only view with others
                </div>
              </div>
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-border">
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
