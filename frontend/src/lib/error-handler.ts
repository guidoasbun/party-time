/**
 * Error handling utilities for Party-Time application
 */

import { ApiException, NetworkException, TimeoutException } from './api-client'
import { AxiosError } from 'axios'

// Error types for categorization
export enum ErrorType {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  NOT_FOUND = 'not_found',
  SERVER = 'server',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown'
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Standardized error interface
export interface AppError {
  type: ErrorType
  severity: ErrorSeverity
  message: string
  code?: string
  details?: Record<string, unknown>
  timestamp: Date
  retryable: boolean
  userMessage: string
}

// User-friendly error messages
const ERROR_MESSAGES: Record<ErrorType, Record<string, string>> = {
  [ErrorType.NETWORK]: {
    default: 'Unable to connect to the server. Please check your internet connection.',
    offline: 'You appear to be offline. Please check your internet connection.',
    dns: 'Cannot reach the server. Please try again later.'
  },
  [ErrorType.AUTHENTICATION]: {
    default: 'Please sign in to continue.',
    expired: 'Your session has expired. Please sign in again.',
    invalid: 'Invalid credentials. Please check your email and password.'
  },
  [ErrorType.AUTHORIZATION]: {
    default: 'You do not have permission to perform this action.',
    forbidden: 'Access denied. You do not have the required permissions.',
    role: 'Your account level does not allow this action.'
  },
  [ErrorType.VALIDATION]: {
    default: 'Please check your input and try again.',
    required: 'Please fill in all required fields.',
    format: 'Please check the format of your input.'
  },
  [ErrorType.NOT_FOUND]: {
    default: 'The requested item could not be found.',
    event: 'This event could not be found or may have been deleted.',
    guest: 'This guest could not be found.',
    page: 'The page you are looking for does not exist.'
  },
  [ErrorType.SERVER]: {
    default: 'Something went wrong on our end. Please try again.',
    maintenance: 'The service is temporarily unavailable for maintenance.',
    overload: 'The server is experiencing high traffic. Please try again in a moment.'
  },
  [ErrorType.TIMEOUT]: {
    default: 'The request took too long. Please try again.',
    upload: 'File upload timed out. Please try with a smaller file.',
    slow: 'The server is responding slowly. Please try again.'
  },
  [ErrorType.UNKNOWN]: {
    default: 'An unexpected error occurred. Please try again.'
  }
}

/**
 * Categorizes an error based on its properties
 */
export function categorizeError(error: unknown): ErrorType {
  if (error instanceof NetworkException) {
    return ErrorType.NETWORK
  }
  
  if (error instanceof TimeoutException) {
    return ErrorType.TIMEOUT
  }
  
  if (error instanceof ApiException) {
    switch (error.status) {
      case 401:
        return ErrorType.AUTHENTICATION
      case 403:
        return ErrorType.AUTHORIZATION
      case 404:
        return ErrorType.NOT_FOUND
      case 422:
        return ErrorType.VALIDATION
      case 500:
      case 502:
      case 503:
      case 504:
        return ErrorType.SERVER
      default:
        return ErrorType.UNKNOWN
    }
  }
  
  if (error instanceof AxiosError) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return ErrorType.TIMEOUT
    }
    if (error.code === 'ERR_NETWORK' || error.code === 'ERR_INTERNET_DISCONNECTED') {
      return ErrorType.NETWORK
    }
    if (error.response?.status) {
      return categorizeError(new ApiException(
        error.message,
        error.response.status,
        error.response.data
      ))
    }
  }
  
  return ErrorType.UNKNOWN
}

/**
 * Determines the severity of an error
 */
export function getErrorSeverity(error: unknown, type: ErrorType): ErrorSeverity {
  if (type === ErrorType.AUTHENTICATION || type === ErrorType.AUTHORIZATION) {
    return ErrorSeverity.HIGH
  }
  
  if (type === ErrorType.SERVER) {
    return ErrorSeverity.CRITICAL
  }
  
  if (type === ErrorType.NETWORK || type === ErrorType.TIMEOUT) {
    return ErrorSeverity.MEDIUM
  }
  
  if (type === ErrorType.VALIDATION || type === ErrorType.NOT_FOUND) {
    return ErrorSeverity.LOW
  }
  
  return ErrorSeverity.MEDIUM
}

/**
 * Determines if an error is retryable
 */
