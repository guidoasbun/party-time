'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: React.ReactNode
  className?: string
}

interface DashboardSectionProps {
  children: React.ReactNode
  className?: string
  title?: string
  description?: string
  fullWidth?: boolean
}

interface DashboardGridProps {
  children: React.ReactNode
  className?: string
  columns?: 1 | 2 | 3 | 4
}

// Main Dashboard Layout Container
export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  return (
    <div className={cn(
      "min-h-screen bg-background transition-colors duration-200",
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {children}
        </div>
      </div>
    </div>
  )
}

// Dashboard Section Container
export function DashboardSection({
  children,
  className,
  title,
  description,
  fullWidth = false
}: DashboardSectionProps) {
  return (
    <section className={cn(
      "bg-card rounded-lg shadow-sm border border-border transition-colors duration-200",
      fullWidth ? "col-span-full" : "",
      className
    )}>
      {(title || description) && (
        <div className="px-6 py-4 border-b border-border">
          {title && (
            <h2 className="text-lg font-semibold text-card-foreground">
              {title}
            </h2>
          )}
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      )}
      <div className={cn(
        title || description ? "p-6" : "p-6"
      )}>
        {children}
      </div>
    </section>
  )
}

// Responsive Grid Container
export function DashboardGrid({
  children,
  className,
  columns = 1
}: DashboardGridProps) {
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 lg:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
  }

  return (
    <div className={cn(
      "grid gap-6",
      gridClasses[columns],
      className
    )}>
      {children}
    </div>
  )
}

// Quick Stats Container (for stats cards)
export function DashboardStatsSection({ children, className }: DashboardLayoutProps) {
  return (
    <section className={cn("space-y-4", className)}>
      <div className="bg-card rounded-lg shadow-sm border border-border p-6 transition-colors duration-200">
        {children}
      </div>
    </section>
  )
}

// Main Content Area (for filters and events)
export function DashboardMainContent({ children, className }: DashboardLayoutProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {children}
    </div>
  )
}

// Collapsible Filter Section
export function DashboardFiltersSection({
  children,
  className,
  isCollapsed = false,
  onToggle
}: {
  children: React.ReactNode
  className?: string
  isCollapsed?: boolean
  onToggle?: () => void
}) {
  return (
    <section className={cn(
      "bg-card rounded-lg shadow-sm border border-border transition-all duration-200",
      isCollapsed ? "pb-0" : "",
      className
    )}>
      <div className="px-6 py-4 border-b border-border">
        <button
          onClick={onToggle}
          className="flex items-center justify-between w-full text-left"
        >
          <div>
            <h3 className="text-lg font-semibold text-card-foreground">
              Filters
            </h3>
            <p className="text-sm text-muted-foreground">
              Search and filter your events
            </p>
          </div>
          <div className={cn(
            "transform transition-transform duration-200",
            isCollapsed ? "rotate-180" : ""
          )}>
            <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
      </div>

      <div className={cn(
        "overflow-hidden transition-all duration-200",
        isCollapsed ? "max-h-0" : "max-h-none"
      )}>
        <div className="p-6">
          {children}
        </div>
      </div>
    </section>
  )
}