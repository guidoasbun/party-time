import axios from 'axios'
import { getSession } from 'next-auth/react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const session = await getSession()
      if (session?.idToken) {
        config.headers.Authorization = `Bearer ${session.idToken}`
      }
    } catch (error) {
      console.warn('Failed to get session for API request:', error)
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      console.warn('Authentication failed - redirecting to login')
      // Note: In a real app, you might want to trigger a sign-out here
    }
    
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response.data)
    }
    
    return Promise.reject(error)
  }
)

// API response types
export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  success?: boolean
}

export interface ApiError {
  detail: string | string[]
  status_code: number
}

// Generic API functions
export const api = {
  get: async <T = unknown>(url: string, params?: Record<string, unknown>): Promise<T> => {
    const response = await apiClient.get<T>(url, { params })
    return response.data
  },

  post: async <T = unknown>(url: string, data?: unknown): Promise<T> => {
    const response = await apiClient.post<T>(url, data)
    return response.data
  },

  put: async <T = unknown>(url: string, data?: unknown): Promise<T> => {
    const response = await apiClient.put<T>(url, data)
    return response.data
  },

  patch: async <T = unknown>(url: string, data?: unknown): Promise<T> => {
    const response = await apiClient.patch<T>(url, data)
    return response.data
  },

  delete: async <T = unknown>(url: string): Promise<T> => {
    const response = await apiClient.delete<T>(url)
    return response.data
  },
}

// Authentication API functions
export const authApi = {
  register: async (data: {
    email: string
    password: string
    name: string
  }): Promise<{
    user_id: string
    email: string
    name: string
    email_verified: boolean
    message: string
  }> => {
    return api.post('/api/v1/auth/register', data)
  },

  verifyEmail: async (data: {
    email: string
    verification_code: string
  }): Promise<{
    message: string
    verified: boolean
  }> => {
    return api.post('/api/v1/auth/verify-email', data)
  },

  resendVerification: async (data: {
    email: string
  }): Promise<{
    message: string
  }> => {
    return api.post('/api/v1/auth/resend-verification', data)
  },

  requestPasswordReset: async (data: {
    email: string
  }): Promise<{
    message: string
  }> => {
    return api.post('/api/v1/auth/password-reset', data)
  },

  confirmPasswordReset: async (data: {
    email: string
    confirmation_code: string
    new_password: string
  }): Promise<{
    message: string
  }> => {
    return api.post('/api/v1/auth/password-reset-confirm', data)
  },

  getCurrentUser: async (): Promise<{
    user_id: string
    email: string
    name: string
    email_verified: boolean
    username: string
    groups: string[]
  }> => {
    return api.get('/api/v1/auth/me')
  },

  updateProfile: async (data: {
    name?: string
    phone?: string
  }): Promise<{
    user_id: string
    email: string
    name: string
    phone?: string
    message: string
  }> => {
    return api.patch('/api/v1/auth/profile', data)
  },
}

export default apiClient