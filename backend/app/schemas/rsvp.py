"""Pydantic schemas for public RSVP system."""
"""FR-6: The system shall display an RSVP submission page. 5.1.1"""
"""This is the database schemas for the RSVP part of the project"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.models.guest import RsvpStatus


class RSVPValidationResponse(BaseModel):
    """Response for token validation."""
    is_valid: bool
    error_message: Optional[str] = None
    guest_id: Optional[str] = None
    guest_name: Optional[str] = None
    event_id: Optional[str] = None
    event_name: Optional[str] = None
    current_rsvp_status: Optional[RsvpStatus] = None
    plus_one_allowed: bool = False
    token_expires_at: Optional[datetime] = None


class RSVPEventDetailsResponse(BaseModel):
    """Complete event details for RSVP page (public endpoint)."""
    model_config = ConfigDict(from_attributes=True)

    # Guest information
    guest: dict[str, str | bool]  # first_name, last_name, email, plus_one_allowed
    current_rsvp_status: RsvpStatus
    plus_one_name: Optional[str] = None
    dietary_restrictions: Optional[str] = None
    meal_preference: Optional[str] = None

    # Event information
    event: dict[str, str | None]  # name, description, type, start_date, end_date, location, venue_name, venue_address
    rsvp_deadline: Optional[str] = None
    custom_message: Optional[str] = None
    host_name: str


class RSVPSubmissionRequest(BaseModel):
    """Request for submitting RSVP response."""
    rsvp_status: RsvpStatus = Field(..., description="RSVP response (attending, not_attending, maybe)")
    plus_one_name: Optional[str] = Field(None, max_length=200, description="Name of plus-one guest")
    dietary_restrictions: Optional[str] = Field(None, max_length=500, description="Dietary restrictions or preferences")
    meal_preference: Optional[str] = Field(None, max_length=200, description="Meal choice (if applicable)")
    notes: Optional[str] = Field(None, max_length=1000, description="Additional notes or comments")


class RSVPSubmissionResponse(BaseModel):
    """Response after RSVP submission."""
    success: bool
    message: str
    rsvp_status: RsvpStatus
    guest_name: str
    event_name: str
    submitted_at: datetime


class RSVPPreferencesUpdate(BaseModel):
    """Update meal preferences and dietary restrictions."""
    dietary_restrictions: Optional[str] = Field(None, max_length=500)
    meal_preference: Optional[str] = Field(None, max_length=200)
    notes: Optional[str] = Field(None, max_length=1000)


class RSVPPlusOneUpdate(BaseModel):
    """Update plus-one information."""
    plus_one_name: Optional[str] = Field(None, max_length=200, description="Name of plus-one guest (empty to remove)")


class RSVPStatistics(BaseModel):
    """RSVP statistics for event planners (admin endpoint)."""
    event_id: str
    total_invited: int
    responded: int
    pending: int
    attending: int
    not_attending: int
    maybe: int
    response_rate: float
    plus_ones_confirmed: int
    dietary_restrictions_count: int
    last_response_at: Optional[datetime] = None


class RateLimitInfo(BaseModel):
    """Rate limit information."""
    limit: int
    remaining: int
    reset_at: datetime
    retry_after: Optional[int] = None  # seconds until retry allowed


class RSVPEmailPreferencesUpdate(BaseModel):
    """Update email notification preferences (Phase 5.2.4)."""
    email_notifications_enabled: Optional[bool] = Field(None, description="Enable/disable all email notifications")
    reminder_emails_enabled: Optional[bool] = Field(None, description="Enable/disable reminder emails")
    thank_you_emails_enabled: Optional[bool] = Field(None, description="Enable/disable thank you emails")


class RSVPEmailPreferencesResponse(BaseModel):
    """Response for email preferences."""
    success: bool
    message: str
    email_notifications_enabled: bool
    reminder_emails_enabled: bool
    thank_you_emails_enabled: bool


class UnsubscribeRequest(BaseModel):
    """Request to unsubscribe from event emails."""
    confirm: bool = Field(..., description="Must be true to confirm unsubscribe")


class UnsubscribeResponse(BaseModel):
    """Response after unsubscribe action."""
    success: bool
    message: str
    guest_name: str
    event_name: str
