"""
Email log model for tracking email delivery.

FR-7: The system shall send email invitations
5.2.1: Email Service Setup

This model tracks all emails sent through the system including:
- RSVP invitations
- Confirmation emails
- Reminder notifications
- System emails
"""

from sqlalchemy import Column, String, Text, DateTime, Enum as SQLEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum

from app.db.base import Base


class EmailType(str, enum.Enum):
    """Types of emails sent by the system"""
    TEST = "test"
    INVITATION = "invitation"
    CONFIRMATION = "confirmation"
    REMINDER = "reminder"
    THANK_YOU = "thank_you"
    CAMPAIGN = "campaign"
    SYSTEM = "system"


class EmailStatus(str, enum.Enum):
    """Email delivery status"""
    QUEUED = "queued"
    SENT = "sent"
    DELIVERED = "delivered"
    FAILED = "failed"
    BOUNCED = "bounced"
    COMPLAINED = "complained"


class EmailLog(Base):
    """Email delivery tracking log"""
    __tablename__ = "email_logs"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Optional associations
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="SET NULL"), nullable=True)
    guest_id = Column(UUID(as_uuid=True), ForeignKey("guests.id", ondelete="SET NULL"), nullable=True)

    # Email details
    recipient_email = Column(String(255), nullable=False, index=True)
    subject = Column(String(500), nullable=False)
    email_type = Column(SQLEnum(EmailType), nullable=False, index=True)

    # Delivery status
    status = Column(SQLEnum(EmailStatus), nullable=False, default=EmailStatus.QUEUED, index=True)
    ses_message_id = Column(String(255), nullable=True, index=True)

    # Error tracking
    error_message = Column(Text, nullable=True)

    # Timestamps
    sent_at = Column(DateTime(timezone=True), nullable=True)
    delivered_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    event = relationship("Event", backref="email_logs")
    guest = relationship("Guest", backref="email_logs")

    def __repr__(self) -> str:
        return f"<EmailLog(id={self.id}, type={self.email_type}, status={self.status}, to={self.recipient_email})>"
