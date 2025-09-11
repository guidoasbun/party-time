/**
 * Authentication service module
 */

import { api, withRetry } from '@/lib/api-client'
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
  API_ENDPOINTS
} from '@/types'

/**
 * Authentication service class with typed methods
 */
export class AuthService {
  /**
   * Register a new user
   */
  async register(data: UserRegisterRequest): Promise<UserRegisterResponse> {
    return api.post<UserRegisterResponse, UserRegisterRequest>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    )
  }

  /**
   * Login user with email and password
   */
  async login(data: UserLoginRequest): Promise<UserLoginResponse> {
    return api.post<UserLoginResponse, UserLoginRequest>(
      API_ENDPOINTS.AUTH.LOGIN,
      data
    )
  }

  /**
   * Logout current user
   */
  async logout(): Promise<{ message: string }> {
    return api.post<{ message: string }>(API_ENDPOINTS.AUTH.LOGOUT)
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<UserProfileResponse> {
    return api.get<UserProfileResponse>(
      API_ENDPOINTS.AUTH.ME,
      undefined,
      withRetry({ attempts: 2 })
    )
  }

  /**
   * Verify email with verification code
   */
  async verifyEmail(data: EmailVerificationRequest): Promise<EmailVerificationResponse> {
    return api.post<EmailVerificationResponse, EmailVerificationRequest>(
      API_ENDPOINTS.AUTH.VERIFY_EMAIL,
      data
    )
  }

  /**
   * Resend email verification code
   */
  async resendVerification(email: string): Promise<{ message: string }> {
    return api.post<{ message: string }, { email: string }>(
      API_ENDPOINTS.AUTH.RESEND_VERIFICATION,
      { email }
    )
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(data: PasswordResetRequest): Promise<PasswordResetResponse> {
    return api.post<PasswordResetResponse, PasswordResetRequest>(
      API_ENDPOINTS.AUTH.PASSWORD_RESET,
      data
    )
  }

  /**
   * Confirm password reset with code and new password
   */
  async confirmPasswordReset(data: PasswordResetConfirmRequest): Promise<PasswordResetConfirmResponse> {
    return api.post<PasswordResetConfirmResponse, PasswordResetConfirmRequest>(
      API_ENDPOINTS.AUTH.PASSWORD_RESET_CONFIRM,
      data
    )
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UserProfileUpdateRequest): Promise<UserProfileUpdateResponse> {
    return api.patch<UserProfileUpdateResponse, UserProfileUpdateRequest>(
      API_ENDPOINTS.AUTH.PROFILE,
      data
    )
  }

  /**
   * Test protected endpoint
   */
  async testProtectedEndpoint(): Promise<{ message: string; user_id: string }> {
    return api.get<{ message: string; user_id: string }>(
      API_ENDPOINTS.AUTH.PROTECTED
    )
  }

  /**
   * Refresh user session (for token refresh)
   */
  async refreshSession(): Promise<UserProfileResponse> {
    return this.getCurrentUser()
  }

  /**
   * Check if user is authenticated by testing a protected endpoint
   */
  async checkAuthStatus(): Promise<boolean> {
    try {
      await this.getCurrentUser()
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Validate password strength
   */
  validatePassword(password: string): {
    isValid: boolean
    errors: string[]
    strength: 'weak' | 'medium' | 'strong'
  } {
    const errors: string[] = []
    let score = 0

    // Minimum length check
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    } else {
      score += 1
    }

    // Uppercase letter check
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    } else {
      score += 1
    }

    // Lowercase letter check
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    } else {
      score += 1
    }

    // Number check
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    } else {
      score += 1
    }

    // Special character check (optional but adds strength)
    if (/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {
      score += 1
    }

    // Length bonus
    if (password.length >= 12) {
      score += 1
    }

    // Determine strength
    let strength: 'weak' | 'medium' | 'strong'
    if (score < 3) {
      strength = 'weak'
    } else if (score < 5) {
      strength = 'medium'
    } else {
      strength = 'strong'
    }

    return {
      isValid: errors.length === 0,
      errors,
      strength
    }
  }

  /**
   * Validate email format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Generate secure password
   */
  generateSecurePassword(length: number = 12): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const numbers = '0123456789'
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'
    
    const allChars = lowercase + uppercase + numbers + symbols
    let password = ''
    
    // Ensure at least one character from each category
    password += lowercase[Math.floor(Math.random() * lowercase.length)]
    password += uppercase[Math.floor(Math.random() * uppercase.length)]
    password += numbers[Math.floor(Math.random() * numbers.length)]
    password += symbols[Math.floor(Math.random() * symbols.length)]
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)]
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('')
  }
}

// Create singleton instance
export const authService = new AuthService()

// Export default instance
export default authService