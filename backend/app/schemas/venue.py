"""
FR-8: The system shall provide a venue search interface.
Phase 7.1.1: Google Places API Integration
Pydantic schemas for venue management (Phase 7.1.1: Google Places API Integration).
"""
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict, field_serializer
from enum import Enum


class VenueType(str, Enum):
    """Venue type categories for filtering."""
    RESTAURANT = "restaurant"
    BANQUET_HALL = "banquet_hall"
    HOTEL = "hotel"
    CONFERENCE_CENTER = "conference_center"
    OUTDOOR = "outdoor"
    WEDDING_VENUE = "wedding_venue"
    BAR_CLUB = "bar_club"
    COMMUNITY_CENTER = "community_center"
    PRIVATE_ESTATE = "private_estate"
    OTHER = "other"


# ============================================================
# Google Places API Response Schemas
# ============================================================

class VenueLocation(BaseModel):
    """Geographic coordinates for a venue."""
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)


class VenuePhotoResponse(BaseModel):
    """Photo information from Google Places."""
    url: str
    width: int
    height: int
    attributions: List[str] = Field(default_factory=list)


class VenueReviewResponse(BaseModel):
    """Review information from Google Places."""
    author_name: str
    rating: float = Field(..., ge=1, le=5)
    text: str
    time: str  # ISO timestamp string (e.g., "2025-11-26T09:38:05.368831841Z")
    relative_time_description: str
    profile_photo_url: Optional[str] = None


class VenueOpeningPeriod(BaseModel):
    """Opening hours period."""
    open_day: int = Field(..., ge=0, le=6)  # 0=Sunday, 6=Saturday
    open_time: str  # HH:MM format
    close_day: int = Field(..., ge=0, le=6)
    close_time: str  # HH:MM format


class VenueOpeningHours(BaseModel):
    """Opening hours information."""
    open_now: Optional[bool] = None
    weekday_text: List[str] = Field(default_factory=list)
    periods: List[VenueOpeningPeriod] = Field(default_factory=list)


class VenueSearchResult(BaseModel):
    """Search result from Google Places API."""
    place_id: str
    name: str
    address: str
    location: VenueLocation
    rating: Optional[float] = Field(None, ge=1, le=5)
    user_ratings_total: Optional[int] = None
    price_level: Optional[int] = Field(None, ge=0, le=4)
    types: List[str] = Field(default_factory=list)
    photo_url: Optional[str] = None
    open_now: Optional[bool] = None


class VenueDetailsResponse(BaseModel):
    """Full venue details from Google Places API."""
    place_id: str
    name: str
    address: str
    formatted_address: str
    location: VenueLocation
    rating: Optional[float] = Field(None, ge=1, le=5)
    user_ratings_total: Optional[int] = None
    price_level: Optional[int] = Field(None, ge=0, le=4)
    types: List[str] = Field(default_factory=list)
    phone: Optional[str] = None
    website: Optional[str] = None
    opening_hours: Optional[VenueOpeningHours] = None
    photos: List[VenuePhotoResponse] = Field(default_factory=list)
    reviews: List[VenueReviewResponse] = Field(default_factory=list)
    url: Optional[str] = None  # Google Maps URL
    editorial_summary: Optional[str] = None


# ============================================================
# Search Parameters
# ============================================================

class VenueSearchParams(BaseModel):
    """Parameters for venue search."""
    query: str = Field(..., min_length=1, max_length=500)
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    radius: int = Field(default=50000, ge=1, le=50000)  # meters, max 50km
    venue_type: Optional[str] = None  # Google Places type filter
    min_rating: Optional[float] = Field(None, ge=1, le=5)
    max_results: int = Field(default=20, ge=1, le=50)


# ============================================================
# Event Venue Schemas (Database Model)
# ============================================================

class EventVenueBase(BaseModel):
    """Base schema for event venue."""
    name: str = Field(..., min_length=1, max_length=255)
    address: str = Field(..., min_length=1, max_length=500)
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    google_place_id: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    website: Optional[str] = Field(None, max_length=500)
    rating: Optional[float] = Field(None, ge=1, le=5)
    price_level: Optional[int] = Field(None, ge=0, le=4)
    photo_url: Optional[str] = Field(None, max_length=1000)
    is_manual: bool = False
    notes: Optional[str] = Field(None, max_length=2000)
    display_order: int = Field(default=0, ge=0)


class EventVenueCreate(BaseModel):
    """Schema for adding a venue to an event."""
    # Either provide place_id for Google venue or manual venue data
    place_id: Optional[str] = Field(None, description="Google Place ID for automatic population")
    # Manual venue fields (required if place_id is None)
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    address: Optional[str] = Field(None, min_length=1, max_length=500)
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    phone: Optional[str] = Field(None, max_length=50)
    website: Optional[str] = Field(None, max_length=500)
    notes: Optional[str] = Field(None, max_length=2000)


class EventVenueUpdate(BaseModel):
    """Schema for updating an event venue."""
    notes: Optional[str] = Field(None, max_length=2000)
    display_order: Optional[int] = Field(None, ge=0)
    # Allow manual field updates for manual venues
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    address: Optional[str] = Field(None, min_length=1, max_length=500)
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    phone: Optional[str] = Field(None, max_length=50)
    website: Optional[str] = Field(None, max_length=500)


class EventVenueResponse(EventVenueBase):
    """Response schema for event venue."""
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    event_id: UUID
    created_at: datetime
    updated_at: datetime

    @field_serializer('id', 'event_id')
    def serialize_uuid(self, value: UUID) -> str:
        """Convert UUID to string for JSON serialization."""
        return str(value)


class EventVenueWithDetails(EventVenueResponse):
    """Event venue with fresh Google Places details."""
    google_details: Optional[VenueDetailsResponse] = None


class EventVenueReorderRequest(BaseModel):
    """Request schema for reordering venues."""
    venue_ids: List[UUID] = Field(..., min_length=1)

    @field_serializer('venue_ids')
    def serialize_uuids(self, values: List[UUID]) -> List[str]:
        """Convert UUIDs to strings for JSON serialization."""
        return [str(v) for v in values]


# ============================================================
# List Response Schemas
# ============================================================

class VenueSearchResponse(BaseModel):
    """Response for venue search endpoint."""
    results: List[VenueSearchResult]
    total_results: int
    query: str
    cached: bool = False


class EventVenuesListResponse(BaseModel):
    """Response for listing event venues."""
    venues: List[EventVenueResponse]
    total: int
    event_id: UUID

    @field_serializer('event_id')
    def serialize_uuid(self, value: UUID) -> str:
        """Convert UUID to string for JSON serialization."""
        return str(value)
