'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useTheme, type Theme } from '@/contexts/ThemeContext'
import { Sun, Moon, Monitor } from 'lucide-react'

// Import all skeleton components
import {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonButton,
  SkeletonAvatar,
  SkeletonListItem,
  SkeletonGrid
} from '@/components/ui/Skeleton'

// Import event-specific skeletons
import {
  EventCardSkeleton,
  EventGridSkeleton,
  EventListSkeleton,
  EventCardCompactSkeleton
} from '@/components/events/EventCardSkeleton'

import {
  EventFiltersSkeleton,
  FilterLoadingOverlay,
  MobileEventFiltersSkeleton
} from '@/components/events/EventFiltersSkeleton'

// Import error components
import {
  ErrorMessage,
  NetworkErrorMessage,
  ValidationErrorMessage,
  ServerErrorMessage,
  AuthenticationErrorMessage,
  InlineErrorMessage
} from '@/components/ui/ErrorMessage'

import {
  RetryBoundary,
  NetworkRetryBoundary,
  ServerRetryBoundary,
  ComponentRetryBoundary
} from '@/components/ui/RetryBoundary'

// Import empty state components
import {
  EmptyState,
  EventsEmptyState,
  SearchEmptyState,
  FilterEmptyState,
  GuestsEmptyState,
  VenuesEmptyState,
  ErrorEmptyState,
  LoadingEmptyState
} from '@/components/ui/EmptyState'

interface DemoSectionProps {
  title: string
  description?: string
  children: React.ReactNode
}

function DemoSection({ title, description, children }: DemoSectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  )
}

function ComponentDemo({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <Card className={`p-4 ${className || ''}`}>
      <h3 className="text-sm font-medium text-muted-foreground mb-3">{title}</h3>
      {children}
    </Card>
  )
}

// Error throwing component for testing error boundaries
function ErrorThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('This is a test error for demonstrating error boundaries')
  }
  return <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded">✅ Component loaded successfully!</div>
}

