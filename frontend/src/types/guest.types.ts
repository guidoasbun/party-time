/**
 * Guest model types
 */

import { UUID, Timestamps, ListQueryParams } from './common.types'

// RSVP status enum matching backend
export enum RsvpStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed', 
  DECLINED = 'declined',
  TENTATIVE = 'tentative'
}

// Base guest types
export interface GuestBase {
  email: string
  first_name: string
  last_name: string
  phone?: string
  plus_one_allowed: boolean
  plus_one_name?: string
  dietary_restrictions?: string
  notes?: string
}

export interface GuestCreate extends GuestBase {
  event_id: UUID
}

export interface GuestUpdate {
  email?: string
  first_name?: string
  last_name?: string
  phone?: string
  plus_one_allowed?: boolean
  plus_one_name?: string
  dietary_restrictions?: string
  notes?: string
}

export interface GuestRSVPUpdate {
  rsvp_status: RsvpStatus
  plus_one_name?: string
  dietary_restrictions?: string
}

// Full guest model
export interface Guest extends GuestBase, Timestamps {
  id: UUID
  event_id: UUID
  rsvp_status: RsvpStatus
  invitation_sent_at?: string
  rsvp_responded_at?: string
  rsvp_token?: string // only included in admin responses
}

// Guest with token for RSVP
export interface GuestWithToken extends Guest {
  rsvp_token: string
}

// Guest summary for lists
export interface GuestSummary {
  id: UUID
  first_name: string
  last_name: string
  email: string
  rsvp_status: RsvpStatus
  plus_one_allowed: boolean
  plus_one_name?: string
}

// Guest statistics
export interface GuestStats {
  total_guests: number
  confirmed_guests: number
  declined_guests: number
  pending_guests: number
  tentative_guests: number
  plus_ones_allowed: number
  plus_ones_confirmed: number
  dietary_restrictions_count: number
  response_rate: number
  invitation_sent_count: number
}

// Bulk guest operations
export interface GuestBulkCreate {
  guests: GuestBase[]
  send_invitations: boolean
}

export interface GuestBulkUpdate {
  guest_ids: UUID[]
  updates: Partial<GuestUpdate>
}

export interface GuestBulkInvite {
  guest_ids: UUID[]
  message?: string
  send_immediately: boolean
}

export interface GuestImportData {
  file: File
  mapping: {
    email: string
    first_name: string
    last_name: string
    phone?: string
    dietary_restrictions?: string
    notes?: string
  }
  send_invitations: boolean
}

export interface GuestImportResult {
  success_count: number
  error_count: number
  errors: Array<{
    row: number
    error: string
    data: Record<string, string>
  }>
  created_guests: GuestSummary[]
}

// Guest search and filtering
export interface GuestSearchParams extends ListQueryParams {
  rsvp_status?: RsvpStatus[]
  plus_one_allowed?: boolean
  has_dietary_restrictions?: boolean
  invitation_sent?: boolean
  responded?: boolean
  email?: string
  name?: string
  [key: string]: unknown
}

export interface GuestFilters {
  rsvp_statuses: RsvpStatus[]
  plus_one_filter: 'all' | 'allowed' | 'not_allowed' | 'confirmed'
  dietary_restrictions: 'all' | 'has' | 'none'
  invitation_status: 'all' | 'sent' | 'not_sent'
  response_status: 'all' | 'responded' | 'not_responded'
}

// RSVP form and public interface
export interface RSVPFormData {
  rsvp_status: RsvpStatus
  plus_one_name?: string
  dietary_restrictions?: string
  message?: string
}

export interface RSVPPublicData {
  guest: {
    first_name: string
    last_name: string
    email: string
    plus_one_allowed: boolean
    plus_one_name?: string
    dietary_restrictions?: string
  }
  event: {
    name: string
    description?: string
    start_date: string
    end_date?: string
    venue_name?: string
    venue_address?: string
  }
  rsvp_deadline?: string
  custom_message?: string
}

export interface RSVPResponse {
  message: string
  guest: GuestSummary
  event_name: string
}

