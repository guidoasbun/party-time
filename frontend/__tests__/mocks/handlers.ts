import { http, HttpResponse } from 'msw'

const API_BASE_URL = 'http://localhost:8000'

export const handlers = [
  // Auth endpoints
  http.post(`${API_BASE_URL}/api/v1/auth/register`, async ({ request }) => {
    const body = await request.json() as {
      email: string
      password: string
      name: string
    }

    // Simulate validation errors
    if (!body.email) {
      return HttpResponse.json(
        { detail: 'Email is required' },
        { status: 400 }
      )
    }

    if (body.email === 'existing@example.com') {
      return HttpResponse.json(
        { detail: 'Email already registered' },
        { status: 409 }
      )
    }

    // Success response
    return HttpResponse.json({
      user_id: 'test-user-123',
      email: body.email,
      name: body.name,
      email_verified: false,
      message: 'Registration successful. Please check your email for verification.'
    })
  }),

  http.post(`${API_BASE_URL}/api/v1/auth/verify-email`, async ({ request }) => {
    const body = await request.json() as {
      email: string
      verification_code: string
    }

    if (body.verification_code === 'invalid') {
      return HttpResponse.json(
        { detail: 'Invalid verification code' },
        { status: 400 }
      )
    }

    return HttpResponse.json({
      message: 'Email verified successfully',
      verified: true
    })
  }),

  http.post(`${API_BASE_URL}/api/v1/auth/resend-verification`, async ({ request }) => {
    const body = await request.json() as {
      email: string
    }

    return HttpResponse.json({
      message: 'Verification code sent successfully'
    })
  }),

  http.post(`${API_BASE_URL}/api/v1/auth/password-reset`, async ({ request }) => {
    const body = await request.json() as {
      email: string
    }

    if (body.email === 'nonexistent@example.com') {
      return HttpResponse.json(
        { detail: 'Email not found' },
        { status: 404 }
      )
    }

    return HttpResponse.json({
      message: 'Password reset code sent to your email'
    })
  }),

  http.post(`${API_BASE_URL}/api/v1/auth/password-reset-confirm`, async ({ request }) => {
    const body = await request.json() as {
      email: string
      confirmation_code: string
      new_password: string
    }

    if (body.confirmation_code === 'invalid') {
      return HttpResponse.json(
        { detail: 'Invalid confirmation code' },
        { status: 400 }
      )
    }

    return HttpResponse.json({
      message: 'Password reset successfully'
    })
  }),

  http.get(`${API_BASE_URL}/api/v1/auth/me`, ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { detail: 'Authentication required' },
        { status: 401 }
      )
    }

    return HttpResponse.json({
      user_id: 'test-user-123',
      email: 'test@example.com',
      name: 'Test User',
      email_verified: true,
      username: 'testuser',
      groups: ['planner']
    })
  }),

  http.patch(`${API_BASE_URL}/api/v1/auth/profile`, async ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { detail: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json() as {
      name?: string
      phone?: string
    }

    return HttpResponse.json({
      user_id: 'test-user-123',
      email: 'test@example.com',
      name: body.name || 'Test User',
      phone: body.phone,
      message: 'Profile updated successfully'
    })
  }),

  // Server error handler for testing error states
  http.get(`${API_BASE_URL}/api/v1/test/server-error`, () => {
    return HttpResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }),
]