/**
 * Global error handler hook for the application
 */

'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { handleUnhandledRejection, handleQueryError, normalizeError } from '@/lib/error-handler'
import { useErrorToast } from '@/components/error-toast'

export function useGlobalErrorHandler() {
  const queryClient = useQueryClient()
  const { showError } = useErrorToast()

  useEffect(() => {
    // Handle unhandled promise rejections
    const handleRejection = (event: PromiseRejectionEvent) => {
      const appError = handleUnhandledRejection(event)
      showError(appError)
    }

    // Handle unhandled errors
    const handleError = (event: ErrorEvent) => {
      const appError = normalizeError(event.error || event.message)
      showError(appError)
    }

    // Add global error listeners
    window.addEventListener('unhandledrejection', handleRejection)
    window.addEventListener('error', handleError)

    // Set up React Query global error handler
    queryClient.setDefaultOptions({
      queries: {
        onError: (error) => {
          const appError = handleQueryError(error)
          showError(appError)
        },
        retry: (failureCount, error) => {
          const appError = normalizeError(error)
          // Only retry retryable errors, max 3 times
          return appError.retryable && failureCount < 3
        },
      },
      mutations: {
        onError: (error) => {
          const appError = handleQueryError(error)
          showError(appError)
        },
        retry: (failureCount, error) => {
          const appError = normalizeError(error)
          // Only retry retryable mutations, max 1 time
          return appError.retryable && failureCount < 1
        },
      },
    })

    // Cleanup listeners
    return () => {
      window.removeEventListener('unhandledrejection', handleRejection)
      window.removeEventListener('error', handleError)
    }
  }, [queryClient, showError])

  // Return methods for manual error handling
  return {
    handleError: (error: unknown) => {
      const appError = normalizeError(error)
      showError(appError)
      return appError
    },
    
    handleAsyncError: async <T>(fn: () => Promise<T>): Promise<T> => {
      try {
        return await fn()
      } catch (error) {
        const appError = normalizeError(error)
        showError(appError)
        throw appError
      }
    }
  }
}