// Theme controls component
function ThemeControls() {
  const [mounted, setMounted] = useState(false)

  // Always call useTheme at the top level
  let theme = 'system'
  let resolvedTheme = 'light'
  let setTheme = (_theme: Theme) => {}

  try {
    const themeContext = useTheme()
    theme = themeContext.theme
    resolvedTheme = themeContext.resolvedTheme
    setTheme = themeContext.setTheme
  } catch {
    // Theme context not available, use defaults
  }

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Only render theme controls after mounting to avoid SSR issues
  if (!mounted) {
    return (
      <Card className="p-4">
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">Theme Preview</h3>
          <div className="flex gap-2">
            <div className="h-8 w-20 bg-muted rounded animate-pulse" />
            <div className="h-8 w-20 bg-muted rounded animate-pulse" />
            <div className="h-8 w-20 bg-muted rounded animate-pulse" />
          </div>
          <p className="text-xs text-muted-foreground">Loading...</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Theme Preview</h3>
        <div className="flex gap-2">
          <Button
            variant={theme === 'light' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTheme('light')}
            className="gap-2"
          >
            <Sun className="h-4 w-4" />
            Light
          </Button>
          <Button
            variant={theme === 'dark' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTheme('dark')}
            className="gap-2"
          >
            <Moon className="h-4 w-4" />
            Dark
          </Button>
          <Button
            variant={theme === 'system' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTheme('system')}
            className="gap-2"
          >
            <Monitor className="h-4 w-4" />
            System
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Current: {theme} → {resolvedTheme}
        </p>
      </div>
    </Card>
  )
}

export default function LoadingErrorStatesDemo() {
  const [showError, setShowError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetry = async () => {
    setIsRetrying(true)
    setRetryCount(prev => prev + 1)

    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 1000))

    setIsRetrying(false)
    console.log(`Retry attempt ${retryCount + 1}`)
  }

  const handleErrorToggle = () => {
    setShowError(prev => !prev)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Loading & Error States Demo
              </h1>
              <p className="text-muted-foreground">
                Comprehensive showcase of all loading skeletons, error messages, and empty states
              </p>
            </div>

            {/* Theme Controls */}
            <ThemeControls />
          </div>
        </div>

        <div className="space-y-12">
          {/* Theme Demonstration */}
          <DemoSection
            title="Theme Adaptation Demo"
            description="See how components automatically adapt to light, dark, and system themes"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ComponentDemo title="Skeleton Animation">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-3/4" animation="pulse" />
                  <Skeleton className="h-4 w-1/2" animation="wave" />
                  <Skeleton variant="circular" className="w-10 h-10" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Animations respect prefers-reduced-motion
                </p>
              </ComponentDemo>

              <ComponentDemo title="Error Themes">
                <div className="space-y-3">
                  <ErrorMessage
                    title="Theme-aware Error"
                    message="Notice how colors adapt to current theme"
                    severity="error"
                    type="network"
                    showIcon={true}
                  />
                </div>
              </ComponentDemo>

              <ComponentDemo title="Empty State Themes">
                <EmptyState
                  variant="events"
                  title="Theme-adaptive Icons"
                  description="Icons and backgrounds adapt automatically"
                  size="sm"
                  primaryAction={{
                    label: 'Test Action',
                    onClick: () => console.log('Themed action clicked')
                  }}
                />
              </ComponentDemo>
            </div>

            <Card className="p-4 mt-6">
              <h3 className="text-sm font-medium text-foreground mb-3">Theme Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <strong className="text-foreground">CSS Variables:</strong>
                  <p className="text-muted-foreground">Dynamic color adaptation</p>
                </div>
                <div>
                  <strong className="text-foreground">Animations:</strong>
                  <p className="text-muted-foreground">Shimmer/pulse effects</p>
                </div>
                <div>
                  <strong className="text-foreground">Accessibility:</strong>
                  <p className="text-muted-foreground">Reduced motion support</p>
                </div>
                <div>
                  <strong className="text-foreground">Persistence:</strong>
                  <p className="text-muted-foreground">Theme saved to localStorage</p>
                </div>
              </div>
            </Card>
          </DemoSection>

          {/* Skeleton Components */}
          <DemoSection
            title="Skeleton Components"
            description="Base skeleton components for loading states"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ComponentDemo title="Basic Skeletons">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton variant="circular" className="w-12 h-12" />
                  <Skeleton variant="rectangular" className="h-20 w-full" />
                </div>
              </ComponentDemo>

              <ComponentDemo title="Skeleton Text">
                <div className="space-y-4">
                  <SkeletonText lines={3} width={['100%', '85%', '70%']} />
                  <SkeletonText lines={2} size="lg" spacing="loose" />
                </div>
              </ComponentDemo>

              <ComponentDemo title="Skeleton Components">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <SkeletonAvatar size="md" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <SkeletonButton size="md" />
                  <SkeletonButton size="sm" variant="outline" />
                </div>
              </ComponentDemo>

              <ComponentDemo title="Skeleton Card" className="md:col-span-2">
                <SkeletonCard showHeader showFooter contentLines={4} />
              </ComponentDemo>

              <ComponentDemo title="Skeleton List Items">
                <div className="space-y-2">
                  <SkeletonListItem />
                  <SkeletonListItem showActions={false} />
                  <SkeletonListItem avatarSize="lg" actionCount={3} />
                </div>
              </ComponentDemo>
            </div>

            <ComponentDemo title="Skeleton Grid" className="mt-6">
              <SkeletonGrid columns={3} itemCount={6} gap="md" />
            </ComponentDemo>
          </DemoSection>

          {/* Event-Specific Skeletons */}
          <DemoSection
            title="Event-Specific Skeletons"
            description="Specialized skeleton components for event management features"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ComponentDemo title="Event Card Skeleton - Grid View">
                <EventCardSkeleton viewMode="grid" count={2} />
              </ComponentDemo>

              <ComponentDemo title="Event Card Skeleton - List View">
                <EventCardSkeleton viewMode="list" count={3} />
              </ComponentDemo>

              <ComponentDemo title="Event Compact Skeleton">
                <EventCardCompactSkeleton count={3} />
              </ComponentDemo>

              <ComponentDemo title="Event Filters Skeleton">
                <EventFiltersSkeleton layout="compact" />
              </ComponentDemo>
            </div>

            <ComponentDemo title="Full Event Filters Skeleton" className="mt-6">
              <EventFiltersSkeleton layout="full" showAdvanced />
            </ComponentDemo>

            <ComponentDemo title="Mobile Event Filters Skeleton" className="mt-6 max-w-md">
              <MobileEventFiltersSkeleton />
            </ComponentDemo>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <ComponentDemo title="Event Grid Skeleton">
                <EventGridSkeleton count={4} />
              </ComponentDemo>

              <ComponentDemo title="Event List Skeleton">
                <EventListSkeleton count={3} />
              </ComponentDemo>
            </div>
          </DemoSection>

          {/* Error Messages */}
          <DemoSection
            title="Error Messages"
            description="Comprehensive error handling with retry mechanisms"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ComponentDemo title="Basic Error Message">
                <ErrorMessage
                  title="Something went wrong"
                  message="This is a basic error message with retry functionality."
                  onRetry={handleRetry}
                  isRetrying={isRetrying}
                />
              </ComponentDemo>

              <ComponentDemo title="Network Error">
                <NetworkErrorMessage
                  onRetry={handleRetry}
                  message="Unable to connect to the server. Please check your connection."
                />
              </ComponentDemo>

              <ComponentDemo title="Validation Error">
                <ValidationErrorMessage
                  title="Invalid Input"
                  message="Please check the required fields and try again."
                />
              </ComponentDemo>

              <ComponentDemo title="Server Error">
                <ServerErrorMessage
                  onRetry={handleRetry}
                  message="Internal server error. Our team has been notified."
                />
              </ComponentDemo>

              <ComponentDemo title="Authentication Error">
                <AuthenticationErrorMessage
                  message="Your session has expired. Please sign in again."
                  onRetry={() => console.log('Redirect to login')}
                />
              </ComponentDemo>

              <ComponentDemo title="Inline Error">
                <InlineErrorMessage
                  message="This field is required"
                />
              </ComponentDemo>
            </div>

            <ComponentDemo title="Error with Details" className="mt-6">
              <ErrorMessage
                title="Network Request Failed"
                message="Failed to fetch data from the API endpoint."
                error={new Error('FETCH_ERROR: Cannot connect to https://api.example.com/events')}
                showDetails={true}
                severity="error"
                type="network"
                onRetry={handleRetry}
                isRetrying={isRetrying}
                maxRetries={3}
              />
            </ComponentDemo>
          </DemoSection>

          {/* Error Boundaries */}
          <DemoSection
            title="Error Boundaries"
            description="Error boundaries with automatic retry and recovery"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ComponentDemo title="Basic Retry Boundary">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={showError ? "outline" : "default"}
                      onClick={handleErrorToggle}
                    >
                      {showError ? 'Fix Error' : 'Trigger Error'}
                    </Button>
                  </div>
                  <RetryBoundary
                    maxRetries={3}
                    enableAutoRetry={false}
                    onRetry={(count) => console.log(`Retry attempt ${count}`)}
                  >
                    <ErrorThrowingComponent shouldThrow={showError} />
                  </RetryBoundary>
                </div>
              </ComponentDemo>

              <ComponentDemo title="Network Retry Boundary">
                <NetworkRetryBoundary>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
                    🌐 Network-aware component with auto-retry
                  </div>
                </NetworkRetryBoundary>
              </ComponentDemo>

              <ComponentDemo title="Server Retry Boundary">
                <ServerRetryBoundary>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded">
                    🔧 Server-aware component with retry logic
                  </div>
                </ServerRetryBoundary>
              </ComponentDemo>

              <ComponentDemo title="Component Retry Boundary">
                <ComponentRetryBoundary resetKeys={[retryCount]}>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded">
                    ⚛️ Component boundary with prop-based reset
                  </div>
                </ComponentRetryBoundary>
              </ComponentDemo>
            </div>
          </DemoSection>

          {/* Empty States */}
          <DemoSection
            title="Empty States"
            description="Beautiful empty states for different scenarios"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ComponentDemo title="Events Empty State">
                <EventsEmptyState
                  onCreateEvent={() => console.log('Create event clicked')}
                  size="sm"
                />
              </ComponentDemo>

              <ComponentDemo title="Search Empty State">
                <SearchEmptyState
                  searchTerm="birthday party"
                  onClearSearch={() => console.log('Clear search clicked')}
                  size="sm"
                />
              </ComponentDemo>

              <ComponentDemo title="Filter Empty State">
                <FilterEmptyState
                  filterCount={3}
                  onClearFilters={() => console.log('Clear filters clicked')}
                  size="sm"
                />
              </ComponentDemo>

              <ComponentDemo title="Guests Empty State">
                <GuestsEmptyState
                  onAddGuest={() => console.log('Add guest clicked')}
                  onImportGuests={() => console.log('Import guests clicked')}
                  size="sm"
                />
              </ComponentDemo>

              <ComponentDemo title="Venues Empty State">
                <VenuesEmptyState
                  onSearchVenues={() => console.log('Search venues clicked')}
                  onAddCustomVenue={() => console.log('Add custom venue clicked')}
                  size="sm"
                />
              </ComponentDemo>

              <ComponentDemo title="Error Empty State">
                <ErrorEmptyState
                  onRetry={() => console.log('Retry clicked')}
                  errorMessage="Failed to load data. Please try again."
                  size="sm"
                />
              </ComponentDemo>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              <ComponentDemo title="Loading Empty State">
                <LoadingEmptyState message="Loading events..." size="sm" />
              </ComponentDemo>

              <ComponentDemo title="Custom Empty State">
                <EmptyState
                  variant="default"
                  title="Custom Title"
                  description="This is a custom empty state with your own content."
                  primaryAction={{
                    label: 'Primary Action',
                    onClick: () => console.log('Primary clicked')
                  }}
                  secondaryAction={{
                    label: 'Secondary',
                    onClick: () => console.log('Secondary clicked'),
                    variant: 'outline'
                  }}
                  size="sm"
                />
              </ComponentDemo>

              <ComponentDemo title="Large Empty State">
                <EmptyState
                  variant="events"
                  size="lg"
                  primaryAction={{
                    label: 'Get Started',
                    onClick: () => console.log('Get started clicked')
                  }}
                />
              </ComponentDemo>
            </div>
          </DemoSection>

          {/* Filter Loading Overlay Demo */}
          <DemoSection
            title="Loading Overlays"
            description="Overlay components for in-progress operations"
          >
            <ComponentDemo title="Filter Loading Overlay">
              <div className="relative h-32 bg-muted/20 rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Content behind overlay</p>
                <FilterLoadingOverlay />
              </div>
            </ComponentDemo>
          </DemoSection>

          {/* Interactive Demo Controls */}
          <DemoSection
            title="Interactive Demo Controls"
            description="Test the interactive features"
          >
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <Button onClick={handleRetry} disabled={isRetrying}>
                    {isRetrying ? 'Retrying...' : `Test Retry (${retryCount})`}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleErrorToggle}
                  >
                    {showError ? 'Hide Error' : 'Show Error'}
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => setRetryCount(0)}
                  >
                    Reset Counter
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>• Use the retry button to test retry functionality</p>
                  <p>• Toggle error to test error boundaries</p>
                  <p>• Switch themes to see component adaptation</p>
                  <p>• Check browser console for interaction logs</p>
                  <p>• Test with browser&apos;s reduced motion settings</p>
                </div>
              </div>
            </Card>
          </DemoSection>
        </div>
      </div>
    </div>
  )
}