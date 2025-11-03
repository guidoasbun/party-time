"""Pydantic schemas package."""
from app.schemas.user import User, UserCreate, UserUpdate, UserInDB
from app.schemas.event import Event, EventCreate, EventUpdate, EventWithDetails
from app.schemas.guest import Guest, GuestCreate, GuestUpdate, GuestRSVPUpdate, GuestBulkCreate
from app.schemas.budget import (
    BudgetCategory, BudgetCategoryCreate, BudgetCategoryUpdate,
    Expense, ExpenseCreate, ExpenseUpdate, BudgetSummary
)
from app.schemas.seating import (
    SeatingChartBase, SeatingChartCreate, SeatingChartUpdate, SeatingChartResponse,
    TableLayoutBase, TableLayoutCreate, TableLayoutUpdate, TableLayoutResponse,
    SeatAssignmentBase, SeatAssignmentCreate, SeatAssignmentUpdate, SeatAssignmentResponse,
    SeatingChartWithTables, TableLayoutWithSeats, SeatAssignmentWithGuest,
    SeatingChartSummary, BulkTableCreate, BulkSeatAssignmentCreate, AutoAssignRequest
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
    # Seating schemas
    "SeatingChartBase",
    "SeatingChartCreate",
    "SeatingChartUpdate",
    "SeatingChartResponse",
    "TableLayoutBase",
    "TableLayoutCreate",
    "TableLayoutUpdate",
    "TableLayoutResponse",
    "SeatAssignmentBase",
    "SeatAssignmentCreate",
    "SeatAssignmentUpdate",
    "SeatAssignmentResponse",
    "SeatingChartWithTables",
    "TableLayoutWithSeats",
    "SeatAssignmentWithGuest",
    "SeatingChartSummary",
    "BulkTableCreate",
    "BulkSeatAssignmentCreate",
    "AutoAssignRequest",
]