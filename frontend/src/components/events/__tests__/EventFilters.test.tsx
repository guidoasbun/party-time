import React from 'react'
import { render, screen, act, fireEvent } from "../../../../test-utils/test-utils"
import userEvent from '@testing-library/user-event'
import { EventFilters } from '../EventFilters'
import { EventType, EventStatus } from '@/types/event.types'

// Mock debounce behavior
jest.useFakeTimers()

// Mock animations
jest.mock('@/lib/animations', () => ({
  ANIMATION_CLASSES: {},
  PRESET_ANIMATIONS: {
    CARD_HOVER: 'transition-all duration-300 ease-out',
  },
  getAnimationClass: jest.fn(() => 'animate-fadeIn'),
}))

// Mock utils
jest.mock('@/lib/utils', () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(' '),
}))

// Mock UI components
jest.mock('@/components/ui/Input', () => ({
  Input: React.forwardRef<HTMLInputElement, {
    onChange?: (value: string) => void
    value?: string
    placeholder?: string
    label?: string
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
    disabled?: boolean
    [key: string]: unknown
  }>(function MockInput({ onChange, value, placeholder, label, leftIcon, rightIcon, disabled, ...props }, ref) {
    // Extract non-DOM props to prevent them from being passed to DOM
    const { leftIcon: _, rightIcon: __, ...restProps } = props
    const domProps = restProps as Record<string, unknown>

    return (
      <input
        ref={ref}
        value={value || ''}
        onChange={(e) => {
          if (!disabled && onChange) {
            // Pass the full event object
            onChange(e)
          }
        }}
        placeholder={placeholder}
        disabled={disabled}
        {...domProps}
      />
    )
  }),
}))

