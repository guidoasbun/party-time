/**
 * React Query hooks for events API
 */
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment */
// @ts-nocheck

import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions 
} from '@tanstack/react-query'
import { 
  Event, 
  EventCreate, 
  EventUpdate, 
  // EventListResponse,
  EventSearchParams,
  // EventStatsResponse,
  EventType,
  EventStatus
} from '@/types'
import { eventsService } from '@/lib/api/services'
import { ApiResponse } from '@/types/common.types'
import { ApiException } from '@/lib/api-client'

// Query keys
export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (params?: EventSearchParams) => [...eventKeys.lists(), params] as const,
  details: () => [...eventKeys.all, 'detail'] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
  stats: () => [...eventKeys.all, 'stats'] as const,
  userStats: (userId: string) => [...eventKeys.stats(), userId] as const,
}

// Query hooks
export function useEvents(
  params?: EventSearchParams,
  options?: UseQueryOptions<ApiResponse<EventListResponse>, ApiException>
) {
  return useQuery({
    queryKey: eventKeys.list(params),
    queryFn: () => eventsService.getEvents(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}

export function useEvent(
  id: string,
  options?: UseQueryOptions<ApiResponse<Event>, ApiException>
) {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: () => eventsService.getEvent(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}

export function useEventStats(
  eventId: string,
  options?: UseQueryOptions<ApiResponse<EventStatsResponse>, ApiException>
) {
  return useQuery({
    queryKey: [...eventKeys.stats(), eventId],
    queryFn: () => eventsService.getEventStats(eventId),
    enabled: !!eventId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  })
}

export function useUserEventStats(
  userId: string,
  options?: UseQueryOptions<ApiResponse<EventStatsResponse>, ApiException>
) {
  return useQuery({
    queryKey: eventKeys.userStats(userId),
    queryFn: () => eventsService.getUserEventStats(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}

// Mutation hooks
export function useCreateEvent(
  options?: UseMutationOptions<ApiResponse<Event>, ApiException, EventCreate>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: eventsService.createEvent,
    onSuccess: (data) => {
      // Invalidate and refetch events list
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
      
      // Add the new event to the cache
      queryClient.setQueryData(
        eventKeys.detail(data.data.id),
        data
      )

      // Update user stats
      if (data.data.planner_id) {
        queryClient.invalidateQueries({
          queryKey: eventKeys.userStats(data.data.planner_id)
        })
      }
    },
    ...options,
  })
}

export function useUpdateEvent(
  options?: UseMutationOptions<ApiResponse<Event>, ApiException, { id: string; data: EventUpdate }>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => eventsService.updateEvent(id, data),
    onSuccess: (data, variables) => {
      // Update the specific event cache
      queryClient.setQueryData(
        eventKeys.detail(variables.id),
        data
      )

      // Invalidate lists to reflect changes
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
      
      // Invalidate stats if status changed
      queryClient.invalidateQueries({
        queryKey: [...eventKeys.stats(), variables.id]
      })
    },
    ...options,
  })
}

export function useDeleteEvent(
  options?: UseMutationOptions<void, ApiException, string>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: eventsService.deleteEvent,
    onSuccess: (_, eventId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: eventKeys.detail(eventId) })
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
      
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: eventKeys.stats() })
    },
    ...options,
  })
}

export function useDuplicateEvent(
  options?: UseMutationOptions<ApiResponse<Event>, ApiException, string>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: eventsService.duplicateEvent,
    onSuccess: (data) => {
      // Add the duplicated event to cache
      queryClient.setQueryData(
        eventKeys.detail(data.data.id),
        data
      )

      // Invalidate lists to show new event
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
      
      // Update user stats
      if (data.data.planner_id) {
        queryClient.invalidateQueries({
          queryKey: eventKeys.userStats(data.data.planner_id)
        })
      }
    },
    ...options,
  })
}

export function useArchiveEvent(
  options?: UseMutationOptions<ApiResponse<Event>, ApiException, string>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: eventsService.archiveEvent,
    onSuccess: (data, eventId) => {
      // Update event cache
      queryClient.setQueryData(
        eventKeys.detail(eventId),
        data
      )

      // Invalidate lists to reflect archived status
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
    },
    ...options,
  })
}

// Composite hooks
export function useEventManagement(eventId: string) {
  const { data: event, isLoading: eventLoading, error: eventError } = useEvent(eventId)
  const { data: stats, isLoading: statsLoading } = useEventStats(eventId)
  
  const updateMutation = useUpdateEvent({
    onSuccess: () => {
      // Optional: Show success toast
    },
    onError: (error) => {
      console.error('Failed to update event:', error)
    }
  })

  const deleteMutation = useDeleteEvent({
    onSuccess: () => {
      // Optional: Navigate away or show success message
    },
    onError: (error) => {
      console.error('Failed to delete event:', error)
    }
  })

  const archiveMutation = useArchiveEvent({
    onError: (error) => {
      console.error('Failed to archive event:', error)
    }
  })

  return {
    event: event?.data,
    stats: stats?.data,
    isLoading: eventLoading || statsLoading,
    error: eventError,
    updateEvent: updateMutation.mutate,
    deleteEvent: deleteMutation.mutate,
    archiveEvent: archiveMutation.mutate,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isArchiving: archiveMutation.isPending,
  }
}

export function useEventsOverview(params?: EventSearchParams) {
  const { data: events, isLoading, error, refetch } = useEvents(params)
  
  const createMutation = useCreateEvent({
    onSuccess: () => {
      // Optional: Show success toast
    },
    onError: (error) => {
      console.error('Failed to create event:', error)
    }
  })

  const duplicateMutation = useDuplicateEvent({
    onSuccess: () => {
      // Optional: Show success toast
    },
    onError: (error) => {
      console.error('Failed to duplicate event:', error)
    }
  })

  // Helper functions
  const getEventsByStatus = (status: EventStatus) => {
    return events?.data.events.filter(event => event.status === status) || []
  }

  const getEventsByType = (type: EventType) => {
    return events?.data.events.filter(event => event.type === type) || []
  }

  const getUpcomingEvents = () => {
    const now = new Date()
    return events?.data.events.filter(event => new Date(event.start_date) > now) || []
  }

  const getPastEvents = () => {
    const now = new Date()
    return events?.data.events.filter(event => new Date(event.start_date) <= now) || []
  }

  return {
    events: events?.data.events || [],
    pagination: events?.data.pagination,
    isLoading,
    error,
    refetch,
    createEvent: createMutation.mutate,
    duplicateEvent: duplicateMutation.mutate,
    isCreating: createMutation.isPending,
    isDuplicating: duplicateMutation.isPending,
    // Helper methods
    getEventsByStatus,
    getEventsByType,
    getUpcomingEvents,
    getPastEvents,
  }
}

// Form helpers
export function useEventForm(eventId?: string) {
  const { data: event } = useEvent(eventId || '', { enabled: !!eventId })
  
  const createMutation = useCreateEvent()
  const updateMutation = useUpdateEvent()

  const submitEvent = (data: EventCreate | EventUpdate) => {
    if (eventId) {
      updateMutation.mutate({ id: eventId, data: data as EventUpdate })
    } else {
      createMutation.mutate(data as EventCreate)
    }
  }

  return {
    event: event?.data,
    submitEvent,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
    error: createMutation.error || updateMutation.error,
    isSuccess: createMutation.isSuccess || updateMutation.isSuccess,
  }
}