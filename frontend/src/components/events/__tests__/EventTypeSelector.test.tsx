import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EventTypeSelector, EVENT_TYPE_ICONS, EVENT_TYPE_LABELS } from '../EventTypeSelector'
import { EventType } from '@/types/event.types'

const mockOnChange = jest.fn()

const renderEventTypeSelector = (props: Partial<React.ComponentProps<typeof EventTypeSelector>> = {}) => {
  const defaultProps = {
    onChange: mockOnChange,
    ...props
  }
  return render(<EventTypeSelector {...defaultProps} />)
}

describe('EventTypeSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders all event type options', () => {
      renderEventTypeSelector()

      Object.values(EventType).forEach((eventType) => {
        const label = EVENT_TYPE_LABELS[eventType]
        expect(screen.getByRole('radio', { name: `Select ${label}` })).toBeInTheDocument()
      })
    })

    it('renders with correct ARIA attributes', () => {
      renderEventTypeSelector({ 'aria-label': 'Custom label' })

      const radioGroup = screen.getByRole('radiogroup', { name: 'Custom label' })
      expect(radioGroup).toBeInTheDocument()
    })

    it('renders with default aria-label when not provided', () => {
      renderEventTypeSelector()

      const radioGroup = screen.getByRole('radiogroup', { name: 'Select event type' })
      expect(radioGroup).toBeInTheDocument()
    })

    it('displays icons for each event type', () => {
      renderEventTypeSelector()

      Object.keys(EVENT_TYPE_ICONS).forEach((eventTypeKey) => {
        const eventType = eventTypeKey as EventType
        const button = screen.getByRole('radio', { name: `Select ${EVENT_TYPE_LABELS[eventType]}` })
        const icon = button.querySelector('svg')
        expect(icon).toBeInTheDocument()
        expect(icon).toHaveAttribute('aria-hidden', 'true')
      })
    })

    it('displays correct labels for each event type', () => {
      renderEventTypeSelector()

      Object.entries(EVENT_TYPE_LABELS).forEach(([, label]) => {
        expect(screen.getByText(label)).toBeInTheDocument()
      })
    })
  })

  describe('Selection', () => {
    it('shows no selection initially when value is undefined', () => {
      renderEventTypeSelector()

      Object.values(EventType).forEach((eventType) => {
        const radio = screen.getByRole('radio', { name: `Select ${EVENT_TYPE_LABELS[eventType]}` })
        expect(radio).toHaveAttribute('aria-checked', 'false')
        expect(radio).not.toHaveClass('border-primary')
      })
    })

    it('shows correct selection when value is provided', () => {
      renderEventTypeSelector({ value: EventType.WEDDING })

      const weddingOption = screen.getByRole('radio', { name: 'Select Wedding' })
      expect(weddingOption).toHaveAttribute('aria-checked', 'true')
      expect(weddingOption).toHaveClass('border-primary')

      // Other options should not be selected
      const birthdayOption = screen.getByRole('radio', { name: 'Select Birthday' })
      expect(birthdayOption).toHaveAttribute('aria-checked', 'false')
    })

    it('displays selection indicator for selected option', () => {
      renderEventTypeSelector({ value: EventType.BIRTHDAY })

      const birthdayOption = screen.getByRole('radio', { name: 'Select Birthday' })
      const indicator = birthdayOption.querySelector('.absolute.-top-1.-right-1')
      expect(indicator).toBeInTheDocument()
      expect(indicator).toHaveClass('bg-primary')
    })
  })

  describe('Interaction', () => {
    it('calls onChange when clicking an option', async () => {
      const user = userEvent.setup()
      renderEventTypeSelector()

      const weddingOption = screen.getByRole('radio', { name: 'Select Wedding' })
      await user.click(weddingOption)

      expect(mockOnChange).toHaveBeenCalledWith(EventType.WEDDING)
      expect(mockOnChange).toHaveBeenCalledTimes(1)
    })

    it('calls onChange when pressing Enter on focused option', async () => {
      const user = userEvent.setup()
      renderEventTypeSelector()

      const birthdayOption = screen.getByRole('radio', { name: 'Select Birthday' })
      birthdayOption.focus()
      await user.keyboard('{Enter}')

      expect(mockOnChange).toHaveBeenCalledWith(EventType.BIRTHDAY)
    })

    it('calls onChange when pressing Space on focused option', async () => {
      const user = userEvent.setup()
      renderEventTypeSelector()

      const corporateOption = screen.getByRole('radio', { name: 'Select Corporate Event' })
      corporateOption.focus()
      await user.keyboard(' ')

      expect(mockOnChange).toHaveBeenCalledWith(EventType.CORPORATE)
    })

    it('does not call onChange for other key presses', async () => {
      const user = userEvent.setup()
      renderEventTypeSelector()

      const weddingOption = screen.getByRole('radio', { name: 'Select Wedding' })
      weddingOption.focus()
      await user.keyboard('{Escape}')

      expect(mockOnChange).not.toHaveBeenCalled()
    })
  })

  describe('Disabled State', () => {
    it('disables all options when disabled prop is true', () => {
      renderEventTypeSelector({ disabled: true })

      Object.values(EventType).forEach((eventType) => {
        const radio = screen.getByRole('radio', { name: `Select ${EVENT_TYPE_LABELS[eventType]}` })
        expect(radio).toBeDisabled()
        expect(radio).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
      })
    })

    it('does not call onChange when disabled and clicked', async () => {
      const user = userEvent.setup()
      renderEventTypeSelector({ disabled: true })

      const weddingOption = screen.getByRole('radio', { name: 'Select Wedding' })
      await user.click(weddingOption)

      expect(mockOnChange).not.toHaveBeenCalled()
    })
  })

  describe('Error State', () => {
    it('displays error message when provided', () => {
      const errorMessage = 'Please select an event type'
      renderEventTypeSelector({ error: errorMessage })

      const errorElement = screen.getByRole('alert')
      expect(errorElement).toBeInTheDocument()
      expect(errorElement).toHaveTextContent(errorMessage)
      expect(errorElement).toHaveAttribute('id', 'event-type-error')
    })

    it('sets aria-invalid and aria-describedby when error is present', () => {
      renderEventTypeSelector({ error: 'Error message' })

      const radioGroup = screen.getByRole('radiogroup')
      expect(radioGroup).toHaveAttribute('aria-invalid', 'true')
      expect(radioGroup).toHaveAttribute('aria-describedby', 'event-type-error')
    })

    it('applies error styling to non-selected options when error is present', () => {
      renderEventTypeSelector({ error: 'Error message' })

      const weddingOption = screen.getByRole('radio', { name: 'Select Wedding' })
      expect(weddingOption).toHaveClass('border-destructive/50')
    })

    it('does not apply error styling to selected option', () => {
      renderEventTypeSelector({
        value: EventType.WEDDING,
        error: 'Error message'
      })

      const weddingOption = screen.getByRole('radio', { name: 'Select Wedding' })
      expect(weddingOption).not.toHaveClass('border-destructive/50')
      expect(weddingOption).toHaveClass('border-primary')
    })

    it('does not display error when error prop is undefined', () => {
      renderEventTypeSelector()

      const errorElement = screen.queryByRole('alert')
      expect(errorElement).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      renderEventTypeSelector()

      const firstOption = screen.getByRole('radio', { name: 'Select Wedding' })
      firstOption.focus()

      expect(firstOption).toHaveFocus()

      await user.tab()
      const secondOption = screen.getByRole('radio', { name: 'Select Birthday' })
      expect(secondOption).toHaveFocus()
    })

    it('has proper focus indicators', () => {
      renderEventTypeSelector()

      const weddingOption = screen.getByRole('radio', { name: 'Select Wedding' })
      expect(weddingOption).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2')
    })

    it('has proper ARIA labels for each option', () => {
      renderEventTypeSelector()

      Object.entries(EVENT_TYPE_LABELS).forEach(([, label]) => {
        const option = screen.getByRole('radio', { name: `Select ${label}` })
        expect(option).toHaveAttribute('aria-label', `Select ${label}`)
      })
    })
  })

  describe('Layout and Styling', () => {
    it('applies custom className when provided', () => {
      const customClass = 'custom-test-class'
      renderEventTypeSelector({ className: customClass })

      const container = screen.getByRole('radiogroup').parentElement
      expect(container).toHaveClass(customClass)
    })

    it('uses responsive grid layout', () => {
      renderEventTypeSelector()

      const gridContainer = screen.getByRole('radiogroup')
      expect(gridContainer).toHaveClass(
        'grid',
        'grid-cols-2',
        'sm:grid-cols-3',
        'md:grid-cols-4',
        'lg:grid-cols-5'
      )
    })

    it('applies hover styles correctly', () => {
      renderEventTypeSelector()

      const weddingOption = screen.getByRole('radio', { name: 'Select Wedding' })
      expect(weddingOption).toHaveClass(
        'hover:bg-accent',
        'hover:text-accent-foreground'
      )
    })
  })

  describe('Edge Cases', () => {
    it('handles empty onChange prop gracefully', () => {
      const { container } = render(
        <EventTypeSelector onChange={() => {}} />
      )

      expect(container).toBeInTheDocument()
    })

    it('handles all event types from enum', () => {
      renderEventTypeSelector()

      // Verify we have buttons for all enum values
      const buttons = screen.getAllByRole('radio')
      expect(buttons).toHaveLength(Object.values(EventType).length)
    })

    it('maintains selection state correctly', () => {
      const { rerender } = renderEventTypeSelector({ value: EventType.WEDDING })

      let weddingOption = screen.getByRole('radio', { name: 'Select Wedding' })
      expect(weddingOption).toHaveAttribute('aria-checked', 'true')

      rerender(<EventTypeSelector value={EventType.BIRTHDAY} onChange={mockOnChange} />)

      weddingOption = screen.getByRole('radio', { name: 'Select Wedding' })
      const birthdayOption = screen.getByRole('radio', { name: 'Select Birthday' })

      expect(weddingOption).toHaveAttribute('aria-checked', 'false')
      expect(birthdayOption).toHaveAttribute('aria-checked', 'true')
    })
  })
})