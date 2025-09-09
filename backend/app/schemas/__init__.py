"""Pydantic schemas package."""
from app.schemas.user import User, UserCreate, UserUpdate, UserInDB
from app.schemas.event import Event, EventCreate, EventUpdate, EventWithDetails
from app.schemas.guest import Guest, GuestCreate, GuestUpdate, GuestRSVPUpdate, GuestBulkCreate
from app.schemas.budget import (
    BudgetCategory, BudgetCategoryCreate, BudgetCategoryUpdate,
    Expense, ExpenseCreate, ExpenseUpdate, BudgetSummary
)

# Export all schemas
__all__ = [
    # User schemas
    "User",
    "UserCreate", 
    "UserUpdate",
    "UserInDB",
    # Event schemas
    "Event",
    "EventCreate",
    "EventUpdate", 
    "EventWithDetails",
    # Guest schemas
    "Guest",
    "GuestCreate",
    "GuestUpdate",
    "GuestRSVPUpdate",
    "GuestBulkCreate",
    # Budget schemas
    "BudgetCategory",
    "BudgetCategoryCreate",
    "BudgetCategoryUpdate",
    "Expense",
    "ExpenseCreate", 
    "ExpenseUpdate",
    "BudgetSummary",
]