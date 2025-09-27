import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  DateTimePicker,
  DateTimeRangePicker,
  QuickDatePresets,
  getEventDatePresets
} from '../DateTimePicker'

// Mock the Input component
jest.mock('../Input', () => ({
  Input: ({ type, value, onChange, label, error, disabled, min, max, leftIcon, ...props }: {
    type: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    label?: string
    error?: string
    disabled?: boolean
    min?: string
    max?: string
    leftIcon?: React.ReactNode
  }) => (
    <div data-testid="input-container">
      {label && <label>{label}</label>}
      <div className="input-wrapper">
        {leftIcon && <span data-testid="input-icon">{leftIcon}</span>}
        <input
          type={type}
          value={value || ''}
          onChange={onChange}
          disabled={disabled}
          min={min}
          max={max}
          data-testid={`input-${type}`}
          {...props}
        />
      </div>
      {error && <span data-testid="input-error">{error}</span>}
    </div>
  )
}))

// Mock the Button component
jest.mock('../Button', () => ({
  Button: ({ children, onClick, disabled, variant, size, ...props }: {
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
    variant?: string
    size?: string
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid="button"
      data-variant={variant}
      data-size={size}
      {...props}
    >
      {children}
    </button>
  )
}))

describe('DateTimePicker', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2024-01-01T12:00:00Z'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('Basic Functionality', () => {
    it('renders date-only picker by default', () => {
      render(<DateTimePicker />)

      expect(screen.getByTestId('input-date')).toBeInTheDocument()
      expect(screen.queryByTestId('input-time')).not.toBeInTheDocument()
    })

    it('renders both date and time pickers when includeTime is true', () => {
      render(<DateTimePicker includeTime />)

      expect(screen.getByTestId('input-date')).toBeInTheDocument()
      expect(screen.getByTestId('input-time')).toBeInTheDocument()
    })

    it('displays label when provided', () => {
      render(<DateTimePicker label="Event Date" />)

      expect(screen.getByText('Event Date')).toBeInTheDocument()
    })

    it('displays error message when provided', () => {
      render(<DateTimePicker error="Date is required" />)

      expect(screen.getByText('Date is required')).toBeInTheDocument()
    })

    it('shows clear button when allowClear is true and has value', () => {
      render(<DateTimePicker value="2024-01-15" allowClear label="Test Date" />)

      expect(screen.getByText('Clear')).toBeInTheDocument()
    })

    it('hides clear button when no value', () => {
      render(<DateTimePicker allowClear />)

      expect(screen.queryByText('Clear')).not.toBeInTheDocument()
    })
  })

  describe('Date-only Mode', () => {
    it('renders date input correctly', () => {
      render(<DateTimePicker />)

      const dateInput = screen.getByTestId('input-date')
      expect(dateInput).toHaveAttribute('type', 'date')
    })

    it('passes min and max props to date input', () => {
      render(<DateTimePicker min="2024-01-01" max="2024-12-31" />)

      const dateInput = screen.getByTestId('input-date')
      expect(dateInput).toHaveAttribute('min', '2024-01-01')
      expect(dateInput).toHaveAttribute('max', '2024-12-31')
    })

    it('parses date-only value correctly', () => {
      render(<DateTimePicker value="2024-06-15" />)

      const dateInput = screen.getByTestId('input-date')
      expect(dateInput).toHaveValue('2024-06-15')
    })
  })

  describe('Date and Time Mode', () => {
    it('parses datetime value correctly', () => {
      render(<DateTimePicker value="2024-06-15T14:30" includeTime />)

      const dateInput = screen.getByTestId('input-date')
      const timeInput = screen.getByTestId('input-time')

      expect(dateInput).toHaveValue('2024-06-15')
      expect(timeInput).toHaveValue('14:30')
    })

    it('renders both date and time inputs correctly', () => {
      render(<DateTimePicker includeTime />)

      const dateInput = screen.getByTestId('input-date')
      const timeInput = screen.getByTestId('input-time')

      expect(dateInput).toHaveAttribute('type', 'date')
      expect(timeInput).toHaveAttribute('type', 'time')
    })

    it('shows default time placeholder', () => {
      render(<DateTimePicker includeTime />)

      const timeInput = screen.getByTestId('input-time')
      expect(timeInput).toBeInTheDocument()
    })

    it('disables time input when no date is selected', () => {
      render(<DateTimePicker includeTime />)

      const timeInput = screen.getByTestId('input-time')
      expect(timeInput).toBeDisabled()
    })

    it('enables time input when date is selected', () => {
      render(<DateTimePicker value="2024-06-15" includeTime />)

      const timeInput = screen.getByTestId('input-time')
      expect(timeInput).not.toBeDisabled()
    })

    it('uses custom labels for date and time', () => {
      render(
        <DateTimePicker
          includeTime
          dateLabel="Start Date"
          timeLabel="Start Time"
        />
      )

      expect(screen.getByText('Start Date')).toBeInTheDocument()
      expect(screen.getByText('Start Time')).toBeInTheDocument()
    })
  })

  describe('Clear Functionality', () => {
    it('shows clear button for datetime values', () => {
      render(
        <DateTimePicker
          value="2024-06-15T14:30"
          allowClear
          includeTime
          label="Event Date"
        />
      )

      expect(screen.getByText('Clear')).toBeInTheDocument()
    })
  })

  describe('Disabled State', () => {
    it('disables all inputs when disabled prop is true', () => {
      render(<DateTimePicker includeTime disabled />)

      expect(screen.getByTestId('input-date')).toBeDisabled()
      expect(screen.getByTestId('input-time')).toBeDisabled()
    })

    it('hides clear button when disabled', () => {
      render(<DateTimePicker value="2024-06-15" allowClear disabled />)

      expect(screen.queryByText('Clear')).not.toBeInTheDocument()
    })
  })
})

