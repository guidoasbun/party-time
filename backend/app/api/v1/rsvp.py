"""Public RSVP endpoints (no authentication required)."""
"""FR-6: The system shall display an RSVP submission page. 5.1.1"""
"""This is the backend that supports the FR-6 Requirements"""

from typing import Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.crud.crud_guest import get_guest_by_rsvp_token
from app.crud import crud_event
from app.schemas.rsvp import (
    RSVPValidationResponse,
    RSVPEventDetailsResponse,
    RSVPSubmissionRequest,
    RSVPSubmissionResponse,
    RSVPPreferencesUpdate,
    RSVPPlusOneUpdate,
    RSVPStatistics
)
from app.models.guest import RsvpStatus, Guest
from app.models.event import Event
from app.services.rsvp_service import get_rsvp_service
from app.middleware.rate_limit import check_rate_limit, get_client_ip

router = APIRouter()


async def get_guest_by_token(
    token: str,
    db: AsyncSession
) -> Guest:
    """Get guest by token or raise 404."""
    guest = await get_guest_by_rsvp_token(db, token)
    if not guest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid or expired RSVP token"
        )
    return guest


@router.get("/rsvp/{token}/validate", response_model=RSVPValidationResponse)
async def validate_rsvp_token(
    token: str,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Validate RSVP token and return basic guest/event information.
    Public endpoint - no authentication required.
    Rate limit: 10 requests per minute per IP.
    """
    # Apply rate limiting
    await check_rate_limit(request, endpoint_type="validation")

    rsvp_service = get_rsvp_service()

    # Validate token format
    if not rsvp_service.validate_token(token):
        return RSVPValidationResponse(
            is_valid=False,
            error_message="Invalid token format"
        )

    # Check if token exists and is not expired
    is_valid, error_message = await rsvp_service.validate_token_access(db, token)

    if not is_valid:
        return RSVPValidationResponse(
            is_valid=False,
            error_message=error_message
        )

    # Get guest and event information
    guest = await get_guest_by_token(token, db)
    event = await crud_event.get_event_by_id(db, guest.event_id)

    if not event:
        return RSVPValidationResponse(
            is_valid=False,
            error_message="Event not found"
        )

    # Track token access
    await rsvp_service.track_token_access(db, token, is_first_access=True)

    return RSVPValidationResponse(
        is_valid=True,
        guest_id=str(guest.id),
        guest_name=f"{guest.first_name} {guest.last_name}",
        event_id=str(event.id),
        event_name=event.name,
        current_rsvp_status=guest.rsvp_status,
        plus_one_allowed=guest.plus_one_allowed,
        token_expires_at=guest.token_expires_at
    )


@router.get("/rsvp/{token}/event-details", response_model=RSVPEventDetailsResponse)
async def get_rsvp_event_details(
    token: str,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Get complete event details for RSVP page.
    Public endpoint - no authentication required.
    Rate limit: 10 requests per minute per IP.
    """
    # Apply rate limiting
    await check_rate_limit(request, endpoint_type="validation")

    # Get guest and validate token
    guest = await get_guest_by_token(token, db)

    # Check if token is expired
    rsvp_service = get_rsvp_service()
    if rsvp_service.is_token_expired(guest.token_expires_at):
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="RSVP token has expired"
        )

    # Get event
    event = await crud_event.get_event_by_id(db, guest.event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    # Get event planner (host)
    from app.crud.crud_user import get_user_by_id
    planner = await get_user_by_id(db, event.planner_id)
    host_name = f"{planner.first_name} {planner.last_name}" if planner else "Event Host"

    # Track token access
    await rsvp_service.track_token_access(db, token)

    # Build response
    return RSVPEventDetailsResponse(
        guest={
            "first_name": guest.first_name,
            "last_name": guest.last_name,
            "email": guest.email,
            "plus_one_allowed": guest.plus_one_allowed
        },
        current_rsvp_status=guest.rsvp_status,
        plus_one_name=guest.plus_one_name,
        dietary_restrictions=guest.dietary_restrictions,
        meal_preference=guest.meal_preference,
        event={
            "name": event.name,
            "description": event.description,
            "type": event.type.value,
            "start_date": event.start_date.isoformat() if event.start_date else None,
            "end_date": event.end_date.isoformat() if event.end_date else None,
            "location": event.location,
            "venue_name": event.venue_name,
            "venue_address": event.venue_address
        },
        rsvp_deadline=None,  # TODO: Add rsvp_deadline to Event model
        custom_message=None,  # TODO: Add custom_message to Event model
        host_name=host_name
    )


@router.post("/rsvp/{token}/respond", response_model=RSVPSubmissionResponse)
async def submit_rsvp_response(
    token: str,
    request: Request,
    rsvp_data: RSVPSubmissionRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Submit RSVP response (attending, not_attending, maybe).
    Public endpoint - no authentication required.
    Rate limit: 5 requests per minute per IP.
    """
    # Apply rate limiting
    await check_rate_limit(request, endpoint_type="submission")

    # Get guest and validate token
    guest = await get_guest_by_token(token, db)

    # Check if token is expired
    rsvp_service = get_rsvp_service()
    if rsvp_service.is_token_expired(guest.token_expires_at):
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="RSVP token has expired"
        )

    # Get event
    event = await crud_event.get_event_by_id(db, guest.event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    # Update guest RSVP status
    guest.rsvp_status = rsvp_data.rsvp_status

    # Update plus-one if provided and allowed
    if rsvp_data.plus_one_name:
        if not guest.plus_one_allowed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Plus-one not allowed for this guest"
            )
        guest.plus_one_name = rsvp_data.plus_one_name
    elif rsvp_data.rsvp_status == RsvpStatus.NOT_ATTENDING:
        # Clear plus-one if not attending
        guest.plus_one_name = None

    # Update dietary restrictions if provided
    if rsvp_data.dietary_restrictions is not None:
        guest.dietary_restrictions = rsvp_data.dietary_restrictions

    # Update meal preference if provided
    if rsvp_data.meal_preference is not None:
        guest.meal_preference = rsvp_data.meal_preference

    # Update notes if provided
    if rsvp_data.notes is not None:
        guest.notes = rsvp_data.notes

    # Track response with IP address
    ip_address = get_client_ip(request)
    await rsvp_service.track_rsvp_response(db, token, ip_address)

    await db.commit()
    await db.refresh(guest)

    # Build response message
    status_messages = {
        RsvpStatus.ATTENDING: "Great! We look forward to seeing you!",
        RsvpStatus.NOT_ATTENDING: "Thank you for letting us know.",
        RsvpStatus.MAYBE: "Thank you! Please let us know when you can confirm."
    }

    return RSVPSubmissionResponse(
        success=True,
        message=status_messages.get(rsvp_data.rsvp_status, "RSVP received."),
        rsvp_status=guest.rsvp_status,
        guest_name=f"{guest.first_name} {guest.last_name}",
        event_name=event.name,
        submitted_at=guest.rsvp_responded_at or datetime.now(timezone.utc)
    )


@router.patch("/rsvp/{token}/preferences", response_model=dict)
async def update_rsvp_preferences(
    token: str,
    request: Request,
    preferences: RSVPPreferencesUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    Update meal preferences and dietary restrictions.
    Public endpoint - no authentication required.
    Rate limit: 5 requests per minute per IP.
    """
    # Apply rate limiting
    await check_rate_limit(request, endpoint_type="update")

    # Get guest and validate token
    guest = await get_guest_by_token(token, db)

    # Check if token is expired
    rsvp_service = get_rsvp_service()
    if rsvp_service.is_token_expired(guest.token_expires_at):
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="RSVP token has expired"
        )

    # Update preferences
    if preferences.dietary_restrictions is not None:
        guest.dietary_restrictions = preferences.dietary_restrictions

    if preferences.meal_preference is not None:
        guest.meal_preference = preferences.meal_preference

    if preferences.notes is not None:
        guest.notes = preferences.notes

    await db.commit()
    await db.refresh(guest)

    return {
        "success": True,
        "message": "Preferences updated successfully",
        "dietary_restrictions": guest.dietary_restrictions,
        "meal_preference": guest.meal_preference
    }


@router.patch("/rsvp/{token}/plus-one", response_model=dict)
async def update_plus_one(
    token: str,
    request: Request,
    plus_one_data: RSVPPlusOneUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    Update plus-one information.
    Public endpoint - no authentication required.
    Rate limit: 5 requests per minute per IP.
    """
    # Apply rate limiting
    await check_rate_limit(request, endpoint_type="update")

    # Get guest and validate token
    guest = await get_guest_by_token(token, db)

    # Check if token is expired
    rsvp_service = get_rsvp_service()
    if rsvp_service.is_token_expired(guest.token_expires_at):
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="RSVP token has expired"
        )

    # Validate plus-one eligibility
    is_eligible, error_message = rsvp_service.validate_plus_one_eligibility(guest)
    if not is_eligible:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_message
        )

    # Update plus-one name
    guest.plus_one_name = plus_one_data.plus_one_name if plus_one_data.plus_one_name else None

    await db.commit()
    await db.refresh(guest)

    return {
        "success": True,
        "message": "Plus-one information updated successfully",
        "plus_one_name": guest.plus_one_name
    }
