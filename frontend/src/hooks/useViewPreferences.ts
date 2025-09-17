'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ViewPreferences,
  DEFAULT_VIEW_PREFERENCES,
  UseViewPreferencesOptions,
  UseViewPreferencesReturn,
  ViewMode,
  SortOption,
  SortDirection,
  ItemsPerPage,
  GroupByOption
} from '@/types/preferences.types'
import { EventFilters } from '@/types/event.types'

// Preference validation
function validatePreferences(prefs: Partial<ViewPreferences>): Partial<ViewPreferences> {
  const validated: Partial<ViewPreferences> = {}

  // Validate viewMode
  if (prefs.viewMode && ['grid', 'list'].includes(prefs.viewMode)) {
    validated.viewMode = prefs.viewMode
  }

  // Validate itemsPerPage
  if (prefs.itemsPerPage && [10, 20, 50, 100].includes(prefs.itemsPerPage)) {
    validated.itemsPerPage = prefs.itemsPerPage
  }

  // Validate boolean fields
  if (typeof prefs.compactMode === 'boolean') {
    validated.compactMode = prefs.compactMode
  }
  if (typeof prefs.showFilters === 'boolean') {
    validated.showFilters = prefs.showFilters
  }
  if (typeof prefs.sidebarCollapsed === 'boolean') {
    validated.sidebarCollapsed = prefs.sidebarCollapsed
  }

  // Validate sortBy
  if (prefs.sortBy && ['date', 'name', 'status', 'guests', 'budget', 'created'].includes(prefs.sortBy)) {
    validated.sortBy = prefs.sortBy
  }

  // Validate sortDirection
  if (prefs.sortDirection && ['asc', 'desc'].includes(prefs.sortDirection)) {
    validated.sortDirection = prefs.sortDirection
  }

  // Validate groupBy
  if (prefs.groupBy && ['none', 'date', 'type', 'status'].includes(prefs.groupBy)) {
    validated.groupBy = prefs.groupBy
  }

  // Validate densityMode
  if (prefs.densityMode && ['comfortable', 'compact', 'spacious'].includes(prefs.densityMode)) {
    validated.densityMode = prefs.densityMode
  }

  // Validate filters
  if (prefs.filters && typeof prefs.filters === 'object') {
    validated.filters = prefs.filters
  }

  return validated
}

// Load preferences from localStorage
function loadPreferencesFromStorage(storageKey: string): Partial<ViewPreferences> {
  if (typeof window === 'undefined') return {}

  try {
    const stored = localStorage.getItem(storageKey)
    if (!stored) return {}

    const parsed = JSON.parse(stored)
    return validatePreferences(parsed)
  } catch (error) {
    console.warn('Failed to load preferences from localStorage:', error)
    return {}
  }
}

// Save preferences to localStorage
function savePreferencesToStorage(preferences: ViewPreferences, storageKey: string): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(storageKey, JSON.stringify(preferences))
  } catch (error) {
    console.warn('Failed to save preferences to localStorage:', error)
  }
}

// Parse preferences from URL
function parsePreferencesFromUrl(searchParams: URLSearchParams): Partial<ViewPreferences> {
  const prefs: Partial<ViewPreferences> = {}

  const viewMode = searchParams.get('view')
  if (viewMode && ['grid', 'list'].includes(viewMode)) {
    prefs.viewMode = viewMode as ViewMode
  }

  const itemsPerPage = searchParams.get('limit')
  if (itemsPerPage) {
    const parsed = parseInt(itemsPerPage, 10)
    if ([10, 20, 50, 100].includes(parsed)) {
      prefs.itemsPerPage = parsed as ItemsPerPage
    }
  }

  const sortBy = searchParams.get('sort')
  if (sortBy && ['date', 'name', 'status', 'guests', 'budget', 'created'].includes(sortBy)) {
    prefs.sortBy = sortBy as SortOption
  }

  const sortDirection = searchParams.get('order')
  if (sortDirection && ['asc', 'desc'].includes(sortDirection)) {
    prefs.sortDirection = sortDirection as SortDirection
  }

  const groupBy = searchParams.get('group')
  if (groupBy && ['none', 'date', 'type', 'status'].includes(groupBy)) {
    prefs.groupBy = groupBy as GroupByOption
  }

  return prefs
}

// Serialize preferences to URL params
function serializePreferencesToUrl(preferences: ViewPreferences): Record<string, string> {
  const params: Record<string, string> = {}

  if (preferences.viewMode !== DEFAULT_VIEW_PREFERENCES.viewMode) {
    params.view = preferences.viewMode
  }

  if (preferences.itemsPerPage !== DEFAULT_VIEW_PREFERENCES.itemsPerPage) {
    params.limit = preferences.itemsPerPage.toString()
  }

  if (preferences.sortBy !== DEFAULT_VIEW_PREFERENCES.sortBy) {
    params.sort = preferences.sortBy
  }

  if (preferences.sortDirection !== DEFAULT_VIEW_PREFERENCES.sortDirection) {
    params.order = preferences.sortDirection
  }

  if (preferences.groupBy !== DEFAULT_VIEW_PREFERENCES.groupBy) {
    params.group = preferences.groupBy
  }

  return params
}

