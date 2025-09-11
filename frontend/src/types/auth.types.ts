/**
 * Authentication and authorization types
 */

// import type { UUID } from './common.types' // unused currently

// Authentication request types
export interface UserRegisterRequest {
  email: string
  password: string
  name: string
}

export interface UserLoginRequest {
  email: string
  password: string
}

export interface EmailVerificationRequest {
  email: string
  verification_code: string
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetConfirmRequest {
  email: string
  confirmation_code: string
  new_password: string
}

export interface UserProfileUpdateRequest {
  name?: string
  phone?: string
}

// Authentication response types
export interface UserRegisterResponse {
  user_id: string
  email: string
  name: string
  email_verified: boolean
  message: string
}

export interface UserLoginResponse {
  access_token: string
  id_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  user_id: string
  email: string
  name: string
  email_verified: boolean
}

export interface EmailVerificationResponse {
  message: string
  verified: boolean
}

export interface PasswordResetResponse {
  message: string
}

export interface PasswordResetConfirmResponse {
  message: string
}

export interface UserProfileResponse {
  user_id: string
  email: string
  name: string
  email_verified: boolean
  username?: string
  groups: string[]
  is_google_user: boolean
  created_at?: string
}

export interface UserProfileUpdateResponse {
  message: string
  updated_fields: string[]
}

// Token and session types
export interface TokenData {
  user_id?: string
  email?: string
  exp?: number
  iat?: number
  token_use?: string
}

export interface AuthSession {
  user: UserProfileResponse
  accessToken: string
  idToken: string
  refreshToken: string
  expiresAt: number
}

// Auth state types
export interface AuthState {
  isAuthenticated: boolean
  user: UserProfileResponse | null
  loading: boolean
  error: string | null
}

// Auth error types
export interface AuthErrorResponse {
  detail: string
  error_code?: string
}

export type AuthError = 
  | 'INVALID_CREDENTIALS'
  | 'USER_NOT_FOUND'
  | 'USER_NOT_CONFIRMED'
  | 'INVALID_TOKEN'
  | 'TOKEN_EXPIRED'
  | 'PASSWORD_TOO_WEAK'
  | 'EMAIL_ALREADY_EXISTS'
  | 'VERIFICATION_CODE_INVALID'
  | 'VERIFICATION_CODE_EXPIRED'
  | 'PASSWORD_RESET_REQUIRED'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR'

// Password validation types
export interface PasswordValidation {
  isValid: boolean
  errors: string[]
  strength: 'weak' | 'medium' | 'strong'
}

// Auth form types
export interface LoginFormData {
  email: string
  password: string
  remember?: boolean
}

export interface RegisterFormData {
  email: string
  password: string
  confirmPassword: string
  name: string
  acceptTerms: boolean
}

export interface ForgotPasswordFormData {
  email: string
}

export interface ResetPasswordFormData {
  email: string
  code: string
  password: string
  confirmPassword: string
}

export interface EmailVerificationFormData {
  email: string
  code: string
}

// OAuth types
export interface GoogleAuthResponse {
  access_token: string
  id_token: string
  user_id: string
  email: string
  name: string
  email_verified: boolean
}

// Role and permission types (for future use)
export type UserRole = 'admin' | 'planner' | 'guest'

export interface Permission {
  id: string
  name: string
  description: string
}

export interface Role {
  id: string
  name: UserRole
  permissions: Permission[]
}

// Auth context types
export interface AuthContextType {
  // State
  user: UserProfileResponse | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Actions
  login: (credentials: UserLoginRequest) => Promise<void>
  register: (userData: UserRegisterRequest) => Promise<void>
  logout: () => Promise<void>
  verifyEmail: (data: EmailVerificationRequest) => Promise<void>
  resendVerification: (email: string) => Promise<void>
  requestPasswordReset: (email: string) => Promise<void>
  confirmPasswordReset: (data: PasswordResetConfirmRequest) => Promise<void>
  updateProfile: (data: UserProfileUpdateRequest) => Promise<void>
  refreshSession: () => Promise<void>
  clearError: () => void
}

// Auth guard types
export interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  requireAuth?: boolean
  requireVerifiedEmail?: boolean
  requiredRoles?: UserRole[]
  redirectTo?: string
}