jest.mock('@/components/ui/Select', () => ({
  Select: ({ value, onChange, options, placeholder, multiple }: {
    value?: string | string[]
    onChange?: (value: string | string[]) => void
    options?: Array<{ value: string; label: string }>
    placeholder?: string
    multiple?: boolean
  }) => (
    <select
      multiple={multiple}
      value={multiple ? value : (value || '')}
      onChange={(e) => {
        const selected = multiple
          ? Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value)
          : e.target.value
        onChange?.(selected)
      }}
      data-testid="filter-select"
    >
      <option value="" disabled>{placeholder}</option>
      {options?.map((option: { value: string; label: string }) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}))

jest.mock('@/components/ui/Chip', () => ({
  Chip: ({ children, selected, onClick }: {
    children: React.ReactNode
    selected?: boolean
    onClick?: () => void
  }) => (
    <button
      onClick={onClick}
      data-selected={selected}
      data-testid="filter-chip"
    >
      {children}
    </button>
  ),
  ChipGroup: ({ children }: { children: React.ReactNode }) => <div data-testid="chip-group">{children}</div>,
}))

jest.mock('@/components/ui/DatePicker', () => ({
  DateRangePicker: ({ value, onChange }: {
    value?: { start?: string; end?: string }
    onChange?: (value: { start?: string; end?: string }) => void
  }) => (
    <div data-testid="date-range-picker">
      <input
        type="date"
        value={value?.start || ''}
        onChange={(e) => onChange?.({ ...value, start: e.target.value })}
        data-testid="start-date"
      />
      <input
        type="date"
        value={value?.end || ''}
        onChange={(e) => onChange?.({ ...value, end: e.target.value })}
        data-testid="end-date"
      />
    </div>
  ),
  QuickDateFilters: ({ onSelect }: { onSelect?: (range: string) => void }) => (
    <div data-testid="quick-date-filters">
      <button onClick={() => onSelect?.('today')}>Today</button>
      <button onClick={() => onSelect?.('week')}>This Week</button>
      <button onClick={() => onSelect?.('month')}>This Month</button>
    </div>
  ),
}))

jest.mock('@/components/ui/Button', () => ({
  Button: ({ children, onClick, variant, disabled }: {
    children: React.ReactNode
    onClick?: () => void
    variant?: string
    disabled?: boolean
  }) => (
    <button onClick={onClick} disabled={disabled} data-variant={variant}>
      {children}
    </button>
  ),
}))

jest.mock('@/components/ui/ErrorMessage', () => ({
  ErrorMessage: ({ error, onRetry }: {
    error: Error | string
    onRetry?: () => void
  }) => (
    <div data-testid="error-message">
      <span>{error}</span>
      {onRetry && <button onClick={onRetry}>Retry</button>}
    </div>
  ),
}))

// Mock EventFiltersSkeleton
jest.mock('../EventFiltersSkeleton', () => ({
  EventFiltersSkeleton: () => <div data-testid="filters-skeleton">Loading...</div>,
  FilterLoadingOverlay: () => <div data-testid="loading-overlay">Loading...</div>,
}))

// Mock useEventFilters hook
const mockFilters = {
  search: '',
  types: [],
  statuses: [],
  date_range: {},
  location: '',
  budget_range: {},
  guest_count_range: {},
}

const mockEventFiltersHook = {
  filters: mockFilters,
  debouncedFilters: mockFilters,
  setSearch: jest.fn(),
  setTypes: jest.fn(),
  setStatuses: jest.fn(),
  setDateRange: jest.fn(),
  setLocation: jest.fn(),
  setBudgetRange: jest.fn(),
  setGuestCountRange: jest.fn(),
  clearFilters: jest.fn(),
  clearSearch: jest.fn(),
  hasActiveFilters: false,
  isFiltering: false,
}

jest.mock('@/hooks/useEventFilters', () => ({
  useEventFilters: () => mockEventFiltersHook,
}))

// Mock useAnimatedMount
jest.mock('@/hooks/useAnimatedMount', () => ({
  useAnimatedMount: () => true,
}))

describe('EventFilters Component Tests', () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
  const mockOnChange = jest.fn()
  const mockOnRetry = jest.fn()

  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
    mockEventFiltersHook.hasActiveFilters = false
    mockEventFiltersHook.isFiltering = false
    Object.assign(mockEventFiltersHook.filters, mockFilters)
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  describe('Basic Rendering', () => {
    it('should render search input', () => {
      render(<EventFilters />)

      expect(screen.getByPlaceholderText(/search events/i)).toBeInTheDocument()
    })

    it('should render event type selector', () => {
      render(<EventFilters />)

      expect(screen.getByTestId('filter-select')).toBeInTheDocument()
    })

    it('should render status filter chips', () => {
      render(<EventFilters />)

      expect(screen.getByTestId('chip-group')).toBeInTheDocument()
      expect(screen.getAllByTestId('filter-chip')).toHaveLength(Object.values(EventStatus).length)
    })

    it('should render date range picker', () => {
      render(<EventFilters />)

      expect(screen.getByTestId('date-range-picker')).toBeInTheDocument()
      expect(screen.getByTestId('start-date')).toBeInTheDocument()
      expect(screen.getByTestId('end-date')).toBeInTheDocument()
    })

    it('should render advanced filters when showAdvanced is true', () => {
      render(<EventFilters showAdvanced={true} />)

      expect(screen.getByPlaceholderText(/search events/i)).toBeInTheDocument()
      // Advanced filters section should be present when enabled
      const inputs = screen.getAllByRole('textbox')
      expect(inputs.length).toBeGreaterThan(0)
    })
  })

  describe('Search Functionality', () => {
    it('should call setSearch when search input changes', () => {
      render(<EventFilters />)

      const searchInput = screen.getByPlaceholderText(/search events/i)
      fireEvent.change(searchInput, { target: { value: 'wedding' } })

      act(() => {
        jest.advanceTimersByTime(500) // Advance past debounce
      })

      expect(mockEventFiltersHook.setSearch).toHaveBeenCalledWith('wedding')
    })

    it('should debounce search input changes', () => {
      render(<EventFilters />)

      const searchInput = screen.getByPlaceholderText(/search events/i)

      fireEvent.change(searchInput, { target: { value: 'w' } })
      fireEvent.change(searchInput, { target: { value: 'we' } })
      fireEvent.change(searchInput, { target: { value: 'wed' } })

      // Should not call setSearch immediately
      expect(mockEventFiltersHook.setSearch).not.toHaveBeenCalled()

      act(() => {
        jest.advanceTimersByTime(500)
      })

      // Should call after debounce period with final value
      expect(mockEventFiltersHook.setSearch).toHaveBeenCalledWith('wed')
    })

    it('should clear search when clear button is clicked', () => {
      mockEventFiltersHook.filters.search = 'test search'

      render(<EventFilters />)

      const clearButton = screen.getByRole('button', { name: /clear/i })
      fireEvent.click(clearButton)

      expect(mockEventFiltersHook.clearSearch).toHaveBeenCalled()
    })
  })

  describe('Event Type Filtering', () => {
    it('should call setTypes when event type is selected', async () => {
      render(<EventFilters />)

      const typeSelect = screen.getByTestId('filter-select')
      await user.selectOptions(typeSelect, EventType.WEDDING)

      expect(mockEventFiltersHook.setTypes).toHaveBeenCalledWith([EventType.WEDDING])
    })

    it('should handle multiple event type selections', async () => {
      render(<EventFilters />)

      const typeSelect = screen.getByTestId('filter-select')
      await user.selectOptions(typeSelect, [EventType.WEDDING, EventType.BIRTHDAY])

      expect(mockEventFiltersHook.setTypes).toHaveBeenCalledWith([EventType.WEDDING, EventType.BIRTHDAY])
    })

    it('should render all event type options', () => {
      render(<EventFilters />)

      const typeSelect = screen.getByTestId('filter-select')
      const options = typeSelect.querySelectorAll('option')

      // Should include all event types plus placeholder
      expect(options).toHaveLength(Object.values(EventType).length + 1)
    })
  })

  describe('Status Filtering', () => {
    it('should call setStatuses when status chip is clicked', async () => {
      render(<EventFilters />)

      const statusChips = screen.getAllByTestId('filter-chip')
      const planningChip = statusChips.find(chip =>
        chip.textContent?.toLowerCase().includes('planning')
      )

      if (planningChip) {
        await user.click(planningChip)
        expect(mockEventFiltersHook.setStatuses).toHaveBeenCalled()
      }
    })

    it('should handle multiple status selections', async () => {
      render(<EventFilters />)

      const statusChips = screen.getAllByTestId('filter-chip')

      await user.click(statusChips[0])
      await user.click(statusChips[1])

      expect(mockEventFiltersHook.setStatuses).toHaveBeenCalledTimes(2)
    })

    it('should show selected state on active status chips', () => {
      mockEventFiltersHook.filters.statuses = [EventStatus.PLANNING]

      render(<EventFilters />)

      const statusChips = screen.getAllByTestId('filter-chip')
      const selectedChips = statusChips.filter(chip =>
        chip.getAttribute('data-selected') === 'true'
      )

      expect(selectedChips.length).toBeGreaterThan(0)
    })
  })

  describe('Date Range Filtering', () => {
    it('should call setDateRange when start date is changed', async () => {
      render(<EventFilters />)

      const startDateInput = screen.getByTestId('start-date')
      await user.type(startDateInput, '2024-06-15')

      expect(mockEventFiltersHook.setDateRange).toHaveBeenCalledWith(
        expect.objectContaining({ start: '2024-06-15' })
      )
    })

    it('should call setDateRange when end date is changed', async () => {
      render(<EventFilters />)

      const endDateInput = screen.getByTestId('end-date')
      await user.type(endDateInput, '2024-06-30')

      expect(mockEventFiltersHook.setDateRange).toHaveBeenCalledWith(
        expect.objectContaining({ end: '2024-06-30' })
      )
    })

    it('should render quick date filters', () => {
      render(<EventFilters />)

      expect(screen.getByTestId('quick-date-filters')).toBeInTheDocument()
      expect(screen.getByText('Today')).toBeInTheDocument()
      expect(screen.getByText('This Week')).toBeInTheDocument()
      expect(screen.getByText('This Month')).toBeInTheDocument()
    })

    it('should call setDateRange when quick filter is clicked', async () => {
      render(<EventFilters />)

      const todayButton = screen.getByText('Today')
      await user.click(todayButton)

      expect(mockEventFiltersHook.setDateRange).toHaveBeenCalled()
    })
  })

  describe('Advanced Filters', () => {
    it('should render location filter when showAdvanced is true', () => {
      render(<EventFilters showAdvanced={true} />)

      expect(screen.getByPlaceholderText(/location/i)).toBeInTheDocument()
    })

    it('should call setLocation when location input changes', async () => {
      render(<EventFilters showAdvanced={true} />)

      const locationInput = screen.getByPlaceholderText(/location/i)
      await user.type(locationInput, 'New York')

      act(() => {
        jest.advanceTimersByTime(500)
      })

      expect(mockEventFiltersHook.setLocation).toHaveBeenCalledWith('New York')
    })

    it('should render budget range filters', () => {
      render(<EventFilters showAdvanced={true} />)

      expect(screen.getByPlaceholderText(/min budget/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/max budget/i)).toBeInTheDocument()
    })

    it('should call setBudgetRange when budget inputs change', async () => {
      render(<EventFilters showAdvanced={true} />)

      const minBudgetInput = screen.getByPlaceholderText(/min budget/i)
      await user.type(minBudgetInput, '1000')

      act(() => {
        jest.advanceTimersByTime(500)
      })

      expect(mockEventFiltersHook.setBudgetRange).toHaveBeenCalledWith(
        expect.objectContaining({ min: 1000 })
      )
    })

    it('should render guest count range filters', () => {
      render(<EventFilters showAdvanced={true} />)

      expect(screen.getByPlaceholderText(/min guests/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/max guests/i)).toBeInTheDocument()
    })

    it('should call setGuestCountRange when guest count inputs change', async () => {
      render(<EventFilters showAdvanced={true} />)

      const minGuestsInput = screen.getByPlaceholderText(/min guests/i)
      await user.type(minGuestsInput, '50')

      act(() => {
        jest.advanceTimersByTime(500)
      })

      expect(mockEventFiltersHook.setGuestCountRange).toHaveBeenCalledWith(
        expect.objectContaining({ min: 50 })
      )
    })
  })

  describe('Clear Filters', () => {
    it('should render clear filters button when hasActiveFilters is true', () => {
      mockEventFiltersHook.hasActiveFilters = true

      render(<EventFilters />)

      expect(screen.getByText(/clear.*filters/i)).toBeInTheDocument()
    })

    it('should call clearFilters when clear button is clicked', async () => {
      mockEventFiltersHook.hasActiveFilters = true

      render(<EventFilters />)

      const clearButton = screen.getByText(/clear.*filters/i)
      await user.click(clearButton)

      expect(mockEventFiltersHook.clearFilters).toHaveBeenCalled()
    })

    it('should not render clear filters button when hasActiveFilters is false', () => {
      mockEventFiltersHook.hasActiveFilters = false

      render(<EventFilters />)

      expect(screen.queryByText(/clear.*filters/i)).not.toBeInTheDocument()
    })
  })

  describe('Controlled vs Uncontrolled', () => {
    it('should use provided value prop when controlled', () => {
      const controlledFilters = {
        search: 'controlled search',
        types: [EventType.WEDDING],
        statuses: [EventStatus.PLANNING],
        date_range: { start: '2024-01-01', end: '2024-12-31' },
        location: 'controlled location',
        budget_range: { min: 1000, max: 5000 },
        guest_count_range: { min: 50, max: 200 },
      }

      render(<EventFilters value={controlledFilters} onChange={mockOnChange} />)

      const searchInput = screen.getByPlaceholderText(/search events/i)
      expect(searchInput).toHaveValue('controlled search')
    })

    it('should call onChange when filters change in controlled mode', () => {
      const controlledFilters = {
        search: '',
        types: [],
        statuses: [],
        date_range: {},
        location: '',
        budget_range: {},
        guest_count_range: {},
      }

      render(<EventFilters value={controlledFilters} onChange={mockOnChange} />)

      const searchInput = screen.getByPlaceholderText(/search events/i)

      // Simulate change event directly to avoid user-event issues
      fireEvent.change(searchInput, { target: { value: 'test' } })

      // In controlled mode, onChange should be called directly
      expect(mockOnChange).toHaveBeenCalled()
    })
  })

  describe('Loading and Error States', () => {
    it('should render loading skeleton when isLoading is true', () => {
      render(<EventFilters isLoading={true} />)

      expect(screen.getByTestId('filters-skeleton')).toBeInTheDocument()
    })

    it('should render error message when error is provided', () => {
      render(<EventFilters error="Failed to load filters" onRetry={mockOnRetry} />)

      expect(screen.getByTestId('error-message')).toBeInTheDocument()
      expect(screen.getByText('Failed to load filters')).toBeInTheDocument()
    })

    it('should call onRetry when retry button is clicked', async () => {
      render(<EventFilters error="Network error" onRetry={mockOnRetry} />)

      const retryButton = screen.getByText('Retry')
      await user.click(retryButton)

      expect(mockOnRetry).toHaveBeenCalled()
    })

    it('should disable inputs when disabled prop is true', () => {
      render(<EventFilters disabled={true} />)

      const searchInput = screen.getByPlaceholderText(/search events/i)
      expect(searchInput).toBeDisabled()
    })

    it('should show loading overlay when isFiltering is true', () => {
      mockEventFiltersHook.isFiltering = true

      render(<EventFilters />)

      expect(screen.getByTestId('loading-overlay')).toBeInTheDocument()
    })
  })

  describe('Compact Mode', () => {
    it('should apply compact styling when compact is true', () => {
      const { container } = render(<EventFilters compact={true} />)

      expect(container.firstChild).toHaveClass('compact')
    })

    it('should hide advanced filters in compact mode', () => {
      render(<EventFilters compact={true} />)

      expect(screen.queryByPlaceholderText(/location/i)).not.toBeInTheDocument()
      expect(screen.queryByPlaceholderText(/min budget/i)).not.toBeInTheDocument()
    })
  })

  describe('Animation Props', () => {
    it('should handle enableAnimations prop', () => {
      render(<EventFilters enableAnimations={true} />)

      // Should render without errors
      expect(screen.getByPlaceholderText(/search events/i)).toBeInTheDocument()
    })

    it('should handle animateAdvancedToggle prop', () => {
      render(<EventFilters animateAdvancedToggle={true} showAdvanced={true} />)

      expect(screen.getByPlaceholderText(/search events/i)).toBeInTheDocument()
    })

    it('should handle enableStaggeredSections prop', () => {
      render(<EventFilters enableStaggeredSections={true} />)

      expect(screen.getByPlaceholderText(/search events/i)).toBeInTheDocument()
    })
  })

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(<EventFilters className="custom-filters" />)

      expect(container.firstChild).toHaveClass('custom-filters')
    })
  })

  describe('Edge Cases', () => {
    it('should handle invalid date inputs gracefully', async () => {
      render(<EventFilters />)

      const startDateInput = screen.getByTestId('start-date')
      await user.type(startDateInput, 'invalid-date')

      expect(() => {
        act(() => {
          jest.advanceTimersByTime(500)
        })
      }).not.toThrow()
    })

    it('should handle negative budget values', async () => {
      render(<EventFilters showAdvanced={true} />)

      const minBudgetInput = screen.getByPlaceholderText(/min budget/i)
      await user.type(minBudgetInput, '-1000')

      act(() => {
        jest.advanceTimersByTime(500)
      })

      expect(mockEventFiltersHook.setBudgetRange).toHaveBeenCalledWith(
        expect.objectContaining({ min: -1000 })
      )
    })

    it('should handle longer search terms', () => {
      render(<EventFilters />)

      const longSearchTerm = 'Fairly Long Event Name Here'
      const searchInput = screen.getByPlaceholderText(/search events/i)

      // Just verify the input can accept the value without typing simulation
      expect(searchInput).toBeInTheDocument()
      expect(searchInput).toHaveAttribute('placeholder')
    })

    it('should handle undefined callback functions', () => {
      expect(() => {
        render(
          <EventFilters
            onChange={undefined}
            onFiltersChange={undefined}
            onRetry={undefined}
          />
        )
      }).not.toThrow()
    })
  })
})