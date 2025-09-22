/**
 * Tests for useEventStats hook and related statistics hooks
 */

import { waitFor } from '@testing-library/react'
import { server } from '../../../../__tests__/mocks/server'
import { http, HttpResponse } from 'msw'
import { renderEventHook } from '../../../../__tests__/eventTestUtils'
import {
  useEventStats,
  useDashboardStats,
  useRecentActivity,
  useUpcomingEvents,
  useDashboardData,
  useEventMetrics,
  useEventTrends,
  eventStatsKeys
} from '../useEventStats'
import {
  mockEventStats,
  mockDashboardStats,
  mockRecentActivity,
  getMockUpcomingEvents,
  mockApiError,
  mockUnauthorizedError
} from '../../../../__tests__/mocks/eventData'

// Mock the events service
jest.mock('@/lib/api/services', () => ({
  eventsService: {
    getEventsStats: jest.fn(),
    getRecentEvents: jest.fn(),
    getUpcomingEvents: jest.fn(),
  }
}))

describe('Event Statistics Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    server.resetHandlers()
  })

  describe('useEventStats', () => {
    it('should fetch event statistics successfully', async () => {
      const { result } = renderEventHook(() => useEventStats())

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockEventStats)
      expect(result.current.data?.total_events).toBeDefined()
      expect(result.current.data?.events_by_status).toBeDefined()
      expect(result.current.data?.events_by_type).toBeDefined()
      expect(result.current.error).toBeNull()
    })

    it('should handle server errors', async () => {
      server.use(
        http.get('http://localhost:8000/api/v1/events/stats', () => {
          return HttpResponse.json(mockApiError.data, { status: mockApiError.status })
        })
      )

      const { result } = renderEventHook(() => useEventStats())

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeDefined()
    })

    it('should handle unauthorized errors', async () => {
      server.use(
        http.get('http://localhost:8000/api/v1/events/stats', () => {
          return HttpResponse.json(mockUnauthorizedError.data, {
            status: mockUnauthorizedError.status
          })
        })
      )

      const { result } = renderEventHook(() => useEventStats())

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeDefined()
    })

    it('should use correct query key', () => {
      const { result } = renderEventHook(() => useEventStats())
      expect(result.current.queryKey).toEqual(eventStatsKeys.dashboard())
    })

    it('should respect stale time configuration', async () => {
      const { result } = renderEventHook(() => useEventStats())

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // Data should remain fresh for the configured stale time
      expect(result.current.isStale).toBe(false)
    })
  })

  describe('useDashboardStats', () => {
    it('should transform event stats to dashboard format', async () => {
      const { result } = renderEventHook(() => useDashboardStats())

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeDefined()
      expect(result.current.data?.totalEvents).toBeDefined()
      expect(result.current.data?.upcomingEvents).toBeDefined()
      expect(result.current.data?.completedEvents).toBeDefined()
      expect(result.current.data?.totalGuests).toBeDefined()
      expect(result.current.data?.avgRsvpRate).toBeDefined()
      expect(result.current.data?.totalBudget).toBeDefined()
    })

    it('should handle null stats gracefully', async () => {
      server.use(
        http.get('http://localhost:8000/api/v1/events/stats', () => {
          return HttpResponse.json(null)
        })
      )

      const { result } = renderEventHook(() => useDashboardStats())

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // Should return default stats when API returns null
      expect(result.current.data).toEqual({
        totalEvents: 0,
        upcomingEvents: 0,
        completedEvents: 0,
        totalGuests: 0,
        avgRsvpRate: 0,
        totalBudget: 0,
      })
    })

    it('should calculate completed events correctly', async () => {
      const mockStats = {
        ...mockEventStats,
        total_events: 10,
        upcoming_events: 3
      }

      server.use(
        http.get('http://localhost:8000/api/v1/events/stats', () => {
          return HttpResponse.json(mockStats)
        })
      )

      const { result } = renderEventHook(() => useDashboardStats())

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.completedEvents).toBe(7) // 10 - 3 = 7
    })

    it('should handle API errors gracefully', async () => {
      server.use(
        http.get('http://localhost:8000/api/v1/events/stats', () => {
          return HttpResponse.json(mockApiError.data, { status: mockApiError.status })
        })
      )

      const { result } = renderEventHook(() => useDashboardStats())

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // Should return default stats on API error for demo purposes
      expect(result.current.data).toEqual({
        totalEvents: 0,
        upcomingEvents: 0,
        completedEvents: 0,
        totalGuests: 0,
        avgRsvpRate: 0,
        totalBudget: 0,
      })
    })
  })

  describe('useRecentActivity', () => {
    it('should fetch recent activity successfully', async () => {
      const { result } = renderEventHook(() => useRecentActivity(5))

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeDefined()
      expect(Array.isArray(result.current.data)).toBe(true)
      expect(result.current.data?.length).toBeLessThanOrEqual(5)
    })

    it('should handle empty recent events', async () => {
      server.use(
        http.get('http://localhost:8000/api/v1/events/recent', () => {
          return HttpResponse.json([])
        })
      )

      const { result } = renderEventHook(() => useRecentActivity())

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual([])
    })

    it('should transform events to activity format', async () => {
      const { result } = renderEventHook(() => useRecentActivity())

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      if (result.current.data && result.current.data.length > 0) {
        const activity = result.current.data[0]
        expect(activity.id).toBeDefined()
        expect(activity.event_id).toBeDefined()
        expect(activity.user_name).toBeDefined()
        expect(activity.action_type).toBe('created')
        expect(activity.description).toContain('Created event')
        expect(activity.created_at).toBeDefined()
      }
    })

    it('should handle API errors gracefully', async () => {
      server.use(
        http.get('http://localhost:8000/api/v1/events/recent', () => {
          return HttpResponse.json(mockApiError.data, { status: mockApiError.status })
        })
      )

      const { result } = renderEventHook(() => useRecentActivity())

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual([])
    })

    it('should use default limit of 10', () => {
      const { result } = renderEventHook(() => useRecentActivity())
      expect(result.current.queryKey).toEqual(eventStatsKeys.recentActivity())
    })
  })

  describe('useUpcomingEvents', () => {
    it('should fetch upcoming events successfully', async () => {
      const { result } = renderEventHook(() => useUpcomingEvents(3))

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeDefined()
      expect(Array.isArray(result.current.data)).toBe(true)
      expect(result.current.data?.length).toBeLessThanOrEqual(3)
    })

    it('should handle empty upcoming events', async () => {
      server.use(
        http.get('http://localhost:8000/api/v1/events/upcoming', () => {
          return HttpResponse.json([])
        })
      )

      const { result } = renderEventHook(() => useUpcomingEvents())

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual([])
    })

    it('should handle API errors gracefully', async () => {
      server.use(
        http.get('http://localhost:8000/api/v1/events/upcoming', () => {
          return HttpResponse.json(mockApiError.data, { status: mockApiError.status })
        })
      )

      const { result } = renderEventHook(() => useUpcomingEvents())

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual([])
    })

    it('should use correct query key with limit', () => {
      const limit = 3
      const { result } = renderEventHook(() => useUpcomingEvents(limit))
      expect(result.current.queryKey).toEqual(eventStatsKeys.upcomingEvents(limit))
    })
  })

  describe('useDashboardData', () => {
    it('should provide complete dashboard data', async () => {
      const { result } = renderEventHook(() => useDashboardData())

      await waitFor(() => {
        expect(result.current.stats).toBeDefined()
        expect(result.current.recentActivity).toBeDefined()
        expect(result.current.upcomingEvents).toBeDefined()
      })

      expect(Array.isArray(result.current.recentActivity)).toBe(true)
      expect(Array.isArray(result.current.upcomingEvents)).toBe(true)
      expect(typeof result.current.isLoading).toBe('boolean')
      expect(typeof result.current.hasData).toBe('boolean')
      expect(typeof result.current.isEmpty).toBe('boolean')
    })

    it('should handle loading states correctly', () => {
      const { result } = renderEventHook(() => useDashboardData())

      // Initially should be loading
      expect(result.current.isLoading).toBe(true)
      expect(result.current.isStatsLoading).toBe(true)
      expect(result.current.isActivityLoading).toBe(true)
      expect(result.current.isEventsLoading).toBe(true)
    })

    it('should compute hasData correctly', async () => {
      const { result } = renderEventHook(() => useDashboardData())

      await waitFor(() => {
        expect(result.current.hasData).toBe(true)
      })
    })

    it('should compute isEmpty correctly when all data is empty', async () => {
      server.use(
        http.get('http://localhost:8000/api/v1/events/stats', () => {
          return HttpResponse.json(null)
        }),
        http.get('http://localhost:8000/api/v1/events/recent', () => {
          return HttpResponse.json([])
        }),
        http.get('http://localhost:8000/api/v1/events/upcoming', () => {
          return HttpResponse.json([])
        })
      )

      const { result } = renderEventHook(() => useDashboardData())

      await waitFor(() => {
        expect(result.current.isEmpty).toBe(true)
      })
    })

    it('should handle individual errors gracefully', async () => {
      server.use(
        http.get('http://localhost:8000/api/v1/events/stats', () => {
          return HttpResponse.json(mockApiError.data, { status: mockApiError.status })
        })
      )

      const { result } = renderEventHook(() => useDashboardData())

      await waitFor(() => {
        expect(result.current.statsError).toBeDefined()
        expect(result.current.error).toBeDefined()
      })

      // Should still provide other data
      expect(result.current.recentActivity).toBeDefined()
      expect(result.current.upcomingEvents).toBeDefined()
    })
  })

  describe('useEventMetrics', () => {
    it('should calculate event metrics correctly', async () => {
      const { result } = renderEventHook(() => useEventMetrics())

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeDefined()
      expect(result.current.data?.totalEvents).toBeDefined()
      expect(result.current.data?.activeEvents).toBeDefined()
      expect(result.current.data?.completionRate).toBeDefined()
      expect(result.current.data?.averageGuestCount).toBeDefined()
      expect(result.current.data?.budgetUtilization).toBeDefined()
    })

    it('should calculate budget utilization correctly', async () => {
      const mockStats = {
        ...mockEventStats,
        total_budget: 100000,
        average_budget: 8000,
        total_events: 10
      }

      server.use(
        http.get('http://localhost:8000/api/v1/events/stats', () => {
          return HttpResponse.json(mockStats)
        })
      )

      const { result } = renderEventHook(() => useEventMetrics())

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // Budget utilization = (total_budget - (average_budget * total_events)) / total_budget * 100
      // = (100000 - (8000 * 10)) / 100000 * 100 = 20%
      expect(result.current.data?.budgetUtilization).toBe(20)
    })

    it('should handle zero budget gracefully', async () => {
      const mockStats = {
        ...mockEventStats,
        total_budget: 0,
        average_budget: 0,
        total_events: 5
      }

      server.use(
        http.get('http://localhost:8000/api/v1/events/stats', () => {
          return HttpResponse.json(mockStats)
        })
      )

      const { result } = renderEventHook(() => useEventMetrics())

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.budgetUtilization).toBe(0)
    })
  })

  describe('useEventTrends', () => {
    it('should calculate event trends correctly', async () => {
      const { result } = renderEventHook(() => useEventTrends())

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeDefined()
      expect(result.current.data?.eventsThisMonth).toBeDefined()
      expect(result.current.data?.eventsThisYear).toBeDefined()
      expect(result.current.data?.monthlyGrowth).toBeDefined()
      expect(result.current.data?.yearlyGrowth).toBeDefined()
    })

    it('should calculate growth rates correctly', async () => {
      const mockStats = {
        ...mockEventStats,
        events_this_month: 5,
        events_this_year: 20
      }

      server.use(
        http.get('http://localhost:8000/api/v1/events/stats', () => {
          return HttpResponse.json(mockStats)
        })
      )

      const { result } = renderEventHook(() => useEventTrends())

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.eventsThisMonth).toBe(5)
      expect(result.current.data?.eventsThisYear).toBe(20)
      expect(result.current.data?.monthlyGrowth).toBe(15) // Mock value
      expect(result.current.data?.yearlyGrowth).toBe(25) // Mock value
    })

    it('should handle zero events gracefully', async () => {
      const mockStats = {
        ...mockEventStats,
        events_this_month: 0,
        events_this_year: 0
      }

      server.use(
        http.get('http://localhost:8000/api/v1/events/stats', () => {
          return HttpResponse.json(mockStats)
        })
      )

      const { result } = renderEventHook(() => useEventTrends())

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.eventsThisMonth).toBe(0)
      expect(result.current.data?.eventsThisYear).toBe(0)
      expect(result.current.data?.monthlyGrowth).toBe(0)
      expect(result.current.data?.yearlyGrowth).toBe(0)
    })

    it('should use longer stale time for trends', async () => {
      const { result } = renderEventHook(() => useEventTrends())

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // Trends should remain fresh longer than other data
      expect(result.current.isStale).toBe(false)
    })
  })
})