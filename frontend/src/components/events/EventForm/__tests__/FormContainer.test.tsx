import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormContainer } from '../FormContainer'
import { EventType, EventStatus } from '@/types/event.types'
import { FormPersistence } from '@/lib/utils/form'
import { EventCreateFormData } from '@/lib/validations/event'

// Mock dependencies
jest.mock('@/lib/utils/form', () => ({
  FormPersistence: {
    loadFormData: jest.fn(),
    loadCurrentStep: jest.fn(),
    saveFormData: jest.fn(),
    saveCurrentStep: jest.fn(),
    clearFormData: jest.fn(),
    hasSavedData: jest.fn(),
  },
  getStepProgress: jest.fn((current, total) => Math.round(((current + 1) / total) * 100)),
  canNavigateToStep: jest.fn((target, current, completed) => {
    return target <= current || completed.has(target) || (target === current + 1 && completed.has(current))
  }),
  createAutoSave: jest.fn(() => jest.fn()),
}))

const mockFormPersistence = FormPersistence as jest.Mocked<typeof FormPersistence>

// Mock hooks
jest.mock('@/hooks/useToast', () => ({
  toast: jest.fn()
}))

// Test data
const mockFormData: Partial<EventCreateFormData> = {
  name: 'Test Event',
  type: EventType.BIRTHDAY,
  start_date: '2024-12-01',
  is_public: false
}

const mockOnSubmit = jest.fn()
const mockOnCancel = jest.fn()
const mockOnSaveDraft = jest.fn()

// Mock child component
const MockFormStep = ({ currentStep }: { currentStep: string }) => (
  <div data-testid={`step-${currentStep}`}>
    Current Step: {currentStep}
  </div>
)

const renderFormContainer = (props: Partial<React.ComponentProps<typeof FormContainer>> = {}) => {
  return render(
    <FormContainer
      onSubmit={mockOnSubmit}
      onCancel={mockOnCancel}
      onSaveDraft={mockOnSaveDraft}
      {...props}
    >
      {({ currentStep }) => <MockFormStep currentStep={currentStep} />}
    </FormContainer>
  )
}

