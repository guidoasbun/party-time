'use client'

import * as React from "react"
import { Calendar, X, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "./Input"

interface DateRange {
  start?: string
  end?: string
}

interface DatePickerProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  className?: string
  min?: string
  max?: string
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  label,
  error,
  disabled = false,
  className,
  min,
  max
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [currentDate, setCurrentDate] = React.useState(new Date())
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Close calendar when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Initialize current date from value
  React.useEffect(() => {
    if (value) {
      setCurrentDate(new Date(value))
    }
  }, [value])

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const handleDateSelect = (date: Date) => {
    const dateString = formatDate(date)
    onChange?.(dateString)
    setIsOpen(false)
  }

  const handleCalendarIconClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
    }
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Input
        type="date"
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        label={label}
        error={error}
        disabled={disabled}
        min={min}
        max={max}
        leftIcon={
          <button
            type="button"
            onClick={handleCalendarIconClick}
            className="hover:bg-accent rounded p-1 transition-colors"
            disabled={disabled}
          >
            <Calendar className="h-4 w-4" />
          </button>
        }
      />

      {isOpen && (
        <div className="absolute top-full z-50 mt-1 rounded-md border border-border bg-white shadow-lg">
          <CalendarPopup
            currentDate={currentDate}
            selectedDate={value ? new Date(value) : undefined}
            onDateSelect={handleDateSelect}
            onMonthChange={setCurrentDate}
            min={min}
            max={max}
          />
        </div>
      )}
    </div>
  )
}

interface DateRangePickerProps {
  value?: DateRange
  onChange?: (value: DateRange) => void
  label?: string
  error?: string
  disabled?: boolean
  className?: string
  startPlaceholder?: string
  endPlaceholder?: string
  min?: string
  max?: string
}

export function DateRangePicker({
  value = {},
  onChange,
  label,
  error,
  disabled = false,
  className,
  startPlaceholder = "Start date",
  endPlaceholder = "End date",
  min,
  max
}: DateRangePickerProps) {
  const [localValue, setLocalValue] = React.useState<DateRange>(value)

  React.useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleStartChange = (start: string) => {
    const newValue = { ...localValue, start: start || undefined }
    setLocalValue(newValue)
    onChange?.(newValue)
  }

  const handleEndChange = (end: string) => {
    const newValue = { ...localValue, end: end || undefined }
    setLocalValue(newValue)
    onChange?.(newValue)
  }

  const handleClear = () => {
    const newValue = { start: undefined, end: undefined }
    setLocalValue(newValue)
    onChange?.(newValue)
  }

  const hasValue = localValue.start || localValue.end

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </label>
          {hasValue && !disabled && (
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

      <div className="grid grid-cols-2 gap-2">
        <DatePicker
          value={localValue.start || ""}
          onChange={handleStartChange}
          placeholder={startPlaceholder}
          disabled={disabled}
          min={min}
          max={localValue.end || max}
        />
        <DatePicker
          value={localValue.end || ""}
          onChange={handleEndChange}
          placeholder={endPlaceholder}
          disabled={disabled}
          min={localValue.start || min}
          max={max}
        />
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}

interface QuickDateFilter {
  label: string
  value: DateRange
}

interface QuickDateFiltersProps {
  value?: DateRange
  onChange?: (value: DateRange) => void
  className?: string
}

export function QuickDateFilters({
  value = {},
  onChange,
  className
}: QuickDateFiltersProps) {
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

  const startOfYear = new Date(today.getFullYear(), 0, 1)
  const endOfYear = new Date(today.getFullYear(), 11, 31)

  const formatDate = (date: Date) => date.toISOString().split('T')[0]

  const quickFilters: QuickDateFilter[] = [
    {
      label: "Today",
      value: {
        start: formatDate(today),
        end: formatDate(today)
      }
    },
    {
      label: "This Week",
      value: {
        start: formatDate(startOfWeek),
        end: formatDate(new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000))
      }
    },
    {
      label: "This Month",
      value: {
        start: formatDate(startOfMonth),
        end: formatDate(endOfMonth)
      }
    },
    {
      label: "This Year",
      value: {
        start: formatDate(startOfYear),
        end: formatDate(endOfYear)
      }
    },
    {
      label: "Next 30 Days",
      value: {
        start: formatDate(today),
        end: formatDate(new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000))
      }
    }
  ]

  const isSelected = (filterValue: DateRange) => {
    return value.start === filterValue.start && value.end === filterValue.end
  }

  const handleQuickFilterClick = (filterValue: DateRange) => {
    if (isSelected(filterValue)) {
      onChange?.({ start: undefined, end: undefined })
    } else {
      onChange?.(filterValue)
    }
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {quickFilters.map((filter) => (
        <button
          key={filter.label}
          type="button"
          onClick={() => handleQuickFilterClick(filter.value)}
          className={cn(
            "px-3 py-1.5 text-sm rounded-full border-2 transition-colors font-medium",
            isSelected(filter.value)
              ? "bg-blue-600 text-white border-blue-600 shadow-md"
              : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-800"
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  )
}

interface CalendarPopupProps {
  currentDate: Date
  selectedDate?: Date
  onDateSelect: (date: Date) => void
  onMonthChange: (date: Date) => void
  min?: string
  max?: string
}

function CalendarPopup({
  currentDate,
  selectedDate,
  onDateSelect,
  onMonthChange,
  min,
  max
}: CalendarPopupProps) {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay()

  const minDate = min ? new Date(min) : null
  const maxDate = max ? new Date(max) : null

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true
    if (maxDate && date > maxDate) return true
    return false
  }

  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false
    return date.toISOString().split('T')[0] === selectedDate.toISOString().split('T')[0]
  }

  const handlePrevMonth = () => {
    const newDate = new Date(year, month - 1, 1)
    onMonthChange(newDate)
  }

  const handleNextMonth = () => {
    const newDate = new Date(year, month + 1, 1)
    onMonthChange(newDate)
  }

  const handleDateClick = (day: number) => {
    const date = new Date(year, month, day)
    if (!isDateDisabled(date)) {
      onDateSelect(date)
    }
  }

  // Generate calendar grid
  const calendarDays = []

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null)
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  return (
    <div className="p-3 w-64 bg-white">
      {/* Header with month/year and navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        </button>

        <div className="font-medium text-sm text-gray-900">
          {monthNames[month]} {year}
        </div>

        <button
          type="button"
          onClick={handleNextMonth}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <ChevronRight className="h-4 w-4 text-gray-600" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 p-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={index} className="h-8" />
          }

          const date = new Date(year, month, day)
          const disabled = isDateDisabled(date)
          const selected = isDateSelected(date)
          const isToday = new Date().toISOString().split('T')[0] === date.toISOString().split('T')[0]

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleDateClick(day)}
              disabled={disabled}
              className={cn(
                "h-8 w-8 text-sm rounded transition-colors flex items-center justify-center",
                disabled
                  ? "text-gray-400 cursor-not-allowed opacity-50"
                  : "hover:bg-gray-100 text-gray-700",
                selected
                  ? "bg-blue-600 text-white font-medium hover:bg-blue-700"
                  : "",
                isToday && !selected
                  ? "bg-gray-200 font-medium text-gray-900"
                  : ""
              )}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}