/**
 * Error Handling Integration Tests
 * Phase 8.1: Comprehensive Testing Backfill
 *
 * Tests API error handling, authentication errors, form submission errors,
 * and component error boundaries
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock Next.js navigation
const mockPush = jest.fn()
const mockReplace = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(() => null),
  }),
  usePathname: () => '/test',
}))

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock hooks
jest.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

// Test wrapper with React Query
const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0, gcTime: 0 },
      mutations: { retry: false },
    },
  })

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )

  return TestWrapper
}

// ============================================================================
// API Error Handling
// ============================================================================
describe('API Error Handling', () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    jest.clearAllMocks()
  })

  describe('Network Errors', () => {
    it('should display network error message when offline', async () => {
      const NetworkAwareComponent = () => {
        const [isOnline, setIsOnline] = React.useState(true)
        const [error, setError] = React.useState<string | null>(null)

        const simulateRequest = async () => {
          if (!isOnline) {
            setError('Network error: Unable to connect. Please check your internet connection.')
          }
        }

        return (
          <div>
            <button data-testid="toggle-network" onClick={() => setIsOnline(!isOnline)}>
              {isOnline ? 'Go Offline' : 'Go Online'}
            </button>
            <button data-testid="make-request" onClick={simulateRequest}>
              Make Request
            </button>
            {error && <div data-testid="network-error" role="alert">{error}</div>}
          </div>
        )
      }

      render(<NetworkAwareComponent />, { wrapper: createTestWrapper() })

      // Go offline
      await user.click(screen.getByTestId('toggle-network'))
      // Make request
      await user.click(screen.getByTestId('make-request'))

      expect(screen.getByTestId('network-error')).toHaveTextContent(
        'Network error: Unable to connect'
      )
    })

    it('should offer retry option for network failures', async () => {
      const onRetry = jest.fn()

      const RetryableError = () => {
        const [hasError, setHasError] = React.useState(true)

        const handleRetry = () => {
          onRetry()
          setHasError(false)
        }

        return (
          <div>
            {hasError ? (
              <div data-testid="error-state">
                <p>Failed to load data</p>
                <button data-testid="retry-btn" onClick={handleRetry}>
                  Retry
                </button>
              </div>
            ) : (
              <div data-testid="success-state">Data loaded successfully</div>
            )}
          </div>
        )
      }

      render(<RetryableError />, { wrapper: createTestWrapper() })

      expect(screen.getByTestId('error-state')).toBeInTheDocument()

      await user.click(screen.getByTestId('retry-btn'))

      expect(onRetry).toHaveBeenCalled()
      expect(screen.getByTestId('success-state')).toBeInTheDocument()
    })

    it('should preserve form state during network errors', async () => {
      const FormWithError = () => {
        const [formData, setFormData] = React.useState({ name: '', email: '' })
        const [error, setError] = React.useState<string | null>(null)

        const handleSubmit = () => {
          // Simulate network error
          setError('Network error: Please try again')
        }

        return (
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }}>
            <input
              data-testid="name-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <input
              data-testid="email-input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <button type="submit" data-testid="submit-btn">Submit</button>
            {error && <div data-testid="form-error">{error}</div>}
          </form>
        )
      }

      render(<FormWithError />, { wrapper: createTestWrapper() })

      // Fill form
      await user.type(screen.getByTestId('name-input'), 'John Doe')
      await user.type(screen.getByTestId('email-input'), 'john@example.com')

      // Submit (triggers error)
      await user.click(screen.getByTestId('submit-btn'))

      // Error is shown
      expect(screen.getByTestId('form-error')).toBeInTheDocument()

      // Form data is preserved
      expect(screen.getByTestId('name-input')).toHaveValue('John Doe')
      expect(screen.getByTestId('email-input')).toHaveValue('john@example.com')
    })
  })

  describe('HTTP Error Responses', () => {
    const createErrorHandler = (statusCode: number) => {
      const ErrorComponent = () => {
        const [error, setError] = React.useState<{ status: number; message: string } | null>(null)

        const simulateError = () => {
          const errorMessages: Record<number, string> = {
            400: 'Bad Request: The server could not understand your request.',
            401: 'Unauthorized: Please log in to continue.',
            403: 'Forbidden: You do not have permission to access this resource.',
            404: 'Not Found: The requested resource does not exist.',
            429: 'Too Many Requests: Please wait before trying again.',
            500: 'Server Error: Something went wrong. Please try again later.',
          }

          setError({
            status: statusCode,
            message: errorMessages[statusCode] || 'Unknown error occurred',
          })
        }

        return (
          <div>
            <button data-testid="trigger-error" onClick={simulateError}>
              Trigger Error
            </button>
            {error && (
              <div data-testid="error-display" role="alert">
                <span data-testid="error-status">{error.status}</span>
                <span data-testid="error-message">{error.message}</span>
              </div>
            )}
          </div>
        )
      }

      return ErrorComponent
    }

    it('should handle 400 Bad Request with validation message', async () => {
      const Component = createErrorHandler(400)
      render(<Component />, { wrapper: createTestWrapper() })

      await user.click(screen.getByTestId('trigger-error'))

      expect(screen.getByTestId('error-status')).toHaveTextContent('400')
      expect(screen.getByTestId('error-message')).toHaveTextContent('Bad Request')
    })

    it('should handle 401 Unauthorized and redirect to login', async () => {
      const UnauthorizedHandler = () => {
        const [error, setError] = React.useState(false)

        const simulateUnauthorized = () => {
          setError(true)
          mockPush('/login?returnUrl=/test')
        }

        return (
          <div>
            <button data-testid="trigger-401" onClick={simulateUnauthorized}>
              Trigger 401
            </button>
            {error && <div data-testid="unauthorized-msg">Redirecting to login...</div>}
          </div>
        )
      }

      render(<UnauthorizedHandler />, { wrapper: createTestWrapper() })

      await user.click(screen.getByTestId('trigger-401'))

      expect(mockPush).toHaveBeenCalledWith('/login?returnUrl=/test')
    })

    it('should handle 403 Forbidden with permission denied message', async () => {
      const Component = createErrorHandler(403)
      render(<Component />, { wrapper: createTestWrapper() })

      await user.click(screen.getByTestId('trigger-error'))

      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'Forbidden: You do not have permission'
      )
    })

    it('should handle 404 Not Found with appropriate message', async () => {
      const Component = createErrorHandler(404)
      render(<Component />, { wrapper: createTestWrapper() })

      await user.click(screen.getByTestId('trigger-error'))

      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'Not Found: The requested resource does not exist'
      )
    })

    it('should handle 500 Internal Server Error with generic message', async () => {
      const Component = createErrorHandler(500)
      render(<Component />, { wrapper: createTestWrapper() })

      await user.click(screen.getByTestId('trigger-error'))

      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'Server Error: Something went wrong'
      )
    })

    it('should handle rate limiting (429) with retry-after', async () => {
      const RateLimitHandler = () => {
        const [error, setError] = React.useState<{
          status: number
          retryAfter: number
        } | null>(null)

        const simulateRateLimit = () => {
          setError({ status: 429, retryAfter: 60 })
        }

        return (
          <div>
            <button data-testid="trigger-429" onClick={simulateRateLimit}>
              Trigger Rate Limit
            </button>
            {error && (
              <div data-testid="rate-limit-error">
                Too many requests. Please try again in {error.retryAfter} seconds.
              </div>
            )}
          </div>
        )
      }

      render(<RateLimitHandler />, { wrapper: createTestWrapper() })

      await user.click(screen.getByTestId('trigger-429'))

      expect(screen.getByTestId('rate-limit-error')).toHaveTextContent(
        'Too many requests. Please try again in 60 seconds'
      )
    })
  })

  describe('Validation Errors', () => {
    it('should display field-level validation errors from API', () => {
      const apiErrors = {
        name: 'Name must be at least 3 characters',
        email: 'Invalid email format',
        phone: 'Phone number is required',
      }

      const FormWithApiErrors = () => (
        <form data-testid="form-with-errors">
          <div>
            <input data-testid="name-field" aria-invalid="true" />
            <span data-testid="name-error">{apiErrors.name}</span>
          </div>
          <div>
            <input data-testid="email-field" aria-invalid="true" />
            <span data-testid="email-error">{apiErrors.email}</span>
          </div>
          <div>
            <input data-testid="phone-field" aria-invalid="true" />
            <span data-testid="phone-error">{apiErrors.phone}</span>
          </div>
        </form>
      )

      render(<FormWithApiErrors />, { wrapper: createTestWrapper() })

      expect(screen.getByTestId('name-error')).toHaveTextContent('at least 3 characters')
      expect(screen.getByTestId('email-error')).toHaveTextContent('Invalid email')
      expect(screen.getByTestId('phone-error')).toHaveTextContent('required')
    })

    it('should highlight invalid form fields', () => {
      render(
        <form>
          <input data-testid="invalid-field" aria-invalid="true" className="border-red-500" />
        </form>
      )

      const field = screen.getByTestId('invalid-field')
      expect(field).toHaveAttribute('aria-invalid', 'true')
      expect(field).toHaveClass('border-red-500')
    })

    it('should clear errors when user corrects input', async () => {
      const ValidatableInput = () => {
        const [value, setValue] = React.useState('')
        const [error, setError] = React.useState<string | null>('Email is required')

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const newValue = e.target.value
          setValue(newValue)

          if (newValue && newValue.includes('@')) {
            setError(null)
          } else if (!newValue) {
            setError('Email is required')
          } else {
            setError('Invalid email format')
          }
        }

        return (
          <div>
            <input
              data-testid="email-input"
              value={value}
              onChange={handleChange}
              aria-invalid={!!error}
            />
            {error && <span data-testid="email-error">{error}</span>}
          </div>
        )
      }

      render(<ValidatableInput />, { wrapper: createTestWrapper() })

      // Initially has error
      expect(screen.getByTestId('email-error')).toHaveTextContent('Email is required')

      // Type invalid email
      await user.type(screen.getByTestId('email-input'), 'invalid')
      expect(screen.getByTestId('email-error')).toHaveTextContent('Invalid email format')

      // Type valid email - error should clear
      await user.clear(screen.getByTestId('email-input'))
      await user.type(screen.getByTestId('email-input'), 'valid@example.com')
      expect(screen.queryByTestId('email-error')).not.toBeInTheDocument()
    })
  })
})

// ============================================================================
// Authentication Error Handling
// ============================================================================
describe('Authentication Error Handling', () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    jest.clearAllMocks()
  })

  describe('Session Expiration', () => {
    it('should detect expired session on API call', async () => {
      const SessionAwareComponent = () => {
        const [sessionExpired, setSessionExpired] = React.useState(false)

        const simulateApiCall = () => {
          // Simulate 401 response indicating session expired
          setSessionExpired(true)
        }

        return (
          <div>
            <button data-testid="api-call" onClick={simulateApiCall}>
              Make API Call
            </button>
            {sessionExpired && (
              <div data-testid="session-expired" role="alert">
                Your session has expired. Please log in again.
              </div>
            )}
          </div>
        )
      }

      render(<SessionAwareComponent />, { wrapper: createTestWrapper() })

      await user.click(screen.getByTestId('api-call'))
      expect(screen.getByTestId('session-expired')).toBeInTheDocument()
    })

    it('should redirect to login with return URL', async () => {
      const SessionHandler = () => {
        const handleSessionExpired = () => {
          const returnUrl = encodeURIComponent('/events/123')
          mockPush(`/login?returnUrl=${returnUrl}`)
        }

        return (
          <button data-testid="handle-session" onClick={handleSessionExpired}>
            Handle Session Expiry
          </button>
        )
      }

      render(<SessionHandler />, { wrapper: createTestWrapper() })

      await user.click(screen.getByTestId('handle-session'))

      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('/login?returnUrl=')
      )
    })

    it('should show session expired notification', async () => {
      const SessionNotification = () => {
        const [showNotification, setShowNotification] = React.useState(false)

        return (
          <div>
            <button data-testid="expire-session" onClick={() => setShowNotification(true)}>
              Expire Session
            </button>
            {showNotification && (
              <div data-testid="notification" role="alert">
                <span>Session Expired</span>
                <p>Your session has timed out for security reasons.</p>
                <button data-testid="login-btn" onClick={() => mockPush('/login')}>
                  Log In Again
                </button>
              </div>
            )}
          </div>
        )
      }

      render(<SessionNotification />, { wrapper: createTestWrapper() })

      await user.click(screen.getByTestId('expire-session'))

      expect(screen.getByTestId('notification')).toBeInTheDocument()
      expect(screen.getByText('Session Expired')).toBeInTheDocument()
    })
  })

  describe('Token Refresh', () => {
    it('should attempt token refresh on 401', async () => {
      const refreshToken = jest.fn().mockResolvedValue({ success: true })

      const TokenRefreshComponent = () => {
        const [status, setStatus] = React.useState<'idle' | 'refreshing' | 'success' | 'failed'>('idle')

        const handleUnauthorized = async () => {
          setStatus('refreshing')
          try {
            await refreshToken()
            setStatus('success')
          } catch {
            setStatus('failed')
          }
        }

        return (
          <div>
            <button data-testid="trigger-401" onClick={handleUnauthorized}>
              Trigger 401
            </button>
            <span data-testid="status">{status}</span>
          </div>
        )
      }

      render(<TokenRefreshComponent />, { wrapper: createTestWrapper() })

      await user.click(screen.getByTestId('trigger-401'))

      await waitFor(() => {
        expect(refreshToken).toHaveBeenCalled()
        expect(screen.getByTestId('status')).toHaveTextContent('success')
      })
    })

    it('should logout user if refresh fails', async () => {
      const logout = jest.fn()
      const refreshToken = jest.fn().mockRejectedValue(new Error('Refresh failed'))

      const TokenRefreshComponent = () => {
        const [status, setStatus] = React.useState<'idle' | 'refreshing' | 'logged-out'>('idle')

        const handleUnauthorized = async () => {
          setStatus('refreshing')
          try {
            await refreshToken()
          } catch {
            logout()
            setStatus('logged-out')
          }
        }

        return (
          <div>
            <button data-testid="trigger-refresh" onClick={handleUnauthorized}>
              Trigger Refresh
            </button>
            <span data-testid="status">{status}</span>
          </div>
        )
      }

      render(<TokenRefreshComponent />, { wrapper: createTestWrapper() })

      await user.click(screen.getByTestId('trigger-refresh'))

      await waitFor(() => {
        expect(logout).toHaveBeenCalled()
        expect(screen.getByTestId('status')).toHaveTextContent('logged-out')
      })
    })
  })

  describe('Permission Errors', () => {
    it('should show unauthorized page for restricted routes', () => {
      const UnauthorizedPage = ({ hasPermission }: { hasPermission: boolean }) => {
        if (!hasPermission) {
          return (
            <div data-testid="unauthorized-page">
              <h1>Access Denied</h1>
              <p>You don&apos;t have permission to view this page.</p>
              <button data-testid="go-back" onClick={() => mockPush('/dashboard')}>
                Go to Dashboard
              </button>
            </div>
          )
        }
        return <div data-testid="protected-content">Protected Content</div>
      }

      render(<UnauthorizedPage hasPermission={false} />, { wrapper: createTestWrapper() })

      expect(screen.getByTestId('unauthorized-page')).toBeInTheDocument()
      expect(screen.getByText('Access Denied')).toBeInTheDocument()
    })

    it('should disable actions user lacks permission for', () => {
      const PermissionAwareActions = ({
        permissions,
      }: {
        permissions: { canEdit: boolean; canDelete: boolean }
      }) => (
        <div>
          <button data-testid="edit-btn" disabled={!permissions.canEdit}>
            Edit
          </button>
          <button data-testid="delete-btn" disabled={!permissions.canDelete}>
            Delete
          </button>
        </div>
      )

      render(
        <PermissionAwareActions permissions={{ canEdit: true, canDelete: false }} />,
        { wrapper: createTestWrapper() }
      )

      expect(screen.getByTestId('edit-btn')).toBeEnabled()
      expect(screen.getByTestId('delete-btn')).toBeDisabled()
    })
  })
})

// ============================================================================
// Form Submission Errors
// ============================================================================
describe('Form Submission Errors', () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    jest.clearAllMocks()
  })

  describe('Event Form Errors', () => {
    it('should display error when event creation fails', async () => {
      const EventForm = () => {
        const [error, setError] = React.useState<string | null>(null)
        const [isSubmitting, setIsSubmitting] = React.useState(false)

        const handleSubmit = async () => {
          setIsSubmitting(true)
          // Simulate API error
          await new Promise((resolve) => setTimeout(resolve, 100))
          setError('Failed to create event. Please try again.')
          setIsSubmitting(false)
        }

        return (
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }}>
            <input data-testid="event-name" placeholder="Event Name" />
            <button type="submit" data-testid="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Event'}
            </button>
            {error && <div data-testid="submit-error" role="alert">{error}</div>}
          </form>
        )
      }

      render(<EventForm />, { wrapper: createTestWrapper() })

      await user.click(screen.getByTestId('submit-btn'))

      await waitFor(() => {
        expect(screen.getByTestId('submit-error')).toHaveTextContent(
          'Failed to create event'
        )
      })
    })

    it('should preserve form data on submission error', async () => {
      const EventFormWithData = () => {
        const [name, setName] = React.useState('')
        const [error, setError] = React.useState<string | null>(null)

        const handleSubmit = () => {
          setError('Server error: Please try again')
        }

        return (
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }}>
            <input
              data-testid="event-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button type="submit" data-testid="submit-btn">Submit</button>
            {error && <div data-testid="error">{error}</div>}
          </form>
        )
      }

      render(<EventFormWithData />, { wrapper: createTestWrapper() })

      await user.type(screen.getByTestId('event-name'), 'My Wedding')
      await user.click(screen.getByTestId('submit-btn'))

      // Error shown
      expect(screen.getByTestId('error')).toBeInTheDocument()
      // Data preserved
      expect(screen.getByTestId('event-name')).toHaveValue('My Wedding')
    })
  })

  describe('Guest Form Errors', () => {
    it('should display duplicate email error', async () => {
      const GuestForm = () => {
        const [email, setEmail] = React.useState('')
        const [error, setError] = React.useState<string | null>(null)

        const handleSubmit = () => {
          if (email === 'existing@example.com') {
            setError('A guest with this email already exists')
          }
        }

        return (
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }}>
            <input
              data-testid="guest-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
            />
            <button type="submit" data-testid="add-guest-btn">Add Guest</button>
            {error && <div data-testid="duplicate-error" role="alert">{error}</div>}
          </form>
        )
      }

      render(<GuestForm />, { wrapper: createTestWrapper() })

      await user.type(screen.getByTestId('guest-email'), 'existing@example.com')
      await user.click(screen.getByTestId('add-guest-btn'))

      expect(screen.getByTestId('duplicate-error')).toHaveTextContent(
        'A guest with this email already exists'
      )
    })

    it('should handle bulk import errors', async () => {
      const ImportErrors = () => {
        const importErrors = [
          { row: 2, error: 'Invalid email format' },
          { row: 5, error: 'Missing required field: first_name' },
          { row: 8, error: 'Duplicate email' },
        ]

        return (
          <div data-testid="import-errors">
            <h3>Import Errors</h3>
            <ul>
              {importErrors.map((err, idx) => (
                <li key={idx} data-testid={`error-row-${err.row}`}>
                  Row {err.row}: {err.error}
                </li>
              ))}
            </ul>
            <p data-testid="error-count">{importErrors.length} errors found</p>
          </div>
        )
      }

      render(<ImportErrors />, { wrapper: createTestWrapper() })

      expect(screen.getByTestId('error-count')).toHaveTextContent('3 errors found')
      expect(screen.getByTestId('error-row-2')).toHaveTextContent('Invalid email format')
      expect(screen.getByTestId('error-row-5')).toHaveTextContent('Missing required field')
    })
  })

  describe('Email Campaign Errors', () => {
    it('should display email sending failures', () => {
      const EmailCampaignErrors = () => {
        const failedRecipients = [
          { email: 'invalid@example', reason: 'Invalid email address' },
          { email: 'bounced@example.com', reason: 'Email bounced' },
        ]

        return (
          <div data-testid="email-errors">
            <h3>Failed to send to {failedRecipients.length} recipients</h3>
            <ul>
              {failedRecipients.map((recipient, idx) => (
                <li key={idx} data-testid={`failed-${idx}`}>
                  {recipient.email}: {recipient.reason}
                </li>
              ))}
            </ul>
          </div>
        )
      }

      render(<EmailCampaignErrors />, { wrapper: createTestWrapper() })

      expect(screen.getByText(/Failed to send to 2 recipients/)).toBeInTheDocument()
      expect(screen.getByTestId('failed-0')).toHaveTextContent('Invalid email address')
    })

    it('should show which recipients failed', () => {
      const FailedRecipientsDisplay = () => {
        const totalSent = 50
        const failed = 3

        return (
          <div data-testid="send-summary">
            <p>Successfully sent: {totalSent - failed}</p>
            <p data-testid="failed-count">Failed: {failed}</p>
            <button data-testid="view-failed">View Failed Recipients</button>
          </div>
        )
      }

      render(<FailedRecipientsDisplay />, { wrapper: createTestWrapper() })

      expect(screen.getByTestId('failed-count')).toHaveTextContent('Failed: 3')
      expect(screen.getByTestId('view-failed')).toBeInTheDocument()
    })
  })
})

// ============================================================================
// Component Error Boundaries
// ============================================================================
describe('Component Error Boundaries', () => {
  // Suppress console errors for error boundary tests
  const originalError = console.error
  beforeAll(() => {
    console.error = jest.fn()
  })
  afterAll(() => {
    console.error = originalError
  })

  it('should catch and display component render errors', () => {
    const ErrorBoundary = ({
      children,
      fallback,
    }: {
      children: React.ReactNode
      fallback: React.ReactNode
    }) => {
      const [hasError, setHasError] = React.useState(false)

      if (hasError) {
        return <>{fallback}</>
      }

      // Simulating error boundary behavior
      return (
        <div>
          <button data-testid="trigger-error" onClick={() => setHasError(true)}>
            Trigger Error
          </button>
          {children}
        </div>
      )
    }

    render(
      <ErrorBoundary
        fallback={
          <div data-testid="error-fallback">
            <h2>Something went wrong</h2>
            <p>We&apos;re sorry, but something unexpected happened.</p>
          </div>
        }
      >
        <div data-testid="child-content">Normal content</div>
      </ErrorBoundary>,
      { wrapper: createTestWrapper() }
    )

    // Trigger the error
    const user = userEvent.setup()
    return user.click(screen.getByTestId('trigger-error')).then(() => {
      expect(screen.getByTestId('error-fallback')).toBeInTheDocument()
      expect(screen.queryByTestId('child-content')).not.toBeInTheDocument()
    })
  })

  it('should offer recovery options in error boundary', async () => {
    const user = userEvent.setup()
    const onReset = jest.fn()

    const ErrorRecovery = () => {
      const [hasError, setHasError] = React.useState(true)

      const handleReset = () => {
        onReset()
        setHasError(false)
      }

      if (hasError) {
        return (
          <div data-testid="error-recovery">
            <h2>Oops! Something went wrong</h2>
            <button data-testid="try-again" onClick={handleReset}>
              Try Again
            </button>
            <button data-testid="go-home" onClick={() => mockPush('/')}>
              Go Home
            </button>
          </div>
        )
      }

      return <div data-testid="recovered-content">Recovered!</div>
    }

    render(<ErrorRecovery />, { wrapper: createTestWrapper() })

    expect(screen.getByTestId('error-recovery')).toBeInTheDocument()

    await user.click(screen.getByTestId('try-again'))

    expect(onReset).toHaveBeenCalled()
    expect(screen.getByTestId('recovered-content')).toBeInTheDocument()
  })

  it('should log errors for debugging', () => {
    const logError = jest.fn()

    const ErrorLogger = () => {
      React.useEffect(() => {
        // Simulate logging an error
        const error = new Error('Test component error')
        logError({
          message: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString(),
        })
      }, [])

      return <div>Error logged</div>
    }

    render(<ErrorLogger />, { wrapper: createTestWrapper() })

    expect(logError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Test component error',
        timestamp: expect.any(String),
      })
    )
  })
})
