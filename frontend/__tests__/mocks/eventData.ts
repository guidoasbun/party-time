/**
 * Mock data factories for event testing
 */

import {
  Event,
  EventSummary,
  EventStats,
  DashboardStats,
  EventActivity,
  EventAnalytics,
  EventType,
  EventStatus,
  EventCreate,
  EventUpdate,
  PaginatedResponse
} from '@/types'

// Mock data factories
export const createMockEvent = (overrides: Partial<Event> = {}): Event => ({
  id: 'event-1',
  name: 'Sample Wedding',
  description: 'A beautiful wedding ceremony',
  type: EventType.WEDDING,
  status: EventStatus.PLANNING,
  start_date: '2024-06-15T14:00:00Z',
  end_date: '2024-06-15T22:00:00Z',
  location: 'Downtown Venue',
  venue_name: 'Grand Ballroom',
  venue_address: '123 Main St, City, State',
  venue_google_place_id: 'place_123',
  max_guests: 150,
  budget_total: 25000,
  is_public: false,
  planner_id: 'user-123',
  guest_count: 120,
  confirmed_guests: 85,
  total_expenses: 18500,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-15T00:00:00Z',
  ...overrides,
})

export const createMockEventSummary = (overrides: Partial<EventSummary> = {}): EventSummary => ({
  id: 'event-1',
  name: 'Sample Wedding',
  type: EventType.WEDDING,
  status: EventStatus.PLANNING,
  start_date: '2024-06-15T14:00:00Z',
  venue_name: 'Grand Ballroom',
  guest_count: 120,
  confirmed_guests: 85,
  budget_total: 25000,
  total_expenses: 18500,
  planner_name: 'John Doe',
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

export const createMockEventStats = (overrides: Partial<EventStats> = {}): EventStats => ({
  total_events: 10,
  events_by_status: {
    [EventStatus.DRAFT]: 2,
    [EventStatus.PLANNING]: 3,
    [EventStatus.CONFIRMED]: 2,
    [EventStatus.IN_PROGRESS]: 1,
    [EventStatus.ACTIVE]: 0,
    [EventStatus.COMPLETED]: 2,
    [EventStatus.CANCELLED]: 0,
    [EventStatus.POSTPONED]: 0,
  },
  events_by_type: {
    [EventType.WEDDING]: 3,
    [EventType.BIRTHDAY]: 2,
    [EventType.CORPORATE]: 2,
    [EventType.ANNIVERSARY]: 1,
    [EventType.GRADUATION]: 1,
    [EventType.BABY_SHOWER]: 0,
    [EventType.BRIDAL_SHOWER]: 0,
    [EventType.CONFERENCE]: 1,
    [EventType.WORKSHOP]: 0,
    [EventType.FUNDRAISER]: 0,
    [EventType.HOLIDAY_PARTY]: 0,
    [EventType.REUNION]: 0,
    [EventType.CELEBRATION]: 0,
    [EventType.OTHER]: 0,
  },
  upcoming_events: 5,
  events_this_month: 3,
  events_this_year: 10,
  total_guests: 850,
  average_guest_count: 85,
  total_budget: 125000,
  average_budget: 12500,
  completion_rate: 0.75,
  ...overrides,
})

export const createMockDashboardStats = (overrides: Partial<DashboardStats> = {}): DashboardStats => ({
  totalEvents: 10,
  upcomingEvents: 5,
  completedEvents: 2,
  totalGuests: 850,
  avgRsvpRate: 85,
  totalBudget: 125000,
  ...overrides,
})

export const createMockEventActivity = (overrides: Partial<EventActivity> = {}): EventActivity => ({
  id: 'activity-1',
  event_id: 'event-1',
  user_id: 'user-123',
  user_name: 'John Doe',
  action_type: 'created',
  description: 'Created event "Sample Wedding"',
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

export const createMockEventAnalytics = (overrides: Partial<EventAnalytics> = {}): EventAnalytics => ({
  rsvp_rates: {
    confirmed: 0.75,
    declined: 0.15,
    pending: 0.10,
  },
  budget_performance: {
    on_budget: 0.60,
    over_budget: 0.25,
    under_budget: 0.15,
  },
  guest_engagement: {
    response_rate: 0.85,
    average_response_time: 48, // hours
  },
  timeline_performance: {
    on_schedule: 0.70,
    behind_schedule: 0.20,
    ahead_of_schedule: 0.10,
  },
  ...overrides,
})

// Mock data collections
export const mockEvents: EventSummary[] = [
  createMockEventSummary({
    id: 'event-1',
    name: 'Smith Wedding',
    type: EventType.WEDDING,
    status: EventStatus.PLANNING,
    start_date: '2024-06-15T14:00:00Z',
    venue_name: 'Grand Ballroom',
    guest_count: 120,
    confirmed_guests: 85,
    budget_total: 25000,
    total_expenses: 18500,
  }),
  createMockEventSummary({
    id: 'event-2',
    name: 'Corporate Retreat 2024',
    type: EventType.CORPORATE,
    status: EventStatus.CONFIRMED,
    start_date: '2024-07-20T09:00:00Z',
    venue_name: 'Mountain Resort',
    guest_count: 50,
    confirmed_guests: 48,
    budget_total: 15000,
    total_expenses: 12000,
  }),
  createMockEventSummary({
    id: 'event-3',
    name: "Emma's 30th Birthday",
    type: EventType.BIRTHDAY,
    status: EventStatus.DRAFT,
    start_date: '2024-08-05T18:00:00Z',
    venue_name: 'Rooftop Bar',
    guest_count: 25,
    confirmed_guests: 0,
    budget_total: 3000,
    total_expenses: 500,
  }),
]

export const mockEventStats: EventStats = createMockEventStats()

export const mockDashboardStats: DashboardStats = createMockDashboardStats()

export const mockRecentActivity: EventActivity[] = [
  createMockEventActivity({
    id: 'activity-1',
    event_id: 'event-1',
    action_type: 'created',
    description: 'Created event "Smith Wedding"',
    created_at: '2024-01-01T10:00:00Z',
  }),
  createMockEventActivity({
    id: 'activity-2',
    event_id: 'event-1',
    action_type: 'guest_added',
    description: 'Added 5 guests to Smith Wedding',
    created_at: '2024-01-02T14:30:00Z',
  }),
  createMockEventActivity({
    id: 'activity-3',
    event_id: 'event-2',
    action_type: 'updated',
    description: 'Updated Corporate Retreat 2024 details',
    created_at: '2024-01-03T11:15:00Z',
  }),
]

// Helper functions for creating paginated responses
export const createMockPaginatedResponse = <T>(
  items: T[],
  page: number = 1,
  limit: number = 10,
  total?: number
): PaginatedResponse<T> => {
  const actualTotal = total ?? items.length
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedItems = items.slice(startIndex, endIndex)

  return {
    items: paginatedItems,
    page,
    limit,
    total: actualTotal,
    has_next: endIndex < actualTotal,
    has_previous: page > 1,
  }
}

// Helper functions for creating filtered mock data
export const getMockEventsByStatus = (status: EventStatus): EventSummary[] => {
  return mockEvents.filter(event => event.status === status)
}

export const getMockEventsByType = (type: EventType): EventSummary[] => {
  return mockEvents.filter(event => event.type === type)
}

export const getMockUpcomingEvents = (limit: number = 5): EventSummary[] => {
  const now = new Date()
  return mockEvents
    .filter(event => new Date(event.start_date) > now)
    .slice(0, limit)
}

// Error scenarios
export const mockApiError = {
  status: 500,
  data: {
    detail: 'Internal server error'
  }
}

export const mockNotFoundError = {
  status: 404,
  data: {
    detail: 'Event not found'
  }
}

export const mockValidationError = {
  status: 400,
  data: {
    detail: 'Validation error',
    errors: [
      {
        field: 'name',
        message: 'Event name is required'
      }
    ]
  }
}

export const mockUnauthorizedError = {
  status: 401,
  data: {
    detail: 'Authentication required'
  }
}

// Mock functions for different scenarios
export const mockNetworkError = () => {
  throw new Error('Network Error')
}

export const mockTimeoutError = () => {
  throw new Error('Request timeout')
}