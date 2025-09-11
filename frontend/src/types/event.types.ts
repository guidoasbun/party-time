/**
 * Event model types
 */

import { UUID, Timestamps, ListQueryParams } from './common.types'
import { GuestSummary } from './guest.types'
import { BudgetCategorySummary, ExpenseSummary } from './budget.types'

// Event type enum matching backend
export enum EventType {
  WEDDING = 'wedding',
  BIRTHDAY = 'birthday',
  ANNIVERSARY = 'anniversary',
  GRADUATION = 'graduation',
  BABY_SHOWER = 'baby_shower',
  BRIDAL_SHOWER = 'bridal_shower',
  CORPORATE = 'corporate',
  CONFERENCE = 'conference',
  WORKSHOP = 'workshop',
  FUNDRAISER = 'fundraiser',
  HOLIDAY_PARTY = 'holiday_party',
  REUNION = 'reunion',
  OTHER = 'other'
}

// Event status enum matching backend
export enum EventStatus {
  DRAFT = 'draft',
  PLANNING = 'planning',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  POSTPONED = 'postponed'
}

// Base event types
export interface EventBase {
  name: string
  description?: string
  type: EventType
  start_date: string // ISO datetime string
  end_date?: string // ISO datetime string
  location?: string
  venue_name?: string
  venue_address?: string
  venue_google_place_id?: string
  max_guests?: number
  budget_total?: number
  is_public: boolean
}

export interface EventCreate extends EventBase {
  status?: EventStatus
}

export interface EventUpdate {
  name?: string
  description?: string
  type?: EventType
  status?: EventStatus
  start_date?: string
  end_date?: string
  location?: string
  venue_name?: string
  venue_address?: string
  venue_google_place_id?: string
  max_guests?: number
  budget_total?: number
  is_public?: boolean
}

// Full event model
export interface Event extends EventBase, Timestamps {
  id: UUID
  status: EventStatus
  planner_id: UUID
  
  // Summary data (calculated fields)
  guest_count: number
  confirmed_guests: number
  total_expenses: number
}

// Event with related data
export interface EventWithDetails extends Event {
  guests: GuestSummary[]
  budget_categories: BudgetCategorySummary[]
  recent_expenses: ExpenseSummary[]
}

// Event summary for lists
export interface EventSummary {
  id: UUID
  name: string
  type: EventType
  status: EventStatus
  start_date: string
  venue_name?: string
  guest_count: number
  confirmed_guests: number
  budget_total?: number
  total_expenses: number
  planner_name: string
  created_at: string
}

// Event dashboard data
export interface EventDashboard {
  event: Event
  stats: {
    guest_count: number
    confirmed_guests: number
    pending_rsvps: number
    declined_guests: number
    budget_utilization: number
    days_until_event: number
    completion_percentage: number
  }
  recent_activities: EventActivity[]
  upcoming_tasks: EventTask[]
  budget_summary: {
    total_budget: number
    total_spent: number
    remaining_budget: number
    categories_count: number
    expenses_count: number
  }
}

// Event activity tracking
export interface EventActivity {
  id: UUID
  event_id: UUID
  user_id: UUID
  user_name: string
  action_type: 'created' | 'updated' | 'guest_added' | 'rsvp_received' | 'expense_added' | 'budget_updated'
  description: string
  metadata?: Record<string, unknown>
  created_at: string
}

// Event tasks and timeline
export interface EventTask {
  id: UUID
  event_id: UUID
  title: string
  description?: string
  due_date?: string
  completed: boolean
  category: 'planning' | 'guest_management' | 'vendor' | 'budget' | 'venue' | 'other'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assigned_to?: UUID
  created_at: string
  completed_at?: string
}

export interface EventTimeline {
  id: UUID
  event_id: UUID
  milestone: string
  description?: string
  target_date: string
  completed: boolean
  completed_at?: string
  category: 'major' | 'minor'
}

// Venue and location types
export interface Venue {
  id: UUID
  name: string
  address: string
  city: string
  state: string
  country: string
  zip_code?: string
  google_place_id?: string
  phone?: string
  email?: string
  website?: string
  capacity?: number
  price_range?: string
  rating?: number
  photos?: string[]
  amenities?: string[]
  description?: string
}

export interface VenueSearchParams {
  query: string
  location: string
  radius?: number // km
  min_capacity?: number
  max_capacity?: number
  price_range?: string
  event_type?: EventType
}

