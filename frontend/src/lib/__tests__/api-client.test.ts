import { AxiosError } from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { apiClient, api, authApi } from '../api-client'
import { getSession } from 'next-auth/react'

// Mock next-auth
jest.mock('next-auth/react', () => ({
  getSession: jest.fn(),
}))

const mockGetSession = getSession as jest.MockedFunction<typeof getSession>

describe('API Client', () => {
  let mock: MockAdapter
  const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {})
  const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})

  beforeEach(() => {
    mock = new MockAdapter(apiClient)
    jest.clearAllMocks()
    mockGetSession.mockResolvedValue(null)
  })

  afterEach(() => {
    mock.restore()
  })

  afterAll(() => {
    consoleWarn.mockRestore()
    consoleError.mockRestore()
  })

  describe('API Client Configuration', () => {
    it('has correct base configuration', () => {
      expect(apiClient.defaults.baseURL).toBe('http://localhost:8000')
      expect(apiClient.defaults.headers['Content-Type']).toBe('application/json')
      expect(apiClient.defaults.timeout).toBe(10000)
    })
  })

  describe('Request Interceptor', () => {
    it('adds authorization header when session has idToken', async () => {
      const session = { idToken: 'test-token', expires: '2024-12-31T23:59:59Z' }
      mockGetSession.mockResolvedValue(session)

      mock.onGet('/test').reply((config) => {
        expect(config.headers?.Authorization).toBe('Bearer test-token')
        return [200, { success: true }]
      })

      await api.get('/test')
      expect(mockGetSession).toHaveBeenCalled()
    })

    it('does not add authorization header when session has no idToken', async () => {
      const session = { user: { email: 'test@example.com' }, expires: '2024-12-31T23:59:59Z' }
      mockGetSession.mockResolvedValue(session)

      mock.onGet('/test').reply((config) => {
        expect(config.headers?.Authorization).toBeUndefined()
        return [200, { success: true }]
      })

      await api.get('/test')
    })

    it('does not add authorization header when no session', async () => {
      mockGetSession.mockResolvedValue(null)

      mock.onGet('/test').reply((config) => {
        expect(config.headers?.Authorization).toBeUndefined()
        return [200, { success: true }]
      })

      await api.get('/test')
    })

    it('handles session retrieval error gracefully', async () => {
      mockGetSession.mockRejectedValue(new Error('Session error'))

      mock.onGet('/test').reply((config) => {
        expect(config.headers?.Authorization).toBeUndefined()
        return [200, { success: true }]
      })

      await api.get('/test')
      expect(consoleWarn).toHaveBeenCalledWith('Failed to get session for API request:', expect.any(Error))
    })
  })

  describe('Response Interceptor', () => {
    it('passes through successful responses', async () => {
      const responseData = { message: 'Success' }
      mock.onGet('/test').reply(200, responseData)

      const result = await api.get('/test')
      expect(result).toEqual(responseData)
    })

    it('logs warning for 401 errors', async () => {
      mock.onGet('/test').reply(401, { detail: 'Unauthorized' })

      await expect(api.get('/test')).rejects.toThrow()
      expect(consoleWarn).toHaveBeenCalledWith('Authentication failed - redirecting to login')
    })

    it('logs error for 500+ errors', async () => {
      const errorData = { detail: 'Internal server error' }
      mock.onGet('/test').reply(500, errorData)

      await expect(api.get('/test')).rejects.toThrow()
      expect(consoleError).toHaveBeenCalledWith('Server error:', errorData)
    })

    it('logs error for other 500+ status codes', async () => {
      const errorData = { detail: 'Bad gateway' }
      mock.onGet('/test').reply(502, errorData)

      await expect(api.get('/test')).rejects.toThrow()
      expect(consoleError).toHaveBeenCalledWith('Server error:', errorData)
    })

    it('does not log for 4xx errors other than 401', async () => {
      mock.onGet('/test').reply(400, { detail: 'Bad request' })

      await expect(api.get('/test')).rejects.toThrow()
      expect(consoleWarn).not.toHaveBeenCalled()
      expect(consoleError).not.toHaveBeenCalled()
    })
  })

  describe('Generic API Methods', () => {
    describe('GET', () => {
      it('makes GET request and returns data', async () => {
        const responseData = { users: ['user1', 'user2'] }
        mock.onGet('/users').reply(200, responseData)

        const result = await api.get('/users')
        expect(result).toEqual(responseData)
      })

      it('makes GET request with query parameters', async () => {
        const responseData = { users: [] }
        mock.onGet('/users').reply((config) => {
          expect(config.params).toEqual({ page: 1, limit: 10 })
          return [200, responseData]
        })

        const result = await api.get('/users', { page: 1, limit: 10 })
        expect(result).toEqual(responseData)
      })
    })

    describe('POST', () => {
      it('makes POST request and returns data', async () => {
        const requestData = { name: 'John', email: 'john@example.com' }
        const responseData = { id: 1, ...requestData }
        
        mock.onPost('/users', requestData).reply(201, responseData)

        const result = await api.post('/users', requestData)
        expect(result).toEqual(responseData)
      })

      it('makes POST request without data', async () => {
        const responseData = { message: 'Created' }
        mock.onPost('/test').reply(201, responseData)

        const result = await api.post('/test')
        expect(result).toEqual(responseData)
      })
    })

    describe('PUT', () => {
      it('makes PUT request and returns data', async () => {
        const requestData = { name: 'Jane' }
        const responseData = { id: 1, ...requestData }
        
        mock.onPut('/users/1', requestData).reply(200, responseData)

        const result = await api.put('/users/1', requestData)
        expect(result).toEqual(responseData)
      })
    })

    describe('PATCH', () => {
      it('makes PATCH request and returns data', async () => {
        const requestData = { email: 'newemail@example.com' }
        const responseData = { id: 1, ...requestData }
        
        mock.onPatch('/users/1', requestData).reply(200, responseData)

        const result = await api.patch('/users/1', requestData)
        expect(result).toEqual(responseData)
      })
    })

    describe('DELETE', () => {
      it('makes DELETE request and returns data', async () => {
        const responseData = { message: 'Deleted' }
        mock.onDelete('/users/1').reply(200, responseData)

        const result = await api.delete('/users/1')
        expect(result).toEqual(responseData)
      })
    })
  })

  describe('Auth API Methods', () => {
    describe('register', () => {
      it('makes register request with correct data', async () => {
        const requestData = { email: 'test@example.com', password: 'password', name: 'Test User' }
        const responseData = {
          user_id: 'user123',
          email: 'test@example.com',
          name: 'Test User',
          email_verified: false,
          message: 'Registration successful'
        }

        mock.onPost('/api/v1/auth/register', requestData).reply(201, responseData)

        const result = await authApi.register(requestData)
        expect(result).toEqual(responseData)
      })
    })

    describe('verifyEmail', () => {
      it('makes verify email request with correct data', async () => {
        const requestData = { email: 'test@example.com', verification_code: '123456' }
        const responseData = { message: 'Email verified', verified: true }

        mock.onPost('/api/v1/auth/verify-email', requestData).reply(200, responseData)

        const result = await authApi.verifyEmail(requestData)
        expect(result).toEqual(responseData)
      })
    })

    describe('resendVerification', () => {
      it('makes resend verification request with correct data', async () => {
        const requestData = { email: 'test@example.com' }
        const responseData = { message: 'Verification code sent' }

        mock.onPost('/api/v1/auth/resend-verification', requestData).reply(200, responseData)

        const result = await authApi.resendVerification(requestData)
        expect(result).toEqual(responseData)
      })
    })

    describe('requestPasswordReset', () => {
      it('makes password reset request with correct data', async () => {
        const requestData = { email: 'test@example.com' }
        const responseData = { message: 'Reset code sent' }

        mock.onPost('/api/v1/auth/password-reset', requestData).reply(200, responseData)

        const result = await authApi.requestPasswordReset(requestData)
        expect(result).toEqual(responseData)
      })
    })

    describe('confirmPasswordReset', () => {
      it('makes password reset confirm request with correct data', async () => {
        const requestData = {
          email: 'test@example.com',
          confirmation_code: '123456',
          new_password: 'newpassword'
        }
        const responseData = { message: 'Password reset successful' }

        mock.onPost('/api/v1/auth/password-reset-confirm', requestData).reply(200, responseData)

        const result = await authApi.confirmPasswordReset(requestData)
        expect(result).toEqual(responseData)
      })
    })

    describe('getCurrentUser', () => {
      it('makes get current user request', async () => {
        const responseData = {
          user_id: 'user123',
          email: 'test@example.com',
          name: 'Test User',
          email_verified: true,
          username: 'testuser',
          groups: ['planner']
        }

        mock.onGet('/api/v1/auth/me').reply(200, responseData)

        const result = await authApi.getCurrentUser()
        expect(result).toEqual(responseData)
      })
    })

    describe('updateProfile', () => {
      it('makes update profile request with correct data', async () => {
        const requestData = { name: 'Updated Name', phone: '123-456-7890' }
        const responseData = {
          user_id: 'user123',
          email: 'test@example.com',
          name: 'Updated Name',
          phone: '123-456-7890',
          message: 'Profile updated'
        }

        mock.onPatch('/api/v1/auth/profile', requestData).reply(200, responseData)

        const result = await authApi.updateProfile(requestData)
        expect(result).toEqual(responseData)
      })

      it('makes update profile request with partial data', async () => {
        const requestData = { name: 'Updated Name' }
        const responseData = {
          user_id: 'user123',
          email: 'test@example.com',
          name: 'Updated Name',
          message: 'Profile updated'
        }

        mock.onPatch('/api/v1/auth/profile', requestData).reply(200, responseData)

        const result = await authApi.updateProfile(requestData)
        expect(result).toEqual(responseData)
      })
    })
  })

  describe('Error Handling', () => {
    it('throws axios error for failed requests', async () => {
      mock.onGet('/test').reply(400, { detail: 'Bad request' })

      await expect(api.get('/test')).rejects.toThrow()
    })

    it('throws axios error with response data', async () => {
      const errorData = { detail: 'Validation failed', errors: ['Invalid email'] }
      mock.onPost('/test').reply(422, errorData)

      try {
        await api.post('/test', { email: 'invalid' })
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        const axiosError = error as AxiosError
        expect(axiosError.response?.data).toEqual(errorData)
        expect(axiosError.response?.status).toBe(422)
      }
    })

    it('throws axios error for network errors', async () => {
      mock.onGet('/test').networkError()

      await expect(api.get('/test')).rejects.toThrow('Network Error')
    })

    it('throws axios error for timeout', async () => {
      mock.onGet('/test').timeout()

      await expect(api.get('/test')).rejects.toThrow('timeout')
    })
  })

  describe('Type Safety', () => {
    it('returns typed responses for generic api methods', async () => {
      interface User {
        id: number
        name: string
        email: string
      }

      const userData: User = { id: 1, name: 'John', email: 'john@example.com' }
      mock.onGet('/users/1').reply(200, userData)

      const result = await api.get<User>('/users/1')
      
      // TypeScript should infer the correct type
      expect(result.id).toBe(1)
      expect(result.name).toBe('John')
      expect(result.email).toBe('john@example.com')
    })
  })
})