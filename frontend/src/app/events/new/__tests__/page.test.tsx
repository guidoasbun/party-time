import { render, screen } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import NewEventPage from '../page'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock the EventForm component
jest.mock('@/components/events/EventForm', () => ({
  EventForm: ({ formId, onSuccess, onCancel }: {
    formId?: string
    onSuccess?: (eventId: string) => void
    onCancel?: () => void
  }) => (
    <div data-testid="event-form">
      <div data-testid="form-id">{formId}</div>
      <button
        data-testid="trigger-success"
        onClick={() => onSuccess?.('test-event-id')}
      >
        Trigger Success
      </button>
      <button
        data-testid="trigger-cancel"
        onClick={() => onCancel?.()}
      >
        Trigger Cancel
      </button>
    </div>
  )
}))

describe('NewEventPage', () => {
  const mockPush = jest.fn()
  const mockRouter = {
    push: mockPush,
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  })

  it('renders the page with correct title and description', () => {
    render(<NewEventPage />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Create New Event')
    expect(screen.getByText(/Let's create an amazing event!/)).toBeInTheDocument()
    expect(screen.getByText(/Fill out the details below to get started/)).toBeInTheDocument()
  })

  it('renders the EventForm component with correct props', () => {
    render(<NewEventPage />)

    const eventForm = screen.getByTestId('event-form')
    expect(eventForm).toBeInTheDocument()

    const formId = screen.getByTestId('form-id')
    expect(formId).toHaveTextContent('new-event')
  })

  it('navigates to created event on success', () => {
    render(<NewEventPage />)

    const successButton = screen.getByTestId('trigger-success')
    successButton.click()

    expect(mockPush).toHaveBeenCalledWith('/events/test-event-id')
  })

  it('navigates to events list on cancel', () => {
    render(<NewEventPage />)

    const cancelButton = screen.getByTestId('trigger-cancel')
    cancelButton.click()

    expect(mockPush).toHaveBeenCalledWith('/events')
  })

  it('has proper page structure and layout', () => {
    render(<NewEventPage />)

    // Check for main container
    const container = screen.getByTestId('event-form').closest('.container')
    expect(container).toBeInTheDocument()

    // Check for proper spacing/padding classes
    const mainDiv = screen.getByTestId('event-form').closest('.min-h-screen')
    expect(mainDiv).toBeInTheDocument()
    expect(mainDiv).toHaveClass('bg-background')
  })

  it('has semantic heading structure', () => {
    render(<NewEventPage />)

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('Create New Event')

    // Ensure no multiple h1 elements
    const allH1s = screen.getAllByRole('heading', { level: 1 })
    expect(allH1s).toHaveLength(1)
  })

  describe('Navigation callbacks', () => {
    it('calls router.push with event ID on successful creation', () => {
      render(<NewEventPage />)

      const successButton = screen.getByTestId('trigger-success')
      successButton.click()

      expect(mockPush).toHaveBeenCalledTimes(1)
      expect(mockPush).toHaveBeenCalledWith('/events/test-event-id')
    })

    it('calls router.push with events list path on cancel', () => {
      render(<NewEventPage />)

      const cancelButton = screen.getByTestId('trigger-cancel')
      cancelButton.click()

      expect(mockPush).toHaveBeenCalledTimes(1)
      expect(mockPush).toHaveBeenCalledWith('/events')
    })

    it('handles multiple success calls correctly', () => {
      render(<NewEventPage />)

      const successButton = screen.getByTestId('trigger-success')

      // Trigger success multiple times
      successButton.click()
      successButton.click()

      // Should navigate each time
      expect(mockPush).toHaveBeenCalledTimes(2)
      expect(mockPush).toHaveBeenNthCalledWith(1, '/events/test-event-id')
      expect(mockPush).toHaveBeenNthCalledWith(2, '/events/test-event-id')
    })
  })

  describe('EventForm integration', () => {
    it('passes formId prop correctly', () => {
      render(<NewEventPage />)

      const formId = screen.getByTestId('form-id')
      expect(formId).toHaveTextContent('new-event')
    })

    it('provides success and cancel handlers', () => {
      render(<NewEventPage />)

      // Both buttons should be present, indicating handlers were passed
      expect(screen.getByTestId('trigger-success')).toBeInTheDocument()
      expect(screen.getByTestId('trigger-cancel')).toBeInTheDocument()
    })
  })

  describe('Page metadata and SEO', () => {
    it('has descriptive content for page purpose', () => {
      render(<NewEventPage />)

      // Check that the page clearly communicates its purpose
      expect(screen.getByText('Create New Event')).toBeInTheDocument()
      expect(screen.getByText(/Let's create an amazing event!/)).toBeInTheDocument()
    })
  })

  describe('Error handling', () => {
    it('handles router not being available gracefully', () => {
      // Mock router to return undefined
      ;(useRouter as jest.Mock).mockReturnValue({
        push: undefined,
      })

      // Should not throw an error
      expect(() => render(<NewEventPage />)).not.toThrow()
    })

    it('handles missing router.push gracefully', () => {
      ;(useRouter as jest.Mock).mockReturnValue({})

      render(<NewEventPage />)

      const successButton = screen.getByTestId('trigger-success')

      // Should not throw when router.push is undefined
      expect(() => successButton.click()).not.toThrow()
    })
  })

  describe('Component lifecycle', () => {
    it('initializes properly', () => {
      const { unmount } = render(<NewEventPage />)

      // Should render without errors
      expect(screen.getByTestId('event-form')).toBeInTheDocument()

      // Should unmount without errors
      expect(() => unmount()).not.toThrow()
    })
  })
})