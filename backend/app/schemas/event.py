"""Pydantic schemas for event management."""
from typing import Optional, List, Literal
from datetime import datetime
from decimal import Decimal
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict, field_serializer, field_validator
from app.models.event import EventType, EventStatus



# FR-6: The system shall display an RSVP submission page.
# 5.1.4: RSVP Customization
class RSVPCustomQuestion(BaseModel):
    """Schema for custom RSVP questions."""
    id: str
    question: str = Field(..., min_length=1, max_length=500)
    type: Literal['text', 'select', 'yes_no']
    options: Optional[List[str]] = None
    required: bool = False
    order: int = Field(..., ge=0)

    @field_validator('options')
    @classmethod
    def validate_options(cls, v: Optional[List[str]], info) -> Optional[List[str]]:
        """Validate options are provided for select type."""
        question_type = info.data.get('type')
        if question_type == 'select' and (not v or len(v) == 0):
            raise ValueError("Options are required for select type questions")
        if question_type != 'select' and v:
            raise ValueError("Options should only be provided for select type questions")
        if v and len(v) > 20:
            raise ValueError("Maximum 20 options allowed per question")
        return v


class EventBase(BaseModel):
    """Base event schema with common fields."""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    type: EventType
    start_date: datetime
    end_date: Optional[datetime] = None
    location: Optional[str] = None
    venue_name: Optional[str] = None
    venue_address: Optional[str] = None
    venue_google_place_id: Optional[str] = None
    max_guests: Optional[int] = Field(None, gt=0)
    budget_total: Optional[Decimal] = Field(None, ge=0)
    is_public: bool = False

    # RSVP customization settings
    # FR-6: The system shall display an RSVP submission page.
    # 5.1.4: RSVP Customization
    rsvp_deadline: Optional[datetime] = None
    allow_plus_ones: bool = False
    meal_options: Optional[List[str]] = None
    custom_questions: Optional[List[RSVPCustomQuestion]] = None
    dietary_restrictions_enabled: bool = False

    @field_validator('meal_options')
    @classmethod
    def validate_meal_options(cls, v: Optional[List[str]]) -> Optional[List[str]]:
        """Validate meal options."""
        if v is not None:
            if len(v) > 10:
                raise ValueError("Maximum 10 meal options allowed")
            if len(v) != len(set(v)):
                raise ValueError("Duplicate meal options not allowed")
            for option in v:
                if not option or len(option.strip()) == 0:
                    raise ValueError("Meal options cannot be empty")
                if len(option) > 100:
                    raise ValueError("Each meal option must be less than 100 characters")
        return v

    # FR-6: The system shall display an RSVP submission page.
    # 5.1.4: RSVP Customization
    @field_validator('custom_questions')
    @classmethod
    def validate_custom_questions(cls, v: Optional[List[RSVPCustomQuestion]]) -> Optional[List[RSVPCustomQuestion]]:
        """Validate custom questions."""
        if v is not None:
            if len(v) > 5:
                raise ValueError("Maximum 5 custom questions allowed")
            # Ensure unique IDs and orders
            ids = [q.id for q in v]
            if len(ids) != len(set(ids)):
                raise ValueError("Duplicate question IDs not allowed")
        return v

    # FR-6: The system shall display an RSVP submission page.
    # 5.1.4: RSVP Customization
    @field_validator('rsvp_deadline')
    @classmethod
    def validate_rsvp_deadline(cls, v: Optional[datetime], info) -> Optional[datetime]:
        """Validate RSVP deadline is before event start date."""
        if v is not None:
            start_date = info.data.get('start_date')
            if start_date and v > start_date:
                raise ValueError("RSVP deadline must be before event start date")
        return v


class EventCreate(EventBase):
    """Schema for creating a new event."""
    status: EventStatus = EventStatus.DRAFT


class EventUpdate(BaseModel):
    """Schema for updating event information."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    type: Optional[EventType] = None
    status: Optional[EventStatus] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    location: Optional[str] = None
    venue_name: Optional[str] = None
    venue_address: Optional[str] = None
    venue_google_place_id: Optional[str] = None
    max_guests: Optional[int] = Field(None, gt=0)
    budget_total: Optional[Decimal] = Field(None, ge=0)
    is_public: Optional[bool] = None

    # RSVP customization settings
    # FR-6: The system shall display an RSVP submission page.
    # 5.1.4: RSVP Customization
    rsvp_deadline: Optional[datetime] = None
    allow_plus_ones: Optional[bool] = None
    meal_options: Optional[List[str]] = None
    custom_questions: Optional[List[RSVPCustomQuestion]] = None
    dietary_restrictions_enabled: Optional[bool] = None


class Event(EventBase):
    """Schema for event response."""
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    status: EventStatus
    planner_id: UUID
    created_at: datetime
    updated_at: datetime

    # Summary data (calculated fields - computed by model hybrid properties)
    guest_count: int = 0
    confirmed_guests: int = 0
    total_expenses: Decimal = Decimal("0.00")

    @field_serializer('id', 'planner_id')
    def serialize_uuid(self, value: UUID) -> str:
        """Convert UUID to string for JSON serialization."""
        return str(value)


class EventWithDetails(Event):
    """Schema for event with related data."""
    guests: List["GuestSummary"] = []
    budget_categories: List["BudgetCategorySummary"] = []
    recent_expenses: List["ExpenseSummary"] = []


# Import these from their respective schema files to avoid circular imports
from app.schemas.guest import GuestSummary
from app.schemas.budget import BudgetCategorySummary, ExpenseSummary

EventWithDetails.model_rebuild()