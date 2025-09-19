'use client'

import React, { useState, useCallback } from 'react'
import {
  AlertTriangle,
  XCircle,
  WifiOff,
  RefreshCw,
  AlertCircle,
  Info,
  X
} from 'lucide-react'
import { Button } from './Button'
import { cn } from '@/lib/utils'

export type ErrorSeverity = 'error' | 'warning' | 'info' | 'critical'
export type ErrorType = 'network' | 'validation' | 'authentication' | 'server' | 'unknown'

export interface ErrorMessageProps {
  title?: string
  message: string
  severity?: ErrorSeverity
  type?: ErrorType
  error?: Error | unknown
  showDetails?: boolean
  onRetry?: () => void | Promise<void>
  onDismiss?: () => void
  retryLabel?: string
  dismissLabel?: string
  retryDisabled?: boolean
  isRetrying?: boolean
  className?: string
  showIcon?: boolean
  actions?: React.ReactNode
  maxRetries?: number
  autoRetryDelay?: number
}

const severityConfig = {
  error: {
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    textColor: 'text-gray-900 dark:text-red-100',
    iconColor: 'text-red-600 dark:text-red-300',
    icon: XCircle
  },
  warning: {
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    textColor: 'text-gray-900 dark:text-yellow-100',
    iconColor: 'text-yellow-600 dark:text-yellow-300',
    icon: AlertTriangle
  },
  info: {
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    textColor: 'text-gray-900 dark:text-blue-100',
    iconColor: 'text-blue-600 dark:text-blue-300',
    icon: Info
  },
  critical: {
    bgColor: 'bg-red-100 dark:bg-red-900/40',
    borderColor: 'border-red-300 dark:border-red-700',
    textColor: 'text-black dark:text-red-100',
    iconColor: 'text-red-700 dark:text-red-300',
    icon: AlertCircle
  }
}

const typeConfig = {
  network: {
    icon: WifiOff,
    defaultTitle: 'Connection Error',
    defaultMessage: 'Unable to connect to the server. Please check your internet connection and try again.'
  },
  validation: {
    icon: AlertTriangle,
    defaultTitle: 'Validation Error',
    defaultMessage: 'Please check your input and try again.'
  },
  authentication: {
    icon: XCircle,
    defaultTitle: 'Authentication Error',
    defaultMessage: 'You need to sign in to continue.'
  },
  server: {
    icon: AlertCircle,
    defaultTitle: 'Server Error',
    defaultMessage: 'Something went wrong on our end. Please try again later.'
  },
  unknown: {
    icon: AlertCircle,
    defaultTitle: 'Error',
    defaultMessage: 'An unexpected error occurred.'
  }
}

