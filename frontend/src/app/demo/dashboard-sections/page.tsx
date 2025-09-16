'use client'

import * as React from 'react'
import { DashboardSections } from '@/components/dashboard/DashboardSections'

export default function DashboardSectionsDemo() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard Sections Demo
          </h1>
          <p className="text-gray-600">
            Testing all the new dashboard sections including Quick Stats, Recent Activity,
            Upcoming Events, Quick Actions, and Recent Events.
          </p>
        </div>

        {/* New Dashboard Sections */}
        <DashboardSections />

        {/* Navigation back */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Other Demos</h3>
          <div className="flex space-x-4">
            <a
              href="/demo/stats-cards"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              Stats Cards Demo
            </a>
            <a
              href="/demo/event-cards"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              Event Cards Demo
            </a>
            <a
              href="/demo/event-list"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              Event List Demo
            </a>
            <a
              href="/demo/event-filters"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              Event Filters Demo
            </a>
            <a
              href="/dashboard"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              Main Dashboard (requires auth)
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}