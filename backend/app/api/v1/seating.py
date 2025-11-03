"""
API endpoints for seating chart management.

FR-21: The system shall provide an interactive seating chart interface
Phase 6.1.2: Seating Chart API Endpoints
"""
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.core.auth import get_current_user
from app.crud import crud_seating, crud_event, crud_guest
from app.schemas.seating import (
    SeatingChartResponse,
    SeatingChartCreate,
    SeatingChartUpdate,
    SeatingChartWithTables,
    SeatingChartSummary,
    TableLayoutResponse,
    TableLayoutCreate,
    TableLayoutUpdate,
    TableLayoutWithSeats,
    SeatAssignmentResponse,
    SeatAssignmentCreate,
    SeatAssignmentUpdate,
    SeatAssignmentWithGuest,
    BulkTableCreate,
    BulkSeatAssignmentCreate,
    AutoAssignRequest,
)
from app.services.seating_service import SeatingChartService

router = APIRouter()
seating_service = SeatingChartService()


# ============================================================================
# Seating Chart Endpoints
# ============================================================================


@router.post("/{event_id}/seating", response_model=SeatingChartResponse, status_code=201)
async def create_seating_chart(
    event_id: UUID,
    chart_data: SeatingChartCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new seating chart for an event."""
    user_id = UUID(current_user["user_id"])

    try:
        # Verify event ownership
        event = await crud_event.get_event_by_id(db, event_id)
        if not event or event.planner_id != user_id:
            raise HTTPException(status_code=404, detail="Event not found or access denied")

        # Check if seating chart already exists for this event
        existing_chart = await crud_seating.get_seating_chart_by_event(db, event_id)
        if existing_chart:
            raise HTTPException(
                status_code=400,
                detail="Seating chart already exists for this event. Use PUT to update."
            )

        # Create seating chart
        chart = await crud_seating.create_seating_chart(db, chart_data, event_id)
        await db.commit()
        return chart

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create seating chart: {str(e)}")


@router.get("/{event_id}/seating", response_model=SeatingChartWithTables)
async def get_seating_chart(
    event_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get the seating chart for an event with all tables and seats."""
    user_id = UUID(current_user["user_id"])

    try:
        # Verify event ownership
        event = await crud_event.get_event_by_id(db, event_id)
        if not event or event.planner_id != user_id:
            raise HTTPException(status_code=404, detail="Event not found or access denied")

        # Get seating chart with tables
        chart = await crud_seating.get_seating_chart_by_event(db, event_id, include_tables=True)
        if not chart:
            raise HTTPException(status_code=404, detail="Seating chart not found for this event")

        # Calculate statistics
        total_tables = len(chart.tables)
        total_capacity = await crud_seating.get_total_capacity(db, chart.id)
        total_assigned = await crud_seating.get_total_assigned(db, chart.id)

        # Build response with statistics
        return {
            **chart.__dict__,
            "tables": chart.tables,
            "total_tables": total_tables,
            "total_capacity": total_capacity,
            "total_assigned": total_assigned,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get seating chart: {str(e)}")


@router.put("/{event_id}/seating/{chart_id}", response_model=SeatingChartResponse)
async def update_seating_chart(
    event_id: UUID,
    chart_id: UUID,
    chart_data: SeatingChartUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update a seating chart."""
    user_id = UUID(current_user["user_id"])

    try:
        # Verify event ownership
        event = await crud_event.get_event_by_id(db, event_id)
        if not event or event.planner_id != user_id:
            raise HTTPException(status_code=404, detail="Event not found or access denied")

        # Verify chart belongs to event
        chart = await crud_seating.get_seating_chart_by_id(db, chart_id)
        if not chart or chart.event_id != event_id:
            raise HTTPException(status_code=404, detail="Seating chart not found for this event")

        # Update chart
        updated_chart = await crud_seating.update_seating_chart(db, chart_id, chart_data)
        await db.commit()

        return updated_chart

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update seating chart: {str(e)}")


@router.delete("/{event_id}/seating/{chart_id}", status_code=200)
async def delete_seating_chart(
    event_id: UUID,
    chart_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete a seating chart (cascade deletes tables and seats)."""
    user_id = UUID(current_user["user_id"])

    try:
        # Verify event ownership
        event = await crud_event.get_event_by_id(db, event_id)
        if not event or event.planner_id != user_id:
            raise HTTPException(status_code=404, detail="Event not found or access denied")

        # Verify chart belongs to event
        chart = await crud_seating.get_seating_chart_by_id(db, chart_id)
        if not chart or chart.event_id != event_id:
            raise HTTPException(status_code=404, detail="Seating chart not found for this event")

        # Delete chart
        deleted = await crud_seating.delete_seating_chart(db, chart_id)
        await db.commit()

        if not deleted:
            raise HTTPException(status_code=404, detail="Failed to delete seating chart")

        return {"message": "Seating chart deleted successfully", "deleted_chart_id": str(chart_id)}

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete seating chart: {str(e)}")


# ============================================================================
# Table Layout Endpoints
# ============================================================================


@router.post("/{event_id}/seating/{chart_id}/tables", response_model=TableLayoutResponse, status_code=201)
async def create_table_layout(
    event_id: UUID,
    chart_id: UUID,
    table_data: TableLayoutCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new table layout."""
    user_id = UUID(current_user["user_id"])

    try:
        # Verify event ownership
        event = await crud_event.get_event_by_id(db, event_id)
        if not event or event.planner_id != user_id:
            raise HTTPException(status_code=404, detail="Event not found or access denied")

        # Verify chart belongs to event
        chart = await crud_seating.get_seating_chart_by_id(db, chart_id)
        if not chart or chart.event_id != event_id:
            raise HTTPException(status_code=404, detail="Seating chart not found for this event")

        # Create table
        table = await crud_seating.create_table_layout(db, table_data, chart_id)
        await db.commit()
        return table

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create table: {str(e)}")


@router.post("/{event_id}/seating/{chart_id}/tables/bulk", response_model=List[TableLayoutResponse], status_code=201)
async def create_tables_bulk(
    event_id: UUID,
    chart_id: UUID,
    bulk_data: BulkTableCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create multiple tables for a seating chart."""
    user_id = UUID(current_user["user_id"])

    try:
        # Verify event ownership
        event = await crud_event.get_event_by_id(db, event_id)
        if not event or event.planner_id != user_id:
            raise HTTPException(status_code=404, detail="Event not found or access denied")

        # Verify chart belongs to event
        chart = await crud_seating.get_seating_chart_by_id(db, chart_id)
        if not chart or chart.event_id != event_id:
            raise HTTPException(status_code=404, detail="Seating chart not found for this event")

        # Validate bulk size
        if len(bulk_data.tables) > 100:
            raise HTTPException(status_code=400, detail="Cannot create more than 100 tables at once")

        # Create tables
        tables = await crud_seating.create_tables_bulk(db, bulk_data.tables, chart_id)
        await db.commit()
        return tables

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create tables: {str(e)}")


@router.get("/{event_id}/seating/{chart_id}/tables/{table_id}", response_model=TableLayoutWithSeats)
async def get_table_layout(
    event_id: UUID,
    chart_id: UUID,
    table_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get a table layout with all seat assignments."""
    user_id = UUID(current_user["user_id"])

    try:
        # Verify event ownership
        event = await crud_event.get_event_by_id(db, event_id)
        if not event or event.planner_id != user_id:
            raise HTTPException(status_code=404, detail="Event not found or access denied")

        # Verify chart belongs to event
        chart = await crud_seating.get_seating_chart_by_id(db, chart_id)
        if not chart or chart.event_id != event_id:
            raise HTTPException(status_code=404, detail="Seating chart not found for this event")

        # Get table with seats
        table = await crud_seating.get_table_layout_by_id(db, table_id, include_seats=True)
        if not table or table.seating_chart_id != chart_id:
            raise HTTPException(status_code=404, detail="Table not found for this seating chart")

        # Calculate seat statistics
        assigned_count = len([seat for seat in table.seat_assignments if seat.guest_id])
        empty_seats = table.capacity - assigned_count

        return {
            **table.__dict__,
            "seat_assignments": table.seat_assignments,
            "assigned_count": assigned_count,
            "empty_seats": empty_seats,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get table: {str(e)}")


@router.put("/{event_id}/seating/{chart_id}/tables/{table_id}", response_model=TableLayoutResponse)
async def update_table_layout(
    event_id: UUID,
    chart_id: UUID,
    table_id: UUID,
    table_data: TableLayoutUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update a table layout (position, dimensions, capacity, etc.)."""
    user_id = UUID(current_user["user_id"])

    try:
        # Verify event ownership
        event = await crud_event.get_event_by_id(db, event_id)
        if not event or event.planner_id != user_id:
            raise HTTPException(status_code=404, detail="Event not found or access denied")

        # Verify chart belongs to event
        chart = await crud_seating.get_seating_chart_by_id(db, chart_id)
        if not chart or chart.event_id != event_id:
            raise HTTPException(status_code=404, detail="Seating chart not found for this event")

        # Verify table belongs to chart
        table = await crud_seating.get_table_layout_by_id(db, table_id)
        if not table or table.seating_chart_id != chart_id:
            raise HTTPException(status_code=404, detail="Table not found for this seating chart")

        # If capacity is being reduced, check if it would invalidate existing assignments
        if table_data.capacity is not None and table_data.capacity < table.capacity:
            assigned_count = await crud_seating.get_assigned_seats_count(db, table_id)
            if table_data.capacity < assigned_count:
                raise HTTPException(
                    status_code=400,
                    detail=f"Cannot reduce capacity to {table_data.capacity}. Currently {assigned_count} seats are assigned."
                )

        # Update table
        updated_table = await crud_seating.update_table_layout(db, table_id, table_data)
        await db.commit()

        return updated_table

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update table: {str(e)}")


@router.delete("/{event_id}/seating/{chart_id}/tables/{table_id}", status_code=200)
async def delete_table_layout(
    event_id: UUID,
    chart_id: UUID,
    table_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete a table layout (cascade deletes seat assignments)."""
    user_id = UUID(current_user["user_id"])

    try:
        # Verify event ownership
        event = await crud_event.get_event_by_id(db, event_id)
        if not event or event.planner_id != user_id:
            raise HTTPException(status_code=404, detail="Event not found or access denied")

        # Verify chart belongs to event
        chart = await crud_seating.get_seating_chart_by_id(db, chart_id)
        if not chart or chart.event_id != event_id:
            raise HTTPException(status_code=404, detail="Seating chart not found for this event")

        # Verify table belongs to chart
        table = await crud_seating.get_table_layout_by_id(db, table_id)
        if not table or table.seating_chart_id != chart_id:
            raise HTTPException(status_code=404, detail="Table not found for this seating chart")

        # Delete table
        deleted = await crud_seating.delete_table_layout(db, table_id)
        await db.commit()

        if not deleted:
            raise HTTPException(status_code=404, detail="Failed to delete table")

        return {"message": "Table deleted successfully", "deleted_table_id": str(table_id)}

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete table: {str(e)}")


# ============================================================================
# Seat Assignment Endpoints
# ============================================================================


@router.post("/{event_id}/seating/{chart_id}/tables/{table_id}/seats", response_model=SeatAssignmentResponse, status_code=201)
async def create_seat_assignment(
    event_id: UUID,
    chart_id: UUID,
    table_id: UUID,
    seat_data: SeatAssignmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Assign a guest to a seat."""
    user_id = UUID(current_user["user_id"])

    try:
        # Verify event ownership
        event = await crud_event.get_event_by_id(db, event_id)
        if not event or event.planner_id != user_id:
            raise HTTPException(status_code=404, detail="Event not found or access denied")

        # Verify chart belongs to event
        chart = await crud_seating.get_seating_chart_by_id(db, chart_id)
        if not chart or chart.event_id != event_id:
            raise HTTPException(status_code=404, detail="Seating chart not found for this event")

        # Verify table belongs to chart
        table = await crud_seating.get_table_layout_by_id(db, table_id)
        if not table or table.seating_chart_id != chart_id:
            raise HTTPException(status_code=404, detail="Table not found for this seating chart")

        # If guest_id provided, validate the assignment
        if seat_data.guest_id:
            validation = await seating_service.validate_seat_assignment(
                table_id, seat_data.guest_id, event_id, db
            )
            if not validation["valid"]:
                raise HTTPException(status_code=400, detail="; ".join(validation["errors"]))

        # Create seat assignment
        seat = await crud_seating.create_seat_assignment(db, seat_data, table_id)
        await db.commit()
        return seat

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create seat assignment: {str(e)}")


@router.put("/{event_id}/seating/{chart_id}/seats/{seat_id}", response_model=SeatAssignmentResponse)
async def update_seat_assignment(
    event_id: UUID,
    chart_id: UUID,
    seat_id: UUID,
    seat_data: SeatAssignmentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update a seat assignment (change guest, seat number, or notes)."""
    user_id = UUID(current_user["user_id"])

    try:
        # Verify event ownership
        event = await crud_event.get_event_by_id(db, event_id)
        if not event or event.planner_id != user_id:
            raise HTTPException(status_code=404, detail="Event not found or access denied")

        # Get seat and verify it belongs to this event's chart
        seat = await crud_seating.get_seat_assignment_by_id(db, seat_id)
        if not seat:
            raise HTTPException(status_code=404, detail="Seat assignment not found")

        # Get table to verify chart ownership
        table = await crud_seating.get_table_layout_by_id(db, seat.table_layout_id)
        if not table or table.seating_chart_id != chart_id:
            raise HTTPException(status_code=404, detail="Seat not found for this seating chart")

        # Verify chart belongs to event
        chart = await crud_seating.get_seating_chart_by_id(db, chart_id)
        if not chart or chart.event_id != event_id:
            raise HTTPException(status_code=404, detail="Seating chart not found for this event")

        # If updating guest_id, validate the new assignment
        if seat_data.guest_id is not None:
            validation = await seating_service.validate_seat_assignment(
                seat.table_layout_id, seat_data.guest_id, event_id, db
            )
            if not validation["valid"]:
                raise HTTPException(status_code=400, detail="; ".join(validation["errors"]))

        # Update seat assignment
        updated_seat = await crud_seating.update_seat_assignment(db, seat_id, seat_data)
        await db.commit()

        return updated_seat

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update seat assignment: {str(e)}")


@router.delete("/{event_id}/seating/{chart_id}/seats/{seat_id}", status_code=200)
async def delete_seat_assignment(
    event_id: UUID,
    chart_id: UUID,
    seat_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete a seat assignment (unassign guest from seat)."""
    user_id = UUID(current_user["user_id"])

    try:
        # Verify event ownership
        event = await crud_event.get_event_by_id(db, event_id)
        if not event or event.planner_id != user_id:
            raise HTTPException(status_code=404, detail="Event not found or access denied")

        # Get seat and verify it belongs to this event's chart
        seat = await crud_seating.get_seat_assignment_by_id(db, seat_id)
        if not seat:
            raise HTTPException(status_code=404, detail="Seat assignment not found")

        # Get table to verify chart ownership
        table = await crud_seating.get_table_layout_by_id(db, seat.table_layout_id)
        if not table or table.seating_chart_id != chart_id:
            raise HTTPException(status_code=404, detail="Seat not found for this seating chart")

        # Verify chart belongs to event
        chart = await crud_seating.get_seating_chart_by_id(db, chart_id)
        if not chart or chart.event_id != event_id:
            raise HTTPException(status_code=404, detail="Seating chart not found for this event")

        # Delete seat assignment
        deleted = await crud_seating.delete_seat_assignment(db, seat_id)
        await db.commit()

        if not deleted:
            raise HTTPException(status_code=404, detail="Failed to delete seat assignment")

        return {"message": "Seat assignment deleted successfully", "deleted_seat_id": str(seat_id)}

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete seat assignment: {str(e)}")


# ============================================================================
# Advanced Operations
# ============================================================================


@router.post("/{event_id}/seating/{chart_id}/auto-assign", status_code=200)
async def auto_assign_guests(
    event_id: UUID,
    chart_id: UUID,
    request: AutoAssignRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Auto-assign guests to seats using specified strategy."""
    user_id = UUID(current_user["user_id"])

    try:
        # Verify event ownership
        event = await crud_event.get_event_by_id(db, event_id)
        if not event or event.planner_id != user_id:
            raise HTTPException(status_code=404, detail="Event not found or access denied")

        # Verify chart belongs to event
        chart = await crud_seating.get_seating_chart_by_id(db, chart_id)
        if not chart or chart.event_id != event_id:
            raise HTTPException(status_code=404, detail="Seating chart not found for this event")

        # Validate guest count
        if len(request.guest_ids) > 1000:
            raise HTTPException(status_code=400, detail="Cannot auto-assign more than 1000 guests at once")

        # Execute auto-assignment
        result = await seating_service.auto_assign_guests(chart_id, request, db)

        return result

    except HTTPException:
        raise
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to auto-assign guests: {str(e)}")


@router.get("/{event_id}/seating/{chart_id}/statistics", status_code=200)
async def get_seating_statistics(
    event_id: UUID,
    chart_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get comprehensive statistics for a seating chart."""
    user_id = UUID(current_user["user_id"])

    try:
        # Verify event ownership
        event = await crud_event.get_event_by_id(db, event_id)
        if not event or event.planner_id != user_id:
            raise HTTPException(status_code=404, detail="Event not found or access denied")

        # Verify chart belongs to event
        chart = await crud_seating.get_seating_chart_by_id(db, chart_id)
        if not chart or chart.event_id != event_id:
            raise HTTPException(status_code=404, detail="Seating chart not found for this event")

        # Get statistics
        stats = await seating_service.get_seating_statistics(chart_id, db)

        return stats

    except HTTPException:
        raise
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get statistics: {str(e)}")
