"""
Pydantic schemas for seating chart management.

FR-21: The system shall provide an interactive seating chart interface
Phase 6.1.1 Seating Chart Data Models

"""
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict, field_validator
from app.models.seating_chart import TableType, VenueUnit


# ============================================================================
# Seating Chart Schemas
# ============================================================================

class SeatingChartBase(BaseModel):
    """Base seating chart schema with common fields."""
    name: str = Field(..., min_length=1, max_length=255)
    venue_width: Decimal = Field(..., gt=0, description="Venue width in specified unit")
    venue_height: Decimal = Field(..., gt=0, description="Venue height in specified unit")
    venue_unit: VenueUnit = VenueUnit.FEET
    background_image_url: Optional[str] = None
    chart_metadata: Optional[Dict[str, Any]] = None

    @field_validator('venue_width', 'venue_height')
    @classmethod
    def validate_dimensions(cls, v: Decimal) -> Decimal:
        """Validate venue dimensions are reasonable."""
        if v > 10000:
            raise ValueError("Venue dimensions cannot exceed 10,000 units")
        return v


class SeatingChartCreate(SeatingChartBase):
    """Schema for creating a new seating chart."""
    event_id: UUID
    version: int = 1
    is_active: bool = True


class SeatingChartUpdate(BaseModel):
    """Schema for updating an existing seating chart."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    venue_width: Optional[Decimal] = Field(None, gt=0)
    venue_height: Optional[Decimal] = Field(None, gt=0)
    venue_unit: Optional[VenueUnit] = None
    background_image_url: Optional[str] = None
    version: Optional[int] = None
    is_active: Optional[bool] = None
    chart_metadata: Optional[Dict[str, Any]] = None


class SeatingChartResponse(SeatingChartBase):
    """Schema for seating chart response."""
    id: UUID
    event_id: UUID
    version: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Table Layout Schemas
# ============================================================================

class TableLayoutBase(BaseModel):
    """Base table layout schema with common fields."""
    table_number: str = Field(..., min_length=1, max_length=100)
    table_type: TableType = TableType.ROUND
    x_position: Decimal = Field(..., description="X coordinate on canvas")
    y_position: Decimal = Field(..., description="Y coordinate on canvas")
    width: Decimal = Field(..., gt=0, description="Table width")
    height: Decimal = Field(..., gt=0, description="Table height")
    rotation: Decimal = Field(default=0, ge=0, le=360, description="Rotation in degrees")
    capacity: int = Field(..., gt=0, le=100, description="Maximum number of seats")
    table_metadata: Optional[Dict[str, Any]] = None

    @field_validator('capacity')
    @classmethod
    def validate_capacity(cls, v: int) -> int:
        """Validate table capacity is reasonable."""
        if v < 1:
            raise ValueError("Table capacity must be at least 1")
        if v > 100:
            raise ValueError("Table capacity cannot exceed 100 seats")
        return v

    @field_validator('width', 'height')
    @classmethod
    def validate_dimensions(cls, v: Decimal) -> Decimal:
        """Validate table dimensions are reasonable."""
        if v > 1000:
            raise ValueError("Table dimensions cannot exceed 1,000 units")
        return v


class TableLayoutCreate(TableLayoutBase):
    """Schema for creating a new table layout."""
    seating_chart_id: UUID


class TableLayoutUpdate(BaseModel):
    """Schema for updating an existing table layout."""
    table_number: Optional[str] = Field(None, min_length=1, max_length=100)
    table_type: Optional[TableType] = None
    x_position: Optional[Decimal] = None
    y_position: Optional[Decimal] = None
    width: Optional[Decimal] = Field(None, gt=0)
    height: Optional[Decimal] = Field(None, gt=0)
    rotation: Optional[Decimal] = Field(None, ge=0, le=360)
    capacity: Optional[int] = Field(None, gt=0, le=100)
    table_metadata: Optional[Dict[str, Any]] = None


class TableLayoutResponse(TableLayoutBase):
    """Schema for table layout response."""
    id: UUID
    seating_chart_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Seat Assignment Schemas
# ============================================================================

class SeatAssignmentBase(BaseModel):
    """Base seat assignment schema with common fields."""
    seat_number: int = Field(..., ge=1, description="Seat number within table")
    seat_position: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None

    @field_validator('seat_number')
    @classmethod
    def validate_seat_number(cls, v: int) -> int:
        """Validate seat number is positive."""
        if v < 1:
            raise ValueError("Seat number must be at least 1")
        if v > 100:
            raise ValueError("Seat number cannot exceed 100")
        return v

    @field_validator('notes')
    @classmethod
    def validate_notes(cls, v: Optional[str]) -> Optional[str]:
        """Validate notes length."""
        if v and len(v) > 500:
            raise ValueError("Notes cannot exceed 500 characters")
        return v


class SeatAssignmentCreate(SeatAssignmentBase):
    """Schema for creating a new seat assignment."""
    table_layout_id: UUID
    guest_id: Optional[UUID] = None  # Nullable for empty/reserved seats


class SeatAssignmentUpdate(BaseModel):
    """Schema for updating an existing seat assignment."""
    guest_id: Optional[UUID] = None
    seat_number: Optional[int] = Field(None, ge=1)
    seat_position: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None


class SeatAssignmentResponse(SeatAssignmentBase):
    """Schema for seat assignment response."""
    id: UUID
    table_layout_id: UUID
    guest_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Composite/Summary Schemas
# ============================================================================

class SeatAssignmentWithGuest(SeatAssignmentResponse):
    """Seat assignment with guest details populated."""
    guest_name: Optional[str] = None
    guest_email: Optional[str] = None
    guest_rsvp_status: Optional[str] = None


class TableLayoutWithSeats(TableLayoutResponse):
    """Table layout with seat assignments populated."""
    seat_assignments: List[SeatAssignmentResponse] = []
    assigned_count: int = 0
    empty_seats: int = 0

    @field_validator('assigned_count', 'empty_seats')
    @classmethod
    def compute_seat_counts(cls, v: int, info) -> int:
        """Compute assigned and empty seat counts."""
        # This will be computed by the API, not validated here
        return v


class SeatingChartWithTables(SeatingChartResponse):
    """Seating chart with table layouts populated (includes seat_assignments)."""
    tables: List[TableLayoutWithSeats] = []
    total_tables: int = 0
    total_capacity: int = 0
    total_assigned: int = 0

    @field_validator('total_tables', 'total_capacity', 'total_assigned')
    @classmethod
    def compute_totals(cls, v: int, info) -> int:
        """Compute total counts."""
        # This will be computed by the API, not validated here
        return v


class SeatingChartSummary(BaseModel):
    """Lightweight seating chart summary for lists."""
    id: UUID
    event_id: UUID
    name: str
    version: int
    is_active: bool
    total_tables: int = 0
    total_capacity: int = 0
    total_assigned: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Bulk Operation Schemas
# ============================================================================

class BulkTableCreate(BaseModel):
    """Schema for bulk creating tables."""
    seating_chart_id: UUID
    tables: List[TableLayoutBase]

    @field_validator('tables')
    @classmethod
    def validate_tables(cls, v: List[TableLayoutBase]) -> List[TableLayoutBase]:
        """Validate bulk table creation."""
        if len(v) == 0:
            raise ValueError("At least one table must be provided")
        if len(v) > 100:
            raise ValueError("Cannot create more than 100 tables at once")

        # Check for duplicate table numbers
        table_numbers = [table.table_number for table in v]
        if len(table_numbers) != len(set(table_numbers)):
            raise ValueError("Duplicate table numbers not allowed")

        return v


class BulkSeatAssignmentCreate(BaseModel):
    """Schema for bulk creating seat assignments."""
    table_layout_id: UUID
    assignments: List[SeatAssignmentBase]

    @field_validator('assignments')
    @classmethod
    def validate_assignments(cls, v: List[SeatAssignmentBase]) -> List[SeatAssignmentBase]:
        """Validate bulk seat assignment creation."""
        if len(v) == 0:
            raise ValueError("At least one assignment must be provided")
        if len(v) > 100:
            raise ValueError("Cannot create more than 100 assignments at once")

        # Check for duplicate seat numbers
        seat_numbers = [assignment.seat_number for assignment in v]
        if len(seat_numbers) != len(set(seat_numbers)):
            raise ValueError("Duplicate seat numbers not allowed")

        return v


class AutoAssignRequest(BaseModel):
    """Schema for auto-assigning guests to seats."""
    seating_chart_id: UUID
    guest_ids: List[UUID]
    strategy: str = Field(default="fill_tables", description="Assignment strategy (fill_tables, distribute, custom)")
    preferences: Optional[Dict[str, Any]] = None

    @field_validator('guest_ids')
    @classmethod
    def validate_guest_ids(cls, v: List[UUID]) -> List[UUID]:
        """Validate guest IDs."""
        if len(v) == 0:
            raise ValueError("At least one guest must be provided")
        if len(v) != len(set(v)):
            raise ValueError("Duplicate guest IDs not allowed")
        return v

    @field_validator('strategy')
    @classmethod
    def validate_strategy(cls, v: str) -> str:
        """Validate assignment strategy."""
        valid_strategies = ["fill_tables", "distribute", "custom", "smart"]
        if v not in valid_strategies:
            raise ValueError(f"Strategy must be one of: {', '.join(valid_strategies)}")
        return v


# ============================================================================
# Smart Seating Schemas (Phase 6.2.1)
# ============================================================================

"""
FR-21: The system shall provide an interactive seating chart interface
Phase 6.2.1 Smart Seating Features
"""

class SmartAssignPreferences(BaseModel):
    """
    Preferences for smart seating assignment algorithm.

    Configurable weights allow event planners to prioritize criteria based
    on their specific event type (corporate, wedding, conference, etc.).
    """
    prioritize_dietary: bool = Field(default=True, description="Group guests by dietary restrictions")
    weight_dietary: float = Field(default=0.8, ge=0.0, le=1.0, description="Weight for dietary matching (0.0-1.0)")

    keep_plus_ones_together: bool = Field(default=True, description="Always seat plus-ones together (mandatory)")

    group_by_organization: bool = Field(default=True, description="Group guests from same organization/email domain")
    weight_organization: float = Field(default=0.6, ge=0.0, le=1.0, description="Weight for organization matching (0.0-1.0)")

    group_families: bool = Field(default=True, description="Group guests with same last name (family detection)")
    weight_family: float = Field(default=0.4, ge=0.0, le=1.0, description="Weight for family matching (0.0-1.0)")

    cluster_meal_preferences: bool = Field(default=True, description="Group guests with same meal preferences")
    weight_meal: float = Field(default=0.5, ge=0.0, le=1.0, description="Weight for meal preference matching (0.0-1.0)")

    balance_tables: bool = Field(default=True, description="Distribute guests evenly vs filling sequentially")

    @field_validator('weight_dietary', 'weight_organization', 'weight_family', 'weight_meal')
    @classmethod
    def validate_weights(cls, v: float) -> float:
        """Validate weight values are between 0.0 and 1.0."""
        if not 0.0 <= v <= 1.0:
            raise ValueError("Weight must be between 0.0 and 1.0")
        return v


class SuggestionScore(BaseModel):
    """
    Scoring breakdown for a single guest-table assignment suggestion.

    Provides transparency into why the algorithm suggested this placement,
    allowing event planners to understand and validate the recommendations.
    """
    guest_id: UUID
    guest_name: str
    table_id: UUID
    table_number: str
    seat_number: int
    total_score: float = Field(..., ge=0.0, le=1.0, description="Overall compatibility score (0.0-1.0)")
    breakdown: Dict[str, float] = Field(
        default_factory=dict,
        description="Individual scores by criterion (dietary, organization, family, meal)"
    )
    reasoning: List[str] = Field(
        default_factory=list,
        description="Human-readable explanations for the suggestion"
    )
    confidence: str = Field(..., description="Confidence level (high, medium, low)")

    @field_validator('total_score')
    @classmethod
    def validate_total_score(cls, v: float) -> float:
        """Validate total score is between 0.0 and 1.0."""
        if not 0.0 <= v <= 1.0:
            raise ValueError("Total score must be between 0.0 and 1.0")
        return v

    @field_validator('confidence')
    @classmethod
    def validate_confidence(cls, v: str) -> str:
        """Validate confidence level."""
        valid_levels = ["high", "medium", "low"]
        if v not in valid_levels:
            raise ValueError(f"Confidence must be one of: {', '.join(valid_levels)}")
        return v


class SmartAssignRequest(AutoAssignRequest):
    """
    Extended auto-assign request with smart seating preferences.

    Inherits from AutoAssignRequest and adds smart-specific configuration.
    """
    strategy: str = Field(default="smart", description="Must be 'smart' for smart assignment")
    preferences: Optional[SmartAssignPreferences] = Field(
        default=None,
        description="Smart assignment preferences (uses defaults if not provided)"
    )

    @field_validator('strategy')
    @classmethod
    def validate_smart_strategy(cls, v: str) -> str:
        """Ensure strategy is 'smart' for this request type."""
        if v != "smart":
            raise ValueError("SmartAssignRequest requires strategy='smart'")
        return v


class SmartAssignResponse(BaseModel):
    """
    Response from smart seating assignment with detailed scoring.

    Includes assignment details, suggestion scores, and enhanced statistics
    to help event planners understand the algorithm's decisions.
    """
    seating_chart_id: UUID
    strategy: str
    total_guests: int = Field(..., ge=0, description="Total guests in request")
    already_assigned: int = Field(..., ge=0, description="Guests already seated (skipped)")
    newly_assigned: int = Field(..., ge=0, description="Guests assigned in this operation")
    total_capacity: int = Field(..., ge=0, description="Total seating capacity across all tables")
    remaining_capacity: int = Field(..., ge=0, description="Empty seats after assignment")

    assignments: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="List of seat assignments with guest/table details"
    )

    suggestions: List[SuggestionScore] = Field(
        default_factory=list,
        description="Detailed scoring breakdown for each assignment"
    )

    statistics: Dict[str, Any] = Field(
        default_factory=dict,
        description="Enhanced statistics (avg_confidence_score, dietary_groups_formed, etc.)"
    )

    model_config = ConfigDict(from_attributes=True)


class SeatingStatistics(BaseModel):
    """
    Detailed seating chart statistics for analytics dashboard.

    Extends the basic statistics endpoint with smart seating insights.
    """
    seating_chart_id: UUID
    total_tables: int = Field(..., ge=0)
    total_capacity: int = Field(..., ge=0)
    total_assigned: int = Field(..., ge=0)
    total_unseated: int = Field(..., ge=0)
    utilization_rate: float = Field(..., ge=0.0, le=1.0, description="Assigned / Capacity")

    # Table-level statistics
    tables_full: int = Field(..., ge=0, description="Tables at full capacity")
    tables_partial: int = Field(..., ge=0, description="Tables with some seats filled")
    tables_empty: int = Field(..., ge=0, description="Tables with no assignments")

    # Guest-level statistics
    guests_with_dietary_restrictions: int = Field(..., ge=0)
    guests_with_plus_ones: int = Field(..., ge=0)

    # Smart seating insights (optional - only if smart assignment used)
    dietary_groups_formed: Optional[int] = Field(None, ge=0)
    families_seated_together: Optional[int] = Field(None, ge=0)
    plus_ones_paired: Optional[int] = Field(None, ge=0)
    organization_clusters: Optional[int] = Field(None, ge=0)
    avg_table_compatibility: Optional[float] = Field(None, ge=0.0, le=1.0)

    model_config = ConfigDict(from_attributes=True)
