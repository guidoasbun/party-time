/**
 * Tests for useEvents hook and related event API hooks
 */

import { act, waitFor } from '@testing-library/react'
import { server } from '../../../../__tests__/mocks/server'
import { http, HttpResponse } from 'msw'
import { renderEventHook, mockAuthenticatedRequest, mockServerError } from '../../../../__tests__/eventTestUtils'
import {
  useEvents,
  useInfiniteEvents,
  useEvent,
  useEventAnalytics,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
  useDuplicateEvent,
  useArchiveEvent,
  useEventManagement,
  useEventsOverview,
  useEventForm,
  eventKeys
} from '../useEvents'
import {
  mockEvents,
  createMockEvent,
  createMockEventAnalytics,
  createMockPaginatedResponse,
  mockApiError,
  mockNotFoundError,
  mockValidationError
} from '../../../../__tests__/mocks/eventData'
import { EventType, EventStatus, EventSearchParams, EventCreate, EventUpdate } from '@/types'

// Mock the events service
jest.mock('@/lib/api/services', () => ({
  eventsService: {
    getEvents: jest.fn(),
    getEvent: jest.fn(),
    getEventAnalytics: jest.fn(),
    createEvent: jest.fn(),
    updateEvent: jest.fn(),
    deleteEvent: jest.fn(),
    duplicateEvent: jest.fn(),
    archiveEvent: jest.fn(),
  }
}))

