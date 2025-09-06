import { useSession, signIn, signOut } from 'next-auth/react'
import { 
  useRegister, 
  useVerifyEmail, 
  useResendVerification, 
  usePasswordReset, 
  usePasswordResetConfirm,
  useCurrentUser,
  type RegisterInput,
  type VerifyEmailInput,
  type PasswordResetInput,
  type PasswordResetConfirmInput
} from '@/lib/queries/auth'

export function useAuth() {
  const { data: session, status } = useSession()
  const { data: currentUser, isLoading: isLoadingUser, error: userError } = useCurrentUser()
  
  const registerMutation = useRegister()
  const verifyEmailMutation = useVerifyEmail()
  const resendVerificationMutation = useResendVerification()
  const passwordResetMutation = usePasswordReset()
  const passwordResetConfirmMutation = usePasswordResetConfirm()

  // Computed values
  const isLoading = status === 'loading' || isLoadingUser
  const isAuthenticated = !!session
  const isEmailVerified = currentUser?.email_verified ?? false

  // Authentication methods
  const login = async (email: string, password: string) => {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })
      
      if (result?.error) {
        throw new Error(result.error)
      }
      
      return result
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const loginWithGoogle = async () => {
    try {
      await signIn('google', { 
        callbackUrl: '/dashboard',
        redirect: true 
      })
    } catch (error) {
      console.error('Google login failed:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut({ 
        callbackUrl: '/',
        redirect: true 
      })
    } catch (error) {
      console.error('Logout failed:', error)
      throw error
    }
  }

  const register = async (data: RegisterInput) => {
    try {
      const result = await registerMutation.mutateAsync(data)
      return result
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    }
  }

  const verifyEmail = async (data: VerifyEmailInput) => {
    try {
      const result = await verifyEmailMutation.mutateAsync(data)
      return result
    } catch (error) {
      console.error('Email verification failed:', error)
      throw error
    }
  }

  const resendVerification = async (email: string) => {
    try {
      const result = await resendVerificationMutation.mutateAsync({ email })
      return result
    } catch (error) {
      console.error('Resend verification failed:', error)
      throw error
    }
  }

  const requestPasswordReset = async (data: PasswordResetInput) => {
    try {
      const result = await passwordResetMutation.mutateAsync(data)
      return result
    } catch (error) {
      console.error('Password reset request failed:', error)
      throw error
    }
  }

  const confirmPasswordReset = async (data: PasswordResetConfirmInput) => {
    try {
      const result = await passwordResetConfirmMutation.mutateAsync(data)
      return result
    } catch (error) {
      console.error('Password reset confirmation failed:', error)
      throw error
    }
  }

  // Loading states
  const isRegistering = registerMutation.isPending
  const isVerifyingEmail = verifyEmailMutation.isPending
  const isResendingVerification = resendVerificationMutation.isPending
  const isRequestingPasswordReset = passwordResetMutation.isPending
  const isConfirmingPasswordReset = passwordResetConfirmMutation.isPending

  // Error states
  const registerError = registerMutation.error
  const verifyEmailError = verifyEmailMutation.error
  const resendVerificationError = resendVerificationMutation.error
  const passwordResetError = passwordResetMutation.error
  const passwordResetConfirmError = passwordResetConfirmMutation.error

  return {
    // Auth state
    session,
    currentUser,
    isLoading,
    isAuthenticated,
    isEmailVerified,
    userError,

    // Auth methods
    login,
    loginWithGoogle,
    logout,
    register,
    verifyEmail,
    resendVerification,
    requestPasswordReset,
    confirmPasswordReset,

    // Loading states
    isRegistering,
    isVerifyingEmail,
    isResendingVerification,
    isRequestingPasswordReset,
    isConfirmingPasswordReset,

    // Error states
    registerError,
    verifyEmailError,
    resendVerificationError,
    passwordResetError,
    passwordResetConfirmError,

    // Reset functions (clear error/success states)
    resetRegister: registerMutation.reset,
    resetVerifyEmail: verifyEmailMutation.reset,
    resetResendVerification: resendVerificationMutation.reset,
    resetPasswordReset: passwordResetMutation.reset,
    resetPasswordResetConfirm: passwordResetConfirmMutation.reset,
  }
}