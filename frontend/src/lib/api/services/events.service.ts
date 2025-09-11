/**
 * Events service module
 */

import { api, withRetry } from '@/lib/api-client'
import { 
  Event,
  EventCreate,
  EventUpdate,
  EventSummary,
  EventWithDetails,
  EventSearchParams,
  EventDashboard,
  EventAnalytics,
  EventStats,
  ListQueryParams,
  PaginatedResponse,
  UUID,
  API_ENDPOINTS
} from '@/types'

/**
 * Events service class with typed methods
 */
export class EventsService {
  /**
   * Get all events for the current user
   */
  async getEvents(params?: EventSearchParams): Promise<PaginatedResponse<EventSummary>> {
    return api.get<PaginatedResponse<EventSummary>>(
      API_ENDPOINTS.EVENTS.LIST,
      params,
      withRetry({ attempts: 2 })
    )
  }

  /**
   * Get a single event by ID
   */
  async getEvent(eventId: UUID): Promise<Event> {
    return api.get<Event>(
      API_ENDPOINTS.EVENTS.GET(eventId),
      undefined,
      withRetry({ attempts: 2 })
    )
  }

  /**
   * Get event with detailed information (guests, budget, etc.)
   */
  async getEventWithDetails(eventId: UUID): Promise<EventWithDetails> {
    return api.get<EventWithDetails>(
      API_ENDPOINTS.EVENTS.GET(eventId),
      { include_details: true },
      withRetry({ attempts: 2 })
    )
  }

  /**
   * Create a new event
   */
  async createEvent(data: EventCreate): Promise<Event> {
    return api.post<Event, EventCreate>(
      API_ENDPOINTS.EVENTS.CREATE,
      data
    )
  }

  /**
   * Update an existing event
   */
  async updateEvent(eventId: UUID, data: EventUpdate): Promise<Event> {
    return api.patch<Event, EventUpdate>(
      API_ENDPOINTS.EVENTS.UPDATE(eventId),
      data
    )
  }

  /**
   * Delete an event
   */
  async deleteEvent(eventId: UUID): Promise<{ message: string }> {
    return api.delete<{ message: string }>(
      API_ENDPOINTS.EVENTS.DELETE(eventId)
    )
  }

  /**
   * Get event summary with statistics
   */
  async getEventSummary(eventId: UUID): Promise<EventDashboard> {
    return api.get<EventDashboard>(
      API_ENDPOINTS.EVENTS.SUMMARY(eventId),
      undefined,
      withRetry({ attempts: 2 })
    )
  }

  /**
   * Get events statistics for the current user
   */
  async getEventsStats(): Promise<EventStats> {
    return api.get<EventStats>(
      `${API_ENDPOINTS.EVENTS.LIST}/stats`,
      undefined,
      withRetry({ attempts: 2 })
    )
  }

  /**
   * Get event analytics data
   */
  async getEventAnalytics(eventId: UUID): Promise<EventAnalytics> {
    return api.get<EventAnalytics>(
      `${API_ENDPOINTS.EVENTS.GET(eventId)}/analytics`,
      undefined,
      withRetry({ attempts: 2 })
    )
  }

  /**
   * Duplicate an existing event
   */
  async duplicateEvent(eventId: UUID, newName?: string): Promise<Event> {
    return api.post<Event, { name?: string }>(
      `${API_ENDPOINTS.EVENTS.GET(eventId)}/duplicate`,
      { name: newName }
    )
  }

  /**
   * Archive an event
   */
  async archiveEvent(eventId: UUID): Promise<Event> {
    return api.patch<Event, { status: string }>(
      API_ENDPOINTS.EVENTS.UPDATE(eventId),
      { status: 'completed' }
    )
  }

  /**
   * Cancel an event
   */
  async cancelEvent(eventId: UUID, reason?: string): Promise<Event> {
    return api.patch<Event, { status: string; cancellation_reason?: string }>(
      API_ENDPOINTS.EVENTS.UPDATE(eventId),
      { 
        status: 'cancelled',
        cancellation_reason: reason
      }
    )
  }

  /**
   * Publish an event (make it public)
   */
  async publishEvent(eventId: UUID): Promise<Event> {
    return api.patch<Event, { is_public: boolean }>(
      API_ENDPOINTS.EVENTS.UPDATE(eventId),
      { is_public: true }
    )
  }

  /**
   * Unpublish an event (make it private)
   */
  async unpublishEvent(eventId: UUID): Promise<Event> {
    return api.patch<Event, { is_public: boolean }>(
      API_ENDPOINTS.EVENTS.UPDATE(eventId),
      { is_public: false }
    )
  }

  /**
   * Search events
   */
  async searchEvents(query: string, params?: ListQueryParams): Promise<PaginatedResponse<EventSummary>> {
    return api.get<PaginatedResponse<EventSummary>>(
      API_ENDPOINTS.EVENTS.LIST,
      { search: query, ...params },
      withRetry({ attempts: 2 })
    )
  }

  /**
   * Get upcoming events
   */
  async getUpcomingEvents(limit: number = 10): Promise<EventSummary[]> {
    const now = new Date().toISOString()
    const response = await api.get<PaginatedResponse<EventSummary>>(
      API_ENDPOINTS.EVENTS.LIST,
      {
        start_date_from: now,
        sort_by: 'start_date',
        sort_order: 'asc',
        limit
      },
      withRetry({ attempts: 2 })
    )
    return response.items
  }

