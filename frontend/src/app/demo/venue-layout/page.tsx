/**
 * Venue Layout Demo Page
 * FR-21: The system shall provide an interactive seating chart interface.
 * Phase 6.2.2: Venue Layout Integration
 *
 * Demonstrates floor plan upload, special areas, and venue layout management
 */

"use client";

import dynamic from "next/dynamic";

// Dynamically import the client component to avoid SSR and context issues
const ClientOnlyDemo = dynamic(() => import("./ClientOnlyDemo"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-muted-foreground">Loading venue layout...</div>
    </div>
  ),
});

export default function VenueLayoutDemoPage() {
  return <ClientOnlyDemo />;
}
