"use client";

/**
 *
 * FR-21: The system shall provide an interactive seating chart interface.
 * Phase 6 - 6.1.3 Fabric.JS Canvas Setup
 *
 * Demo pages layout
 * Ensures all demo pages are client-side only
 */

export const dynamic = "force-dynamic";

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