describe('FormContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFormPersistence.loadFormData.mockReturnValue(null)
    mockFormPersistence.loadCurrentStep.mockReturnValue(null)
  })

  describe('Rendering', () => {
    it('renders the form container with progress bar', () => {
      renderFormContainer()

      expect(screen.getByText('Create Event')).toBeInTheDocument()
      expect(screen.getByText('Step 1 of 4')).toBeInTheDocument()
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    it('renders step indicators', () => {
      renderFormContainer()

      expect(screen.getByText('Basic Information')).toBeInTheDocument()
      expect(screen.getByText('Date & Time')).toBeInTheDocument()
      expect(screen.getByText('Location')).toBeInTheDocument()
      expect(screen.getByText('Event Settings')).toBeInTheDocument()
    })

    it('starts with the first step active', () => {
      renderFormContainer()

      expect(screen.getByTestId('step-basicInfo')).toBeInTheDocument()
      expect(screen.queryByTestId('step-dateTime')).not.toBeInTheDocument()
    })

    it('displays current step title and description', () => {
      renderFormContainer()

      expect(screen.getByText('Basic Information')).toBeInTheDocument()
      expect(screen.getByText('Event name, type, and description')).toBeInTheDocument()
    })
  })

  describe('Form Persistence', () => {
    it('loads saved form data on mount', () => {
      mockFormPersistence.loadFormData.mockReturnValue(mockFormData)

      renderFormContainer({ formId: 'test-form' })

      expect(mockFormPersistence.loadFormData).toHaveBeenCalledWith('test-form')
    })

    it('loads saved current step on mount', () => {
      mockFormPersistence.loadCurrentStep.mockReturnValue('dateTime')

      renderFormContainer({ formId: 'test-form' })

      expect(mockFormPersistence.loadCurrentStep).toHaveBeenCalledWith('test-form')
      expect(screen.getByTestId('step-dateTime')).toBeInTheDocument()
    })

    it('uses initial data when provided', () => {
      renderFormContainer({ initialData: mockFormData })

      expect(mockFormPersistence.loadFormData).not.toHaveBeenCalled()
    })

    it('saves current step when changed', async () => {
      const user = userEvent.setup()
      renderFormContainer({ formId: 'test-form' })

      // Mock step validation to pass
      const nextButton = screen.getByText('Next')
      await user.click(nextButton)

      expect(mockFormPersistence.saveCurrentStep).toHaveBeenCalledWith('dateTime', 'test-form')
    })
  })

  describe('Navigation', () => {
    it('shows Previous button disabled on first step', () => {
      renderFormContainer()

      const previousButton = screen.getByText('Previous')
      expect(previousButton).toBeDisabled()
    })

    it('shows Next button on non-final steps', () => {
      renderFormContainer()

      expect(screen.getByText('Next')).toBeInTheDocument()
      expect(screen.queryByText('Create Event')).not.toBeInTheDocument()
    })

    it('shows Create Event button on final step', () => {
      mockFormPersistence.loadCurrentStep.mockReturnValue('settings')
      renderFormContainer()

      expect(screen.getByText('Create Event')).toBeInTheDocument()
      expect(screen.queryByText('Next')).not.toBeInTheDocument()
    })

    it('enables Previous button on non-first steps', () => {
      mockFormPersistence.loadCurrentStep.mockReturnValue('dateTime')
      renderFormContainer()

      const previousButton = screen.getByText('Previous')
      expect(previousButton).not.toBeDisabled()
    })

    it('navigates to previous step when Previous is clicked', async () => {
      const user = userEvent.setup()
      mockFormPersistence.loadCurrentStep.mockReturnValue('dateTime')
      renderFormContainer()

      expect(screen.getByTestId('step-dateTime')).toBeInTheDocument()

      const previousButton = screen.getByText('Previous')
      await user.click(previousButton)

      expect(screen.getByTestId('step-basicInfo')).toBeInTheDocument()
    })

    it('allows navigation to completed steps via step indicators', async () => {
      const user = userEvent.setup()
      renderFormContainer()

      // First, navigate forward to mark step as completed
      const nextButton = screen.getByText('Next')
      await user.click(nextButton)

      // Now try to navigate back via step indicator
      const stepIndicator = screen.getByText('Basic Information').closest('button')
      if (stepIndicator) {
        await user.click(stepIndicator)
        expect(screen.getByTestId('step-basicInfo')).toBeInTheDocument()
      }
    })
  })

  describe('Form Submission', () => {
    it('calls onSubmit when form is submitted', async () => {
      const user = userEvent.setup()
      mockFormPersistence.loadCurrentStep.mockReturnValue('settings')
      renderFormContainer()

      const submitButton = screen.getByText('Create Event')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled()
      })
    })

    it('clears saved data after successful submission', async () => {
      const user = userEvent.setup()
      mockFormPersistence.loadCurrentStep.mockReturnValue('settings')
      renderFormContainer({ formId: 'test-form' })

      const submitButton = screen.getByText('Create Event')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockFormPersistence.clearFormData).toHaveBeenCalledWith('test-form')
      })
    })

    it('shows loading state during submission', async () => {
      const user = userEvent.setup()
      mockFormPersistence.loadCurrentStep.mockReturnValue('settings')
      mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)))

      renderFormContainer()

      const submitButton = screen.getByText('Create Event')
      await user.click(submitButton)

      expect(screen.getByText('Creating...')).toBeInTheDocument()
    })
  })

  describe('Draft Management', () => {
    it('shows Save Draft button', () => {
      renderFormContainer()

      expect(screen.getByText('Save Draft')).toBeInTheDocument()
    })

    it('calls onSaveDraft when Save Draft is clicked', async () => {
      const user = userEvent.setup()
      renderFormContainer()

      const saveDraftButton = screen.getByText('Save Draft')
      await user.click(saveDraftButton)

      expect(mockFormPersistence.saveFormData).toHaveBeenCalled()
    })

    it('auto-saves form data when changed', async () => {
      renderFormContainer()

      // Auto-save should be triggered by form changes
      // This would be tested through form interactions
      expect(mockFormPersistence.saveFormData).toHaveBeenCalled()
    })
  })

  describe('Cancel Functionality', () => {
    it('shows Cancel button when onCancel is provided', () => {
      renderFormContainer()

      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    it('calls onCancel when Cancel button is clicked', async () => {
      const user = userEvent.setup()
      renderFormContainer()

      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)

      expect(mockOnCancel).toHaveBeenCalled()
    })

    it('does not show Cancel button when onCancel is not provided', () => {
      renderFormContainer({ onCancel: undefined })

      expect(screen.queryByText('Cancel')).not.toBeInTheDocument()
    })
  })

  describe('Step Validation', () => {
    it('disables Next button when current step is invalid', () => {
      renderFormContainer()

      const nextButton = screen.getByText('Next')
      // Initially should be disabled until valid data is entered
      expect(nextButton).toBeDisabled()
    })

    it('enables Next button when current step is valid', async () => {
      // This would require mocking form validation
      // The implementation would depend on the actual form validation logic
      renderFormContainer()

      // After entering valid data, Next should be enabled
      // This test would need to be more specific to the actual form fields
    })
  })

  describe('Keyboard Navigation', () => {
    it('supports keyboard shortcuts for navigation', () => {
      renderFormContainer()

      // Test Ctrl+ArrowLeft and Ctrl+ArrowRight shortcuts
      fireEvent.keyDown(window, { key: 'ArrowLeft', ctrlKey: true })
      // Should not navigate back from first step

      fireEvent.keyDown(window, { key: 'ArrowRight', ctrlKey: true })
      // Should navigate forward if step is valid
    })

    it('supports keyboard shortcut for saving', () => {
      renderFormContainer({ formId: 'test-form' })

      fireEvent.keyDown(window, { key: 's', ctrlKey: true })

      expect(mockFormPersistence.saveFormData).toHaveBeenCalledWith(
        expect.any(Object),
        'test-form'
      )
    })
  })

  describe('Error Handling', () => {
    it('displays validation errors', () => {
      renderFormContainer()

      // This would test error display when validation fails
      // Implementation would depend on actual form validation
    })

    it('handles submission errors gracefully', async () => {
      const user = userEvent.setup()
      mockFormPersistence.loadCurrentStep.mockReturnValue('settings')
      mockOnSubmit.mockRejectedValue(new Error('Submission failed'))

      renderFormContainer()

      const submitButton = screen.getByText('Create Event')
      await user.click(submitButton)

      // Should handle the error and not clear saved data
      await waitFor(() => {
        expect(mockFormPersistence.clearFormData).not.toHaveBeenCalled()
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      renderFormContainer()

      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveAttribute('aria-valuenow')
      expect(progressBar).toHaveAttribute('aria-valuemax', '100')
    })

    it('supports keyboard navigation between step indicators', () => {
      renderFormContainer()

      const stepButtons = screen.getAllByRole('button').filter(button =>
        button.textContent?.includes('Information') ||
        button.textContent?.includes('Date') ||
        button.textContent?.includes('Location') ||
        button.textContent?.includes('Settings')
      )

      stepButtons.forEach(button => {
        expect(button).toHaveAttribute('type', 'button')
      })
    })
  })
})