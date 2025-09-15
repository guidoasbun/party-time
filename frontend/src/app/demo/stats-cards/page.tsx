'use client'

import { Suspense, useState } from 'react'
import {
  Calendar,
  CalendarDays,
  Users,
  DollarSign,
  RefreshCw,
  Settings
} from 'lucide-react'
import { StatsCards, StatsCardsLoading, StatsCardsError } from '@/components/dashboard/StatsCards'

import { StatCard } from '@/components/dashboard/StatCard'

// Mock data for demo
const mockDashboardStats = {
  totalEvents: 18,
  upcomingEvents: 5,
  completedEvents: 12,
  totalGuests: 247,
  avgRsvpRate: 78.5,
  totalBudget: 89500
}

// Mock StatsCards component for demo that doesn't call the API
function MockStatsCards({
  showComparisons = true,
  previousPeriodData
}: {
  showComparisons?: boolean
  previousPeriodData?: {
    totalEvents?: number
    upcomingEvents?: number
    totalGuests?: number
    totalBudget?: number
  }
}) {
  const cards = [
    {
      title: 'Total Events',
      value: mockDashboardStats.totalEvents,
      previousValue: showComparisons ? previousPeriodData?.totalEvents : undefined,
      icon: Calendar,
      testId: 'total-events-card'
    },
    {
      title: 'Upcoming Events',
      value: mockDashboardStats.upcomingEvents,
      previousValue: showComparisons ? previousPeriodData?.upcomingEvents : undefined,
      icon: CalendarDays,
      testId: 'upcoming-events-card'
    },
    {
      title: 'Total Guests',
      value: mockDashboardStats.totalGuests,
      previousValue: showComparisons ? previousPeriodData?.totalGuests : undefined,
      icon: Users,
      testId: 'total-guests-card'
    },
    {
      title: 'Total Budget',
      value: mockDashboardStats.totalBudget,
      previousValue: showComparisons ? previousPeriodData?.totalBudget : undefined,
      icon: DollarSign,
      prefix: '$',
      testId: 'total-budget-card'
    }
  ]

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <StatCard
            key={card.testId}
            title={card.title}
            value={card.value}
            previousValue={card.previousValue}
            icon={card.icon}
            prefix={card.prefix}
            loading={false}
            className="min-h-[120px]"
            data-testid={card.testId}
          />
        ))}
      </div>
    </div>
  )
}

export default function StatsCardsDemo() {
  const [showComparisons, setShowComparisons] = useState(true)
  const [simulateLoading, setSimulateLoading] = useState(false)
  const [simulateError, setSimulateError] = useState(false)
  const [useRealAPI, setUseRealAPI] = useState(false)

  // Mock previous period data for comparison testing
  const mockPreviousPeriodData = {
    totalEvents: 15,
    upcomingEvents: 3,
    totalGuests: 180,
    totalBudget: 45000
  }

  const handleSimulateLoading = () => {
    setSimulateLoading(true)
    setTimeout(() => setSimulateLoading(false), 3000)
  }

  if (simulateError) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Dashboard Statistics Cards - Demo
            </h1>
            <p className="text-gray-600">
              Testing error state
            </p>
          </div>

          <StatsCardsError
            error={new Error('Failed to connect to the server. Please check your internet connection.')}
            onRetry={() => setSimulateError(false)}
          />

          <div className="mt-8">
            <button
              onClick={() => setSimulateError(false)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Reset Demo
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (simulateLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Dashboard Statistics Cards - Demo
            </h1>
            <p className="text-gray-600">
              Testing loading state...
            </p>
          </div>

          <StatsCardsLoading />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard Statistics Cards - Demo
          </h1>
          <p className="text-gray-600">
            Testing the dashboard statistics cards component with various states and data
          </p>
        </div>

        {/* Controls */}
        <div className="mb-8 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Demo Controls
          </h2>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showComparisons}
                onChange={(e) => setShowComparisons(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Show trend comparisons</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={useRealAPI}
                onChange={(e) => setUseRealAPI(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Use real API (requires backend)</span>
            </label>

            <button
              onClick={handleSimulateLoading}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Test Loading State
            </button>

            <button
              onClick={() => setSimulateError(true)}
              className="inline-flex items-center px-3 py-1.5 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
            >
              Test Error State
            </button>
          </div>
        </div>

        {/* Main Stats Cards */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Live Dashboard Statistics
          </h2>

          {useRealAPI ? (
            <Suspense fallback={<StatsCardsLoading />}>
              <StatsCards
                showComparisons={showComparisons}
                previousPeriodData={showComparisons ? mockPreviousPeriodData : undefined}
              />
            </Suspense>
          ) : (
            <MockStatsCards
              showComparisons={showComparisons}
              previousPeriodData={showComparisons ? mockPreviousPeriodData : undefined}
            />
          )}
        </div>

        {/* Individual Card Examples */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Individual Card Examples
          </h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Positive trend */}
            <StatCard
              title="Events This Month"
              value={12}
              previousValue={8}
              icon={Calendar}
              className="min-h-[120px]"
            />

            {/* Negative trend */}
            <StatCard
              title="Cancelled Events"
              value={2}
              previousValue={5}
              icon={CalendarDays}
              className="min-h-[120px]"
            />

            {/* No change */}
            <StatCard
              title="Average Guests"
              value={45}
              previousValue={45}
              icon={Users}
              className="min-h-[120px]"
            />

            {/* Large number with prefix */}
            <StatCard
              title="Total Revenue"
              value={125000}
              previousValue={98000}
              icon={DollarSign}
              prefix="$"
              className="min-h-[120px]"
            />

            {/* No comparison data */}
            <StatCard
              title="New Feature Usage"
              value={87}
              icon={Settings}
              suffix="%"
              className="min-h-[120px]"
            />

            {/* Loading state */}
            <StatCard
              title="Loading Example"
              value={0}
              icon={RefreshCw}
              loading={true}
              className="min-h-[120px]"
            />
          </div>
        </div>

        {/* Mobile Responsiveness Test */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Responsive Layout Test
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Resize your browser window to test responsive behavior:
            <br />
            • Desktop (4 columns) • Tablet (2 columns) • Mobile (1 column)
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Desktop Test 1"
              value={100}
              icon={Calendar}
              className="min-h-[100px]"
            />
            <StatCard
              title="Desktop Test 2"
              value={200}
              icon={Users}
              className="min-h-[100px]"
            />
            <StatCard
              title="Desktop Test 3"
              value={300}
              icon={DollarSign}
              prefix="$"
              className="min-h-[100px]"
            />
            <StatCard
              title="Desktop Test 4"
              value={400}
              icon={CalendarDays}
              className="min-h-[100px]"
            />
          </div>
        </div>

        {/* Demo Navigation */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Other Demos</h3>
          <div className="flex flex-wrap gap-4">
            <a
              href="/demo/event-cards"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Event Cards Demo
            </a>
            <a
              href="/demo/event-list"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Event List Demo
            </a>
            <a
              href="/demo/event-filters"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Event Filters Demo
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}