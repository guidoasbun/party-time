"""RSVP service for managing invitation tokens and links."""
from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.guest import Guest
from app.crud.crud_guest import get_guest_by_rsvp_token
from app.utils.token_generator import (
    generate_rsvp_token,
    validate_token_format
)
from app.utils.qr_generator import (
    generate_rsvp_qr_code,
    generate_qr_code_base64,
    QRErrorCorrection
)


# Configuration
DEFAULT_BASE_URL = "http://localhost:3000"  # Will be overridden by env variable
DEFAULT_TOKEN_EXPIRY_DAYS = 90  # 3 months


class RSVPService:
    """Service for RSVP token and invitation management."""

    def __init__(self, base_url: str = DEFAULT_BASE_URL):
        """
        Initialize RSVP service.

        Args:
            base_url: Base URL for the application (e.g., https://party-time.com)
        """
        self.base_url = base_url.rstrip('/')

    def generate_token(self) -> str:
        """
        Generate a new RSVP token.

        Returns:
            8-character alphanumeric token
        """
        return generate_rsvp_token()

    def validate_token(self, token: str) -> bool:
        """
        Validate token format.

        Args:
            token: Token string to validate

        Returns:
            True if token format is valid
        """
        return validate_token_format(token)

    def generate_rsvp_url(self, token: str) -> str:
        """
        Generate full RSVP URL for a guest token.

        Args:
            token: Guest RSVP token

        Returns:
            Full RSVP URL

        Example:
            >>> service = RSVPService("https://party-time.com")
            >>> service.generate_rsvp_url("A3X7K9M2")
            'https://party-time.com/rsvp/A3X7K9M2'
        """
        return f"{self.base_url}/rsvp/{token}"

    def generate_invitation_text(
        self,
        guest_name: str,
        event_name: str,
        event_date: str,
        rsvp_url: str,
        custom_message: Optional[str] = None
    ) -> str:
        """
        Generate shareable invitation text.

        Args:
            guest_name: Name of the guest
            event_name: Name of the event
            event_date: Date of the event (formatted string)
            rsvp_url: RSVP URL
            custom_message: Optional custom message from host

        Returns:
            Formatted invitation text

        Example:
            >>> service = RSVPService()
            >>> text = service.generate_invitation_text(
            ...     "John Doe",
            ...     "Birthday Party",
            ...     "March 15, 2025 at 6:00 PM",
            ...     "https://party-time.com/rsvp/A3X7K9M2"
            ... )
        """
        lines = [
            f"🎉 You're Invited! 🎉",
            "",
            f"Dear {guest_name},",
            "",
            f"You're invited to {event_name}",
            f"📅 {event_date}",
            "",
        ]

        if custom_message:
            lines.extend([
                custom_message,
                "",
            ])

        lines.extend([
            "Please RSVP using the link below:",
            f"🔗 {rsvp_url}",
            "",
            "We look forward to seeing you!",
        ])

        return "\n".join(lines)

    def generate_email_invitation_text(
        self,
        guest_name: str,
        event_name: str,
        event_date: str,
        event_location: Optional[str],
        rsvp_url: str,
        host_name: str,
        custom_message: Optional[str] = None
    ) -> tuple[str, str]:
        """
        Generate email invitation (subject and body).

        Args:
            guest_name: Name of the guest
            event_name: Name of the event
            event_date: Date of the event
            event_location: Location of the event
            rsvp_url: RSVP URL
            host_name: Name of the host
            custom_message: Optional custom message

        Returns:
            Tuple of (subject, body)
        """
        subject = f"You're Invited to {event_name}!"

        body_lines = [
            f"Dear {guest_name},",
            "",
            f"{host_name} has invited you to:",
            f"📌 {event_name}",
            f"📅 {event_date}",
        ]

        if event_location:
            body_lines.append(f"📍 {event_location}")

        body_lines.append("")

        if custom_message:
            body_lines.extend([
                custom_message,
                "",
            ])

        body_lines.extend([
            "Please RSVP at your earliest convenience:",
            f"{rsvp_url}",
            "",
            "Looking forward to celebrating with you!",
            "",
            f"Best regards,",
            f"{host_name}",
        ])

        body = "\n".join(body_lines)
        return subject, body

    def generate_qr_code(
        self,
        token: str,
        box_size: int = 10,
        border: int = 4,
        theme: str = "light"
    ) -> bytes:
        """
        Generate QR code for RSVP URL.

        Args:
            token: Guest RSVP token
            box_size: Size of each QR box (default: 10)
            border: Border size (default: 4)
            theme: Color theme ('light' or 'dark')

        Returns:
            QR code image as bytes
        """
        rsvp_url = self.generate_rsvp_url(token)
        return generate_rsvp_qr_code(
            rsvp_url,
            box_size=box_size,
            border=border,
            theme=theme
        )

    def generate_qr_code_base64(
        self,
        token: str,
        box_size: int = 10,
        border: int = 4,
        theme: str = "light"
    ) -> str:
        """
        Generate QR code as base64 data URI.

        Args:
            token: Guest RSVP token
            box_size: Size of each QR box
            border: Border size
            theme: Color theme

        Returns:
            Base64-encoded QR code with data URI prefix
        """
        rsvp_url = self.generate_rsvp_url(token)

        # Set colors based on theme
        if theme == "dark":
            fill_color = "white"
            back_color = "#1a1a1a"
        else:
            fill_color = "black"
            back_color = "white"

        return generate_qr_code_base64(
            data=rsvp_url,
            box_size=box_size,
            border=border,
            error_correction=QRErrorCorrection.HIGH,
            fill_color=fill_color,
            back_color=back_color
        )

    async def validate_token_access(
        self,
        db: AsyncSession,
        token: str
    ) -> tuple[bool, Optional[str]]:
        """
        Validate token and check if it's accessible.

        Args:
            db: Database session
            token: RSVP token to validate

        Returns:
            Tuple of (is_valid, error_message)
            - (True, None) if valid
            - (False, error_message) if invalid

        Example:
            >>> is_valid, error = await service.validate_token_access(db, "A3X7K9M2")
            >>> if is_valid:
            ...     print("Token is valid")
            ... else:
            ...     print(f"Token invalid: {error}")
        """
        # Check format
        if not self.validate_token(token):
            return False, "Invalid token format"

        # Check if token exists
        guest = await get_guest_by_rsvp_token(db, token)
        if not guest:
            return False, "Token not found"

        # Check if token has expired (if expiry is set)
        if guest.token_expires_at:
            if datetime.now(timezone.utc) > guest.token_expires_at:
                return False, "Token has expired"

        return True, None

    def calculate_token_expiry(
        self,
        days: int = DEFAULT_TOKEN_EXPIRY_DAYS
    ) -> datetime:
        """
        Calculate token expiry date.

        Args:
            days: Number of days until expiry

        Returns:
            Expiry datetime
        """
        return datetime.now(timezone.utc) + timedelta(days=days)

    def is_token_expired(self, expires_at: Optional[datetime]) -> bool:
        """
        Check if token has expired.

        Args:
            expires_at: Token expiration datetime

        Returns:
            True if expired, False otherwise
        """
        if not expires_at:
            return False  # No expiry set
        return datetime.now(timezone.utc) > expires_at

    async def track_token_access(
        self,
        db: AsyncSession,
        token: str,
        is_first_access: bool = False
    ) -> None:
        """
        Track when a token is accessed.

        Args:
            db: Database session
            token: RSVP token
            is_first_access: Whether this is the first access

        Note:
            This updates the guest record with access timestamps
        """
        guest = await get_guest_by_rsvp_token(db, token)
        if not guest:
            return

        now = datetime.now(timezone.utc)

        # Update first access if not set
        if is_first_access and not guest.token_first_accessed_at:
            guest.token_first_accessed_at = now

        # Always update last access
        guest.token_last_accessed_at = now

        await db.commit()

    """FR-6: The system shall display an RSVP submission page. 5.1.1"""

    async def track_rsvp_response(
        self,
        db: AsyncSession,
        token: str,
        ip_address: str
    ) -> None:
        """
        Track RSVP response submission.

        Args:
            db: Database session
            token: RSVP token
            ip_address: Client IP address

        Note:
            This updates guest record with response timestamp and IP
        """
        from app.crud.crud_guest import get_guest_by_rsvp_token

        guest = await get_guest_by_rsvp_token(db, token)
        if not guest:
            return

        now = datetime.now(timezone.utc)

        # Update response timestamp
        guest.rsvp_responded_at = now

        # Store IP address for audit trail
        guest.rsvp_ip_address = ip_address

        await db.commit()

    def validate_plus_one_eligibility(self, guest) -> tuple[bool, Optional[str]]:
        """
        Validate if guest can bring a plus-one.

        Args:
            guest: Guest model instance

        Returns:
            Tuple of (is_eligible, error_message)
        """
        if not guest.plus_one_allowed:
            return False, "Plus-one not allowed for this guest"

        # Plus-one only valid if attending or maybe
        from app.models.guest import RsvpStatus
        if guest.rsvp_status not in [RsvpStatus.ATTENDING, RsvpStatus.MAYBE]:
            return False, "Plus-one only available when attending or maybe"

        return True, None

    async def get_rsvp_statistics(
        self,
        db: AsyncSession,
        event_id: UUID
    ) -> dict:
        """
        Get RSVP statistics for an event.

        Args:
            db: Database session
            event_id: Event ID

        Returns:
            Dictionary with RSVP statistics
        """
        from app.crud import crud_guest
        from app.models.guest import RsvpStatus
        from sqlalchemy import select, func

        # Get total invited
        total_invited = await crud_guest.get_guests_count_by_event(db, event_id)

        # Get counts by status
        attending = await crud_guest.get_guests_count_by_event(db, event_id, RsvpStatus.ATTENDING)
        not_attending = await crud_guest.get_guests_count_by_event(db, event_id, RsvpStatus.NOT_ATTENDING)
        maybe = await crud_guest.get_guests_count_by_event(db, event_id, RsvpStatus.MAYBE)
        pending = await crud_guest.get_guests_count_by_event(db, event_id, RsvpStatus.PENDING)

        # Calculate responded count
        responded = total_invited - pending

        # Calculate response rate
        response_rate = (responded / total_invited * 100) if total_invited > 0 else 0.0

        # Get plus-ones confirmed (guests with plus_one_name set)
        from app.models.guest import Guest
        result = await db.execute(
            select(func.count(Guest.id)).where(
                Guest.event_id == event_id,
                Guest.plus_one_name.isnot(None),
                Guest.plus_one_name != ""
            )
        )
        plus_ones_confirmed = result.scalar() or 0

        # Get dietary restrictions count
        result = await db.execute(
            select(func.count(Guest.id)).where(
                Guest.event_id == event_id,
                Guest.dietary_restrictions.isnot(None),
                Guest.dietary_restrictions != ""
            )
        )
        dietary_restrictions_count = result.scalar() or 0

        # Get last response timestamp
        result = await db.execute(
            select(func.max(Guest.rsvp_responded_at)).where(
                Guest.event_id == event_id
            )
        )
        last_response_at = result.scalar()

        return {
            "event_id": str(event_id),
            "total_invited": total_invited,
            "responded": responded,
            "pending": pending,
            "attending": attending,
            "not_attending": not_attending,
            "maybe": maybe,
            "response_rate": round(response_rate, 2),
            "plus_ones_confirmed": plus_ones_confirmed,
            "dietary_restrictions_count": dietary_restrictions_count,
            "last_response_at": last_response_at
        }

    def get_sharing_links(self, rsvp_url: str, event_name: str) -> dict[str, str]:
        """
        Generate sharing links for various platforms.

        Args:
            rsvp_url: RSVP URL
            event_name: Name of the event

        Returns:
            Dictionary of platform: sharing_url

        Example:
            >>> service = RSVPService()
            >>> links = service.get_sharing_links(
            ...     "https://party-time.com/rsvp/A3X7K9M2",
            ...     "Birthday Party"
            ... )
            >>> 'email' in links
            True
        """
        import urllib.parse

        encoded_url = urllib.parse.quote(rsvp_url)
        encoded_text = urllib.parse.quote(f"You're invited to {event_name}!")

        return {
            "email": f"mailto:?subject={encoded_text}&body=Please RSVP: {encoded_url}",
            "sms": f"sms:?body={encoded_text}%20{encoded_url}",
            "whatsapp": f"https://wa.me/?text={encoded_text}%20{encoded_url}",
            "twitter": f"https://twitter.com/intent/tweet?text={encoded_text}&url={encoded_url}",
            "facebook": f"https://www.facebook.com/sharer/sharer.php?u={encoded_url}",
            "linkedin": f"https://www.linkedin.com/sharing/share-offsite/?url={encoded_url}",
        }

    def format_token_for_display(self, token: str) -> str:
        """
        Format token for user-friendly display.

        Args:
            token: 8-character token

        Returns:
            Formatted token (e.g., "A3X7-K9M2")
        """
        if len(token) == 8:
            return f"{token[:4]}-{token[4:]}"
        return token


# Create singleton instance
rsvp_service = RSVPService()


def get_rsvp_service(base_url: Optional[str] = None) -> RSVPService:
    """
    Get RSVP service instance.

    Args:
        base_url: Optional custom base URL

    Returns:
        RSVPService instance
    """
    if base_url:
        return RSVPService(base_url)
    return rsvp_service
