"""CRUD operations for Guest model."""
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, and_

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
    db_guests = []
    for guest_data in guests_data:
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
    
    db.add_all(db_guests)
    await db.flush()
    
    # Refresh all guests to get generated IDs and tokens
    for guest in db_guests:
        await db.refresh(guest)
    
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
    plus_one_only: Optional[bool] = None
) -> List[Guest]:
    """Get guests for an event with filtering."""
    query = select(Guest).where(Guest.event_id == event_id)
    
    if rsvp_status:
        query = query.where(Guest.rsvp_status == rsvp_status)
    
    if plus_one_only is not None:
        if plus_one_only:
            query = query.where(Guest.plus_one_allowed == True)
        else:
            query = query.where(Guest.plus_one_allowed == False)
    
    query = query.offset(skip).limit(limit).order_by(Guest.first_name, Guest.last_name)
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
        "rsvp_responded_at": datetime.utcnow()
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
        .values(invitation_sent_at=datetime.utcnow())
    )
    return await get_guest_by_id(db, guest_id)


async def get_guests_count_by_event(
    db: AsyncSession,
    event_id: UUID,
    rsvp_status: Optional[RsvpStatus] = None
) -> int:
    """Get count of guests for an event."""
    query = select(Guest).where(Guest.event_id == event_id)
    
    if rsvp_status:
        query = query.where(Guest.rsvp_status == rsvp_status)
    
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