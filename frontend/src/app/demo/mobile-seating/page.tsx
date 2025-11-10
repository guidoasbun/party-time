/*
 * FR-21: The system shall provide an interactive seating chart interface.
 * Phase 6.2.4: Mobile & Tablet Views
 */

import type { Metadata } from "next";
import ClientOnlyDemo from "./ClientOnlyDemo";

export const metadata: Metadata = {
  title: "Mobile Seating View Demo - Party-Time",
  description:
    "Phase 6.2.4: Mobile & Tablet responsive seating chart views with touch gestures",
};

export default function MobileSeatingDemoPage() {
  return <ClientOnlyDemo />;
}
