"""
FR-8: The system shall provide a venue search interface.
Phase 7.1.1: Google Places API Integration
API endpoints for venue management (Phase 7.1.1: Google Places API Integration)

Provides endpoints for:
- Searching venues via Google Places API
- Getting venue details
- Managing event venues (CRUD)
"""
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from sqlalchemy.orm import selectinload

from app.core.dependencies import get_db
from app.core.auth import get_current_user
from app.models.event import Event
from app.models.venue import EventVenue
from app.schemas.venue import (
    VenueSearchParams,
    VenueSearchResponse,
    VenueDetailsResponse,
    VenuePhotoResponse,
    EventVenueCreate,
    EventVenueUpdate,
    EventVenueResponse,
    EventVenueWithDetails,
    EventVenuesListResponse,
    EventVenueReorderRequest,
)
from app.services.venue_service import venue_service

router = APIRouter()


# ============================================================
# Google Places API Search Endpoints
# ============================================================

@router.get("/search/", response_model=VenueSearchResponse)
async def search_venues(
    query: str = Query(..., min_length=1, max_length=500, description="Search query"),
    latitude: Optional[float] = Query(None, ge=-90, le=90, description="Center latitude"),
    longitude: Optional[float] = Query(None, ge=-180, le=180, description="Center longitude"),
    radius: int = Query(50000, ge=1, le=50000, description="Search radius in meters"),
    venue_type: Optional[str] = Query(None, description="Google Places type filter"),
    min_rating: Optional[float] = Query(None, ge=1, le=5, description="Minimum rating"),
    max_results: int = Query(20, ge=1, le=50, description="Maximum results"),
    current_user: dict = Depends(get_current_user)
):
    """
    Search for venues using Google Places API.

    Returns a list of venues matching the search criteria.
    Results are cached for 1 hour to reduce API costs.
    """
    params = VenueSearchParams(
        query=query,
        latitude=latitude,
        longitude=longitude,
        radius=radius,
        venue_type=venue_type,
        min_rating=min_rating,
        max_results=max_results,
    )

    result = await venue_service.search_venues(params)
    return result


