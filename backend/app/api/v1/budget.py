"""API endpoints for budget and expense management."""
from typing import List, Optional, Dict, Any
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.core.auth import get_current_user
from app.crud import crud_budget, crud_event
from app.schemas.budget import (
    BudgetCategory, BudgetCategoryCreate, BudgetCategoryUpdate,
    Expense, ExpenseCreate, ExpenseUpdate
)

router = APIRouter()

# Budget Category Endpoints

@router.post("/{event_id}/budget/categories/", response_model=BudgetCategory, status_code=201)
async def create_budget_category(
    event_id: UUID,
    category_data: BudgetCategoryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a budget category for an event."""
    user_id = UUID(current_user["user_id"])
    
    try:
        # Verify event ownership
        event = await crud_event.get_event_by_id(db, event_id)
        if not event or event.planner_id != user_id:
            raise HTTPException(status_code=404, detail="Event not found or access denied")
        
        category = await crud_budget.create_budget_category(db, category_data, event_id)
        return category
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create budget category: {str(e)}")


@router.get("/{event_id}/budget/categories/", response_model=None)
async def get_budget_categories(
    event_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
) -> List[Dict[str, Any]]:
    """Get all budget categories for an event with calculated spent amounts."""
    user_id = UUID(current_user["user_id"])

    try:
        # Verify event ownership
        event = await crud_event.get_event_by_id(db, event_id)
        if not event or event.planner_id != user_id:
            raise HTTPException(status_code=404, detail="Event not found or access denied")

        categories = await crud_budget.get_budget_categories_by_event(db, event_id)
        return categories
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve budget categories: {str(e)}")


@router.patch("/{event_id}/budget/categories/{category_id}/", response_model=BudgetCategory)
async def update_budget_category(
    event_id: UUID,
    category_id: UUID,
    category_data: BudgetCategoryUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update a budget category."""
    user_id = UUID(current_user["user_id"])
    
    try:
        # Verify event ownership
        event = await crud_event.get_event_by_id(db, event_id)
        if not event or event.planner_id != user_id:
            raise HTTPException(status_code=404, detail="Event not found or access denied")
        
        # Verify category belongs to event
        existing_category = await crud_budget.get_budget_category_by_id(db, category_id)
        if not existing_category or existing_category.event_id != event_id:
            raise HTTPException(status_code=404, detail="Budget category not found")
        
        category = await crud_budget.update_budget_category(db, category_id, category_data)
        return category
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to update budget category: {str(e)}")


@router.delete("/{event_id}/budget/categories/{category_id}/", status_code=204)
async def delete_budget_category(
    event_id: UUID,
    category_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete a budget category."""
    user_id = UUID(current_user["user_id"])
    
    try:
        # Verify event ownership
        event = await crud_event.get_event_by_id(db, event_id)
        if not event or event.planner_id != user_id:
            raise HTTPException(status_code=404, detail="Event not found or access denied")
        
        # Verify category belongs to event
        existing_category = await crud_budget.get_budget_category_by_id(db, category_id)
        if not existing_category or existing_category.event_id != event_id:
            raise HTTPException(status_code=404, detail="Budget category not found")
        
        success = await crud_budget.delete_budget_category(db, category_id)
        if not success:
            raise HTTPException(status_code=404, detail="Budget category not found")
        
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete budget category: {str(e)}")


# Expense Endpoints

@router.post("/{event_id}/budget/expenses/", response_model=Expense, status_code=201)
async def create_expense(
    event_id: UUID,
    expense_data: ExpenseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create an expense for an event."""
    user_id = UUID(current_user["user_id"])
    
    try:
        # Verify event ownership
        event = await crud_event.get_event_by_id(db, event_id)
        if not event or event.planner_id != user_id:
            raise HTTPException(status_code=404, detail="Event not found or access denied")
        
        # Verify category belongs to event if specified
        if expense_data.category_id:
            category = await crud_budget.get_budget_category_by_id(db, expense_data.category_id)
            if not category or category.event_id != event_id:
                raise HTTPException(status_code=400, detail="Invalid category for this event")
        
        expense = await crud_budget.create_expense(db, expense_data, event_id)
        return expense
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create expense: {str(e)}")


@router.get("/{event_id}/budget/expenses/", response_model=List[Expense])
async def get_expenses(
    event_id: UUID,
    category_id: Optional[UUID] = Query(None, description="Filter by category"),
    is_paid: Optional[bool] = Query(None, description="Filter by payment status"),
    skip: int = Query(0, ge=0, description="Number of expenses to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of expenses to return"),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get expenses for an event with filtering."""
    user_id = UUID(current_user["user_id"])
    
    try:
        # Verify event ownership
        event = await crud_event.get_event_by_id(db, event_id)
        if not event or event.planner_id != user_id:
            raise HTTPException(status_code=404, detail="Event not found or access denied")
        
        expenses = await crud_budget.get_expenses_by_event(
            db, event_id, category_id, is_paid, skip, limit
        )
        return expenses
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve expenses: {str(e)}")


@router.get("/{event_id}/budget/expenses/recent/", response_model=List[Expense])
async def get_recent_expenses(
    event_id: UUID,
    limit: int = Query(10, ge=1, le=50, description="Number of recent expenses to return"),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get recent expenses for an event."""
    user_id = UUID(current_user["user_id"])
    
    try:
        # Verify event ownership
        event = await crud_event.get_event_by_id(db, event_id)
        if not event or event.planner_id != user_id:
            raise HTTPException(status_code=404, detail="Event not found or access denied")
        
        expenses = await crud_budget.get_recent_expenses(db, event_id, limit)
        return expenses
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve recent expenses: {str(e)}")


@router.get("/{event_id}/budget/expenses/{expense_id}/", response_model=Expense)
async def get_expense(
    event_id: UUID,
    expense_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get a specific expense."""
    user_id = UUID(current_user["user_id"])
    
    try:
        # Verify event ownership
        event = await crud_event.get_event_by_id(db, event_id)
        if not event or event.planner_id != user_id:
            raise HTTPException(status_code=404, detail="Event not found or access denied")
        
        expense = await crud_budget.get_expense_by_id(db, expense_id)
        if not expense or expense.event_id != event_id:
            raise HTTPException(status_code=404, detail="Expense not found")
        
        return expense
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve expense: {str(e)}")


@router.patch("/{event_id}/budget/expenses/{expense_id}/", response_model=Expense)
async def update_expense(
    event_id: UUID,
    expense_id: UUID,
    expense_data: ExpenseUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update an expense."""
    user_id = UUID(current_user["user_id"])
    
    try:
        # Verify event ownership
        event = await crud_event.get_event_by_id(db, event_id)
        if not event or event.planner_id != user_id:
            raise HTTPException(status_code=404, detail="Event not found or access denied")
        
        # Verify expense belongs to event
        existing_expense = await crud_budget.get_expense_by_id(db, expense_id)
        if not existing_expense or existing_expense.event_id != event_id:
            raise HTTPException(status_code=404, detail="Expense not found")
        
        # Verify category belongs to event if being updated
        if expense_data.category_id:
            category = await crud_budget.get_budget_category_by_id(db, expense_data.category_id)
            if not category or category.event_id != event_id:
                raise HTTPException(status_code=400, detail="Invalid category for this event")
        
        expense = await crud_budget.update_expense(db, expense_id, expense_data)
        return expense
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to update expense: {str(e)}")


@router.delete("/{event_id}/budget/expenses/{expense_id}/", status_code=204)
async def delete_expense(
    event_id: UUID,
    expense_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete an expense."""
    user_id = UUID(current_user["user_id"])
    
    try:
        # Verify event ownership
        event = await crud_event.get_event_by_id(db, event_id)
        if not event or event.planner_id != user_id:
            raise HTTPException(status_code=404, detail="Event not found or access denied")
        
        # Verify expense belongs to event
        expense = await crud_budget.get_expense_by_id(db, expense_id)
        if not expense or expense.event_id != event_id:
            raise HTTPException(status_code=404, detail="Expense not found")
        
        success = await crud_budget.delete_expense(db, expense_id)
        if not success:
            raise HTTPException(status_code=404, detail="Expense not found")
        
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete expense: {str(e)}")


@router.patch("/{event_id}/budget/expenses/{expense_id}/mark-paid/", response_model=Expense)
async def mark_expense_as_paid(
    event_id: UUID,
    expense_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Mark an expense as paid."""
    user_id = UUID(current_user["user_id"])
    
    try:
        # Verify event ownership
        event = await crud_event.get_event_by_id(db, event_id)
        if not event or event.planner_id != user_id:
            raise HTTPException(status_code=404, detail="Event not found or access denied")
        
        # Verify expense belongs to event
        existing_expense = await crud_budget.get_expense_by_id(db, expense_id)
        if not existing_expense or existing_expense.event_id != event_id:
            raise HTTPException(status_code=404, detail="Expense not found")
        
        expense = await crud_budget.mark_expense_as_paid(db, expense_id)
        return expense
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to mark expense as paid: {str(e)}")


@router.patch("/{event_id}/budget/expenses/{expense_id}/mark-unpaid/", response_model=Expense)
async def mark_expense_as_unpaid(
    event_id: UUID,
    expense_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Mark an expense as unpaid."""
    user_id = UUID(current_user["user_id"])
    
    try:
        # Verify event ownership
        event = await crud_event.get_event_by_id(db, event_id)
        if not event or event.planner_id != user_id:
            raise HTTPException(status_code=404, detail="Event not found or access denied")
        
        # Verify expense belongs to event
        existing_expense = await crud_budget.get_expense_by_id(db, expense_id)
        if not existing_expense or existing_expense.event_id != event_id:
            raise HTTPException(status_code=404, detail="Expense not found")
        
        expense = await crud_budget.mark_expense_as_unpaid(db, expense_id)
        return expense
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to mark expense as unpaid: {str(e)}")


# Budget Analytics Endpoints

@router.get("/{event_id}/budget/summary/", response_model=None)
async def get_budget_summary(
    event_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get comprehensive budget summary for an event."""
    user_id = UUID(current_user["user_id"])
    
    try:
        # Verify event ownership
        event = await crud_event.get_event_by_id(db, event_id)
        if not event or event.planner_id != user_id:
            raise HTTPException(status_code=404, detail="Event not found or access denied")
        
        summary = await crud_budget.get_budget_summary_by_event(db, event_id)
        return {
            "event_id": str(event_id),
            **summary
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve budget summary: {str(e)}")


@router.get("/{event_id}/budget/categories-summary/", response_model=None)
async def get_category_spending_summary(
    event_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
) -> List[Dict[str, Any]]:
    """Get spending summary by category for an event."""
    user_id = UUID(current_user["user_id"])
    
    try:
        # Verify event ownership
        event = await crud_event.get_event_by_id(db, event_id)
        if not event or event.planner_id != user_id:
            raise HTTPException(status_code=404, detail="Event not found or access denied")
        
        categories_summary = await crud_budget.get_category_spending_summary(db, event_id)
        return categories_summary
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve category spending summary: {str(e)}")


@router.get("/budget/categories/{category_id}/expenses/", response_model=List[Expense])
async def get_expenses_by_category(
    category_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all expenses for a specific category."""
    user_id = UUID(current_user["user_id"])
    
    try:
        # Verify category ownership through event
        category = await crud_budget.get_budget_category_by_id(db, category_id)
        if not category:
            raise HTTPException(status_code=404, detail="Budget category not found")
        
        event = await crud_event.get_event_by_id(db, category.event_id)
        if not event or event.planner_id != user_id:
            raise HTTPException(status_code=404, detail="Event not found or access denied")
        
        expenses = await crud_budget.get_expenses_by_category(db, category_id)
        return expenses
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve expenses by category: {str(e)}")