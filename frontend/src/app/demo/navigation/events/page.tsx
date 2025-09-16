'use client'

import React, { Suspense } from 'react'
import Link from 'next/link'
import { Calendar, Plus, List } from 'lucide-react'
import { NavigationProvider } from '@/contexts/NavigationContext'
import { Navigation, MobileNavToggle, SidebarToggle } from '@/components/layout/Navigation'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { useSidebar } from '@/contexts/NavigationContext'
import { cn } from '@/lib/utils'

function EventsPage() {
  const { collapsed } = useSidebar()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className={cn(
        "transition-all duration-300",
        "lg:pl-64",
        collapsed && "lg:pl-16"
      )}>
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between h-16 px-6">
              <div className="flex items-center gap-4">
                <MobileNavToggle />
                <SidebarToggle />
                <h1 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Events Management
                </h1>
              </div>
            </div>

            <div className="px-6 pb-4">
              <Breadcrumb />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Events Section</h2>
            <p className="text-gray-600 mb-6">
              This is a test page to demonstrate breadcrumb navigation for the Events section.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/demo/navigation/events/new"
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Plus className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-gray-900 group-hover:text-blue-700">
                    Create New Event
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Start planning a new event with our guided setup process.
                </p>
              </Link>

              <Link
                href="/demo/navigation/events/list"
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <List className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-gray-900 group-hover:text-blue-700">
                    View All Events
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Browse and manage all your existing events.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function EventsPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <NavigationProvider isAuthenticated={true}>
        <EventsPage />
      </NavigationProvider>
    </Suspense>
  )
}