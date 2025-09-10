"""CRUD operations for Budget models (BudgetCategory and Expense)."""
from typing import Optional, List, Dict, Any
from uuid import UUID
from decimal import Decimal
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, and_, func

from app.models.budget import BudgetCategory, Expense
from app.schemas.budget import BudgetCategoryCreate, BudgetCategoryUpdate, ExpenseCreate, ExpenseUpdate


# Budget Category CRUD Operations

async def create_budget_category(db: AsyncSession, category_data: BudgetCategoryCreate, event_id: UUID) -> BudgetCategory:
    """Create a new budget category for an event."""
    db_category = BudgetCategory(
        event_id=event_id,
        name=category_data.name,
        allocated_amount=category_data.allocated_amount,
        color=category_data.color
    )
    db.add(db_category)
    await db.flush()
    await db.refresh(db_category)
    return db_category


async def get_budget_category_by_id(db: AsyncSession, category_id: UUID) -> Optional[BudgetCategory]:
    """Get budget category by ID."""
    result = await db.execute(select(BudgetCategory).where(BudgetCategory.id == category_id))
    return result.scalar_one_or_none()


async def get_budget_categories_by_event(db: AsyncSession, event_id: UUID) -> List[BudgetCategory]:
    """Get all budget categories for an event."""
    result = await db.execute(
        select(BudgetCategory)
        .where(BudgetCategory.event_id == event_id)
        .order_by(BudgetCategory.name)
    )
    return result.scalars().all()


async def update_budget_category(db: AsyncSession, category_id: UUID, category_data: BudgetCategoryUpdate) -> Optional[BudgetCategory]:
    """Update budget category."""
    update_data = category_data.model_dump(exclude_unset=True)
    if not update_data:
        return await get_budget_category_by_id(db, category_id)
    
    await db.execute(
        update(BudgetCategory)
        .where(BudgetCategory.id == category_id)
        .values(**update_data)
    )
    return await get_budget_category_by_id(db, category_id)


async def delete_budget_category(db: AsyncSession, category_id: UUID) -> bool:
    """Delete a budget category."""
    result = await db.execute(delete(BudgetCategory).where(BudgetCategory.id == category_id))
    return result.rowcount > 0


# Expense CRUD Operations

async def create_expense(db: AsyncSession, expense_data: ExpenseCreate, event_id: UUID) -> Expense:
    """Create a new expense for an event."""
    db_expense = Expense(
        event_id=event_id,
        category_id=expense_data.category_id,
        name=expense_data.name,
        description=expense_data.description,
        amount=expense_data.amount,
        expense_date=expense_data.expense_date,
        vendor_name=expense_data.vendor_name,
        is_paid=expense_data.is_paid,
        receipt_url=expense_data.receipt_url
    )
    db.add(db_expense)
    await db.flush()
    await db.refresh(db_expense)
    return db_expense


async def get_expense_by_id(db: AsyncSession, expense_id: UUID) -> Optional[Expense]:
    """Get expense by ID."""
    result = await db.execute(select(Expense).where(Expense.id == expense_id))
    return result.scalar_one_or_none()


async def get_expenses_by_event(
    db: AsyncSession, 
    event_id: UUID,
    category_id: Optional[UUID] = None,
    is_paid: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100
) -> List[Expense]:
    """Get expenses for an event with filtering."""
    query = select(Expense).where(Expense.event_id == event_id)
    
    if category_id:
        query = query.where(Expense.category_id == category_id)
    
    if is_paid is not None:
        query = query.where(Expense.is_paid == is_paid)
    
    query = query.offset(skip).limit(limit).order_by(Expense.expense_date.desc())
    result = await db.execute(query)
    return result.scalars().all()


async def get_expenses_by_category(db: AsyncSession, category_id: UUID) -> List[Expense]:
    """Get all expenses for a specific category."""
    result = await db.execute(
        select(Expense)
        .where(Expense.category_id == category_id)
        .order_by(Expense.expense_date.desc())
    )
    return result.scalars().all()


async def update_expense(db: AsyncSession, expense_id: UUID, expense_data: ExpenseUpdate) -> Optional[Expense]:
    """Update expense information."""
    update_data = expense_data.model_dump(exclude_unset=True)
    if not update_data:
        return await get_expense_by_id(db, expense_id)
    
    await db.execute(
        update(Expense)
        .where(Expense.id == expense_id)
        .values(**update_data)
    )
    return await get_expense_by_id(db, expense_id)


