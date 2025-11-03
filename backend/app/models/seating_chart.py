"""
Seating chart models for event table layouts and seat assignments.

FR-21: The system shall provide an interactive seating chart interface
Phase 6.1.1 Seating Chart Data Models

"""
from sqlalchemy import Column, String, Boolean, Enum as SQLEnum, DateTime, Integer, Text, ForeignKey, DECIMAL, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum

from app.db.base import Base


class TableType(str, enum.Enum):
    """Types of tables supported for seating arrangements."""
    ROUND = "round"
    RECTANGULAR = "rectangular"
    SQUARE = "square"
    CUSTOM = "custom"


class VenueUnit(str, enum.Enum):
    """Units of measurement for venue dimensions."""
    METERS = "meters"
    FEET = "feet"


class SeatingChart(Base):
    """
    Main seating chart for an event.

    Supports venue dimensions, layout versioning for undo/redo functionality,
    and flexible metadata storage for custom properties.
    """
    __tablename__ = "seating_charts"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Event association (one-to-one relationship with Event)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)

    # Chart identification
    name = Column(String(255), nullable=False)  # e.g., "Reception Layout v2"

    # Venue dimensions
    venue_width = Column(DECIMAL(10, 2), nullable=False)  # Width in specified unit
    venue_height = Column(DECIMAL(10, 2), nullable=False)  # Height in specified unit
    venue_unit = Column(SQLEnum(VenueUnit), nullable=False, default=VenueUnit.FEET)

    # Optional background image (floor plan)
    background_image_url = Column(Text)

    # Versioning for undo/redo
    version = Column(Integer, nullable=False, default=1)
    is_active = Column(Boolean, nullable=False, default=True)

    # Flexible metadata storage (obstacles, special areas, custom properties)
    chart_metadata = Column(JSONB)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    event = relationship("Event", backref="seating_chart")
    tables = relationship("TableLayout", back_populates="seating_chart", cascade="all, delete-orphan")


class TableLayout(Base):
    """
    Individual table/seating area within a seating chart.

    Defines table properties including type, position, dimensions, rotation,
    and capacity. Supports various table shapes and custom configurations.
    """
    __tablename__ = "table_layouts"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Seating chart association
    seating_chart_id = Column(UUID(as_uuid=True), ForeignKey("seating_charts.id", ondelete="CASCADE"), nullable=False, index=True)

    # Table identification
    table_number = Column(String(100), nullable=False)  # e.g., "Table 1", "Head Table", "Bar"
    table_type = Column(SQLEnum(TableType), nullable=False, default=TableType.ROUND)

    # Position on canvas (coordinates)
    x_position = Column(DECIMAL(10, 2), nullable=False, default=0)
    y_position = Column(DECIMAL(10, 2), nullable=False, default=0)

    # Dimensions
    width = Column(DECIMAL(10, 2), nullable=False)  # Width in pixels or relative units
    height = Column(DECIMAL(10, 2), nullable=False)  # Height in pixels or relative units
    rotation = Column(DECIMAL(5, 2), nullable=False, default=0)  # Rotation in degrees (0-360)

    # Capacity
    capacity = Column(Integer, nullable=False, default=8)  # Maximum number of seats

    # Flexible metadata (shape details, color, custom properties, visual settings)
    table_metadata = Column(JSONB)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    seating_chart = relationship("SeatingChart", back_populates="tables")
    seat_assignments = relationship("SeatAssignment", back_populates="table", cascade="all, delete-orphan")


class SeatAssignment(Base):
    """
    Maps guests to specific seats at tables.

    Tracks seat assignments within tables, allowing for empty seats,
    special requirements, and flexible positioning.
    """
    __tablename__ = "seat_assignments"
    __table_args__ = (
        # Ensure a guest can only be assigned to one seat per table
        UniqueConstraint('table_layout_id', 'guest_id', name='uq_table_guest'),
        # Ensure seat numbers are unique within a table
        UniqueConstraint('table_layout_id', 'seat_number', name='uq_table_seat_number'),
    )

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Table association
    table_layout_id = Column(UUID(as_uuid=True), ForeignKey("table_layouts.id", ondelete="CASCADE"), nullable=False, index=True)

    # Guest assignment (nullable for empty/reserved seats)
    guest_id = Column(UUID(as_uuid=True), ForeignKey("guests.id", ondelete="SET NULL"), nullable=True, index=True)

    # Seat identification
    seat_number = Column(Integer, nullable=False)  # Sequential seat number within table (1, 2, 3...)

    # Position within table (relative coordinates, angle, custom positioning)
    seat_position = Column(JSONB)

    # Special requirements or notes
    notes = Column(Text)  # e.g., "Wheelchair accessible", "VIP", "Children's seat"

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    table = relationship("TableLayout", back_populates="seat_assignments")
    guest = relationship("Guest", backref="seat_assignment")
