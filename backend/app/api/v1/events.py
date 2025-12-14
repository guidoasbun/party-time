"""API endpoints for event management."""
import logging
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.core.auth import get_current_user
from app.core.cache import cache_manager, CacheTTL
from app.crud import crud_event
from app.schemas.event import Event, EventCreate, EventUpdate
from app.models.event import EventType, EventStatus

logger = logging.getLogger(__name__)

# FR-7: The system shall send email invitations
# 5.2.3: Email Campaign Interface
from app.schemas.email import (
    BulkInvitationRequest,
    BulkInvitationResponse,
    CampaignStatsResponse
)
from app.services.email_campaign_service import EmailCampaignService

router = APIRouter()


async def invalidate_user_events_cache(user_id: UUID) -> None:
    """Invalidate all event caches for a user."""
    pattern = f"events:*:{user_id}:*"
    await cache_manager.invalidate_pattern(pattern)
    logger.debug(f"Invalidated event cache for user {user_id}")


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
        # Invalidate cache after creating event
        await invalidate_user_events_cache(user_id)
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
    """Get events for the current user with caching."""
    user_id = UUID(current_user["user_id"])

    # Build cache key (skip caching if include_relations - too complex)
    if not include_relations:
        cache_key = cache_manager.generate_key(
            "events:list",
            str(user_id),
            skip=skip,
            limit=limit,
            type=event_type.value if event_type else None,
            status=status.value if status else None
        )

        # Try cache first
        cached_events = await cache_manager.get(cache_key)
        if cached_events is not None:
            logger.debug(f"Cache hit for events list: {cache_key}")
            return [Event(**e) for e in cached_events]

    try:
        events = await crud_event.get_events_by_planner(
            db, user_id, skip, limit, event_type, status, include_relations
        )

        # Cache the result (only if not including relations)
        if not include_relations and events:
            # Convert SQLAlchemy ORM objects to Pydantic models before serializing
            await cache_manager.set(
                cache_key,
                [Event.model_validate(e).model_dump(mode="json") for e in events],
                ttl=CacheTTL.SHORT
            )
            logger.debug(f"Cached events list: {cache_key}")

        return events
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve events: {str(e)}")


@router.get("/search/", response_model=List[Event])
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


@router.get("/public/", response_model=List[Event])
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


@router.get("/stats/")
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get dashboard statistics for all user events."""
    user_id = UUID(current_user["user_id"])

    try:
        # Get all events for the user with relationships
        events = await crud_event.get_events_by_planner(db, user_id, 0, 1000, include_relations=True)

        if not events:
            # Return default stats if no events
            return {
                "total_events": 0,
                "events_by_status": {},
                "events_by_type": {},
                "upcoming_events": 0,
                "events_this_month": 0,
                "events_this_year": 0,
                "total_guests": 0,
                "average_guest_count": 0,
                "total_budget": 0,
                "average_budget": 0,
                "completion_rate": 0.0
            }

        # Calculate statistics
        from datetime import datetime, timezone
        from collections import defaultdict

        now = datetime.now(timezone.utc)
        current_month = now.month
        current_year = now.year

        # Initialize counters
        total_events = len(events)
        events_by_status = defaultdict(int)
        events_by_type = defaultdict(int)
        upcoming_events = 0
        events_this_month = 0
        events_this_year = 0
        total_guests = 0
        total_budget = 0.0
        completed_events = 0

        for event in events:
            # Count by status
            events_by_status[event.status.value] += 1

            # Count by type
            events_by_type[event.type.value] += 1

            # Check if upcoming
            event_date = event.start_date
            if event_date > now:
                upcoming_events += 1

            # Check if this month/year
            if event_date.month == current_month and event_date.year == current_year:
                events_this_month += 1
            if event_date.year == current_year:
                events_this_year += 1

            # Add guest count (count related guests)
            guest_count = len(event.guests) if event.guests else 0
            total_guests += guest_count

            # Add budget
            if event.budget_total:
                total_budget += float(event.budget_total)

            # Count completed events
            if event.status.value in ['completed']:
                completed_events += 1

        # Calculate averages
        average_guest_count = total_guests / total_events if total_events > 0 else 0
        average_budget = total_budget / total_events if total_events > 0 else 0
        completion_rate = (completed_events / total_events * 100) if total_events > 0 else 0.0

        return {
            "total_events": total_events,
            "events_by_status": dict(events_by_status),
            "events_by_type": dict(events_by_type),
            "upcoming_events": upcoming_events,
            "events_this_month": events_this_month,
            "events_this_year": events_this_year,
            "total_guests": total_guests,
            "average_guest_count": round(average_guest_count, 1),
            "total_budget": total_budget,
            "average_budget": round(average_budget, 2),
            "completion_rate": round(completion_rate, 1)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve dashboard stats: {str(e)}")


@router.get("/{event_id}/", response_model=Event)
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


@router.put("/{event_id}/", response_model=Event)
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

        # Invalidate cache after update
        await invalidate_user_events_cache(user_id)
        return event
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to update event: {str(e)}")


@router.patch("/{event_id}/", response_model=Event)
async def partial_update_event(
    event_id: UUID,
    event_data: EventUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Partially update an event (same as PUT for this API)."""
    user_id = UUID(current_user["user_id"])

    try:
        event = await crud_event.update_event(db, event_id, event_data, user_id)
        if not event:
            raise HTTPException(status_code=404, detail="Event not found or access denied")

        # Invalidate cache after update
        await invalidate_user_events_cache(user_id)
        return event
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to update event: {str(e)}")


