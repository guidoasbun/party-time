"""Pydantic schemas for event management."""
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict, field_serializer
from app.models.event import EventType, EventStatus


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


class Event(EventBase):
    """Schema for event response."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    status: EventStatus
    planner_id: UUID
    created_at: datetime
    updated_at: datetime
    
    # Summary data (calculated fields)
    guest_count: Optional[int] = 0
    confirmed_guests: Optional[int] = 0
    total_expenses: Optional[Decimal] = Decimal("0.00")
    
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