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
import { EventFiltersSkeleton, FilterLoadingOverlay } from './EventFiltersSkeleton'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { cn } from '@/lib/utils'
import { ANIMATION_CLASSES, PRESET_ANIMATIONS, getAnimationClass } from '@/lib/animations'
import { useAnimatedMount } from '@/hooks/useAnimatedMount'

interface EventFiltersProps {
  value?: EventFiltersType
  onChange?: (filters: EventFiltersType) => void
  onFiltersChange?: (filters: EventFiltersType) => void
  className?: string
  compact?: boolean
  showAdvanced?: boolean
  isLoading?: boolean
  error?: string | Error | null
  onRetry?: () => void
  disabled?: boolean
  /** Enable enhanced animations */
  enableAnimations?: boolean
  /** Animate advanced filters toggle */
  animateAdvancedToggle?: boolean
  /** Enable staggered filter section animations */
  enableStaggeredSections?: boolean
}

export function EventFilters({
  value,
  onChange,
  onFiltersChange,
  className,
  compact = false,
  showAdvanced = true,
  isLoading = false,
  error = null,
  onRetry,
  disabled = false,
  enableAnimations = true,
  animateAdvancedToggle = true,
  enableStaggeredSections = true
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
  const onChangeRef = React.useRef(onChange)
  const onFiltersChangeRef = React.useRef(onFiltersChange)

  React.useEffect(() => {
    onChangeRef.current = onChange
    onFiltersChangeRef.current = onFiltersChange
  })

  React.useEffect(() => {
    if (!value) {
      onChangeRef.current?.(debouncedFilters)
      onFiltersChangeRef.current?.(debouncedFilters)
    }
  }, [debouncedFilters, value])

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

  // Animation states
  const [showAdvancedInternal, setShowAdvancedInternal] = React.useState(showAdvanced)
  const [isAdvancedToggling, setIsAdvancedToggling] = React.useState(false)
  const previousShowAdvanced = React.useRef(showAdvanced)

  // Update internal state when prop changes
  React.useEffect(() => {
    if (showAdvanced !== previousShowAdvanced.current) {
      setIsAdvancedToggling(true)
      setShowAdvancedInternal(showAdvanced)
      previousShowAdvanced.current = showAdvanced
      setTimeout(() => setIsAdvancedToggling(false), 300)
    }
  }, [showAdvanced])

  // Animated mount for advanced filters
  const advancedFiltersAnimation = useAnimatedMount({
    show: showAdvancedInternal,
    animation: {
      type: 'slide',
      direction: 'down',
      duration: 300,
      easing: 'ease-out'
    },
    animateInitial: animateAdvancedToggle
  })

  // Handle loading state
  if (isLoading) {
    return (
      <EventFiltersSkeleton
        className={className}
        layout={compact ? 'compact' : 'full'}
        showAdvanced={showAdvanced}
      />
    )
  }

  // Handle error state
  if (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return (
      <div className={cn('space-y-4', className)}>
        <ErrorMessage
          title="Failed to load filters"
          message={errorMessage}
          type="server"
          severity="error"
          onRetry={onRetry}
          showDetails={process.env.NODE_ENV === 'development'}
        />
      </div>
    )
  }

  if (compact) {
    return (
      <div className={cn(
        "space-y-3 sm:space-y-4 relative",
        enableAnimations && getAnimationClass('animate-fadeIn'),
        className
      )}>
        {/* Loading overlay when filtering */}
        {isFiltering && <FilterLoadingOverlay />}

        {/* Search and basic filters - Mobile responsive */}
        <div className="flex flex-col gap-3">
          {/* Search - full width on mobile */}
          <div className="w-full">
            <Input
              placeholder="Search events..."
              value={currentFilters.search || ''}
              onChange={handleSearchChange}
              leftIcon={<Search className="h-4 w-4" />}
              disabled={disabled || isFiltering}
              rightIcon={
                currentFilters.search && (
                  <button
                    type="button"
                    onClick={() => value ? onChange?.({ ...value, search: '' }) : clearSearch()}
                    className="hover:bg-muted rounded p-1 transition-colors duration-[var(--duration-normal)] min-h-[44px] min-w-[44px] flex items-center justify-center"
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
                disabled={disabled || isFiltering}
              />
            </div>
            {hasActiveFiltersCheck && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className={cn(
                  "w-full sm:w-auto min-h-[44px] gap-2",
                  enableAnimations && [
                    getAnimationClass('animate-slideInRight'),
                    PRESET_ANIMATIONS.BUTTON_HOVER,
                    "hover:shadow-md"
                  ]
                )}
              >
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Status chips - wrap on mobile */}
        {currentFilters.statuses.length > 0 && (
          <div className={cn(
            "overflow-x-auto",
            enableAnimations && getAnimationClass('animate-slideInUp animate-delay-200')
          )}>
            <ChipGroup className="flex flex-wrap gap-2">
              {statusChips.filter(chip => chip.selected).map((chip, index) => (
                <Chip
                  key={chip.value}
                  variant="filter"
                  selected={chip.selected}
                  onToggle={() => handleStatusToggle(chip.value)}
                  className={cn(
                    "flex-shrink-0",
                    enableAnimations && enableStaggeredSections && [
                      getAnimationClass('animate-scaleIn'),
                      `animate-delay-${Math.min(index * 100 + 300, 800)}`
                    ]
                  )}
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
    <div className={cn(
      "space-y-4 sm:space-y-6 p-4 sm:p-6 bg-card border border-border rounded-lg",
      enableAnimations ? [
        "transition-all duration-300 ease-out",
        getAnimationClass('animate-fadeIn'),
        "hover:shadow-lg hover:-translate-y-1"
      ] : "transition-colors duration-[var(--duration-normal)]",
      className
    )}>
      {/* Header */}
      <div className={cn(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0",
        enableAnimations && getAnimationClass('animate-slideInDown')
      )}>
        <div className="flex items-center gap-2">
          <Filter className={cn(
            "h-5 w-5 text-muted-foreground",
            enableAnimations && "transition-transform duration-200 hover:rotate-12"
          )} />
          <h3 className="text-lg font-semibold text-card-foreground">Filters</h3>
          {isFiltering && (
            <div className={cn(
              "text-xs text-muted-foreground",
              enableAnimations && getAnimationClass('animate-pulse')
            )}>
              Filtering...
            </div>
          )}
        </div>
        {hasActiveFiltersCheck && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className={cn(
              "w-full sm:w-auto min-h-[44px] gap-2",
              enableAnimations && [
                getAnimationClass('animate-slideInRight'),
                PRESET_ANIMATIONS.BUTTON_HOVER,
                "hover:shadow-md"
              ]
            )}
          >
            <X className="h-4 w-4" />
            Clear All
          </Button>
        )}
      </div>

      {/* Search */}
      <div className={cn(
        enableAnimations && enableStaggeredSections && [
          getAnimationClass('animate-slideInUp'),
          'animate-delay-100'
        ]
      )}>
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
                className={cn(
                  "hover:bg-muted rounded p-1 min-h-[44px] min-w-[44px] flex items-center justify-center",
                  enableAnimations ? [
                    "transition-all duration-200 hover:scale-110 active:scale-95",
                    PRESET_ANIMATIONS.BUTTON_HOVER
                  ] : "transition-colors duration-[var(--duration-normal)]"
                )}
                title="Clear search"
              >
                <X className="h-3 w-3" />
              </button>
            )
          }
        />
      </div>

      {/* Event Types */}
      <div className={cn(
        "relative z-10",
        enableAnimations && enableStaggeredSections && [
          getAnimationClass('animate-slideInUp'),
          'animate-delay-200'
        ]
      )}>
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
      <div className={cn(
        enableAnimations && enableStaggeredSections && [
          getAnimationClass('animate-slideInUp'),
          'animate-delay-300'
        ]
      )}>
        <label className="text-sm font-medium leading-none mb-3 block text-card-foreground">
          Status
        </label>
        <ChipGroup className="flex flex-wrap gap-2">
          {statusChips.map((chip, index) => (
            <Chip
              key={chip.value}
              variant="status"
              selected={chip.selected}
              onToggle={() => handleStatusToggle(chip.value)}
              className={cn(
                "min-h-[44px] px-3 touch-manipulation",
                enableAnimations && [
                  PRESET_ANIMATIONS.FILTER_TOGGLE,
                  "hover:scale-105 transition-all duration-200"
                ],
                enableAnimations && enableStaggeredSections && [
                  getAnimationClass('animate-scaleIn'),
                  `animate-delay-${Math.min(index * 50 + 400, 800)}`
                ]
              )}
            >
              {chip.label}
            </Chip>
          ))}
        </ChipGroup>
      </div>

      {/* Date Range */}
      <div className={cn(
        enableAnimations && enableStaggeredSections && [
          getAnimationClass('animate-slideInUp'),
          'animate-delay-400'
        ]
      )}>
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
      <div className={cn(
        enableAnimations && enableStaggeredSections && [
          getAnimationClass('animate-slideInUp'),
          'animate-delay-500'
        ]
      )}>
        <Input
          label="Location"
          placeholder="Filter by venue or location..."
          value={currentFilters.location || ''}
          onChange={handleLocationChange}
          leftIcon={<MapPin className="h-4 w-4" />}
        />
      </div>

      {/* Advanced Filters with Animation */}
      {advancedFiltersAnimation.shouldRender && (
        <div
          className={cn(
            "space-y-4 sm:space-y-6",
            enableAnimations && animateAdvancedToggle && advancedFiltersAnimation.animationClass
          )}
          style={enableAnimations && animateAdvancedToggle ? advancedFiltersAnimation.animationStyle : undefined}
        >
          {/* Budget Range */}
          <div className={cn(
            enableAnimations && enableStaggeredSections && [
              getAnimationClass('animate-slideInUp'),
              'animate-delay-600'
            ]
          )}>
            <label className="text-sm font-medium leading-none mb-3 block text-card-foreground">
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
          <div className={cn(
            enableAnimations && enableStaggeredSections && [
              getAnimationClass('animate-slideInUp'),
              'animate-delay-700'
            ]
          )}>
            <label className="text-sm font-medium leading-none mb-3 block text-card-foreground">
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
        </div>
      )}

      {/* Filter Summary */}
      {hasActiveFiltersCheck && (
        <div className={cn(
          "pt-3 sm:pt-4 border-t border-border",
          enableAnimations && [
            getAnimationClass('animate-slideInUp animate-delay-800'),
            "transition-all duration-300"
          ]
        )}>
          <div className={cn(
            "text-sm text-muted-foreground",
            enableAnimations && "transition-opacity duration-200"
          )}>
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