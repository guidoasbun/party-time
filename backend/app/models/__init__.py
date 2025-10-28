"""Database models package."""
from app.models.user import User, UserRole
from app.models.event import Event, EventType, EventStatus
from app.models.guest import Guest, RsvpStatus
from app.models.budget import BudgetCategory, Expense
from app.models.vendor import Vendor, EventVendor
from app.models.email_log import EmailLog, EmailType, EmailStatus

# Export all models and enums
__all__ = [
    # Models
    "User",
    "Event",
    "Guest",
    "BudgetCategory",
    "Expense",
    "Vendor",
    "EventVendor",
    "EmailLog",
    # Enums
    "UserRole",
    "EventType",
    "EventStatus",
    "RsvpStatus",
    "EmailType",
    "EmailStatus",
]