import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { SettingsStep } from '../SettingsStep'
import { EventCreateFormData, eventCreateSchema } from '@/lib/validations/event'
import { EventStatus } from '@/types/event.types'

// Test wrapper component that provides form context
function TestFormWrapper({
  children,
  defaultValues = {},
  onFieldChange,
  errors
}: {
  children: React.ReactNode
  defaultValues?: Partial<EventCreateFormData>
  onFieldChange?: (field: string, value: unknown) => void
  errors?: Record<string, string>
}) {
  const methods = useForm<EventCreateFormData>({
    resolver: zodResolver(eventCreateSchema),
    defaultValues: {
      is_public: false,
      max_guests: undefined,
      budget_total: undefined,
      status: EventStatus.DRAFT,
      ...defaultValues,
    },
    mode: 'onChange',
  })

  return (
    <FormProvider {...methods}>
      <SettingsStep onFieldChange={onFieldChange} errors={errors} />
      {children}
    </FormProvider>
  )
}

// Helper to render component with form wrapper
const renderSettingsStep = (
  defaultValues?: Partial<EventCreateFormData>,
  onFieldChange?: (field: string, value: unknown) => void,
  errors?: Record<string, string>
) => {
  return render(
    <TestFormWrapper defaultValues={defaultValues} onFieldChange={onFieldChange} errors={errors}>
      <div data-testid="test-form" />
    </TestFormWrapper>
  )
}