describe('DateTimeRangePicker', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2024-01-01T12:00:00Z'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('Basic Functionality', () => {
    it('renders two DateTimePicker components', () => {
      render(<DateTimeRangePicker />)

      // Should have two date inputs (start and end)
      const dateInputs = screen.getAllByTestId('input-date')
      expect(dateInputs).toHaveLength(2)
    })

    it('displays label when provided', () => {
      render(<DateTimeRangePicker label="Event Duration" />)

      expect(screen.getByText('Event Duration')).toBeInTheDocument()
    })

    it('shows clear button when allowClear is true and has values', () => {
      render(
        <DateTimeRangePicker
          startValue="2024-01-15"
          endValue="2024-01-16"
          allowClear
          label="Event Duration"
        />
      )

      expect(screen.getByText('Clear Range')).toBeInTheDocument()
    })

    it('renders start and end date inputs', () => {
      render(<DateTimeRangePicker />)

      const dateInputs = screen.getAllByTestId('input-date')
      expect(dateInputs).toHaveLength(2)
      expect(dateInputs[0]).toHaveAttribute('type', 'date')
      expect(dateInputs[1]).toHaveAttribute('type', 'date')
    })
  })

  describe('Date Range Validation', () => {
    it('sets min end date based on start date', () => {
      render(
        <DateTimeRangePicker
          startValue="2024-06-15"
          min="2024-01-01"
        />
      )

      const dateInputs = screen.getAllByTestId('input-date')
      const endInput = dateInputs[1]

      expect(endInput).toHaveAttribute('min', '2024-06-15')
    })

    it('sets max start date based on end date', () => {
      render(
        <DateTimeRangePicker
          endValue="2024-06-20"
          max="2024-12-31"
        />
      )

      const dateInputs = screen.getAllByTestId('input-date')
      const startInput = dateInputs[0]

      expect(startInput).toHaveAttribute('max', '2024-06-20')
    })

    it('handles datetime values for min/max calculation', () => {
      render(
        <DateTimeRangePicker
          startValue="2024-06-15T10:00"
          includeTime
        />
      )

      const dateInputs = screen.getAllByTestId('input-date')
      const endInput = dateInputs[1]

      expect(endInput).toHaveAttribute('min', '2024-06-15')
    })
  })

  describe('Clear Range Functionality', () => {
    it('shows clear range button when values exist', () => {
      render(
        <DateTimeRangePicker
          startValue="2024-06-15"
          endValue="2024-06-16"
          allowClear
          label="Event Period"
        />
      )

      expect(screen.getByText('Clear Range')).toBeInTheDocument()
    })
  })

  describe('Time Mode', () => {
    it('renders time inputs when includeTime is true', () => {
      render(<DateTimeRangePicker includeTime />)

      const timeInputs = screen.getAllByTestId('input-time')
      expect(timeInputs).toHaveLength(2)
    })

    it('uses custom labels for date and time in time mode', () => {
      render(<DateTimeRangePicker includeTime />)

      expect(screen.getByText('Start Date')).toBeInTheDocument()
      expect(screen.getByText('Start Time')).toBeInTheDocument()
      expect(screen.getByText('End Date')).toBeInTheDocument()
      expect(screen.getByText('End Time')).toBeInTheDocument()
    })
  })
})

