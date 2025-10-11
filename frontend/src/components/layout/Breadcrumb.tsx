'use client'

/**
 * Breadcrumb navigation component
 */

import React from 'react'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { useBreadcrumbs } from '@/contexts/NavigationContext'
import { cn } from '@/lib/utils'

interface BreadcrumbProps {
  className?: string
  showHomeIcon?: boolean
  maxItems?: number
  separator?: React.ReactNode
}

export function Breadcrumb({
  className,
  showHomeIcon = true,
  maxItems = 5,
  separator
}: BreadcrumbProps) {
  const breadcrumbs = useBreadcrumbs()

  // Don't show breadcrumbs if there's only one item or none
  if (breadcrumbs.length <= 1) {
    return null
  }

  // Truncate breadcrumbs if they exceed maxItems
  const displayBreadcrumbs = breadcrumbs.length > maxItems
    ? [
        breadcrumbs[0],
        { label: '...', href: undefined, isActive: false },
        ...breadcrumbs.slice(-2)
      ]
    : breadcrumbs

  const defaultSeparator = separator || <ChevronRight className="h-4 w-4 text-muted-foreground" />

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex items-center space-x-1 text-sm text-muted-foreground",
        className
      )}
    >
      <ol className="flex items-center space-x-1">
        {displayBreadcrumbs.map((item, index) => {
          const isLast = index === displayBreadcrumbs.length - 1
          const isEllipsis = item.label === '...'

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <span className="mx-2 flex-shrink-0" aria-hidden="true">
                  {defaultSeparator}
                </span>
              )}

              {isEllipsis ? (
                <span className="text-muted-foreground px-1">...</span>
              ) : item.href && !isLast ? (
                <Link
                  href={item.href}
                  className={cn(
                    "hover:text-foreground transition-colors duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm px-1",
                    index === 0 && showHomeIcon && "flex items-center space-x-1"
                  )}
                >
                  {index === 0 && showHomeIcon && (
                    <Home className="h-4 w-4" />
                  )}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span
                  className={cn(
                    "px-1",
                    isLast && "text-foreground font-medium",
                    index === 0 && showHomeIcon && "flex items-center space-x-1"
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {index === 0 && showHomeIcon && (
                    <Home className="h-4 w-4" />
                  )}
                  <span>{item.label}</span>
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

interface BreadcrumbItemProps {
  children: React.ReactNode
  href?: string
  isActive?: boolean
  className?: string
}

export function BreadcrumbItem({
  children,
  href,
  isActive = false,
  className
}: BreadcrumbItemProps) {
  const baseClasses = cn(
    "transition-colors duration-200",
    isActive
      ? "text-foreground font-medium"
      : "text-muted-foreground hover:text-foreground",
    className
  )

  if (href && !isActive) {
    return (
      <Link
        href={href}
        className={cn(
          baseClasses,
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm px-1"
        )}
      >
        {children}
      </Link>
    )
  }

  return (
    <span
      className={cn(baseClasses, "px-1")}
      aria-current={isActive ? "page" : undefined}
    >
      {children}
    </span>
  )
}

interface BreadcrumbSeparatorProps {
  children?: React.ReactNode
  className?: string
}

export function BreadcrumbSeparator({
  children,
  className
}: BreadcrumbSeparatorProps) {
  return (
    <span
      className={cn("mx-2 flex-shrink-0 text-muted-foreground", className)}
      aria-hidden="true"
    >
      {children || <ChevronRight className="h-4 w-4" />}
    </span>
  )
}

/**
 * Compact breadcrumb for mobile or limited space
 */
interface CompactBreadcrumbProps {
  className?: string
}

export function CompactBreadcrumb({ className }: CompactBreadcrumbProps) {
  const breadcrumbs = useBreadcrumbs()

  if (breadcrumbs.length <= 1) {
    return null
  }

  const currentPage = breadcrumbs[breadcrumbs.length - 1]
  const parentPage = breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 2] : null

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center text-sm", className)}
    >
      {parentPage?.href && (
        <>
          <Link
            href={parentPage.href}
            className="text-muted-foreground hover:text-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm px-1"
          >
            {parentPage.label}
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground mx-2" />
        </>
      )}
      <span className="text-foreground font-medium px-1" aria-current="page">
        {currentPage.label}
      </span>
    </nav>
  )
}