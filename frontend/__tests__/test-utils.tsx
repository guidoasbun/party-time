import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'

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
}

const AllTheProviders = ({ children, queryClient }: AllTheProvidersProps) => {
  const testQueryClient = queryClient || createTestQueryClient()

  return (
    <SessionProvider session={null}>
      <QueryClientProvider client={testQueryClient}>
        {children}
      </QueryClientProvider>
    </SessionProvider>
  )
}

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    queryClient?: QueryClient
  }
) => {
  const { queryClient, ...renderOptions } = options || {}

  return render(ui, {
    wrapper: (props) => <AllTheProviders {...props} queryClient={queryClient} />,
    ...renderOptions,
  })
}

export * from '@testing-library/react'
export { customRender as render }
export { createTestQueryClient }

// Test to verify test utilities work correctly
describe('Test Utils', () => {
  it('should render components with providers', () => {
    const TestComponent = () => <div>Test Content</div>
    render(<TestComponent />)
    expect(document.body).toHaveTextContent('Test Content')
  })
})