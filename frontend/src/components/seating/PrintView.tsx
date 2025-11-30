/**
 * FR-21: The system shall provide an interactive seating chart interface.
 * Phase 6.2.3: Export and Sharing Features
 *
 * Provides print-optimized layouts for:
 * - Seating chart visualization
 * - Table assignment cards
 * - Guest seating list
 */

"use client";

import type { SeatingChartWithTables } from "@/types/seating.types";
import type { Guest } from "@/types/guest.types";
import type { SeatAssignment } from "@/types/seating.types";
import type { PrintOptions } from "@/types/seating-export.types";
import {
  transformToGuestSeatingList,
  transformToTableCards,
} from "@/utils/seating-export";

/**
 * Venue metadata for print view
 */
interface VenueMetadata {
  hasFloorPlan: boolean;
  specialAreas: Array<{ type: string; label: string }>;
}

interface PrintViewProps {
  chart: SeatingChartWithTables;
  guests: Guest[];
  seatAssignments: SeatAssignment[];
  eventName: string;
  eventDate?: string;
  venueName?: string;
  options: PrintOptions;
  venueMetadata?: VenueMetadata;
}

/**
 * Generate HTML content for printing
 */
export function generatePrintHTML(props: PrintViewProps): string {
  const {
    chart,
    guests,
    seatAssignments,
    eventName,
    eventDate,
    venueName,
    options,
    venueMetadata,
  } = props;

  const guestSeatingList = transformToGuestSeatingList(
    chart,
    guests,
    seatAssignments
  );
  const tableCards = transformToTableCards(chart, guests, seatAssignments);

  // Sort guest list based on options
  const sortedGuestList = [...guestSeatingList].sort((a, b) => {
    if (options.sortGuestListBy === "name") {
      return a.guest_name.localeCompare(b.guest_name);
    } else if (options.sortGuestListBy === "table") {
      const tableCompare = a.table_number.localeCompare(
        b.table_number,
        undefined,
        {
          numeric: true,
        }
      );
      if (tableCompare !== 0) return tableCompare;
      return a.seat_number - b.seat_number;
    } else {
      // Sort by status: attending, maybe, not_attending, pending
      const statusOrder = {
        attending: 0,
        maybe: 1,
        not_attending: 2,
        pending: 3,
      };
      const statusA =
        statusOrder[a.rsvp_status as keyof typeof statusOrder] ?? 4;
      const statusB =
        statusOrder[b.rsvp_status as keyof typeof statusOrder] ?? 4;
      return statusA - statusB;
    }
  });

  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${eventName} - Seating Chart</title>
        <style>
          @media print {
            * {
              box-sizing: border-box;
            }

            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #000;
              background: #fff;
              margin: 0;
            }

            .no-print {
              display: none !important;
            }

            .page-break {
              page-break-after: always;
            }

            /* Header Styles */
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #2563eb;
              padding-bottom: 15px;
            }

            .header h1 {
              font-size: 28px;
              margin: 0 0 10px 0;
              color: #1e40af;
            }

            .header .meta {
              font-size: 14px;
              color: #666;
              margin: 5px 0;
            }

            .header .stats {
              font-size: 12px;
              color: #999;
              margin-top: 10px;
            }

            /* Venue Section Styles */
            .venue-section {
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 6px;
              padding: 12px 16px;
              margin-bottom: 30px;
              font-size: 12px;
            }

            .venue-section .venue-title {
              font-weight: bold;
              color: #1e40af;
              margin-bottom: 8px;
              font-size: 14px;
            }

            .venue-section .venue-item {
              color: #475569;
              margin: 4px 0;
            }

            .venue-section .venue-label {
              font-weight: 500;
              color: #1e293b;
            }

            /* Section Styles */
            .section {
              margin-bottom: 40px;
            }

            .section-title {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 15px;
              padding-bottom: 5px;
              border-bottom: 2px solid #e5e7eb;
            }

            /* Table Cards Grid */
            .cards-grid {
              display: grid;
              grid-template-columns: repeat(${
                options.cardsPerPage === 2 ? "1" : "2"
              }, 1fr);
              gap: 20px;
              margin-bottom: 20px;
            }

            .table-card {
              border: 2px solid #000;
              padding: 15px;
              page-break-inside: avoid;
              background: #fff;
            }

            .table-card-header {
              text-align: center;
              margin-bottom: 10px;
              padding-bottom: 10px;
              border-bottom: 1px solid #d1d5db;
            }

            .table-card-header .table-number {
              font-size: 32px;
              font-weight: bold;
              color: #1e40af;
              margin: 0;
            }

            .table-card-header .table-info {
              font-size: 11px;
              color: #666;
              margin: 5px 0 0 0;
            }

            .table-card-guests {
              margin-top: 10px;
            }

            .table-card-guest {
              padding: 4px 0;
              font-size: 11px;
              line-height: 1.4;
            }

            .table-card-guest strong {
              color: #000;
            }

            .table-card-guest .dietary {
              color: #666;
              font-size: 10px;
              margin-left: 15px;
              display: block;
            }

            .table-card-empty {
              text-align: center;
              color: #999;
              font-style: italic;
              padding: 10px 0;
            }

            /* Guest List Table */
            .guest-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
              page-break-inside: auto;
            }

            .guest-table thead {
              background-color: #f3f4f6;
            }

            .guest-table th {
              border: 1px solid #d1d5db;
              padding: 8px;
              text-align: left;
              font-weight: bold;
              font-size: 11px;
            }

            .guest-table td {
              border: 1px solid #e5e7eb;
              padding: 6px 8px;
              font-size: 10px;
            }

            .guest-table tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }

            .status-attending { color: #10b981; font-weight: bold; }
            .status-not_attending { color: #ef4444; font-weight: bold; }
            .status-maybe { color: #f59e0b; font-weight: bold; }
            .status-pending { color: #6b7280; }

            /* Footer */
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              font-size: 10px;
              color: #999;
            }
          }
        </style>
      </head>
      <body>
        <!-- Header -->
        <div class="header">
          <h1>${eventName}</h1>
          ${eventDate ? `<div class="meta">Date: ${eventDate}</div>` : ""}
          ${venueName ? `<div class="meta">Venue: ${venueName}</div>` : ""}
          <div class="stats">
            Total Tables: ${chart.total_tables} •
            Total Capacity: ${chart.total_capacity} •
            Guests Seated: ${guestSeatingList.length}
          </div>
        </div>

        ${
          venueMetadata &&
          (venueMetadata.hasFloorPlan || venueMetadata.specialAreas.length > 0)
            ? `
        <!-- Venue Layout Section -->
        <div class="venue-section">
          <div class="venue-title">Venue Layout</div>
          ${
            venueMetadata.hasFloorPlan
              ? '<div class="venue-item"><span class="venue-label">Floor Plan:</span> Configured</div>'
              : ""
          }
          ${
            venueMetadata.specialAreas.length > 0
              ? `<div class="venue-item"><span class="venue-label">Special Areas:</span> ${venueMetadata.specialAreas.map((a) => a.label || a.type).join(", ")}</div>`
              : ""
          }
        </div>
        `
            : ""
        }

        ${
          options.includeTableCards
            ? `
        <!-- Table Assignment Cards -->
        ${generateTableCardsHTML(tableCards, options.cardsPerPage)}
        ${
          options.pageBreaks && options.includeGuestList
            ? '<div class="page-break"></div>'
            : ""
        }
        `
            : ""
        }

        ${
          options.includeGuestList
            ? `
        <!-- Guest Seating List -->
        <div class="section">
          <div class="section-title">Guest Seating List</div>
          <table class="guest-table">
            <thead>
              <tr>
                <th>Table</th>
                <th>Seat</th>
                <th>Guest Name</th>
                <th>RSVP Status</th>
                <th>Dietary Restrictions</th>
              </tr>
            </thead>
            <tbody>
              ${sortedGuestList
                .map(
                  (guest) => `
                <tr>
                  <td>${guest.table_number}</td>
                  <td>${guest.seat_number}</td>
                  <td>${guest.guest_name}</td>
                  <td class="status-${
                    guest.rsvp_status
                  }">${guest.rsvp_status.replace("_", " ")}</td>
                  <td>${guest.dietary_restrictions || "-"}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
        `
            : ""
        }

        <!-- Footer -->
        <div class="footer">
          Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()} •
          Seating Chart: ${chart.name}
        </div>
      </body>
    </html>
  `;

  return printContent;
}

/**
 * Generate HTML for table cards
 */
function generateTableCardsHTML(
  tableCards: ReturnType<typeof transformToTableCards>,
  cardsPerPage: 2 | 4 | 6
): string {
  let html =
    '<div class="section"><div class="section-title">Table Assignment Cards</div>';

  // Group cards into pages
  for (let i = 0; i < tableCards.length; i += cardsPerPage) {
    const pageCards = tableCards.slice(i, i + cardsPerPage);

    html += '<div class="cards-grid">';

    for (const card of pageCards) {
      html += `
        <div class="table-card">
          <div class="table-card-header">
            <h2 class="table-number">Table ${card.table_number}</h2>
            <p class="table-info">
              ${card.table_type} • Capacity: ${card.capacity} •
              Seated: ${card.guests.length}
            </p>
          </div>
          <div class="table-card-guests">
            ${
              card.guests.length === 0
                ? '<div class="table-card-empty">No guests assigned</div>'
                : card.guests
                    .map(
                      (guest) => `
                  <div class="table-card-guest">
                    <strong>${guest.seat_number}. ${guest.name}</strong>
                    ${
                      guest.dietary_restrictions
                        ? `<span class="dietary">${guest.dietary_restrictions}</span>`
                        : ""
                    }
                  </div>
                `
                    )
                    .join("")
            }
          </div>
        </div>
      `;
    }

    html += "</div>"; // Close cards-grid

    // Add page break if not last page
    if (i + cardsPerPage < tableCards.length) {
      html += '<div class="page-break"></div>';
    }
  }

  html += "</div>"; // Close section

  return html;
}

/**
 * Open print dialog with formatted content
 */
export function openPrintDialog(props: PrintViewProps): void {
  const printContent = generatePrintHTML(props);

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      // Don't auto-close - let user close after printing
    }, 250);
  }
}

/**
 * PrintView component (for preview, optional)
 */
export default function PrintView(props: PrintViewProps) {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: generatePrintHTML(props),
      }}
    />
  );
}