@router.patch("/{event_id}/status/", response_model=Event)
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

        # Invalidate cache after status update
        await invalidate_user_events_cache(user_id)
        return event
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to update event status: {str(e)}")


@router.delete("/{event_id}/", status_code=204)
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

        # Invalidate cache after delete
        await invalidate_user_events_cache(user_id)
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete event: {str(e)}")


@router.get("/{event_id}/stats/")
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


# FR-7: The system shall send email invitations
# 5.2.3: Email Campaign Interface

@router.post("/{event_id}/send-invitations/", response_model=BulkInvitationResponse)
async def send_bulk_invitations(
    event_id: UUID,
    request: BulkInvitationRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Send bulk invitation emails to selected guests.

    Args:
        event_id: Event UUID
        request: Bulk invitation request with filters and options
        db: Database session
        current_user: Authenticated user

    Returns:
        BulkInvitationResponse with campaign statistics

    Raises:
        403: If user doesn't own the event
        404: If event not found
        400: If request validation fails
    """
    user_id = UUID(current_user["user_id"])

    try:
        # Verify event ownership
        event = await crud_event.get_event_by_id(db, event_id)
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        if event.planner_id != user_id:
            raise HTTPException(status_code=403, detail="Access denied")

        # Send bulk invitations
        campaign_service = EmailCampaignService()
        response = await campaign_service.send_bulk_invitations(
            event_id=event_id,
            request=request,
            db=db
        )

        return response

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send invitations: {str(e)}")


@router.get("/{event_id}/invitation-stats/", response_model=CampaignStatsResponse)
async def get_invitation_stats(
    event_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get invitation campaign statistics for an event.

    Args:
        event_id: Event UUID
        db: Database session
        current_user: Authenticated user

    Returns:
        CampaignStatsResponse with delivery metrics

    Raises:
        403: If user doesn't own the event
        404: If event not found
    """
    user_id = UUID(current_user["user_id"])

    try:
        # Verify event ownership
        event = await crud_event.get_event_by_id(db, event_id)
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        if event.planner_id != user_id:
            raise HTTPException(status_code=403, detail="Access denied")

        # Get campaign stats
        campaign_service = EmailCampaignService()
        stats = await campaign_service.get_campaign_stats(
            event_id=event_id,
            db=db
        )

        return stats

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve invitation stats: {str(e)}")