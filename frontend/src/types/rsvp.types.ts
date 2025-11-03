/**
 * FR-6: The system shall display an RSVP submission page 5.1.1.
 * RSVP system types for public guest responses
 */

import { RsvpStatus } from "./guest.types";

// RSVP Token Validation
export interface RSVPValidationResponse {
  is_valid: boolean;
  error_message?: string;
  guest_id?: string;
  guest_name?: string;
  event_id?: string;
  event_name?: string;
  current_rsvp_status?: RsvpStatus;
  plus_one_allowed: boolean;
  token_expires_at?: string;
}

// RSVP Event Details (for public RSVP page)
export interface RSVPEventDetailsResponse {
  guest: {
    first_name: string;
    last_name: string;
    email: string;
    plus_one_allowed: boolean;
  };
  current_rsvp_status: RsvpStatus;
  plus_one_name?: string;
  dietary_restrictions?: string;
  meal_preference?: string;
  event: {
    name: string;
    description?: string;
    type: string;
    start_date?: string;
    end_date?: string;
    location?: string;
    venue_name?: string;
    venue_address?: string;
  };
  rsvp_deadline?: string;
  custom_message?: string;
  host_name: string;
}

// RSVP Submission Request
export interface RSVPSubmissionRequest {
  rsvp_status: RsvpStatus;
  plus_one_name?: string;
  dietary_restrictions?: string;
  meal_preference?: string;
  notes?: string;
}

// RSVP Submission Response
export interface RSVPSubmissionResponse {
  success: boolean;
  message: string;
  rsvp_status: RsvpStatus;
  guest_name: string;
  event_name: string;
  submitted_at: string;
}

// RSVP Preferences Update
export interface RSVPPreferencesUpdate {
  dietary_restrictions?: string;
  meal_preference?: string;
  notes?: string;
}

// RSVP Plus-One Update
export interface RSVPPlusOneUpdate {
  plus_one_name?: string;
}

// RSVP Statistics (for event planners - admin endpoint)
export interface RSVPStatistics {
  event_id: string;
  total_invited: number;
  responded: number;
  pending: number;
  attending: number;
  not_attending: number;
  maybe: number;
  response_rate: number;
  plus_ones_confirmed: number;
  dietary_restrictions_count: number;
  last_response_at?: string;
}

// Rate Limit Information
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset_at: string;
  retry_after?: number;
}

// RSVP Error Response
export interface RSVPErrorResponse {
  error: string;
  message: string;
  retry_after?: number;
  reset_at?: string;
}

/* Unsubscribe Page Information (Phase 5.2.4)

 * FR-7: Email Automation
 * Phase 5.2.4: Automated Email Flows - Unsubscribe Page
 */

export interface UnsubscribePageInfo {
  guest_name: string;
  event_name: string;
  email: string;
  is_unsubscribed: boolean;
}

// Unsubscribe Request (Phase 5.2.4)
export interface UnsubscribeRequest {
  confirm: boolean;
}

// Unsubscribe Response (Phase 5.2.4)
export interface UnsubscribeResponse {
  success: boolean;
  message: string;
  guest_name: string;
  event_name: string;
}
