'use client'

import * as React from 'react'
import { Search, MapPin, Filter, X, DollarSign, Users } from 'lucide-react'
import { EventType, EventStatus, EventFilters as EventFiltersType } from '@/types/event.types'
import { useEventFilters } from '@/hooks/useEventFilters'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Chip, ChipGroup } from '@/components/ui/Chip'
import { DateRangePicker, QuickDateFilters } from '@/components/ui/DatePicker'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface EventFiltersProps {
  value?: EventFiltersType
  onChange?: (filters: EventFiltersType) => void
  onFiltersChange?: (filters: EventFiltersType) => void
  className?: string
  compact?: boolean
  showAdvanced?: boolean
}

export function EventFilters({
  value,
  onChange,
  onFiltersChange,
  className,
  compact = false,
  showAdvanced = true
}: EventFiltersProps) {
  const {
    filters,
    debouncedFilters,
    setSearch,
    setTypes,
    setStatuses,
    setDateRange,
    setLocation,
    setBudgetRange,
    setGuestCountRange,
    clearFilters,
    clearSearch,
    hasActiveFilters,
    isFiltering
  } = useEventFilters({
    defaultFilters: value,
    persistToLocalStorage: !value, // Only persist if not controlled
    syncWithUrl: !value // Only sync with URL if not controlled
  })

  // Use controlled filters if provided, otherwise use internal state
  const currentFilters = value || filters

  // Notify parent of filter changes
  React.useEffect(() => {
    if (!value) {
      onChange?.(debouncedFilters)
      onFiltersChange?.(debouncedFilters)
    }
  }, [debouncedFilters, onChange, onFiltersChange, value])

  // Event type options
  const eventTypeOptions = Object.values(EventType).map(type => ({
    value: type,
    label: formatEventType(type)
  }))

  // Status chip data
  const statusChips = Object.values(EventStatus).map(status => ({
    value: status,
    label: formatEventStatus(status),
    selected: currentFilters.statuses.includes(status)
  }))

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    if (value) {
      onChange?.({ ...value, search: newValue })
    } else {
      setSearch(newValue)
    }
  }

  const handleTypesChange = (types: string | string[]) => {
    const newTypes = Array.isArray(types) ? types as EventType[] : []
    if (value) {
      onChange?.({ ...value, types: newTypes })
    } else {
      setTypes(newTypes)
    }
  }

  const handleStatusToggle = (status: EventStatus) => {
    const newStatuses = currentFilters.statuses.includes(status)
      ? currentFilters.statuses.filter(s => s !== status)
      : [...currentFilters.statuses, status]

    if (value) {
      onChange?.({ ...value, statuses: newStatuses })
    } else {
      setStatuses(newStatuses)
    }
  }

  const handleDateRangeChange = (dateRange: { start?: string; end?: string }) => {
    if (value) {
      onChange?.({ ...value, date_range: dateRange })
    } else {
      setDateRange(dateRange)
    }
  }

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLocation = e.target.value
    if (value) {
      onChange?.({ ...value, location: newLocation })
    } else {
      setLocation(newLocation)
    }
  }

  const handleBudgetRangeChange = (field: 'min' | 'max') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = e.target.value ? Number(e.target.value) : undefined
    const newBudgetRange = {
      ...currentFilters.budget_range,
      [field]: numValue
    }

    if (value) {
      onChange?.({ ...value, budget_range: newBudgetRange })
    } else {
      setBudgetRange(newBudgetRange)
    }
  }

  const handleGuestCountRangeChange = (field: 'min' | 'max') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = e.target.value ? Number(e.target.value) : undefined
    const newGuestCountRange = {
      ...currentFilters.guest_count_range,
      [field]: numValue
    }

    if (value) {
      onChange?.({ ...value, guest_count_range: newGuestCountRange })
    } else {
      setGuestCountRange(newGuestCountRange)
    }
  }

  const handleClearFilters = () => {
    if (value) {
      onChange?.({
        search: '',
        types: [],
        statuses: [],
        date_range: {},
        location: '',
        budget_range: {},
        guest_count_range: {}
      })
    } else {
      clearFilters()
    }
  }

  const hasActiveFiltersCheck = value
    ? !!(value.search || value.types.length > 0 || value.statuses.length > 0 ||
         value.date_range.start || value.date_range.end || value.location ||
         value.budget_range?.min || value.budget_range?.max ||
         value.guest_count_range?.min || value.guest_count_range?.max)
    : hasActiveFilters

  if (compact) {
    return (
      <div className={cn("space-y-3 sm:space-y-4", className)}>
        {/* Search and basic filters - Mobile responsive */}
        <div className="flex flex-col gap-3">
          {/* Search - full width on mobile */}
          <div className="w-full">
            <Input
              placeholder="Search events..."
              value={currentFilters.search || ''}
              onChange={handleSearchChange}
              leftIcon={<Search className="h-4 w-4" />}
              rightIcon={
                currentFilters.search && (
                  <button
                    type="button"
                    onClick={() => value ? onChange?.({ ...value, search: '' }) : clearSearch()}
                    className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded p-1 transition-colors duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="Clear search"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )
              }
            />
          </div>

          {/* Type selector and clear button */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Select
                options={eventTypeOptions}
                value={currentFilters.types}
                onValueChange={handleTypesChange}
                placeholder="Event types"
                multiple
                className="w-full"
              />
            </div>
            {hasActiveFiltersCheck && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="w-full sm:w-auto min-h-[44px] gap-2"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Status chips - wrap on mobile */}
        {currentFilters.statuses.length > 0 && (
          <div className="overflow-x-auto">
            <ChipGroup className="flex flex-wrap gap-2">
              {statusChips.filter(chip => chip.selected).map(chip => (
                <Chip
                  key={chip.value}
                  variant="filter"
                  selected={chip.selected}
                  onToggle={() => handleStatusToggle(chip.value)}
                  className="flex-shrink-0"
                >
                  {chip.label}
                </Chip>
              ))}
            </ChipGroup>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn("space-y-4 sm:space-y-6 p-4 sm:p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors duration-200", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
          {isFiltering && (
            <div className="text-xs text-gray-500 dark:text-gray-400">Filtering...</div>
          )}
        </div>
        {hasActiveFiltersCheck && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className="w-full sm:w-auto min-h-[44px] gap-2"
          >
            <X className="h-4 w-4" />
            Clear All
          </Button>
        )}
      </div>

      {/* Search */}
      <div>
        <Input
          label="Search"
          placeholder="Search events by name, description, or venue..."
          value={currentFilters.search || ''}
          onChange={handleSearchChange}
          leftIcon={<Search className="h-4 w-4" />}
          rightIcon={
            currentFilters.search && (
              <button
                type="button"
                onClick={() => value ? onChange?.({ ...value, search: '' }) : clearSearch()}
                className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded p-1 transition-colors duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
                title="Clear search"
              >
                <X className="h-3 w-3" />
              </button>
            )
          }
        />
      </div>

      {/* Event Types */}
      <div>
        <Select
          label="Event Types"
          options={eventTypeOptions}
          value={currentFilters.types}
          onValueChange={handleTypesChange}
          placeholder="Select event types..."
          multiple
        />
      </div>

      {/* Status Filters */}
      <div>
        <label className="text-sm font-medium leading-none mb-3 block text-gray-900 dark:text-white">
          Status
        </label>
        <ChipGroup className="flex flex-wrap gap-2">
          {statusChips.map(chip => (
            <Chip
              key={chip.value}
              variant="status"
              selected={chip.selected}
              onToggle={() => handleStatusToggle(chip.value)}
              className="min-h-[44px] px-3 touch-manipulation"
            >
              {chip.label}
            </Chip>
          ))}
        </ChipGroup>
      </div>

      {/* Date Range */}
      <div>
        <DateRangePicker
          label="Date Range"
          value={currentFilters.date_range}
          onChange={handleDateRangeChange}
        />
        <div className="mt-3">
          <QuickDateFilters
            value={currentFilters.date_range}
            onChange={handleDateRangeChange}
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <Input
          label="Location"
          placeholder="Filter by venue or location..."
          value={currentFilters.location || ''}
          onChange={handleLocationChange}
          leftIcon={<MapPin className="h-4 w-4" />}
        />
      </div>

      {showAdvanced && (
        <>
          {/* Budget Range */}
          <div>
            <label className="text-sm font-medium leading-none mb-3 block text-gray-900 dark:text-white">
              Budget Range
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                placeholder="Min budget"
                type="number"
                value={currentFilters.budget_range?.min || ''}
                onChange={handleBudgetRangeChange('min')}
                leftIcon={<DollarSign className="h-4 w-4" />}
              />
              <Input
                placeholder="Max budget"
                type="number"
                value={currentFilters.budget_range?.max || ''}
                onChange={handleBudgetRangeChange('max')}
                leftIcon={<DollarSign className="h-4 w-4" />}
              />
            </div>
          </div>

          {/* Guest Count Range */}
          <div>
            <label className="text-sm font-medium leading-none mb-3 block text-gray-900 dark:text-white">
              Guest Count Range
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                placeholder="Min guests"
                type="number"
                value={currentFilters.guest_count_range?.min || ''}
                onChange={handleGuestCountRangeChange('min')}
                leftIcon={<Users className="h-4 w-4" />}
              />
              <Input
                placeholder="Max guests"
                type="number"
                value={currentFilters.guest_count_range?.max || ''}
                onChange={handleGuestCountRangeChange('max')}
                leftIcon={<Users className="h-4 w-4" />}
              />
            </div>
          </div>
        </>
      )}

      {/* Filter Summary */}
      {hasActiveFiltersCheck && (
        <div className="pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {getFilterSummary(currentFilters)}
          </div>
        </div>
      )}
    </div>
  )
}

// Helper functions
function formatEventType(type: EventType): string {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatEventStatus(status: EventStatus): string {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function getFilterSummary(filters: EventFiltersType): string {
  const parts: string[] = []

  if (filters.search) {
    parts.push(`Search: "${filters.search}"`)
  }

  if (filters.types.length > 0) {
    parts.push(`Types: ${filters.types.length}`)
  }

  if (filters.statuses.length > 0) {
    parts.push(`Statuses: ${filters.statuses.length}`)
  }

  if (filters.date_range.start || filters.date_range.end) {
    parts.push('Date range')
  }

  if (filters.location) {
    parts.push('Location')
  }

  if (filters.budget_range?.min || filters.budget_range?.max) {
    parts.push('Budget range')
  }

  if (filters.guest_count_range?.min || filters.guest_count_range?.max) {
    parts.push('Guest count range')
  }

  return `Active filters: ${parts.join(', ')}`
}