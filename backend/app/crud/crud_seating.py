"""
CRUD operations for Seating Chart models.
FR-21: The system shall provide an interactive seating chart interface.
Phase 6: 6.1.2 Seating Chart API Endpoints
"""
from typing import Optional, List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, and_, func
from sqlalchemy.orm import selectinload

from app.models.seating_chart import SeatingChart, TableLayout, SeatAssignment
from app.schemas.seating import (
    SeatingChartCreate,
    SeatingChartUpdate,
    TableLayoutCreate,
    TableLayoutUpdate,
    SeatAssignmentCreate,
    SeatAssignmentUpdate,
)


# ============================================================================
# Seating Chart CRUD
# ============================================================================


async def create_seating_chart(
    db: AsyncSession, chart_data: SeatingChartCreate, event_id: UUID
) -> SeatingChart:
    """Create a new seating chart for an event."""
    db_chart = SeatingChart(
        event_id=event_id,
        name=chart_data.name,
        venue_width=chart_data.venue_width,
        venue_height=chart_data.venue_height,
        venue_unit=chart_data.venue_unit,
        background_image_url=chart_data.background_image_url,
        version=chart_data.version if chart_data.version is not None else 1,
        is_active=chart_data.is_active if chart_data.is_active is not None else True,
        chart_metadata=chart_data.chart_metadata,
    )
    db.add(db_chart)
    await db.flush()
    await db.refresh(db_chart)
    return db_chart


async def get_seating_chart_by_event(
    db: AsyncSession, event_id: UUID, include_tables: bool = False
) -> Optional[SeatingChart]:
    """Get seating chart for an event."""
    query = select(SeatingChart).where(SeatingChart.event_id == event_id)

    if include_tables:
        query = query.options(
            selectinload(SeatingChart.tables).selectinload(TableLayout.seat_assignments)
        )

    result = await db.execute(query)
    return result.scalar_one_or_none()


async def get_seating_chart_by_id(
    db: AsyncSession, chart_id: UUID, include_tables: bool = False
) -> Optional[SeatingChart]:
    """Get seating chart by ID."""
    query = select(SeatingChart).where(SeatingChart.id == chart_id)

    if include_tables:
        query = query.options(
            selectinload(SeatingChart.tables).selectinload(TableLayout.seat_assignments)
        )

    result = await db.execute(query)
    return result.scalar_one_or_none()


async def update_seating_chart(
    db: AsyncSession, chart_id: UUID, chart_data: SeatingChartUpdate
) -> Optional[SeatingChart]:
    """Update a seating chart."""
    # Get existing chart
    chart = await get_seating_chart_by_id(db, chart_id)
    if not chart:
        return None

    # Update only provided fields
    update_data = chart_data.model_dump(exclude_unset=True)
    if update_data:
        await db.execute(
            update(SeatingChart).where(SeatingChart.id == chart_id).values(**update_data)
        )
        await db.flush()
        await db.refresh(chart)

    return chart


async def delete_seating_chart(db: AsyncSession, chart_id: UUID) -> bool:
    """Delete a seating chart (cascade deletes tables and seat assignments)."""
    result = await db.execute(delete(SeatingChart).where(SeatingChart.id == chart_id))
    await db.flush()
    return result.rowcount > 0


# ============================================================================
# Table Layout CRUD
# ============================================================================


async def create_table_layout(
    db: AsyncSession, table_data: TableLayoutCreate, seating_chart_id: UUID
) -> TableLayout:
    """Create a new table layout."""
    db_table = TableLayout(
        seating_chart_id=seating_chart_id,
        table_number=table_data.table_number,
        table_type=table_data.table_type,
        x_position=table_data.x_position,
        y_position=table_data.y_position,
        width=table_data.width,
        height=table_data.height,
        rotation=table_data.rotation,
        capacity=table_data.capacity,
        table_metadata=table_data.table_metadata,
    )
    db.add(db_table)
    await db.flush()
    await db.refresh(db_table)
    return db_table


