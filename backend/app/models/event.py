"""Event model for party planning."""
from sqlalchemy import Column, String, Boolean, Enum as SQLEnum, DateTime, Integer, Text, ForeignKey, DECIMAL, select
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.ext.hybrid import hybrid_property
from decimal import Decimal
import uuid
import enum

from app.db.base import Base


class EventType(str, enum.Enum):
    """Types of events supported by the platform."""
    WEDDING = "wedding"
    BIRTHDAY = "birthday"
    ANNIVERSARY = "anniversary"
    GRADUATION = "graduation"
    BABY_SHOWER = "baby_shower"
    BRIDAL_SHOWER = "bridal_shower"
    CORPORATE = "corporate"
    CONFERENCE = "conference"
    WORKSHOP = "workshop"
    FUNDRAISER = "fundraiser"
    HOLIDAY_PARTY = "holiday_party"
    REUNION = "reunion"
    CELEBRATION = "celebration"
    OTHER = "other"


class EventStatus(str, enum.Enum):
    """Event lifecycle states."""
    DRAFT = "draft"
    PLANNING = "planning"
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in_progress"
    ACTIVE = "active"  # Kept for backward compatibility
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    POSTPONED = "postponed"


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

    # RSVP customization settings
    rsvp_deadline = Column(DateTime(timezone=True))
    allow_plus_ones = Column(Boolean, nullable=False, default=False)
    meal_options = Column(JSONB)  # JSON array
    custom_questions = Column(JSONB)  # JSON array
    dietary_restrictions_enabled = Column(Boolean, nullable=False, default=False)

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
    venues = relationship("EventVenue", back_populates="event", cascade="all, delete-orphan", order_by="EventVenue.display_order")

    # Computed properties
    @hybrid_property
    def guest_count(self) -> int:
        """Total number of guests invited to the event."""
        # Check if guests relationship is loaded (inspect returns InspectionAttr or None)
        from sqlalchemy import inspect
        state = inspect(self)

        # If relationship is not loaded, return 0 to avoid lazy loading
        if 'guests' not in state.dict:
            return 0

        guests = state.dict.get('guests')
        if guests is not None:
            return len(guests)
        return 0

    @hybrid_property
    def confirmed_guests(self) -> int:
        """Number of guests who confirmed attendance (RSVP status = attending)."""
        from sqlalchemy import inspect
        from app.models.guest import RsvpStatus

        state = inspect(self)

        # If relationship is not loaded, return 0 to avoid lazy loading
        if 'guests' not in state.dict:
            return 0

        guests = state.dict.get('guests')
        if guests is not None:
            return sum(1 for guest in guests if guest.rsvp_status == RsvpStatus.ATTENDING)
        return 0

    @hybrid_property
    def total_expenses(self) -> Decimal:
        """Total amount of all expenses for the event."""
        from sqlalchemy import inspect

        state = inspect(self)

        # If relationship is not loaded, return 0 to avoid lazy loading
        if 'expenses' not in state.dict:
            return Decimal("0.00")

        expenses = state.dict.get('expenses')
        if expenses is not None:
            return sum((expense.amount for expense in expenses), Decimal("0.00"))
        return Decimal("0.00")