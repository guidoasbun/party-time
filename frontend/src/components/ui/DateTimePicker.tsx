'use client'

import * as React from 'react'
import { Calendar, Clock, X } from 'lucide-react'
import { format, addDays, addWeeks, addMonths } from 'date-fns'
import { cn } from '@/lib/utils'
import { Input } from './Input'
import { Button } from './Button'

interface DateTimePickerProps {
  value?: string // ISO date string (YYYY-MM-DD) or datetime string (YYYY-MM-DDTHH:mm)
  onChange?: (value: string) => void
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  className?: string
  min?: string
  max?: string
  includeTime?: boolean
  timeLabel?: string
  dateLabel?: string
  allowClear?: boolean
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Select date",
  label,
  error,
  disabled = false,
  className,
  min,
  max,
  includeTime = false,
  timeLabel = "Time",
  dateLabel = "Date",
  allowClear = false
}: DateTimePickerProps) {
  // Parse value into date and time components
  const [dateValue, timeValue] = React.useMemo(() => {
    if (!value) return ['', '']

    if (value.includes('T')) {
      // datetime-local format: YYYY-MM-DDTHH:mm
      const [date, time] = value.split('T')
      return [date, time || '']
    } else if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // date-only format: YYYY-MM-DD
      return [value, '']
    }

    return ['', '']
  }, [value])

  const handleDateChange = (newDate: string) => {
    if (!includeTime) {
      onChange?.(newDate)
      return
    }

    // Combine with existing time or default time
    const time = timeValue || '09:00'
    const newValue = newDate ? `${newDate}T${time}` : ''
    onChange?.(newValue)
  }

  const handleTimeChange = (newTime: string) => {
    if (!includeTime) return

    // Combine with existing date
    const date = dateValue || new Date().toISOString().split('T')[0]
    const newValue = date && newTime ? `${date}T${newTime}` : ''
    onChange?.(newValue)
  }

  const handleClear = () => {
    onChange?.('')
  }

  const hasValue = Boolean(value)

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </label>
          {allowClear && hasValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>
      )}

      {includeTime ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Date Input */}
          <Input
            type="date"
            value={dateValue}
            onChange={(e) => handleDateChange(e.target.value)}
            placeholder={placeholder}
            label={dateLabel}
            disabled={disabled}
            min={min}
            max={max}
            leftIcon={<Calendar className="h-4 w-4" />}
          />

          {/* Time Input */}
          <Input
            type="time"
            value={timeValue}
            onChange={(e) => handleTimeChange(e.target.value)}
            label={timeLabel}
            disabled={disabled || !dateValue}
            leftIcon={<Clock className="h-4 w-4" />}
          />
        </div>
      ) : (
        <Input
          type="date"
          value={dateValue}
          onChange={(e) => handleDateChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          max={max}
          leftIcon={<Calendar className="h-4 w-4" />}
        />
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}

interface DateTimeRangePickerProps {
  startValue?: string
  endValue?: string
  onStartChange?: (value: string) => void
  onEndChange?: (value: string) => void
  label?: string
  error?: string
  disabled?: boolean
  className?: string
  startPlaceholder?: string
  endPlaceholder?: string
  min?: string
  max?: string
  includeTime?: boolean
  allowClear?: boolean
}

export function DateTimeRangePicker({
  startValue,
  endValue,
  onStartChange,
  onEndChange,
  label,
  error,
  disabled = false,
  className,
  startPlaceholder = "Start date",
  endPlaceholder = "End date",
  min,
  max,
  includeTime = false,
  allowClear = false
}: DateTimeRangePickerProps) {
  const handleClear = () => {
    onStartChange?.('')
    onEndChange?.('')
  }

  const hasValue = Boolean(startValue || endValue)

  // Calculate min date for end picker (must be same day or later than start date)
  const getMinEndDate = () => {
    if (!startValue) return min

    if (includeTime && startValue.includes('T')) {
      return startValue.split('T')[0]
    }
    return startValue
  }

  // Calculate max date for start picker (must be same day or earlier than end date)
  const getMaxStartDate = () => {
    if (!endValue) return max

    if (includeTime && endValue.includes('T')) {
      return endValue.split('T')[0]
    }
    return endValue
  }

  return (
    <div className={cn("space-y-4", className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </label>
          {allowClear && hasValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3 w-3" />
              Clear Range
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DateTimePicker
          value={startValue || ''}
          onChange={onStartChange}
          placeholder={startPlaceholder}
          label="Start"
          disabled={disabled}
          min={min}
          max={getMaxStartDate()}
          includeTime={includeTime}
          dateLabel={includeTime ? "Start Date" : undefined}
          timeLabel={includeTime ? "Start Time" : undefined}
        />

        <DateTimePicker
          value={endValue || ''}
          onChange={onEndChange}
          placeholder={endPlaceholder}
          label="End"
          disabled={disabled}
          min={getMinEndDate()}
          max={max}
          includeTime={includeTime}
          dateLabel={includeTime ? "End Date" : undefined}
          timeLabel={includeTime ? "End Time" : undefined}
        />
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}

// Quick date preset utilities for event planning
export const getEventDatePresets = () => {
  const today = new Date()
  const formatDate = (date: Date) => format(date, 'yyyy-MM-dd')

  return [
    {
      label: 'Today',
      value: formatDate(today),
      getValue: () => formatDate(today)
    },
    {
      label: 'Tomorrow',
      value: formatDate(addDays(today, 1)),
      getValue: () => formatDate(addDays(new Date(), 1))
    },
    {
      label: 'Next Week',
      value: formatDate(addWeeks(today, 1)),
      getValue: () => formatDate(addWeeks(new Date(), 1))
    },
    {
      label: 'Next Month',
      value: formatDate(addMonths(today, 1)),
      getValue: () => formatDate(addMonths(new Date(), 1))
    }
  ]
}

interface QuickDatePresetsProps {
  onDateSelect: (date: string) => void
  className?: string
  disabled?: boolean
}

export function QuickDatePresets({
  onDateSelect,
  className,
  disabled = false
}: QuickDatePresetsProps) {
  const presets = getEventDatePresets()

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-sm font-medium">Quick Dates:</p>
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <Button
            key={preset.label}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onDateSelect(preset.getValue())}
            disabled={disabled}
            className="text-xs"
          >
            {preset.label}
          </Button>
        ))}
      </div>
    </div>
  )
}