async def create_tables_bulk(
    db: AsyncSession, tables_data: List[TableLayoutCreate], seating_chart_id: UUID
) -> List[TableLayout]:
    """Create multiple table layouts for a seating chart."""
    db_tables = []
    for table_data in tables_data:
        db_table = TableLayout(
            seating_chart_id=seating_chart_id,
            table_number=table_data.table_number,
            table_type=table_data.table_type,
            x_position=table_data.x_position,
            y_position=table_data.y_position,
            width=table_data.width,
            height=table_data.height,
            rotation=table_data.rotation,
            capacity=table_data.capacity,
            table_metadata=table_data.table_metadata,
        )
        db_tables.append(db_table)

    db.add_all(db_tables)
    await db.flush()

    # Refresh all tables to get generated IDs
    for table in db_tables:
        await db.refresh(table)

    return db_tables


async def get_table_layout_by_id(
    db: AsyncSession, table_id: UUID, include_seats: bool = False
) -> Optional[TableLayout]:
    """Get table layout by ID."""
    query = select(TableLayout).where(TableLayout.id == table_id)

    if include_seats:
        query = query.options(selectinload(TableLayout.seat_assignments))

    result = await db.execute(query)
    return result.scalar_one_or_none()


async def get_tables_by_chart(
    db: AsyncSession, seating_chart_id: UUID, include_seats: bool = False
) -> List[TableLayout]:
    """Get all tables for a seating chart."""
    query = select(TableLayout).where(TableLayout.seating_chart_id == seating_chart_id)

    if include_seats:
        query = query.options(selectinload(TableLayout.seat_assignments))

    result = await db.execute(query)
    return list(result.scalars().all())


async def update_table_layout(
    db: AsyncSession, table_id: UUID, table_data: TableLayoutUpdate
) -> Optional[TableLayout]:
    """Update a table layout."""
    # Get existing table
    table = await get_table_layout_by_id(db, table_id)
    if not table:
        return None

    # Update only provided fields
    update_data = table_data.model_dump(exclude_unset=True)
    if update_data:
        await db.execute(
            update(TableLayout).where(TableLayout.id == table_id).values(**update_data)
        )
        await db.flush()
        await db.refresh(table)

    return table


async def delete_table_layout(db: AsyncSession, table_id: UUID) -> bool:
    """Delete a table layout (cascade deletes seat assignments)."""
    result = await db.execute(delete(TableLayout).where(TableLayout.id == table_id))
    await db.flush()
    return result.rowcount > 0


# ============================================================================
# Seat Assignment CRUD
# ============================================================================


async def create_seat_assignment(
    db: AsyncSession, seat_data: SeatAssignmentCreate, table_layout_id: UUID
) -> SeatAssignment:
    """Create a new seat assignment."""
    db_seat = SeatAssignment(
        table_layout_id=table_layout_id,
        guest_id=seat_data.guest_id,
        seat_number=seat_data.seat_number,
        seat_position=seat_data.seat_position,
        notes=seat_data.notes,
    )
    db.add(db_seat)
    await db.flush()
    await db.refresh(db_seat)
    return db_seat


async def create_seat_assignments_bulk(
    db: AsyncSession, seats_data: List[SeatAssignmentCreate], table_layout_id: UUID
) -> List[SeatAssignment]:
    """Create multiple seat assignments for a table."""
    db_seats = []
    for seat_data in seats_data:
        db_seat = SeatAssignment(
            table_layout_id=table_layout_id,
            guest_id=seat_data.guest_id,
            seat_number=seat_data.seat_number,
            seat_position=seat_data.seat_position,
            notes=seat_data.notes,
        )
        db_seats.append(db_seat)

    db.add_all(db_seats)
    await db.flush()

    # Refresh all seats to get generated IDs
    for seat in db_seats:
        await db.refresh(seat)

    return db_seats


async def get_seat_assignment_by_id(db: AsyncSession, seat_id: UUID) -> Optional[SeatAssignment]:
    """Get seat assignment by ID."""
    result = await db.execute(select(SeatAssignment).where(SeatAssignment.id == seat_id))
    return result.scalar_one_or_none()


async def get_seats_by_table(db: AsyncSession, table_layout_id: UUID) -> List[SeatAssignment]:
    """Get all seat assignments for a table."""
    result = await db.execute(
        select(SeatAssignment).where(SeatAssignment.table_layout_id == table_layout_id)
    )
    return list(result.scalars().all())


async def get_seat_by_guest(db: AsyncSession, guest_id: UUID) -> Optional[SeatAssignment]:
    """Get seat assignment for a guest."""
    result = await db.execute(
        select(SeatAssignment).where(SeatAssignment.guest_id == guest_id)
    )
    return result.scalar_one_or_none()