@router.get("/{place_id}/", response_model=VenueDetailsResponse)
async def get_venue_details(
    place_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get detailed information about a venue from Google Places.

    Includes photos, reviews, opening hours, and contact info.
    Results are cached for 24 hours.
    """
    details = await venue_service.get_venue_details(place_id)
    if not details:
        raise HTTPException(status_code=404, detail="Venue not found")
    return details


@router.get("/{place_id}/photos/", response_model=List[VenuePhotoResponse])
async def get_venue_photos(
    place_id: str,
    max_width: int = Query(800, ge=100, le=4096, description="Maximum photo width"),
    max_height: int = Query(600, ge=100, le=4096, description="Maximum photo height"),
    limit: int = Query(10, ge=1, le=20, description="Maximum number of photos"),
    current_user: dict = Depends(get_current_user)
):
    """
    Get photos for a venue.

    Photo URLs are cached for 7 days.
    """
    photos = await venue_service.get_venue_photos(place_id, max_width, max_height, limit)
    return photos


# ============================================================
# Event Venue Management Endpoints
# ============================================================

@router.post("/events/{event_id}/venues/", response_model=EventVenueResponse, status_code=201)
async def add_venue_to_event(
    event_id: UUID,
    venue_data: EventVenueCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Add a venue to an event.

    Can add either a Google Places venue (by place_id) or a manual venue.
    An event can have multiple venues.
    """
    user_id = UUID(current_user["user_id"])

    # Verify event ownership
    event = await db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if event.planner_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this event")

    # Get the next display order
    result = await db.execute(
        select(EventVenue)
        .where(EventVenue.event_id == event_id)
        .order_by(EventVenue.display_order.desc())
        .limit(1)
    )
    last_venue = result.scalar_one_or_none()
    next_order = (last_venue.display_order + 1) if last_venue else 0

    # If place_id provided, fetch venue details from Google
    if venue_data.place_id:
        details = await venue_service.get_venue_details(venue_data.place_id)
        if not details:
            raise HTTPException(status_code=400, detail="Could not fetch venue details from Google Places")

        # Get primary photo URL
        photo_url = None
        if details.photos:
            photo_url = details.photos[0].url

        new_venue = EventVenue(
            event_id=event_id,
            name=details.name,
            address=details.formatted_address,
            latitude=details.location.latitude,
            longitude=details.location.longitude,
            google_place_id=venue_data.place_id,
            phone=details.phone,
            website=details.website,
            rating=details.rating,
            price_level=details.price_level,
            photo_url=photo_url,
            is_manual=False,
            notes=venue_data.notes,
            display_order=next_order,
        )
    else:
        # Manual venue - require basic fields
        if not venue_data.name or not venue_data.address:
            raise HTTPException(
                status_code=400,
                detail="Name and address are required for manual venues"
            )
        if venue_data.latitude is None or venue_data.longitude is None:
            raise HTTPException(
                status_code=400,
                detail="Latitude and longitude are required for manual venues"
            )

        new_venue = EventVenue(
            event_id=event_id,
            name=venue_data.name,
            address=venue_data.address,
            latitude=venue_data.latitude,
            longitude=venue_data.longitude,
            google_place_id=None,
            phone=venue_data.phone,
            website=venue_data.website,
            is_manual=True,
            notes=venue_data.notes,
            display_order=next_order,
        )

    db.add(new_venue)
    await db.commit()
    await db.refresh(new_venue)

    return new_venue


@router.get("/events/{event_id}/venues/", response_model=EventVenuesListResponse)
async def get_event_venues(
    event_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get all venues for an event.

    Returns venues ordered by display_order.
    """
    user_id = UUID(current_user["user_id"])

    # Verify event ownership
    event = await db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if event.planner_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to view this event")

    result = await db.execute(
        select(EventVenue)
        .where(EventVenue.event_id == event_id)
        .order_by(EventVenue.display_order)
    )
    venues = result.scalars().all()

    return EventVenuesListResponse(
        venues=list(venues),
        total=len(venues),
        event_id=event_id,
    )


@router.put("/events/{event_id}/venues/reorder/", response_model=EventVenuesListResponse)
async def reorder_event_venues(
    event_id: UUID,
    reorder_request: EventVenueReorderRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Reorder venues for an event.

    Provide venue IDs in the desired order.
    """
    user_id = UUID(current_user["user_id"])

    # Verify event ownership
    event = await db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if event.planner_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this event")

    # Verify all venue IDs belong to this event
    result = await db.execute(
        select(EventVenue)
        .where(EventVenue.event_id == event_id)
    )
    existing_venues = {v.id: v for v in result.scalars().all()}

    for venue_id in reorder_request.venue_ids:
        if venue_id not in existing_venues:
            raise HTTPException(
                status_code=400,
                detail=f"Venue {venue_id} not found in this event"
            )

    # Update display orders
    for index, venue_id in enumerate(reorder_request.venue_ids):
        venue = existing_venues[venue_id]
        venue.display_order = index
        venue.updated_at = datetime.utcnow()

    await db.commit()

    # Return updated list
    result = await db.execute(
        select(EventVenue)
        .where(EventVenue.event_id == event_id)
        .order_by(EventVenue.display_order)
    )
    venues = result.scalars().all()

    return EventVenuesListResponse(
        venues=list(venues),
        total=len(venues),
        event_id=event_id,
    )


@router.get("/events/{event_id}/venues/{venue_id}/", response_model=EventVenueWithDetails)
async def get_event_venue(
    event_id: UUID,
    venue_id: UUID,
    include_google_details: bool = Query(False, description="Fetch fresh details from Google"),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get a specific venue for an event.

    Optionally fetch fresh details from Google Places API.
    """
    user_id = UUID(current_user["user_id"])

    # Verify event ownership
    event = await db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if event.planner_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to view this event")

    venue = await db.get(EventVenue, venue_id)
    if not venue or venue.event_id != event_id:
        raise HTTPException(status_code=404, detail="Venue not found")

    # Fetch Google details if requested and venue has a place_id
    google_details = None
    if include_google_details and venue.google_place_id:
        google_details = await venue_service.get_venue_details(venue.google_place_id)

    return EventVenueWithDetails(
        **{c.name: getattr(venue, c.name) for c in venue.__table__.columns},
        google_details=google_details,
    )


@router.put("/events/{event_id}/venues/{venue_id}/", response_model=EventVenueResponse)
async def update_event_venue(
    event_id: UUID,
    venue_id: UUID,
    venue_update: EventVenueUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Update an event venue.

    Can update notes, display_order, and manual venue fields.
    """
    user_id = UUID(current_user["user_id"])

    # Verify event ownership
    event = await db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if event.planner_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this event")

    venue = await db.get(EventVenue, venue_id)
    if not venue or venue.event_id != event_id:
        raise HTTPException(status_code=404, detail="Venue not found")

    # Update fields
    update_data = venue_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        # Only allow updating location fields for manual venues
        if field in ["name", "address", "latitude", "longitude", "phone", "website"]:
            if not venue.is_manual:
                continue  # Skip these fields for Google venues
        setattr(venue, field, value)

    venue.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(venue)

    return venue


@router.delete("/events/{event_id}/venues/{venue_id}/", status_code=204)
async def remove_venue_from_event(
    event_id: UUID,
    venue_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Remove a venue from an event."""
    user_id = UUID(current_user["user_id"])

    # Verify event ownership
    event = await db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if event.planner_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this event")

    venue = await db.get(EventVenue, venue_id)
    if not venue or venue.event_id != event_id:
        raise HTTPException(status_code=404, detail="Venue not found")

    await db.delete(venue)
    await db.commit()
