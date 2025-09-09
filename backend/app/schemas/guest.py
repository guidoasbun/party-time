"""Pydantic schemas for guest management."""
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from app.models.guest import RsvpStatus


class GuestBase(BaseModel):
    """Base guest schema with common fields."""
    email: EmailStr
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    phone: Optional[str] = None
    plus_one_allowed: bool = False
    plus_one_name: Optional[str] = Field(None, max_length=200)
    dietary_restrictions: Optional[str] = None
    notes: Optional[str] = None


class GuestCreate(GuestBase):
    """Schema for creating a new guest."""
    event_id: str  # UUID as string


class GuestUpdate(BaseModel):
    """Schema for updating guest information."""
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone: Optional[str] = None
    plus_one_allowed: Optional[bool] = None
    plus_one_name: Optional[str] = Field(None, max_length=200)
    dietary_restrictions: Optional[str] = None
    notes: Optional[str] = None


class GuestRSVPUpdate(BaseModel):
    """Schema for RSVP responses (public endpoint)."""
    rsvp_status: RsvpStatus
    plus_one_name: Optional[str] = Field(None, max_length=200)
    dietary_restrictions: Optional[str] = None


class Guest(GuestBase):
    """Schema for guest response."""
    model_config = ConfigDict(from_attributes=True)
    
    id: str  # UUID as string
    event_id: str
    rsvp_status: RsvpStatus
    invitation_sent_at: Optional[datetime] = None
    rsvp_responded_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class GuestWithToken(Guest):
    """Schema for guest with RSVP token (internal use)."""
    rsvp_token: str


class GuestSummary(BaseModel):
    """Summary schema for guest lists."""
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    first_name: str
    last_name: str
    email: EmailStr
    rsvp_status: RsvpStatus
    plus_one_allowed: bool
    plus_one_name: Optional[str] = None


class GuestBulkCreate(BaseModel):
    """Schema for bulk guest creation (CSV import)."""
    guests: List[GuestBase]
    send_invitations: bool = False