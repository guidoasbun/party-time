'use client'

/**
 * Events layout with navigation
 * Wraps all event-related pages with NavigationProvider
 */

import React from 'react'
import { useSession } from 'next-auth/react'
import { NavigationProvider } from '@/contexts/NavigationContext'
import { Navigation } from '@/components/layout/Navigation'
import { useSidebar } from '@/contexts/NavigationContext'
import { cn } from '@/lib/utils'

interface EventsLayoutProps {
  children: React.ReactNode
}

function EventsLayoutContent({ children }: EventsLayoutProps) {
  const { collapsed } = useSidebar()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Sidebar */}
      <Navigation />

      {/* Main Content Area */}
      <div
        className={cn(
          "transition-all duration-300",
          "lg:pl-64", // Default sidebar width
          collapsed && "lg:pl-16" // Collapsed sidebar width
        )}
      >
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function EventsLayout({ children }: EventsLayoutProps) {
  const { status } = useSession()
  const isAuthenticated = status === 'authenticated'

  return (
    <NavigationProvider isAuthenticated={isAuthenticated}>
      <EventsLayoutContent>
        {children}
      </EventsLayoutContent>
    </NavigationProvider>
  )
}
