"""API endpoints for guest management."""
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.core.auth import get_current_user
from app.crud import crud_guest, crud_event
from app.schemas.guest import Guest, GuestCreate, GuestUpdate, GuestBulkCreate, GuestRSVPUpdate
from app.models.guest import RsvpStatus

router = APIRouter()


@router.post("/{event_id}/guests/", response_model=Guest, status_code=201)
async def create_guest(
    event_id: UUID,
    guest_data: GuestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new guest for an event."""
    user_id = UUID(current_user["user_id"])
    
    try:
        # Verify event ownership
        event = await crud_event.get_event_by_id(db, event_id)
        if not event or event.planner_id != user_id:
            raise HTTPException(status_code=404, detail="Event not found or access denied")
        
        # Check for duplicate email
        existing_guest = await crud_guest.get_guest_by_event_and_email(db, event_id, guest_data.email)
        if existing_guest:
            raise HTTPException(status_code=400, detail="Guest with this email already exists for this event")
        
        guest = await crud_guest.create_guest(db, guest_data, event_id)
        return guest
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create guest: {str(e)}")


@router.post("/{event_id}/guests/bulk", response_model=List[Guest], status_code=201)
async def create_guests_bulk(
    event_id: UUID,
    guests_data: List[GuestCreate],
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create multiple guests for an event."""
    user_id = UUID(current_user["user_id"])
    
    try:
        # Verify event ownership
        event = await crud_event.get_event_by_id(db, event_id)
        if not event or event.planner_id != user_id:
            raise HTTPException(status_code=404, detail="Event not found or access denied")
        
        # Check for duplicate emails in the batch and existing guests
        emails = [guest.email for guest in guests_data]
        if len(emails) != len(set(emails)):
            raise HTTPException(status_code=400, detail="Duplicate emails found in the batch")
        
        # Check existing guests
        for email in emails:
            existing_guest = await crud_guest.get_guest_by_event_and_email(db, event_id, email)
            if existing_guest:
                raise HTTPException(status_code=400, detail=f"Guest with email {email} already exists for this event")
        
        guests = await crud_guest.create_guests_bulk(db, guests_data, event_id)
        return guests
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create guests: {str(e)}")


@router.get("/{event_id}/guests/", response_model=List[Guest])
async def get_guests(
    event_id: UUID,
    skip: int = Query(0, ge=0, description="Number of guests to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of guests to return"),
    rsvp_status: Optional[RsvpStatus] = Query(None, description="Filter by RSVP status"),
    plus_one_only: Optional[bool] = Query(None, description="Filter by plus one allowed"),
    search: Optional[str] = Query(None, description="Search by name, email, or phone"),
    has_dietary_restrictions: Optional[bool] = Query(None, description="Filter by dietary restrictions presence"),
    sort_by: str = Query("first_name", description="Field to sort by"),
    sort_order: str = Query("asc", pattern="^(asc|desc)$", description="Sort order"),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get guests for an event with filtering, searching, and sorting."""
    user_id = UUID(current_user["user_id"])

    try:
        # Verify event ownership or public access
        event = await crud_event.get_event_by_id(db, event_id)
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")

        if event.planner_id != user_id and not event.is_public:
            raise HTTPException(status_code=403, detail="Access denied")

        guests = await crud_guest.get_guests_by_event(
            db, event_id, skip, limit, rsvp_status, plus_one_only,
            search, has_dietary_restrictions, sort_by, sort_order
        )
        return guests
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve guests: {str(e)}")


@router.get("/{event_id}/guests/stats")
async def get_guest_stats(
    event_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get guest statistics for an event."""
    user_id = UUID(current_user["user_id"])
    
    try:
        # Verify event ownership
        event = await crud_event.get_event_by_id(db, event_id)
        if not event or event.planner_id != user_id:
            raise HTTPException(status_code=404, detail="Event not found or access denied")
        
        total_invited = await crud_guest.get_guests_count_by_event(db, event_id)
        attending = await crud_guest.get_guests_count_by_event(db, event_id, RsvpStatus.ATTENDING)
        not_attending = await crud_guest.get_guests_count_by_event(db, event_id, RsvpStatus.NOT_ATTENDING)
        maybe = await crud_guest.get_guests_count_by_event(db, event_id, RsvpStatus.MAYBE)
        pending = await crud_guest.get_guests_count_by_event(db, event_id, RsvpStatus.PENDING)
        
        total_attending_with_plus_ones = await crud_guest.get_attending_guests_count(db, event_id)
        
        return {
            "event_id": str(event_id),
            "total_invited": total_invited,
            "rsvp_responses": {
                "attending": attending,
                "not_attending": not_attending,
                "maybe": maybe,
                "pending": pending
            },
            "total_attending_with_plus_ones": total_attending_with_plus_ones,
            "response_rate": ((total_invited - pending) / total_invited * 100) if total_invited > 0 else 0.0
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve guest stats: {str(e)}")


@router.get("/{event_id}/guests/dietary-restrictions")
async def get_guests_with_dietary_restrictions(
    event_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get guests with dietary restrictions for an event."""
    user_id = UUID(current_user["user_id"])

    try:
        # Verify event ownership
        event = await crud_event.get_event_by_id(db, event_id)
        if not event or event.planner_id != user_id:
            raise HTTPException(status_code=404, detail="Event not found or access denied")

        guests = await crud_guest.get_guests_with_dietary_restrictions(db, event_id)
        return guests
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve dietary restrictions: {str(e)}")


@router.get("/{event_id}/guests/search", response_model=List[Guest])
async def search_guests(
    event_id: UUID,
    q: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(10, ge=1, le=100, description="Maximum results to return"),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Search guests by name, email, or phone."""
    user_id = UUID(current_user["user_id"])

    try:
        # Verify event ownership
        event = await crud_event.get_event_by_id(db, event_id)
        if not event or event.planner_id != user_id:
            raise HTTPException(status_code=404, detail="Event not found or access denied")

        # Perform search
        guests = await crud_guest.search_guests(db, event_id, q, limit)

        return guests
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to search guests: {str(e)}")


@router.get("/{event_id}/guests/{guest_id}", response_model=Guest)
async def get_guest(
    event_id: UUID,
    guest_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get a specific guest."""
    user_id = UUID(current_user["user_id"])
    
    try:
        # Verify event ownership
        event = await crud_event.get_event_by_id(db, event_id)
        if not event or event.planner_id != user_id:
            raise HTTPException(status_code=404, detail="Event not found or access denied")
        
        guest = await crud_guest.get_guest_by_id(db, guest_id)
        if not guest or guest.event_id != event_id:
            raise HTTPException(status_code=404, detail="Guest not found")
        
        return guest
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve guest: {str(e)}")


@router.put("/{event_id}/guests/{guest_id}", response_model=Guest)
async def update_guest(
    event_id: UUID,
    guest_id: UUID,
    guest_data: GuestUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update a guest."""
    user_id = UUID(current_user["user_id"])
    
    try:
        # Verify event ownership
        event = await crud_event.get_event_by_id(db, event_id)
        if not event or event.planner_id != user_id:
            raise HTTPException(status_code=404, detail="Event not found or access denied")
        
        # Verify guest belongs to event
        existing_guest = await crud_guest.get_guest_by_id(db, guest_id)
        if not existing_guest or existing_guest.event_id != event_id:
            raise HTTPException(status_code=404, detail="Guest not found")
        
        # Check for email conflicts if email is being updated
        if guest_data.email and guest_data.email != existing_guest.email:
            email_conflict = await crud_guest.get_guest_by_event_and_email(db, event_id, guest_data.email)
            if email_conflict:
                raise HTTPException(status_code=400, detail="Guest with this email already exists for this event")
        
        guest = await crud_guest.update_guest(db, guest_id, guest_data)
        return guest
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to update guest: {str(e)}")


@router.delete("/{event_id}/guests/{guest_id}", status_code=204)
async def delete_guest(
    event_id: UUID,
    guest_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete a guest."""
    user_id = UUID(current_user["user_id"])
    
    try:
        # Verify event ownership
        event = await crud_event.get_event_by_id(db, event_id)
        if not event or event.planner_id != user_id:
            raise HTTPException(status_code=404, detail="Event not found or access denied")
        
        # Verify guest belongs to event
        guest = await crud_guest.get_guest_by_id(db, guest_id)
        if not guest or guest.event_id != event_id:
            raise HTTPException(status_code=404, detail="Guest not found")
        
        success = await crud_guest.delete_guest(db, guest_id)
        if not success:
            raise HTTPException(status_code=404, detail="Guest not found")
        
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete guest: {str(e)}")


# RSVP endpoints (public - no authentication required)

@router.get("/rsvp/{rsvp_token}", response_model=Guest)
async def get_guest_by_rsvp_token(
    rsvp_token: str,
    db: AsyncSession = Depends(get_db)
):
    """Get guest information by RSVP token (public endpoint)."""
    try:
        guest = await crud_guest.get_guest_by_rsvp_token(db, rsvp_token)
        if not guest:
            raise HTTPException(status_code=404, detail="Invalid RSVP token")
        
        return guest
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve guest: {str(e)}")


@router.post("/rsvp/{rsvp_token}", response_model=Guest)
async def update_guest_rsvp(
    rsvp_token: str,
    rsvp_data: GuestRSVPUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update guest RSVP response (public endpoint)."""
    try:
        # Verify token exists
        existing_guest = await crud_guest.get_guest_by_rsvp_token(db, rsvp_token)
        if not existing_guest:
            raise HTTPException(status_code=404, detail="Invalid RSVP token")
        
        # Validate plus one name if attending and plus one allowed
        plus_one_name = None
        if rsvp_data.rsvp_status == RsvpStatus.ATTENDING and existing_guest.plus_one_allowed:
            plus_one_name = rsvp_data.plus_one_name
        
        guest = await crud_guest.update_guest_rsvp(
            db, rsvp_token, rsvp_data.rsvp_status, plus_one_name
        )
        return guest
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to update RSVP: {str(e)}")


# Guest utilities

@router.get("/{event_id}/guests/{guest_id}/rsvp-token")
async def get_guest_rsvp_token(
    event_id: UUID,
    guest_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get RSVP token for a guest (development/testing only)."""
    user_id = UUID(current_user["user_id"])
    
    try:
        # Verify event ownership
        event = await crud_event.get_event_by_id(db, event_id)
        if not event or event.planner_id != user_id:
            raise HTTPException(status_code=404, detail="Event not found or access denied")
        
        # Verify guest belongs to event
        guest = await crud_guest.get_guest_by_id(db, guest_id)
        if not guest or guest.event_id != event_id:
            raise HTTPException(status_code=404, detail="Guest not found")
        
        return {"rsvp_token": guest.rsvp_token}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve RSVP token: {str(e)}")


@router.post("/{event_id}/guests/{guest_id}/send-invitation", response_model=Guest)
async def send_invitation(
    event_id: UUID,
    guest_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Mark invitation as sent for a guest."""
    user_id = UUID(current_user["user_id"])

    try:
        # Verify event ownership
        event = await crud_event.get_event_by_id(db, event_id)
        if not event or event.planner_id != user_id:
            raise HTTPException(status_code=404, detail="Event not found or access denied")

        # Verify guest belongs to event
        guest = await crud_guest.get_guest_by_id(db, guest_id)
        if not guest or guest.event_id != event_id:
            raise HTTPException(status_code=404, detail="Guest not found")

        updated_guest = await crud_guest.mark_invitation_sent(db, guest_id)

        # TODO: In Phase 2.3, integrate with email service to actually send invitation
        # For now, just mark as sent

        return updated_guest
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send invitation: {str(e)}")


@router.post("/{event_id}/guests/bulk-delete", status_code=200)
async def bulk_delete_guests(
    event_id: UUID,
    guest_ids: List[UUID] = Body(..., embed=True),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete multiple guests at once."""
    user_id = UUID(current_user["user_id"])

    try:
        # Verify event ownership
        event = await crud_event.get_event_by_id(db, event_id)
        if not event or event.planner_id != user_id:
            raise HTTPException(status_code=404, detail="Event not found or access denied")

        # Verify all guests belong to this event
        for guest_id in guest_ids:
            guest = await crud_guest.get_guest_by_id(db, guest_id)
            if not guest or guest.event_id != event_id:
                raise HTTPException(
                    status_code=400,
                    detail=f"Guest {guest_id} not found or does not belong to this event"
                )

        # Perform bulk delete
        deleted_count = await crud_guest.bulk_delete_guests(db, guest_ids)

        return {
            "message": f"Successfully deleted {deleted_count} guests",
            "deleted_count": deleted_count
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete guests: {str(e)}")


@router.patch("/{event_id}/guests/bulk-update", status_code=200)
async def bulk_update_guest_status(
    event_id: UUID,
    guest_ids: List[UUID] = Body(..., embed=True),
    rsvp_status: RsvpStatus = Body(..., embed=True),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update RSVP status for multiple guests at once."""
    user_id = UUID(current_user["user_id"])

    try:
        # Verify event ownership
        event = await crud_event.get_event_by_id(db, event_id)
        if not event or event.planner_id != user_id:
            raise HTTPException(status_code=404, detail="Event not found or access denied")

        # Verify all guests belong to this event
        for guest_id in guest_ids:
            guest = await crud_guest.get_guest_by_id(db, guest_id)
            if not guest or guest.event_id != event_id:
                raise HTTPException(
                    status_code=400,
                    detail=f"Guest {guest_id} not found or does not belong to this event"
                )

        # Perform bulk update
        updated_count = await crud_guest.bulk_update_guests_status(db, guest_ids, rsvp_status)

        return {
            "message": f"Successfully updated {updated_count} guests to {rsvp_status.value}",
            "updated_count": updated_count,
            "new_status": rsvp_status.value
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update guests: {str(e)}")