import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi } from '../api-client'

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  currentUser: () => [...authKeys.all, 'current-user'] as const,
} as const

// Types for mutation inputs
export interface RegisterInput {
  email: string
  password: string
  name: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface VerifyEmailInput {
  email: string
  verification_code: string
}

export interface ResendVerificationInput {
  email: string
}

export interface PasswordResetInput {
  email: string
}

export interface PasswordResetConfirmInput {
  email: string
  confirmation_code: string
  new_password: string
}

export interface UpdateProfileInput {
  name?: string
  phone?: string
}

// Queries
export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: () => authApi.getCurrentUser(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Mutations
export function useRegister() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: RegisterInput) => authApi.register(data),
    onSuccess: () => {
      // Optionally refresh current user after successful registration
      queryClient.invalidateQueries({ queryKey: authKeys.currentUser() })
    },
  })
}

export function useVerifyEmail() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: VerifyEmailInput) => authApi.verifyEmail(data),
    onSuccess: () => {
      // Refresh current user to get updated email_verified status
      queryClient.invalidateQueries({ queryKey: authKeys.currentUser() })
    },
  })
}

export function useResendVerification() {
  return useMutation({
    mutationFn: (data: ResendVerificationInput) => authApi.resendVerification(data),
  })
}

export function usePasswordReset() {
  return useMutation({
    mutationFn: (data: PasswordResetInput) => authApi.requestPasswordReset(data),
  })
}

export function usePasswordResetConfirm() {
  return useMutation({
    mutationFn: (data: PasswordResetConfirmInput) => authApi.confirmPasswordReset(data),
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: UpdateProfileInput) => authApi.updateProfile(data),
    onSuccess: () => {
      // Refresh current user after profile update
      queryClient.invalidateQueries({ queryKey: authKeys.currentUser() })
    },
  })
}

// Helper functions for error handling
export function getErrorMessage(error: any): string {
  if (error?.response?.data?.detail) {
    if (Array.isArray(error.response.data.detail)) {
      return error.response.data.detail.join(', ')
    }
    return error.response.data.detail
  }
  
  if (error?.message) {
    return error.message
  }
  
  return 'An unexpected error occurred. Please try again.'
}