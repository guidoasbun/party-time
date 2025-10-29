/**
 * Email Campaign Types
 *
 * FR-7: The system shall send email invitations
 * 5.2.3: Email Campaign Interface
 *
 * Type definitions for email campaigns, invitations, and delivery tracking.
 */

import { UUID } from './common.types';

/**
 * Email type categories
 */
export enum EmailType {
  TEST = 'test',
  INVITATION = 'invitation',
  CONFIRMATION = 'confirmation',
  REMINDER = 'reminder',
  THANK_YOU = 'thank_you',
  CAMPAIGN = 'campaign',
  SYSTEM = 'system',
}

/**
 * Email delivery status
 */
export enum EmailStatus {
  QUEUED = 'queued',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  BOUNCED = 'bounced',
  COMPLAINED = 'complained',
}

/**
 * Recipient filter options for bulk invitations
 */
export enum RecipientFilter {
  ALL = 'all',
  NOT_INVITED = 'not_invited',
  PENDING_RSVP = 'pending_rsvp',
  ATTENDING = 'attending',
  NOT_ATTENDING = 'not_attending',
  MAYBE = 'maybe',
  CUSTOM = 'custom',
}

/**
 * Bulk invitation request
 */
export interface BulkInvitationRequest {
  /** Filter to select recipients */
  recipient_filter: RecipientFilter;

  /** Specific guest IDs (required if recipient_filter is 'custom') */
  guest_ids?: UUID[];

  /** Exclude guests who already received an invitation */
  exclude_already_invited?: boolean;

  /** Custom subject line (optional, uses default if not provided) */
  subject_override?: string;

  /** Schedule for later send (optional, sends immediately if not provided) */
  send_at?: string;

  /** If true, doesn't actually send emails but returns what would be sent */
  test_mode?: boolean;
}

/**
 * Bulk invitation response
 */
export interface BulkInvitationResponse {
  /** Campaign ID for tracking (if scheduled) */
  campaign_id?: UUID;

  /** Total number of recipients selected */
  total_recipients: number;

  /** Number of emails successfully queued */
  queued: number;

  /** Number of emails that failed to queue */
  failed: number;

  /** Number of guests excluded (already invited) */
  excluded: number;

  /** Scheduled send time (if scheduled) */
  scheduled_for?: string;

  /** Campaign status */
  status: 'queued' | 'scheduled' | 'test_mode' | 'completed' | 'failed';

  /** Any error messages encountered */
  error_messages?: string[];
}

/**
 * Campaign delivery statistics
 */
export interface CampaignStatsResponse {
  /** Total invitations sent for this event */
  total_invitations: number;

  /** Successfully sent emails */
  sent: number;

  /** Emails delivered to recipient */
  delivered: number;

  /** Failed deliveries */
  failed: number;

  /** Bounced emails */
  bounced: number;

  /** Spam complaints */
  complained: number;

  /** Still in queue or sent but not confirmed delivered */
  pending: number;

  /** Percentage of emails delivered */
  delivery_rate: number;
}

/**
 * Email log entry
 */
export interface EmailLog {
  id: UUID;
  event_id?: UUID;
  guest_id?: UUID;
  recipient_email: string;
  subject: string;
  email_type: EmailType;
  status: EmailStatus;
  sent_at?: string;
  delivered_at?: string;
  error_message?: string;
  ses_message_id?: string;
}

/**
 * Email statistics response
 */
export interface EmailStatsResponse {
  total_sent: number;
  total_failed: number;
  total_delivered: number;
  total_bounced: number;
  total_complained: number;
  success_rate: number;
  by_type: Record<string, number>;
}

/**
 * Template preview request
 */
export interface TemplatePreviewRequest {
  /** Template name (e.g., 'invitation', 'confirmation') */
  template_name: string;

  /** Event ID to use for preview (optional) */
  event_id?: UUID;

  /** Guest ID to use for preview (optional) */
  guest_id?: UUID;

  /** Mock data to use if event_id/guest_id not provided */
  mock_data?: Record<string, unknown>;
}

/**
 * Template preview response
 */
export interface TemplatePreviewResponse {
  template_name: string;
  html_content: string;
  text_content?: string;
  rendered_at: string;
}

/**
 * Email send request (for test emails)
 */
export interface EmailSendRequest {
  to_email: string;
  subject: string;
  html_body?: string;
  text_body?: string;
  reply_to?: string;
  cc?: string[];
  bcc?: string[];
}

/**
 * Email send response
 */
export interface EmailSendResponse {
  success: boolean;
  message_id?: string;
  recipient: string;
  message?: string;
}

/**
 * Parameters for querying email logs
 */
export interface EmailLogParams {
  event_id?: UUID;
  guest_id?: UUID;
  email_type?: EmailType;
  email_status?: EmailStatus;
  days?: number;
  limit?: number;
  offset?: number;
}

/**
 * Recipient selection state (for UI)
 */
export interface RecipientSelectionState {
  filter: RecipientFilter;
  selectedGuestIds: UUID[];
  excludeAlreadyInvited: boolean;
  totalSelected: number;
}

/**
 * Email campaign form data (for UI)
 */
export interface EmailCampaignFormData {
  recipient_filter: RecipientFilter;
  guest_ids: UUID[];
  exclude_already_invited: boolean;
  subject_override: string;
  send_at?: Date;
  test_mode: boolean;
}
