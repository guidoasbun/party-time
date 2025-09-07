import React from 'react'
import { render, screen, waitFor } from '../../../../__tests__/test-utils'
import userEvent from '@testing-library/user-event'
import { ErrorBoundary, withErrorBoundary, SimpleErrorFallback } from '../ErrorBoundary'

// Mock console.error to avoid noise in test output
const originalError = console.error
beforeAll(() => {
  console.error = jest.fn()
})

afterAll(() => {
  console.error = originalError
})

// Test component that throws errors
const ThrowError: React.FC<{ shouldThrow?: boolean; errorMessage?: string }> = ({ 
  shouldThrow = false, 
  errorMessage = 'Test error' 
}) => {
  if (shouldThrow) {
    throw new Error(errorMessage)
  }
  return <div>No error occurred</div>
}

// Test component with async error
const AsyncError: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = false }) => {
  React.useEffect(() => {
    if (shouldThrow) {
      // Simulate async error (like network request failure)
      setTimeout(() => {
        throw new Error('Async error')
      }, 100)
    }
  }, [shouldThrow])

  return <div>Async component loaded</div>
}

describe('ErrorBoundary Integration Tests', () => {
  const user = userEvent.setup()
  
  beforeEach(() => {
    jest.clearAllMocks()
    ;(console.error as jest.Mock).mockClear()
  })

  describe('Basic Error Catching', () => {
    it('should catch and display errors from child components', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Component crashed!" />
        </ErrorBoundary>
      )

      expect(screen.getByRole('heading', { name: /something went wrong/i })).toBeInTheDocument()
      expect(screen.getByText(/we're sorry, but something unexpected happened/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument()
    })

    it('should render children normally when no error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      )

      expect(screen.getByText('No error occurred')).toBeInTheDocument()
      expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument()
    })

    it('should call onError callback when error occurs', () => {
      const onError = jest.fn()

      render(
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} errorMessage="Callback test error" />
        </ErrorBoundary>
      )

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Callback test error',
          name: 'Error'
        }),
        expect.any(Object) // Error info object
      )
    })

    it('should log error to console', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Console test error" />
        </ErrorBoundary>
      )

      expect(console.error).toHaveBeenCalledWith(
        'ErrorBoundary caught an error:',
        expect.objectContaining({
          message: 'Console test error'
        }),
        expect.any(Object)
      )
    })
  })

  describe('Custom Fallback UI', () => {
    it('should render custom fallback when provided', () => {
      const customFallback = (
        <div>
          <h2>Custom Error UI</h2>
          <p>Something went wrong with custom styling</p>
        </div>
      )

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByRole('heading', { name: /custom error ui/i })).toBeInTheDocument()
      expect(screen.getByText(/something went wrong with custom styling/i)).toBeInTheDocument()
      
      // Should not render default fallback
      expect(screen.queryByText(/try again/i)).not.toBeInTheDocument()
    })

    it('should use SimpleErrorFallback component', () => {
      const testError = new Error('Simple fallback test')

      render(<SimpleErrorFallback error={testError} />)

      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /something went wrong/i })).toBeInTheDocument()
      expect(screen.getByText('Simple fallback test')).toBeInTheDocument()
    })
  })

  describe('Error Recovery', () => {
    it('should recover from error when Try Again is clicked', async () => {
      let shouldThrow = true
      
      const RecoverableComponent = () => {
        if (shouldThrow) {
          throw new Error('Recoverable error')
        }
        return <div>Component recovered!</div>
      }

      render(
        <ErrorBoundary>
          <RecoverableComponent />
        </ErrorBoundary>
      )

      // Should show error initially
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()

      // Fix the error condition
      shouldThrow = false

      // Click Try Again
      const tryAgainBtn = screen.getByRole('button', { name: /try again/i })
      await user.click(tryAgainBtn)

      // Should render component successfully
      await waitFor(() => {
        expect(screen.getByText('Component recovered!')).toBeInTheDocument()
        expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument()
      })
    })

    it('should reload page when Reload Page is clicked', async () => {
      // Mock window.location.reload
      const mockReload = jest.fn()
      const originalReload = window.location.reload
      
      Object.defineProperty(window.location, 'reload', {
        value: mockReload,
        writable: true,
        configurable: true,
      })

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const reloadBtn = screen.getByRole('button', { name: /reload page/i })
      await user.click(reloadBtn)

      expect(mockReload).toHaveBeenCalled()
      
      // Restore original function
      Object.defineProperty(window.location, 'reload', {
        value: originalReload,
        writable: true,
        configurable: true,
      })
    })
  })

  describe('Development Mode Features', () => {
    const originalEnv = process.env.NODE_ENV

    beforeEach(() => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        writable: true,
        configurable: true,
      })
    })

    afterEach(() => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        writable: true,
        configurable: true,
      })
    })

    it('should show error details in development mode', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Development error with stack" />
        </ErrorBoundary>
      )

      // Should show error details section
      expect(screen.getByText(/error details.*development mode/i)).toBeInTheDocument()
      
      // Click to expand details
      const detailsElement = screen.getByRole('group')
      expect(detailsElement).toBeInTheDocument()
      
      // Should contain error information
      expect(screen.getByText(/Error: Development error with stack/)).toBeInTheDocument()
    })

    it('should hide error details in production mode', () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
        configurable: true,
      })

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Production error" />
        </ErrorBoundary>
      )

      // Should not show error details in production
      expect(screen.queryByText(/error details/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/Error: Production error/)).not.toBeInTheDocument()
    })
  })

  describe('withErrorBoundary HOC', () => {
    it('should wrap component with error boundary', () => {
      const TestComponent: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = false }) => {
        if (shouldThrow) {
          throw new Error('HOC test error')
        }
        return <div>HOC component rendered</div>
      }

      const WrappedComponent = withErrorBoundary(TestComponent)

      render(<WrappedComponent shouldThrow={false} />)
      expect(screen.getByText('HOC component rendered')).toBeInTheDocument()

      render(<WrappedComponent shouldThrow={true} />)
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    })

    it('should accept error boundary props in HOC', () => {
      const onError = jest.fn()
      const customFallback = <div>HOC custom fallback</div>

      const TestComponent = () => {
        throw new Error('HOC with props error')
      }

      const WrappedComponent = withErrorBoundary(TestComponent, {
        onError,
        fallback: customFallback
      })

      render(<WrappedComponent />)

      expect(screen.getByText('HOC custom fallback')).toBeInTheDocument()
      expect(onError).toHaveBeenCalled()
    })

    it('should preserve component display name', () => {
      const TestComponent = () => <div>Test</div>
      TestComponent.displayName = 'TestComponent'

      const WrappedComponent = withErrorBoundary(TestComponent)

      expect(WrappedComponent.displayName).toBe('withErrorBoundary(TestComponent)')
    })
  })

  describe('Real-world Integration Scenarios', () => {
    it('should handle errors in form submissions', async () => {
      const FailingForm = () => {
        const [shouldFail, setShouldFail] = React.useState(false)

        const handleSubmit = () => {
          setShouldFail(true)
        }

        if (shouldFail) {
          throw new Error('Form submission failed')
        }

        return (
          <form>
            <button type="button" onClick={handleSubmit}>
              Submit Form
            </button>
          </form>
        )
      }

      render(
        <ErrorBoundary>
          <FailingForm />
        </ErrorBoundary>
      )

      const submitBtn = screen.getByRole('button', { name: /submit form/i })
      await user.click(submitBtn)

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    })

    it('should handle errors in data fetching components', () => {
      const DataComponent = ({ shouldFail = false }) => {
        React.useEffect(() => {
          if (shouldFail) {
            throw new Error('Data fetching failed')
          }
        }, [shouldFail])

        return <div>Data loaded successfully</div>
      }

      const { rerender } = render(
        <ErrorBoundary>
          <DataComponent shouldFail={false} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Data loaded successfully')).toBeInTheDocument()

      rerender(
        <ErrorBoundary>
          <DataComponent shouldFail={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    })

    it('should handle nested component errors', () => {
      const NestedChild = ({ level }: { level: number }) => {
        if (level === 0) {
          throw new Error('Nested component error')
        }
        return <div>Nested component {level}</div>
      }

      const ParentComponent = () => (
        <div>
          <h2>Parent Component</h2>
          <NestedChild level={1} />
          <NestedChild level={0} />
        </div>
      )

      render(
        <ErrorBoundary>
          <ParentComponent />
        </ErrorBoundary>
      )

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      // Error icon should be hidden from screen readers
      const errorIcon = document.querySelector('svg[aria-hidden="true"]')
      expect(errorIcon).toBeInTheDocument()
      expect(errorIcon).toHaveAttribute('aria-hidden', 'true')

      // Buttons should be properly labeled
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument()
    })

    it('should use SimpleErrorFallback with alert role', () => {
      render(<SimpleErrorFallback error={new Error('Accessibility test')} />)

      const alertElement = screen.getByRole('alert')
      expect(alertElement).toBeInTheDocument()
      expect(alertElement).toHaveTextContent('Something went wrong')
      expect(alertElement).toHaveTextContent('Accessibility test')
    })
  })

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <ErrorBoundary className="custom-error-boundary">
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      // Find the outermost container with the custom class
      const errorBoundaryContainer = container.querySelector('.custom-error-boundary')
      expect(errorBoundaryContainer).toBeInTheDocument()
      expect(errorBoundaryContainer).toHaveClass('custom-error-boundary')
    })

    it('should merge custom className with default styles', () => {
      const { container } = render(
        <ErrorBoundary className="bg-red-100">
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      // Find the container with the custom class
      const errorBoundaryContainer = container.querySelector('.bg-red-100')
      expect(errorBoundaryContainer).toBeInTheDocument()
      expect(errorBoundaryContainer).toHaveClass('bg-red-100')
      expect(errorBoundaryContainer?.className).toContain('min-h-[400px]')
    })
  })
})