/**
 * FR-21: The system shall provide an interactive seating chart interface.
 * Phase 6.2.3: Export and Sharing Features
 */

import { UUID } from "./common.types";

/**
 * Export format options
 */
export type ExportFormat = "pdf" | "png" | "jpeg" | "svg";

/**
 * Resolution level for image exports
 * - screen: 72 DPI (web viewing)
 * - web: 150 DPI (web high-quality)
 * - print: 300 DPI (standard printing)
 * - professional: 600 DPI (professional printing)
 */
export type ResolutionLevel = "screen" | "web" | "print" | "professional";

/**
 * Paper size options for PDF export
 */
export type PaperSize = "letter" | "a4" | "tabloid";

/**
 * Page orientation for PDF export
 */
export type Orientation = "portrait" | "landscape";

/**
 * DPI mapping for resolution levels
 */
export const RESOLUTION_DPI: Record<ResolutionLevel, number> = {
  screen: 72,
  web: 150,
  print: 300,
  professional: 600,
};

/**
 * Paper size dimensions in inches
 */
export const PAPER_DIMENSIONS: Record<
  PaperSize,
  { width: number; height: number }
> = {
  letter: { width: 8.5, height: 11 },
  a4: { width: 8.27, height: 11.69 },
  tabloid: { width: 11, height: 17 },
};

/**
 * Export options for seating chart
 */
export interface ExportOptions {
  format: ExportFormat;
  resolution: ResolutionLevel;
  includeGuestNames: boolean;
  includeFloorPlan: boolean;
  includeSpecialAreas: boolean;
  paperSize?: PaperSize;
  orientation?: Orientation;
  backgroundColor?: string;
}

/**
 * Print options for seating chart
 */
export interface PrintOptions {
  includeSeatingChart: boolean;
  includeTableCards: boolean;
  includeGuestList: boolean;
  cardsPerPage: 2 | 4 | 6;
  sortGuestListBy: "name" | "table" | "status";
  pageBreaks: boolean;
}

/**
 * Share link options
 */
export interface ShareLinkOptions {
  expiresInDays?: number;
  allowDownload?: boolean;
  password?: string;
}

/**
 * Share token response
 */
export interface ShareTokenResponse {
  share_token: string;
  share_url: string;
  expires_at: string;
  created_at: string;
}

/**
 * Guest seating entry for exports
 */
export interface GuestSeatingEntry {
  guest_id: UUID;
  guest_name: string;
  table_number: string;
  seat_number: number;
  email?: string;
  dietary_restrictions?: string;
  meal_preference?: string;
  rsvp_status: string;
}

/**
 * Table assignment card data
 */
export interface TableCard {
  table_id: UUID;
  table_number: string;
  table_type: string;
  capacity: number;
  guests: Array<{
    name: string;
    seat_number: number;
    dietary_restrictions?: string;
  }>;
}

/**
 * Export result
 */
export interface ExportResult {
  success: boolean;
  filename?: string;
  blob?: Blob;
  url?: string;
  error?: string;
}

/**
 * Default export options
 */
export const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  format: "pdf",
  resolution: "print",
  includeGuestNames: true,
  includeFloorPlan: true,
  includeSpecialAreas: true,
  paperSize: "letter",
  orientation: "landscape",
  backgroundColor: "#ffffff",
};

/**
 * Default print options
 */
export const DEFAULT_PRINT_OPTIONS: PrintOptions = {
  includeSeatingChart: true,
  includeTableCards: true,
  includeGuestList: true,
  cardsPerPage: 4,
  sortGuestListBy: "table",
  pageBreaks: true,
};
