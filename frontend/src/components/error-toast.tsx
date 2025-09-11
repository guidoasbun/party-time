/**
 * Toast notification component for displaying errors
 */

'use client'

import React, { useState, useEffect } from 'react'
import { AppError, ErrorSeverity } from '@/lib/error-handler'

interface ErrorToastProps {
  error: AppError
  onDismiss?: () => void
  autoHideDuration?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center'
}

export function ErrorToast({ 
  error, 
  onDismiss, 
  autoHideDuration = 5000,
  position = 'top-right' 
}: ErrorToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (autoHideDuration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => onDismiss?.(), 300) // Wait for fade out animation
      }, autoHideDuration)

      return () => clearTimeout(timer)
    }
  }, [autoHideDuration, onDismiss])

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(() => onDismiss?.(), 300)
  }

  const getSeverityStyles = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.LOW:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case ErrorSeverity.MEDIUM:
        return 'bg-orange-50 border-orange-200 text-orange-800'
      case ErrorSeverity.HIGH:
        return 'bg-red-50 border-red-200 text-red-800'
      case ErrorSeverity.CRITICAL:
        return 'bg-red-100 border-red-300 text-red-900'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const getSeverityIcon = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.LOW:
        return (
          <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )
      case ErrorSeverity.MEDIUM:
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        return (
          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        )
    }
  }

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4'
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2'
      case 'top-right':
        return 'top-4 right-4'
      case 'bottom-left':
        return 'bottom-4 left-4'
      case 'bottom-right':
        return 'bottom-4 right-4'
      default:
        return 'top-4 right-4'
    }
  }

  if (!isVisible) {
    return null
  }

  return (
    <div 
      className={`fixed z-50 max-w-sm w-full transform transition-all duration-300 ease-in-out ${getPositionClasses()} ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}
    >
      <div className={`rounded-lg border shadow-lg p-4 ${getSeverityStyles(error.severity)}`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {getSeverityIcon(error.severity)}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">
              {error.userMessage}
            </p>
            
            {process.env.NODE_ENV === 'development' && error.code && (
              <p className="text-xs mt-1 opacity-75">
                Code: {error.code}
              </p>
            )}
          </div>
          
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 ml-2 inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <span className="sr-only">Close</span>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Toast container for managing multiple error toasts
 */
interface ErrorToastContainerProps {
  errors: Array<{ id: string; error: AppError }>
  onDismiss: (id: string) => void
  maxToasts?: number
  position?: ErrorToastProps['position']
}

export function ErrorToastContainer({ 
  errors, 
  onDismiss, 
  maxToasts = 3,
  position = 'top-right'
}: ErrorToastContainerProps) {
  // Show only the most recent toasts
  const visibleErrors = errors.slice(-maxToasts)

  return (
    <>
      {visibleErrors.map((item, index) => (
        <div
          key={item.id}
          style={{
            zIndex: 50 - index,
            transform: `translateY(${index * 80}px)`
          }}
        >
          <ErrorToast
            error={item.error}
            onDismiss={() => onDismiss(item.id)}
            position={position}
          />
        </div>
      ))}
    </>
  )
}

/**
 * Hook for managing error toasts
 */
export function useErrorToast() {
  const [errors, setErrors] = useState<Array<{ id: string; error: AppError }>>([])

  const showError = (error: AppError) => {
    const id = Date.now().toString()
    setErrors(prev => [...prev, { id, error }])
  }

  const dismissError = (id: string) => {
    setErrors(prev => prev.filter(item => item.id !== id))
  }

  const clearAll = () => {
    setErrors([])
  }

  return {
    errors,
    showError,
    dismissError,
    clearAll
  }
}