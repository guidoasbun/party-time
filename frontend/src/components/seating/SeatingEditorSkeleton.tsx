"use client";

/**
 * SeatingEditorSkeleton Component
 *
 * FR-21: The system shall provide an interactive seating chart interface.
 * Phase 6.3.12: Polish & Performance
 * Loading skeleton for the seating chart editor page
 */

import React from "react";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";

/**
 * Skeleton loading state for the seating chart editor
 * Mimics the three-column layout of SeatingEditorLayout
 */
export function SeatingEditorSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header Skeleton */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="space-y-4">
            {/* Breadcrumb skeleton */}
            <Skeleton className="h-4 w-48" />

            {/* Title and Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Back button skeleton */}
                <Skeleton className="h-9 w-36" />
                <div className="space-y-2">
                  {/* Title */}
                  <Skeleton className="h-7 w-48" />
                  {/* Subtitle */}
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Save indicator skeleton */}
                <Skeleton className="h-8 w-24" />
                {/* Help button skeleton */}
                <Skeleton className="h-9 w-20" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Editor Skeleton - Three Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Guest List */}
        <div className="w-80 border-r bg-card p-4 hidden md:block">
          <div className="space-y-4">
            {/* Sidebar header */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-16" />
            </div>
            {/* Search bar */}
            <Skeleton className="h-10 w-full" />
            {/* Filter button */}
            <Skeleton className="h-8 w-full" />
            {/* Guest list items */}
            <div className="space-y-3 mt-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <Skeleton variant="circular" className="h-10 w-10" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton variant="circular" className="h-6 w-6" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="border-b bg-card p-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-28" />
                <Skeleton className="h-9 w-28" />
                <Skeleton className="h-9 w-9" />
                <Skeleton className="h-9 w-9" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
              </div>
            </div>
          </div>

          {/* Canvas area */}
          <div className="flex-1 p-4">
            <Skeleton className="w-full h-full min-h-[500px] rounded-lg" />
          </div>

          {/* Statistics bar */}
          <div className="border-t bg-card p-2">
            <div className="flex items-center justify-center gap-8">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-80 border-l bg-card p-4 hidden lg:block">
          <div className="space-y-4">
            {/* Tab buttons */}
            <div className="flex gap-2">
              <Skeleton className="h-9 flex-1" />
              <Skeleton className="h-9 flex-1" />
              <Skeleton className="h-9 flex-1" />
            </div>

            {/* Properties content */}
            <div className="space-y-4 pt-4">
              <SkeletonText lines={2} width={["100%", "80%"]} />
              <Skeleton className="h-10 w-full" />
              <SkeletonText lines={2} width={["100%", "60%"]} />
              <Skeleton className="h-10 w-full" />
              <SkeletonText lines={1} />
              <div className="flex gap-2">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 flex-1" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SeatingEditorSkeleton;
