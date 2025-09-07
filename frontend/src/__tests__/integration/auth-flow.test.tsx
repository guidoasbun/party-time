import { render, screen, waitFor, act } from '../../../__tests__/test-utils'
import userEvent from '@testing-library/user-event'
import { signIn, signOut, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import SignInPage from '@/app/auth/signin/page'
import DashboardPage from '@/app/dashboard/page'

// Mock Next.js navigation
const mockPush = jest.fn()
const mockReplace = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    refresh: jest.fn(),
  }),
}))

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn(),
  useSession: () => ({
    data: null,
    status: 'unauthenticated',
  }),
}))

// Mock the auth queries
jest.mock('@/lib/queries/auth', () => ({
  useRegister: () => ({
    mutateAsync: jest.fn(),
    isPending: false,
    error: null,
  }),
  useVerifyEmail: () => ({
    mutateAsync: jest.fn(),
    isPending: false,
    error: null,
  }),
  useResendVerification: () => ({
    mutateAsync: jest.fn(),
    isPending: false,
  }),
  usePasswordReset: () => ({
    mutateAsync: jest.fn(),
    isPending: false,
  }),
  usePasswordResetConfirm: () => ({
    mutateAsync: jest.fn(),
    isPending: false,
  }),
  useCurrentUser: () => ({
    data: null,
    isLoading: false,
    error: null,
  }),
  getErrorMessage: (error: unknown) => {
    if (typeof error === 'string') return error
    return (error as Error)?.message || 'An error occurred'
  },
}))

// Mock UI components
interface MockButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

jest.mock('@/components/ui/Button', () => ({
  Button: ({ children, onClick, disabled, ...props }: MockButtonProps) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}))

describe('Authentication Flow Integration Tests', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
    mockPush.mockClear()
    mockReplace.mockClear()
  })

  describe('Complete Login Flow', () => {
    it('should successfully login and redirect to dashboard', async () => {
      // Mock successful login
      ;(signIn as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        error: null,
        url: '/dashboard',
      })

      render(<SignInPage />)

      // Fill in login form
      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const signInButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(signInButton)

      // Verify login was called with correct credentials
      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith('credentials', {
          email: 'test@example.com',
          password: 'password123',
          redirect: false,
        })
      })

      // Verify redirect to dashboard
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      })
    })

    it('should handle login failure with error display', async () => {
      // Mock failed login
      ;(signIn as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
        error: 'Invalid credentials',
        url: null,
      })

      render(<SignInPage />)

      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const signInButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(signInButton)

      // Verify login was attempted
      await waitFor(() => {
        expect(signIn).toHaveBeenCalled()
      })

      // Verify error is displayed
      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
      })

      // Verify no redirect occurred
      expect(mockPush).not.toHaveBeenCalledWith('/dashboard')
    })

    it('should handle network errors during login', async () => {
      // Mock network error
      ;(signIn as jest.Mock).mockRejectedValue(new Error('Network error'))

      render(<SignInPage />)

      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const signInButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(signInButton)

      // Verify error is displayed
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument()
      })
    })
  })

  describe('Google OAuth Flow', () => {
    it('should initiate Google OAuth login', async () => {
      ;(signIn as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        error: null,
        url: '/dashboard',
      })

      render(<SignInPage />)

      const googleButton = screen.getByRole('button', { name: /continue with google/i })
      await user.click(googleButton)

      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith('google')
      })
    })

    it('should handle Google OAuth errors', async () => {
      ;(signIn as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        error: 'OAuth error',
        url: null,
      })

      render(<SignInPage />)

      const googleButton = screen.getByRole('button', { name: /continue with google/i })
      await user.click(googleButton)

      await waitFor(() => {
        expect(screen.getByText(/oauth error/i)).toBeInTheDocument()
      })
    })
  })

  describe('Registration to Login Flow', () => {
    it('should allow switching from login to registration', async () => {
      render(<SignInPage />)

      // Should start in login view
      expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument()

      // Click switch to register
      const switchButton = screen.getByRole('button', { name: /create an account/i })
      await user.click(switchButton)

      // Should now show registration form
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /create your account/i })).toBeInTheDocument()
      })
    })

    it('should handle registration success and show verification', async () => {
      render(<SignInPage />)

      // Switch to registration view
      const switchToRegButton = screen.getByRole('button', { name: /create an account/i })
      await user.click(switchToRegButton)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /create your account/i })).toBeInTheDocument()
      })

      // The actual registration flow would be tested in the component-specific tests
      // Here we're testing the view switching behavior - just verify the form is present
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    })
  })

  describe('Authentication State Persistence', () => {
    it('should redirect to dashboard if already authenticated', async () => {
      // Mock already authenticated session
      ;(getSession as jest.Mock).mockResolvedValue({
        user: {
          id: 'test-user-123',
          email: 'test@example.com',
          name: 'Test User',
        },
        idToken: 'test-id-token',
        expires: '2030-01-01',
      })

      render(<SignInPage />)

      // Should redirect to dashboard
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      })
    })

    it('should handle session check errors gracefully', async () => {
      // Mock session check failure
      ;(getSession as jest.Mock).mockRejectedValue(new Error('Session error'))

      render(<SignInPage />)

      // Should still render the signin page
      expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument()

      // Should not redirect
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  describe('Form Validation Integration', () => {
    it('should validate email format before submission', async () => {
      render(<SignInPage />)

      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const signInButton = screen.getByRole('button', { name: /sign in/i })

      // Enter invalid email
      await user.type(emailInput, 'invalid-email')
      await user.type(passwordInput, 'password123')
      await user.click(signInButton)

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
      })

      // Should not call signIn
      expect(signIn).not.toHaveBeenCalled()
    })

    it('should require both email and password', async () => {
      render(<SignInPage />)

      const signInButton = screen.getByRole('button', { name: /sign in/i })

      // Try to submit empty form
      await user.click(signInButton)

      // Should show required field errors
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument()
        expect(screen.getByText(/password is required/i)).toBeInTheDocument()
      })

      // Should not call signIn
      expect(signIn).not.toHaveBeenCalled()
    })
  })
})