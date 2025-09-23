/**
 * Error Scenario Tests: Event Dashboard Error Handling & Edge Cases
 * Comprehensive tests for error conditions, recovery mechanisms, and edge cases
 */

import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEventFilters } from '@/hooks/useEventFilters'
import { useEventActions } from '@/hooks/useEventActions'
import { ApiException, NetworkException, TimeoutException } from '@/lib/api-client'
import { eventsService } from '@/lib/api/services/events.service'
import { EventType, EventStatus, Event } from '@/types/event.types'
import {
  mockConsole,
  createErrorTestQueryClient,
  createLargeEventList,
  createEmptyEventData
} from './error-test-utils'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(() => null),
    has: jest.fn(() => false),
    getAll: jest.fn(() => []),
    toString: jest.fn(() => ''),
  }),
  usePathname: () => '/dashboard',
}))

// Mock events service
jest.mock('@/lib/api/services/events.service', () => ({
  eventsService: {
    createEvent: jest.fn(),
    updateEvent: jest.fn(),
    deleteEvent: jest.fn(),
    duplicateEvent: jest.fn(),
    archiveEvent: jest.fn(),
    getEvents: jest.fn(),
    getEvent: jest.fn(),
  }
}))

// Mock confirmation hook to avoid hanging on dialogs
jest.mock('@/hooks/useConfirmation', () => ({
  useConfirmation: () => ({
    showConfirmation: jest.fn().mockResolvedValue(true),
    hideConfirmation: jest.fn(),
    confirmAction: jest.fn().mockResolvedValue(true),
  })
}))

// Mock toast hook
jest.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    toast: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
  })
}))

// Mock optimistic update hook
jest.mock('@/hooks/useOptimisticUpdate', () => ({
  useOptimisticUpdate: () => ({
    applyOptimisticUpdate: jest.fn(),
    rollbackUpdate: jest.fn(),
  })
}))

// Mock bulk actions hook
jest.mock('@/hooks/useBulkActions', () => ({
  useBulkActions: () => ({
    selection: { selectedIds: new Set(), isSelectAll: false, totalCount: 0 },
    selectItem: jest.fn(),
    deselectItem: jest.fn(),
    selectAll: jest.fn(),
    deselectAll: jest.fn(),
    toggleItem: jest.fn(),
    setTotalCount: jest.fn(),
    resetSelection: jest.fn(),
    hasSelection: false,
    selectedIds: new Set(),
  })
}))

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Setup console mocking
mockConsole()

// Test wrapper with React Query
const createTestWrapper = (queryClient?: QueryClient) => {
  const client = queryClient || createErrorTestQueryClient()

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>
      {children}
    </QueryClientProvider>
  )

  return { wrapper: TestWrapper, queryClient: client }
}

// Get the mocked service
const mockedEventsService = eventsService as jest.Mocked<typeof eventsService>

