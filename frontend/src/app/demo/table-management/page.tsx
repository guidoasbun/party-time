/**
 * Table Management Demo Page
 *
 * Demonstrates the complete table management interface
 * FR-21: Interactive seating chart interface
 * Phase 6.1.4: Table Management Interface
 */

'use client';

import dynamic from 'next/dynamic';

// Dynamically import the client component to avoid SSR
const TableManagementDemo = dynamic(() => import('./TableManagementDemo').then(mod => ({ default: mod.TableManagementDemo })), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-muted-foreground">Loading table management...</div>
    </div>
  ),
});

export default function TableManagementPage() {
  return <TableManagementDemo />;
}
