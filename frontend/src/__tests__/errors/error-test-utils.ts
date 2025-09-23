/**
 * Error Testing Utilities
 * Comprehensive utilities for testing error scenarios and recovery mechanisms
 */

import React from 'react'
import { QueryClient } from '@tanstack/react-query'
import { EventType, EventStatus } from '@/types/event.types'

// Mock console to prevent error logs during tests
export const mockConsole = () => {
  const originalError = console.error
  const originalWarn = console.warn

  beforeAll(() => {
    console.error = jest.fn()
    console.warn = jest.fn()
  })

  afterAll(() => {
    console.error = originalError
    console.warn = originalWarn
  })

  return {
    mockError: console.error as jest.MockedFunction<typeof console.error>,
    mockWarn: console.warn as jest.MockedFunction<typeof console.warn>
  }
}

// Error response builders
export const createNetworkError = (message: string = 'Network Error') => {
  const error = new Error(message)
  error.name = 'NetworkError'
  return error
}

export const createTimeoutError = () => {
  const error = new Error('Request timeout')
  error.name = 'TimeoutError'
  return error
}

export const createServerError = (status: number = 500, message: string = 'Internal Server Error') => {
  return {
    response: {
      status,
      statusText: message,
      data: {
        detail: message,
        error: 'server_error'
      }
    },
    message,
    isAxiosError: true
  }
}

export const createValidationError = (field: string = 'name', message: string = 'Field is required') => {
  return {
    response: {
      status: 400,
      statusText: 'Bad Request',
      data: {
        detail: 'Validation failed',
        error: 'validation_error',
        errors: [
          {
            field,
            message,
            code: 'required'
          }
        ]
      }
    },
    message: 'Validation failed',
    isAxiosError: true
  }
}

export const createAuthenticationError = (message: string = 'Authentication required') => {
  return {
    response: {
      status: 401,
      statusText: 'Unauthorized',
      data: {
        detail: message,
        error: 'authentication_error'
      }
    },
    message,
    isAxiosError: true
  }
}

export const createAuthorizationError = (message: string = 'Insufficient permissions') => {
  return {
    response: {
      status: 403,
      statusText: 'Forbidden',
      data: {
        detail: message,
        error: 'authorization_error'
      }
    },
    message,
    isAxiosError: true
  }
}

export const createNotFoundError = (resource: string = 'Event') => {
  return {
    response: {
      status: 404,
      statusText: 'Not Found',
      data: {
        detail: `${resource} not found`,
        error: 'not_found'
      }
    },
    message: `${resource} not found`,
    isAxiosError: true
  }
}

export const createConflictError = (message: string = 'Resource conflict') => {
  return {
    response: {
      status: 409,
      statusText: 'Conflict',
      data: {
        detail: message,
        error: 'conflict_error'
      }
    },
    message,
    isAxiosError: true
  }
}

export const createRateLimitError = () => {
  return {
    response: {
      status: 429,
      statusText: 'Too Many Requests',
      data: {
        detail: 'Rate limit exceeded',
        error: 'rate_limit',
        retry_after: 60
      }
    },
    message: 'Rate limit exceeded',
    isAxiosError: true
  }
}

// Mock API responses
export const mockSuccessResponse = (data: unknown) => Promise.resolve({ data })
export const mockErrorResponse = (error: unknown) => Promise.reject(error)

// Test query client with error-specific configuration
export const createErrorTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
        refetchOnWindowFocus: false,
        refetchOnMount: false
      },
      mutations: {
        retry: false
      }
    },
    logger: {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    }
  })
}

// Network condition simulators
export const simulateSlowNetwork = (delay: number = 5000) => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(createTimeoutError())
    }, delay)
  })
}

export const simulateIntermittentFailure = (failureRate: number = 0.5) => {
  return Math.random() < failureRate ?
    mockErrorResponse(createNetworkError('Intermittent failure')) :
    mockSuccessResponse({ success: true })
}

