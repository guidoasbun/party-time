import { renderHook } from '../../../__tests__/test-utils'
import { useAuth } from '../useAuth'
import { signIn, signOut, useSession } from 'next-auth/react'

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}))

// Mock auth queries
const mockUseCurrentUser = jest.fn()
const mockUseRegister = jest.fn()
const mockUseVerifyEmail = jest.fn()
const mockUseResendVerification = jest.fn()
const mockUsePasswordReset = jest.fn()
const mockUsePasswordResetConfirm = jest.fn()

jest.mock('@/lib/queries/auth', () => ({
  useCurrentUser: () => mockUseCurrentUser(),
  useRegister: () => mockUseRegister(),
  useVerifyEmail: () => mockUseVerifyEmail(),
  useResendVerification: () => mockUseResendVerification(),
  usePasswordReset: () => mockUsePasswordReset(),
  usePasswordResetConfirm: () => mockUsePasswordResetConfirm(),
}))

const mockSignIn = signIn as jest.MockedFunction<typeof signIn>
const mockSignOut = signOut as jest.MockedFunction<typeof signOut>
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>

describe('useAuth', () => {
  const mockRegisterMutation = {
    mutateAsync: jest.fn(),
    isPending: false,
    error: null as Error | null,
    reset: jest.fn(),
  }

  const mockVerifyEmailMutation = {
    mutateAsync: jest.fn(),
    isPending: false,
    error: null as Error | null,
    reset: jest.fn(),
  }

  const mockResendVerificationMutation = {
    mutateAsync: jest.fn(),
    isPending: false,
    error: null as Error | null,
    reset: jest.fn(),
  }

  const mockPasswordResetMutation = {
    mutateAsync: jest.fn(),
    isPending: false,
    error: null as Error | null,
    reset: jest.fn(),
  }

  const mockPasswordResetConfirmMutation = {
    mutateAsync: jest.fn(),
    isPending: false,
    error: null as Error | null,
    reset: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock useSession default
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn()
    })

    // Mock mutations
    mockUseRegister.mockReturnValue(mockRegisterMutation)
    mockUseVerifyEmail.mockReturnValue(mockVerifyEmailMutation)
    mockUseResendVerification.mockReturnValue(mockResendVerificationMutation)
    mockUsePasswordReset.mockReturnValue(mockPasswordResetMutation)
    mockUsePasswordResetConfirm.mockReturnValue(mockPasswordResetConfirmMutation)

    // Mock current user query
    mockUseCurrentUser.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    })
  })

  describe('Auth State', () => {
    it('returns correct loading state when session is loading', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading',
        update: jest.fn()
      })

      const { result } = renderHook(() => useAuth())

      expect(result.current.isLoading).toBe(true)
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('returns correct loading state when user is loading', () => {
      mockUseCurrentUser.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      })

      const { result } = renderHook(() => useAuth())

      expect(result.current.isLoading).toBe(true)
    })

    it('returns authenticated state when session exists', () => {
      mockUseSession.mockReturnValue({
        data: { user: { email: 'test@example.com' }, expires: '2024-12-31T23:59:59Z' },
        status: 'authenticated',
        update: jest.fn()
      })

      const { result } = renderHook(() => useAuth())

      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.session).toEqual({ user: { email: 'test@example.com' }, expires: '2024-12-31T23:59:59Z' })
    })

    it('returns email verified state when user has verified email', () => {
      mockUseCurrentUser.mockReturnValue({
        data: { email_verified: true },
        isLoading: false,
        error: null,
      })

      const { result } = renderHook(() => useAuth())

      expect(result.current.isEmailVerified).toBe(true)
    })

    it('returns email not verified when user has unverified email', () => {
      mockUseCurrentUser.mockReturnValue({
        data: { email_verified: false },
        isLoading: false,
        error: null,
      })

      const { result } = renderHook(() => useAuth())

      expect(result.current.isEmailVerified).toBe(false)
    })
  })

  describe('Authentication Methods', () => {
    it('calls signIn with credentials on login', async () => {
      mockSignIn.mockResolvedValue({ ok: true, error: null, status: 200, url: null })

      const { result } = renderHook(() => useAuth())

      await result.current.login('test@example.com', 'password')

      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: 'test@example.com',
        password: 'password',
        redirect: false,
      })
    })

    it('throws error on login failure', async () => {
      mockSignIn.mockResolvedValue({ ok: false, error: 'Invalid credentials', status: 401, url: null })
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})

      const { result } = renderHook(() => useAuth())

      await expect(result.current.login('test@example.com', 'wrong')).rejects.toThrow('Invalid credentials')
      expect(consoleError).toHaveBeenCalled()

      consoleError.mockRestore()
    })

    it('calls signIn with Google provider on Google login', async () => {
      mockSignIn.mockResolvedValue(undefined)

      const { result } = renderHook(() => useAuth())

      await result.current.loginWithGoogle()

      expect(mockSignIn).toHaveBeenCalledWith('google', {
        callbackUrl: '/dashboard',
        redirect: true
      })
    })

    it('calls signOut on logout', async () => {
      mockSignOut.mockResolvedValue(undefined)

      const { result } = renderHook(() => useAuth())

      await result.current.logout()

      expect(mockSignOut).toHaveBeenCalledWith({
        callbackUrl: '/',
        redirect: true
      })
    })
  })

  describe('Registration Methods', () => {
    it('calls register mutation with correct data', async () => {
      const registerData = { name: 'John', email: 'john@example.com', password: 'password' }
      mockRegisterMutation.mutateAsync.mockResolvedValue({ success: true })

      const { result } = renderHook(() => useAuth())

      await result.current.register(registerData)

      expect(mockRegisterMutation.mutateAsync).toHaveBeenCalledWith(registerData)
    })

    it('handles register error and logs it', async () => {
      const error = new Error('Registration failed')
      mockRegisterMutation.mutateAsync.mockRejectedValue(error)
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})

      const { result } = renderHook(() => useAuth())

      await expect(result.current.register({ name: 'John', email: 'john@example.com', password: 'password' }))
        .rejects.toThrow('Registration failed')
      
      expect(consoleError).toHaveBeenCalledWith('Registration failed:', error)
      consoleError.mockRestore()
    })

    it('calls verify email mutation with correct data', async () => {
      const verifyData = { email: 'test@example.com', verification_code: '123456' }
      mockVerifyEmailMutation.mutateAsync.mockResolvedValue({ verified: true })

      const { result } = renderHook(() => useAuth())

      await result.current.verifyEmail(verifyData)

      expect(mockVerifyEmailMutation.mutateAsync).toHaveBeenCalledWith(verifyData)
    })

    it('calls resend verification with correct email', async () => {
      mockResendVerificationMutation.mutateAsync.mockResolvedValue({ message: 'Code sent' })

      const { result } = renderHook(() => useAuth())

      await result.current.resendVerification('test@example.com')

      expect(mockResendVerificationMutation.mutateAsync).toHaveBeenCalledWith({ email: 'test@example.com' })
    })
  })

  describe('Password Reset Methods', () => {
    it('calls password reset mutation with correct data', async () => {
      const resetData = { email: 'test@example.com' }
      mockPasswordResetMutation.mutateAsync.mockResolvedValue({ message: 'Reset sent' })

      const { result } = renderHook(() => useAuth())

      await result.current.requestPasswordReset(resetData)

      expect(mockPasswordResetMutation.mutateAsync).toHaveBeenCalledWith(resetData)
    })

    it('calls password reset confirm mutation with correct data', async () => {
      const confirmData = { email: 'test@example.com', confirmation_code: '123456', new_password: 'newpass' }
      mockPasswordResetConfirmMutation.mutateAsync.mockResolvedValue({ message: 'Password reset' })

      const { result } = renderHook(() => useAuth())

      await result.current.confirmPasswordReset(confirmData)

      expect(mockPasswordResetConfirmMutation.mutateAsync).toHaveBeenCalledWith(confirmData)
    })
  })

  describe('Loading and Error States', () => {
    it('returns correct loading states', () => {
      mockRegisterMutation.isPending = true
      mockVerifyEmailMutation.isPending = true

      const { result } = renderHook(() => useAuth())

      expect(result.current.isRegistering).toBe(true)
      expect(result.current.isVerifyingEmail).toBe(true)
      expect(result.current.isResendingVerification).toBe(false)
    })

    it('returns correct error states', () => {
      const registerError = new Error('Register error')
      const verifyError = new Error('Verify error')
      
      mockRegisterMutation.error = registerError
      mockVerifyEmailMutation.error = verifyError

      const { result } = renderHook(() => useAuth())

      expect(result.current.registerError).toBe(registerError)
      expect(result.current.verifyEmailError).toBe(verifyError)
    })

    it('provides reset functions for clearing states', () => {
      const { result } = renderHook(() => useAuth())

      result.current.resetRegister()
      result.current.resetVerifyEmail()

      expect(mockRegisterMutation.reset).toHaveBeenCalled()
      expect(mockVerifyEmailMutation.reset).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('handles and logs errors for all auth methods', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
      const error = new Error('Test error')

      // Test all error cases
      mockSignIn.mockRejectedValue(error)
      mockSignOut.mockRejectedValue(error)
      mockVerifyEmailMutation.mutateAsync.mockRejectedValue(error)
      mockResendVerificationMutation.mutateAsync.mockRejectedValue(error)
      mockPasswordResetMutation.mutateAsync.mockRejectedValue(error)
      mockPasswordResetConfirmMutation.mutateAsync.mockRejectedValue(error)

      const { result } = renderHook(() => useAuth())

      await expect(result.current.loginWithGoogle()).rejects.toThrow()
      await expect(result.current.logout()).rejects.toThrow()
      await expect(result.current.verifyEmail({ email: 'test', verification_code: '123' })).rejects.toThrow()
      await expect(result.current.resendVerification('test')).rejects.toThrow()
      await expect(result.current.requestPasswordReset({ email: 'test' })).rejects.toThrow()
      await expect(result.current.confirmPasswordReset({ email: 'test', confirmation_code: '123', new_password: 'new' })).rejects.toThrow()

      expect(consoleError).toHaveBeenCalledTimes(6)
      consoleError.mockRestore()
    })
  })
})