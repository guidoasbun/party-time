import { render, screen, waitFor } from "../../../../test-utils/test-utils"
import userEvent from '@testing-library/user-event'
import { RegisterForm } from '../RegisterForm'

// Mock the useAuth hook
const mockRegisterUser = jest.fn()

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    register: mockRegisterUser,
    isRegistering: false,
    registerError: null,
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

describe('RegisterForm', () => {
  const user = userEvent.setup()

  const defaultProps = {
    onSuccess: jest.fn(),
    onSwitchToLogin: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all form elements', () => {
    render(<RegisterForm {...defaultProps} />)
    
    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty fields', async () => {
    render(<RegisterForm {...defaultProps} />)
    
    const submitButton = screen.getByRole('button', { name: /create account/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument()
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for short name', async () => {
    render(<RegisterForm {...defaultProps} />)
    
    const nameInput = screen.getByLabelText(/full name/i)
    await user.type(nameInput, 'A')
    
    const submitButton = screen.getByRole('button', { name: /create account/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument()
    })
  })

  it('shows validation errors for weak password', async () => {
    render(<RegisterForm {...defaultProps} />)
    
    const nameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    
    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'john@example.com')
    await user.type(passwordInput, '123')
    
    const submitButton = screen.getByRole('button', { name: /create account/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for password without uppercase', async () => {
    render(<RegisterForm {...defaultProps} />)
    
    const passwordInput = screen.getByLabelText(/^password$/i)
    await user.type(passwordInput, 'password123!')
    
    const submitButton = screen.getByRole('button', { name: /create account/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/password must contain at least one uppercase letter/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for password without lowercase', async () => {
    render(<RegisterForm {...defaultProps} />)
    
    const passwordInput = screen.getByLabelText(/^password$/i)
    await user.type(passwordInput, 'PASSWORD123!')
    
    const submitButton = screen.getByRole('button', { name: /create account/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/password must contain at least one lowercase letter/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for password without number', async () => {
    render(<RegisterForm {...defaultProps} />)
    
    const passwordInput = screen.getByLabelText(/^password$/i)
    await user.type(passwordInput, 'Password!')
    
    const submitButton = screen.getByRole('button', { name: /create account/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/password must contain at least one number/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for password without special character', async () => {
    render(<RegisterForm {...defaultProps} />)
    
    const passwordInput = screen.getByLabelText(/^password$/i)
    await user.type(passwordInput, 'Password123')
    
    const submitButton = screen.getByRole('button', { name: /create account/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/password must contain at least one special character/i)).toBeInTheDocument()
    })
  })

  it('shows validation error when passwords do not match', async () => {
    render(<RegisterForm {...defaultProps} />)
    
    const nameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    
    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'john@example.com')
    await user.type(passwordInput, 'Password123!')
    await user.type(confirmPasswordInput, 'DifferentPassword123!')
    
    const submitButton = screen.getByRole('button', { name: /create account/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/passwords don't match/i)).toBeInTheDocument()
    })
  })

  it('toggles password visibility', async () => {
    render(<RegisterForm {...defaultProps} />)
    
    const passwordInput = screen.getByLabelText(/^password$/i) as HTMLInputElement
    const toggleButtons = screen.getAllByRole('button', { name: /show/i })
    const passwordToggle = toggleButtons[0] // First show button is for password
    
    expect(passwordInput.type).toBe('password')
    
    await user.click(passwordToggle)
    expect(passwordInput.type).toBe('text')
    
    await user.click(passwordToggle)
    expect(passwordInput.type).toBe('password')
  })

  it('toggles confirm password visibility', async () => {
    render(<RegisterForm {...defaultProps} />)
    
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i) as HTMLInputElement
    const toggleButtons = screen.getAllByRole('button', { name: /show/i })
    const confirmPasswordToggle = toggleButtons[1] // Second show button is for confirm password
    
    expect(confirmPasswordInput.type).toBe('password')
    
    await user.click(confirmPasswordToggle)
    expect(confirmPasswordInput.type).toBe('text')
    
    await user.click(confirmPasswordToggle)
    expect(confirmPasswordInput.type).toBe('password')
  })

  it('submits form with valid data and handles success', async () => {
    mockRegisterUser.mockResolvedValue(undefined)
    render(<RegisterForm {...defaultProps} />)
    
    const nameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /create account/i })
    
    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'john@example.com')
    await user.type(passwordInput, 'Password123!')
    await user.type(confirmPasswordInput, 'Password123!')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockRegisterUser).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!'
      })
      expect(defaultProps.onSuccess).toHaveBeenCalledWith('john@example.com')
    })
  })

  it('handles registration failure', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
    mockRegisterUser.mockRejectedValue(new Error('Email already exists'))
    render(<RegisterForm {...defaultProps} />)
    
    const nameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /create account/i })
    
    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'existing@example.com')
    await user.type(passwordInput, 'Password123!')
    await user.type(confirmPasswordInput, 'Password123!')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith('Registration failed:', expect.any(Error))
    })
    
    consoleError.mockRestore()
  })

  it('allows typing in all form fields', async () => {
    render(<RegisterForm {...defaultProps} />)
    
    const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement
    const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement
    const passwordInput = screen.getByLabelText(/^password$/i) as HTMLInputElement
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i) as HTMLInputElement
    
    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'john@example.com')
    await user.type(passwordInput, 'Password123!')
    await user.type(confirmPasswordInput, 'Password123!')
    
    expect(nameInput.value).toBe('John Doe')
    expect(emailInput.value).toBe('john@example.com')
    expect(passwordInput.value).toBe('Password123!')
    expect(confirmPasswordInput.value).toBe('Password123!')
  })

  it('handles switch to login', async () => {
    render(<RegisterForm {...defaultProps} />)
    
    const switchButton = screen.getByRole('button', { name: /sign in here/i })
    await user.click(switchButton)
    
    expect(defaultProps.onSwitchToLogin).toHaveBeenCalled()
  })

  it('does not render switch to login button when callback not provided', () => {
    render(<RegisterForm {...defaultProps} onSwitchToLogin={undefined} />)
    
    expect(screen.queryByText(/sign in here/i)).not.toBeInTheDocument()
  })
})