// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.ts`

// Used for __tests__/testing-library.ts
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Polyfills for MSW and JSDOM
import 'whatwg-fetch'

// Mock fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({
      user_id: 'test-user-123',
      email: 'test@example.com',
      name: 'Test User',
      email_verified: true,
      username: 'testuser',
      groups: ['planner']
    }),
    headers: new Headers(),
    redirected: false,
    statusText: 'OK',
    type: 'basic',
    url: '',
    clone: jest.fn(),
    body: null,
    bodyUsed: false,
    arrayBuffer: jest.fn(),
    blob: jest.fn(),
    formData: jest.fn(),
    text: jest.fn(),
  } as Response)
) as jest.Mock

// TextEncoder/TextDecoder polyfill for MSW
import { TextEncoder, TextDecoder } from 'util'

// Polyfill TextEncoder/TextDecoder for Jest environment
Object.defineProperty(global, 'TextEncoder', {
  value: TextEncoder,
  writable: true,
  configurable: true,
})

Object.defineProperty(global, 'TextDecoder', {
  value: TextDecoder,
  writable: true,
  configurable: true,
})

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return {
      get: jest.fn(),
    }
  },
  usePathname() {
    return '/'
  },
}))

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated' as const,
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn().mockResolvedValue(null),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Setup MSW - Commented out for now due to Node.js compatibility issues
// We'll enable this when we write actual API tests
// import { beforeAll, afterEach, afterAll } from '@jest/globals'
// import { server } from './__tests__/mocks/server'

// Establish API mocking before all tests.
// beforeAll(() => server.listen())

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
// afterEach(() => server.resetHandlers())

// Clean up after the tests are finished.
// afterAll(() => server.close())