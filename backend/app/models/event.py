"""Event model for party planning."""
from sqlalchemy import Column, String, Boolean, Enum as SQLEnum, DateTime, Integer, Text, ForeignKey, DECIMAL
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum

from app.db.base import Base


class EventType(str, enum.Enum):
    """Types of events supported by the platform."""
    WEDDING = "wedding"
    BIRTHDAY = "birthday"
    GRADUATION = "graduation"
    CORPORATE = "corporate"
    CELEBRATION = "celebration"
    OTHER = "other"


class EventStatus(str, enum.Enum):
    """Event lifecycle states."""
    DRAFT = "draft"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Event(Base):
    __tablename__ = "events"
    
    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Basic event information
    name = Column(String(255), nullable=False)
    description = Column(Text)
    type = Column(SQLEnum(EventType), nullable=False)
    status = Column(SQLEnum(EventStatus), nullable=False, default=EventStatus.DRAFT)
    
    # Date and time
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True))
    
    # Venue information
    location = Column(Text)
    venue_name = Column(String(255))
    venue_address = Column(Text)
    venue_google_place_id = Column(String(255))
    
    # Event constraints
    max_guests = Column(Integer)
    budget_total = Column(DECIMAL(10, 2))
    
    # Ownership and visibility
    planner_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    is_public = Column(Boolean, nullable=False, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    planner = relationship("User", backref="events")
    guests = relationship("Guest", back_populates="event", cascade="all, delete-orphan")
    budget_categories = relationship("BudgetCategory", back_populates="event", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="event", cascade="all, delete-orphan")