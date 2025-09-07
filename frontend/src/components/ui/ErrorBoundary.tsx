"use client"

import React, { Component, ReactNode } from 'react'
import { Button } from './Button'
import { cn } from '@/lib/utils'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  className?: string
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Call the optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className={cn(
          "min-h-[400px] flex items-center justify-center p-6",
          this.props.className
        )}>
          <div className="max-w-md w-full bg-white border border-red-200 rounded-lg shadow-sm p-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Something went wrong
              </h2>
              
              <p className="text-sm text-gray-600 mb-6">
                We&apos;re sorry, but something unexpected happened. Please try again or contact support if the problem persists.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left mb-6 p-3 bg-gray-50 rounded border text-xs">
                  <summary className="cursor-pointer font-medium text-gray-800 mb-2">
                    Error Details (Development Mode)
                  </summary>
                  <pre className="whitespace-pre-wrap text-red-700">
                    {this.state.error.name}: {this.state.error.message}
                    {this.state.error.stack && (
                      <>
                        {'\n'}
                        {this.state.error.stack}
                      </>
                    )}
                  </pre>
                </details>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={this.handleRetry}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Try Again
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  Reload Page
                </Button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook version for functional components
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

// Simple fallback component for testing
export const SimpleErrorFallback: React.FC<{ error?: Error }> = ({ error }) => (
  <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded-md">
    <h2 className="text-lg font-semibold text-red-800 mb-2">
      Something went wrong
    </h2>
    {error && (
      <p className="text-sm text-red-700">
        {error.message}
      </p>
    )}
  </div>
)