export function useViewPreferences({
  persistToLocalStorage = true,
  storageKey = 'event-view-preferences',
  syncWithUrl = false,
  urlParams = ['view', 'limit', 'sort', 'order', 'group'],
  defaultPreferences = {},
  onPreferencesChange,
  onError
}: UseViewPreferencesOptions = {}): UseViewPreferencesReturn {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize preferences
  const initializePreferences = useCallback((): ViewPreferences => {
    // Priority: URL params > localStorage > defaults
    let preferences = { ...DEFAULT_VIEW_PREFERENCES, ...defaultPreferences }

    // Load from localStorage if enabled
    if (persistToLocalStorage) {
      const stored = loadPreferencesFromStorage(storageKey)
      preferences = { ...preferences, ...stored }
    }

    // Override with URL params if enabled
    if (syncWithUrl && searchParams) {
      const urlPrefs = parsePreferencesFromUrl(searchParams)
      preferences = { ...preferences, ...urlPrefs }
    }

    return preferences
  }, [persistToLocalStorage, storageKey, syncWithUrl, searchParams, defaultPreferences])

  const [preferences, setPreferences] = useState<ViewPreferences>(initializePreferences)
  const [isLoading] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Update preferences function
  const updatePreferences = useCallback((updates: Partial<ViewPreferences>) => {
    const validated = validatePreferences(updates)

    setPreferences(prev => {
      const newPrefs = { ...prev, ...validated }

      // Save to localStorage if enabled
      if (persistToLocalStorage) {
        savePreferencesToStorage(newPrefs, storageKey)
      }

      // Call change callback
      if (onPreferencesChange) {
        try {
          onPreferencesChange(newPrefs)
        } catch (error) {
          if (onError) {
            onError(error as Error)
          } else {
            console.warn('Error in onPreferencesChange callback:', error)
          }
        }
      }

      return newPrefs
    })

    setHasUnsavedChanges(false)
  }, [persistToLocalStorage, storageKey, onPreferencesChange, onError])

  // Sync with URL
  useEffect(() => {
    if (!syncWithUrl) return

    const urlPrefsToSync = serializePreferencesToUrl(preferences)
    const currentUrl = new URL(window.location.href)
    const newSearchParams = new URLSearchParams(currentUrl.search)

    // Remove existing preference params
    urlParams.forEach(param => newSearchParams.delete(param))

    // Add new preference params
    Object.entries(urlPrefsToSync).forEach(([key, value]) => {
      if (value && urlParams.includes(key)) {
        newSearchParams.set(key, value)
      }
    })

    const newUrl = `${currentUrl.pathname}?${newSearchParams.toString()}`
    if (newUrl !== window.location.href) {
      router.replace(newUrl, { scroll: false })
    }
  }, [preferences, syncWithUrl, urlParams, router])

  // Individual preference setters
  const setViewMode = useCallback((mode: ViewMode) => {
    updatePreferences({ viewMode: mode })
  }, [updatePreferences])

  const setItemsPerPage = useCallback((count: ItemsPerPage) => {
    updatePreferences({ itemsPerPage: count })
  }, [updatePreferences])

  const setCompactMode = useCallback((compact: boolean) => {
    updatePreferences({ compactMode: compact })
  }, [updatePreferences])

  const setShowFilters = useCallback((show: boolean) => {
    updatePreferences({ showFilters: show })
  }, [updatePreferences])

  const setSortBy = useCallback((sort: SortOption) => {
    updatePreferences({ sortBy: sort })
  }, [updatePreferences])

  const setSortDirection = useCallback((direction: SortDirection) => {
    updatePreferences({ sortDirection: direction })
  }, [updatePreferences])

  const setGroupBy = useCallback((group: GroupByOption) => {
    updatePreferences({ groupBy: group })
  }, [updatePreferences])

  const setFilters = useCallback((filters: Partial<EventFilters>) => {
    updatePreferences({
      filters: { ...preferences.filters, ...filters }
    })
  }, [updatePreferences, preferences.filters])

  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    updatePreferences({ sidebarCollapsed: collapsed })
  }, [updatePreferences])

  const setDensityMode = useCallback((mode: 'comfortable' | 'compact' | 'spacious') => {
    updatePreferences({ densityMode: mode })
  }, [updatePreferences])

  const resetPreferences = useCallback(() => {
    const resetPrefs = { ...DEFAULT_VIEW_PREFERENCES, ...defaultPreferences }
    setPreferences(resetPrefs)

    if (persistToLocalStorage) {
      savePreferencesToStorage(resetPrefs, storageKey)
    }

    setHasUnsavedChanges(false)
  }, [defaultPreferences, persistToLocalStorage, storageKey])

  // Computed values
  const isCompactView = useMemo(() => {
    return preferences.compactMode || preferences.densityMode === 'compact'
  }, [preferences.compactMode, preferences.densityMode])

  const shouldShowFilters = useMemo(() => {
    return preferences.showFilters
  }, [preferences.showFilters])

  const currentSort = useMemo(() => {
    return {
      sortBy: preferences.sortBy,
      sortDirection: preferences.sortDirection
    }
  }, [preferences.sortBy, preferences.sortDirection])

  return {
    // Current preferences
    preferences,

    // Preference setters
    setViewMode,
    setItemsPerPage,
    setCompactMode,
    setShowFilters,
    setSortBy,
    setSortDirection,
    setGroupBy,
    setFilters,
    setSidebarCollapsed,
    setDensityMode,

    // Bulk operations
    updatePreferences,
    resetPreferences,

    // State utilities
    isLoading,
    hasUnsavedChanges,

    // Computed values
    isCompactView,
    shouldShowFilters,
    currentSort
  }
}