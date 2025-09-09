"""Budget and expense models for event financial tracking."""
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, DECIMAL, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.db.base import Base


class BudgetCategory(Base):
    """Categories for organizing event expenses."""
    __tablename__ = "budget_categories"
    
    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Event association
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    
    # Category details
    name = Column(String(100), nullable=False)
    allocated_amount = Column(DECIMAL(10, 2), nullable=False, default=0)
    color = Column(String(7))  # Hex color for UI display
    
    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    event = relationship("Event", back_populates="budget_categories")
    expenses = relationship("Expense", back_populates="category")


class Expense(Base):
    """Individual expense entries for events."""
    __tablename__ = "expenses"
    
    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Event and category association
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(UUID(as_uuid=True), ForeignKey("budget_categories.id", ondelete="SET NULL"))
    
    # Expense details
    name = Column(String(255), nullable=False)
    description = Column(Text)
    amount = Column(DECIMAL(10, 2), nullable=False)
    expense_date = Column(Date, nullable=False, server_default=func.current_date())
    
    # Vendor and payment info
    vendor_name = Column(String(255))
    is_paid = Column(Boolean, nullable=False, default=False)
    receipt_url = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    event = relationship("Event", back_populates="expenses")
    category = relationship("BudgetCategory", back_populates="expenses")