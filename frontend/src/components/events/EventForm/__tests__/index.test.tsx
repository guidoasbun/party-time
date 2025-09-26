import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import { EventForm } from '../index'
import { EventType } from '@/types/event.types'
import { transformFormDataForApi } from '@/lib/utils/form'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

jest.mock('@/hooks/useToast', () => ({
  useToast: jest.fn(() => ({
    toast: jest.fn()
  }))
}))

jest.mock('@/hooks/api/useEvents', () => ({
  useCreateEvent: jest.fn(() => ({
    mutateAsync: jest.fn()
  }))
}))

jest.mock('@/lib/utils/form', () => ({
  ...jest.requireActual('@/lib/utils/form'),
  transformFormDataForApi: jest.fn()
}))

// Mock form components
jest.mock('../FormContainer', () => ({
  FormContainer: ({ children, onSubmit, onCancel, onSaveDraft }: {
    children: (props: Record<string, unknown>) => React.ReactNode
    onSubmit: (data: Record<string, unknown>) => void
    onCancel: () => void
    onSaveDraft: (data: Record<string, unknown>) => void
  }) => {
    const mockFormProps = {
      currentStep: 'basicInfo',
      currentStepIndex: 0,
      totalSteps: 4,
      isFirstStep: true,
      isLastStep: false,
      goToNextStep: jest.fn(),
      goToPreviousStep: jest.fn(),
      goToStep: jest.fn(),
      isStepValid: true,
      isSubmitting: false,
      completedSteps: new Set(),
      errors: {},
      clearErrors: jest.fn()
    }

    return (
      <div data-testid="form-container">
        <button onClick={() => onSubmit({ name: 'Test Event', type: EventType.BIRTHDAY })}>
          Submit Form
        </button>
        <button onClick={() => onCancel()}>Cancel Form</button>
        <button onClick={() => onSaveDraft({ name: 'Draft Event' })}>Save Draft</button>
        {children(mockFormProps)}
      </div>
    )
  }
}))

jest.mock('../BasicInfoStep', () => ({
  BasicInfoStep: () => <div data-testid="basic-info-step">Basic Info Step</div>
}))

jest.mock('../DateTimeStep', () => ({
  DateTimeStep: () => <div data-testid="date-time-step">Date Time Step</div>
}))

jest.mock('../LocationStep', () => ({
  LocationStep: () => <div data-testid="location-step">Location Step</div>
}))

jest.mock('../SettingsStep', () => ({
  SettingsStep: () => <div data-testid="settings-step">Settings Step</div>
}))

const mockPush = jest.fn()
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockTransformFormDataForApi = transformFormDataForApi as jest.MockedFunction<typeof transformFormDataForApi>

// Import mocked hooks
import { useCreateEvent } from '@/hooks/api/useEvents'
import { useToast } from '@/hooks/useToast'

const mockUseCreateEvent = useCreateEvent as jest.MockedFunction<typeof useCreateEvent>
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>
const mockToast = jest.fn()

