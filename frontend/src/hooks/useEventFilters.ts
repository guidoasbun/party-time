'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { EventType, EventStatus, EventFilters } from '@/types/event.types'

interface UseEventFiltersOptions {
  defaultFilters?: Partial<EventFilters>
  debounceMs?: number
  persistToLocalStorage?: boolean
  syncWithUrl?: boolean
  storageKey?: string
}

interface UseEventFiltersReturn {
  filters: EventFilters
  debouncedFilters: EventFilters
  setSearch: (search: string) => void
  setTypes: (types: EventType[]) => void
  setStatuses: (statuses: EventStatus[]) => void
  setDateRange: (dateRange: { start?: string; end?: string }) => void
  setLocation: (location: string) => void
  setBudgetRange: (budgetRange: { min?: number; max?: number }) => void
  setGuestCountRange: (guestCountRange: { min?: number; max?: number }) => void
  clearFilters: () => void
  clearSearch: () => void
  hasActiveFilters: boolean
  isFiltering: boolean
}

const DEFAULT_FILTERS: EventFilters = {
  types: [],
  statuses: [],
  date_range: {},
  location: '',
  budget_range: {},
  guest_count_range: {}
}

export function useEventFilters({
  defaultFilters = {},
  debounceMs = 500,
  persistToLocalStorage = true,
  syncWithUrl = true,
  storageKey = 'event-filters'
}: UseEventFiltersOptions = {}): UseEventFiltersReturn {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isUpdatingUrlRef = useRef(false)

  // Initialize filters from URL, localStorage, or defaults
  const initializeFilters = (): EventFilters => {
    // Priority: URL params > localStorage > defaults > fallback
    if (syncWithUrl && searchParams) {
      const urlFilters = parseFiltersFromUrl(searchParams)
      if (Object.keys(urlFilters).length > 0) {
        return { ...DEFAULT_FILTERS, ...defaultFilters, ...urlFilters }
      }
    }

    if (persistToLocalStorage && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(storageKey)
        if (stored) {
          const parsedFilters = JSON.parse(stored)
          return { ...DEFAULT_FILTERS, ...defaultFilters, ...parsedFilters }
        }
      } catch (error) {
        console.warn('Failed to parse stored filters:', error)
      }
    }

    return { ...DEFAULT_FILTERS, ...defaultFilters }
  }

  const [filters, setFilters] = useState<EventFilters>(() => initializeFilters())
  const [debouncedFilters, setDebouncedFilters] = useState<EventFilters>(() => initializeFilters())
  const [isFiltering, setIsFiltering] = useState(false)

  // Debounce filter changes
  useEffect(() => {
    setIsFiltering(true)
    const timeoutId = setTimeout(() => {
      setDebouncedFilters(filters)
      setIsFiltering(false)
    }, debounceMs)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [filters, debounceMs])

  // Persist to localStorage
  useEffect(() => {
    if (persistToLocalStorage && typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(filters))
      } catch (error) {
        console.warn('Failed to save filters to localStorage:', error)
      }
    }
  }, [filters, persistToLocalStorage, storageKey])

  // Sync with URL (use debouncedFilters to avoid too many URL updates)
  useEffect(() => {
    if (syncWithUrl && typeof window !== 'undefined' && !isUpdatingUrlRef.current) {
      const urlParams = serializeFiltersToUrl(debouncedFilters)
      const currentUrl = new URL(window.location.href)

      // Update search params
      const newSearchParams = new URLSearchParams(currentUrl.search)

      // Get current filter params to compare
      const currentFilterParams: Record<string, string> = {}
      const filterKeys = ['search', 'types', 'statuses', 'date_start', 'date_end', 'location', 'budget_min', 'budget_max', 'guests_min', 'guests_max']
      filterKeys.forEach(key => {
        const value = newSearchParams.get(key)
        if (value) currentFilterParams[key] = value
      })

      // Check if filters have actually changed
      const hasChanged = Object.keys(urlParams).length !== Object.keys(currentFilterParams).length ||
        Object.entries(urlParams).some(([key, value]) => currentFilterParams[key] !== value)

      if (!hasChanged) return

      // Clear existing filter params
      filterKeys.forEach(key => newSearchParams.delete(key))

      // Add new filter params
      Object.entries(urlParams).forEach(([key, value]) => {
        if (value) {
          newSearchParams.set(key, value)
        }
      })

      const newUrl = `${currentUrl.pathname}?${newSearchParams.toString()}`

      isUpdatingUrlRef.current = true
      router.replace(newUrl, { scroll: false })
      // Reset the flag after a short delay
      setTimeout(() => {
        isUpdatingUrlRef.current = false
      }, 100)
    }
  }, [debouncedFilters, syncWithUrl, router])

  // Filter update functions
  const setSearch = useCallback((search: string) => {
    setFilters(prev => ({ ...prev, search: search.trim() }))
  }, [])

  const setTypes = useCallback((types: EventType[]) => {
    setFilters(prev => ({ ...prev, types }))
  }, [])

  const setStatuses = useCallback((statuses: EventStatus[]) => {
    setFilters(prev => ({ ...prev, statuses }))
  }, [])

  const setDateRange = useCallback((date_range: { start?: string; end?: string }) => {
    setFilters(prev => ({ ...prev, date_range }))
  }, [])

  const setLocation = useCallback((location: string) => {
    setFilters(prev => ({ ...prev, location: location.trim() }))
  }, [])

  const setBudgetRange = useCallback((budget_range: { min?: number; max?: number }) => {
    setFilters(prev => ({ ...prev, budget_range }))
  }, [])

  const setGuestCountRange = useCallback((guest_count_range: { min?: number; max?: number }) => {
    setFilters(prev => ({ ...prev, guest_count_range }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
  }, [])

  const clearSearch = useCallback(() => {
    setFilters(prev => ({ ...prev, search: '' }))
  }, [])

  // Check if there are active filters
  const hasActiveFilters = useMemo(() => {
    return (
      !!filters.search ||
      filters.types.length > 0 ||
      filters.statuses.length > 0 ||
      !!filters.date_range.start ||
      !!filters.date_range.end ||
      !!filters.location ||
      !!filters.budget_range?.min ||
      !!filters.budget_range?.max ||
      !!filters.guest_count_range?.min ||
      !!filters.guest_count_range?.max
    )
  }, [filters])

  return {
    filters: { ...filters, search: filters.search || '' },
    debouncedFilters: { ...debouncedFilters, search: debouncedFilters.search || '' },
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
  }
}

// Helper function to parse filters from URL search params
function parseFiltersFromUrl(searchParams: URLSearchParams): Partial<EventFilters> {
  const filters: Partial<EventFilters> = {}

  const search = searchParams.get('search')
  if (search) filters.search = search

  const types = searchParams.get('types')
  if (types) {
    try {
      filters.types = types.split(',').filter(type =>
        Object.values(EventType).includes(type as EventType)
      ) as EventType[]
    } catch (error) {
      console.warn('Failed to parse types from URL:', error)
    }
  }

  const statuses = searchParams.get('statuses')
  if (statuses) {
    try {
      filters.statuses = statuses.split(',').filter(status =>
        Object.values(EventStatus).includes(status as EventStatus)
      ) as EventStatus[]
    } catch (error) {
      console.warn('Failed to parse statuses from URL:', error)
    }
  }

  const dateStart = searchParams.get('date_start')
  const dateEnd = searchParams.get('date_end')
  if (dateStart || dateEnd) {
    filters.date_range = {
      start: dateStart || undefined,
      end: dateEnd || undefined
    }
  }

  const location = searchParams.get('location')
  if (location) filters.location = location

  const budgetMin = searchParams.get('budget_min')
  const budgetMax = searchParams.get('budget_max')
  if (budgetMin || budgetMax) {
    filters.budget_range = {
      min: budgetMin ? Number(budgetMin) : undefined,
      max: budgetMax ? Number(budgetMax) : undefined
    }
  }

  const guestsMin = searchParams.get('guests_min')
  const guestsMax = searchParams.get('guests_max')
  if (guestsMin || guestsMax) {
    filters.guest_count_range = {
      min: guestsMin ? Number(guestsMin) : undefined,
      max: guestsMax ? Number(guestsMax) : undefined
    }
  }

  return filters
}

// Helper function to serialize filters to URL search params
function serializeFiltersToUrl(filters: EventFilters): Record<string, string> {
  const params: Record<string, string> = {}

  if (filters.search?.trim()) {
    params.search = filters.search.trim()
  }

  if (filters.types.length > 0) {
    params.types = filters.types.join(',')
  }

  if (filters.statuses.length > 0) {
    params.statuses = filters.statuses.join(',')
  }

  if (filters.date_range.start) {
    params.date_start = filters.date_range.start
  }

  if (filters.date_range.end) {
    params.date_end = filters.date_range.end
  }

  if (filters.location?.trim()) {
    params.location = filters.location.trim()
  }

  if (filters.budget_range?.min !== undefined) {
    params.budget_min = filters.budget_range.min.toString()
  }

  if (filters.budget_range?.max !== undefined) {
    params.budget_max = filters.budget_range.max.toString()
  }

  if (filters.guest_count_range?.min !== undefined) {
    params.guests_min = filters.guest_count_range.min.toString()
  }

  if (filters.guest_count_range?.max !== undefined) {
    params.guests_max = filters.guest_count_range.max.toString()
  }

  return params
}