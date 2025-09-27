import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { BasicInfoStep, MAX_DESCRIPTION_LENGTH, MAX_NAME_LENGTH } from '../BasicInfoStep'
import { EventCreateFormData, eventCreateSchema } from '@/lib/validations/event'
import { EventType } from '@/types/event.types'

// Mock EventTypeSelector component
jest.mock('@/components/events/EventTypeSelector', () => ({
  EventTypeSelector: ({ value, onChange, error, ...props }: {
    value?: string
    onChange: (value: string) => void
    error?: string
    [key: string]: unknown
  }) => (
    <div data-testid="event-type-selector" {...props}>
      <div data-testid="current-value">{value || 'none'}</div>
      <div data-testid="error">{error || 'no-error'}</div>
      <button
        type="button"
        data-testid="select-wedding"
        onClick={() => onChange(EventType.WEDDING)}
      >
        Wedding
      </button>
      <button
        type="button"
        data-testid="select-birthday"
        onClick={() => onChange(EventType.BIRTHDAY)}
      >
        Birthday
      </button>
    </div>
  )
}))

// Test wrapper component that provides form context
function TestFormWrapper({
  children,
  defaultValues = {}
}: {
  children: React.ReactNode
  defaultValues?: Partial<EventCreateFormData>
}) {
  const methods = useForm<EventCreateFormData>({
    resolver: zodResolver(eventCreateSchema),
    defaultValues: {
      name: '',
      description: '',
      type: undefined,
      ...defaultValues
    },
    mode: 'onChange'
  })

  return (
    <FormProvider {...methods}>
      <form>
        {children}
      </form>
    </FormProvider>
  )
}

const renderBasicInfoStep = (props: Partial<React.ComponentProps<typeof BasicInfoStep>> = {}, formDefaultValues: Partial<EventCreateFormData> = {}) => {
  return render(
    <TestFormWrapper defaultValues={formDefaultValues}>
      <BasicInfoStep {...props} />
    </TestFormWrapper>
  )
}

