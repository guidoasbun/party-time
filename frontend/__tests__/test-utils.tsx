import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Session } from 'next-auth'

// Simple mock provider for most tests
const MockNavigationProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

// Mock SessionProvider to avoid import issues in tests
const MockSessionProvider = ({ children, session }: { children: React.ReactNode, session?: Session | null }) => {
  return <>{children}</>
}

// Test-specific QueryClient with shorter retry delays
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

interface AllTheProvidersProps {
  children: React.ReactNode
  queryClient?: QueryClient
  session?: Session | null
}

const AllTheProviders = ({ children, queryClient, session = null }: AllTheProvidersProps) => {
  const testQueryClient = queryClient || createTestQueryClient()

  return (
    <MockSessionProvider session={session}>
      <QueryClientProvider client={testQueryClient}>
        <MockNavigationProvider>
          {children}
        </MockNavigationProvider>
      </QueryClientProvider>
    </MockSessionProvider>
  )
}

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    queryClient?: QueryClient
    session?: Session | null
    isAuthenticated?: boolean
  }
) => {
  const { queryClient, session, isAuthenticated = false, ...renderOptions } = options || {}

  return render(ui, {
    wrapper: (props) => <AllTheProviders {...props} queryClient={queryClient} session={session} />,
    ...renderOptions,
  })
}

export * from '@testing-library/react'
export { customRender as render }
export { createTestQueryClient }

// Re-export auth helpers for convenience
export * from './auth-helpers'

// Test to verify test utilities work correctly
describe('Test Utils', () => {
  it('should render components with providers', () => {
    const TestComponent = () => <div>Test Content</div>
    render(<TestComponent />)
    expect(document.body).toHaveTextContent('Test Content')
  })
})