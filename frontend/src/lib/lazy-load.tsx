/**
 * Phase 9.1: Performance Optimization
 * Lazy Loading Utilities
 *
 * Type-safe dynamic import utilities for code splitting heavy components.
 * Uses Next.js dynamic imports with customizable loading fallbacks.
 */
import React from "react";
import dynamic from "next/dynamic";
import type { ComponentType, ReactNode } from "react";

/**
 * Options for lazy loading components
 */
interface LazyLoadOptions {
  /** Custom loading component to show while loading */
  loading?: () => ReactNode;
  /** Whether to disable server-side rendering (default: true for heavy client components) */
  ssr?: boolean;
}

/**
 * Type-safe dynamic import wrapper for lazy loading components.
 *
 * @example
 * ```tsx
 * const LazyChart = lazyLoad(() => import('./Chart'));
 * ```
 */
export function lazyLoad<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options?: LazyLoadOptions
): ComponentType<P> {
  return dynamic(importFn, {
    loading: options?.loading,
    ssr: options?.ssr ?? false,
  });
}

/**
 * Lazy load with a simple skeleton placeholder.
 *
 * @param importFn - Dynamic import function
 * @param skeletonHeight - Height of the skeleton in pixels (default: 400)
 *
 * @example
 * ```tsx
 * const LazyCanvas = lazyLoadWithSkeleton(
 *   () => import('./SeatingCanvas'),
 *   600
 * );
 * ```
 */
export function lazyLoadWithSkeleton<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  skeletonHeight = 400
): ComponentType<P> {
  return dynamic(importFn, {
    loading: () => (
      <div
        className="w-full animate-pulse rounded-lg bg-muted"
        style={{ height: skeletonHeight }}
        role="status"
        aria-label="Loading..."
      >
        <span className="sr-only">Loading...</span>
      </div>
    ),
    ssr: false,
  });
}

/**
 * Lazy load with a card-style skeleton (for modals/dialogs).
 *
 * @example
 * ```tsx
 * const LazyModal = lazyLoadWithCardSkeleton(
 *   () => import('./HeavyModal')
 * );
 * ```
 */
export function lazyLoadWithCardSkeleton<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>
): ComponentType<P> {
  return dynamic(importFn, {
    loading: () => (
      <div
        className="w-full space-y-4 rounded-lg border bg-card p-6"
        role="status"
        aria-label="Loading..."
      >
        <div className="h-6 w-1/3 animate-pulse rounded bg-muted" />
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
          <div className="h-4 w-4/6 animate-pulse rounded bg-muted" />
        </div>
        <div className="flex gap-2 pt-4">
          <div className="h-10 w-24 animate-pulse rounded bg-muted" />
          <div className="h-10 w-24 animate-pulse rounded bg-muted" />
        </div>
        <span className="sr-only">Loading...</span>
      </div>
    ),
    ssr: false,
  });
}

/**
 * Lazy load with a custom loading component.
 *
 * @example
 * ```tsx
 * const LazyEditor = lazyLoadWithCustomLoader(
 *   () => import('./Editor'),
 *   () => <MyCustomSpinner />
 * );
 * ```
 */
export function lazyLoadWithCustomLoader<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  LoadingComponent: () => ReactNode
): ComponentType<P> {
  return dynamic(importFn, {
    loading: LoadingComponent,
    ssr: false,
  });
}

/**
 * Lazy load a named export from a module.
 *
 * @example
 * ```tsx
 * const LazyNamedComponent = lazyLoadNamed(
 *   () => import('./components'),
 *   'MyNamedExport'
 * );
 * ```
 */
export function lazyLoadNamed<P extends object>(
  importFn: () => Promise<Record<string, ComponentType<P>>>,
  exportName: string,
  options?: LazyLoadOptions
): ComponentType<P> {
  return dynamic(
    () => importFn().then((mod) => ({ default: mod[exportName] })),
    {
      loading: options?.loading,
      ssr: options?.ssr ?? false,
    }
  );
}

/**
 * Lazy load with skeleton that matches a specific aspect ratio.
 * Useful for image-heavy components.
 *
 * @example
 * ```tsx
 * const LazyGallery = lazyLoadWithAspectSkeleton(
 *   () => import('./Gallery'),
 *   '16/9'
 * );
 * ```
 */
export function lazyLoadWithAspectSkeleton<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  aspectRatio: string
): ComponentType<P> {
  return dynamic(importFn, {
    loading: () => (
      <div
        className="w-full animate-pulse rounded-lg bg-muted"
        style={{ aspectRatio }}
        role="status"
        aria-label="Loading..."
      >
        <span className="sr-only">Loading...</span>
      </div>
    ),
    ssr: false,
  });
}