// Edge case data generators
export const createLargeEventList = (count: number = 1000) => {
  return Array.from({ length: count }, (_, index) => ({
    id: `event-${index}`,
    name: `Event ${index}`,
    type: index % 2 === 0 ? EventType.WEDDING : EventType.BIRTHDAY,
    status: index % 3 === 0 ? EventStatus.PLANNING : EventStatus.CONFIRMED,
    start_date: new Date(Date.now() + index * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    is_public: index % 4 === 0
  }))
}

export const createEmptyEventData = () => ({
  events: [],
  total: 0,
  page: 1,
  page_size: 10,
  total_pages: 0
})

export const createInvalidEventData = () => ({
  id: null,
  name: '',
  type: 'INVALID_TYPE',
  status: 'INVALID_STATUS',
  start_date: 'invalid-date',
  created_at: null,
  updated_at: undefined
})

// Concurrent operation helpers
export const simulateConcurrentModifications = async (operations: (() => Promise<unknown>)[]) => {
  const results = await Promise.allSettled(operations.map(op => op()))
  return results
}

// Recovery mechanism helpers
export const expectRetryBehavior = (mockFn: jest.MockedFunction<(...args: unknown[]) => unknown>, maxRetries: number = 3) => {
  expect(mockFn).toHaveBeenCalledTimes(maxRetries + 1) // Initial call + retries
}

export const expectErrorRecovery = async (
  operation: () => Promise<unknown>,
  expectedError: unknown,
  recoveryCallback?: () => void
) => {
  await expect(operation()).rejects.toEqual(expectedError)

  if (recoveryCallback) {
    recoveryCallback()
  }
}

// State verification helpers
export const expectQueryInErrorState = (queryClient: QueryClient, queryKey: unknown[]) => {
  const query = queryClient.getQueryCache().find({ queryKey })
  expect(query?.state.status).toBe('error')
  expect(query?.state.error).toBeDefined()
}

export const expectQueryInLoadingState = (queryClient: QueryClient, queryKey: unknown[]) => {
  const query = queryClient.getQueryCache().find({ queryKey })
  expect(query?.state.status).toBe('pending')
}

export const expectMutationInErrorState = (queryClient: QueryClient, mutationKey: unknown[]) => {
  const mutation = queryClient.getMutationCache().getAll().find(
    m => JSON.stringify(m.options.mutationKey) === JSON.stringify(mutationKey)
  )
  expect(mutation?.state.status).toBe('error')
  expect(mutation?.state.error).toBeDefined()
}

// Performance testing under error conditions
export const measureErrorRecoveryTime = async (
  operation: () => Promise<unknown>,
  expectedError: unknown
): Promise<number> => {
  const start = performance.now()

  try {
    await operation()
  } catch (error) {
    const end = performance.now()
    expect(error).toEqual(expectedError)
    return end - start
  }

  throw new Error('Expected operation to throw an error')
}

// Form validation error helpers
export const createFormValidationErrors = () => ({
  name: ['Event name is required'],
  type: ['Event type must be selected'],
  start_date: ['Start date must be in the future'],
  end_date: ['End date must be after start date']
})

export const expectFormErrorState = (formState: { errors: Record<string, { message: string }> }, field: string, message: string) => {
  expect(formState.errors[field]).toBeDefined()
  expect(formState.errors[field].message).toBe(message)
}

// Accessibility testing during error states
export const expectAccessibleErrorMessage = (container: HTMLElement, message: string) => {
  const errorElement = container.querySelector('[role="alert"], .error, .text-red-500')
  expect(errorElement).toBeInTheDocument()
  expect(errorElement).toHaveTextContent(message)
}

// Error boundary testing helpers
export const TestErrorBoundary = ({ children, onError }: {
  children: React.ReactNode,
  onError?: (error: Error) => void
}) => {
  try {
    return React.createElement(React.Fragment, null, children)
  } catch (error) {
    onError?.(error as Error)
    return React.createElement('div', { 'data-testid': 'error-boundary' }, 'Something went wrong')
  }
}

// Test data corruption scenarios
export const corruptEventData = (event: Record<string, unknown>) => ({
  ...event,
  id: undefined,
  name: null,
  type: 'CORRUPTED',
  start_date: 'not-a-date',
  created_at: 123456, // Wrong type
  metadata: { circular: {} }
})

// Add circular reference for JSON serialization errors
export const createCircularReference = () => {
  const obj: Record<string, unknown> = { name: 'test' }
  obj.circular = obj
  return obj
}

const errorTestUtils = {
  mockConsole,
  createNetworkError,
  createServerError,
  createValidationError,
  createAuthenticationError,
  createNotFoundError,
  createErrorTestQueryClient,
  simulateSlowNetwork,
  createLargeEventList,
  createEmptyEventData,
  expectQueryInErrorState,
  expectRetryBehavior
}

export default errorTestUtils