async def delete_expense(db: AsyncSession, expense_id: UUID) -> bool:
    """Delete an expense."""
    result = await db.execute(delete(Expense).where(Expense.id == expense_id))
    return result.rowcount > 0


async def mark_expense_as_paid(db: AsyncSession, expense_id: UUID) -> Optional[Expense]:
    """Mark an expense as paid."""
    await db.execute(
        update(Expense)
        .where(Expense.id == expense_id)
        .values(is_paid=True)
    )
    return await get_expense_by_id(db, expense_id)


async def mark_expense_as_unpaid(db: AsyncSession, expense_id: UUID) -> Optional[Expense]:
    """Mark an expense as unpaid."""
    await db.execute(
        update(Expense)
        .where(Expense.id == expense_id)
        .values(is_paid=False)
    )
    return await get_expense_by_id(db, expense_id)


# Budget Analytics

async def get_budget_summary_by_event(db: AsyncSession, event_id: UUID) -> Dict[str, Any]:
    """Get comprehensive budget summary for an event."""
    # Get total allocated budget
    categories_result = await db.execute(
        select(func.sum(BudgetCategory.allocated_amount))
        .where(BudgetCategory.event_id == event_id)
    )
    total_allocated = categories_result.scalar() or Decimal('0.00')
    
    # Get total spent
    expenses_result = await db.execute(
        select(func.sum(Expense.amount))
        .where(Expense.event_id == event_id)
    )
    total_spent = expenses_result.scalar() or Decimal('0.00')
    
    # Get total paid
    paid_result = await db.execute(
        select(func.sum(Expense.amount))
        .where(and_(Expense.event_id == event_id, Expense.is_paid == True))
    )
    total_paid = paid_result.scalar() or Decimal('0.00')
    
    # Get total unpaid
    unpaid_result = await db.execute(
        select(func.sum(Expense.amount))
        .where(and_(Expense.event_id == event_id, Expense.is_paid == False))
    )
    total_unpaid = unpaid_result.scalar() or Decimal('0.00')
    
    return {
        "total_allocated": float(total_allocated),
        "total_spent": float(total_spent),
        "total_paid": float(total_paid),
        "total_unpaid": float(total_unpaid),
        "remaining_budget": float(total_allocated - total_spent),
        "budget_utilization_percentage": float((total_spent / total_allocated * 100)) if total_allocated > 0 else 0.0
    }


async def get_category_spending_summary(db: AsyncSession, event_id: UUID) -> List[Dict[str, Any]]:
    """Get spending summary by category for an event."""
    # Get category spending data
    result = await db.execute(
        select(
            BudgetCategory.id,
            BudgetCategory.name,
            BudgetCategory.allocated_amount,
            BudgetCategory.color,
            func.coalesce(func.sum(Expense.amount), 0).label('spent_amount'),
            func.count(Expense.id).label('expense_count')
        )
        .outerjoin(Expense, BudgetCategory.id == Expense.category_id)
        .where(BudgetCategory.event_id == event_id)
        .group_by(BudgetCategory.id, BudgetCategory.name, BudgetCategory.allocated_amount, BudgetCategory.color)
        .order_by(BudgetCategory.name)
    )
    
    categories = []
    for row in result:
        spent_amount = float(row.spent_amount)
        allocated_amount = float(row.allocated_amount)
        remaining = allocated_amount - spent_amount
        utilization = (spent_amount / allocated_amount * 100) if allocated_amount > 0 else 0.0
        
        categories.append({
            "category_id": str(row.id),
            "category_name": row.name,
            "allocated_amount": allocated_amount,
            "spent_amount": spent_amount,
            "remaining_amount": remaining,
            "expense_count": row.expense_count,
            "utilization_percentage": utilization,
            "color": row.color
        })
    
    return categories


async def get_recent_expenses(db: AsyncSession, event_id: UUID, limit: int = 10) -> List[Expense]:
    """Get recent expenses for an event."""
    result = await db.execute(
        select(Expense)
        .where(Expense.event_id == event_id)
        .order_by(Expense.created_at.desc())
        .limit(limit)
    )
    return result.scalars().all()