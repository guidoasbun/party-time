/**
 * React Query hooks for events API
 */

import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  useInfiniteQuery,
  UseQueryOptions,
  UseMutationOptions,
  UseInfiniteQueryOptions
} from '@tanstack/react-query'
import { 
  Event, 
  EventCreate, 
  EventUpdate, 
  EventListResponse,
  EventSearchParams,
  EventStatsResponse,
  EventType,
  EventStatus,
  EventSummary,
  EventAnalytics,
  PaginatedResponse,
  ApiResponse
} from '@/types'
import { eventsService } from '@/lib/api/services'
import { ApiException } from '@/lib/api-client'

// Query keys
export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (params?: EventSearchParams) => [...eventKeys.lists(), params] as const,
  details: () => [...eventKeys.all, 'detail'] as const,
  detail: (id: string, includeRelations?: boolean) => [...eventKeys.details(), id, { includeRelations }] as const,
  stats: () => [...eventKeys.all, 'stats'] as const,
  userStats: (userId: string) => [...eventKeys.stats(), userId] as const,
}

// Query hooks
export function useEvents(
  params?: EventSearchParams,
  options?: UseQueryOptions<PaginatedResponse<EventSummary>, ApiException>
) {
  return useQuery({
    queryKey: eventKeys.list(params),
    queryFn: async (): Promise<PaginatedResponse<EventSummary>> => {
      console.log('[useEvents] Fetching events with params:', params)
      const result = await eventsService.getEvents(params)
      console.log('[useEvents] Received events:', result)
      return result || {
        items: [],
        page: 1,
        limit: 10,
        total: 0,
        has_next: false,
        has_previous: false
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}

// Infinite query for pagination
export function useInfiniteEvents(
  params?: Omit<EventSearchParams, 'page' | 'offset'>,
  options?: UseInfiniteQueryOptions<PaginatedResponse<EventSummary>, ApiException>
) {
  return useInfiniteQuery({
    queryKey: [...eventKeys.lists(), 'infinite', params],
    queryFn: ({ pageParam }) => {
      const queryParams: EventSearchParams = {
        page: pageParam as number,
        limit: (params?.limit as number) || 20,
        ...params
      }
      return eventsService.getEvents(queryParams)
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.has_next 
        ? lastPage.page + 1 
        : undefined
    },
    getPreviousPageParam: (firstPage) => {
      return firstPage.has_previous 
        ? firstPage.page - 1 
        : undefined
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}

export function useEvent(
  id: string,
  includeRelations: boolean = true,
  options?: UseQueryOptions<Event, ApiException>
) {
  return useQuery({
    queryKey: eventKeys.detail(id, includeRelations),
    queryFn: () => eventsService.getEvent(id, includeRelations),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}

export function useEventAnalytics(
  eventId: string,
  options?: UseQueryOptions<EventAnalytics, ApiException>
) {
  return useQuery({
    queryKey: [...eventKeys.stats(), eventId],
    queryFn: () => eventsService.getEventAnalytics(eventId),
    enabled: !!eventId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  })
}

// Mutation hooks
export function useCreateEvent(
  options?: UseMutationOptions<Event, ApiException, EventCreate>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: eventsService.createEvent,
    onSuccess: (data) => {
      // Invalidate and refetch events list
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
      
      // Add the new event to the cache
      queryClient.setQueryData(
        eventKeys.detail(data.id),
        data
      )

      // Update user stats
      if (data.planner_id) {
        queryClient.invalidateQueries({
          queryKey: eventKeys.userStats(data.planner_id)
        })
      }
    },
    ...options,
  })
}

export function useUpdateEvent(
  options?: UseMutationOptions<Event, ApiException, { id: string; data: EventUpdate }, { previousEvent: Event | undefined }>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => eventsService.updateEvent(id, data),
    // Optimistically update the cache before the server responds
    onMutate: async ({ id, data }): Promise<{ previousEvent: Event | undefined }> => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: eventKeys.detail(id) })

      // Snapshot the previous value
      const previousEvent = queryClient.getQueryData<Event>(eventKeys.detail(id))

      // Optimistically update to the new value
      if (previousEvent) {
        queryClient.setQueryData<Event>(
          eventKeys.detail(id),
          { ...previousEvent, ...data }
        )
      }

      // Return a context with the previous value for rollback
      return { previousEvent }
    },
    onSuccess: (data, variables) => {
      // Update the specific event cache with server response
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
    // Rollback on error
    onError: (error, variables, context) => {
      // Restore previous value if the update fails
      if (context?.previousEvent) {
        queryClient.setQueryData(
          eventKeys.detail(variables.id),
          context.previousEvent
        )
      }
    },
    ...options,
  })
}

export function useDeleteEvent(
  options?: UseMutationOptions<{ message: string }, ApiException, string>
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
  options?: UseMutationOptions<Event, ApiException, string>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: eventsService.duplicateEvent,
    onSuccess: (data) => {
      // Add the duplicated event to cache
      queryClient.setQueryData(
        eventKeys.detail(data.id),
        data
      )

      // Invalidate lists to show new event
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
      
      // Update user stats
      if (data.planner_id) {
        queryClient.invalidateQueries({
          queryKey: eventKeys.userStats(data.planner_id)
        })
      }
    },
    ...options,
  })
}

export function useArchiveEvent(
  options?: UseMutationOptions<Event, ApiException, string>
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
export function useEventManagement(eventId: string, includeRelations: boolean = true) {
  const { data: event, isLoading: eventLoading, error: eventError } = useEvent(eventId, includeRelations)
  const { data: stats, isLoading: statsLoading } = useEventAnalytics(eventId)
  
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
    event,
    stats,
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
    return events?.items.filter(event => event.status === status) || []
  }

  const getEventsByType = (type: EventType) => {
    return events?.items.filter(event => event.type === type) || []
  }

  const getUpcomingEvents = () => {
    const now = new Date()
    return events?.items.filter(event => new Date(event.start_date) > now) || []
  }

  const getPastEvents = () => {
    const now = new Date()
    return events?.items.filter(event => new Date(event.start_date) <= now) || []
  }

  return {
    events: events?.items || [],
    pagination: events ? {
      page: events.page,
      limit: events.limit, 
      total: events.total,
      has_next: events.has_next,
      has_previous: events.has_previous
    } : undefined,
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
  const eventQuery = useEvent(eventId || '', false, {
    enabled: !!eventId
  } as UseQueryOptions<Event, ApiException>)
  const { data: event } = eventQuery
  
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
    event,
    submitEvent,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
    error: createMutation.error || updateMutation.error,
    isSuccess: createMutation.isSuccess || updateMutation.isSuccess,
  }
}