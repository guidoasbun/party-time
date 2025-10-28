"""
Template helper utilities for email templates.

FR-7: The system shall send email invitations
5.2.2: Email Templates

Provides date/time formatting, event type display, and other utilities
for Jinja2 templates used in email rendering.
"""

from datetime import datetime, timedelta
from typing import Optional
from zoneinfo import ZoneInfo


def format_date(dt: Optional[datetime], format_type: str = "full") -> str:
    """
    Format a datetime object to a human-friendly date string.

    Args:
        dt: Datetime object to format
        format_type: Type of formatting - "full", "short", "medium"

    Returns:
        Formatted date string

    Examples:
        full: "Saturday, June 15, 2024"
        medium: "June 15, 2024"
        short: "06/15/2024"
    """
    if not dt:
        return "Date TBA"

    if format_type == "full":
        return dt.strftime("%A, %B %d, %Y")
    elif format_type == "medium":
        return dt.strftime("%B %d, %Y")
    elif format_type == "short":
        return dt.strftime("%m/%d/%Y")
    else:
        return dt.strftime("%A, %B %d, %Y")


def format_time(dt: Optional[datetime], include_timezone: bool = True) -> str:
    """
    Format a datetime object to a human-friendly time string.

    Args:
        dt: Datetime object to format
        include_timezone: Whether to include timezone abbreviation

    Returns:
        Formatted time string

    Examples:
        "6:00 PM PST"
        "2:30 PM"
    """
    if not dt:
        return "Time TBA"

    # Format time
    time_str = dt.strftime("%I:%M %p").lstrip("0")

    # Add timezone if requested
    if include_timezone and dt.tzinfo:
        tz_abbr = dt.strftime("%Z")
        return f"{time_str} {tz_abbr}"

    return time_str


def format_datetime(dt: Optional[datetime], format_type: str = "full") -> str:
    """
    Format a datetime object to a combined date and time string.

    Args:
        dt: Datetime object to format
        format_type: Type of formatting - "full", "medium", "short"

    Returns:
        Formatted datetime string

    Examples:
        full: "Saturday, June 15, 2024 at 6:00 PM PST"
        medium: "June 15, 2024 at 6:00 PM"
        short: "06/15/2024 6:00 PM"
    """
    if not dt:
        return "Date & Time TBA"

    date_part = format_date(dt, format_type)
    time_part = format_time(dt, include_timezone=(format_type == "full"))

    if format_type == "short":
        return f"{date_part} {time_part}"
    else:
        return f"{date_part} at {time_part}"


def days_until(target_date: Optional[datetime], from_date: Optional[datetime] = None) -> int:
    """
    Calculate the number of days between two dates.

    Args:
        target_date: The target date to calculate days until
        from_date: The starting date (defaults to now)

    Returns:
        Number of days (positive for future, negative for past)
    """
    if not target_date:
        return 0

    if from_date is None:
        from_date = datetime.now(ZoneInfo("UTC"))

    # Ensure both dates are timezone-aware
    if target_date.tzinfo is None:
        target_date = target_date.replace(tzinfo=ZoneInfo("UTC"))
    if from_date.tzinfo is None:
        from_date = from_date.replace(tzinfo=ZoneInfo("UTC"))

    delta = target_date - from_date
    return delta.days


def days_until_text(target_date: Optional[datetime], label: str = "event") -> str:
    """
    Get a human-friendly text for days until a date.

    Args:
        target_date: The target date
        label: Label for the event (e.g., "event", "deadline")

    Returns:
        Human-friendly string

    Examples:
        "Today"
        "Tomorrow"
        "In 5 days"
        "3 days ago"
    """
    days = days_until(target_date)

    if days == 0:
        return "Today"
    elif days == 1:
        return "Tomorrow"
    elif days == -1:
        return "Yesterday"
    elif days > 1:
        return f"In {days} days"
    else:
        return f"{abs(days)} days ago"


def event_type_display(event_type: Optional[str]) -> str:
    """
    Convert event type enum to display-friendly string.

    Args:
        event_type: Event type enum value (e.g., "wedding", "birthday")

    Returns:
        Display-friendly string (e.g., "Wedding", "Birthday Party")
    """
    if not event_type:
        return "Event"

    # Map of event types to display names
    type_map = {
        "wedding": "Wedding",
        "birthday": "Birthday Party",
        "corporate": "Corporate Event",
        "conference": "Conference",
        "party": "Party",
        "meeting": "Meeting",
        "celebration": "Celebration",
        "anniversary": "Anniversary",
        "graduation": "Graduation",
        "baby_shower": "Baby Shower",
        "bridal_shower": "Bridal Shower",
        "engagement": "Engagement Party",
        "retirement": "Retirement Party",
        "fundraiser": "Fundraiser",
        "gala": "Gala",
        "networking": "Networking Event",
        "workshop": "Workshop",
        "seminar": "Seminar",
        "other": "Event"
    }

    return type_map.get(event_type.lower(), event_type.title())


def truncate_text(text: Optional[str], max_length: int = 100, suffix: str = "...") -> str:
    """
    Truncate text to a maximum length, adding suffix if truncated.

    Args:
        text: Text to truncate
        max_length: Maximum length of text
        suffix: Suffix to add if truncated (default: "...")

    Returns:
        Truncated text
    """
    if not text:
        return ""

    if len(text) <= max_length:
        return text

    return text[:max_length - len(suffix)].rstrip() + suffix


def format_address(venue_name: Optional[str], venue_address: Optional[str], location: Optional[str]) -> str:
    """
    Format venue information into a readable address string.

    Args:
        venue_name: Name of the venue
        venue_address: Street address
        location: City, state, zip

    Returns:
        Formatted address string
    """
    parts = []

    if venue_name:
        parts.append(venue_name)
    if venue_address:
        parts.append(venue_address)
    if location:
        parts.append(location)

    if not parts:
        return "Location TBA"

    return "<br>".join(parts)


def rsvp_status_display(status: Optional[str]) -> str:
    """
    Convert RSVP status to display-friendly string.

    Args:
        status: RSVP status enum value

    Returns:
        Display-friendly string
    """
    if not status:
        return "Pending"

    status_map = {
        "PENDING": "Pending Response",
        "ATTENDING": "Attending",
        "NOT_ATTENDING": "Not Attending",
        "MAYBE": "Maybe"
    }

    return status_map.get(status.upper(), status.title())


def rsvp_status_color(status: Optional[str]) -> str:
    """
    Get color for RSVP status badge.

    Args:
        status: RSVP status enum value

    Returns:
        Hex color code
    """
    if not status:
        return "#6b7280"  # gray for pending

    color_map = {
        "PENDING": "#6b7280",      # gray
        "ATTENDING": "#10b981",    # green
        "NOT_ATTENDING": "#ef4444", # red
        "MAYBE": "#f59e0b"         # amber
    }

    return color_map.get(status.upper(), "#6b7280")


def get_current_year() -> int:
    """Get the current year for copyright notices."""
    return datetime.now().year


# Export all helper functions for use in Jinja2 templates
__all__ = [
    "format_date",
    "format_time",
    "format_datetime",
    "days_until",
    "days_until_text",
    "event_type_display",
    "truncate_text",
    "format_address",
    "rsvp_status_display",
    "rsvp_status_color",
    "get_current_year",
]
