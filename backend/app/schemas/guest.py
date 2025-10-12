"""Pydantic schemas for guest management."""
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_serializer
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
    pass


class GuestUpdate(BaseModel):
    """Schema for updating guest information."""
    email: Optional[EmailStr] = None
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone: Optional[str] = None
    plus_one_allowed: Optional[bool] = None
    plus_one_name: Optional[str] = Field(None, max_length=200)
    dietary_restrictions: Optional[str] = None
    notes: Optional[str] = None
    rsvp_status: Optional[RsvpStatus] = None


class GuestRSVPUpdate(BaseModel):
    """Schema for RSVP responses (public endpoint)."""
    rsvp_status: RsvpStatus
    plus_one_name: Optional[str] = Field(None, max_length=200)
    dietary_restrictions: Optional[str] = None


class Guest(GuestBase):
    """Schema for guest response."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    event_id: UUID
    rsvp_status: RsvpStatus
    invitation_sent_at: Optional[datetime] = None
    rsvp_responded_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    @field_serializer('id', 'event_id')
    def serialize_uuid(self, value: UUID) -> str:
        """Convert UUID to string for JSON serialization."""
        return str(value)


class GuestWithToken(Guest):
    """Schema for guest with RSVP token (internal use)."""
    rsvp_token: str
    token_expires_at: Optional[datetime] = None
    token_first_accessed_at: Optional[datetime] = None
    token_last_accessed_at: Optional[datetime] = None


class GuestSummary(BaseModel):
    """Summary schema for guest lists."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    first_name: str
    last_name: str
    email: EmailStr
    rsvp_status: RsvpStatus
    
    @field_serializer('id')
    def serialize_uuid(self, value: UUID) -> str:
        """Convert UUID to string for JSON serialization."""
        return str(value)
    plus_one_allowed: bool
    plus_one_name: Optional[str] = None


class GuestBulkCreate(BaseModel):
    """Schema for bulk guest creation (CSV import)."""
    guests: List[GuestBase]
    send_invitations: bool = False


class InvitationLinkData(BaseModel):
    """Schema for invitation link information."""
    rsvp_url: str
    token: str
    formatted_token: str
    shareable_text: str
    sharing_links: dict[str, str]
    qr_code_url: Optional[str] = None


class TokenValidationResult(BaseModel):
    """Schema for token validation response."""
    is_valid: bool
    error_message: Optional[str] = None
    guest_name: Optional[str] = None
    event_name: Optional[str] = None


class RSVPEventDetails(BaseModel):
    """Schema for public event details (for RSVP page)."""
    model_config = ConfigDict(from_attributes=True)

    guest: dict[str, str | bool]  # first_name, last_name, email, plus_one_allowed
    event: dict[str, str]  # name, description, start_date, end_date, venue_name, venue_address
    rsvp_deadline: Optional[str] = None
    custom_message: Optional[str] = None


class QRCodeOptions(BaseModel):
    """Schema for QR code generation options."""
    box_size: int = 10
    border: int = 4
    theme: str = "light"
    format: str = "png"


class DuplicateDetail(BaseModel):
    """Schema for duplicate guest detail."""
    row_number: int
    email: str
    first_name: str
    last_name: str
    reason: str


class ImportError(BaseModel):
    """Schema for import error detail."""
    row_number: int
    errors: List[str]
    data: dict[str, str]


class CSVImportPreview(BaseModel):
    """Schema for CSV import preview response."""
    total_rows: int
    valid_rows: int
    duplicate_rows: int
    error_rows: int
    duplicates: List[DuplicateDetail]
    errors: List[ImportError]
    sample_guests: List[dict[str, str | bool | None]]
    column_mapping: dict[str, str]


class CSVImportResult(BaseModel):
    """Schema for CSV import execution result."""
    success_count: int
    error_count: int
    skipped_count: int
    created_guest_ids: List[str]
    errors: List[str]