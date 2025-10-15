"""CRUD operations for Guest model."""
from typing import Optional, List
from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, and_, or_

from app.models.guest import Guest, RsvpStatus
from app.schemas.guest import GuestCreate, GuestUpdate, GuestBulkCreate


async def create_guest(db: AsyncSession, guest_data: GuestCreate, event_id: UUID) -> Guest:
    """Create a new guest for an event."""
    db_guest = Guest(
        event_id=event_id,
        email=guest_data.email,
        first_name=guest_data.first_name,
        last_name=guest_data.last_name,
        phone=guest_data.phone,
        plus_one_allowed=guest_data.plus_one_allowed,
        dietary_restrictions=guest_data.dietary_restrictions,
        notes=guest_data.notes
    )
    db.add(db_guest)
    await db.flush()
    await db.refresh(db_guest)
    return db_guest


async def create_guests_bulk(db: AsyncSession, guests_data: List[GuestCreate], event_id: UUID) -> List[Guest]:
    """Create multiple guests for an event."""
    print(f"[CRUD] create_guests_bulk called with {len(guests_data)} guests for event {event_id}")
    db_guests = []
    for idx, guest_data in enumerate(guests_data):
        print(f"[CRUD] Creating guest {idx + 1}/{len(guests_data)}: {guest_data.email}")
        db_guest = Guest(
            event_id=event_id,
            email=guest_data.email,
            first_name=guest_data.first_name,
            last_name=guest_data.last_name,
            phone=guest_data.phone,
            plus_one_allowed=guest_data.plus_one_allowed,
            dietary_restrictions=guest_data.dietary_restrictions,
            notes=guest_data.notes
        )
        db_guests.append(db_guest)

    print(f"[CRUD] Adding {len(db_guests)} guests to session")
    db.add_all(db_guests)

    print(f"[CRUD] Flushing session to database")
    await db.flush()

    print(f"[CRUD] Refreshing guests to get generated IDs and tokens")
    # Refresh all guests to get generated IDs and tokens
    for idx, guest in enumerate(db_guests):
        await db.refresh(guest)
        print(f"[CRUD] Guest {idx + 1} refreshed: ID={guest.id}, RSVP Token={guest.rsvp_token}")

    print(f"[CRUD] create_guests_bulk completed successfully, returning {len(db_guests)} guests")
    return db_guests


async def get_guest_by_id(db: AsyncSession, guest_id: UUID) -> Optional[Guest]:
    """Get guest by ID."""
    result = await db.execute(select(Guest).where(Guest.id == guest_id))
    return result.scalar_one_or_none()


async def get_guest_by_rsvp_token(db: AsyncSession, rsvp_token: str) -> Optional[Guest]:
    """Get guest by RSVP token."""
    result = await db.execute(select(Guest).where(Guest.rsvp_token == rsvp_token))
    return result.scalar_one_or_none()


async def get_guest_by_event_and_email(db: AsyncSession, event_id: UUID, email: str) -> Optional[Guest]:
    """Get guest by event and email (for uniqueness check)."""
    result = await db.execute(
        select(Guest).where(
            and_(Guest.event_id == event_id, Guest.email == email)
        )
    )
    return result.scalar_one_or_none()


async def get_guests_by_event(
    db: AsyncSession,
    event_id: UUID,
    skip: int = 0,
    limit: int = 100,
    rsvp_status: Optional[RsvpStatus] = None,
    plus_one_only: Optional[bool] = None,
    search: Optional[str] = None,
    has_dietary_restrictions: Optional[bool] = None,
    sort_by: str = "first_name",
    sort_order: str = "asc"
) -> List[Guest]:
    """Get guests for an event with filtering, searching, and sorting."""
    query = select(Guest).where(Guest.event_id == event_id)

    # Apply RSVP status filter
    if rsvp_status:
        query = query.where(Guest.rsvp_status == rsvp_status)

    # Apply plus-one filter
    if plus_one_only is not None:
        if plus_one_only:
            query = query.where(Guest.plus_one_allowed == True)
        else:
            query = query.where(Guest.plus_one_allowed == False)

    # Apply dietary restrictions filter
    if has_dietary_restrictions is not None:
        if has_dietary_restrictions:
            query = query.where(
                and_(
                    Guest.dietary_restrictions.isnot(None),
                    Guest.dietary_restrictions != ""
                )
            )
        else:
            query = query.where(
                and_(
                    Guest.dietary_restrictions.is_(None)
                )
            )

    # Apply search filter (name, email, phone)
    if search:
        search_term = f"%{search}%"
        query = query.where(
            or_(
                Guest.first_name.ilike(search_term),
                Guest.last_name.ilike(search_term),
                Guest.email.ilike(search_term),
                Guest.phone.ilike(search_term)
            )
        )

    # Apply sorting
    valid_sort_fields = {
        "first_name": Guest.first_name,
        "last_name": Guest.last_name,
        "email": Guest.email,
        "rsvp_status": Guest.rsvp_status,
        "created_at": Guest.created_at,
        "invitation_sent_at": Guest.invitation_sent_at,
        "rsvp_responded_at": Guest.rsvp_responded_at
    }

    sort_column = valid_sort_fields.get(sort_by, Guest.first_name)
    if sort_order.lower() == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    # Add secondary sort by last_name if primary is first_name
    if sort_by == "first_name":
        query = query.order_by(Guest.last_name.asc())

    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


