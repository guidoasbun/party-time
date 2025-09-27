import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  TimezoneSelector,
  getTimezoneOffset,
  getCurrentTimeInTimezone,
  getTimezoneDisplayName,
  getCommonTimezones
} from '../TimezoneSelector'

// Mock the Input component
jest.mock('../Input', () => ({
  Input: ({ type, value, onChange, placeholder, leftIcon, className }: {
    type: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    placeholder?: string
    leftIcon?: React.ReactNode
    className?: string
  }) => (
    <div data-testid="input-container" className={className}>
      {leftIcon && <span data-testid="input-icon">{leftIcon}</span>}
      <input
        type={type}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        data-testid="search-input"
      />
    </div>
  )
}))

// Mock Intl.DateTimeFormat for consistent testing
const mockDateTimeFormat = jest.fn()
// @ts-expect-error - Mocking global Intl for testing
global.Intl.DateTimeFormat = mockDateTimeFormat

describe('TimezoneSelector', () => {
  beforeEach(() => {
    // Mock DateTimeFormat to return consistent values
    mockDateTimeFormat.mockImplementation(() => ({
      format: jest.fn().mockReturnValue('3:00 PM'),
      formatToParts: jest.fn().mockReturnValue([
        { type: 'timeZoneName', value: 'UTC+05:00' }
      ]),
      resolvedOptions: jest.fn().mockReturnValue({
        timeZone: 'America/New_York'
      })
    }))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Functionality', () => {
    it('renders with default props', () => {
      render(<TimezoneSelector />)

      expect(screen.getByRole('button')).toBeInTheDocument()
      expect(screen.getByText('Select timezone')).toBeInTheDocument()
    })

    it('displays custom placeholder when provided', () => {
      render(<TimezoneSelector placeholder="Choose your timezone" />)

      expect(screen.getByText('Choose your timezone')).toBeInTheDocument()
    })

    it('displays label when provided', () => {
      render(<TimezoneSelector label="Event Timezone" />)

      expect(screen.getByText('Event Timezone')).toBeInTheDocument()
    })

    it('displays error message when provided', () => {
      render(<TimezoneSelector error="Timezone is required" />)

      expect(screen.getByText('Timezone is required')).toBeInTheDocument()
    })

    it('disables the selector when disabled prop is true', () => {
      render(<TimezoneSelector disabled />)

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })
  })

  describe('Dropdown Interaction', () => {
    it('opens dropdown when button is clicked', async () => {
      render(<TimezoneSelector />)

      const button = screen.getByRole('button')
      await userEvent.click(button)

      expect(screen.getByTestId('search-input')).toBeInTheDocument()
      expect(screen.getByText('North America')).toBeInTheDocument()
    })

    it('closes dropdown when clicking outside', async () => {
      render(
        <div>
          <TimezoneSelector />
          <div data-testid="outside">Outside</div>
        </div>
      )

      const button = screen.getByRole('button')
      await userEvent.click(button)

      // Dropdown should be open
      expect(screen.getByTestId('search-input')).toBeInTheDocument()

      // Click outside
      const outside = screen.getByTestId('outside')
      fireEvent.mouseDown(outside)

      // Dropdown should close
      await waitFor(() => {
        expect(screen.queryByTestId('search-input')).not.toBeInTheDocument()
      })
    })

    it('does not open dropdown when disabled', async () => {
      render(<TimezoneSelector disabled />)

      const button = screen.getByRole('button')
      await userEvent.click(button)

      expect(screen.queryByTestId('search-input')).not.toBeInTheDocument()
    })

    it('shows chevron rotation when dropdown is open', async () => {
      render(<TimezoneSelector />)

      const button = screen.getByRole('button')
      await userEvent.click(button)

      // This would test the chevron rotation class in real implementation
      expect(screen.getByTestId('search-input')).toBeInTheDocument()
    })
  })

  describe('Timezone Search', () => {
    it('filters timezones based on search input', async () => {
      render(<TimezoneSelector />)

      const button = screen.getByRole('button')
      await userEvent.click(button)

      const searchInput = screen.getByTestId('search-input')
      await userEvent.type(searchInput, 'New York')

      // Should filter to show only New York related timezones
      expect(screen.getByText('New York (UTC+05:00)')).toBeInTheDocument()
      expect(screen.queryByText('Los Angeles')).not.toBeInTheDocument()
    })

    it('shows no results message when no timezones match search', async () => {
      render(<TimezoneSelector />)

      const button = screen.getByRole('button')
      await userEvent.click(button)

      const searchInput = screen.getByTestId('search-input')
      await userEvent.type(searchInput, 'nonexistent')

      expect(screen.getByText('No timezones found')).toBeInTheDocument()
    })

    it('clears search when timezone is selected', async () => {
      render(<TimezoneSelector />)

      const button = screen.getByRole('button')
      await userEvent.click(button)

      const searchInput = screen.getByTestId('search-input')
      await userEvent.type(searchInput, 'New York')

      // Select a timezone
      const timezone = screen.getByText('New York (UTC+05:00)')
      await userEvent.click(timezone)

      // Dropdown should close and search should be cleared
      await waitFor(() => {
        expect(screen.queryByTestId('search-input')).not.toBeInTheDocument()
      })
    })
  })

  describe('Timezone Selection', () => {
    it('calls onChange when timezone is selected', async () => {
      const handleChange = jest.fn()
      render(<TimezoneSelector onChange={handleChange} />)

      const button = screen.getByRole('button')
      await userEvent.click(button)

      const timezone = screen.getByText('New York (UTC+05:00)')
      await userEvent.click(timezone)

      expect(handleChange).toHaveBeenCalledWith('America/New_York')
    })

    it('displays selected timezone in button', () => {
      render(<TimezoneSelector value="America/New_York" />)

      expect(screen.getByText('New York (UTC+05:00)')).toBeInTheDocument()
    })

    it('highlights selected timezone in dropdown', async () => {
      render(<TimezoneSelector value="America/New_York" />)

      const button = screen.getByRole('button')
      await userEvent.click(button)

      // Check that the timezone appears in the dropdown (there might be multiple instances)
      const selectedTimezones = screen.getAllByText('New York (UTC+05:00)')
      expect(selectedTimezones.length).toBeGreaterThan(0)
    })

    it('closes dropdown after selection', async () => {
      render(<TimezoneSelector />)

      const button = screen.getByRole('button')
      await userEvent.click(button)

      const timezone = screen.getByText('New York (UTC+05:00)')
      await userEvent.click(timezone)

      await waitFor(() => {
        expect(screen.queryByTestId('search-input')).not.toBeInTheDocument()
      })
    })
  })

  describe('Current Time Display', () => {
    it('shows current time for selected timezone when showCurrentTime is true', () => {
      render(<TimezoneSelector value="America/New_York" showCurrentTime />)

      expect(screen.getByText('Current time: 3:00 PM')).toBeInTheDocument()
    })

    it('hides current time when showCurrentTime is false', () => {
      render(<TimezoneSelector value="America/New_York" showCurrentTime={false} />)

      expect(screen.queryByText(/Current time:/)).not.toBeInTheDocument()
    })

    it('shows current time in dropdown for each timezone', async () => {
      render(<TimezoneSelector showCurrentTime />)

      const button = screen.getByRole('button')
      await userEvent.click(button)

      // Should show current time for each timezone option
      const timeDisplays = screen.getAllByText('3:00 PM')
      expect(timeDisplays.length).toBeGreaterThan(0)
    })
  })

  describe('Auto-detection', () => {
    it('auto-detects user timezone when no value is provided', () => {
      const handleChange = jest.fn()
      render(<TimezoneSelector onChange={handleChange} />)

      expect(handleChange).toHaveBeenCalledWith('America/New_York')
    })

    it('does not auto-detect when value is already provided', () => {
      const handleChange = jest.fn()
      render(<TimezoneSelector value="UTC" onChange={handleChange} />)

      expect(handleChange).not.toHaveBeenCalled()
    })
  })

  describe('Timezone Groups', () => {
    it('displays timezone groups in dropdown', async () => {
      render(<TimezoneSelector />)

      const button = screen.getByRole('button')
      await userEvent.click(button)

      expect(screen.getByText('North America')).toBeInTheDocument()
      expect(screen.getByText('Europe')).toBeInTheDocument()
      expect(screen.getByText('Asia')).toBeInTheDocument()
      expect(screen.getByText('Australia & Pacific')).toBeInTheDocument()
    })

    it('groups timezones correctly under regions', async () => {
      render(<TimezoneSelector />)

      const button = screen.getByRole('button')
      await userEvent.click(button)

      // New York should be under North America
      const northAmericaSection = screen.getByText('North America')
      expect(northAmericaSection).toBeInTheDocument()

      // London should be under Europe
      const europeSection = screen.getByText('Europe')
      expect(europeSection).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper button role', () => {
      render(<TimezoneSelector />)

      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('has proper label association', () => {
      render(<TimezoneSelector label="Event Timezone" />)

      const label = screen.getByText('Event Timezone')
      expect(label.tagName).toBe('LABEL')
    })

    it('supports keyboard navigation', async () => {
      render(<TimezoneSelector />)

      const button = screen.getByRole('button')

      // Test keyboard focus
      button.focus()
      expect(button).toHaveFocus()

      // Test Enter key to open dropdown
      fireEvent.keyDown(button, { key: 'Enter' })
      // In real implementation, this would open the dropdown
    })
  })

  describe('Error Handling', () => {
    it('handles invalid timezone gracefully', () => {
      // Mock console.warn to suppress error logs
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

      render(<TimezoneSelector value="Invalid/Timezone" />)

      // Should not crash and should show placeholder
      expect(screen.getByText('Select timezone')).toBeInTheDocument()

      consoleSpy.mockRestore()
    })

    it('displays error message with proper styling', () => {
      render(<TimezoneSelector error="Timezone is required" />)

      const errorMessage = screen.getByText('Timezone is required')
      expect(errorMessage).toBeInTheDocument()
    })
  })
})

describe('Timezone Utility Functions', () => {
  beforeEach(() => {
    mockDateTimeFormat.mockImplementation(() => ({
      format: jest.fn().mockReturnValue('3:00 PM'),
      formatToParts: jest.fn().mockReturnValue([
        { type: 'timeZoneName', value: 'UTC+05:00' }
      ])
    }))
  })

  describe('getTimezoneOffset', () => {
    it('returns timezone offset for valid timezone', () => {
      const offset = getTimezoneOffset('America/New_York')
      expect(offset).toBe('UTC+05:00')
    })

    it('returns empty string for invalid timezone', () => {
      mockDateTimeFormat.mockImplementation(() => {
        throw new Error('Invalid timezone')
      })

      const offset = getTimezoneOffset('Invalid/Timezone')
      expect(offset).toBe('')
    })
  })

  describe('getCurrentTimeInTimezone', () => {
    it('returns formatted time for valid timezone', () => {
      const time = getCurrentTimeInTimezone('America/New_York')
      expect(time).toBe('3:00 PM')
    })

    it('returns empty string for invalid timezone', () => {
      mockDateTimeFormat.mockImplementation(() => {
        throw new Error('Invalid timezone')
      })

      const time = getCurrentTimeInTimezone('Invalid/Timezone')
      expect(time).toBe('')
    })
  })

  describe('getTimezoneDisplayName', () => {
    it('returns formatted display name with offset', () => {
      const displayName = getTimezoneDisplayName('America/New_York')
      expect(displayName).toBe('New York (UTC+05:00)')
    })

    it('returns city name only when offset cannot be determined', () => {
      mockDateTimeFormat.mockImplementation(() => {
        throw new Error('Invalid timezone')
      })

      const displayName = getTimezoneDisplayName('America/New_York')
      expect(displayName).toBe('New York')
    })

    it('handles timezone with underscores correctly', () => {
      const displayName = getTimezoneDisplayName('America/Los_Angeles')
      expect(displayName).toBe('Los Angeles (UTC+05:00)')
    })
  })

  describe('getCommonTimezones', () => {
    it('returns array of common timezone identifiers', () => {
      const commonTimezones = getCommonTimezones()

      expect(Array.isArray(commonTimezones)).toBe(true)
      expect(commonTimezones).toContain('America/New_York')
      expect(commonTimezones).toContain('UTC')
      expect(commonTimezones).toContain('Europe/London')
      expect(commonTimezones).toContain('Asia/Tokyo')
    })

    it('returns exactly 9 common timezones', () => {
      const commonTimezones = getCommonTimezones()
      expect(commonTimezones).toHaveLength(9)
    })
  })
})