// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.ts`

// Used for __tests__/testing-library.ts
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Polyfills for MSW and JSDOM
import 'whatwg-fetch'

// Mock fetch for API calls
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>

// TextEncoder/TextDecoder polyfill for MSW
import { TextEncoder, TextDecoder } from 'util'
import { Readable } from 'stream'

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

// Polyfill TransformStream for MSW
class MockTransformStream {
  readable: ReadableStream
  writable: WritableStream

  constructor() {
    this.readable = new ReadableStream()
    this.writable = new WritableStream()
  }
}

Object.defineProperty(global, 'TransformStream', {
  value: MockTransformStream,
  writable: true,
  configurable: true,
})

// Polyfill BroadcastChannel for MSW
class MockBroadcastChannel {
  name: string
  onmessage: ((event: any) => void) | null = null

  constructor(name: string) {
    this.name = name
  }

  postMessage(message: any) {
    // No-op for tests
  }

  close() {
    // No-op for tests
  }
}

Object.defineProperty(global, 'BroadcastChannel', {
  value: MockBroadcastChannel,
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

// Setup MSW for API testing - Temporarily disabled
// import { beforeAll, afterEach, afterAll } from '@jest/globals'

// Setup MSW server after polyfills are in place
// let server: any

// beforeAll(async () => {
//   const { server: mswServer } = await import('./__tests__/mocks/server')
//   server = mswServer
//   server.listen({ onUnhandledRequest: 'warn' })
// })

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
// afterEach(() => {
//   if (server) {
//     server.resetHandlers()
//   }
// })

// Clean up after the tests are finished.
// afterAll(() => {
//   if (server) {
//     server.close()
//   }
// })