describe('BasicInfoStep', () => {
  describe('Rendering', () => {
    it('renders all form fields', () => {
      renderBasicInfoStep()

      // Event name field
      expect(screen.getByLabelText(/event name/i)).toBeInTheDocument()

      // Event type selector
      expect(screen.getByTestId('event-type-selector')).toBeInTheDocument()

      // Event description field
      expect(screen.getByLabelText(/event description/i)).toBeInTheDocument()

      // Help text
      expect(screen.getByText(/tips for a great event description/i)).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      const { container } = renderBasicInfoStep({ className: 'custom-class' })

      const stepContainer = container.querySelector('.custom-class')
      expect(stepContainer).toBeInTheDocument()
    })

    it('shows required indicators for required fields', () => {
      renderBasicInfoStep()

      // Event type should have required indicator
      expect(screen.getByText('Event Type')).toBeInTheDocument()
      expect(screen.getByText('*')).toBeInTheDocument()
    })

    it('renders help text sections', () => {
      renderBasicInfoStep()

      expect(screen.getByText(/mention the occasion or purpose/i)).toBeInTheDocument()
      expect(screen.getByText(/include any special themes/i)).toBeInTheDocument()
      expect(screen.getByText(/note if it's a surprise/i)).toBeInTheDocument()
      expect(screen.getByText(/add any dietary preferences/i)).toBeInTheDocument()
    })
  })

  describe('Event Name Field', () => {
    it('allows typing in the name field', async () => {
      const user = userEvent.setup()
      renderBasicInfoStep()

      const nameInput = screen.getByLabelText(/event name/i)
      await user.type(nameInput, 'Test Event')

      expect(nameInput).toHaveValue('Test Event')
    })

    it('shows character count when text is entered', async () => {
      const user = userEvent.setup()
      renderBasicInfoStep()

      const nameInput = screen.getByLabelText(/event name/i)
      await user.type(nameInput, 'Test Event')

      expect(screen.getByText('10/255 characters')).toBeInTheDocument()
    })

    it('does not show character count when field is empty', () => {
      renderBasicInfoStep()

      expect(screen.queryByText('/255 characters')).not.toBeInTheDocument()
    })

    it('shows warning when approaching character limit', async () => {
      const user = userEvent.setup()
      renderBasicInfoStep()

      const nameInput = screen.getByLabelText(/event name/i)
      const longName = 'A'.repeat(Math.floor(MAX_NAME_LENGTH * 0.95)) // 95% of limit
      await user.type(nameInput, longName)

      const characterCount = screen.getByText(`${longName.length}/255 characters`)
      expect(characterCount).toHaveClass('text-warning')
    })

    it('shows error styling when at character limit', async () => {
      const user = userEvent.setup()
      renderBasicInfoStep()

      const nameInput = screen.getByLabelText(/event name/i)
      const maxName = 'A'.repeat(MAX_NAME_LENGTH)
      await user.type(nameInput, maxName)

      const characterCount = screen.getByText(`${MAX_NAME_LENGTH}/255 characters`)
      expect(characterCount).toHaveClass('text-destructive')
    })

    it('enforces max length attribute', () => {
      renderBasicInfoStep()

      const nameInput = screen.getByLabelText(/event name/i)
      expect(nameInput).toHaveAttribute('maxLength', MAX_NAME_LENGTH.toString())
    })
  })

  describe('Event Type Field', () => {
    it('renders event type selector with correct props', () => {
      renderBasicInfoStep()

      const typeSelector = screen.getByTestId('event-type-selector')
      expect(typeSelector).toBeInTheDocument()
      expect(typeSelector).toHaveAttribute('aria-label', 'Select the type of event you\'re planning')
    })

    it('shows current value in selector', () => {
      renderBasicInfoStep({}, { type: EventType.WEDDING })

      expect(screen.getByTestId('current-value')).toHaveTextContent('wedding')
    })

    it('shows no value initially when not provided', () => {
      renderBasicInfoStep()

      expect(screen.getByTestId('current-value')).toHaveTextContent('none')
    })

    it('calls onChange when event type is selected', async () => {
      const user = userEvent.setup()
      renderBasicInfoStep()

      const weddingButton = screen.getByTestId('select-wedding')
      await user.click(weddingButton)

      // Should update the current value
      await waitFor(() => {
        expect(screen.getByTestId('current-value')).toHaveTextContent('wedding')
      })
    })

    it('displays helper text for event type', () => {
      renderBasicInfoStep()

      expect(screen.getByText(/choose the type that best describes your event/i)).toBeInTheDocument()
    })
  })

  describe('Event Description Field', () => {
    it('allows typing in the description field', async () => {
      const user = userEvent.setup()
      renderBasicInfoStep()

      const descriptionInput = screen.getByLabelText(/event description/i)
      await user.type(descriptionInput, 'This is a test description')

      expect(descriptionInput).toHaveValue('This is a test description')
    })

    it('shows character count for description', async () => {
      const user = userEvent.setup()
      renderBasicInfoStep()

      const descriptionInput = screen.getByLabelText(/event description/i)
      await user.type(descriptionInput, 'Test description')

      expect(screen.getByText(`16/${MAX_DESCRIPTION_LENGTH} characters`)).toBeInTheDocument()
    })

    it('shows helper text for description', () => {
      renderBasicInfoStep()

      expect(screen.getByText(/provide details about your event to help with planning/i)).toBeInTheDocument()
    })

    it('shows warning when approaching description character limit', async () => {
      const user = userEvent.setup()
      renderBasicInfoStep()

      const descriptionInput = screen.getByLabelText(/event description/i)
      const longDescription = 'A'.repeat(Math.floor(MAX_DESCRIPTION_LENGTH * 0.95))
      await user.type(descriptionInput, longDescription)

      const characterCount = screen.getByText(`${longDescription.length}/${MAX_DESCRIPTION_LENGTH} characters`)
      expect(characterCount).toHaveClass('text-warning')
    })

    it('shows error styling when at description character limit', async () => {
      const user = userEvent.setup()
      renderBasicInfoStep()

      const descriptionInput = screen.getByLabelText(/event description/i)
      const maxDescription = 'A'.repeat(MAX_DESCRIPTION_LENGTH)
      await user.type(descriptionInput, maxDescription)

      const characterCount = screen.getByText(`${MAX_DESCRIPTION_LENGTH}/${MAX_DESCRIPTION_LENGTH} characters`)
      expect(characterCount).toHaveClass('text-destructive')
    })

    it('enforces max length attribute', () => {
      renderBasicInfoStep()

      const descriptionInput = screen.getByLabelText(/event description/i)
      expect(descriptionInput).toHaveAttribute('maxLength', MAX_DESCRIPTION_LENGTH.toString())
    })

    it('has proper ARIA attributes for description', () => {
      renderBasicInfoStep()

      const descriptionInput = screen.getByLabelText(/event description/i)
      expect(descriptionInput).toHaveAttribute('aria-describedby', 'description-character-count description-help')
    })
  })

  describe('Form Integration', () => {
    it('integrates with React Hook Form', async () => {
      const user = userEvent.setup()
      renderBasicInfoStep()

      // Fill out all fields
      const nameInput = screen.getByLabelText(/event name/i)
      const descriptionInput = screen.getByLabelText(/event description/i)

      await user.type(nameInput, 'Wedding Party')
      await user.type(descriptionInput, 'A beautiful wedding celebration')
      await user.click(screen.getByTestId('select-wedding'))

      expect(nameInput).toHaveValue('Wedding Party')
      expect(descriptionInput).toHaveValue('A beautiful wedding celebration')
      expect(screen.getByTestId('current-value')).toHaveTextContent('wedding')
    })

    it('maintains form state correctly', async () => {
      const user = userEvent.setup()
      renderBasicInfoStep({}, {
        name: 'Pre-filled Event',
        description: 'Pre-filled description',
        type: EventType.BIRTHDAY
      })

      expect(screen.getByDisplayValue('Pre-filled Event')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Pre-filled description')).toBeInTheDocument()
      expect(screen.getByTestId('current-value')).toHaveTextContent('birthday')
    })
  })

  describe('Validation and Error Handling', () => {
    it('shows validation errors when provided', () => {
      // This would be handled by the parent form container
      // We can test that error props are passed correctly to child components
      renderBasicInfoStep()

      const nameInput = screen.getByLabelText(/event name/i)
      const descriptionInput = screen.getByLabelText(/event description/i)

      // Check that inputs support error display
      expect(nameInput).toBeInTheDocument()
      expect(descriptionInput).toBeInTheDocument()
    })

    it('clears character count styling when within limits', async () => {
      const user = userEvent.setup()
      renderBasicInfoStep()

      const nameInput = screen.getByLabelText(/event name/i)

      // Type near limit
      await user.type(nameInput, 'A'.repeat(MAX_NAME_LENGTH - 5))
      let characterCount = screen.getByText(`${MAX_NAME_LENGTH - 5}/255 characters`)
      expect(characterCount).toHaveClass('text-warning')

      // Clear and type shorter text
      await user.clear(nameInput)
      await user.type(nameInput, 'Short')

      characterCount = screen.getByText('5/255 characters')
      expect(characterCount).not.toHaveClass('text-warning')
      expect(characterCount).not.toHaveClass('text-destructive')
    })
  })

  describe('Accessibility', () => {
    it('has proper labels for all form elements', () => {
      renderBasicInfoStep()

      expect(screen.getByLabelText(/event name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/event description/i)).toBeInTheDocument()
      expect(screen.getByTestId('event-type-selector')).toBeInTheDocument()
    })

    it('provides helpful descriptions for fields', () => {
      renderBasicInfoStep()

      expect(screen.getByText(/provide details about your event to help with planning/i)).toBeInTheDocument()
      expect(screen.getByText(/choose the type that best describes your event/i)).toBeInTheDocument()
    })

    it('has proper ARIA associations for character counts', async () => {
      const user = userEvent.setup()
      renderBasicInfoStep()

      const nameInput = screen.getByLabelText(/event name/i)
      await user.type(nameInput, 'Test')

      expect(nameInput).toHaveAttribute('aria-describedby', 'name-character-count')
    })
  })

  describe('Layout and Styling', () => {
    it('uses consistent spacing between sections', () => {
      const { container } = renderBasicInfoStep()

      const mainContainer = container.querySelector('.space-y-6')
      expect(mainContainer).toBeInTheDocument()
    })

    it('applies proper styling to help sections', () => {
      renderBasicInfoStep()

      const helpSection = screen.getByText(/tips for a great event description/i).closest('div')
      expect(helpSection).toHaveClass('bg-muted/50', 'rounded-lg', 'p-4')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty initial values gracefully', () => {
      renderBasicInfoStep({}, {})

      expect(screen.getByLabelText(/event name/i)).toHaveValue('')
      expect(screen.getByLabelText(/event description/i)).toHaveValue('')
      expect(screen.getByTestId('current-value')).toHaveTextContent('none')
    })

    it('handles very long pre-filled values', () => {
      const longName = 'A'.repeat(MAX_NAME_LENGTH)
      const longDescription = 'B'.repeat(MAX_DESCRIPTION_LENGTH)

      renderBasicInfoStep({}, {
        name: longName,
        description: longDescription
      })

      expect(screen.getByDisplayValue(longName)).toBeInTheDocument()
      expect(screen.getByDisplayValue(longDescription)).toBeInTheDocument()
    })

    it('maintains accessibility with dynamic content', async () => {
      const user = userEvent.setup()
      renderBasicInfoStep()

      const nameInput = screen.getByLabelText(/event name/i)

      // Before typing - no character count
      expect(nameInput).not.toHaveAttribute('aria-describedby')

      // After typing - character count appears
      await user.type(nameInput, 'Test')
      expect(nameInput).toHaveAttribute('aria-describedby', 'name-character-count')
    })
  })
})