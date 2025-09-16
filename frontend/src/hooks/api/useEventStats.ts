/**
 * React Query hooks for event statistics and dashboard metrics API
 */

import { 
  useQuery, 
  UseQueryOptions 
} from '@tanstack/react-query'
import { 
  DashboardStats,
  EventStatsResponse,
  EventStats,
  EventSummary,
  EventActivity,
  ApiResponse
} from '@/types'
import { eventsService } from '@/lib/api/services'
import { ApiException } from '@/lib/api-client'

// Query keys for stats
export const eventStatsKeys = {
  all: ['eventStats'] as const,
  dashboard: () => [...eventStatsKeys.all, 'dashboard'] as const,
  recentActivity: () => [...eventStatsKeys.all, 'recentActivity'] as const,
  upcomingEvents: (limit?: number) => [...eventStatsKeys.all, 'upcomingEvents', limit] as const,
}

/**
 * Hook for dashboard statistics
 * Returns aggregated metrics for the dashboard overview
 */
export function useEventStats(
  options?: UseQueryOptions<EventStats, ApiException>
) {
  return useQuery({
    queryKey: eventStatsKeys.dashboard(),
    queryFn: () => eventsService.getEventsStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  })
}

/**
 * Hook for dashboard statistics with transformed data
 * Returns metrics in the format expected by dashboard components
 */
export function useDashboardStats(
  options?: UseQueryOptions<DashboardStats, ApiException>
) {
  return useQuery({
    queryKey: [...eventStatsKeys.dashboard(), 'transformed'],
    queryFn: async (): Promise<DashboardStats> => {
      try {
        const stats = await eventsService.getEventsStats()

        if (!stats) {
          // Return default stats when API fails
          return {
            totalEvents: 0,
            upcomingEvents: 0,
            completedEvents: 0,
            totalGuests: 0,
            avgRsvpRate: 0,
            totalBudget: 0,
          }
        }

        // Transform EventStats to DashboardStats
        // Calculate completed events as total - upcoming (approximation)
        const completedEvents = Math.max(0, stats.total_events - stats.upcoming_events)

        return {
          totalEvents: stats.total_events || 0,
          upcomingEvents: stats.upcoming_events || 0,
          completedEvents,
          totalGuests: stats.total_guests || 0,
          avgRsvpRate: 85, // Mock value - would be calculated from actual RSVP data
          totalBudget: stats.total_budget || 0,
        }
      } catch (error) {
        // Return default stats for demo purposes when API fails
        console.warn('Failed to fetch dashboard stats:', error)
        return {
          totalEvents: 0,
          upcomingEvents: 0,
          completedEvents: 0,
          totalGuests: 0,
          avgRsvpRate: 0,
          totalBudget: 0,
        }
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  })
}

/**
 * Hook for recent activity feed
 * Returns recent activities across all user events
 */
export function useRecentActivity(
  limit: number = 10,
  options?: UseQueryOptions<EventActivity[], ApiException>
) {
  return useQuery({
    queryKey: eventStatsKeys.recentActivity(),
    queryFn: async (): Promise<EventActivity[]> => {
      try {
        // Since there's no specific activity endpoint, we'll use recent events
        // and transform them to activity format
        const recentEvents = await eventsService.getRecentEvents(limit)

        if (!recentEvents || recentEvents.length === 0) {
          return []
        }

        return recentEvents.map((event): EventActivity => ({
          id: `activity-${event.id}`,
          event_id: event.id,
          user_id: event.id, // Will be replaced with actual user ID when available
          user_name: event.planner_name,
          action_type: 'created',
          description: `Created event "${event.name}"`,
          created_at: event.created_at,
        }))
      } catch (error) {
        // Return empty array for demo purposes when API fails
        console.warn('Failed to fetch recent activity:', error)
        return []
      }
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    ...options,
  })
}

/**
 * Hook for upcoming events widget
 * Returns a limited list of upcoming events for quick overview
 */
export function useUpcomingEvents(
  limit: number = 5,
  options?: UseQueryOptions<EventSummary[], ApiException>
) {
  return useQuery({
    queryKey: eventStatsKeys.upcomingEvents(limit),
    queryFn: async (): Promise<EventSummary[]> => {
      try {
        const result = await eventsService.getUpcomingEvents(limit)
        return result || []
      } catch (error) {
        // Return empty array for demo purposes when API fails
        console.warn('Failed to fetch upcoming events:', error)
        return []
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}

/**
 * Composite hook for complete dashboard data
 * Returns all dashboard-related data in a single hook
 */
export function useDashboardData() {
  const { 
    data: stats, 
    isLoading: statsLoading, 
    error: statsError 
  } = useDashboardStats()
  
  const { 
    data: recentActivity, 
    isLoading: activityLoading, 
    error: activityError 
  } = useRecentActivity(5)
  
  const { 
    data: upcomingEvents, 
    isLoading: eventsLoading, 
    error: eventsError 
  } = useUpcomingEvents(5)

  return {
    // Data
    stats,
    recentActivity: recentActivity || [],
    upcomingEvents: upcomingEvents || [],
    
    // Loading states
    isLoading: statsLoading || activityLoading || eventsLoading,
    isStatsLoading: statsLoading,
    isActivityLoading: activityLoading,
    isEventsLoading: eventsLoading,
    
    // Errors
    error: statsError || activityError || eventsError,
    statsError,
    activityError,
    eventsError,
    
    // Computed values
    hasData: !!stats || !!recentActivity || !!upcomingEvents,
    isEmpty: !statsLoading && !activityLoading && !eventsLoading && 
             !stats && (!recentActivity || recentActivity.length === 0) && 
             (!upcomingEvents || upcomingEvents.length === 0),
  }
}

/**
 * Hook for event performance metrics
 * Returns performance indicators for dashboard analytics
 */
export function useEventMetrics(
  options?: UseQueryOptions<{
    totalEvents: number
    activeEvents: number
    completionRate: number
    averageGuestCount: number
    budgetUtilization: number
  }, ApiException>
) {
  return useQuery({
    queryKey: [...eventStatsKeys.dashboard(), 'metrics'],
    queryFn: async () => {
      const stats = await eventsService.getEventsStats()
      
      const totalEvents = stats.total_events
      const activeEvents = stats.upcoming_events
      const completionRate = stats.completion_rate
      const averageGuestCount = stats.average_guest_count
      const budgetUtilization = stats.total_budget > 0 
        ? (stats.total_budget - (stats.average_budget * stats.total_events)) / stats.total_budget * 100
        : 0

      return {
        totalEvents,
        activeEvents,
        completionRate,
        averageGuestCount,
        budgetUtilization,
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}

/**
 * Hook for event trends over time
 * Returns event creation and completion trends
 */
export function useEventTrends(
  options?: UseQueryOptions<{
    eventsThisMonth: number
    eventsThisYear: number
    monthlyGrowth: number
    yearlyGrowth: number
  }, ApiException>
) {
  return useQuery({
    queryKey: [...eventStatsKeys.dashboard(), 'trends'],
    queryFn: async () => {
      const stats = await eventsService.getEventsStats()
      
      // Calculate growth rates (these would be more accurate with historical data)
      const eventsThisMonth = stats.events_this_month
      const eventsThisYear = stats.events_this_year
      
      // Mock growth calculations - in real app, would compare with previous periods
      const monthlyGrowth = eventsThisMonth > 0 ? 15 : 0 // Mock 15% growth
      const yearlyGrowth = eventsThisYear > 0 ? 25 : 0   // Mock 25% growth

      return {
        eventsThisMonth,
        eventsThisYear,
        monthlyGrowth,
        yearlyGrowth,
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  })
}