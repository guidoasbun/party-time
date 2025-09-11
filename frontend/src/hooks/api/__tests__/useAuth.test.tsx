/**
 * Tests for useAuth React Query hooks
 */

import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useCurrentUser, useLogin, useRegister, useAuth } from '../useAuth'
import { authService } from '@/lib/api/services'
import { ApiException } from '@/lib/api-client'

// Mock the auth service
jest.mock('@/lib/api/services', () => ({
  authService: {
    getCurrentUser: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
  },
}))

const mockAuthService = authService as jest.Mocked<typeof authService>

// Test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  })

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useAuth hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('useCurrentUser', () => {
    it('should fetch current user successfully', async () => {
      const mockUser = {
        user_id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        email_verified: true,
        username: 'testuser',
        groups: ['user']
      }

      mockAuthService.getCurrentUser.mockResolvedValue(mockUser)

      const { result } = renderHook(() => useCurrentUser(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockUser)
      expect(mockAuthService.getCurrentUser).toHaveBeenCalled()
    })

    it('should handle fetch user error', async () => {
      const mockError = new ApiException('Unauthorized', 401)
      mockAuthService.getCurrentUser.mockRejectedValue(mockError)

      const { result } = renderHook(() => useCurrentUser({ enabled: true, retry: false }), {
        wrapper: createWrapper(),
      })

      await waitFor(
        () => {
          expect(result.current.isError).toBe(true)
        },
        { timeout: 2000 }
      )

      expect(result.current.error).toEqual(mockError)
    })
  })

  describe('useLogin', () => {
    it('should handle successful login', async () => {
      const mockLoginResponse = {
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

      mockAuthService.login.mockResolvedValue(mockLoginResponse)

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      })

      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      }

      result.current.mutate(loginData)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockLoginResponse)
      expect(mockAuthService.login).toHaveBeenCalledWith(loginData)
    })

    it('should handle login error', async () => {
      const mockError = new ApiException('Invalid credentials', 401)
      mockAuthService.login.mockRejectedValue(mockError)

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({
        email: 'test@example.com',
        password: 'wrongpassword'
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })

  describe('useRegister', () => {
    it('should handle successful registration', async () => {
      const mockRegisterResponse = {
        user_id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        email_verified: false,
        message: 'Registration successful'
      }

      mockAuthService.register.mockResolvedValue(mockRegisterResponse)

      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      })

      const registerData = {
        email: 'test@example.com',
        password: 'TestPass123!',
        name: 'Test User'
      }

      result.current.mutate(registerData)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockRegisterResponse)
      expect(mockAuthService.register).toHaveBeenCalledWith(registerData)
    })
  })

  describe('useAuth composite hook', () => {
    it('should provide complete auth state and actions', async () => {
      const mockUser = {
        user_id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        email_verified: true,
        username: 'testuser',
        groups: ['user']
      }

      mockAuthService.getCurrentUser.mockResolvedValue(mockUser)

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
      })

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isLoading).toBe(false)
      expect(typeof result.current.login).toBe('function')
      expect(typeof result.current.logout).toBe('function')
      expect(typeof result.current.register).toBe('function')
      expect(typeof result.current.updateProfile).toBe('function')
    })

    it('should show unauthenticated state when no user', async () => {
      const mockError = new ApiException('Unauthorized', 401)
      mockAuthService.getCurrentUser.mockRejectedValue(mockError)

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      await waitFor(
        () => {
          expect(result.current.isAuthenticated).toBe(false)
        },
        { timeout: 2000 }
      )

      await waitFor(
        () => {
          expect(result.current.error).toEqual(mockError)
        },
        { timeout: 2000 }
      )

      expect(result.current.user).toBeUndefined()
    })
  })
})