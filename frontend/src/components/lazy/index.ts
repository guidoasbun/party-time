/**
 * Phase 9.1: Performance Optimization
 * Lazy Component Index
 *
 * Centralized exports for lazy-loaded heavy components.
 * These components use dynamic imports with code splitting.
 *
 * NOTE: Due to TypeScript complexity with dynamic imports of named exports,
 * we use direct dynamic() calls in the consuming components instead of
 * exporting pre-configured lazy components here.
 *
 * This file serves as documentation of components that benefit from lazy loading.
 */

/**
 * Components that should be lazy loaded:
 *
 * SEATING (fabric.js - heavy canvas library):
 * - SeatingCanvas (~1,508 lines) - Main canvas component
 * - SeatingEditorLayout (~792 lines) - Container for seating editor
 * - AutoAssignDialog (~781 lines) - Auto-assignment algorithm UI
 * - ExportSeating - Uses jspdf + html2canvas
 * - TableTemplates - Template selection UI
 *
 * VENUES (Google Maps - heavy external SDK):
 * - VenueTab (~824 lines) - Main venue management tab
 * - VenueSearchWithMap - Combined search + map view
 * - VenueCompareModal - Side-by-side venue comparison
 * - VenueSearchModal - Full venue search modal
 * - VenueMap - Google Maps component
 *
 * GUESTS (CSV processing, exports):
 * - CSVImportWizard (~595 lines) - Multi-step CSV import
 * - ExportGuests - Guest list export
 * - GuestDetailsDrawer - Detailed guest view drawer
 *
 * BUDGET:
 * - BudgetTab - Budget management tab
 *
 * Usage example in consuming components:
 *
 * ```typescript
 * import dynamic from "next/dynamic";
 *
 * const SeatingEditorLayout = dynamic(
 *   () => import("@/components/seating/SeatingEditorLayout")
 *        .then((mod) => mod.SeatingEditorLayout),
 *   { loading: () => <Skeleton />, ssr: false }
 * );
 * ```
 */

// Re-export the lazy loading utilities for convenience
export {
  lazyLoad,
  lazyLoadWithSkeleton,
  lazyLoadWithCardSkeleton,
  lazyLoadWithCustomLoader,
  lazyLoadWithAspectSkeleton,
} from "@/lib/lazy-load";
