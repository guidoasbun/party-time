/**
 * React Query hooks for authentication
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authService } from '@/lib/api/services'
import {
  UserRegisterRequest,
  UserRegisterResponse,
  UserLoginRequest,
  UserLoginResponse,
  EmailVerificationRequest,
  EmailVerificationResponse,
  PasswordResetRequest,
  PasswordResetResponse,
  PasswordResetConfirmRequest,
  PasswordResetConfirmResponse,
  UserProfileResponse,
  UserProfileUpdateRequest,
  UserProfileUpdateResponse,
  ApiException
} from '@/types'

// Query keys for caching
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  profile: () => [...authKeys.user(), 'profile'] as const,
  status: () => [...authKeys.all, 'status'] as const,
} as const

// Custom hook for current user data
export const useCurrentUser = (options?: {
  enabled?: boolean
  staleTime?: number
  retry?: boolean | number
}) => {
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: () => authService.getCurrentUser(),
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
    retry: options?.retry ?? 1,
    enabled: options?.enabled ?? true,
    meta: {
      errorMessage: 'Failed to fetch user profile'
    }
  })
}

// Custom hook for auth status check
export const useAuthStatus = () => {
  return useQuery({
    queryKey: authKeys.status(),
    queryFn: () => authService.checkAuthStatus(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: false,
    refetchOnWindowFocus: false,
    meta: {
      errorMessage: 'Failed to check authentication status'
    }
  })
}

// Registration mutation
export const useRegister = (options?: {
  onSuccess?: (data: UserRegisterResponse) => void
  onError?: (error: ApiException) => void
}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UserRegisterRequest) => authService.register(data),
    onSuccess: (data) => {
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: authKeys.all })
      options?.onSuccess?.(data)
    },
    onError: (error: ApiException) => {
      console.error('Registration failed:', error)
      options?.onError?.(error)
    },
    meta: {
      errorMessage: 'Registration failed'
    }
  })
}

// Login mutation
export const useLogin = (options?: {
  onSuccess?: (data: UserLoginResponse) => void
  onError?: (error: ApiException) => void
}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UserLoginRequest) => authService.login(data),
    onSuccess: (data) => {
      // Invalidate all auth queries to refresh user data
      queryClient.invalidateQueries({ queryKey: authKeys.all })
      options?.onSuccess?.(data)
    },
    onError: (error: ApiException) => {
      console.error('Login failed:', error)
      options?.onError?.(error)
    },
    meta: {
      errorMessage: 'Login failed'
    }
  })
}

// Logout mutation
export const useLogout = (options?: {
  onSuccess?: () => void
  onError?: (error: ApiException) => void
}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      // Clear all cached data on logout
      queryClient.clear()
      options?.onSuccess?.()
    },
    onError: (error: ApiException) => {
      console.error('Logout failed:', error)
      // Clear cache even if logout API fails
      queryClient.clear()
      options?.onError?.(error)
    },
    meta: {
      errorMessage: 'Logout failed'
    }
  })
}

// Email verification mutation
export const useVerifyEmail = (options?: {
  onSuccess?: (data: EmailVerificationResponse) => void
  onError?: (error: ApiException) => void
}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: EmailVerificationRequest) => authService.verifyEmail(data),
    onSuccess: (data) => {
      // Refresh user data after successful verification
      queryClient.invalidateQueries({ queryKey: authKeys.profile() })
      options?.onSuccess?.(data)
    },
    onError: (error: ApiException) => {
      console.error('Email verification failed:', error)
      options?.onError?.(error)
    },
    meta: {
      errorMessage: 'Email verification failed'
    }
  })
}

// Resend verification mutation
export const useResendVerification = (options?: {
  onSuccess?: (data: { message: string }) => void
  onError?: (error: ApiException) => void
}) => {
  return useMutation({
    mutationFn: (email: string) => authService.resendVerification(email),
    onSuccess: (data) => {
      options?.onSuccess?.(data)
    },
    onError: (error: ApiException) => {
      console.error('Resend verification failed:', error)
      options?.onError?.(error)
    },
    meta: {
      errorMessage: 'Failed to resend verification email'
    }
  })
}

// Password reset request mutation
export const useRequestPasswordReset = (options?: {
  onSuccess?: (data: PasswordResetResponse) => void
  onError?: (error: ApiException) => void
}) => {
  return useMutation({
    mutationFn: (data: PasswordResetRequest) => authService.requestPasswordReset(data),
    onSuccess: (data) => {
      options?.onSuccess?.(data)
    },
    onError: (error: ApiException) => {
      console.error('Password reset request failed:', error)
      options?.onError?.(error)
    },
    meta: {
      errorMessage: 'Failed to request password reset'
    }
  })
}

// Password reset confirmation mutation
export const useConfirmPasswordReset = (options?: {
  onSuccess?: (data: PasswordResetConfirmResponse) => void
  onError?: (error: ApiException) => void
}) => {
  return useMutation({
    mutationFn: (data: PasswordResetConfirmRequest) => authService.confirmPasswordReset(data),
    onSuccess: (data) => {
      options?.onSuccess?.(data)
    },
    onError: (error: ApiException) => {
      console.error('Password reset confirmation failed:', error)
      options?.onError?.(error)
    },
    meta: {
      errorMessage: 'Failed to reset password'
    }
  })
}

// Profile update mutation
export const useUpdateProfile = (options?: {
  onSuccess?: (data: UserProfileUpdateResponse) => void
  onError?: (error: ApiException) => void
}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UserProfileUpdateRequest) => authService.updateProfile(data),
    onSuccess: (data) => {
      // Refresh user profile data
      queryClient.invalidateQueries({ queryKey: authKeys.profile() })
      options?.onSuccess?.(data)
    },
    onError: (error: ApiException) => {
      console.error('Profile update failed:', error)
      options?.onError?.(error)
    },
    meta: {
      errorMessage: 'Failed to update profile'
    }
  })
}

// Session refresh mutation
export const useRefreshSession = (options?: {
  onSuccess?: (data: UserProfileResponse) => void
  onError?: (error: ApiException) => void
}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authService.refreshSession(),
    onSuccess: (data) => {
      // Update cached user data
      queryClient.setQueryData(authKeys.profile(), data)
      options?.onSuccess?.(data)
    },
    onError: (error: ApiException) => {
      console.error('Session refresh failed:', error)
      options?.onError?.(error)
    },
    meta: {
      errorMessage: 'Failed to refresh session'
    }
  })
}

// Test protected endpoint
export const useTestProtectedEndpoint = () => {
  return useQuery({
    queryKey: [...authKeys.all, 'protected-test'],
    queryFn: () => authService.testProtectedEndpoint(),
    enabled: false, // Manual trigger only
    retry: false,
    meta: {
      errorMessage: 'Protected endpoint test failed'
    }
  })
}

// Composite hooks for common patterns

// Hook that provides complete auth state and actions
export const useAuth = () => {
  const currentUserQuery = useCurrentUser()
  const loginMutation = useLogin()
  const logoutMutation = useLogout()
  const registerMutation = useRegister()
  const updateProfileMutation = useUpdateProfile()

  return {
    // State
    user: currentUserQuery.data,
    isLoading: currentUserQuery.isLoading,
    isAuthenticated: !!currentUserQuery.data && !currentUserQuery.isError,
    error: currentUserQuery.error,
    
    // Mutations
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    updateProfile: updateProfileMutation.mutateAsync,
    
    // Mutation states
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isRegistering: registerMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,
    
    // Errors
    loginError: loginMutation.error,
    logoutError: logoutMutation.error,
    registerError: registerMutation.error,
    updateError: updateProfileMutation.error,
    
    // Actions
    refetch: currentUserQuery.refetch,
    reset: () => {
      loginMutation.reset()
      logoutMutation.reset()
      registerMutation.reset()
      updateProfileMutation.reset()
    }
  }
}

// Hook for password reset flow
export const usePasswordReset = () => {
  const requestMutation = useRequestPasswordReset()
  const confirmMutation = useConfirmPasswordReset()

  return {
    // Actions
    requestReset: requestMutation.mutateAsync,
    confirmReset: confirmMutation.mutateAsync,
    
    // States
    isRequestingReset: requestMutation.isPending,
    isConfirmingReset: confirmMutation.isPending,
    
    // Errors
    requestError: requestMutation.error,
    confirmError: confirmMutation.error,
    
    // Success states
    requestSuccess: requestMutation.isSuccess,
    confirmSuccess: confirmMutation.isSuccess,
    
    // Reset
    reset: () => {
      requestMutation.reset()
      confirmMutation.reset()
    }
  }
}

// Hook for email verification flow
export const useEmailVerification = () => {
  const verifyMutation = useVerifyEmail()
  const resendMutation = useResendVerification()

  return {
    // Actions
    verify: verifyMutation.mutateAsync,
    resend: resendMutation.mutateAsync,
    
    // States
    isVerifying: verifyMutation.isPending,
    isResending: resendMutation.isPending,
    
    // Errors
    verifyError: verifyMutation.error,
    resendError: resendMutation.error,
    
    // Success states
    verifySuccess: verifyMutation.isSuccess,
    resendSuccess: resendMutation.isSuccess,
    
    // Reset
    reset: () => {
      verifyMutation.reset()
      resendMutation.reset()
    }
  }
}

// Utility functions
export const usePasswordValidation = () => {
  return {
    validate: authService.validatePassword,
    generateSecure: authService.generateSecurePassword
  }
}

export const useEmailValidation = () => {
  return {
    validate: authService.validateEmail
  }
}