export function isRetryableError(type: ErrorType): boolean {
  return [
    ErrorType.NETWORK,
    ErrorType.TIMEOUT,
    ErrorType.SERVER
  ].includes(type)
}

/**
 * Gets a user-friendly error message
 */
export function getUserMessage(type: ErrorType, code?: string): string {
  const messages = ERROR_MESSAGES[type]
  if (code && messages[code]) {
    return messages[code]
  }
  return messages.default
}

/**
 * Transforms any error into a standardized AppError
 */
export function normalizeError(error: unknown): AppError {
  const type = categorizeError(error)
  const severity = getErrorSeverity(error, type)
  const retryable = isRetryableError(type)
  
  let message = 'An error occurred'
  let code: string | undefined
  let details: Record<string, unknown> | undefined
  
  if (error instanceof ApiException) {
    message = error.message
    code = error.status.toString()
    details = error.details ? { details: error.details } : undefined
  } else if (error instanceof NetworkException || error instanceof TimeoutException) {
    message = error.message
    code = undefined
  } else if (error instanceof AxiosError) {
    message = error.message
    code = error.code
    details = {
      status: error.response?.status,
      data: error.response?.data
    }
  } else if (error instanceof Error) {
    message = error.message
  } else if (typeof error === 'string') {
    message = error
  }
  
  const userMessage = getUserMessage(type, code)
  
  return {
    type,
    severity,
    message,
    code,
    details,
    timestamp: new Date(),
    retryable,
    userMessage
  }
}

/**
 * Error boundary handler for React components
 */
export function handleComponentError(error: Error, errorInfo: { componentStack: string }) {
  const appError = normalizeError(error)
  
  // Log the error with additional context
  console.error('Component Error:', {
    ...appError,
    componentStack: errorInfo.componentStack
  })
  
  // In production, you might want to send this to an error reporting service
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry.captureException(error, { extra: errorInfo })
  }
  
  return appError
}

/**
 * Global error handler for unhandled promise rejections
 */
export function handleUnhandledRejection(event: PromiseRejectionEvent) {
  const appError = normalizeError(event.reason)
  
  console.error('Unhandled Promise Rejection:', appError)
  
  // Prevent the default browser behavior
  event.preventDefault()
  
  return appError
}

/**
 * React Query error handler
 */
export function handleQueryError(error: unknown) {
  const appError = normalizeError(error)
  
  // Log the error
  console.error('Query Error:', appError)
  
  // For certain error types, we might want to take specific actions
  switch (appError.type) {
    case ErrorType.AUTHENTICATION:
      // Redirect to login or refresh token
      break
    case ErrorType.NETWORK:
      // Show network status indicator
      break
    default:
      // Default error handling
      break
  }
  
  return appError
}

/**
 * Error reporting utility
 */
export function reportError(error: AppError, context?: Record<string, unknown>) {
  const errorReport = {
    ...error,
    context,
    userAgent: navigator.userAgent,
    url: window.location.href,
    userId: null, // Get from auth context if available
    sessionId: null // Get from session if available
  }
  
  // In development, just log to console
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Report:', errorReport)
    return
  }
  
  // In production, send to error reporting service
  // Example implementations:
  
  // Sentry
  // Sentry.captureException(new Error(error.message), {
  //   tags: { type: error.type, severity: error.severity },
  //   extra: errorReport
  // })
  
  // Custom endpoint
  // fetch('/api/errors', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(errorReport)
  // }).catch(() => {
  //   // Silently fail if error reporting fails
  // })
}

/**
 * Hook for error handling in components
 */
export function useErrorHandler() {
  const handleError = (error: unknown, context?: Record<string, unknown>) => {
    const appError = normalizeError(error)
    reportError(appError, context)
    return appError
  }
  
  const handleAsyncError = async (fn: () => Promise<unknown>, context?: Record<string, unknown>) => {
    try {
      return await fn()
    } catch (error) {
      const appError = handleError(error, context)
      throw appError
    }
  }
  
  return {
    handleError,
    handleAsyncError
  }
}

/**
 * Retry utility for failed operations
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: unknown
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      const appError = normalizeError(error)
      
      // Don't retry if the error is not retryable
      if (!appError.retryable) {
        throw appError
      }
      
      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        throw appError
      }
      
      // Wait before retrying (exponential backoff)
      const waitTime = delay * Math.pow(2, attempt)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }
  
  throw normalizeError(lastError)
}