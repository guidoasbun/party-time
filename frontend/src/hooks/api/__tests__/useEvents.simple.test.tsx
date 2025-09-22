/**
 * Simplified tests for useEvents hook without MSW
 */

import { act, waitFor } from '@testing-library/react'
import { renderEventHook } from '../../../../test-utils/eventTestUtils'
import { useEvents, eventKeys } from '../useEvents'
import { mockEvents, createMockPaginatedResponse } from '../../../../__tests__/mocks/eventData'
import { eventsService } from '@/lib/api/services'

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

const mockEventsService = eventsService as jest.Mocked<typeof eventsService>

describe('useEvents (Simplified)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch events successfully', async () => {
    const mockResponse = createMockPaginatedResponse(mockEvents)
    mockEventsService.getEvents.mockResolvedValue(mockResponse)

    const { result } = renderEventHook(() => useEvents())

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockResponse)
    expect(mockEventsService.getEvents).toHaveBeenCalledWith(undefined)
  })

  it('should handle empty results gracefully', async () => {
    const emptyResponse = createMockPaginatedResponse([])
    mockEventsService.getEvents.mockResolvedValue(emptyResponse)

    const { result } = renderEventHook(() => useEvents())

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.items).toEqual([])
    expect(result.current.data?.total).toBe(0)
  })

  it('should handle errors gracefully and return default data', async () => {
    mockEventsService.getEvents.mockRejectedValue(new Error('API Error'))

    const { result } = renderEventHook(() => useEvents())

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    // The hook should return default empty data on error
    expect(result.current.data?.items).toEqual([])
    expect(result.current.data?.total).toBe(0)
  })

  it('should use correct query key', () => {
    // Test the query key function directly instead of from hook result
    const expectedKey = eventKeys.list(undefined)
    expect(expectedKey).toEqual(['events', 'list', undefined])

    // Test with parameters
    const searchParams = { search: 'test', page: 1 }
    const expectedKeyWithParams = eventKeys.list(searchParams)
    expect(expectedKeyWithParams).toEqual(['events', 'list', searchParams])
  })

  it('should pass search parameters to service', async () => {
    const searchParams = {
      search: 'wedding',
      page: 1,
      limit: 10
    }

    mockEventsService.getEvents.mockResolvedValue(createMockPaginatedResponse(mockEvents))

    const { result } = renderEventHook(() => useEvents(searchParams))

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockEventsService.getEvents).toHaveBeenCalledWith(searchParams)
  })
})

describe('Query Key Functions', () => {
  it('should generate correct query keys', () => {
    expect(eventKeys.all).toEqual(['events'])
    expect(eventKeys.lists()).toEqual(['events', 'list'])
    expect(eventKeys.list({ search: 'test' })).toEqual(['events', 'list', { search: 'test' }])
    expect(eventKeys.details()).toEqual(['events', 'detail'])
    expect(eventKeys.detail('123')).toEqual(['events', 'detail', '123'])
    expect(eventKeys.stats()).toEqual(['events', 'stats'])
    expect(eventKeys.userStats('user123')).toEqual(['events', 'stats', 'user123'])
  })
})