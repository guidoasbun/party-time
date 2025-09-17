/**
 * Tests for useViewPreferences hook
 */

import { renderHook, act } from '@testing-library/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ReadonlyURLSearchParams } from 'next/navigation'
import { useViewPreferences } from '../useViewPreferences'
import {
  DEFAULT_VIEW_PREFERENCES,
  ViewMode,
  SortOption,
  ItemsPerPage
} from '@/types/preferences.types'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn()
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockUseSearchParams = useSearchParams as jest.MockedFunction<typeof useSearchParams>

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock router
const mockRouter = {
  replace: jest.fn(),
  push: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn()
}

// Mock URLSearchParams with proper interface
const mockSearchParams = {
  get: jest.fn(),
  has: jest.fn(() => false),
  getAll: jest.fn(() => []),
  keys: jest.fn(),
  values: jest.fn(),
  entries: jest.fn(),
  forEach: jest.fn(),
  append: jest.fn(),
  delete: jest.fn(),
  set: jest.fn(),
  sort: jest.fn(),
  toString: jest.fn(() => ''),
  size: 0,
  [Symbol.iterator]: jest.fn()
}

describe('useViewPreferences', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    mockUseRouter.mockReturnValue(mockRouter)
    mockUseSearchParams.mockReturnValue(mockSearchParams as ReadonlyURLSearchParams)
    mockSearchParams.get.mockReturnValue(null)
  })

  describe('initialization', () => {
    it('should initialize with default preferences', () => {
      const { result } = renderHook(() => useViewPreferences())

      expect(result.current.preferences).toEqual(DEFAULT_VIEW_PREFERENCES)
    })

    it('should merge default preferences with custom defaults', () => {
      const customDefaults = {
        viewMode: 'list' as ViewMode,
        itemsPerPage: 50 as ItemsPerPage
      }

      const { result } = renderHook(() =>
        useViewPreferences({ defaultPreferences: customDefaults })
      )

      expect(result.current.preferences.viewMode).toBe('list')
      expect(result.current.preferences.itemsPerPage).toBe(50)
      expect(result.current.preferences.sortBy).toBe(DEFAULT_VIEW_PREFERENCES.sortBy)
    })

    it('should load preferences from localStorage when available', () => {
      const storedPrefs = {
        viewMode: 'list',
        itemsPerPage: 50,
        sortBy: 'name'
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(storedPrefs))

      const { result } = renderHook(() => useViewPreferences())

      expect(result.current.preferences.viewMode).toBe('list')
      expect(result.current.preferences.itemsPerPage).toBe(50)
      expect(result.current.preferences.sortBy).toBe('name')
    })

    it('should handle invalid localStorage data gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid json')

      const { result } = renderHook(() => useViewPreferences())

      expect(result.current.preferences).toEqual(DEFAULT_VIEW_PREFERENCES)
    })

    it('should override with URL parameters when enabled', () => {
      mockSearchParams.get.mockImplementation((param: string) => {
        switch (param) {
          case 'view': return 'list'
          case 'sort': return 'name'
          case 'order': return 'asc'
          default: return null
        }
      })

      const { result } = renderHook(() =>
        useViewPreferences({ syncWithUrl: true })
      )

      expect(result.current.preferences.viewMode).toBe('list')
      expect(result.current.preferences.sortBy).toBe('name')
      expect(result.current.preferences.sortDirection).toBe('asc')
    })
  })

  describe('preference updates', () => {
    it('should update view mode', () => {
      const { result } = renderHook(() => useViewPreferences())

      act(() => {
        result.current.setViewMode('list')
      })

      expect(result.current.preferences.viewMode).toBe('list')
    })

    it('should update items per page', () => {
      const { result } = renderHook(() => useViewPreferences())

      act(() => {
        result.current.setItemsPerPage(50)
      })

      expect(result.current.preferences.itemsPerPage).toBe(50)
    })

    it('should update sort preferences', () => {
      const { result } = renderHook(() => useViewPreferences())

      act(() => {
        result.current.setSortBy('name')
        result.current.setSortDirection('asc')
      })

      expect(result.current.preferences.sortBy).toBe('name')
      expect(result.current.preferences.sortDirection).toBe('asc')
    })

    it('should update filters', () => {
      const { result } = renderHook(() => useViewPreferences())

      act(() => {
        result.current.setFilters({ search: 'test event' })
      })

      expect(result.current.preferences.filters.search).toBe('test event')
    })

    it('should update multiple preferences at once', () => {
      const { result } = renderHook(() => useViewPreferences())

      act(() => {
        result.current.updatePreferences({
          viewMode: 'list',
          itemsPerPage: 50,
          sortBy: 'name'
        })
      })

      expect(result.current.preferences.viewMode).toBe('list')
      expect(result.current.preferences.itemsPerPage).toBe(50)
      expect(result.current.preferences.sortBy).toBe('name')
    })
  })

  describe('localStorage persistence', () => {
    it('should save preferences to localStorage by default', () => {
      const { result } = renderHook(() => useViewPreferences())

      act(() => {
        result.current.setViewMode('list')
      })

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'event-view-preferences',
        expect.stringContaining('"viewMode":"list"')
      )
    })

    it('should use custom storage key', () => {
      const { result } = renderHook(() =>
        useViewPreferences({ storageKey: 'custom-prefs' })
      )

      act(() => {
        result.current.setViewMode('list')
      })

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'custom-prefs',
        expect.any(String)
      )
    })

    it('should not persist when disabled', () => {
      const { result } = renderHook(() =>
        useViewPreferences({ persistToLocalStorage: false })
      )

      act(() => {
        result.current.setViewMode('list')
      })

      expect(localStorageMock.setItem).not.toHaveBeenCalled()
    })
  })

  describe('computed values', () => {
    it('should calculate isCompactView correctly', () => {
      const { result } = renderHook(() => useViewPreferences())

      expect(result.current.isCompactView).toBe(false)

      act(() => {
        result.current.setCompactMode(true)
      })

      expect(result.current.isCompactView).toBe(true)

      act(() => {
        result.current.setCompactMode(false)
        result.current.setDensityMode('compact')
      })

      expect(result.current.isCompactView).toBe(true)
    })

    it('should provide current sort information', () => {
      const { result } = renderHook(() => useViewPreferences())

      expect(result.current.currentSort).toEqual({
        sortBy: 'date',
        sortDirection: 'desc'
      })

      act(() => {
        result.current.setSortBy('name')
        result.current.setSortDirection('asc')
      })

      expect(result.current.currentSort).toEqual({
        sortBy: 'name',
        sortDirection: 'asc'
      })
    })

    it('should reflect filter visibility state', () => {
      const { result } = renderHook(() => useViewPreferences())

      expect(result.current.shouldShowFilters).toBe(true)

      act(() => {
        result.current.setShowFilters(false)
      })

      expect(result.current.shouldShowFilters).toBe(false)
    })
  })

  describe('reset functionality', () => {
    it('should reset preferences to defaults', () => {
      const { result } = renderHook(() => useViewPreferences())

      // Change some preferences
      act(() => {
        result.current.setViewMode('list')
        result.current.setSortBy('name')
        result.current.setItemsPerPage(50)
      })

      // Verify changes
      expect(result.current.preferences.viewMode).toBe('list')
      expect(result.current.preferences.sortBy).toBe('name')
      expect(result.current.preferences.itemsPerPage).toBe(50)

      // Reset
      act(() => {
        result.current.resetPreferences()
      })

      // Verify reset
      expect(result.current.preferences).toEqual(DEFAULT_VIEW_PREFERENCES)
    })

    it('should reset to custom defaults when provided', () => {
      const customDefaults = {
        viewMode: 'list' as ViewMode,
        sortBy: 'name' as SortOption
      }

      const { result } = renderHook(() =>
        useViewPreferences({ defaultPreferences: customDefaults })
      )

      // Change preferences
      act(() => {
        result.current.setViewMode('grid')
        result.current.setSortBy('date')
      })

      // Reset
      act(() => {
        result.current.resetPreferences()
      })

      // Should reset to custom defaults
      expect(result.current.preferences.viewMode).toBe('list')
      expect(result.current.preferences.sortBy).toBe('name')
    })
  })

  describe('callbacks', () => {
    it('should call onPreferencesChange when preferences update', () => {
      const onPreferencesChange = jest.fn()
      const { result } = renderHook(() =>
        useViewPreferences({ onPreferencesChange })
      )

      act(() => {
        result.current.setViewMode('list')
      })

      expect(onPreferencesChange).toHaveBeenCalledWith(
        expect.objectContaining({ viewMode: 'list' })
      )
    })

    it('should call onError when callback throws', () => {
      const onError = jest.fn()
      const onPreferencesChange = jest.fn(() => {
        throw new Error('Test error')
      })

      const { result } = renderHook(() =>
        useViewPreferences({ onPreferencesChange, onError })
      )

      act(() => {
        result.current.setViewMode('list')
      })

      expect(onError).toHaveBeenCalledWith(expect.any(Error))
    })
  })

  describe('validation', () => {
    it('should validate view mode values', () => {
      const { result } = renderHook(() => useViewPreferences())

      act(() => {
        result.current.updatePreferences({ viewMode: 'invalid' as ViewMode })
      })

      // Should not update with invalid value
      expect(result.current.preferences.viewMode).toBe(DEFAULT_VIEW_PREFERENCES.viewMode)
    })

    it('should validate items per page values', () => {
      const { result } = renderHook(() => useViewPreferences())

      act(() => {
        result.current.updatePreferences({ itemsPerPage: 15 as ItemsPerPage })
      })

      // Should not update with invalid value
      expect(result.current.preferences.itemsPerPage).toBe(DEFAULT_VIEW_PREFERENCES.itemsPerPage)
    })

    it('should validate sort options', () => {
      const { result } = renderHook(() => useViewPreferences())

      act(() => {
        result.current.updatePreferences({ sortBy: 'invalid' as SortOption })
      })

      // Should not update with invalid value
      expect(result.current.preferences.sortBy).toBe(DEFAULT_VIEW_PREFERENCES.sortBy)
    })
  })
})