'use client'

import React, { Component, ReactNode } from 'react'
import { ErrorMessage, ErrorSeverity, ErrorType } from './ErrorMessage'
import { cn } from '@/lib/utils'

interface RetryBoundaryState {
  hasError: boolean
  error: Error | null
  retryCount: number
  isRetrying: boolean
}

interface RetryBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  maxRetries?: number
  retryDelay?: number
  enableAutoRetry?: boolean
  onError?: (error: Error, errorInfo: React.ErrorInfo, retryCount: number) => void
  onRetry?: (retryCount: number) => void
  onMaxRetriesReached?: (error: Error, retryCount: number) => void
  className?: string
  errorSeverity?: ErrorSeverity
  errorType?: ErrorType
  customErrorTitle?: string
  customErrorMessage?: string
  showErrorDetails?: boolean
  resetKeys?: (string | number)[]
  resetOnPropsChange?: boolean
}

export class RetryBoundary extends Component<RetryBoundaryProps, RetryBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null

  constructor(props: RetryBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0,
      isRetrying: false
    }
  }

  static getDerivedStateFromError(error: Error): Partial<RetryBoundaryState> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('RetryBoundary caught an error:', error, errorInfo)

    const { onError } = this.props
    if (onError) {
      onError(error, errorInfo, this.state.retryCount)
    }

    // Auto-retry if enabled and within limits
    if (this.shouldAutoRetry()) {
      this.scheduleAutoRetry()
    }
  }

  componentDidUpdate(prevProps: RetryBoundaryProps) {
    // Reset error state if reset keys changed
    if (this.props.resetKeys && prevProps.resetKeys) {
      const keysChanged = this.props.resetKeys.some((key, index) =>
        key !== prevProps.resetKeys?.[index]
      )
      if (keysChanged && this.state.hasError) {
        this.resetErrorState()
      }
    }

    // Reset on props change if enabled
    if (this.props.resetOnPropsChange && this.state.hasError) {
      // Simple shallow comparison for demonstration
      const propsChanged = JSON.stringify(prevProps) !== JSON.stringify(this.props)
      if (propsChanged) {
        this.resetErrorState()
      }
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
  }

  private shouldAutoRetry = (): boolean => {
    const { enableAutoRetry = false, maxRetries = 3 } = this.props
    return enableAutoRetry && this.state.retryCount < maxRetries
  }

  private scheduleAutoRetry = (): void => {
    const { retryDelay = 1000 } = this.props

    this.setState({ isRetrying: true })

    this.retryTimeoutId = setTimeout(() => {
      this.handleRetry()
    }, retryDelay)
  }

  private resetErrorState = (): void => {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
      this.retryTimeoutId = null
    }

    this.setState({
      hasError: false,
      error: null,
      retryCount: 0,
      isRetrying: false
    })
  }

  private handleRetry = (): void => {
    const { maxRetries = 3, onRetry, onMaxRetriesReached } = this.props
    const newRetryCount = this.state.retryCount + 1

    if (onRetry) {
      onRetry(newRetryCount)
    }

    if (newRetryCount >= maxRetries) {
      // Max retries reached
      this.setState({
        isRetrying: false,
        retryCount: newRetryCount
      })

      if (onMaxRetriesReached && this.state.error) {
        onMaxRetriesReached(this.state.error, newRetryCount)
      }
    } else {
      // Try to reset and retry
      this.setState({
        hasError: false,
        error: null,
        retryCount: newRetryCount,
        isRetrying: false
      })
    }
  }

  private getErrorType = (): ErrorType => {
    if (this.props.errorType) return this.props.errorType

    const error = this.state.error
    if (!error) return 'unknown'

    const message = error.message.toLowerCase()

    if (message.includes('network') || message.includes('fetch')) {
      return 'network'
    }
    if (message.includes('unauthorized') || message.includes('authentication')) {
      return 'authentication'
    }
    if (message.includes('validation')) {
      return 'validation'
    }
    if (message.includes('server') || message.includes('internal')) {
      return 'server'
    }

    return 'unknown'
  }

  private getErrorMessage = (): string => {
    if (this.props.customErrorMessage) {
      return this.props.customErrorMessage
    }

    const error = this.state.error
    if (!error) return 'An unexpected error occurred'

    // Provide user-friendly error messages
    const message = error.message.toLowerCase()

    if (message.includes('network') || message.includes('fetch')) {
      return 'Unable to connect to the server. Please check your internet connection.'
    }
    if (message.includes('unauthorized')) {
      return 'You need to sign in to access this content.'
    }
    if (message.includes('not found')) {
      return 'The requested content could not be found.'
    }

    return error.message || 'An unexpected error occurred'
  }

  render() {
    const {
      children,
      fallback,
      maxRetries = 3,
      className,
      errorSeverity = 'error',
      customErrorTitle,
      showErrorDetails = process.env.NODE_ENV === 'development'
    } = this.props

    const { hasError, error, retryCount, isRetrying } = this.state

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return <div className={className}>{fallback}</div>
      }

      const errorType = this.getErrorType()
      const errorMessage = this.getErrorMessage()
      const canRetry = retryCount < maxRetries

      return (
        <div className={cn('min-h-32 flex items-center justify-center p-4', className)}>
          <ErrorMessage
            title={customErrorTitle}
            message={errorMessage}
            severity={errorSeverity}
            type={errorType}
            error={showErrorDetails ? error : undefined}
            showDetails={showErrorDetails}
            onRetry={canRetry ? this.handleRetry : undefined}
            isRetrying={isRetrying}
            retryDisabled={!canRetry}
            maxRetries={maxRetries}
            className="max-w-md w-full"
          />
        </div>
      )
    }

    return children
  }
}

