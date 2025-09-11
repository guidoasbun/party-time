/**
 * Tests for error handling utilities
 */

import {
  categorizeError,
  getErrorSeverity,
  isRetryableError,
  getUserMessage,
  normalizeError,
  retryOperation,
  ErrorType,
  ErrorSeverity
} from '../error-handler'
import { ApiException, NetworkException, TimeoutException } from '../api-client'
import { AxiosError } from 'axios'

describe('Error Handler', () => {
  describe('categorizeError', () => {
    it('should categorize NetworkException correctly', () => {
      const error = new NetworkException('Network error')
      expect(categorizeError(error)).toBe(ErrorType.NETWORK)
    })

    it('should categorize TimeoutException correctly', () => {
      const error = new TimeoutException('Timeout error')
      expect(categorizeError(error)).toBe(ErrorType.TIMEOUT)
    })

    it('should categorize ApiException by status code', () => {
      expect(categorizeError(new ApiException('Unauthorized', 401))).toBe(ErrorType.AUTHENTICATION)
      expect(categorizeError(new ApiException('Forbidden', 403))).toBe(ErrorType.AUTHORIZATION)
      expect(categorizeError(new ApiException('Not found', 404))).toBe(ErrorType.NOT_FOUND)
      expect(categorizeError(new ApiException('Validation error', 422))).toBe(ErrorType.VALIDATION)
      expect(categorizeError(new ApiException('Server error', 500))).toBe(ErrorType.SERVER)
    })

    it('should categorize AxiosError by code', () => {
      // Create actual AxiosError instances
      const timeoutError = new AxiosError('timeout', 'ECONNABORTED')
      expect(categorizeError(timeoutError)).toBe(ErrorType.TIMEOUT)

      const networkError = new AxiosError('network', 'ERR_NETWORK')
      expect(categorizeError(networkError)).toBe(ErrorType.NETWORK)
    })

    it('should default to UNKNOWN for unrecognized errors', () => {
      expect(categorizeError(new Error('Generic error'))).toBe(ErrorType.UNKNOWN)
      expect(categorizeError('String error')).toBe(ErrorType.UNKNOWN)
    })
  })

  describe('getErrorSeverity', () => {
    it('should assign correct severity levels', () => {
      expect(getErrorSeverity(null, ErrorType.AUTHENTICATION)).toBe(ErrorSeverity.HIGH)
      expect(getErrorSeverity(null, ErrorType.AUTHORIZATION)).toBe(ErrorSeverity.HIGH)
      expect(getErrorSeverity(null, ErrorType.SERVER)).toBe(ErrorSeverity.CRITICAL)
      expect(getErrorSeverity(null, ErrorType.NETWORK)).toBe(ErrorSeverity.MEDIUM)
      expect(getErrorSeverity(null, ErrorType.VALIDATION)).toBe(ErrorSeverity.LOW)
      expect(getErrorSeverity(null, ErrorType.NOT_FOUND)).toBe(ErrorSeverity.LOW)
    })
  })

  describe('isRetryableError', () => {
    it('should identify retryable error types', () => {
      expect(isRetryableError(ErrorType.NETWORK)).toBe(true)
      expect(isRetryableError(ErrorType.TIMEOUT)).toBe(true)
      expect(isRetryableError(ErrorType.SERVER)).toBe(true)
    })

    it('should identify non-retryable error types', () => {
      expect(isRetryableError(ErrorType.AUTHENTICATION)).toBe(false)
      expect(isRetryableError(ErrorType.AUTHORIZATION)).toBe(false)
      expect(isRetryableError(ErrorType.VALIDATION)).toBe(false)
      expect(isRetryableError(ErrorType.NOT_FOUND)).toBe(false)
    })
  })

  describe('getUserMessage', () => {
    it('should return specific messages for known codes', () => {
      const message = getUserMessage(ErrorType.AUTHENTICATION, 'expired')
      expect(message).toContain('session has expired')
    })

    it('should return default messages for unknown codes', () => {
      const message = getUserMessage(ErrorType.AUTHENTICATION, 'unknown_code')
      expect(message).toContain('sign in to continue')
    })

    it('should return default message when no code provided', () => {
      const message = getUserMessage(ErrorType.NETWORK)
      expect(message).toContain('connect to the server')
    })
  })

  describe('normalizeError', () => {
    it('should normalize ApiException correctly', () => {
      const apiError = new ApiException('Not found', 404, 'NOT_FOUND', ['resource: event'])
      const normalized = normalizeError(apiError)

      expect(normalized.type).toBe(ErrorType.NOT_FOUND)
      expect(normalized.severity).toBe(ErrorSeverity.LOW)
      expect(normalized.message).toBe('Not found')
      expect(normalized.code).toBe('404')
      expect(normalized.details).toEqual({ details: ['resource: event'] })
      expect(normalized.retryable).toBe(false)
      expect(normalized.userMessage).toContain('could not be found')
    })

    it('should normalize NetworkException correctly', () => {
      const networkError = new NetworkException('Connection failed')
      const normalized = normalizeError(networkError)

      expect(normalized.type).toBe(ErrorType.NETWORK)
      expect(normalized.severity).toBe(ErrorSeverity.MEDIUM)
      expect(normalized.retryable).toBe(true)
    })

    it('should normalize generic Error correctly', () => {
      const error = new Error('Generic error message')
      const normalized = normalizeError(error)

      expect(normalized.type).toBe(ErrorType.UNKNOWN)
      expect(normalized.message).toBe('Generic error message')
      expect(normalized.retryable).toBe(false)
    })

    it('should normalize string errors', () => {
      const normalized = normalizeError('String error')
      expect(normalized.message).toBe('String error')
      expect(normalized.type).toBe(ErrorType.UNKNOWN)
    })

    it('should have timestamp and userMessage', () => {
      const normalized = normalizeError('Test error')
      expect(normalized.timestamp).toBeInstanceOf(Date)
      expect(typeof normalized.userMessage).toBe('string')
      expect(normalized.userMessage.length).toBeGreaterThan(0)
    })
  })

  describe('retryOperation', () => {
    it('should succeed on first try', async () => {
      const operation = jest.fn().mockResolvedValue('success')
      const result = await retryOperation(operation)

      expect(result).toBe('success')
      expect(operation).toHaveBeenCalledTimes(1)
    })

    it('should retry retryable errors', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new NetworkException('Network error'))
        .mockResolvedValue('success')

      const result = await retryOperation(operation, 3, 10)

      expect(result).toBe('success')
      expect(operation).toHaveBeenCalledTimes(2)
    })

    it('should not retry non-retryable errors', async () => {
      const operation = jest.fn()
        .mockRejectedValue(new ApiException('Unauthorized', 401))

      await expect(retryOperation(operation)).rejects.toMatchObject({
        type: ErrorType.AUTHENTICATION
      })

      expect(operation).toHaveBeenCalledTimes(1)
    })

    it('should throw after max retries', async () => {
      const operation = jest.fn()
        .mockRejectedValue(new NetworkException('Network error'))

      await expect(retryOperation(operation, 2, 10)).rejects.toMatchObject({
        type: ErrorType.NETWORK
      })

      expect(operation).toHaveBeenCalledTimes(3) // Initial + 2 retries
    })

    it('should implement exponential backoff', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new NetworkException('Network error'))
        .mockRejectedValueOnce(new NetworkException('Network error'))
        .mockResolvedValue('success')

      const startTime = Date.now()
      const result = await retryOperation(operation, 3, 100)
      const endTime = Date.now()

      expect(result).toBe('success')
      expect(operation).toHaveBeenCalledTimes(3)
      
      // Should have waited at least 100ms (first retry) + 200ms (second retry) = 300ms
      // Adding some tolerance for test execution time
      expect(endTime - startTime).toBeGreaterThan(250)
    })
  })
})