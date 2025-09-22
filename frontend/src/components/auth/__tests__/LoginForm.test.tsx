import { render, screen, waitFor } from "../../../../test-utils/test-utils"
import userEvent from '@testing-library/user-event'
import { LoginForm } from '../LoginForm'

// Mock the useAuth hook
const mockLogin = jest.fn()
const mockLoginWithGoogle = jest.fn()

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    login: mockLogin,
    loginWithGoogle: mockLoginWithGoogle,
  }),
}))

// Mock the Button component
jest.mock('@/components/ui/Button', () => ({
  Button: ({ children, ...props }: React.ComponentProps<'button'>) => <button {...props}>{children}</button>,
}))

// Mock the error utility
jest.mock('@/lib/queries/auth', () => ({
  getErrorMessage: (error: unknown) => {
    if (typeof error === 'string') return error
    return (error as Error)?.message || 'An error occurred'
  },
}))

describe('LoginForm', () => {
  const user = userEvent.setup()

  const defaultProps = {
    onSuccess: jest.fn(),
    onSwitchToRegister: jest.fn(),
    onForgotPassword: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all form elements', () => {
    render(<LoginForm {...defaultProps} />)
    
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /forgot your password/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty fields', async () => {
    render(<LoginForm {...defaultProps} />)
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })

  it('allows typing in email and password fields', async () => {
    render(<LoginForm {...defaultProps} />)
    
    const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    
    expect(emailInput.value).toBe('test@example.com')
    expect(passwordInput.value).toBe('password123')
  })

  it('toggles password visibility', async () => {
    render(<LoginForm {...defaultProps} />)
    
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement
    const toggleButton = screen.getByRole('button', { name: /show/i })
    
    expect(passwordInput.type).toBe('password')
    
    await user.click(toggleButton)
    expect(passwordInput.type).toBe('text')
    expect(screen.getByRole('button', { name: /hide/i })).toBeInTheDocument()
    
    await user.click(toggleButton)
    expect(passwordInput.type).toBe('password')
  })

  it('submits form with valid data and handles success', async () => {
    mockLogin.mockResolvedValue({ ok: true })
    render(<LoginForm {...defaultProps} />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
      expect(defaultProps.onSuccess).toHaveBeenCalled()
    })
  })

  it('handles login failure and displays error message', async () => {
    mockLogin.mockResolvedValue({ ok: false, error: 'Invalid credentials' })
    render(<LoginForm {...defaultProps} />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
  })

  it('handles login exception and displays generic error', async () => {
    mockLogin.mockRejectedValue(new Error('Network error'))
    render(<LoginForm {...defaultProps} />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument()
    })
  })

  it('shows loading state during form submission', async () => {
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    render(<LoginForm {...defaultProps} />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    expect(screen.getByText(/signing in.../i)).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
    
    await waitFor(() => {
      expect(screen.getByText(/sign in/i)).toBeInTheDocument()
    })
  })

  it('handles Google login', async () => {
    mockLoginWithGoogle.mockResolvedValue(undefined)
    render(<LoginForm {...defaultProps} />)
    
    const googleButton = screen.getByRole('button', { name: /continue with google/i })
    await user.click(googleButton)
    
    expect(mockLoginWithGoogle).toHaveBeenCalled()
  })

  it('handles Google login error', async () => {
    mockLoginWithGoogle.mockRejectedValue(new Error('Google login failed'))
    render(<LoginForm {...defaultProps} />)
    
    const googleButton = screen.getByRole('button', { name: /continue with google/i })
    await user.click(googleButton)
    
    await waitFor(() => {
      expect(screen.getByText(/google login failed/i)).toBeInTheDocument()
    })
  })

  it('handles forgot password click with email', async () => {
    render(<LoginForm {...defaultProps} />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const forgotPasswordButton = screen.getByRole('button', { name: /forgot your password/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.click(forgotPasswordButton)
    
    expect(defaultProps.onForgotPassword).toHaveBeenCalledWith('test@example.com')
  })

  it('handles forgot password click without email', async () => {
    render(<LoginForm {...defaultProps} />)
    
    const forgotPasswordButton = screen.getByRole('button', { name: /forgot your password/i })
    await user.click(forgotPasswordButton)
    
    expect(defaultProps.onForgotPassword).toHaveBeenCalledWith('')
  })

  it('handles switch to register', async () => {
    render(<LoginForm {...defaultProps} />)
    
    const switchButton = screen.getByRole('button', { name: /sign up here/i })
    await user.click(switchButton)
    
    expect(defaultProps.onSwitchToRegister).toHaveBeenCalled()
  })

  it('does not render switch to register button when callback not provided', () => {
    render(<LoginForm {...defaultProps} onSwitchToRegister={undefined} />)
    
    expect(screen.queryByText(/sign up here/i)).not.toBeInTheDocument()
  })

  it('clears error message when new submission starts', async () => {
    mockLogin
      .mockResolvedValueOnce({ ok: false, error: 'Invalid credentials' })
      .mockResolvedValueOnce({ ok: true })
    
    render(<LoginForm {...defaultProps} />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    // First submission with error
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
    
    // Second submission should clear error
    await user.clear(passwordInput)
    await user.type(passwordInput, 'correctpassword')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.queryByText(/invalid credentials/i)).not.toBeInTheDocument()
      expect(defaultProps.onSuccess).toHaveBeenCalled()
    })
  })
})