// Hook version for functional components
export function useRetryBoundary() {
  const [retryState, setRetryState] = React.useState({
    retryCount: 0,
    isRetrying: false
  })

  const retry = React.useCallback((maxRetries = 3) => {
    if (retryState.retryCount >= maxRetries) return false

    setRetryState(prev => ({
      retryCount: prev.retryCount + 1,
      isRetrying: true
    }))

    // Simulate retry delay
    setTimeout(() => {
      setRetryState(prev => ({
        ...prev,
        isRetrying: false
      }))
    }, 1000)

    return true
  }, [retryState.retryCount])

  const reset = React.useCallback(() => {
    setRetryState({
      retryCount: 0,
      isRetrying: false
    })
  }, [])

  return {
    retryCount: retryState.retryCount,
    isRetrying: retryState.isRetrying,
    retry,
    reset
  }
}

// HOC version for wrapping components
export function withRetryBoundary<P extends object>(
  Component: React.ComponentType<P>,
  boundaryProps?: Omit<RetryBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <RetryBoundary {...boundaryProps}>
      <Component {...props} />
    </RetryBoundary>
  )

  WrappedComponent.displayName = `withRetryBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}

// Specialized retry boundaries for common scenarios
export function NetworkRetryBoundary({
  children,
  ...props
}: Omit<RetryBoundaryProps, 'errorType' | 'enableAutoRetry' | 'maxRetries'>) {
  return (
    <RetryBoundary
      errorType="network"
      enableAutoRetry={true}
      maxRetries={3}
      retryDelay={2000}
      {...props}
    >
      {children}
    </RetryBoundary>
  )
}

export function ServerRetryBoundary({
  children,
  ...props
}: Omit<RetryBoundaryProps, 'errorType' | 'maxRetries'>) {
  return (
    <RetryBoundary
      errorType="server"
      maxRetries={2}
      retryDelay={3000}
      {...props}
    >
      {children}
    </RetryBoundary>
  )
}

export function ComponentRetryBoundary({
  children,
  resetKeys,
  ...props
}: Pick<RetryBoundaryProps, 'children' | 'resetKeys'> & Partial<RetryBoundaryProps>) {
  return (
    <RetryBoundary
      maxRetries={1}
      enableAutoRetry={false}
      resetKeys={resetKeys}
      resetOnPropsChange={true}
      errorSeverity="warning"
      customErrorTitle="Component Error"
      customErrorMessage="This component encountered an error. Try refreshing the page."
      {...props}
    >
      {children}
    </RetryBoundary>
  )
}