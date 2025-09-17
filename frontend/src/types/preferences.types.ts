/**
 * View preferences and UI state types
 */

import { EventFilters } from './event.types'

// View mode options
export type ViewMode = 'grid' | 'list'

// Sorting options for events
export type SortOption = 'date' | 'name' | 'status' | 'guests' | 'budget' | 'created'

// Sort direction
export type SortDirection = 'asc' | 'desc'

// Items per page options
export type ItemsPerPage = 10 | 20 | 50 | 100

// Group by options
export type GroupByOption = 'none' | 'date' | 'type' | 'status'

// View preferences interface
export interface ViewPreferences {
  // Display preferences
  viewMode: ViewMode
  itemsPerPage: ItemsPerPage
  compactMode: boolean
  showFilters: boolean

  // Sorting preferences
  sortBy: SortOption
  sortDirection: SortDirection

  // Grouping preferences
  groupBy: GroupByOption

  // Filter state (persisted)
  filters: EventFilters

  // UI state
  sidebarCollapsed?: boolean
  densityMode?: 'comfortable' | 'compact' | 'spacious'
}

// Default view preferences
export const DEFAULT_VIEW_PREFERENCES: ViewPreferences = {
  viewMode: 'grid',
  itemsPerPage: 20,
  compactMode: false,
  showFilters: true,
  sortBy: 'date',
  sortDirection: 'desc',
  groupBy: 'none',
  filters: {
    search: '',
    types: [],
    statuses: [],
    date_range: {},
    location: '',
    budget_range: {},
    guest_count_range: {}
  },
  sidebarCollapsed: false,
  densityMode: 'comfortable'
}

// Hook options for useViewPreferences
export interface UseViewPreferencesOptions {
  // Storage configuration
  persistToLocalStorage?: boolean
  storageKey?: string

  // URL synchronization
  syncWithUrl?: boolean
  urlParams?: string[]

  // Default preferences override
  defaultPreferences?: Partial<ViewPreferences>

  // Callbacks
  onPreferencesChange?: (preferences: ViewPreferences) => void
  onError?: (error: Error) => void
}

// Return type for useViewPreferences hook
export interface UseViewPreferencesReturn {
  // Current preferences
  preferences: ViewPreferences

  // Preference setters
  setViewMode: (mode: ViewMode) => void
  setItemsPerPage: (count: ItemsPerPage) => void
  setCompactMode: (compact: boolean) => void
  setShowFilters: (show: boolean) => void
  setSortBy: (sort: SortOption) => void
  setSortDirection: (direction: SortDirection) => void
  setGroupBy: (group: GroupByOption) => void
  setFilters: (filters: Partial<EventFilters>) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setDensityMode: (mode: 'comfortable' | 'compact' | 'spacious') => void

  // Bulk operations
  updatePreferences: (updates: Partial<ViewPreferences>) => void
  resetPreferences: () => void

  // State utilities
  isLoading: boolean
  hasUnsavedChanges: boolean

  // Computed values
  isCompactView: boolean
  shouldShowFilters: boolean
  currentSort: { sortBy: SortOption; sortDirection: SortDirection }
}

// Preference validation types
export interface PreferenceValidation {
  isValid: boolean
  errors: string[]
}

// Migration support for preferences
export interface PreferenceMigration {
  version: number
  migrate: (oldPrefs: Record<string, unknown>) => Partial<ViewPreferences>
}

// Event list specific preferences
export interface EventListPreferences extends ViewPreferences {
  // Event-specific display options
  showEventImages: boolean
  showGuestCount: boolean
  showBudgetInfo: boolean
  showStatusBadges: boolean

  // Date formatting preferences
  dateFormat: 'relative' | 'absolute' | 'compact'
  timezone: string
}

// Dashboard section preferences
export interface DashboardPreferences {
  // Section visibility
  sections: {
    quickStats: boolean
    recentActivity: boolean
    upcomingEvents: boolean
    quickActions: boolean
    recentEvents: boolean
  }

  // Section order
  sectionOrder: string[]

  // Section configurations
  upcomingEventsCount: number
  recentActivityCount: number
  recentEventsCount: number

  // Layout preferences
  layout: 'single-column' | 'two-column' | 'three-column'
  cardSize: 'small' | 'medium' | 'large'
}

