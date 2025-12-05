/**
 * Phase 9.1: Performance Optimization
 * WebVitalsReporter Component
 *
 * Client component that initializes Web Vitals tracking.
 * Add this to your root layout to track performance metrics.
 */
"use client";

import { useEffect } from "react";
import { initWebVitals } from "@/lib/web-vitals";

/**
 * WebVitalsReporter - Initializes Web Vitals tracking on mount
 *
 * This component should be placed in your root layout to ensure
 * metrics are tracked across all pages.
 *
 * @example
 * ```tsx
 * // In app/layout.tsx
 * import { WebVitalsReporter } from '@/components/analytics/WebVitalsReporter';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <WebVitalsReporter />
 *         {children}
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function WebVitalsReporter() {
  useEffect(() => {
    initWebVitals();
  }, []);

  // This component renders nothing
  return null;
}

export default WebVitalsReporter;