export function ErrorMessage({
  title,
  message,
  severity = 'error',
  type = 'unknown',
  error,
  showDetails = false,
  onRetry,
  onDismiss,
  retryLabel = 'Try Again',
  dismissLabel,
  retryDisabled = false,
  isRetrying = false,
  className,
  showIcon = true,
  actions,
  maxRetries,
  autoRetryDelay
}: ErrorMessageProps) {
  const [retryCount, setRetryCount] = useState(0)
  const [showError, setShowError] = useState(true)
  const [autoRetryTimer, setAutoRetryTimer] = useState<NodeJS.Timeout | null>(null)

  const config = severityConfig[severity]
  const typeInfo = typeConfig[type]
  const IconComponent = showIcon ? (typeInfo.icon || config.icon) : null

  const displayTitle = title || typeInfo.defaultTitle
  const displayMessage = message || typeInfo.defaultMessage

  const handleRetry = useCallback(async () => {
    if (!onRetry || retryDisabled || isRetrying) return

    if (maxRetries && retryCount >= maxRetries) {
      return
    }

    setRetryCount(prev => prev + 1)

    try {
      await onRetry()
    } catch (retryError) {
      console.error('Retry failed:', retryError)
    }
  }, [onRetry, retryDisabled, isRetrying, maxRetries, retryCount])

  const handleDismiss = useCallback(() => {
    setShowError(false)
    onDismiss?.()
    if (autoRetryTimer) {
      clearTimeout(autoRetryTimer)
      setAutoRetryTimer(null)
    }
  }, [onDismiss, autoRetryTimer])

  // Auto-retry functionality
  React.useEffect(() => {
    if (autoRetryDelay && onRetry && !retryDisabled && retryCount === 0) {
      const timer = setTimeout(() => {
        handleRetry()
      }, autoRetryDelay)
      setAutoRetryTimer(timer)

      return () => {
        clearTimeout(timer)
      }
    }
  }, [autoRetryDelay, onRetry, retryDisabled, retryCount, handleRetry])

  if (!showError) {
    return null
  }

  const showRetryButton = onRetry && (!maxRetries || retryCount < maxRetries)
  const errorDetails = error instanceof Error ? error.message : String(error)

  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        config.bgColor,
        config.borderColor,
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        {IconComponent && (
          <IconComponent
            className={cn('h-5 w-5 mt-0.5 flex-shrink-0', config.iconColor)}
            aria-hidden="true"
          />
        )}

        <div className="flex-1 min-w-0">
          {displayTitle && (
            <h3 className={cn('font-medium mb-1', config.textColor)}>
              {displayTitle}
            </h3>
          )}

          <p className={cn('text-sm', config.textColor)}>
            {displayMessage}
          </p>

          {showDetails && errorDetails && errorDetails !== displayMessage && (
            <details className="mt-2">
              <summary className={cn(
                'cursor-pointer text-xs font-medium',
                config.textColor,
                'hover:underline'
              )}>
                Technical Details
              </summary>
              <pre className={cn(
                'mt-2 text-xs bg-black/5 dark:bg-white/5 rounded p-2 overflow-auto',
                config.textColor
              )}>
                {errorDetails}
              </pre>
            </details>
          )}

          {maxRetries && retryCount > 0 && (
            <p className={cn('text-xs mt-2', config.textColor)}>
              Retry attempt {retryCount} of {maxRetries}
            </p>
          )}

          {(showRetryButton || actions || onDismiss) && (
            <div className="flex items-center gap-2 mt-3">
              {showRetryButton && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRetry}
                  disabled={retryDisabled || isRetrying}
                  className={cn(
                    'text-xs border-current',
                    config.textColor,
                    'hover:bg-current/10'
                  )}
                >
                  {isRetrying ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1" />
                      {retryLabel}
                    </>
                  )}
                </Button>
              )}

              {actions}

              {onDismiss && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDismiss}
                  className={cn('text-xs ml-auto hover:bg-current/10', config.textColor)}
                >
                  {dismissLabel || 'Dismiss'}
                </Button>
              )}
            </div>
          )}
        </div>

        {onDismiss && (
          <button
            onClick={handleDismiss}
            className={cn(
              'flex-shrink-0 p-1 rounded-md hover:bg-current/10',
              config.textColor
            )}
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

// Specialized error components for common scenarios
export function NetworkErrorMessage({
  onRetry,
  ...props
}: Omit<ErrorMessageProps, 'type' | 'severity'> & {
  onRetry?: () => void | Promise<void>
}) {
  return (
    <ErrorMessage
      type="network"
      severity="error"
      onRetry={onRetry}
      autoRetryDelay={3000}
      maxRetries={3}
      {...props}
    />
  )
}

export function ValidationErrorMessage({
  ...props
}: Omit<ErrorMessageProps, 'type' | 'severity'>) {
  return (
    <ErrorMessage
      type="validation"
      severity="warning"
      {...props}
    />
  )
}

export function ServerErrorMessage({
  onRetry,
  ...props
}: Omit<ErrorMessageProps, 'type' | 'severity'> & {
  onRetry?: () => void | Promise<void>
}) {
  return (
    <ErrorMessage
      type="server"
      severity="error"
      onRetry={onRetry}
      maxRetries={2}
      {...props}
    />
  )
}

export function AuthenticationErrorMessage({
  onRetry,
  ...props
}: Omit<ErrorMessageProps, 'type' | 'severity'> & {
  onRetry?: () => void | Promise<void>
}) {
  return (
    <ErrorMessage
      type="authentication"
      severity="critical"
      onRetry={onRetry}
      retryLabel="Sign In"
      {...props}
    />
  )
}

// Inline error message for forms
export function InlineErrorMessage({
  className,
  ...props
}: Omit<ErrorMessageProps, 'showIcon' | 'severity'>) {
  return (
    <ErrorMessage
      showIcon={false}
      severity="error"
      className={cn('text-sm p-2 border-l-4', className)}
      {...props}
    />
  )
}