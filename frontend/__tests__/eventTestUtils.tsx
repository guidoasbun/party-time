/**
 * Event-specific test utilities
 */

import React, { ReactNode } from 'react'
import { renderHook, RenderHookOptions, RenderHookResult } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { mockEvents, mockEventStats, mockDashboardStats } from './mocks/eventData'

// Create a test query client with no retries and fast timeouts
export const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

// Wrapper component for React Query
const createWrapper = (queryClient?: QueryClient) => {
  const client = queryClient || createTestQueryClient()

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      {children}
    </QueryClientProvider>
  )
}

// Enhanced renderHook for event hooks with React Query
export const renderEventHook = <TProps, TResult>(
  hook: (props: TProps) => TResult,
  options?: RenderHookOptions<TProps> & {
    queryClient?: QueryClient
  }
): RenderHookResult<TResult, TProps> & { queryClient: QueryClient } => {
  const queryClient = options?.queryClient || createTestQueryClient()
  const wrapper = createWrapper(queryClient)

  const result = renderHook(hook, {
    ...options,
    wrapper,
  })

  return {
    ...result,
    queryClient,
  }
}

// Wait for query to settle (resolve or error)
export const waitForQuery = async (queryClient: QueryClient, queryKey: unknown[]) => {
  return new Promise((resolve) => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event?.query?.queryKey && JSON.stringify(event.query.queryKey) === JSON.stringify(queryKey)) {
        if (event.query.state.status === 'success' || event.query.state.status === 'error') {
          unsubscribe()
          resolve(event.query.state.data || event.query.state.error)
        }
      }
    })
  })
}

// Check optimistic update behavior
export const expectOptimisticUpdate = (queryClient: QueryClient, queryKey: unknown[], expectedData?: unknown) => {
  const query = queryClient.getQueryCache().find({ queryKey })

  if (expectedData) {
    expect(query?.state.data).toEqual(expectedData)
  }

  // Should be marked as stale for refetch
  expect(query?.state.isStale).toBe(true)
}

// Test scenario helpers
export interface TestScenario {
  name: string
  setup?: () => void
  teardown?: () => void
  mockData?: {
    events?: typeof mockEvents
    stats?: typeof mockEventStats
    dashboardStats?: typeof mockDashboardStats
  }
}

export const setupEventScenarios = (scenarios: TestScenario[]) => {
  scenarios.forEach(scenario => {
    describe(scenario.name, () => {
      beforeEach(() => {
        scenario.setup?.()
      })

      afterEach(() => {
        scenario.teardown?.()
      })
    })
  })
}

// Mock authentication helper
export const mockAuthenticatedRequest = (token: string = 'mock-token') => {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
}

// Error scenario helpers
export const mockNetworkError = () => {
  jest.spyOn(console, 'error').mockImplementation(() => {})
  return new Error('Network Error')
}

export const mockServerError = () => {
  return {
    response: {
      status: 500,
      data: { detail: 'Internal server error' }
    }
  }
}

export const mockNotFoundError = () => {
  return {
    response: {
      status: 404,
      data: { detail: 'Event not found' }
    }
  }
}

export const mockValidationError = () => {
  return {
    response: {
      status: 400,
      data: {
        detail: 'Validation error',
        errors: [
          { field: 'name', message: 'Event name is required' }
        ]
      }
    }
  }
}

// Async test helpers
export const waitForNextTick = () => new Promise(resolve => setTimeout(resolve, 0))

export const waitForMs = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Query key matchers for testing
export const expectQueryKey = (actualKey: unknown[], expectedKey: unknown[]) => {
  expect(JSON.stringify(actualKey)).toBe(JSON.stringify(expectedKey))
}

// Mock localStorage for view preferences
export const mockLocalStorage = () => {
  const store: Record<string, string> = {}

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key])
    }),
  }
}

// Test data generators
export const generateMockEventId = () => `test-event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

export const generateMockUserId = () => `test-user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

// Assertion helpers
export const expectEventInCache = (queryClient: QueryClient, eventId: string, shouldExist: boolean = true) => {
  const query = queryClient.getQueryCache().find({
    queryKey: ['events', 'detail', eventId]
  })

  if (shouldExist) {
    expect(query).toBeDefined()
    expect(query?.state.data).toBeDefined()
  } else {
    expect(query).toBeUndefined()
  }
}

export const expectQueryInvalidated = (queryClient: QueryClient, queryKey: unknown[]) => {
  const query = queryClient.getQueryCache().find({ queryKey })
  expect(query?.state.isStale).toBe(true)
}

// Performance testing helpers
export const measureHookPerformance = async <T>(
  hookFn: () => T,
  iterations: number = 100
): Promise<{ average: number; min: number; max: number; total: number }> => {
  const times: number[] = []

  for (let i = 0; i < iterations; i++) {
    const start = performance.now()
    hookFn()
    const end = performance.now()
    times.push(end - start)
  }

  const total = times.reduce((sum, time) => sum + time, 0)
  const average = total / times.length
  const min = Math.min(...times)
  const max = Math.max(...times)

  return { average, min, max, total }
}