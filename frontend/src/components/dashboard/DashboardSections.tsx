'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { DashboardGrid } from './DashboardLayout'
import { QuickStatsSection } from './QuickStatsSection'
import { RecentActivityFeed } from './RecentActivityFeed'
import { UpcomingEventsWidget } from './UpcomingEventsWidget'
import { QuickActionsPanel } from './QuickActionsPanel'
import { RecentEventsSection } from './RecentEventsSection'
import { useDashboardData } from '@/hooks/api/useEventStats'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

interface DashboardSectionsProps {
  className?: string
}

interface SectionWrapperProps {
  children: React.ReactNode
  title?: string
  error?: Error | null
  onRetry?: () => void
}

function SectionWrapper({ children, title, error, onRetry }: SectionWrapperProps) {
  if (error) {
    return (
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-card-foreground mb-1">
            Error loading {title || 'section'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            There was an error loading this section
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-sm text-primary hover:text-primary/80 font-medium"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    )
  }

  return <>{children}</>
}

function DashboardHeader() {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-foreground mb-2">
        Dashboard
      </h1>
      <p className="text-muted-foreground">
        Overview of your events, activities, and quick actions
      </p>
    </div>
  )
}

function LoadingSection() {
  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-muted-foreground/20 rounded w-1/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-muted-foreground/20 rounded"></div>
          <div className="h-4 bg-muted-foreground/20 rounded w-5/6"></div>
          <div className="h-4 bg-muted-foreground/20 rounded w-4/6"></div>
        </div>
      </div>
    </div>
  )
}

export function DashboardSections({ className }: DashboardSectionsProps) {
  const router = useRouter()
  const { error } = useDashboardData()

  // Navigation handlers
  const handleCreateEvent = () => {
    router.push('/events/new')
  }

  const handleViewEvent = (eventId: string) => {
    router.push(`/events/${eventId}`)
  }

  const handleEditEvent = (eventId: string) => {
    router.push(`/events/${eventId}/edit`)
  }

  const handleViewAllEvents = () => {
    router.push('/events')
  }

  const handleViewAllActivity = () => {
    // TODO: Navigate to activity page when implemented
    console.log('View all activity')
  }

  const handleImportGuests = () => {
    // TODO: Open import modal when implemented
    console.log('Import guests')
  }

  const handleViewCalendar = () => {
    // TODO: Navigate to calendar view when implemented
    console.log('View calendar')
  }

  const handleExportData = () => {
    // TODO: Open export modal when implemented
    console.log('Export data')
  }

  const handleSendInvitations = () => {
    // TODO: Open invitation modal when implemented
    console.log('Send invitations')
  }

  const handleViewReports = () => {
    // TODO: Navigate to reports page when implemented
    console.log('View reports')
  }

  const handleManageSettings = () => {
    router.push('/settings')
  }

  if (error) {
    return (
      <div className={cn('space-y-6', className)}>
        <DashboardHeader />
        <div className="bg-card rounded-lg shadow-sm border border-border p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-card-foreground mb-2">
              Unable to load dashboard
            </h2>
            <p className="text-muted-foreground mb-4">
              There was an error loading your dashboard data. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Refresh page
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-8', className)}>
      {/* Dashboard Header */}
      <DashboardHeader />

      {/* Quick Stats Section */}
      <ErrorBoundary fallback={
        <SectionWrapper title="statistics" error={new Error('Failed to load statistics')}>
          <LoadingSection />
        </SectionWrapper>
      }>
        <QuickStatsSection />
      </ErrorBoundary>

      {/* Main Dashboard Grid */}
      <DashboardGrid columns={2}>
        {/* Recent Activity Feed */}
        <ErrorBoundary fallback={
          <SectionWrapper title="activity feed" error={new Error('Failed to load activity feed')}>
            <LoadingSection />
          </SectionWrapper>
        }>
          <RecentActivityFeed
            limit={8}
            showViewAll={true}
            onViewAll={handleViewAllActivity}
          />
        </ErrorBoundary>

        {/* Upcoming Events Widget */}
        <ErrorBoundary fallback={
          <SectionWrapper title="upcoming events" error={new Error('Failed to load upcoming events')}>
            <LoadingSection />
          </SectionWrapper>
        }>
          <UpcomingEventsWidget
            limit={5}
            onEventClick={handleViewEvent}
            onEditEvent={handleEditEvent}
            onViewAll={handleViewAllEvents}
          />
        </ErrorBoundary>
      </DashboardGrid>

      {/* Quick Actions and Recent Events */}
      <DashboardGrid columns={2}>
        {/* Quick Actions Panel */}
        <ErrorBoundary fallback={
          <SectionWrapper title="quick actions" error={new Error('Failed to load quick actions')}>
            <LoadingSection />
          </SectionWrapper>
        }>
          <QuickActionsPanel
            onCreateEvent={handleCreateEvent}
            onImportGuests={handleImportGuests}
            onViewCalendar={handleViewCalendar}
            onExportData={handleExportData}
            onSendInvitations={handleSendInvitations}
            onViewReports={handleViewReports}
            onManageSettings={handleManageSettings}
          />
        </ErrorBoundary>

        {/* Recent Events Section */}
        <ErrorBoundary fallback={
          <SectionWrapper title="recent events" error={new Error('Failed to load recent events')}>
            <LoadingSection />
          </SectionWrapper>
        }>
          <RecentEventsSection
            limit={8}
            onEventClick={handleViewEvent}
            onEditEvent={handleEditEvent}
            onViewAll={handleViewAllEvents}
          />
        </ErrorBoundary>
      </DashboardGrid>

      {/* Full Width Recent Events (Alternative Layout) */}
      {/* Uncomment this if you prefer a full-width recent events section */}
      {/*
      <DashboardSection title="Recent Events" fullWidth>
        <ErrorBoundary fallback={
          <SectionWrapper title="recent events" error={new Error('Failed to load recent events')}>
            <div className="text-center py-8">Error loading recent events</div>
          </SectionWrapper>
        }>
          <RecentEventsSection
            limit={10}
            onEventClick={handleViewEvent}
            onEditEvent={handleEditEvent}
            onViewAll={handleViewAllEvents}
          />
        </ErrorBoundary>
      </DashboardSection>
      */}
    </div>
  )
}