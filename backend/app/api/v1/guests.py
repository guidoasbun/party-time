"""API endpoints for guest management."""
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, Body, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.core.auth import get_current_user
from app.crud import crud_guest, crud_event
from app.schemas.guest import (
    Guest,
    GuestCreate,
    GuestUpdate,
    GuestBulkCreate,
    GuestRSVPUpdate,
    InvitationLinkData,
    TokenValidationResult,
    RSVPEventDetails,
    QRCodeOptions,
    CSVImportPreview,
    CSVImportResult
)
from app.models.guest import RsvpStatus
from app.services.rsvp_service import get_rsvp_service
from app.services.csv_import_service import csv_import_service

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


# RSVP Token Management Endpoints

@router.get("/{event_id}/guests/{guest_id}/invitation-link", response_model=InvitationLinkData)
async def get_invitation_link(
    event_id: UUID,
    guest_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get invitation link and sharing information for a guest."""
    user_id = UUID(current_user["user_id"])

    try:
        # Verify event ownership
        event = await crud_event.get_event_by_id(db, event_id)
        if not event or event.planner_id != user_id:
            raise HTTPException(status_code=404, detail="Event not found or access denied")

        # Get guest
        guest = await crud_guest.get_guest_by_id(db, guest_id)
        if not guest or guest.event_id != event_id:
            raise HTTPException(status_code=404, detail="Guest not found")

        # Generate invitation link data
        rsvp_service = get_rsvp_service()
        rsvp_url = rsvp_service.generate_rsvp_url(guest.rsvp_token)
        formatted_token = rsvp_service.format_token_for_display(guest.rsvp_token)

        # Generate shareable text
        event_date = event.start_date.strftime("%B %d, %Y at %I:%M %p") if event.start_date else "TBD"
        guest_name = f"{guest.first_name} {guest.last_name}"
        shareable_text = rsvp_service.generate_invitation_text(
            guest_name=guest_name,
            event_name=event.name,
            event_date=event_date,
            rsvp_url=rsvp_url
        )

        # Get sharing links
        sharing_links = rsvp_service.get_sharing_links(rsvp_url, event.name)

        return InvitationLinkData(
            rsvp_url=rsvp_url,
            token=guest.rsvp_token,
            formatted_token=formatted_token,
            shareable_text=shareable_text,
            sharing_links=sharing_links,
            qr_code_url=f"/api/v1/{event_id}/guests/{guest_id}/qr-code"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate invitation link: {str(e)}")


@router.get("/{event_id}/guests/{guest_id}/qr-code")
async def get_qr_code(
    event_id: UUID,
    guest_id: UUID,
    box_size: int = Query(10, ge=5, le=50, description="Size of each QR box"),
    border: int = Query(4, ge=1, le=10, description="Border size in boxes"),
    theme: str = Query("light", pattern="^(light|dark)$", description="Color theme"),
    format: str = Query("png", pattern="^(png|base64)$", description="Output format"),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get QR code for guest RSVP link."""
    user_id = UUID(current_user["user_id"])

    try:
        # Verify event ownership
        event = await crud_event.get_event_by_id(db, event_id)
        if not event or event.planner_id != user_id:
            raise HTTPException(status_code=404, detail="Event not found or access denied")

        # Get guest
        guest = await crud_guest.get_guest_by_id(db, guest_id)
        if not guest or guest.event_id != event_id:
            raise HTTPException(status_code=404, detail="Guest not found")

        # Generate QR code
        rsvp_service = get_rsvp_service()

        if format == "base64":
            # Return base64-encoded image
            qr_base64 = rsvp_service.generate_qr_code_base64(
                token=guest.rsvp_token,
                box_size=box_size,
                border=border,
                theme=theme
            )
            return {"qr_code": qr_base64}
        else:
            # Return binary image
            from fastapi.responses import Response
            qr_bytes = rsvp_service.generate_qr_code(
                token=guest.rsvp_token,
                box_size=box_size,
                border=border,
                theme=theme
            )
            return Response(content=qr_bytes, media_type="image/png")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate QR code: {str(e)}")


@router.post("/{event_id}/guests/{guest_id}/regenerate-token", response_model=Guest)
async def regenerate_token(
    event_id: UUID,
    guest_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Regenerate RSVP token for a guest (invalidates old token)."""
    user_id = UUID(current_user["user_id"])

    try:
        # Verify event ownership
        event = await crud_event.get_event_by_id(db, event_id)
        if not event or event.planner_id != user_id:
            raise HTTPException(status_code=404, detail="Event not found or access denied")

        # Get guest
        guest = await crud_guest.get_guest_by_id(db, guest_id)
        if not guest or guest.event_id != event_id:
            raise HTTPException(status_code=404, detail="Guest not found")

        # Generate new token
        from app.utils.token_generator import generate_rsvp_token
        new_token = generate_rsvp_token()

        # Ensure uniqueness (retry if collision)
        max_retries = 10
        for attempt in range(max_retries):
            existing = await crud_guest.get_guest_by_rsvp_token(db, new_token)
            if not existing:
                break
            new_token = generate_rsvp_token()
            if attempt == max_retries - 1:
                raise HTTPException(status_code=500, detail="Failed to generate unique token")

        # Update guest with new token
        guest.rsvp_token = new_token
        guest.token_first_accessed_at = None  # Reset access tracking
        guest.token_last_accessed_at = None

        await db.commit()
        await db.refresh(guest)

        return guest
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to regenerate token: {str(e)}")


@router.get("/rsvp/{rsvp_token}/validate", response_model=TokenValidationResult)
async def validate_rsvp_token(
    rsvp_token: str,
    db: AsyncSession = Depends(get_db)
):
    """Validate RSVP token (public endpoint)."""
    try:
        rsvp_service = get_rsvp_service()
        is_valid, error_message = await rsvp_service.validate_token_access(db, rsvp_token)

        if is_valid:
            # Get guest and event info
            guest = await crud_guest.get_guest_by_rsvp_token(db, rsvp_token)
            if guest:
                event = await crud_event.get_event_by_id(db, guest.event_id)
                guest_name = f"{guest.first_name} {guest.last_name}"
                event_name = event.name if event else None

                return TokenValidationResult(
                    is_valid=True,
                    guest_name=guest_name,
                    event_name=event_name
                )

        return TokenValidationResult(
            is_valid=False,
            error_message=error_message
        )
    except Exception as e:
        return TokenValidationResult(
            is_valid=False,
            error_message=f"Validation failed: {str(e)}"
        )


@router.get("/rsvp/{rsvp_token}/event-details", response_model=RSVPEventDetails)
async def get_rsvp_event_details(
    rsvp_token: str,
    db: AsyncSession = Depends(get_db)
):
    """Get event details for RSVP page (public endpoint)."""
    try:
        # Validate token
        rsvp_service = get_rsvp_service()
        is_valid, error_message = await rsvp_service.validate_token_access(db, rsvp_token)

        if not is_valid:
            raise HTTPException(status_code=404, detail=error_message or "Invalid token")

        # Get guest
        guest = await crud_guest.get_guest_by_rsvp_token(db, rsvp_token)
        if not guest:
            raise HTTPException(status_code=404, detail="Guest not found")

        # Track first access
        if not guest.token_first_accessed_at:
            await rsvp_service.track_token_access(db, rsvp_token, is_first_access=True)
        else:
            await rsvp_service.track_token_access(db, rsvp_token, is_first_access=False)

        # Get event
        event = await crud_event.get_event_by_id(db, guest.event_id)
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")

        # Build response
        guest_data = {
            "first_name": guest.first_name,
            "last_name": guest.last_name,
            "email": guest.email,
            "plus_one_allowed": guest.plus_one_allowed
        }

        event_data = {
            "name": event.name,
            "description": event.description or "",
            "start_date": event.start_date.isoformat() if event.start_date else "",
            "end_date": event.end_date.isoformat() if event.end_date else "",
            "venue_name": event.venue_name or "",
            "venue_address": event.venue_address or ""
        }

        rsvp_deadline = event.rsvp_deadline.isoformat() if hasattr(event, 'rsvp_deadline') and event.rsvp_deadline else None

        return RSVPEventDetails(
            guest=guest_data,
            event=event_data,
            rsvp_deadline=rsvp_deadline,
            custom_message=None  # Can be added later when custom messages are implemented
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve event details: {str(e)}")


# CSV Import Endpoints

@router.post("/{event_id}/guests/import-preview", response_model=CSVImportPreview)
async def preview_csv_import(
    event_id: UUID,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Preview CSV import without executing it.

    Returns statistics, duplicates, and errors for review before import.
    """
    user_id = UUID(current_user["user_id"])

    try:
        # Verify event ownership
        event = await crud_event.get_event_by_id(db, event_id)
        if not event or event.planner_id != user_id:
            raise HTTPException(status_code=404, detail="Event not found or access denied")

        # Validate file type
        if not file.filename or not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="File must be a CSV file")

        # Read file content
        file_content = await file.read()

        # Validate file size (max 10MB)
        max_size = 10 * 1024 * 1024  # 10MB
        if len(file_content) > max_size:
            raise HTTPException(
                status_code=400,
                detail=f"File size exceeds maximum allowed size of {max_size / (1024 * 1024):.0f}MB"
            )

        # Preview import
        preview_result = await csv_import_service.preview_import(
            db=db,
            event_id=event_id,
            file_content=file_content
        )

        return CSVImportPreview(**preview_result.to_dict())

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to preview CSV import: {str(e)}")


@router.post("/{event_id}/guests/import-execute", response_model=CSVImportResult)
async def execute_csv_import(
    event_id: UUID,
    file: UploadFile = File(...),
    skip_duplicates: bool = Query(True, description="Skip duplicate emails"),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Execute CSV import and create guests in database.

    Imports all valid guests from CSV file, optionally skipping duplicates.
    """
    user_id = UUID(current_user["user_id"])

    try:
        # Verify event ownership
        event = await crud_event.get_event_by_id(db, event_id)
        if not event or event.planner_id != user_id:
            raise HTTPException(status_code=404, detail="Event not found or access denied")

        # Validate file type
        if not file.filename or not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="File must be a CSV file")

        # Read file content
        file_content = await file.read()

        # Validate file size (max 10MB)
        max_size = 10 * 1024 * 1024  # 10MB
        if len(file_content) > max_size:
            raise HTTPException(
                status_code=400,
                detail=f"File size exceeds maximum allowed size of {max_size / (1024 * 1024):.0f}MB"
            )

        # Execute import
        print(f"[API] Starting CSV import for event {event_id}")
        import_result = await csv_import_service.execute_import(
            db=db,
            event_id=event_id,
            file_content=file_content,
            skip_duplicates=skip_duplicates
        )
        print(f"[API] Import completed: {import_result.success_count} created, {import_result.error_count} errors, {import_result.skipped_count} skipped")

        return CSVImportResult(**import_result.to_dict())

    except HTTPException:
        raise
    except Exception as e:
        # Don't rollback here - service already handles transactions
        print(f"[API ERROR] CSV import failed: {type(e).__name__}: {str(e)}")
        import traceback
        print(f"[API ERROR] Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to execute CSV import: {type(e).__name__}: {str(e)}")