// Guest communication
export interface GuestMessage {
  id: UUID
  event_id: UUID
  guest_id?: UUID // null for broadcast messages
  sender_id: UUID
  sender_name: string
  subject: string
  content: string
  message_type: 'invitation' | 'reminder' | 'update' | 'thank_you' | 'custom'
  sent_at: string
  delivered_at?: string
  opened_at?: string
  clicked_at?: string
}

export interface MessageTemplate {
  id: UUID
  name: string
  type: 'invitation' | 'reminder' | 'confirmation' | 'cancellation' | 'update'
  subject: string
  html_content: string
  text_content: string
  variables: string[] // list of variable names that can be substituted
  is_default: boolean
  created_by: UUID
  created_at: string
}

export interface MessageCampaign {
  id: UUID
  event_id: UUID
  name: string
  template_id: UUID
  recipient_filter: GuestFilters
  scheduled_at?: string
  sent_at?: string
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
  total_recipients: number
  delivered_count: number
  opened_count: number
  clicked_count: number
  created_at: string
}

// Guest groups and seating
export interface GuestGroup {
  id: UUID
  event_id: UUID
  name: string
  description?: string
  color?: string
  guest_ids: UUID[]
  created_at: string
}

export interface SeatingChart {
  id: UUID
  event_id: UUID
  name: string
  layout_data: {
    tables: Array<{
      id: string
      name: string
      capacity: number
      x: number
      y: number
      shape: 'round' | 'rectangle'
      guests: UUID[]
    }>
    special_seating?: Array<{
      type: 'head_table' | 'vip' | 'accessibility'
      guest_ids: UUID[]
    }>
  }
  is_finalized: boolean
  created_at: string
  updated_at: string
}

// Guest preferences and dietary restrictions
export interface DietaryRestriction {
  id: string
  name: string
  description?: string
  category: 'allergy' | 'dietary' | 'religious' | 'preference'
  common: boolean
}

export interface GuestPreferences {
  guest_id: UUID
  seating_preferences?: {
    preferred_guests: UUID[]
    avoid_guests: UUID[]
    accessibility_needs: string[]
  }
  communication_preferences: {
    email_enabled: boolean
    sms_enabled: boolean
    preferred_language: string
  }
  event_preferences: {
    music_requests?: string[]
    activity_interests?: string[]
    special_requests?: string
  }
}

// Guest analytics
export interface GuestAnalytics {
  response_timeline: Array<{
    date: string
    confirmed: number
    declined: number
    pending: number
  }>
  rsvp_trends: {
    early_responders: number // responded within 24 hours
    late_responders: number // responded after 1 week
    non_responders: number
  }
  demographic_breakdown: {
    plus_ones: {
      allowed: number
      confirmed: number
      percentage: number
    }
    dietary_restrictions: {
      total: number
      common_restrictions: Array<{
        restriction: string
        count: number
      }>
    }
  }
  engagement_metrics: {
    invitation_open_rate: number
    invitation_click_rate: number
    rsvp_completion_rate: number
    average_response_time: number // hours
  }
}

// Guest list management
export interface GuestListView {
  id: UUID
  name: string
  filters: GuestFilters
  sort_by: string
  sort_order: 'asc' | 'desc'
  columns: string[]
  is_default: boolean
  created_by: UUID
  created_at: string
}

export interface GuestExportOptions {
  format: 'csv' | 'excel' | 'pdf'
  include_fields: string[]
  filter: GuestFilters
  group_by?: 'rsvp_status' | 'dietary_restrictions' | 'none'
  include_statistics: boolean
}

// Form validation and UI helpers
export interface GuestFormData extends GuestBase {
  send_invitation?: boolean
  invitation_message?: string
}

export interface GuestValidationErrors {
  email?: string[]
  first_name?: string[]
  last_name?: string[]
  phone?: string[]
  plus_one_name?: string[]
  dietary_restrictions?: string[]
  general?: string[]
}

export interface GuestListState {
  guests: Guest[]
  loading: boolean
  error: string | null
  filters: GuestFilters
  search: string
  sort: {
    field: keyof Guest
    order: 'asc' | 'desc'
  }
  pagination: {
    page: number
    limit: number
    total: number
  }
  selection: {
    selected_ids: UUID[]
    select_all: boolean
  }
}