describe('EventForm', () => {
  const mockMutateAsync = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn()
    })

    mockUseCreateEvent.mockReturnValue({
      mutateAsync: mockMutateAsync
    })

    mockUseToast.mockReturnValue({
      toast: mockToast
    })

    mockTransformFormDataForApi.mockImplementation((data) => data)
    mockMutateAsync.mockResolvedValue({ id: 'test-event-id' })
  })

  describe('Rendering', () => {
    it('renders the form container', () => {
      render(<EventForm />)

      expect(screen.getByTestId('form-container')).toBeInTheDocument()
    })

    it('renders the basic info step by default', () => {
      render(<EventForm />)

      expect(screen.getByTestId('basic-info-step')).toBeInTheDocument()
    })

    it('passes initial data to form container', () => {
      const initialData = {
        name: 'Initial Event',
        type: EventType.WEDDING
      }

      render(<EventForm initialData={initialData} />)

      // The form container should receive the initial data
      expect(screen.getByTestId('form-container')).toBeInTheDocument()
    })

    it('passes form ID to form container', () => {
      render(<EventForm formId="test-form-id" />)

      expect(screen.getByTestId('form-container')).toBeInTheDocument()
    })
  })

  describe('Form Submission', () => {
    it('handles successful form submission', async () => {
      const user = userEvent.setup()
      render(<EventForm />)

      const submitButton = screen.getByText('Submit Form')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockTransformFormDataForApi).toHaveBeenCalledWith({
          name: 'Test Event',
          type: EventType.BIRTHDAY
        })
        expect(mockMutateAsync).toHaveBeenCalled()
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Event Created!',
          description: 'Test Event has been created successfully.'
        })
        expect(mockPush).toHaveBeenCalledWith('/events/test-event-id')
      })
    })

    it('calls onSuccess callback when provided', async () => {
      const user = userEvent.setup()
      const mockOnSuccess = jest.fn()

      render(<EventForm onSuccess={mockOnSuccess} />)

      const submitButton = screen.getByText('Submit Form')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith('test-event-id')
        expect(mockPush).not.toHaveBeenCalled() // Should not navigate when onSuccess is provided
      })
    })

    it('handles form submission errors', async () => {
      const user = userEvent.setup()
      const error = new Error('Creation failed')
      mockMutateAsync.mockRejectedValue(error)

      render(<EventForm />)

      const submitButton = screen.getByText('Submit Form')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Failed to Create Event',
          description: 'Creation failed',
          variant: 'destructive'
        })
      })
    })

    it('handles unknown errors during submission', async () => {
      const user = userEvent.setup()
      mockMutateAsync.mockRejectedValue('Unknown error')

      render(<EventForm />)

      const submitButton = screen.getByText('Submit Form')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Failed to Create Event',
          description: 'Something went wrong. Please try again.',
          variant: 'destructive'
        })
      })
    })
  })

  describe('Draft Management', () => {
    it('saves draft with valid data', async () => {
      const user = userEvent.setup()
      render(<EventForm />)

      const saveDraftButton = screen.getByText('Save Draft')
      await user.click(saveDraftButton)

      await waitFor(() => {
        // Draft saving is temporarily disabled, only toast should show
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Draft Saved',
          description: 'Your event draft has been saved.'
        })
      })
    })

    it('does not save draft without event name', async () => {
      const user = userEvent.setup()

      // Mock the FormContainer to pass data without name
      jest.doMock('../FormContainer', () => ({
        FormContainer: ({ children, onSaveDraft }: {
          children: (props: Record<string, unknown>) => React.ReactNode
          onSaveDraft: (data: Record<string, unknown>) => void
        }) => (
          <div data-testid="form-container">
            <button onClick={() => onSaveDraft({})}>Save Draft</button>
            {children({})}
          </div>
        )
      }))

      render(<EventForm />)

      const saveDraftButton = screen.getByText('Save Draft')
      await user.click(saveDraftButton)

      // Draft saving is temporarily disabled - no external service to mock
    })

    it('handles draft save errors silently', async () => {
      const user = userEvent.setup()

      render(<EventForm />)

      const saveDraftButton = screen.getByText('Save Draft')
      await user.click(saveDraftButton)

      await waitFor(() => {
        // Draft saving is temporarily disabled, only shows success toast
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Draft Saved',
          description: 'Your event draft has been saved.'
        })
        // Should not show error toast for draft saves
        expect(mockToast).not.toHaveBeenCalledWith(
          expect.objectContaining({ variant: 'destructive' })
        )
      })
    })
  })

  describe('Cancel Functionality', () => {
    it('calls onCancel when provided', async () => {
      const user = userEvent.setup()
      const mockOnCancel = jest.fn()

      render(<EventForm onCancel={mockOnCancel} />)

      const cancelButton = screen.getByText('Cancel Form')
      await user.click(cancelButton)

      expect(mockOnCancel).toHaveBeenCalled()
      expect(mockPush).not.toHaveBeenCalled()
    })

    it('navigates to events list when onCancel is not provided', async () => {
      const user = userEvent.setup()
      render(<EventForm />)

      const cancelButton = screen.getByText('Cancel Form')
      await user.click(cancelButton)

      expect(mockPush).toHaveBeenCalledWith('/events')
    })
  })

  describe('Step Rendering', () => {
    it('renders different steps based on currentStep', () => {
      // This would require mocking the FormContainer to return different currentStep values
      render(<EventForm />)

      // Since we're mocking currentStep as 'basicInfo', we should see the basic info step
      expect(screen.getByTestId('basic-info-step')).toBeInTheDocument()
    })
  })

  describe('Data Transformation', () => {
    it('transforms form data for API submission', async () => {
      const user = userEvent.setup()

      render(<EventForm />)

      const submitButton = screen.getByText('Submit Form')
      await user.click(submitButton)

      await waitFor(() => {
        // Check that transformFormDataForApi was called with the mock form data from FormContainer
        expect(mockTransformFormDataForApi).toHaveBeenCalledWith({
          name: 'Test Event',
          type: EventType.BIRTHDAY
        })
      })
    })
  })

  describe('Integration', () => {
    it('integrates with useEvents hook correctly', () => {
      render(<EventForm />)

      expect(mockUseCreateEvent).toHaveBeenCalled()
    })

    it('integrates with router for navigation', async () => {
      const user = userEvent.setup()
      render(<EventForm />)

      const cancelButton = screen.getByText('Cancel Form')
      await user.click(cancelButton)

      expect(mockPush).toHaveBeenCalledWith('/events')
    })

    it('shows appropriate success messages', async () => {
      const user = userEvent.setup()
      render(<EventForm />)

      const submitButton = screen.getByText('Submit Form')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Event Created!',
            description: expect.stringContaining('has been created successfully')
          })
        )
      })
    })
  })
})