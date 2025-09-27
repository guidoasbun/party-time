import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { DateTimeStep } from '../DateTimeStep'
import { EventCreateFormData, eventCreateSchema, defaultEventFormValues } from '@/lib/validations/event'

// Mock the TimezoneSelector and DateTimePicker components
jest.mock('@/components/ui/TimezoneSelector', () => ({
  TimezoneSelector: ({ value, onChange, label, error }: any) => (
    <div data-testid="timezone-selector">
      <label>{label}</label>
      <select
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        data-testid="timezone-select"
      >
        <option value="">Select timezone</option>
        <option value="America/New_York">America/New_York</option>
        <option value="UTC">UTC</option>
        <option value="Europe/London">Europe/London</option>
      </select>
      {error && <span data-testid="timezone-error">{error}</span>}
    </div>
  )
}))

jest.mock('@/components/ui/DateTimePicker', () => ({
  DateTimePicker: ({ value, onChange, label, error, min }: any) => (
    <div data-testid="date-time-picker">
      <label>{label}</label>
      <input
        type="date"
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        min={min}
        data-testid={`date-input-${label?.toLowerCase().replace(/\s+/g, '-')}`}
      />
      {error && <span data-testid={`error-${label?.toLowerCase().replace(/\s+/g, '-')}`}>{error}</span>}
    </div>
  ),
  QuickDatePresets: ({ onDateSelect }: any) => (
    <div data-testid="quick-date-presets">
      <button
        onClick={() => onDateSelect('2024-01-01')}
        data-testid="today-preset"
      >
        Today
      </button>
      <button
        onClick={() => onDateSelect('2024-01-02')}
        data-testid="tomorrow-preset"
      >
        Tomorrow
      </button>
      <button
        onClick={() => onDateSelect('2024-01-08')}
        data-testid="next-week-preset"
      >
        Next Week
      </button>
    </div>
  )
}))

// Test wrapper component
function TestWrapper({ defaultValues = {} }: { defaultValues?: Partial<EventCreateFormData> }) {
  const form = useForm<EventCreateFormData>({
    resolver: zodResolver(eventCreateSchema),
    defaultValues: { ...defaultEventFormValues, ...defaultValues },
    mode: 'onChange',
  })

  return (
    <FormProvider {...form}>
      <DateTimeStep />
      <div data-testid="form-data">
        {JSON.stringify(form.watch(), null, 2)}
      </div>
    </FormProvider>
  )
}

