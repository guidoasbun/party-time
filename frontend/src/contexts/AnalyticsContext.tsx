"use client";

/**
 * Phase 9.2: Analytics Context Provider
 * Provides analytics tracking throughout the application
 * Automatically tracks page views on route changes
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  initAnalytics,
  cleanupAnalytics,
  trackPageView,
  trackEvent,
  trackError,
  analytics,
  AnalyticsCategory,
  AnalyticsEvent,
} from "@/lib/analytics";
import type { AnalyticsCategoryType, AnalyticsEventType } from "@/lib/analytics";

interface AnalyticsContextType {
  trackEvent: (
    event: AnalyticsEventType | string,
    category?: AnalyticsCategoryType,
    properties?: Record<string, string | number | boolean | null | undefined>
  ) => void;
  trackPageView: (
    path: string,
    title?: string,
    additionalProps?: Record<string, string | number | boolean | null | undefined>
  ) => void;
  trackError: (
    error: Error | string,
    context?: Record<string, string | number | boolean | null | undefined>
  ) => void;
  analytics: typeof analytics;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(
  undefined
);

interface AnalyticsProviderProps {
  children: ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize analytics on mount
  useEffect(() => {
    initAnalytics({
      debug: process.env.NODE_ENV === "development",
    });

    return () => {
      cleanupAnalytics();
    };
  }, []);

  // Track page views on route changes
  useEffect(() => {
    if (pathname) {
      // Build full path with search params
      const search = searchParams?.toString();
      const fullPath = search ? `${pathname}?${search}` : pathname;

      trackPageView(fullPath);
    }
  }, [pathname, searchParams]);

  // Memoized tracking functions
  const handleTrackEvent = useCallback(
    (
      event: AnalyticsEventType | string,
      category: AnalyticsCategoryType = AnalyticsCategory.USER_ACTION,
      properties?: Record<string, string | number | boolean | null | undefined>
    ) => {
      trackEvent(event, category, properties);
    },
    []
  );

  const handleTrackPageView = useCallback(
    (
      path: string,
      title?: string,
      additionalProps?: Record<string, string | number | boolean | null | undefined>
    ) => {
      trackPageView(path, title, additionalProps);
    },
    []
  );

  const handleTrackError = useCallback(
    (
      error: Error | string,
      context?: Record<string, string | number | boolean | null | undefined>
    ) => {
      trackError(error, context);
    },
    []
  );

  const value: AnalyticsContextType = {
    trackEvent: handleTrackEvent,
    trackPageView: handleTrackPageView,
    trackError: handleTrackError,
    analytics,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

/**
 * Hook to access analytics functions
 */
export function useAnalytics(): AnalyticsContextType {
  const context = useContext(AnalyticsContext);

  if (context === undefined) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider");
  }

  return context;
}

/**
 * HOC to wrap components with analytics tracking
 */
export function withAnalytics<P extends object>(
  Component: React.ComponentType<P & { analytics: AnalyticsContextType }>
) {
  const WrappedComponent = (props: P) => {
    const analyticsContext = useAnalytics();

    return <Component {...props} analytics={analyticsContext} />;
  };

  WrappedComponent.displayName = `withAnalytics(${Component.displayName || Component.name})`;

  return WrappedComponent;
}
