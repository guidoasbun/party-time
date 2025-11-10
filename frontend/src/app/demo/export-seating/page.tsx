/**
 * FR-21: The system shall provide an interactive seating chart interface.
 * Phase 6.2.3: Export and Sharing Features
 *
 * Demonstrates all export and sharing capabilities:
 * - PDF export with guest names
 * - High-resolution image export
 * - Print view
 * - Table assignment cards
 * - CSV guest seating list
 * - Shareable links
 */

import { Metadata } from "next";
import ClientOnlyDemo from "./ClientOnlyDemo";

export const metadata: Metadata = {
  title: "Export Seating Chart Demo | Party-Time",
  description: "Demonstration of seating chart export and sharing features",
};

export default function ExportSeatingDemoPage() {
  return <ClientOnlyDemo />;
}
