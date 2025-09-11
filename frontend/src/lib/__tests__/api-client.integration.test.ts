/**
 * Integration tests for API Client
 */

import MockAdapter from 'axios-mock-adapter'
import { 
  api, 
  apiClient,
  TimeoutException,
  isApiException,
  isNetworkException,
  getErrorMessage,
  withRetry
} from '../api-client'

describe('API Client Integration Tests', () => {
  let mockAxios: MockAdapter

  beforeEach(() => {
    // Mock the apiClient instance instead of the global axios
    mockAxios = new MockAdapter(apiClient)
  })

  afterEach(() => {
    mockAxios.restore()
  })

  describe('Successful Requests', () => {
    it('should handle GET requests', async () => {
      const responseData = { id: '123', name: 'Test Event' }
      mockAxios.onGet('/api/v1/events/123').reply(200, responseData)

      const result = await api.get('/api/v1/events/123')
      
      expect(result).toEqual(responseData)
    })

    it('should handle POST requests', async () => {
      const requestData = { name: 'New Event', type: 'wedding' }
      const responseData = { id: '123', ...requestData }
      
      mockAxios.onPost('/api/v1/events').reply(201, responseData)

      const result = await api.post('/api/v1/events', requestData)
      
      expect(result).toEqual(responseData)
    })

    it('should handle query parameters', async () => {
      const responseData = { items: [], total: 0 }
      mockAxios.onGet('/api/v1/events').reply(200, responseData)

      const result = await api.get('/api/v1/events', { 
        page: 1, 
        limit: 10, 
        search: 'wedding' 
      })
      
      expect(result).toEqual(responseData)
      
      // Verify query params were sent
      const request = mockAxios.history.get[0]
      expect(request.params).toEqual({
        page: 1,
        limit: 10,
        search: 'wedding'
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle 400 validation errors', async () => {
      const errorResponse = {
        detail: ['Name is required', 'Email must be valid'],
        error_code: 'VALIDATION_ERROR'
      }
      
      mockAxios.onPost('/api/v1/events').reply(400, errorResponse)

      try {
        await api.post('/api/v1/events', {})
        fail('Should have thrown an error')
      } catch (error) {
        expect(isApiException(error)).toBe(true)
        if (isApiException(error)) {
          expect(error.status).toBe(400)
          expect(error.message).toBe('Name is required, Email must be valid')
          expect(error.code).toBe('VALIDATION_ERROR')
          expect(error.details).toEqual(['Name is required', 'Email must be valid'])
        }
      }
    })

    it('should handle 401 unauthorized errors', async () => {
      const errorResponse = {
        detail: 'Token expired',
        error_code: 'TOKEN_EXPIRED'
      }
      
      mockAxios.onGet('/api/v1/auth/me').reply(401, errorResponse)

      try {
        await api.get('/api/v1/auth/me')
        fail('Should have thrown an error')
      } catch (error) {
        expect(isApiException(error)).toBe(true)
        if (isApiException(error)) {
          expect(error.status).toBe(401)
          expect(error.message).toBe('Token expired')
        }
      }
    })

    it('should handle 404 not found errors', async () => {
      const errorResponse = {
        detail: 'Event not found'
      }
      
      mockAxios.onGet('/api/v1/events/999').reply(404, errorResponse)

      try {
        await api.get('/api/v1/events/999')
        fail('Should have thrown an error')
      } catch (error) {
        expect(isApiException(error)).toBe(true)
        if (isApiException(error)) {
          expect(error.status).toBe(404)
          expect(error.message).toBe('Event not found')
        }
      }
    })

    it('should handle 500 server errors', async () => {
      const errorResponse = {
        detail: 'Internal server error'
      }
      
      mockAxios.onGet('/api/v1/events').reply(500, errorResponse)

      try {
        await api.get('/api/v1/events')
        fail('Should have thrown an error')
      } catch (error) {
        expect(isApiException(error)).toBe(true)
        if (isApiException(error)) {
          expect(error.status).toBe(500)
          expect(error.message).toBe('Internal server error')
        }
      }
    })

    it('should handle network errors', async () => {
      mockAxios.onGet('/api/v1/events').networkError()

      try {
        await api.get('/api/v1/events')
        fail('Should have thrown an error')
      } catch (error) {
        expect(isNetworkException(error)).toBe(true)
        expect(getErrorMessage(error)).toBe('Network connection failed')
      }
    })

    it('should handle timeout errors', async () => {
      mockAxios.onGet('/api/v1/events').timeout()

      try {
        await api.get('/api/v1/events')
        fail('Should have thrown an error')
      } catch (error) {
        expect(error instanceof TimeoutException).toBe(true)
        expect(getErrorMessage(error)).toBe('Request timeout')
      }
    })
  })

  describe('Retry Logic', () => {
    it('should retry on 500 errors', async () => {
      // First call fails with 500, second succeeds
      mockAxios
        .onGet('/api/v1/events')
        .replyOnce(500, { detail: 'Server error' })
        .onGet('/api/v1/events')
        .replyOnce(200, { items: [] })

      const result = await api.get('/api/v1/events', undefined, withRetry({ attempts: 2, delay: 100 }))
      
      expect(result).toEqual({ items: [] })
      expect(mockAxios.history.get).toHaveLength(2)
    })

    it('should not retry on 400 errors', async () => {
      mockAxios.onGet('/api/v1/events').reply(400, { detail: 'Bad request' })

      try {
        await api.get('/api/v1/events', undefined, withRetry({ attempts: 3 }))
        fail('Should have thrown an error')
      } catch (error) {
        expect(isApiException(error)).toBe(true)
        expect(mockAxios.history.get).toHaveLength(1) // Only one attempt
      }
    })

    it('should retry on 429 rate limit errors', async () => {
      // First call rate limited, second succeeds
      mockAxios
        .onGet('/api/v1/events')
        .replyOnce(429, { detail: 'Rate limit exceeded' })
        .onGet('/api/v1/events')
        .replyOnce(200, { items: [] })

      const result = await api.get('/api/v1/events', undefined, withRetry({ attempts: 2, delay: 100 }))
      
      expect(result).toEqual({ items: [] })
      expect(mockAxios.history.get).toHaveLength(2)
    })
  })

  describe('Type Safety', () => {
    it('should maintain type safety for responses', async () => {
      interface Event {
        id: string
        name: string
        type: string
      }

      const mockEvent: Event = {
        id: '123',
        name: 'Test Event',
        type: 'wedding'
      }

      mockAxios.onGet('/api/v1/events/123').reply(200, mockEvent)

      const result = await api.get<Event>('/api/v1/events/123')
      
      // TypeScript should infer the correct type
      expect(result.id).toBe('123')
      expect(result.name).toBe('Test Event')
      expect(result.type).toBe('wedding')
    })

    it('should maintain type safety for request data', async () => {
      interface CreateEventRequest {
        name: string
        type: string
        start_date: string
      }

      const requestData: CreateEventRequest = {
        name: 'Test Event',
        type: 'wedding',
        start_date: '2024-06-01'
      }

      mockAxios.onPost('/api/v1/events').reply(201, { id: '123', ...requestData })

      const result = await api.post<unknown, CreateEventRequest>('/api/v1/events', requestData)
      
      expect(result.name).toBe('Test Event')
    })
  })

  describe('File Operations', () => {
    it('should handle file uploads', async () => {
      const mockFile = new File(['test'], 'test.csv', { type: 'text/csv' })
      const responseData = { uploaded: true, filename: 'test.csv' }
      
      mockAxios.onPost('/api/v1/events/123/guests/import').reply(200, responseData)

      const progressCalls: number[] = []
      const result = await api.upload('/api/v1/events/123/guests/import', mockFile, (progress) => {
        progressCalls.push(progress)
      })
      
      expect(result).toEqual(responseData)
      
      // Verify FormData was sent
      const request = mockAxios.history.post[0]
      expect(request.headers['Content-Type']).toMatch(/multipart\/form-data/)
    })
  })

  describe('Authentication', () => {
    it('should skip auth headers in test environment', async () => {
      // In test environment, auth is skipped as per our api-client configuration
      mockAxios.onGet('/api/v1/auth/me').reply(200, { user_id: '123' })

      await api.get('/api/v1/auth/me')
      
      const request = mockAxios.history.get[0]
      // In test environment, no auth header should be added
      expect(request.headers.Authorization).toBeUndefined()
    })
  })
})