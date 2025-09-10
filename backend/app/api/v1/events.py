"""API endpoints for event management."""
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.core.auth import get_current_user
from app.crud import crud_event
from app.schemas.event import Event, EventCreate, EventUpdate
from app.models.event import EventType, EventStatus

router = APIRouter()


@router.post("/", response_model=Event, status_code=201)
async def create_event(
    event_data: EventCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new event."""
    user_id = UUID(current_user["user_id"])
    
    try:
        event = await crud_event.create_event(db, event_data, user_id)
        return event
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create event: {str(e)}")


@router.get("/", response_model=List[Event])
async def get_events(
    skip: int = Query(0, ge=0, description="Number of events to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of events to return"),
    event_type: Optional[EventType] = Query(None, description="Filter by event type"),
    status: Optional[EventStatus] = Query(None, description="Filter by event status"),
    include_relations: bool = Query(False, description="Include related data (guests, budget)"),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get events for the current user."""
    user_id = UUID(current_user["user_id"])
    
    try:
        events = await crud_event.get_events_by_planner(
            db, user_id, skip, limit, event_type, status, include_relations
        )
        return events
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve events: {str(e)}")


@router.get("/search", response_model=List[Event])
async def search_events(
    search_term: Optional[str] = Query(None, description="Search in name, description, location"),
    event_type: Optional[EventType] = Query(None, description="Filter by event type"),
    status: Optional[EventStatus] = Query(None, description="Filter by event status"),
    start_date_from: Optional[datetime] = Query(None, description="Filter events starting from this date"),
    start_date_to: Optional[datetime] = Query(None, description="Filter events starting before this date"),
    skip: int = Query(0, ge=0, description="Number of events to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of events to return"),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Search events with multiple filters."""
    user_id = UUID(current_user["user_id"])
    
    try:
        events = await crud_event.search_events(
            db, user_id, search_term, event_type, status, 
            start_date_from, start_date_to, skip, limit
        )
        return events
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to search events: {str(e)}")


@router.get("/public", response_model=List[Event])
async def get_public_events(
    skip: int = Query(0, ge=0, description="Number of events to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of events to return"),
    event_type: Optional[EventType] = Query(None, description="Filter by event type"),
    db: AsyncSession = Depends(get_db)
):
    """Get public events (no authentication required)."""
    try:
        events = await crud_event.get_public_events(db, skip, limit, event_type)
        return events
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve public events: {str(e)}")


@router.get("/{event_id}", response_model=Event)
async def get_event(
    event_id: UUID,
    include_relations: bool = Query(False, description="Include related data (guests, budget)"),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get a specific event by ID."""
    user_id = UUID(current_user["user_id"])
    
    try:
        event = await crud_event.get_event_by_id(db, event_id, include_relations)
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        
        # Check if user owns the event or if it's public
        if event.planner_id != user_id and not event.is_public:
            raise HTTPException(status_code=403, detail="Access denied")
        
        return event
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve event: {str(e)}")


@router.put("/{event_id}", response_model=Event)
async def update_event(
    event_id: UUID,
    event_data: EventUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update an event."""
    user_id = UUID(current_user["user_id"])
    
    try:
        event = await crud_event.update_event(db, event_id, event_data, user_id)
        if not event:
            raise HTTPException(status_code=404, detail="Event not found or access denied")
        
        return event
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to update event: {str(e)}")


@router.patch("/{event_id}/status", response_model=Event)
async def update_event_status(
    event_id: UUID,
    status: EventStatus,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update event status."""
    user_id = UUID(current_user["user_id"])
    
    try:
        event = await crud_event.update_event_status(db, event_id, status, user_id)
        if not event:
            raise HTTPException(status_code=404, detail="Event not found or access denied")
        
        return event
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to update event status: {str(e)}")


@router.delete("/{event_id}", status_code=204)
async def delete_event(
    event_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete an event."""
    user_id = UUID(current_user["user_id"])
    
    try:
        success = await crud_event.delete_event(db, event_id, user_id)
        if not success:
            raise HTTPException(status_code=404, detail="Event not found or access denied")
        
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete event: {str(e)}")


@router.get("/{event_id}/stats")
async def get_event_stats(
    event_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get event statistics."""
    user_id = UUID(current_user["user_id"])
    
    try:
        # Verify event ownership
        event = await crud_event.get_event_by_id(db, event_id)
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        if event.planner_id != user_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Import here to avoid circular imports
        from app.crud import crud_guest, crud_budget
        
        # Get guest statistics
        total_guests = await crud_guest.get_guests_count_by_event(db, event_id)
        attending_guests = await crud_guest.get_attending_guests_count(db, event_id)
        
        # Get budget summary
        budget_summary = await crud_budget.get_budget_summary_by_event(db, event_id)
        
        return {
            "event_id": str(event_id),
            "guest_stats": {
                "total_invited": total_guests,
                "total_attending": attending_guests,
                "response_rate": (attending_guests / total_guests * 100) if total_guests > 0 else 0.0
            },
            "budget_stats": budget_summary
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve event stats: {str(e)}")