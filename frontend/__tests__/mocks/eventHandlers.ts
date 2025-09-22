/**
 * MSW handlers for events API endpoints
 */

import { http, HttpResponse } from 'msw'
import {
  mockEvents,
  mockEventStats,
  mockDashboardStats,
  mockRecentActivity,
  createMockEvent,
  createMockEventSummary,
  createMockEventAnalytics,
  createMockPaginatedResponse,
  getMockUpcomingEvents,
  mockApiError,
  mockNotFoundError,
  mockValidationError,
  mockUnauthorizedError,
} from './eventData'
import { EventCreate, EventUpdate, EventSearchParams, EventType, EventStatus } from '@/types'

const API_BASE_URL = 'http://localhost:8000'

// Helper function to simulate network delay
const delay = (ms: number = 100) => new Promise(resolve => setTimeout(resolve, ms))

// Helper function to filter events based on search params
const filterEvents = (events: typeof mockEvents, params: EventSearchParams) => {
  let filtered = [...events]

  if (params.search) {
    const searchLower = params.search.toLowerCase()
    filtered = filtered.filter(event =>
      event.name.toLowerCase().includes(searchLower) ||
      event.venue_name?.toLowerCase().includes(searchLower) ||
      event.planner_name.toLowerCase().includes(searchLower)
    )
  }

  if (params.type && Array.isArray(params.type)) {
    filtered = filtered.filter(event => params.type!.includes(event.type))
  }

  if (params.status && Array.isArray(params.status)) {
    filtered = filtered.filter(event => params.status!.includes(event.status))
  }

  if (params.start_date_from) {
    filtered = filtered.filter(event =>
      new Date(event.start_date) >= new Date(params.start_date_from!)
    )
  }

  if (params.start_date_to) {
    filtered = filtered.filter(event =>
      new Date(event.start_date) <= new Date(params.start_date_to!)
    )
  }

  if (params.location) {
    const locationLower = params.location.toLowerCase()
    filtered = filtered.filter(event =>
      event.venue_name?.toLowerCase().includes(locationLower)
    )
  }

  return filtered
}