async def update_guest(db: AsyncSession, guest_id: UUID, guest_data: GuestUpdate) -> Optional[Guest]:
    """Update guest information."""
    update_data = guest_data.model_dump(exclude_unset=True)
    if not update_data:
        return await get_guest_by_id(db, guest_id)
    
    await db.execute(
        update(Guest)
        .where(Guest.id == guest_id)
        .values(**update_data)
    )
    return await get_guest_by_id(db, guest_id)


async def update_guest_rsvp(
    db: AsyncSession, 
    rsvp_token: str, 
    rsvp_status: RsvpStatus,
    plus_one_name: Optional[str] = None
) -> Optional[Guest]:
    """Update guest RSVP status using token."""
    update_data = {
        "rsvp_status": rsvp_status,
        "rsvp_responded_at": datetime.now(timezone.utc)
    }
    
    if plus_one_name is not None:
        update_data["plus_one_name"] = plus_one_name
    
    await db.execute(
        update(Guest)
        .where(Guest.rsvp_token == rsvp_token)
        .values(**update_data)
    )
    return await get_guest_by_rsvp_token(db, rsvp_token)


async def delete_guest(db: AsyncSession, guest_id: UUID) -> bool:
    """Delete a guest."""
    result = await db.execute(delete(Guest).where(Guest.id == guest_id))
    return result.rowcount > 0


async def mark_invitation_sent(db: AsyncSession, guest_id: UUID) -> Optional[Guest]:
    """Mark invitation as sent for a guest."""
    await db.execute(
        update(Guest)
        .where(Guest.id == guest_id)
        .values(invitation_sent_at=datetime.now(timezone.utc))
    )
    return await get_guest_by_id(db, guest_id)


async def get_guests_count_by_event(
    db: AsyncSession,
    event_id: UUID,
    rsvp_status: Optional[RsvpStatus] = None,
    plus_one_only: Optional[bool] = None,
    search: Optional[str] = None,
    has_dietary_restrictions: Optional[bool] = None
) -> int:
    """Get count of guests for an event with filtering."""
    query = select(Guest).where(Guest.event_id == event_id)

    # Apply RSVP status filter
    if rsvp_status:
        query = query.where(Guest.rsvp_status == rsvp_status)

    # Apply plus-one filter
    if plus_one_only is not None:
        if plus_one_only:
            query = query.where(Guest.plus_one_allowed == True)
        else:
            query = query.where(Guest.plus_one_allowed == False)

    # Apply dietary restrictions filter
    if has_dietary_restrictions is not None:
        if has_dietary_restrictions:
            query = query.where(
                and_(
                    Guest.dietary_restrictions.isnot(None),
                    Guest.dietary_restrictions != ""
                )
            )
        else:
            query = query.where(
                and_(
                    Guest.dietary_restrictions.is_(None)
                )
            )

    # Apply search filter (name, email, phone)
    if search:
        search_term = f"%{search}%"
        query = query.where(
            or_(
                Guest.first_name.ilike(search_term),
                Guest.last_name.ilike(search_term),
                Guest.email.ilike(search_term),
                Guest.phone.ilike(search_term)
            )
        )

    result = await db.execute(query)
    return len(result.scalars().all())


async def get_guests_with_dietary_restrictions(db: AsyncSession, event_id: UUID) -> List[Guest]:
    """Get guests with dietary restrictions for an event."""
    result = await db.execute(
        select(Guest).where(
            and_(
                Guest.event_id == event_id,
                Guest.dietary_restrictions.isnot(None),
                Guest.dietary_restrictions != ""
            )
        )
    )
    return result.scalars().all()


async def get_attending_guests_count(db: AsyncSession, event_id: UUID) -> int:
    """Get count of attending guests (including plus ones)."""
    result = await db.execute(
        select(Guest).where(
            and_(
                Guest.event_id == event_id,
                Guest.rsvp_status == RsvpStatus.ATTENDING
            )
        )
    )
    guests = result.scalars().all()

    # Count main guests plus their plus ones
    total_count = len(guests)
    plus_ones_count = sum(1 for guest in guests if guest.plus_one_name)

    return total_count + plus_ones_count


async def bulk_delete_guests(db: AsyncSession, guest_ids: List[UUID]) -> int:
    """Delete multiple guests by IDs."""
    result = await db.execute(
        delete(Guest).where(Guest.id.in_(guest_ids))
    )
    return result.rowcount


async def bulk_update_guests_status(
    db: AsyncSession,
    guest_ids: List[UUID],
    rsvp_status: RsvpStatus
) -> int:
    """Update RSVP status for multiple guests."""
    result = await db.execute(
        update(Guest)
        .where(Guest.id.in_(guest_ids))
        .values(rsvp_status=rsvp_status, rsvp_responded_at=datetime.now(timezone.utc))
    )
    return result.rowcount


async def search_guests(
    db: AsyncSession,
    event_id: UUID,
    search_term: str,
    limit: int = 10
) -> List[Guest]:
    """Search guests by name, email, or phone."""
    search_pattern = f"%{search_term}%"
    query = select(Guest).where(
        and_(
            Guest.event_id == event_id,
            or_(
                Guest.first_name.ilike(search_pattern),
                Guest.last_name.ilike(search_pattern),
                Guest.email.ilike(search_pattern),
                Guest.phone.ilike(search_pattern)
            )
        )
    ).limit(limit)

    result = await db.execute(query)
    return result.scalars().all()