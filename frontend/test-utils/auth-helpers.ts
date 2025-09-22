import { Session } from 'next-auth'
import { getSession } from 'next-auth/react'

// Test credentials
export const TEST_CREDENTIALS = {
  email: 'guido@asbun.io',
  password: 'Barracuda007!!',
  name: 'Guido Asbun'
} as const

// Test session type with id field
type TestSession = Session & {
  user?: {
    id?: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

// Mock session data
export const createMockSession = (overrides?: Partial<TestSession>): TestSession => ({
  user: {
    id: 'test-user-id',
    email: TEST_CREDENTIALS.email,
    name: TEST_CREDENTIALS.name,
    image: null,
  },
  idToken: 'mock-id-token-12345',
  accessToken: 'mock-access-token-67890',
  expires: '2024-12-31T23:59:59Z',
  ...overrides,
})

// Mock authenticated session
export const createAuthenticatedSession = (overrides?: Partial<TestSession>): TestSession =>
  createMockSession({
    idToken: 'valid-test-token',
    accessToken: 'valid-access-token',
    ...overrides,
  })

// Mock unauthenticated session (null)
export const createUnauthenticatedSession = () => null

// Mock expired session
export const createExpiredSession = (): TestSession =>
  createMockSession({
    expires: '2020-01-01T00:00:00Z', // Past date
  })

// Mock session with missing token
export const createSessionWithoutToken = (): TestSession =>
  createMockSession({
    idToken: undefined,
    accessToken: undefined,
  })

// Test authentication setup helpers
export const setupAuthenticatedTest = () => {
  const mockGetSession = getSession as jest.MockedFunction<typeof getSession>
  const session = createAuthenticatedSession()
  mockGetSession.mockResolvedValue(session)
  return { session, mockGetSession }
}

export const setupUnauthenticatedTest = () => {
  const mockGetSession = getSession as jest.MockedFunction<typeof getSession>
  mockGetSession.mockResolvedValue(null)
  return { mockGetSession }
}

export const setupSessionWithError = () => {
  const mockGetSession = getSession as jest.MockedFunction<typeof getSession>
  const error = new Error('Session retrieval failed')
  mockGetSession.mockRejectedValue(error)
  return { error, mockGetSession }
}

// Test environment setup
export const enableTestAuth = () => {
  process.env.TEST_ENABLE_AUTH = 'true'
}

export const disableTestAuth = () => {
  delete process.env.TEST_ENABLE_AUTH
}

// Helper to clean up test auth after each test
export const cleanupTestAuth = () => {
  disableTestAuth()
  jest.clearAllMocks()
}

// Integration test helpers for real API calls
export const createTestAuthHeaders = (token?: string) => ({
  'Authorization': `Bearer ${token || 'valid-test-token'}`,
  'Content-Type': 'application/json',
})

export const createTestLoginRequest = (overrides?: Partial<typeof TEST_CREDENTIALS>) => ({
  email: TEST_CREDENTIALS.email,
  password: TEST_CREDENTIALS.password,
  ...overrides,
})

interface RegisterRequest {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export const createTestRegisterRequest = (overrides?: Partial<RegisterRequest>) => ({
  name: TEST_CREDENTIALS.name,
  email: TEST_CREDENTIALS.email,
  password: TEST_CREDENTIALS.password,
  confirmPassword: TEST_CREDENTIALS.password,
  ...overrides,
})

// Mock NextAuth useSession hook responses
export const createMockUseSession = (session: TestSession | null, status: 'loading' | 'authenticated' | 'unauthenticated' = 'authenticated') => ({
  data: session,
  status,
  update: jest.fn(),
})

export const mockAuthenticatedUseSession = () => 
  createMockUseSession(createAuthenticatedSession(), 'authenticated')

export const mockUnauthenticatedUseSession = () => 
  createMockUseSession(null, 'unauthenticated')

export const mockLoadingUseSession = () => 
  createMockUseSession(null, 'loading')

// Add a basic test to satisfy Jest requirement
if (process.env.NODE_ENV === 'test') {
  describe('Auth Helpers', () => {
    it('should export auth helper functions', () => {
      expect(typeof createMockSession).toBe('function')
      expect(typeof setupAuthenticatedTest).toBe('function')
      expect(typeof setupUnauthenticatedTest).toBe('function')
    })
  })
}