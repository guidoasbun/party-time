"use client";

/**
 * Phase 9.2: Analytics Wrapper Component
 * Wraps AnalyticsProvider with Suspense for useSearchParams
 */

import { Suspense, ReactNode } from "react";
import { AnalyticsProvider } from "@/contexts/AnalyticsContext";

interface AnalyticsWrapperProps {
  children: ReactNode;
}

export function AnalyticsWrapper({ children }: AnalyticsWrapperProps) {
  return (
    <Suspense fallback={null}>
      <AnalyticsProvider>{children}</AnalyticsProvider>
    </Suspense>
  );
}