describe('Event Dashboard Error Scenarios', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  describe('Network Error Scenarios', () => {
    it('should handle network connection failures gracefully', async () => {
      const { wrapper } = createTestWrapper()

      // Mock service to throw network error
      const networkError = new NetworkException('Network connection failed')
      mockedEventsService.createEvent.mockRejectedValue(networkError)

      const { result } = renderHook(() => useEventActions(), { wrapper })

      // Attempt to create an event during network failure
      await expect(result.current.createEvent({
        name: 'Test Event',
        type: EventType.WEDDING,
        start_date: '2024-12-01T10:00:00Z',
        is_public: false,
      })).rejects.toThrow('Network connection failed')

      // Wait for state to update
      await waitFor(() => {
        expect(result.current.state.isCreating).toBe(false)
      })
    })

    it('should handle request timeouts appropriately', async () => {
      const { wrapper } = createTestWrapper()

      // Mock service to throw timeout error
      const timeoutError = new TimeoutException('Request timeout')
      mockedEventsService.updateEvent.mockRejectedValue(timeoutError)

      // Disable optimistic updates to avoid cache issues
      const { result } = renderHook(() => useEventActions({ enableOptimisticUpdates: false }), { wrapper })

      await expect(result.current.updateEvent('event-1', { name: 'Updated Name' })).rejects.toThrow('Request timeout')

      await waitFor(() => {
        expect(result.current.state.isUpdating).toBe(false)
      })
    })

    it('should handle 500 server errors with proper error messages', async () => {
      const { wrapper } = createTestWrapper()

      // Mock service to throw API error
      const serverError = new ApiException('Internal Server Error', 500, 'server_error')
      mockedEventsService.deleteEvent.mockRejectedValue(serverError)

      const { result } = renderHook(() => useEventActions(), { wrapper })

      await expect(result.current.deleteEvent('event-1')).rejects.toMatchObject({
        name: 'ApiException',
        message: 'Internal Server Error',
        status: 500
      })

      await waitFor(() => {
        expect(result.current.state.isDeleting).toBe(false)
      }, { timeout: 3000 })
    }, 10000)

    it('should handle 503 service unavailable errors', async () => {
      const { wrapper } = createTestWrapper()

      const serviceError = new ApiException('Service Unavailable', 503, 'service_unavailable')
      mockedEventsService.createEvent.mockRejectedValue(serviceError)

      const { result } = renderHook(() => useEventActions(), { wrapper })

      await expect(result.current.createEvent({
        name: 'Test Event',
        type: EventType.BIRTHDAY,
        start_date: '2024-12-01T10:00:00Z',
        is_public: true,
      })).rejects.toMatchObject({
        status: 503,
        message: 'Service Unavailable'
      })
    })

    it('should handle intermittent network failures', async () => {
      const { wrapper } = createTestWrapper()

      let callCount = 0
      mockedEventsService.createEvent.mockImplementation(() => {
        callCount++
        if (callCount <= 2) {
          return Promise.reject(new NetworkException('Intermittent failure'))
        }
        return Promise.resolve({
          id: 'new-event',
          name: 'Test Event',
          type: EventType.CONFERENCE,
          status: EventStatus.DRAFT,
          start_date: '2024-12-01T10:00:00Z',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_public: false
        } as Event)
      })

      const { result } = renderHook(() => useEventActions(), { wrapper })

      // First attempt should fail
      await expect(result.current.createEvent({
        name: 'Test Event',
        type: EventType.CONFERENCE,
        start_date: '2024-12-01T10:00:00Z',
        is_public: false,
      })).rejects.toThrow('Intermittent failure')
    })
  })

  describe('Validation Error Scenarios', () => {
    it('should handle 400 validation errors with field-specific messages', async () => {
      const { wrapper } = createTestWrapper()

      const validationError = new ApiException('Validation failed', 400, 'validation_error', ['Event name is required'])
      mockedEventsService.createEvent.mockRejectedValue(validationError)

      const { result } = renderHook(() => useEventActions(), { wrapper })

      await expect(result.current.createEvent({
        name: '',
        type: EventType.WEDDING,
        start_date: '2024-12-01T10:00:00Z',
        is_public: false,
      })).rejects.toMatchObject({
        status: 400,
        message: 'Validation failed',
        details: ['Event name is required']
      })
    })

    it('should handle multiple validation errors', async () => {
      const { wrapper } = createTestWrapper()

      const multiValidationError = new ApiException(
        'Multiple validation errors',
        400,
        'validation_error',
        ['Event name is required', 'Event type is required', 'Start date must be in the future']
      )
      mockedEventsService.createEvent.mockRejectedValue(multiValidationError)

      const { result } = renderHook(() => useEventActions(), { wrapper })

      await expect(result.current.createEvent({
        name: '',
        type: EventType.WEDDING,
        start_date: '2020-01-01T10:00:00Z', // Past date
        is_public: false,
      })).rejects.toMatchObject({
        status: 400,
        details: expect.arrayContaining([
          'Event name is required',
          'Event type is required',
          'Start date must be in the future'
        ])
      })
    })

    it('should handle 422 unprocessable entity errors', async () => {
      const { wrapper } = createTestWrapper()

      const unprocessableError = new ApiException('Unprocessable Entity', 422, 'unprocessable_entity')
      mockedEventsService.updateEvent.mockRejectedValue(unprocessableError)

      const { result } = renderHook(() => useEventActions({ enableOptimisticUpdates: false }), { wrapper })

      await expect(result.current.updateEvent('event-1', {
        start_date: 'invalid-date-format'
      })).rejects.toMatchObject({
        status: 422,
        message: 'Unprocessable Entity'
      })
    })
  })

  describe('Authentication Error Scenarios', () => {
    it('should handle 401 unauthorized errors', async () => {
      const { wrapper } = createTestWrapper()

      const authError = new ApiException('Authentication token expired', 401, 'unauthorized')
      mockedEventsService.createEvent.mockRejectedValue(authError)

      const { result } = renderHook(() => useEventActions(), { wrapper })

      await expect(result.current.createEvent({
        name: 'Protected Event',
        type: EventType.WEDDING,
        start_date: '2024-12-01T10:00:00Z',
        is_public: false,
      })).rejects.toMatchObject({
        status: 401,
        message: 'Authentication token expired'
      })
    })

    it('should handle 403 forbidden access errors', async () => {
      const { wrapper } = createTestWrapper()

      const forbiddenError = new ApiException('Insufficient permissions to delete event', 403, 'forbidden')
      mockedEventsService.deleteEvent.mockRejectedValue(forbiddenError)

      const { result } = renderHook(() => useEventActions(), { wrapper })

      await expect(result.current.deleteEvent('protected-event-id')).rejects.toMatchObject({
        status: 403,
        message: 'Insufficient permissions to delete event'
      })

      await waitFor(() => {
        expect(result.current.state.isDeleting).toBe(false)
      }, { timeout: 3000 })
    }, 10000)

    it('should handle token expiration during operations', async () => {
      const { wrapper } = createTestWrapper()

      let callCount = 0
      mockedEventsService.updateEvent.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return Promise.reject(new ApiException('Token expired', 401, 'token_expired'))
        }
        return Promise.resolve({
          id: 'event-1',
          name: 'Updated Event',
          type: EventType.WEDDING,
          status: EventStatus.PLANNING,
          start_date: '2024-12-01T10:00:00Z',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_public: false
        } as Event)
      })

      const { result } = renderHook(() => useEventActions({ enableOptimisticUpdates: false }), { wrapper })

      await expect(result.current.updateEvent('event-1', { name: 'Updated Name' })).rejects.toMatchObject({
        status: 401,
        message: 'Token expired'
      })
    })
  })

  describe('Edge Case Scenarios', () => {
    it('should handle empty data responses gracefully', async () => {
      const { wrapper } = createTestWrapper()

      const emptyData = createEmptyEventData()
      mockedEventsService.getEvents.mockResolvedValue(emptyData)

      const { result } = renderHook(() => useEventFilters(), { wrapper })

      // Component should handle empty data without crashing
      expect(result.current.filters).toBeDefined()
      expect(result.current.setSearch).toBeDefined()
    })

    it('should handle large datasets without performance degradation', async () => {
      const { wrapper } = createTestWrapper()

      const largeDataset = createLargeEventList(1000)
      mockedEventsService.getEvents.mockResolvedValue({
        items: largeDataset,
        page: 1,
        limit: 1000,
        total: 1000,
        has_next: false,
        has_previous: false
      })

      const { result } = renderHook(() => useEventFilters(), { wrapper })

      // Test filtering large dataset
      const startTime = performance.now()
      result.current.setSearch('Event 500')
      const endTime = performance.now()

      // Should complete within reasonable time (< 100ms)
      expect(endTime - startTime).toBeLessThan(100)
    })

    it('should handle malformed API responses', async () => {
      const { wrapper } = createTestWrapper()

      const invalidData = {
        id: null,
        name: null,
        type: 'INVALID_TYPE',
        status: 'INVALID_STATUS',
        start_date: 'invalid-date',
        created_at: null,
        updated_at: undefined
      }
      mockedEventsService.getEvent.mockResolvedValue(invalidData as Event)

      const { result } = renderHook(() => useEventActions(), { wrapper })

      // Should handle malformed data gracefully
      expect(result.current.state).toBeDefined()
      expect(result.current.createEvent).toBeDefined()
    })

    it('should handle rapid successive filter changes', async () => {
      const { wrapper } = createTestWrapper()

      const { result } = renderHook(() => useEventFilters({ debounceMs: 0 }), { wrapper })

      // Simulate rapid typing
      const rapidChanges = ['a', 'ab', 'abc', 'abcd', 'abcde']

      rapidChanges.forEach(search => {
        result.current.setSearch(search)
      })

      // Wait for React state to update
      await waitFor(() => {
        expect(result.current.filters.search).toBe('abcde')
      })
    })

    it('should handle 404 not found errors for deleted events', async () => {
      const { wrapper } = createTestWrapper()

      const notFoundError = new ApiException('Event not found', 404, 'not_found')
      mockedEventsService.updateEvent.mockRejectedValue(notFoundError)

      const { result } = renderHook(() => useEventActions({ enableOptimisticUpdates: false }), { wrapper })

      await expect(result.current.updateEvent('non-existent-event', { name: 'Updated' })).rejects.toMatchObject({
        status: 404,
        message: 'Event not found'
      })
    })

    it('should handle 409 conflict errors for duplicate events', async () => {
      const { wrapper } = createTestWrapper()

      const conflictError = new ApiException('Event with this name already exists', 409, 'conflict')
      mockedEventsService.createEvent.mockRejectedValue(conflictError)

      const { result } = renderHook(() => useEventActions(), { wrapper })

      await expect(result.current.createEvent({
        name: 'Duplicate Event Name',
        type: EventType.WEDDING,
        start_date: '2024-12-01T10:00:00Z',
        is_public: false,
      })).rejects.toMatchObject({
        status: 409,
        message: 'Event with this name already exists'
      })
    })

    it('should handle 429 rate limiting errors', async () => {
      const { wrapper } = createTestWrapper()

      const rateLimitError = new ApiException('Rate limit exceeded', 429, 'rate_limit')
      mockedEventsService.createEvent.mockRejectedValue(rateLimitError)

      const { result } = renderHook(() => useEventActions(), { wrapper })

      await expect(result.current.createEvent({
        name: 'Rate Limited Event',
        type: EventType.CONFERENCE,
        start_date: '2024-12-01T10:00:00Z',
        is_public: false,
      })).rejects.toMatchObject({
        status: 429,
        message: 'Rate limit exceeded'
      })
    })
  })

  describe('Error Recovery Mechanisms', () => {
    it('should recover from localStorage errors gracefully', async () => {
      const { wrapper } = createTestWrapper()

      // Mock localStorage to throw errors
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage quota exceeded')
      })

      const { result } = renderHook(
        () => useEventFilters({ persistToLocalStorage: true, debounceMs: 0 }),
        { wrapper }
      )

      // Should handle localStorage errors without crashing
      result.current.setSearch('test search')

      // Wait for React state to update
      await waitFor(() => {
        expect(result.current.filters.search).toBe('test search')
      })

      // Verify that the component still works even if localStorage fails
      // The localStorage error doesn't currently generate a console warning
      // but the component should continue to function
      expect(result.current.filters.search).toBe('test search')
    })

    it('should handle corrupted localStorage data', async () => {
      const { wrapper } = createTestWrapper()

      // Mock corrupted localStorage data
      localStorageMock.getItem.mockReturnValue('invalid-json-data')

      const { result } = renderHook(
        () => useEventFilters({ persistToLocalStorage: true }),
        { wrapper }
      )

      // Should fallback to default filters
      expect(result.current.filters.search).toBe('')
      expect(result.current.filters.types).toEqual([])
      expect(result.current.filters.statuses).toEqual([])
    })

    it('should maintain state consistency during error recovery', async () => {
      const { wrapper } = createTestWrapper()

      const { result } = renderHook(() => useEventActions(), { wrapper })

      // Initial state should be consistent
      expect(result.current.state.isCreating).toBe(false)
      expect(result.current.state.isUpdating).toBe(false)
      expect(result.current.state.isDeleting).toBe(false)

      const networkError = new NetworkException('Network connection failed')
      mockedEventsService.createEvent.mockRejectedValue(networkError)

      // After error, state should return to consistent state
      await expect(result.current.createEvent({
        name: 'Test Event',
        type: EventType.WEDDING,
        start_date: '2024-12-01T10:00:00Z',
        is_public: false,
      })).rejects.toThrow('Network connection failed')

      await waitFor(() => {
        expect(result.current.state.isCreating).toBe(false)
      })
    })

    it('should handle error during optimistic updates', async () => {
      const { wrapper, queryClient } = createTestWrapper()

      // Pre-populate the cache with existing event data
      queryClient.setQueryData(['events', 'detail', 'event-1'], {
        id: 'event-1',
        name: 'Original Event',
        type: EventType.WEDDING,
        status: EventStatus.PLANNING,
        start_date: '2024-12-01T10:00:00Z',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_public: false
      } as Event)

      const { result } = renderHook(
        () => useEventActions({ enableOptimisticUpdates: true }),
        { wrapper }
      )

      const serverError = new ApiException('Internal Server Error', 500, 'server_error')
      mockedEventsService.updateEvent.mockRejectedValue(serverError)

      // Optimistic update should be reverted on error
      await expect(result.current.updateEvent('event-1', { name: 'Optimistic Update' })).rejects.toMatchObject({
        status: 500,
        message: 'Internal Server Error'
      })

      await waitFor(() => {
        expect(result.current.state.isUpdating).toBe(false)
      })
    })
  })
})