  /**
   * Get recent events
   */
  async getRecentEvents(limit: number = 5): Promise<EventSummary[]> {
    const response = await api.get<PaginatedResponse<EventSummary>>(
      API_ENDPOINTS.EVENTS.LIST,
      {
        sort_by: 'created_at',
        sort_order: 'desc',
        limit
      },
      withRetry({ attempts: 2 })
    )
    return response.items
  }

  /**
   * Get events by status
   */
  async getEventsByStatus(status: string, params?: ListQueryParams): Promise<PaginatedResponse<EventSummary>> {
    return api.get<PaginatedResponse<EventSummary>>(
      API_ENDPOINTS.EVENTS.LIST,
      { status: [status], ...params },
      withRetry({ attempts: 2 })
    )
  }

  /**
   * Get events by type
   */
  async getEventsByType(type: string, params?: ListQueryParams): Promise<PaginatedResponse<EventSummary>> {
    return api.get<PaginatedResponse<EventSummary>>(
      API_ENDPOINTS.EVENTS.LIST,
      { type: [type], ...params },
      withRetry({ attempts: 2 })
    )
  }

  /**
   * Export event data
   */
  async exportEvent(
    eventId: UUID, 
    format: 'pdf' | 'excel' | 'csv',
    _options?: {
      include_guests?: boolean
      include_budget?: boolean
      include_timeline?: boolean
    }
  ): Promise<void> {
    return api.download(
      `${API_ENDPOINTS.EVENTS.GET(eventId)}/export`,
      `event-${eventId}.${format}`,
      {
        requestId: `export-event-${eventId}-${format}`
      }
    )
  }

  /**
   * Import event data
   */
  async importEvent(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<Event> {
    return api.upload<Event>(
      `${API_ENDPOINTS.EVENTS.LIST}/import`,
      file,
      onProgress
    )
  }

  /**
   * Share event
   */
  async shareEvent(
    eventId: UUID,
    data: {
      email: string
      permission_level: 'view' | 'edit' | 'admin'
      message?: string
    }
  ): Promise<{ message: string }> {
    return api.post<{ message: string }, typeof data>(
      `${API_ENDPOINTS.EVENTS.GET(eventId)}/share`,
      data
    )
  }

  /**
   * Get event sharing information
   */
  async getEventShares(eventId: UUID): Promise<Array<{
    email: string
    permission_level: string
    shared_at: string
    accepted_at?: string
  }>> {
    return api.get<Array<{
      email: string
      permission_level: string
      shared_at: string
      accepted_at?: string
    }>>(
      `${API_ENDPOINTS.EVENTS.GET(eventId)}/shares`
    )
  }

  /**
   * Remove event share
   */
  async removeEventShare(eventId: UUID, email: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(
      `${API_ENDPOINTS.EVENTS.GET(eventId)}/shares/${encodeURIComponent(email)}`
    )
  }

  /**
   * Validate event data
   */
  validateEventData(data: EventCreate | EventUpdate): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    // Name validation
    if ('name' in data && data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        errors.push('Event name is required')
      } else if (data.name.length > 255) {
        errors.push('Event name must be 255 characters or less')
      }
    }

    // Date validation
    if ('start_date' in data && data.start_date !== undefined) {
      const startDate = new Date(data.start_date)
      if (isNaN(startDate.getTime())) {
        errors.push('Invalid start date')
      } else if (startDate < new Date()) {
        errors.push('Start date cannot be in the past')
      }
    }

    if ('end_date' in data && data.end_date !== undefined && 'start_date' in data && data.start_date !== undefined) {
      const startDate = new Date(data.start_date)
      const endDate = new Date(data.end_date)
      
      if (!isNaN(endDate.getTime()) && endDate <= startDate) {
        errors.push('End date must be after start date')
      }
    }

    // Guest count validation
    if ('max_guests' in data && data.max_guests !== undefined) {
      if (data.max_guests <= 0) {
        errors.push('Maximum guests must be greater than 0')
      }
    }

    // Budget validation
    if ('budget_total' in data && data.budget_total !== undefined) {
      if (data.budget_total < 0) {
        errors.push('Budget total cannot be negative')
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Calculate event progress
   */
  calculateEventProgress(event: EventWithDetails): number {
    let completed = 0
    let total = 0

    // Basic info completion
    total += 5
    if (event.name) completed++
    if (event.description) completed++
    if (event.start_date) completed++
    if (event.venue_name || event.location) completed++
    if (event.budget_total) completed++

    // Guest management
    total += 2
    if (event.guest_count > 0) completed++
    if (event.confirmed_guests > 0) completed++

    // Budget setup
    total += 2
    if (event.budget_categories.length > 0) completed++
    if (event.recent_expenses.length > 0) completed++

    return Math.round((completed / total) * 100)
  }

  /**
   * Get event status color
   */
  getEventStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
      draft: '#6B7280',      // gray
      planning: '#F59E0B',   // amber
      confirmed: '#10B981',  // emerald
      in_progress: '#3B82F6', // blue
      completed: '#059669',   // green
      cancelled: '#EF4444',   // red
      postponed: '#F97316'    // orange
    }
    return statusColors[status] || '#6B7280'
  }

  /**
   * Get event type icon
   */
  getEventTypeIcon(type: string): string {
    const typeIcons: Record<string, string> = {
      wedding: '💒',
      birthday: '🎂',
      anniversary: '💕',
      graduation: '🎓',
      baby_shower: '👶',
      bridal_shower: '👰',
      corporate: '🏢',
      conference: '🏛️',
      workshop: '🔧',
      fundraiser: '💰',
      holiday_party: '🎄',
      reunion: '👥',
      other: '📅'
    }
    return typeIcons[type] || '📅'
  }
}

// Create singleton instance
export const eventsService = new EventsService()

// Export default instance
export default eventsService