export interface VenueSearchResult {
  place_id: string
  name: string
  address: string
  rating?: number
  price_level?: number
  photos?: string[]
  opening_hours?: string[]
  phone?: string
  website?: string
  distance?: number
}

// Event forms and validation
export interface EventFormData extends EventBase {
  venue_details?: {
    place_id?: string
    name?: string
    address?: string
    phone?: string
    website?: string
  }
  guest_settings?: {
    allow_plus_ones: boolean
    require_rsvp: boolean
    rsvp_deadline?: string
    dietary_restrictions_enabled: boolean
  }
  notification_settings?: {
    send_invitations: boolean
    reminder_schedule: string[]
    auto_reminders: boolean
  }
}

// Event search and filtering
export interface EventSearchParams extends ListQueryParams {
  type?: EventType[]
  status?: EventStatus[]
  start_date_from?: string
  start_date_to?: string
  location?: string
  planner_id?: UUID
  is_public?: boolean
  [key: string]: unknown
}

export interface EventFilters {
  types: EventType[]
  statuses: EventStatus[]
  date_range: {
    start?: string
    end?: string
  }
  location?: string
  budget_range?: {
    min?: number
    max?: number
  }
  guest_count_range?: {
    min?: number
    max?: number
  }
}

// API Response types for lists and statistics
export interface EventListResponse {
  events: EventSummary[]
  pagination: {
    page: number
    limit: number
    total: number
    has_next: boolean
    has_previous: boolean
  }
}

export interface EventStatsResponse {
  total_events: number
  upcoming_events: number
  completed_events: number
  total_guests: number
  avg_rsvp_rate: number
  total_budget: number
  events_by_status: Record<EventStatus, number>
  events_by_type: Record<EventType, number>
  events_this_month: number
  events_this_year: number
  average_guest_count: number
  average_budget: number
  completion_rate: number
}

// Dashboard statistics interface
export interface DashboardStats {
  totalEvents: number
  upcomingEvents: number
  completedEvents: number
  totalGuests: number
  avgRsvpRate: number
  totalBudget: number
}

// Event statistics and analytics
export interface EventStats {
  total_events: number
  events_by_status: Record<EventStatus, number>
  events_by_type: Record<EventType, number>
  upcoming_events: number
  events_this_month: number
  events_this_year: number
  total_guests: number
  average_guest_count: number
  total_budget: number
  average_budget: number
  completion_rate: number
}

export interface EventAnalytics {
  rsvp_rates: {
    confirmed: number
    declined: number
    pending: number
  }
  budget_performance: {
    on_budget: number
    over_budget: number
    under_budget: number
  }
  guest_engagement: {
    response_rate: number
    average_response_time: number // hours
  }
  timeline_performance: {
    on_schedule: number
    behind_schedule: number
    ahead_of_schedule: number
  }
}

// Event templates
export interface EventTemplate {
  id: UUID
  name: string
  description?: string
  type: EventType
  template_data: {
    default_budget_categories: string[]
    default_timeline: EventTimeline[]
    default_tasks: Omit<EventTask, 'id' | 'event_id' | 'created_at'>[]
    suggested_vendors?: string[]
  }
  is_public: boolean
  created_by: UUID
  usage_count: number
  created_at: string
}

// Event sharing and collaboration
export interface EventShare {
  id: UUID
  event_id: UUID
  shared_with_email: string
  permission_level: 'view' | 'edit' | 'admin'
  expires_at?: string
  created_at: string
  accepted_at?: string
}

export interface EventCollaborator {
  id: UUID
  event_id: UUID
  user_id: UUID
  user_name: string
  user_email: string
  role: 'viewer' | 'editor' | 'admin'
  added_at: string
  last_active?: string
}

// Export types
export interface EventExportOptions {
  format: 'pdf' | 'excel' | 'csv'
  include_guests: boolean
  include_budget: boolean
  include_timeline: boolean
  include_vendors: boolean
  date_range?: {
    start: string
    end: string
  }
}

export interface EventImportData {
  guests?: Array<{
    email: string
    first_name: string
    last_name: string
    phone?: string
  }>
  budget_categories?: Array<{
    name: string
    allocated_amount: number
  }>
  tasks?: Array<{
    title: string
    description?: string
    due_date?: string
    category: string
  }>
}