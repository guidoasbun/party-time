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
