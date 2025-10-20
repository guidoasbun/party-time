"""CRUD operations for Event model."""
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, and_, or_
from sqlalchemy.orm import selectinload

from app.models.event import Event, EventType, EventStatus
from app.schemas.event import EventCreate, EventUpdate


async def create_event(db: AsyncSession, event_data: EventCreate, planner_id: UUID) -> Event:
    """Create a new event."""
    # Convert custom questions to dict format for JSONB (if present)
    # FR-6: The system shall display an RSVP submission page.
    # 5.1.4: RSVP Customization
    custom_questions_data = None
    if event_data.custom_questions:
        custom_questions_data = [q.model_dump() for q in event_data.custom_questions]

    db_event = Event(
        name=event_data.name,
        description=event_data.description,
        type=event_data.type,
        start_date=event_data.start_date,
        end_date=event_data.end_date,
        location=event_data.location,
        venue_name=event_data.venue_name,
        venue_address=event_data.venue_address,
        venue_google_place_id=event_data.venue_google_place_id,
        max_guests=event_data.max_guests,
        budget_total=event_data.budget_total,
        is_public=event_data.is_public,
        # FR-6: The system shall display an RSVP submission page.
        # 5.1.4: RSVP Customization - JSONB fields handle JSON serialization automatically
        rsvp_deadline=event_data.rsvp_deadline,
        allow_plus_ones=event_data.allow_plus_ones,
        meal_options=event_data.meal_options,  # JSONB handles serialization
        custom_questions=custom_questions_data,  # JSONB handles serialization
        dietary_restrictions_enabled=event_data.dietary_restrictions_enabled,
        planner_id=planner_id
    )
    db.add(db_event)
    await db.flush()
    await db.refresh(db_event)
    return db_event


async def get_event_by_id(db: AsyncSession, event_id: UUID, include_relations: bool = False) -> Optional[Event]:
    """Get event by ID with optional relations."""
    query = select(Event).where(Event.id == event_id)
    
    if include_relations:
        query = query.options(
            selectinload(Event.guests),
            selectinload(Event.budget_categories),
            selectinload(Event.expenses)
        )
    
    result = await db.execute(query)
    return result.scalar_one_or_none()


async def get_events_by_planner(
    db: AsyncSession, 
    planner_id: UUID,
    skip: int = 0,
    limit: int = 100,
    event_type: Optional[EventType] = None,
    status: Optional[EventStatus] = None,
    include_relations: bool = False
) -> List[Event]:
    """Get events for a specific planner with filtering."""
    query = select(Event).where(Event.planner_id == planner_id)
    
    if event_type:
        query = query.where(Event.type == event_type)
    if status:
        query = query.where(Event.status == status)
    
    if include_relations:
        query = query.options(
            selectinload(Event.guests),
            selectinload(Event.budget_categories),
            selectinload(Event.expenses)
        )
    
    query = query.offset(skip).limit(limit).order_by(Event.start_date.desc())
    result = await db.execute(query)
    return result.scalars().all()


async def get_public_events(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 100,
    event_type: Optional[EventType] = None
) -> List[Event]:
    """Get public events."""
    query = select(Event).where(Event.is_public == True)
    
    if event_type:
        query = query.where(Event.type == event_type)
    
    query = query.offset(skip).limit(limit).order_by(Event.start_date.desc())
    result = await db.execute(query)
    return result.scalars().all()


async def search_events(
    db: AsyncSession,
    planner_id: Optional[UUID] = None,
    search_term: Optional[str] = None,
    event_type: Optional[EventType] = None,
    status: Optional[EventStatus] = None,
    start_date_from: Optional[datetime] = None,
    start_date_to: Optional[datetime] = None,
    skip: int = 0,
    limit: int = 100
) -> List[Event]:
    """Search events with multiple filters."""
    query = select(Event)
    
    conditions = []
    
    if planner_id:
        conditions.append(Event.planner_id == planner_id)
    
    if search_term:
        search_filter = or_(
            Event.name.ilike(f"%{search_term}%"),
            Event.description.ilike(f"%{search_term}%"),
            Event.location.ilike(f"%{search_term}%")
        )
        conditions.append(search_filter)
    
    if event_type:
        conditions.append(Event.type == event_type)
    
    if status:
        conditions.append(Event.status == status)
    
    if start_date_from:
        conditions.append(Event.start_date >= start_date_from)
    
    if start_date_to:
        conditions.append(Event.start_date <= start_date_to)
    
    if conditions:
        query = query.where(and_(*conditions))
    
    query = query.offset(skip).limit(limit).order_by(Event.start_date.desc())
    result = await db.execute(query)
    return result.scalars().all()


async def update_event(db: AsyncSession, event_id: UUID, event_data: EventUpdate, planner_id: UUID) -> Optional[Event]:
    """Update event information (only by planner)."""
    # Verify ownership
    event = await get_event_by_id(db, event_id)
    if not event or event.planner_id != planner_id:
        return None

    update_data = event_data.model_dump(exclude_unset=True)
    if not update_data:
        return event

    # Convert custom questions to dict format for JSONB if present
    if 'custom_questions' in update_data and update_data['custom_questions'] is not None:
        update_data['custom_questions'] = [q.model_dump() if hasattr(q, 'model_dump') else q for q in update_data['custom_questions']]

    await db.execute(
        update(Event)
        .where(Event.id == event_id)
        .values(**update_data)
    )
    return await get_event_by_id(db, event_id)


async def delete_event(db: AsyncSession, event_id: UUID, planner_id: UUID) -> bool:
    """Delete an event (only by planner)."""
    # Verify ownership
    event = await get_event_by_id(db, event_id)
    if not event or event.planner_id != planner_id:
        return False
    
    result = await db.execute(delete(Event).where(Event.id == event_id))
    return result.rowcount > 0


async def update_event_status(db: AsyncSession, event_id: UUID, status: EventStatus, planner_id: UUID) -> Optional[Event]:
    """Update event status (only by planner)."""
    # Verify ownership
    event = await get_event_by_id(db, event_id)
    if not event or event.planner_id != planner_id:
        return None
    
    await db.execute(
        update(Event)
        .where(Event.id == event_id)
        .values(status=status)
    )
    return await get_event_by_id(db, event_id)


async def get_events_count_by_planner(
    db: AsyncSession,
    planner_id: UUID,
    status: Optional[EventStatus] = None
) -> int:
    """Get count of events for a planner."""
    query = select(Event).where(Event.planner_id == planner_id)
    
    if status:
        query = query.where(Event.status == status)
    
    result = await db.execute(query)
    return len(result.scalars().all())