'use client'

/**
 * Navigation Demo Page
 *
 * Demonstrates all navigation features including:
 * - Sidebar navigation with active states
 * - Breadcrumb navigation
 * - Mobile responsive behavior
 * - Navigation context and state management
 */

import React, { Suspense } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Eye,
  EyeOff,
} from 'lucide-react'
import { NavigationProvider, useNavigation, useSidebar } from '@/contexts/NavigationContext'
import { Navigation, MobileNavToggle, SidebarToggle } from '@/components/layout/Navigation'
import { Breadcrumb, CompactBreadcrumb } from '@/components/layout/Breadcrumb'
import { cn } from '@/lib/utils'

function NavigationDemo() {
  const pathname = usePathname()
  const {
    activeItem,
    breadcrumbs,
    isItemActive,
    getFilteredNavigation,
  } = useNavigation()

  const {
    collapsed,
    toggle,
    mobileOpen,
  } = useSidebar()

  const navigation = getFilteredNavigation()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navigation showBrand={true} />

      {/* Main Content */}
      <div
        className={cn(
          "transition-all duration-300",
          "lg:pl-64",
          collapsed && "lg:pl-16"
        )}
      >
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto">
            {/* Top Bar */}
            <div className="flex items-center justify-between h-16 px-6">
              <div className="flex items-center gap-4">
                <MobileNavToggle />
                <SidebarToggle />
                <h1 className="text-lg font-semibold text-gray-900">
                  Navigation Demo
                </h1>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={toggle}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  {collapsed ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  {collapsed ? 'Expand' : 'Collapse'}
                </button>
              </div>
            </div>

            {/* Breadcrumbs */}
            <div className="px-6 pb-4">
              <Breadcrumb showHomeIcon={true} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid gap-8">
            {/* Navigation State Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Navigation State
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Current State</h3>
                  <ul className="space-y-1 text-gray-600">
                    <li><strong>Pathname:</strong> {pathname}</li>
                    <li><strong>Active Item:</strong> {activeItem?.label || 'None'}</li>
                    <li><strong>Sidebar Collapsed:</strong> {collapsed ? 'Yes' : 'No'}</li>
                    <li><strong>Mobile Menu Open:</strong> {mobileOpen ? 'Yes' : 'No'}</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Breadcrumbs</h3>
                  <ul className="space-y-1 text-gray-600">
                    {breadcrumbs.map((crumb, index) => (
                      <li key={index}>
                        {index + 1}. {crumb.label} {crumb.isActive && '(active)'}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Navigation Items Demo */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Navigation Items
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {navigation.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all",
                      isItemActive(item)
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <item.icon className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-gray-900">
                        {item.label}
                      </span>
                      {isItemActive(item) && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {item.description}
                    </p>
                    <Link
                      href={item.href}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Go to {item.label} →
                    </Link>

                    {/* Show children if any */}
                    {item.children && item.children.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-2">Sub-pages:</p>
                        <div className="space-y-1">
                          {item.children.map((child) => (
                            <Link
                              key={child.id}
                              href={child.href}
                              className={cn(
                                "block text-xs p-2 rounded transition-colors",
                                pathname === child.href
                                  ? "bg-blue-100 text-blue-700"
                                  : "text-gray-600 hover:bg-gray-100"
                              )}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Breadcrumb Variations */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Breadcrumb Variations
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Default Breadcrumb</h3>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <Breadcrumb showHomeIcon={true} />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Compact Breadcrumb (Mobile)</h3>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <CompactBreadcrumb />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Without Home Icon</h3>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <Breadcrumb showHomeIcon={false} />
                  </div>
                </div>
              </div>
            </div>

            {/* Test Links */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Test Navigation
              </h2>
              <p className="text-gray-600 mb-4">
                Click these links to test navigation state changes and breadcrumb updates:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link
                  href="/demo/navigation"
                  className="p-3 text-center bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors text-sm"
                >
                  Demo Home
                </Link>
                <Link
                  href="/demo/navigation/events"
                  className="p-3 text-center bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors text-sm"
                >
                  Events Section
                </Link>
                <Link
                  href="/demo/navigation/events/new"
                  className="p-3 text-center bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors text-sm"
                >
                  Create Event
                </Link>
                <Link
                  href="/demo/navigation/settings"
                  className="p-3 text-center bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors text-sm"
                >
                  Settings
                </Link>
              </div>
            </div>

            {/* Mobile Testing Instructions */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-amber-800 mb-2">
                Mobile Testing
              </h2>
              <p className="text-amber-700 text-sm">
                To test mobile navigation: resize your browser window to mobile size (&lt; 1024px width)
                or use browser dev tools device emulation. The sidebar will become a mobile menu
                accessible via the hamburger button in the top-left corner.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function NavigationDemoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <NavigationProvider isAuthenticated={true}>
        <NavigationDemo />
      </NavigationProvider>
    </Suspense>
  )
}