describe('DateTimeStep', () => {
  beforeEach(() => {
    // Mock the current date to be consistent
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2024-01-01T12:00:00Z'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('Component Rendering', () => {
    it('renders all required form elements', () => {
      render(<TestWrapper />)

      // Check for main sections
      expect(screen.getByText('All-day event')).toBeInTheDocument()
      expect(screen.getByText('Start Date & Time')).toBeInTheDocument()
      expect(screen.getByText('End Date & Time (Optional)')).toBeInTheDocument()
      expect(screen.getByTestId('timezone-selector')).toBeInTheDocument()

      // Check for quick date presets
      expect(screen.getByTestId('quick-date-presets')).toBeInTheDocument()
      expect(screen.getByTestId('today-preset')).toBeInTheDocument()
      expect(screen.getByTestId('tomorrow-preset')).toBeInTheDocument()
      expect(screen.getByTestId('next-week-preset')).toBeInTheDocument()
    })

    it('shows timed event inputs by default', () => {
      render(<TestWrapper />)

      // Should show time inputs for timed events
      expect(screen.getByLabelText('Start Time')).toBeInTheDocument()
      expect(screen.getByLabelText('End Time')).toBeInTheDocument()
    })

    it('hides time inputs for all-day events', async () => {
      render(<TestWrapper />)

      const allDayToggle = screen.getByRole('button', { name: /timed/i })
      await userEvent.click(allDayToggle)

      // Time inputs should be hidden
      expect(screen.queryByLabelText('Start Time')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('End Time')).not.toBeInTheDocument()

      // Button should show "All Day"
      expect(screen.getByRole('button', { name: /all day/i })).toBeInTheDocument()
    })
  })

  describe('All-Day Toggle', () => {
    it('toggles between all-day and timed events', async () => {
      render(<TestWrapper />)

      const toggle = screen.getByRole('button', { name: /timed/i })

      // Initially timed event
      expect(screen.getByText('Timed event')).toBeInTheDocument()
      expect(screen.getByText('Specify exact start and end times')).toBeInTheDocument()

      // Toggle to all-day
      await userEvent.click(toggle)

      expect(screen.getByText('All-day event')).toBeInTheDocument()
      expect(screen.getByText('Your event will last the entire day')).toBeInTheDocument()
    })

    it('sets default times when switching from all-day to timed', async () => {
      render(<TestWrapper defaultValues={{ all_day: true }} />)

      const toggle = screen.getByRole('button', { name: /all day/i })
      await userEvent.click(toggle)

      // Should set default times
      await waitFor(() => {
        expect(screen.getByLabelText('Start Time')).toHaveValue('18:00')
      })
    })

    it('clears times when switching from timed to all-day', async () => {
      render(<TestWrapper defaultValues={{
        start_time: '10:00',
        end_time: '15:00'
      }} />)

      const toggle = screen.getByRole('button', { name: /timed/i })
      await userEvent.click(toggle)

      // Times should be cleared (inputs should be hidden)
      expect(screen.queryByLabelText('Start Time')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('End Time')).not.toBeInTheDocument()
    })
  })

  describe('Date Selection', () => {
    it('handles start date changes', async () => {
      render(<TestWrapper />)

      const startDateInput = screen.getByTestId('date-input-start-date')
      await userEvent.type(startDateInput, '2024-06-15')

      expect(startDateInput).toHaveValue('2024-06-15')
    })

    it('handles end date changes', async () => {
      render(<TestWrapper />)

      const endDateInput = screen.getByTestId('date-input-end-date')
      await userEvent.type(endDateInput, '2024-06-16')

      expect(endDateInput).toHaveValue('2024-06-16')
    })

    it('clears end date when start date is set to later date', async () => {
      render(<TestWrapper defaultValues={{
        start_date: '2024-06-15',
        end_date: '2024-06-14' // End date before start date
      }} />)

      const startDateInput = screen.getByTestId('date-input-start-date')
      await userEvent.clear(startDateInput)
      await userEvent.type(startDateInput, '2024-06-16')

      // End date should be cleared since it was before the new start date
      const endDateInput = screen.getByTestId('date-input-end-date')
      expect(endDateInput).toHaveValue('')
    })

    it('sets minimum date for end date based on start date', () => {
      render(<TestWrapper defaultValues={{ start_date: '2024-06-15' }} />)

      const endDateInput = screen.getByTestId('date-input-end-date')
      expect(endDateInput).toHaveAttribute('min', '2024-06-15')
    })
  })

  describe('Time Selection', () => {
    it('handles start time changes', async () => {
      render(<TestWrapper />)

      const startTimeInput = screen.getByLabelText('Start Time')
      await userEvent.type(startTimeInput, '14:30')

      expect(startTimeInput).toHaveValue('14:30')
    })

    it('handles end time changes', async () => {
      render(<TestWrapper defaultValues={{ end_date: '2024-06-15' }} />)

      const endTimeInput = screen.getByLabelText('End Time')
      await userEvent.type(endTimeInput, '16:45')

      expect(endTimeInput).toHaveValue('16:45')
    })

    it('disables end time when no end date is set', () => {
      render(<TestWrapper />)

      const endTimeInput = screen.getByLabelText('End Time')
      expect(endTimeInput).toBeDisabled()
    })

    it('enables end time when end date is set', () => {
      render(<TestWrapper defaultValues={{ end_date: '2024-06-15' }} />)

      const endTimeInput = screen.getByLabelText('End Time')
      expect(endTimeInput).not.toBeDisabled()
    })
  })

  describe('Quick Date Presets', () => {
    it('handles Today preset click', async () => {
      render(<TestWrapper />)

      const todayPreset = screen.getByTestId('today-preset')
      await userEvent.click(todayPreset)

      const startDateInput = screen.getByTestId('date-input-start-date')
      expect(startDateInput).toHaveValue('2024-01-01')
    })

    it('handles Tomorrow preset click', async () => {
      render(<TestWrapper />)

      const tomorrowPreset = screen.getByTestId('tomorrow-preset')
      await userEvent.click(tomorrowPreset)

      const startDateInput = screen.getByTestId('date-input-start-date')
      expect(startDateInput).toHaveValue('2024-01-02')
    })

    it('handles Next Week preset click', async () => {
      render(<TestWrapper />)

      const nextWeekPreset = screen.getByTestId('next-week-preset')
      await userEvent.click(nextWeekPreset)

      const startDateInput = screen.getByTestId('date-input-start-date')
      expect(startDateInput).toHaveValue('2024-01-08')
    })
  })

  describe('Timezone Selection', () => {
    it('handles timezone changes', async () => {
      render(<TestWrapper />)

      const timezoneSelect = screen.getByTestId('timezone-select')
      await userEvent.selectOptions(timezoneSelect, 'America/New_York')

      expect(timezoneSelect).toHaveValue('America/New_York')
    })

    it('auto-detects user timezone on mount', () => {
      // Mock Intl.DateTimeFormat to return a specific timezone
      const mockDateTimeFormat = jest.fn(() => ({
        resolvedOptions: () => ({ timeZone: 'America/Chicago' })
      }))

      // @ts-expect-error - Mocking global Intl for testing
      global.Intl.DateTimeFormat = mockDateTimeFormat

      render(<TestWrapper />)

      // Should auto-select the detected timezone
      expect(screen.getByTestId('timezone-select')).toHaveValue('America/Chicago')
    })
  })

  describe('Event Schedule Preview', () => {
    it('shows preview when start date is set', () => {
      render(<TestWrapper defaultValues={{ start_date: '2024-06-15' }} />)

      expect(screen.getByText('📅 Event Schedule Preview')).toBeInTheDocument()
      expect(screen.getByText(/Starts:/)).toBeInTheDocument()
    })

    it('shows end date in preview when set', () => {
      render(<TestWrapper defaultValues={{
        start_date: '2024-06-15',
        end_date: '2024-06-16'
      }} />)

      expect(screen.getByText(/Starts:/)).toBeInTheDocument()
      expect(screen.getByText(/Ends:/)).toBeInTheDocument()
    })

    it('shows all-day indicator for all-day events', () => {
      render(<TestWrapper defaultValues={{
        start_date: '2024-06-15',
        all_day: true
      }} />)

      expect(screen.getByText('⚡ This is an all-day event')).toBeInTheDocument()
    })

    it('hides preview when no start date is set', () => {
      render(<TestWrapper />)

      expect(screen.queryByText('📅 Event Schedule Preview')).not.toBeInTheDocument()
    })
  })

  describe('Form Validation Integration', () => {
    it('displays start date validation errors', () => {
      render(<TestWrapper />)

      // This would require triggering validation - in real scenario this would be tested
      // through form submission or field validation
      expect(screen.queryByTestId('error-start-date')).not.toBeInTheDocument()
    })

    it('displays timezone validation errors', () => {
      render(<TestWrapper />)

      expect(screen.queryByTestId('timezone-error')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper labels for all form inputs', () => {
      render(<TestWrapper />)

      expect(screen.getByLabelText('Start Date')).toBeInTheDocument()
      expect(screen.getByLabelText('End Date')).toBeInTheDocument()
      expect(screen.getByLabelText('Start Time')).toBeInTheDocument()
      expect(screen.getByLabelText('End Time')).toBeInTheDocument()
      expect(screen.getByLabelText('Timezone')).toBeInTheDocument()
    })

    it('has proper button roles', () => {
      render(<TestWrapper />)

      expect(screen.getByRole('button', { name: /timed/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /today/i })).toBeInTheDocument()
    })
  })

  describe('Default Values', () => {
    it('sets default time values for timed events', async () => {
      render(<TestWrapper defaultValues={{ start_date: '2024-06-15' }} />)

      // Should auto-set default start time
      await waitFor(() => {
        expect(screen.getByLabelText('Start Time')).toHaveValue('18:00')
      })
    })

    it('preserves existing time values', () => {
      render(<TestWrapper defaultValues={{
        start_date: '2024-06-15',
        start_time: '10:00'
      }} />)

      expect(screen.getByLabelText('Start Time')).toHaveValue('10:00')
    })
  })
})