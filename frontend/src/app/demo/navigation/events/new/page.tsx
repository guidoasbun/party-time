'use client'

import React, { Suspense } from 'react'
import Link from 'next/link'
import { Plus, ArrowLeft } from 'lucide-react'
import { NavigationProvider } from '@/contexts/NavigationContext'
import { Navigation, MobileNavToggle, SidebarToggle } from '@/components/layout/Navigation'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { useSidebar } from '@/contexts/NavigationContext'
import { cn } from '@/lib/utils'

function CreateEventPage() {
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
                  <Plus className="h-5 w-5 text-green-600" />
                  Create New Event
                </h1>
              </div>

              <Link
                href="/demo/navigation/events"
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Events
              </Link>
            </div>

            <div className="px-6 pb-4">
              <Breadcrumb />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Event</h2>
            <p className="text-gray-600 mb-6">
              This is a test page to demonstrate deep breadcrumb navigation. Notice how the breadcrumb
              shows: Dashboard → Events → Create New
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">Navigation Test Successful!</h3>
              <p className="text-blue-700 text-sm">
                The navigation system is working correctly. You can see:
              </p>
              <ul className="list-disc list-inside text-blue-700 text-sm mt-2 space-y-1">
                <li>Active navigation state in the sidebar</li>
                <li>Proper breadcrumb trail showing the current path</li>
                <li>Mobile responsive navigation menu</li>
                <li>Sidebar collapse/expand functionality</li>
              </ul>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Test More Routes</h3>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/demo/navigation"
                  className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200 transition-colors"
                >
                  Demo Home
                </Link>
                <Link
                  href="/demo/navigation/settings"
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition-colors"
                >
                  Settings
                </Link>
                <Link
                  href="/dashboard"
                  className="px-3 py-1.5 bg-green-100 text-green-700 rounded-md text-sm hover:bg-green-200 transition-colors"
                >
                  Real Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CreateEventPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <NavigationProvider isAuthenticated={true}>
        <CreateEventPage />
      </NavigationProvider>
    </Suspense>
  )
}