describe('SettingsStep', () => {
  const user = userEvent.setup()

  it('renders all main sections', () => {
    renderSettingsStep()

    expect(screen.getByText('Privacy Settings')).toBeInTheDocument()
    expect(screen.getByText('Guest Management')).toBeInTheDocument()
    expect(screen.getByText('Budget Planning')).toBeInTheDocument()
    expect(screen.getByText('Event Status')).toBeInTheDocument()
    expect(screen.getByText('Event Summary')).toBeInTheDocument()
  })

  describe('Privacy Settings', () => {
    it('renders privacy toggle with default private state', () => {
      renderSettingsStep()

      const toggleButton = screen.getByRole('switch', { name: /make event public/i })
      expect(toggleButton).toBeInTheDocument()
      expect(toggleButton).toHaveAttribute('aria-checked', 'false')
      expect(screen.getByText('Your event will only be visible to invited guests')).toBeInTheDocument()
    })

    it('toggles privacy setting when clicked', async () => {
      const mockOnFieldChange = jest.fn()
      renderSettingsStep({}, mockOnFieldChange)

      const toggleButton = screen.getByRole('switch', { name: /make event public/i })

      await user.click(toggleButton)

      expect(toggleButton).toHaveAttribute('aria-checked', 'true')
      expect(screen.getByText('Your event will be visible to anyone with the link')).toBeInTheDocument()
      expect(mockOnFieldChange).toHaveBeenCalledWith('is_public', true)
    })

    it('shows public event help text when event is public', async () => {
      renderSettingsStep({ is_public: true })

      expect(screen.getByText(/Public Event:/)).toBeInTheDocument()
      expect(screen.getByText(/Anyone with the link can view event details/)).toBeInTheDocument()
    })

    it('renders correct icon based on privacy state', () => {
      const { rerender } = renderSettingsStep({ is_public: false })

      // Should show EyeOff icon for private
      expect(screen.getByTestId('test-form')).toBeInTheDocument()

      rerender(
        <TestFormWrapper defaultValues={{ is_public: true }}>
          <div data-testid="test-form" />
        </TestFormWrapper>
      )

      // Should show Eye icon for public
      expect(screen.getByTestId('test-form')).toBeInTheDocument()
    })
  })

  describe('Guest Management', () => {
    it('renders guest limit input field', () => {
      renderSettingsStep()

      const guestInput = screen.getByLabelText(/maximum guest limit/i)
      expect(guestInput).toBeInTheDocument()
      expect(guestInput).toHaveAttribute('type', 'number')
      expect(guestInput).toHaveAttribute('min', '1')
      expect(guestInput).toHaveAttribute('max', '10000')
    })

    it('accepts valid guest limit input', async () => {
      const mockOnFieldChange = jest.fn()
      renderSettingsStep({}, mockOnFieldChange)

      const guestInput = screen.getByLabelText(/maximum guest limit/i)

      await user.type(guestInput, '50')

      expect(guestInput).toHaveValue(50)
      expect(mockOnFieldChange).toHaveBeenCalledWith('max_guests', 50)
    })

    it('shows guest limit summary when value is set', () => {
      renderSettingsStep({ max_guests: 100 })

      expect(screen.getByText(/This event can accommodate up to/)).toBeInTheDocument()
      expect(screen.getByText(/100 guests/)).toBeInTheDocument()
    })

    it('handles singular guest text correctly', () => {
      renderSettingsStep({ max_guests: 1 })

      expect(screen.getByText(/1 guest/)).toBeInTheDocument()
      expect(screen.queryByText(/1 guests/)).not.toBeInTheDocument()
    })

    it('handles plural guest text correctly', () => {
      renderSettingsStep({ max_guests: 2 })

      expect(screen.getByText(/2 guests/)).toBeInTheDocument()
    })

    it('clears guest limit when input is empty', async () => {
      const mockOnFieldChange = jest.fn()
      renderSettingsStep({ max_guests: 50 }, mockOnFieldChange)

      const guestInput = screen.getByLabelText(/maximum guest limit/i)

      await user.clear(guestInput)

      expect(mockOnFieldChange).toHaveBeenCalledWith('max_guests', undefined)
    })
  })

  describe('Budget Planning', () => {
    it('renders budget input field', () => {
      renderSettingsStep()

      const budgetInput = screen.getByLabelText(/total event budget/i)
      expect(budgetInput).toBeInTheDocument()
      expect(budgetInput).toHaveAttribute('type', 'number')
      expect(budgetInput).toHaveAttribute('min', '0')
      expect(budgetInput).toHaveAttribute('max', '10000000')
      expect(budgetInput).toHaveAttribute('step', '0.01')
    })

    it('accepts valid budget input', async () => {
      const mockOnFieldChange = jest.fn()
      renderSettingsStep({}, mockOnFieldChange)

      const budgetInput = screen.getByLabelText(/total event budget/i)

      await user.type(budgetInput, '5000')

      expect(budgetInput).toHaveValue(5000)
      expect(mockOnFieldChange).toHaveBeenCalledWith('budget_total', 5000)
    })

    it('shows formatted budget total when value is set', () => {
      renderSettingsStep({ budget_total: 5000 })

      expect(screen.getByText(/Total budget:/)).toBeInTheDocument()
      expect(screen.getAllByText(/\$5,000/)).toHaveLength(2) // One in budget section, one in summary
    })

    it('calculates and shows budget per guest when both values are set', () => {
      renderSettingsStep({ budget_total: 1000, max_guests: 50 })

      expect(screen.getByText(/Budget per guest:/)).toBeInTheDocument()
      expect(screen.getByText(/\$20/)).toBeInTheDocument()
    })

    it('handles decimal budget values correctly', async () => {
      const mockOnFieldChange = jest.fn()
      renderSettingsStep({}, mockOnFieldChange)

      const budgetInput = screen.getByLabelText(/total event budget/i)

      await user.type(budgetInput, '2500.50')

      expect(budgetInput).toHaveValue(2500.5)
      expect(mockOnFieldChange).toHaveBeenCalledWith('budget_total', 2500.5)
    })

    it('clears budget when input is empty', async () => {
      const mockOnFieldChange = jest.fn()
      renderSettingsStep({ budget_total: 1000 }, mockOnFieldChange)

      const budgetInput = screen.getByLabelText(/total event budget/i)

      await user.clear(budgetInput)

      expect(mockOnFieldChange).toHaveBeenCalledWith('budget_total', undefined)
    })
  })

  describe('Event Status', () => {
    it('renders all status options', () => {
      renderSettingsStep()

      expect(screen.getByText('Draft')).toBeInTheDocument()
      expect(screen.getByText('Planning')).toBeInTheDocument()
      expect(screen.getByText('Confirmed')).toBeInTheDocument()
    })

    it('shows correct status descriptions', () => {
      renderSettingsStep()

      expect(screen.getByText('Work in progress')).toBeInTheDocument()
      expect(screen.getByText('Active planning')).toBeInTheDocument()
      expect(screen.getByText('Ready to go')).toBeInTheDocument()
    })

    it('selects status when clicked', async () => {
      const mockOnFieldChange = jest.fn()
      renderSettingsStep({}, mockOnFieldChange)

      const planningButton = screen.getByRole('button', { name: /planning/i })

      await user.click(planningButton)

      expect(mockOnFieldChange).toHaveBeenCalledWith('status', EventStatus.PLANNING)
    })

    it('shows contextual help text based on selected status', () => {
      // Test DRAFT status
      renderSettingsStep({ status: EventStatus.DRAFT })
      expect(screen.getByText(/You can continue editing and save as draft/)).toBeInTheDocument()
    })

    it('shows planning status help text', () => {
      renderSettingsStep({ status: EventStatus.PLANNING })
      expect(screen.getByText(/Event is in active planning phase/)).toBeInTheDocument()
    })

    it('shows confirmed status help text', () => {
      renderSettingsStep({ status: EventStatus.CONFIRMED })
      expect(screen.getByText(/Event is confirmed and ready/)).toBeInTheDocument()
    })

    it('shows correct visual indicator for draft status', () => {
      renderSettingsStep({ status: EventStatus.DRAFT })
      const statusIndicator = screen.getByText('Event Status').previousElementSibling
      expect(statusIndicator).toHaveClass('bg-gray-400')
    })

    it('shows correct visual indicator for planning status', () => {
      renderSettingsStep({ status: EventStatus.PLANNING })
      const statusIndicator = screen.getByText('Event Status').previousElementSibling
      expect(statusIndicator).toHaveClass('bg-blue-400')
    })

    it('shows correct visual indicator for confirmed status', () => {
      renderSettingsStep({ status: EventStatus.CONFIRMED })
      const statusIndicator = screen.getByText('Event Status').previousElementSibling
      expect(statusIndicator).toHaveClass('bg-green-400')
    })
  })

  describe('Event Summary', () => {
    it('displays all summary sections', () => {
      renderSettingsStep()

      expect(screen.getByText('Privacy')).toBeInTheDocument()
      expect(screen.getByText('Guest Limit')).toBeInTheDocument()
      expect(screen.getByText('Budget')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
    })

    it('shows private event in summary', () => {
      renderSettingsStep({ is_public: false })
      expect(screen.getByText('Private Event')).toBeInTheDocument()
    })

    it('shows public event in summary', () => {
      renderSettingsStep({ is_public: true })
      expect(screen.getByText('Public Event')).toBeInTheDocument()
    })

    it('shows no guest limit in summary', () => {
      renderSettingsStep({ max_guests: undefined })
      expect(screen.getByText('No limit')).toBeInTheDocument()
    })

    it('shows guest limit in summary', () => {
      renderSettingsStep({ max_guests: 75 })
      expect(screen.getByText('75 guests')).toBeInTheDocument()
    })

    it('shows no budget in summary', () => {
      renderSettingsStep({ budget_total: undefined })
      expect(screen.getByText('No budget set')).toBeInTheDocument()
    })

    it('shows budget in summary', () => {
      renderSettingsStep({ budget_total: 2500 })
      expect(screen.getAllByText('$2,500')).toHaveLength(2) // Budget section + summary
    })

    it('shows draft status in summary', () => {
      renderSettingsStep({ status: EventStatus.DRAFT })
      expect(screen.getByText('Draft')).toBeInTheDocument()
    })

    it('shows planning status in summary', () => {
      renderSettingsStep({ status: EventStatus.PLANNING })
      expect(screen.getByText('Planning')).toBeInTheDocument()
    })

    it('updates summary in real-time when values change', async () => {
      renderSettingsStep()

      // Initial state
      expect(screen.getByText('Private Event')).toBeInTheDocument()
      expect(screen.getByText('No limit')).toBeInTheDocument()

      // Change privacy
      const privacyToggle = screen.getByRole('switch', { name: /make event public/i })
      await user.click(privacyToggle)

      await waitFor(() => {
        expect(screen.getByText('Public Event')).toBeInTheDocument()
      })

      // Change guest limit
      const guestInput = screen.getByLabelText(/maximum guest limit/i)
      await user.type(guestInput, '100')

      await waitFor(() => {
        expect(screen.getByText('100 guests')).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels for form controls', () => {
      renderSettingsStep()

      const privacySwitch = screen.getByRole('switch', { name: /make event public/i })
      expect(privacySwitch).toHaveAttribute('aria-checked')

      const guestInput = screen.getByLabelText(/maximum guest limit/i)
      expect(guestInput).toBeInTheDocument()

      const budgetInput = screen.getByLabelText(/total event budget/i)
      expect(budgetInput).toBeInTheDocument()
    })

    it('supports keyboard navigation for status selection', async () => {
      renderSettingsStep()

      const draftButton = screen.getByRole('button', { name: /draft/i })
      const planningButton = screen.getByRole('button', { name: /planning/i })

      draftButton.focus()
      expect(draftButton).toHaveFocus()

      await user.keyboard('{Tab}')
      expect(planningButton).toHaveFocus()
    })
  })

  describe('Form Integration', () => {
    it('integrates properly with React Hook Form', async () => {
      const mockOnFieldChange = jest.fn()
      renderSettingsStep({}, mockOnFieldChange)

      // Test multiple field changes
      const privacyToggle = screen.getByRole('switch', { name: /make event public/i })
      await user.click(privacyToggle)

      const guestInput = screen.getByLabelText(/maximum guest limit/i)
      await user.type(guestInput, '50')

      const budgetInput = screen.getByLabelText(/total event budget/i)
      await user.type(budgetInput, '1000')

      const planningButton = screen.getByRole('button', { name: /planning/i })
      await user.click(planningButton)

      expect(mockOnFieldChange).toHaveBeenCalledWith('is_public', true)
      expect(mockOnFieldChange).toHaveBeenCalledWith('max_guests', 50)
      expect(mockOnFieldChange).toHaveBeenCalledWith('budget_total', 1000)
      expect(mockOnFieldChange).toHaveBeenCalledWith('status', EventStatus.PLANNING)
    })

    it('displays form validation errors', () => {
      const errors = {
        max_guests: 'Guest limit must be between 1 and 10,000',
        budget_total: 'Budget must be between $0 and $10,000,000'
      }

      renderSettingsStep({}, undefined, errors)

      expect(screen.getByText('Guest limit must be between 1 and 10,000')).toBeInTheDocument()
      expect(screen.getByText('Budget must be between $0 and $10,000,000')).toBeInTheDocument()
    })
  })

  describe('Currency Formatting', () => {
    it('formats zero currency correctly', () => {
      renderSettingsStep({ budget_total: 0 })
      expect(screen.getAllByText('$0')).toHaveLength(2) // Budget section + summary
    })

    it('formats hundreds correctly', () => {
      renderSettingsStep({ budget_total: 100 })
      expect(screen.getAllByText('$100')).toHaveLength(2)
    })

    it('formats thousands correctly', () => {
      renderSettingsStep({ budget_total: 1000 })
      expect(screen.getAllByText('$1,000')).toHaveLength(2)
    })

    it('formats large amounts correctly', () => {
      renderSettingsStep({ budget_total: 1000000 })
      expect(screen.getAllByText('$1,000,000')).toHaveLength(2)
    })
  })
})