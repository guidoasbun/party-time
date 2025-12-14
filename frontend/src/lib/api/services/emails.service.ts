/**
 * Email Service
 *
 * FR-7: The system shall send email invitations
 * 5.2.3: Email Campaign Interface
 *
 * API service for email campaigns, invitations, and delivery tracking.
 */

import api from '../../api-client';
import { UUID } from '@/types/common.types';
import {
  BulkInvitationRequest,
  BulkInvitationResponse,
  CampaignStatsResponse,
  EmailLog,
  EmailStatsResponse,
  EmailLogParams,
  TemplatePreviewRequest,
  TemplatePreviewResponse,
  EmailSendRequest,
  EmailSendResponse,
} from '@/types/email.types';

/**
 * EmailsService class for managing email campaigns and invitations
 */
export class EmailsService {
  /**
   * Send bulk invitations to selected guests
   *
   * @param eventId - Event UUID
   * @param request - Bulk invitation request
   * @returns Campaign response with statistics
   */
  async sendBulkInvitations(
    eventId: UUID,
    request: BulkInvitationRequest
  ): Promise<BulkInvitationResponse> {
    const response = await api.post<BulkInvitationResponse>(
      `/api/v1/events/${eventId}/send-invitations/`,
      request
    );
    return response.data;
  }

  /**
   * Get invitation campaign statistics for an event
   *
   * @param eventId - Event UUID
   * @returns Campaign statistics
   */
  async getInvitationStats(eventId: UUID): Promise<CampaignStatsResponse> {
    const response = await api.get<CampaignStatsResponse>(
      `/api/v1/events/${eventId}/invitation-stats/`
    );
    return response.data;
  }

  /**
   * Preview email template with real or mock data
   *
   * @param request - Template preview request
   * @returns Rendered template preview
   */
  async previewTemplate(
    request: TemplatePreviewRequest
  ): Promise<TemplatePreviewResponse> {
    const response = await api.post<TemplatePreviewResponse>(
      '/api/v1/emails/preview/',
      request
    );
    return response.data;
  }

  /**
   * Send test email to verify configuration
   *
   * @param request - Email send request
   * @returns Send response with success status
   */
  async sendTestEmail(request: EmailSendRequest): Promise<EmailSendResponse> {
    const response = await api.post<EmailSendResponse>(
      '/api/v1/emails/test/',
      request
    );
    return response.data;
  }

  /**
   * Get email delivery logs with optional filtering
   *
   * @param params - Query parameters for filtering logs
   * @returns Array of email log entries
   */
  async getEmailLogs(params?: EmailLogParams): Promise<EmailLog[]> {
    const response = await api.get<EmailLog[]>('/api/v1/emails/logs/', {
      params,
    });
    return response.data;
  }

  /**
   * Get email statistics
   *
   * @param eventId - Optional event ID to filter stats
   * @param days - Optional number of days to include (default 30)
   * @returns Email statistics
   */
  async getEmailStats(
    eventId?: UUID,
    days?: number
  ): Promise<EmailStatsResponse> {
    const params: Record<string, string | number> = {};
    if (eventId) params.event_id = eventId;
    if (days) params.days = days;

    const response = await api.get<EmailStatsResponse>('/api/v1/emails/stats/', {
      params,
    });
    return response.data;
  }

  /**
   * Verify email address with AWS SES
   *
   * @param email - Email address to verify
   * @returns Verification response
   */
  async verifyEmail(email: string): Promise<{ status: string; verified: boolean; message?: string }> {
    const response = await api.post<{ status: string; verified: boolean; message?: string }>(
      '/api/v1/emails/verify/',
      { email }
    );
    return response.data;
  }

  /**
   * Check email verification status
   *
   * @param email - Email address to check
   * @returns Verification status
   */
  async checkVerificationStatus(
    email: string
  ): Promise<{ status: string; verified: boolean }> {
    const response = await api.get<{ status: string; verified: boolean }>(
      `/api/v1/emails/verify/${encodeURIComponent(email)}/`
    );
    return response.data;
  }

  /**
   * Get AWS SES send quota and usage
   *
   * @returns Quota information
   */
  async getQuota(): Promise<{
    max_24_hour_send: number;
    max_send_rate: number;
    sent_last_24_hours: number;
    remaining_24_hour: number;
    usage_percentage: number;
  }> {
    const response = await api.get<{
      max_24_hour_send: number;
      max_send_rate: number;
      sent_last_24_hours: number;
      remaining_24_hour: number;
      usage_percentage: number;
    }>('/api/v1/emails/quota/');
    return response.data;
  }
}

// Export singleton instance
export const emailsService = new EmailsService();