describe('Event Query Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    server.resetHandlers()
  })

  describe('useEvents', () => {
    it('should fetch events successfully', async () => {
      const mockResponse = createMockPaginatedResponse(mockEvents)

      const { result, queryClient } = renderEventHook(() => useEvents())

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockResponse)
      expect(result.current.error).toBeNull()
    })

    it('should handle search parameters', async () => {
      const searchParams: EventSearchParams = {
        search: 'wedding',
        type: [EventType.WEDDING],
        status: [EventStatus.PLANNING],
        page: 1,
        limit: 10
      }

      const { result } = renderEventHook(() => useEvents(searchParams))

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // The mock handler should filter results based on search params
      expect(result.current.data?.items).toBeDefined()
    })

    it('should handle empty results gracefully', async () => {
      server.use(
        http.get('http://localhost:8000/api/v1/events', () => {
          return HttpResponse.json(createMockPaginatedResponse([]))
        })
      )

      const { result } = renderEventHook(() => useEvents())

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.items).toEqual([])
      expect(result.current.data?.total).toBe(0)
    })

    it('should handle network errors gracefully', async () => {
      const { result } = renderEventHook(() => useEvents({ search: 'network-error' }))

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeDefined()
    })

    it('should use correct query key', () => {
      const params: EventSearchParams = { search: 'test', page: 1 }
      const { result } = renderEventHook(() => useEvents(params))

      expect(result.current.queryKey).toEqual(eventKeys.list(params))
    })
  })

  describe('useInfiniteEvents', () => {
    it('should fetch infinite events successfully', async () => {
      const { result } = renderEventHook(() => useInfiniteEvents())

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.pages).toBeDefined()
      expect(result.current.hasNextPage).toBeDefined()
    })

    it('should handle pagination correctly', async () => {
      const { result } = renderEventHook(() => useInfiniteEvents({ limit: 2 }))

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // Test fetching next page
      if (result.current.hasNextPage) {
        await act(async () => {
          await result.current.fetchNextPage()
        })

        expect(result.current.data?.pages.length).toBeGreaterThan(1)
      }
    })
  })

  describe('useEvent', () => {
    const eventId = 'event-1'

    it('should fetch single event successfully', async () => {
      const { result } = renderEventHook(() => useEvent(eventId))

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeDefined()
      expect(result.current.data?.id).toBe(eventId)
    })

    it('should handle not found error', async () => {
      const { result } = renderEventHook(() => useEvent('not-found'))

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeDefined()
    })

    it('should not fetch when id is empty', () => {
      const { result } = renderEventHook(() => useEvent(''))

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  describe('useEventAnalytics', () => {
    const eventId = 'event-1'

    it('should fetch event analytics successfully', async () => {
      const { result } = renderEventHook(() => useEventAnalytics(eventId))

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeDefined()
      expect(result.current.data?.rsvp_rates).toBeDefined()
      expect(result.current.data?.budget_performance).toBeDefined()
    })

    it('should not fetch when eventId is empty', () => {
      const { result } = renderEventHook(() => useEventAnalytics(''))

      expect(result.current.fetchStatus).toBe('idle')
    })
  })
})

describe('Event Mutation Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    server.resetHandlers()
  })

  describe('useCreateEvent', () => {
    it('should create event successfully', async () => {
      const { result, queryClient } = renderEventHook(() => useCreateEvent())

      const newEventData: EventCreate = {
        name: 'New Test Event',
        type: EventType.BIRTHDAY,
        start_date: '2024-12-01T18:00:00Z',
        is_public: false
      }

      await act(async () => {
        result.current.mutate(newEventData)
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeDefined()
      expect(result.current.data?.name).toBe(newEventData.name)

      // Should invalidate events list
      const eventsQuery = queryClient.getQueryCache().find({
        queryKey: eventKeys.lists()
      })
      expect(eventsQuery?.state.isStale).toBe(true)
    })

    it('should handle validation errors', async () => {
      const { result } = renderEventHook(() => useCreateEvent())

      const invalidEventData: EventCreate = {
        name: '', // Invalid: empty name
        type: EventType.BIRTHDAY,
        start_date: '2024-12-01T18:00:00Z',
        is_public: false
      }

      await act(async () => {
        result.current.mutate(invalidEventData)
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeDefined()
    })

    it('should handle server errors', async () => {
      const { result } = renderEventHook(() => useCreateEvent())

      const eventData: EventCreate = {
        name: 'trigger-error', // Special name to trigger server error
        type: EventType.BIRTHDAY,
        start_date: '2024-12-01T18:00:00Z',
        is_public: false
      }

      await act(async () => {
        result.current.mutate(eventData)
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeDefined()
    })
  })

  describe('useUpdateEvent', () => {
    const eventId = 'event-1'

    it('should update event successfully', async () => {
      const { result, queryClient } = renderEventHook(() => useUpdateEvent())

      const updateData: EventUpdate = {
        name: 'Updated Event Name',
        status: EventStatus.CONFIRMED
      }

      await act(async () => {
        result.current.mutate({ id: eventId, data: updateData })
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeDefined()
      expect(result.current.data?.name).toBe(updateData.name)

      // Should update specific event cache
      const eventQuery = queryClient.getQueryCache().find({
        queryKey: eventKeys.detail(eventId)
      })
      expect(eventQuery?.state.data).toBeDefined()
    })

    it('should handle not found error', async () => {
      const { result } = renderEventHook(() => useUpdateEvent())

      await act(async () => {
        result.current.mutate({
          id: 'not-found',
          data: { name: 'Test' }
        })
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })
    })
  })

  describe('useDeleteEvent', () => {
    const eventId = 'event-1'

    it('should delete event successfully', async () => {
      const { result, queryClient } = renderEventHook(() => useDeleteEvent())

      await act(async () => {
        result.current.mutate(eventId)
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.message).toBe('Event deleted successfully')

      // Should remove from cache
      const eventQuery = queryClient.getQueryCache().find({
        queryKey: eventKeys.detail(eventId)
      })
      expect(eventQuery).toBeUndefined()
    })

    it('should handle not found error', async () => {
      const { result } = renderEventHook(() => useDeleteEvent())

      await act(async () => {
        result.current.mutate('not-found')
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })
    })
  })

  describe('useDuplicateEvent', () => {
    const eventId = 'event-1'

    it('should duplicate event successfully', async () => {
      const { result, queryClient } = renderEventHook(() => useDuplicateEvent())

      await act(async () => {
        result.current.mutate(eventId)
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeDefined()
      expect(result.current.data?.name).toContain('(Copy)')
      expect(result.current.data?.status).toBe(EventStatus.DRAFT)

      // Should invalidate events list
      const eventsQuery = queryClient.getQueryCache().find({
        queryKey: eventKeys.lists()
      })
      expect(eventsQuery?.state.isStale).toBe(true)
    })
  })

  describe('useArchiveEvent', () => {
    const eventId = 'event-1'

    it('should archive event successfully', async () => {
      const { result, queryClient } = renderEventHook(() => useArchiveEvent())

      await act(async () => {
        result.current.mutate(eventId)
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeDefined()
      expect(result.current.data?.status).toBe(EventStatus.COMPLETED)

      // Should update event cache
      const eventQuery = queryClient.getQueryCache().find({
        queryKey: eventKeys.detail(eventId)
      })
      expect(eventQuery?.state.data).toBeDefined()
    })
  })
})

describe('Composite Event Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    server.resetHandlers()
  })

  describe('useEventManagement', () => {
    const eventId = 'event-1'

    it('should provide event management functionality', async () => {
      const { result } = renderEventHook(() => useEventManagement(eventId))

      await waitFor(() => {
        expect(result.current.event).toBeDefined()
      })

      expect(result.current.updateEvent).toBeInstanceOf(Function)
      expect(result.current.deleteEvent).toBeInstanceOf(Function)
      expect(result.current.archiveEvent).toBeInstanceOf(Function)
      expect(typeof result.current.isLoading).toBe('boolean')
      expect(typeof result.current.isUpdating).toBe('boolean')
      expect(typeof result.current.isDeleting).toBe('boolean')
      expect(typeof result.current.isArchiving).toBe('boolean')
    })

    it('should handle loading state correctly', () => {
      const { result } = renderEventHook(() => useEventManagement(eventId))

      // Initially should be loading
      expect(result.current.isLoading).toBe(true)
    })
  })

  describe('useEventsOverview', () => {
    it('should provide events overview functionality', async () => {
      const { result } = renderEventHook(() => useEventsOverview())

      await waitFor(() => {
        expect(result.current.events).toBeDefined()
      })

      expect(result.current.createEvent).toBeInstanceOf(Function)
      expect(result.current.duplicateEvent).toBeInstanceOf(Function)
      expect(result.current.getEventsByStatus).toBeInstanceOf(Function)
      expect(result.current.getEventsByType).toBeInstanceOf(Function)
      expect(result.current.getUpcomingEvents).toBeInstanceOf(Function)
      expect(result.current.getPastEvents).toBeInstanceOf(Function)
    })

    it('should filter events by status', async () => {
      const { result } = renderEventHook(() => useEventsOverview())

      await waitFor(() => {
        expect(result.current.events.length).toBeGreaterThan(0)
      })

      const planningEvents = result.current.getEventsByStatus(EventStatus.PLANNING)
      expect(Array.isArray(planningEvents)).toBe(true)
    })

    it('should filter events by type', async () => {
      const { result } = renderEventHook(() => useEventsOverview())

      await waitFor(() => {
        expect(result.current.events.length).toBeGreaterThan(0)
      })

      const weddingEvents = result.current.getEventsByType(EventType.WEDDING)
      expect(Array.isArray(weddingEvents)).toBe(true)
    })

    it('should get upcoming and past events', async () => {
      const { result } = renderEventHook(() => useEventsOverview())

      await waitFor(() => {
        expect(result.current.events.length).toBeGreaterThan(0)
      })

      const upcomingEvents = result.current.getUpcomingEvents()
      const pastEvents = result.current.getPastEvents()

      expect(Array.isArray(upcomingEvents)).toBe(true)
      expect(Array.isArray(pastEvents)).toBe(true)
    })
  })

  describe('useEventForm', () => {
    it('should work for creating new event', async () => {
      const { result } = renderEventHook(() => useEventForm())

      expect(result.current.event).toBeUndefined()
      expect(result.current.submitEvent).toBeInstanceOf(Function)
      expect(typeof result.current.isSubmitting).toBe('boolean')
      expect(result.current.isSuccess).toBe(false)
    })

    it('should work for editing existing event', async () => {
      const eventId = 'event-1'
      const { result } = renderEventHook(() => useEventForm(eventId))

      await waitFor(() => {
        expect(result.current.event).toBeDefined()
      })

      expect(result.current.event?.id).toBe(eventId)
      expect(result.current.submitEvent).toBeInstanceOf(Function)
    })

    it('should handle form submission for new event', async () => {
      const { result } = renderEventHook(() => useEventForm())

      const eventData: EventCreate = {
        name: 'Form Test Event',
        type: EventType.BIRTHDAY,
        start_date: '2024-12-01T18:00:00Z',
        is_public: false
      }

      await act(async () => {
        result.current.submitEvent(eventData)
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })
    })

    it('should handle form submission for existing event', async () => {
      const eventId = 'event-1'
      const { result } = renderEventHook(() => useEventForm(eventId))

      await waitFor(() => {
        expect(result.current.event).toBeDefined()
      })

      const updateData: EventUpdate = {
        name: 'Updated Form Event',
        status: EventStatus.CONFIRMED
      }

      await act(async () => {
        result.current.submitEvent(updateData)
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })
    })
  })
})