async def update_seat_assignment(
    db: AsyncSession, seat_id: UUID, seat_data: SeatAssignmentUpdate
) -> Optional[SeatAssignment]:
    """Update a seat assignment."""
    # Get existing seat
    seat = await get_seat_assignment_by_id(db, seat_id)
    if not seat:
        return None

    # Update only provided fields
    update_data = seat_data.model_dump(exclude_unset=True)
    if update_data:
        await db.execute(
            update(SeatAssignment).where(SeatAssignment.id == seat_id).values(**update_data)
        )
        await db.flush()
        await db.refresh(seat)

    return seat


async def delete_seat_assignment(db: AsyncSession, seat_id: UUID) -> bool:
    """Delete a seat assignment."""
    result = await db.execute(delete(SeatAssignment).where(SeatAssignment.id == seat_id))
    await db.flush()
    return result.rowcount > 0


async def unassign_guest_from_seat(db: AsyncSession, seat_id: UUID) -> Optional[SeatAssignment]:
    """Remove guest from a seat (set guest_id to NULL)."""
    # Get existing seat
    seat = await get_seat_assignment_by_id(db, seat_id)
    if not seat:
        return None

    # Set guest_id to None
    await db.execute(
        update(SeatAssignment).where(SeatAssignment.id == seat_id).values(guest_id=None)
    )
    await db.flush()
    await db.refresh(seat)

    return seat


# ============================================================================
# Specialized Queries & Statistics
# ============================================================================


async def get_assigned_seats_count(db: AsyncSession, table_layout_id: UUID) -> int:
    """Get count of assigned seats for a table."""
    result = await db.execute(
        select(func.count(SeatAssignment.id))
        .where(
            and_(
                SeatAssignment.table_layout_id == table_layout_id,
                SeatAssignment.guest_id.isnot(None),
            )
        )
    )
    return result.scalar() or 0


async def get_total_capacity(db: AsyncSession, seating_chart_id: UUID) -> int:
    """Get total seating capacity for a chart."""
    result = await db.execute(
        select(func.sum(TableLayout.capacity)).where(
            TableLayout.seating_chart_id == seating_chart_id
        )
    )
    return result.scalar() or 0


async def get_total_assigned(db: AsyncSession, seating_chart_id: UUID) -> int:
    """Get total assigned seats for a chart."""
    result = await db.execute(
        select(func.count(SeatAssignment.id))
        .join(TableLayout, SeatAssignment.table_layout_id == TableLayout.id)
        .where(
            and_(
                TableLayout.seating_chart_id == seating_chart_id,
                SeatAssignment.guest_id.isnot(None),
            )
        )
    )
    return result.scalar() or 0


async def check_table_capacity(db: AsyncSession, table_layout_id: UUID) -> dict:
    """Check if table has reached capacity."""
    table = await get_table_layout_by_id(db, table_layout_id)
    if not table:
        return {"exists": False}

    assigned_count = await get_assigned_seats_count(db, table_layout_id)

    return {
        "exists": True,
        "capacity": table.capacity,
        "assigned": assigned_count,
        "available": table.capacity - assigned_count,
        "is_full": assigned_count >= table.capacity,
    }


async def check_duplicate_seat_assignment(
    db: AsyncSession, table_layout_id: UUID, guest_id: UUID
) -> bool:
    """Check if guest is already assigned to a seat at this table."""
    result = await db.execute(
        select(SeatAssignment).where(
            and_(
                SeatAssignment.table_layout_id == table_layout_id,
                SeatAssignment.guest_id == guest_id,
            )
        )
    )
    return result.scalar_one_or_none() is not None


async def get_available_seat_numbers(db: AsyncSession, table_layout_id: UUID) -> List[int]:
    """Get list of available seat numbers for a table."""
    # Get table to know capacity
    table = await get_table_layout_by_id(db, table_layout_id)
    if not table:
        return []

    # Get all assigned seat numbers
    result = await db.execute(
        select(SeatAssignment.seat_number).where(
            SeatAssignment.table_layout_id == table_layout_id
        )
    )
    assigned_numbers = set(result.scalars().all())

    # Return unassigned seat numbers (1 to capacity)
    all_seats = set(range(1, table.capacity + 1))
    return sorted(list(all_seats - assigned_numbers))