export const eventHandlers = [
  // GET /api/v1/events - List events with pagination and filters
  http.get(`${API_BASE_URL}/api/v1/events`, async ({ request }) => {
    await delay()

    const url = new URL(request.url)
    const params: EventSearchParams = {
      page: parseInt(url.searchParams.get('page') || '1'),
      limit: parseInt(url.searchParams.get('limit') || '10'),
      search: url.searchParams.get('search') || undefined,
      type: url.searchParams.getAll('type') as EventType[] || undefined,
      status: url.searchParams.getAll('status') as EventStatus[] || undefined,
      start_date_from: url.searchParams.get('start_date_from') || undefined,
      start_date_to: url.searchParams.get('start_date_to') || undefined,
      location: url.searchParams.get('location') || undefined,
    }

    // Check for test scenarios
    if (params.search === 'network-error') {
      return HttpResponse.json(mockApiError.data, { status: mockApiError.status })
    }

    if (params.search === 'unauthorized') {
      return HttpResponse.json(mockUnauthorizedError.data, { status: mockUnauthorizedError.status })
    }

    // Check authentication
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(mockUnauthorizedError.data, { status: mockUnauthorizedError.status })
    }

    const filteredEvents = filterEvents(mockEvents, params)
    const paginatedResponse = createMockPaginatedResponse(
      filteredEvents,
      params.page || 1,
      params.limit || 10
    )

    return HttpResponse.json(paginatedResponse)
  }),

  // GET /api/v1/events/:id - Get single event
  http.get(`${API_BASE_URL}/api/v1/events/:id`, async ({ params, request }) => {
    await delay()

    const { id } = params as { id: string }

    // Check authentication
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(mockUnauthorizedError.data, { status: mockUnauthorizedError.status })
    }

    // Test scenarios
    if (id === 'not-found') {
      return HttpResponse.json(mockNotFoundError.data, { status: mockNotFoundError.status })
    }

    if (id === 'server-error') {
      return HttpResponse.json(mockApiError.data, { status: mockApiError.status })
    }

    const mockEventSummary = mockEvents.find(event => event.id === id)
    if (!mockEventSummary) {
      return HttpResponse.json(mockNotFoundError.data, { status: mockNotFoundError.status })
    }

    // Convert EventSummary to full Event
    const fullEvent = createMockEvent({
      id: mockEventSummary.id,
      name: mockEventSummary.name,
      type: mockEventSummary.type,
      status: mockEventSummary.status,
      start_date: mockEventSummary.start_date,
      venue_name: mockEventSummary.venue_name,
      guest_count: mockEventSummary.guest_count,
      confirmed_guests: mockEventSummary.confirmed_guests,
      budget_total: mockEventSummary.budget_total,
      total_expenses: mockEventSummary.total_expenses,
    })

    return HttpResponse.json(fullEvent)
  }),

  // POST /api/v1/events - Create event
  http.post(`${API_BASE_URL}/api/v1/events`, async ({ request }) => {
    await delay()

    // Check authentication
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(mockUnauthorizedError.data, { status: mockUnauthorizedError.status })
    }

    const body = await request.json() as EventCreate

    // Validation
    if (!body.name) {
      return HttpResponse.json(mockValidationError.data, { status: mockValidationError.status })
    }

    // Test scenarios
    if (body.name === 'trigger-error') {
      return HttpResponse.json(mockApiError.data, { status: mockApiError.status })
    }

    const newEvent = createMockEvent({
      id: `event-${Date.now()}`,
      name: body.name,
      description: body.description,
      type: body.type,
      status: body.status || EventStatus.DRAFT,
      start_date: body.start_date,
      end_date: body.end_date,
      location: body.location,
      venue_name: body.venue_name,
      venue_address: body.venue_address,
      venue_google_place_id: body.venue_google_place_id,
      max_guests: body.max_guests,
      budget_total: body.budget_total,
      is_public: body.is_public,
    })

    return HttpResponse.json(newEvent, { status: 201 })
  }),

  // PATCH /api/v1/events/:id - Update event
  http.patch(`${API_BASE_URL}/api/v1/events/:id`, async ({ params, request }) => {
    await delay()

    const { id } = params as { id: string }

    // Check authentication
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(mockUnauthorizedError.data, { status: mockUnauthorizedError.status })
    }

    const body = await request.json() as EventUpdate

    // Test scenarios
    if (id === 'not-found') {
      return HttpResponse.json(mockNotFoundError.data, { status: mockNotFoundError.status })
    }

    if (body.name === 'trigger-error') {
      return HttpResponse.json(mockApiError.data, { status: mockApiError.status })
    }

    const existingEvent = mockEvents.find(event => event.id === id)
    if (!existingEvent) {
      return HttpResponse.json(mockNotFoundError.data, { status: mockNotFoundError.status })
    }

    const updatedEvent = createMockEvent({
      ...existingEvent,
      ...body,
      id,
      updated_at: new Date().toISOString(),
    })

    return HttpResponse.json(updatedEvent)
  }),

  // DELETE /api/v1/events/:id - Delete event
  http.delete(`${API_BASE_URL}/api/v1/events/:id`, async ({ params, request }) => {
    await delay()

    const { id } = params as { id: string }

    // Check authentication
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(mockUnauthorizedError.data, { status: mockUnauthorizedError.status })
    }

    // Test scenarios
    if (id === 'not-found') {
      return HttpResponse.json(mockNotFoundError.data, { status: mockNotFoundError.status })
    }

    if (id === 'server-error') {
      return HttpResponse.json(mockApiError.data, { status: mockApiError.status })
    }

    const existingEvent = mockEvents.find(event => event.id === id)
    if (!existingEvent) {
      return HttpResponse.json(mockNotFoundError.data, { status: mockNotFoundError.status })
    }

    return HttpResponse.json({ message: 'Event deleted successfully' })
  }),

  // POST /api/v1/events/:id/duplicate - Duplicate event
  http.post(`${API_BASE_URL}/api/v1/events/:id/duplicate`, async ({ params, request }) => {
    await delay()

    const { id } = params as { id: string }

    // Check authentication
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(mockUnauthorizedError.data, { status: mockUnauthorizedError.status })
    }

    // Test scenarios
    if (id === 'not-found') {
      return HttpResponse.json(mockNotFoundError.data, { status: mockNotFoundError.status })
    }

    const existingEvent = mockEvents.find(event => event.id === id)
    if (!existingEvent) {
      return HttpResponse.json(mockNotFoundError.data, { status: mockNotFoundError.status })
    }

    const duplicatedEvent = createMockEvent({
      id: `event-${Date.now()}-copy`,
      name: `${existingEvent.name} (Copy)`,
      type: existingEvent.type,
      status: EventStatus.DRAFT,
      start_date: existingEvent.start_date,
      venue_name: existingEvent.venue_name,
      budget_total: existingEvent.budget_total,
      max_guests: undefined, // Reset guest counts for duplicated event
      guest_count: 0,
      confirmed_guests: 0,
      total_expenses: 0,
    })

    return HttpResponse.json(duplicatedEvent, { status: 201 })
  }),

  // POST /api/v1/events/:id/archive - Archive event
  http.post(`${API_BASE_URL}/api/v1/events/:id/archive`, async ({ params, request }) => {
    await delay()

    const { id } = params as { id: string }

    // Check authentication
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(mockUnauthorizedError.data, { status: mockUnauthorizedError.status })
    }

    const existingEvent = mockEvents.find(event => event.id === id)
    if (!existingEvent) {
      return HttpResponse.json(mockNotFoundError.data, { status: mockNotFoundError.status })
    }

    const archivedEvent = createMockEvent({
      ...existingEvent,
      status: EventStatus.COMPLETED, // Use COMPLETED as archived status
      updated_at: new Date().toISOString(),
    })

    return HttpResponse.json(archivedEvent)
  }),

  // GET /api/v1/events/stats - Dashboard statistics
  http.get(`${API_BASE_URL}/api/v1/events/stats`, async ({ request }) => {
    await delay()

    // Check authentication
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(mockUnauthorizedError.data, { status: mockUnauthorizedError.status })
    }

    return HttpResponse.json(mockEventStats)
  }),

  // GET /api/v1/events/:id/analytics - Event analytics
  http.get(`${API_BASE_URL}/api/v1/events/:id/analytics`, async ({ params, request }) => {
    await delay()

    const { id } = params as { id: string }

    // Check authentication
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(mockUnauthorizedError.data, { status: mockUnauthorizedError.status })
    }

    const existingEvent = mockEvents.find(event => event.id === id)
    if (!existingEvent) {
      return HttpResponse.json(mockNotFoundError.data, { status: mockNotFoundError.status })
    }

    const analytics = createMockEventAnalytics()
    return HttpResponse.json(analytics)
  }),

  // GET /api/v1/events/recent - Recent events
  http.get(`${API_BASE_URL}/api/v1/events/recent`, async ({ request }) => {
    await delay()

    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '5')

    // Check authentication
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(mockUnauthorizedError.data, { status: mockUnauthorizedError.status })
    }

    // Return most recently created events
    const recentEvents = mockEvents
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit)

    return HttpResponse.json(recentEvents)
  }),

  // GET /api/v1/events/upcoming - Upcoming events
  http.get(`${API_BASE_URL}/api/v1/events/upcoming`, async ({ request }) => {
    await delay()

    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '5')

    // Check authentication
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(mockUnauthorizedError.data, { status: mockUnauthorizedError.status })
    }

    const upcomingEvents = getMockUpcomingEvents(limit)
    return HttpResponse.json(upcomingEvents)
  }),
]