describe('QuickDatePresets', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2024-01-01T12:00:00Z'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders preset buttons', () => {
    render(<QuickDatePresets onDateSelect={jest.fn()} />)

    expect(screen.getByText('Quick Dates:')).toBeInTheDocument()
    expect(screen.getByText('Today')).toBeInTheDocument()
    expect(screen.getByText('Tomorrow')).toBeInTheDocument()
    expect(screen.getByText('Next Week')).toBeInTheDocument()
    expect(screen.getByText('Next Month')).toBeInTheDocument()
  })

  it('shows clickable preset buttons', () => {
    const handleDateSelect = jest.fn()
    render(<QuickDatePresets onDateSelect={handleDateSelect} />)

    const todayButton = screen.getByText('Today')
    expect(todayButton).toBeInTheDocument()
    expect(todayButton.tagName).toBe('BUTTON')
  })

  it('disables buttons when disabled prop is true', () => {
    render(<QuickDatePresets onDateSelect={jest.fn()} disabled />)

    const buttons = screen.getAllByTestId('button')
    buttons.forEach(button => {
      expect(button).toBeDisabled()
    })
  })
})

describe('getEventDatePresets', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2024-01-01T12:00:00Z'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('returns correct preset values for current date', () => {
    const presets = getEventDatePresets()

    expect(presets).toHaveLength(4)
    expect(presets[0]).toEqual({
      label: 'Today',
      value: '2024-01-01',
      getValue: expect.any(Function)
    })
    expect(presets[1]).toEqual({
      label: 'Tomorrow',
      value: '2024-01-02',
      getValue: expect.any(Function)
    })
    expect(presets[2]).toEqual({
      label: 'Next Week',
      value: '2024-01-08',
      getValue: expect.any(Function)
    })
  })

  it('getValue functions return correct dates', () => {
    const presets = getEventDatePresets()

    expect(presets[0].getValue()).toBe('2024-01-01') // Today
    expect(presets[1].getValue()).toBe('2024-01-02') // Tomorrow
    expect(presets[2].getValue()).toBe('2024-01-08') // Next Week
  })

  it('handles month boundaries correctly', () => {
    // Test at end of month
    jest.setSystemTime(new Date('2024-01-31T12:00:00Z'))

    const presets = getEventDatePresets()
    const nextMonthPreset = presets.find(p => p.label === 'Next Month')

    expect(nextMonthPreset?.getValue()).toBe('2024-02-29') // February 2024 (leap year)
  })
})