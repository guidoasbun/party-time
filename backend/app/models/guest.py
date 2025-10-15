"""Guest model for event attendees."""
from sqlalchemy import Column, String, Boolean, Enum as SQLEnum, DateTime, Text, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
import secrets

from app.db.base import Base


class RsvpStatus(str, enum.Enum):
    """RSVP response status."""
    PENDING = "pending"
    ATTENDING = "attending"
    NOT_ATTENDING = "not_attending"
    MAYBE = "maybe"


class Guest(Base):
    __tablename__ = "guests"
    __table_args__ = (
        UniqueConstraint('event_id', 'email', name='uq_guest_event_email'),
    )
    
    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Event association
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    
    # Guest information
    email = Column(String(255), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone = Column(String(20))
    
    # RSVP tracking
    rsvp_token = Column(String(255), unique=True, nullable=False, default=lambda: secrets.token_hex(32))
    rsvp_status = Column(SQLEnum(RsvpStatus), nullable=False, default=RsvpStatus.PENDING)
    token_expires_at = Column(DateTime(timezone=True))
    token_first_accessed_at = Column(DateTime(timezone=True))
    token_last_accessed_at = Column(DateTime(timezone=True))
    
    # Plus one handling
    plus_one_allowed = Column(Boolean, nullable=False, default=False)
    plus_one_name = Column(String(200))
    
    # Additional info
    dietary_restrictions = Column(Text)
    meal_preference = Column(String(200))  # Meal choice for events with meal options
    notes = Column(Text)

    # RSVP response tracking
    # FR-6: The system shall display an RSVP submission page. 5.1.1
    rsvp_ip_address = Column(String(45))  # IPv4 (15 chars) or IPv6 (45 chars max)

    # Tracking timestamps
    invitation_sent_at = Column(DateTime(timezone=True))
    rsvp_responded_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    event = relationship("Event", back_populates="guests")