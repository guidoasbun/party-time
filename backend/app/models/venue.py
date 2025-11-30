"""
FR-8: The system shall provide a venue search interface.
Phase 7.1.1: Google Places API Integration
EventVenue model for storing venues linked to events (Phase 7.1.1: Google Places API Integration).
"""
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Text, ForeignKey, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.db.base import Base


class EventVenue(Base):
    """
    Stores venue information for events.

    Uses hybrid storage approach:
    - Basic info (name, address, coordinates) stored locally
    - google_place_id for fetching fresh details from Google Places API
    - Supports manual venues (is_manual=True) without Google reference
    - One event can have multiple venues (1:many relationship)
    """
    __tablename__ = "event_venues"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Foreign key to event
    event_id = Column(
        UUID(as_uuid=True),
        ForeignKey("events.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Basic venue information (stored locally)
    name = Column(String(255), nullable=False)
    address = Column(String(500), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    # Google Places reference (for fetching fresh details)
    # NULL for manual venues
    google_place_id = Column(String(255), nullable=True, index=True)

    # Cached data from Google Places (optional)
    phone = Column(String(50), nullable=True)
    website = Column(String(500), nullable=True)
    rating = Column(Float, nullable=True)
    price_level = Column(Integer, nullable=True)  # 0-4 scale
    photo_url = Column(Text, nullable=True)  # Primary photo URL

    # Manual venue flag
    is_manual = Column(Boolean, nullable=False, default=False)

    # User notes about the venue
    notes = Column(Text, nullable=True)

    # Display ordering for multiple venues
    display_order = Column(Integer, nullable=False, default=0)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    event = relationship("Event", back_populates="venues")

    def __repr__(self) -> str:
        return f"<EventVenue {self.name} (event_id={self.event_id})>"
