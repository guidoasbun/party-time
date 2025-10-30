"""
Pydantic schemas for email operations.

FR-7: The system shall send email invitations
5.2.1: Email Service Setup

These schemas define the data structures for:
- Email log entries
- Email sending requests
- Email statistics
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from enum import Enum
from uuid import UUID


class EmailType(str, Enum):
    """Types of emails sent by the system"""
    TEST = "test"
    INVITATION = "invitation"
    CONFIRMATION = "confirmation"
    REMINDER = "reminder"
    THANK_YOU = "thank_you"
    CAMPAIGN = "campaign"
    SYSTEM = "system"


class EmailStatus(str, Enum):
    """Email delivery status"""
    QUEUED = "queued"
    SENT = "sent"
    DELIVERED = "delivered"
    FAILED = "failed"
    BOUNCED = "bounced"
    COMPLAINED = "complained"


class EmailBase(BaseModel):
    """Base email schema"""
    recipient_email: EmailStr
    subject: str = Field(..., min_length=1, max_length=255)
    email_type: EmailType


class EmailCreate(EmailBase):
    """Schema for creating email log entry"""
    event_id: Optional[UUID] = None
    guest_id: Optional[UUID] = None


class EmailLog(EmailBase):
    """Schema for email log response"""
    id: UUID
    event_id: Optional[UUID] = None
    guest_id: Optional[UUID] = None
    status: EmailStatus
    sent_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    error_message: Optional[str] = None
    ses_message_id: Optional[str] = None

    class Config:
        from_attributes = True


class EmailSendRequest(BaseModel):
    """Schema for sending email via API"""
    to_email: EmailStr
    subject: str = Field(..., min_length=1, max_length=255)
    html_body: Optional[str] = None
    text_body: Optional[str] = None
    reply_to: Optional[EmailStr] = None
    cc: Optional[List[EmailStr]] = None
    bcc: Optional[List[EmailStr]] = None


class TemplatEmailSendRequest(BaseModel):
    """Schema for sending template email via API"""
    to_email: EmailStr
    subject: str = Field(..., min_length=1, max_length=255)
    template_name: str = Field(..., min_length=1)
    context: dict = Field(default_factory=dict)
    reply_to: Optional[EmailStr] = None


class EmailSendResponse(BaseModel):
    """Schema for email send response"""
    success: bool
    message_id: Optional[str] = None
    recipient: EmailStr
    message: Optional[str] = None


class EmailStatsResponse(BaseModel):
    """Schema for email statistics"""
    total_sent: int
    total_failed: int
    total_delivered: int
    total_bounced: int
    total_complained: int
    success_rate: float
    by_type: dict


class EmailVerificationRequest(BaseModel):
    """Schema for email verification request"""
    email: EmailStr


class EmailVerificationResponse(BaseModel):
    """Schema for email verification response"""
    email: EmailStr
    status: str
    verified: bool
    message: Optional[str] = None


class EmailQuotaResponse(BaseModel):
    """Schema for SES quota response"""
    max_24_hour_send: float
    max_send_rate: float
    sent_last_24_hours: float
    remaining_24_hour: float
    usage_percentage: float

"""
FR-7: The system shall send email invitations
5.2.2: Email Templates
"""

class TemplatePreviewRequest(BaseModel):
    """Schema for template preview request"""
    template_name: str = Field(..., min_length=1, description="Template name (e.g., 'invitation', 'confirmation')")
    event_id: Optional[UUID] = Field(None, description="Event ID to use for preview (optional)")
    guest_id: Optional[UUID] = Field(None, description="Guest ID to use for preview (optional)")
    mock_data: Optional[dict] = Field(None, description="Mock data to use if event_id/guest_id not provided")

"""
FR-7: The system shall send email invitations
5.2.2: Email Templates
"""

class TemplatePreviewResponse(BaseModel):
    """Schema for template preview response"""
    template_name: str
    html_content: str
    text_content: Optional[str] = None
    rendered_at: datetime = Field(default_factory=datetime.utcnow)


"""
FR-7: The system shall send email invitations
5.2.3: Email Campaign Interface
"""

class RecipientFilter(str, Enum):
    """Recipient filter options for bulk invitations"""
    ALL = "all"
    NOT_INVITED = "not_invited"
    PENDING_RSVP = "pending_rsvp"
    ATTENDING = "attending"
    NOT_ATTENDING = "not_attending"
    MAYBE = "maybe"
    CUSTOM = "custom"


class BulkInvitationRequest(BaseModel):
    """Schema for sending bulk invitations"""
    recipient_filter: RecipientFilter = Field(
        ...,
        description="Filter to select recipients"
    )
    guest_ids: Optional[List[UUID]] = Field(
        None,
        description="Specific guest IDs (required if recipient_filter is 'custom')"
    )
    exclude_already_invited: bool = Field(
        default=True,
        description="Exclude guests who already received an invitation"
    )
    subject_override: Optional[str] = Field(
        None,
        max_length=255,
        description="Custom subject line (optional, uses default if not provided)"
    )
    send_at: Optional[datetime] = Field(
        None,
        description="Schedule for later send (optional, sends immediately if not provided)"
    )
    test_mode: bool = Field(
        default=False,
        description="If True, doesn't actually send emails but returns what would be sent"
    )


class BulkInvitationResponse(BaseModel):
    """Schema for bulk invitation response"""
    campaign_id: Optional[UUID] = Field(
        None,
        description="Campaign ID for tracking (if scheduled)"
    )
    total_recipients: int = Field(
        ...,
        description="Total number of recipients selected"
    )
    queued: int = Field(
        ...,
        description="Number of emails successfully queued"
    )
    failed: int = Field(
        default=0,
        description="Number of emails that failed to queue"
    )
    excluded: int = Field(
        default=0,
        description="Number of guests excluded (already invited)"
    )
    scheduled_for: Optional[datetime] = Field(
        None,
        description="Scheduled send time (if scheduled)"
    )
    status: str = Field(
        ...,
        description="Campaign status: 'queued', 'scheduled', 'test_mode', or 'completed'"
    )
    error_messages: Optional[List[str]] = Field(
        None,
        description="Any error messages encountered"
    )


class GuestInvitationRequest(BaseModel):
    """Schema for sending invitations to selected guests from guest management page"""
    guest_ids: List[UUID] = Field(..., description="List of guest IDs to send invitations to")
    template_id: Optional[UUID] = Field(None, description="Optional custom template ID (not currently used)")
    custom_message: Optional[str] = Field(None, description="Optional custom message (not currently used)")
    send_immediately: bool = Field(True, description="Send immediately (default) or schedule for later")
    scheduled_at: Optional[str] = Field(None, description="ISO datetime string for scheduled sending")


class CampaignStatsResponse(BaseModel):
    """Schema for campaign delivery statistics"""
    total_invitations: int = Field(..., description="Total invitations sent for this event")
    sent: int = Field(..., description="Successfully sent emails")
    delivered: int = Field(..., description="Emails delivered to recipient")
    failed: int = Field(..., description="Failed deliveries")
    bounced: int = Field(..., description="Bounced emails")
    complained: int = Field(..., description="Spam complaints")
    pending: int = Field(..., description="Still in queue or sent but not confirmed delivered")
    delivery_rate: float = Field(..., description="Percentage of emails delivered")
