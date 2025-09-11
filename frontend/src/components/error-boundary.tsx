/**
 * React Error Boundary component for handling component errors
 */

'use client'

import React, { Component, ReactNode } from 'react'
import { AppError, handleComponentError, ErrorSeverity } from '@/lib/error-handler'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: AppError, retry: () => void) => ReactNode
  onError?: (error: AppError) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: AppError | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(_error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const appError = handleComponentError(error, { componentStack: errorInfo.componentStack || '' })
    this.setState({ error: appError })
    
    // Call the onError callback if provided
    this.props.onError?.(appError)
  }

  retry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.retry)
      }

      // Default error UI
      return <DefaultErrorFallback error={this.state.error} retry={this.retry} />
    }

    return this.props.children
  }
}

/**
 * Default error fallback component
 */
function DefaultErrorFallback({ error, retry }: { error: AppError; retry: () => void }) {
  const getSeverityColor = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.LOW:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case ErrorSeverity.MEDIUM:
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case ErrorSeverity.HIGH:
        return 'text-red-600 bg-red-50 border-red-200'
      case ErrorSeverity.CRITICAL:
        return 'text-red-800 bg-red-100 border-red-300'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getSeverityIcon = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.LOW:
        return '⚠️'
      case ErrorSeverity.MEDIUM:
        return '🔶'
      case ErrorSeverity.HIGH:
        return '❌'
      case ErrorSeverity.CRITICAL:
        return '🚨'
      default:
        return '❗'
    }
  }

  return (
    <div className={`p-6 rounded-lg border-2 ${getSeverityColor(error.severity)}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">
          {getSeverityIcon(error.severity)}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg mb-2">Something went wrong</h3>
          <p className="mb-4">{error.userMessage}</p>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="mb-4">
              <summary className="cursor-pointer text-sm font-medium mb-2">
                Technical Details
              </summary>
              <div className="text-xs bg-gray-100 p-3 rounded border font-mono">
                <div><strong>Type:</strong> {error.type}</div>
                <div><strong>Code:</strong> {error.code || 'N/A'}</div>
                <div><strong>Message:</strong> {error.message}</div>
                <div><strong>Timestamp:</strong> {error.timestamp.toISOString()}</div>
                {error.details && (
                  <div>
                    <strong>Details:</strong>
                    <pre className="mt-1 whitespace-pre-wrap">
                      {JSON.stringify(error.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}
          
          <div className="flex gap-3">
            {error.retryable && (
              <button
                onClick={retry}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            )}
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * HOC for wrapping components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

/**
 * Hook for error boundary integration
 */
export function useErrorBoundary() {
  const throwError = (error: unknown) => {
    throw error
  }
  
  return { throwError }
}