"""Pydantic schemas for budget and expense management."""
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict, field_serializer


class BudgetCategoryBase(BaseModel):
    """Base budget category schema."""
    name: str = Field(..., min_length=1, max_length=100)
    allocated_amount: Decimal = Field(default=Decimal("0.00"), ge=0)
    color: Optional[str] = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$")  # Hex color


class BudgetCategoryCreate(BudgetCategoryBase):
    """Schema for creating budget category."""
    pass


class BudgetCategoryUpdate(BaseModel):
    """Schema for updating budget category."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    allocated_amount: Optional[Decimal] = Field(None, ge=0)
    color: Optional[str] = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$")


class BudgetCategory(BudgetCategoryBase):
    """Schema for budget category response."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    event_id: UUID
    created_at: datetime
    
    # Calculated fields
    spent_amount: Optional[Decimal] = Decimal("0.00")
    remaining_amount: Optional[Decimal] = Decimal("0.00")
    expense_count: Optional[int] = 0
    
    @field_serializer('id', 'event_id')
    def serialize_uuid(self, value: UUID) -> str:
        """Convert UUID to string for JSON serialization."""
        return str(value)


class BudgetCategorySummary(BaseModel):
    """Summary schema for budget categories."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    name: str
    allocated_amount: Decimal
    spent_amount: Decimal
    color: Optional[str] = None
    
    @field_serializer('id')
    def serialize_uuid(self, value: UUID) -> str:
        """Convert UUID to string for JSON serialization."""
        return str(value)


class ExpenseBase(BaseModel):
    """Base expense schema."""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    amount: Decimal = Field(..., gt=0)
    expense_date: date = Field(default_factory=date.today)
    vendor_name: Optional[str] = None
    is_paid: bool = False
    receipt_url: Optional[str] = None


class ExpenseCreate(ExpenseBase):
    """Schema for creating expense."""
    category_id: Optional[UUID] = None


class ExpenseUpdate(BaseModel):
    """Schema for updating expense."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    amount: Optional[Decimal] = Field(None, gt=0)
    expense_date: Optional[date] = None
    vendor_name: Optional[str] = None
    is_paid: Optional[bool] = None
    receipt_url: Optional[str] = None
    category_id: Optional[UUID] = None


class Expense(ExpenseBase):
    """Schema for expense response."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    event_id: UUID
    category_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime
    
    @field_serializer('id', 'event_id', 'category_id')
    def serialize_uuid(self, value: Optional[UUID]) -> Optional[str]:
        """Convert UUID to string for JSON serialization."""
        return str(value) if value else None


class ExpenseSummary(BaseModel):
    """Summary schema for expense lists."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    name: str
    amount: Decimal
    expense_date: date
    is_paid: bool
    category_name: Optional[str] = None
    
    @field_serializer('id')
    def serialize_uuid(self, value: UUID) -> str:
        """Convert UUID to string for JSON serialization."""
        return str(value)


class BudgetSummary(BaseModel):
    """Overall budget summary for an event."""
    total_budget: Decimal
    total_spent: Decimal
    remaining_budget: Decimal
    categories: List[BudgetCategorySummary]
    recent_expenses: List[ExpenseSummary]