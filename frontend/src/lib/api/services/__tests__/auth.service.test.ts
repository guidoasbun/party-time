/**
 * Unit tests for AuthService
 */

import { authService } from '../auth.service'
import { api } from '@/lib/api-client'
import {
  UserRegisterRequest,
  UserLoginRequest,
  // EmailVerificationRequest,
  // PasswordResetRequest,
  // PasswordResetConfirmRequest,
  // UserProfileUpdateRequest
} from '@/types'

// Mock the API client
jest.mock('../../../api-client', () => ({
  api: {
    post: jest.fn(),
    get: jest.fn(),
    patch: jest.fn(),
  },
  withRetry: jest.fn(() => ({ retries: { attempts: 2, delay: 1000, backoff: true } }))
}))

const mockApi = api as jest.Mocked<typeof api>

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('register', () => {
    it('should register a new user', async () => {
      const registerData: UserRegisterRequest = {
        email: 'test@example.com',
        password: 'TestPass123!',
        name: 'Test User'
      }

      const expectedResponse = {
        user_id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        email_verified: false,
        message: 'Registration successful'
      }

      mockApi.post.mockResolvedValue(expectedResponse)

      const result = await authService.register(registerData)

      expect(mockApi.post).toHaveBeenCalledWith(
        '/api/v1/auth/register',
        registerData
      )
      expect(result).toEqual(expectedResponse)
    })
  })

  describe('login', () => {
    it('should login a user', async () => {
      const loginData: UserLoginRequest = {
        email: 'test@example.com',
        password: 'TestPass123!'
      }

      const expectedResponse = {
        access_token: 'access-token',
        id_token: 'id-token',
        refresh_token: 'refresh-token',
        token_type: 'Bearer',
        expires_in: 3600,
        user_id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        email_verified: true
      }

      mockApi.post.mockResolvedValue(expectedResponse)

      const result = await authService.login(loginData)

      expect(mockApi.post).toHaveBeenCalledWith(
        '/api/v1/auth/login',
        loginData
      )
      expect(result).toEqual(expectedResponse)
    })
  })

  describe('getCurrentUser', () => {
    it('should get current user profile', async () => {
      const expectedResponse = {
        user_id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        email_verified: true,
        username: 'testuser',
        groups: ['user']
      }

      mockApi.get.mockResolvedValue(expectedResponse)

      const result = await authService.getCurrentUser()

      expect(mockApi.get).toHaveBeenCalledWith(
        '/api/v1/auth/me',
        undefined,
        { retries: { attempts: 2, delay: 1000, backoff: true } }
      )
      expect(result).toEqual(expectedResponse)
    })
  })

  describe('validatePassword', () => {
    it('should validate a strong password', () => {
      const result = authService.validatePassword('TestPass123!')
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.strength).toBe('strong')
    })

    it('should reject a weak password', () => {
      const result = authService.validatePassword('123')
      
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.strength).toBe('weak')
    })

    it('should require minimum length', () => {
      const result = authService.validatePassword('Abc1!')
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must be at least 8 characters long')
    })

    it('should require uppercase letter', () => {
      const result = authService.validatePassword('password123!')
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one uppercase letter')
    })

    it('should require lowercase letter', () => {
      const result = authService.validatePassword('PASSWORD123!')
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one lowercase letter')
    })

    it('should require number', () => {
      const result = authService.validatePassword('Password!')
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one number')
    })
  })

  describe('validateEmail', () => {
    it('should validate correct email', () => {
      expect(authService.validateEmail('test@example.com')).toBe(true)
      expect(authService.validateEmail('user.name+tag@domain.co.uk')).toBe(true)
    })

    it('should reject invalid email', () => {
      expect(authService.validateEmail('invalid-email')).toBe(false)
      expect(authService.validateEmail('test@')).toBe(false)
      expect(authService.validateEmail('@example.com')).toBe(false)
    })
  })

  describe('generateSecurePassword', () => {
    it('should generate password with default length', () => {
      const password = authService.generateSecurePassword()
      expect(password).toHaveLength(12)
    })

    it('should generate password with custom length', () => {
      const password = authService.generateSecurePassword(16)
      expect(password).toHaveLength(16)
    })

    it('should generate password with required character types', () => {
      const password = authService.generateSecurePassword(12)
      
      // Should contain at least one of each type
      expect(/[a-z]/.test(password)).toBe(true) // lowercase
      expect(/[A-Z]/.test(password)).toBe(true) // uppercase
      expect(/\d/.test(password)).toBe(true) // number
      expect(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)).toBe(true) // symbol
    })
  })
})