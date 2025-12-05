/**
 * Phase 9.1: Performance Optimization
 * Web Vitals Tracking Utilities
 *
 * Tracks Core Web Vitals metrics for performance monitoring:
 * - LCP (Largest Contentful Paint)
 * - INP (Interaction to Next Paint)
 * - CLS (Cumulative Layout Shift)
 * - FCP (First Contentful Paint)
 * - TTFB (Time to First Byte)
 */
import { onCLS, onINP, onLCP, onFCP, onTTFB, type Metric } from "web-vitals";

/**
 * Web Vitals report structure
 */
interface VitalsReport {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  id: string;
  navigationType: string;
  url: string;
  timestamp: number;
}

/**
 * Analytics endpoint for vitals (optional)
 * Set this environment variable to send vitals to your analytics service
 */
const VITALS_ENDPOINT = process.env.NEXT_PUBLIC_VITALS_ENDPOINT;

/**
 * Send metrics to analytics service
 */
function sendToAnalytics(metric: Metric): void {
  const report: VitalsReport = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
    url: typeof window !== "undefined" ? window.location.href : "",
    timestamp: Date.now(),
  };

  // Log in development
  if (process.env.NODE_ENV === "development") {
    const color = getMetricColor(metric.rating);
    console.log(
      `%c[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`,
      `color: ${color}; font-weight: bold;`
    );
  }

  // Send to analytics in production
  if (
    process.env.NODE_ENV === "production" &&
    VITALS_ENDPOINT &&
    typeof navigator !== "undefined" &&
    navigator.sendBeacon
  ) {
    const body = JSON.stringify(report);
    navigator.sendBeacon(VITALS_ENDPOINT, body);
  }
}

/**
 * Get color for console logging based on metric rating
 */
function getMetricColor(rating: "good" | "needs-improvement" | "poor"): string {
  switch (rating) {
    case "good":
      return "#0cce6b"; // Green
    case "needs-improvement":
      return "#ffa400"; // Orange
    case "poor":
      return "#ff4e42"; // Red
    default:
      return "#666";
  }
}

/**
 * Initialize Web Vitals tracking
 *
 * Call this function once in your app (typically in a client component
 * that wraps your layout or in useEffect).
 *
 * @example
 * ```tsx
 * 'use client';
 * import { useEffect } from 'react';
 * import { initWebVitals } from '@/lib/web-vitals';
 *
 * export function WebVitalsReporter() {
 *   useEffect(() => {
 *     initWebVitals();
 *   }, []);
 *   return null;
 * }
 * ```
 */
export function initWebVitals(): void {
  // Only run in browser
  if (typeof window === "undefined") return;

  // Core Web Vitals
  onCLS(sendToAnalytics);
  onINP(sendToAnalytics);
  onLCP(sendToAnalytics);

  // Additional metrics
  onFCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
}

/**
 * Get Web Vitals thresholds for reference
 */
export const VITALS_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 }, // milliseconds
  INP: { good: 200, poor: 500 }, // milliseconds
  CLS: { good: 0.1, poor: 0.25 }, // score
  FCP: { good: 1800, poor: 3000 }, // milliseconds
  TTFB: { good: 800, poor: 1800 }, // milliseconds
} as const;

/**
 * Check if a metric value is within the "good" threshold
 */
export function isGoodMetric(
  name: keyof typeof VITALS_THRESHOLDS,
  value: number
): boolean {
  return value <= VITALS_THRESHOLDS[name].good;
}

/**
 * Get rating for a metric value
 */
export function getMetricRating(
  name: keyof typeof VITALS_THRESHOLDS,
  value: number
): "good" | "needs-improvement" | "poor" {
  const thresholds = VITALS_THRESHOLDS[name];
  if (value <= thresholds.good) return "good";
  if (value <= thresholds.poor) return "needs-improvement";
  return "poor";
}
