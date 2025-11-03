"""
Seating Chart Service for auto-assignment and validation.

FR-21: The system shall provide an interactive seating chart interface
Phase 6.1.2: Seating Chart API Endpoints

This service provides:
- Auto-assignment algorithms (fill_tables, distribute)
- Capacity validation and checks
- Guest ownership verification
- Seating statistics and analytics
"""

import logging
from typing import List, Dict, Any, Optional
from uuid import UUID
from sqlalchemy import select, and_, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.seating_chart import SeatingChart, TableLayout, SeatAssignment
from app.models.guest import Guest
from app.models.event import Event
from app.schemas.seating import AutoAssignRequest
from app.crud import crud_seating

logger = logging.getLogger(__name__)


class SeatingChartService:
    """Service for managing seating chart operations and algorithms"""

    async def auto_assign_guests(
        self,
        seating_chart_id: UUID,
        request: AutoAssignRequest,
        db: AsyncSession
    ) -> Dict[str, Any]:
        """
        Auto-assign guests to seats using specified strategy.

        Args:
            seating_chart_id: Seating chart UUID
            request: Auto-assignment request with guest IDs and strategy
            db: Database session

        Returns:
            Dict with assignment suggestions and statistics
        """
        logger.info(f"Auto-assigning {len(request.guest_ids)} guests to chart {seating_chart_id}")
        logger.info(f"Strategy: {request.strategy}")

        # 1. Validate seating chart exists
        chart = await crud_seating.get_seating_chart_by_id(db, seating_chart_id, include_tables=True)
        if not chart:
            raise ValueError(f"Seating chart {seating_chart_id} not found")

        # 2. Validate all guests exist and belong to the event
        guests = await self._validate_guests(request.guest_ids, chart.event_id, db)
        if len(guests) != len(request.guest_ids):
            raise ValueError("Some guests not found or do not belong to this event")

        # 3. Get tables and check capacity
        tables = await crud_seating.get_tables_by_chart(db, seating_chart_id, include_seats=True)
        if not tables:
            raise ValueError("No tables found in seating chart")

        total_capacity = sum(table.capacity for table in tables)
        if len(guests) > total_capacity:
            raise ValueError(
                f"Not enough capacity: {len(guests)} guests but only {total_capacity} seats available"
            )

        # 4. Get already assigned guests to exclude them
        already_assigned_ids = set()
        for table in tables:
            for seat in table.seat_assignments:
                if seat.guest_id:
                    already_assigned_ids.add(seat.guest_id)

        # Filter out already assigned guests
        unassigned_guests = [g for g in guests if g.id not in already_assigned_ids]
        logger.info(f"Guests to assign: {len(unassigned_guests)} (excluding {len(already_assigned_ids)} already assigned)")

        # 5. Execute strategy
        strategy = request.strategy or "fill_tables"
        if strategy == "fill_tables":
            assignments = await self._fill_tables_strategy(unassigned_guests, tables, db)
        elif strategy == "distribute":
            assignments = await self._distribute_strategy(unassigned_guests, tables, db)
        else:
            raise ValueError(f"Unknown strategy: {strategy}")

        # 6. Return assignment suggestions
        return {
            "seating_chart_id": str(seating_chart_id),
            "strategy": strategy,
            "total_guests": len(request.guest_ids),
            "already_assigned": len(already_assigned_ids),
            "newly_assigned": len(assignments),
            "total_capacity": total_capacity,
            "remaining_capacity": total_capacity - (len(already_assigned_ids) + len(assignments)),
            "assignments": assignments
        }

    async def _fill_tables_strategy(
        self,
        guests: List[Guest],
        tables: List[TableLayout],
        db: AsyncSession
    ) -> List[Dict[str, Any]]:
        """
        Fill tables sequentially until full, then move to next table.

        Args:
            guests: List of guests to assign
            tables: List of available tables
            db: Database session

        Returns:
            List of assignment dictionaries
        """
        assignments = []
        guest_index = 0
        total_guests = len(guests)

        # Sort tables by table number for consistent ordering
        sorted_tables = sorted(tables, key=lambda t: t.table_number)

        for table in sorted_tables:
            if guest_index >= total_guests:
                break

            # Get existing assignments for this table
            existing_seats = [seat.seat_number for seat in table.seat_assignments if seat.guest_id]
            available_seats = table.capacity - len(existing_seats)

            if available_seats <= 0:
                continue

            # Get available seat numbers
            all_seats = set(range(1, table.capacity + 1))
            taken_seats = set(seat.seat_number for seat in table.seat_assignments)
            free_seat_numbers = sorted(list(all_seats - taken_seats))

            # Assign guests to this table
            seats_to_fill = min(available_seats, total_guests - guest_index, len(free_seat_numbers))

            for i in range(seats_to_fill):
                guest = guests[guest_index]
                seat_number = free_seat_numbers[i]

                assignments.append({
                    "guest_id": str(guest.id),
                    "guest_name": f"{guest.first_name} {guest.last_name}",
                    "table_id": str(table.id),
                    "table_number": table.table_number,
                    "seat_number": seat_number
                })

                guest_index += 1

        return assignments

    async def _distribute_strategy(
        self,
        guests: List[Guest],
        tables: List[TableLayout],
        db: AsyncSession
    ) -> List[Dict[str, Any]]:
        """
        Distribute guests evenly across all tables.

        Args:
            guests: List of guests to assign
            tables: List of available tables
            db: Database session

        Returns:
            List of assignment dictionaries
        """
        assignments = []
        total_guests = len(guests)

        # Sort tables by table number
        sorted_tables = sorted(tables, key=lambda t: t.table_number)

        # Calculate available seats per table
        table_info = []
        for table in sorted_tables:
            existing_assignments = len([seat for seat in table.seat_assignments if seat.guest_id])
            available_seats = table.capacity - existing_assignments

            if available_seats > 0:
                # Get free seat numbers
                all_seats = set(range(1, table.capacity + 1))
                taken_seats = set(seat.seat_number for seat in table.seat_assignments)
                free_seat_numbers = sorted(list(all_seats - taken_seats))

                table_info.append({
                    "table": table,
                    "available": available_seats,
                    "free_seats": free_seat_numbers,
                    "current_index": 0
                })

        if not table_info:
            return assignments

        # Round-robin distribution
        guest_index = 0
        table_index = 0

        while guest_index < total_guests:
            current_table_info = table_info[table_index]

            # Check if this table still has available seats
            if current_table_info["current_index"] < len(current_table_info["free_seats"]):
                guest = guests[guest_index]
                table = current_table_info["table"]
                seat_number = current_table_info["free_seats"][current_table_info["current_index"]]

                assignments.append({
                    "guest_id": str(guest.id),
                    "guest_name": f"{guest.first_name} {guest.last_name}",
                    "table_id": str(table.id),
                    "table_number": table.table_number,
                    "seat_number": seat_number
                })

                current_table_info["current_index"] += 1
                guest_index += 1

            # Move to next table (round-robin)
            table_index = (table_index + 1) % len(table_info)

            # Check if all tables are full
            all_full = all(
                info["current_index"] >= len(info["free_seats"])
                for info in table_info
            )
            if all_full:
                break

        return assignments

    async def _validate_guests(
        self,
        guest_ids: List[UUID],
        event_id: UUID,
        db: AsyncSession
    ) -> List[Guest]:
        """
        Validate that all guests exist and belong to the event.

        Args:
            guest_ids: List of guest UUIDs
            event_id: Event UUID
            db: Database session

        Returns:
            List of validated Guest objects
        """
        result = await db.execute(
            select(Guest).where(
                and_(
                    Guest.id.in_(guest_ids),
                    Guest.event_id == event_id
                )
            )
        )
        return list(result.scalars().all())

    async def get_seating_statistics(
        self,
        seating_chart_id: UUID,
        db: AsyncSession
    ) -> Dict[str, Any]:
        """
        Get comprehensive statistics for a seating chart.

        Args:
            seating_chart_id: Seating chart UUID
            db: Database session

        Returns:
            Dict with seating statistics
        """
        # Get chart with tables and seats
        chart = await crud_seating.get_seating_chart_by_id(db, seating_chart_id, include_tables=True)
        if not chart:
            raise ValueError(f"Seating chart {seating_chart_id} not found")

        total_tables = len(chart.tables)
        total_capacity = 0
        total_assigned = 0
        tables_by_type = {}
        table_stats = []

        for table in chart.tables:
            total_capacity += table.capacity
            assigned_count = len([seat for seat in table.seat_assignments if seat.guest_id])
            total_assigned += assigned_count

            # Count by table type
            table_type = table.table_type.value
            tables_by_type[table_type] = tables_by_type.get(table_type, 0) + 1

            # Individual table stats
            table_stats.append({
                "table_id": str(table.id),
                "table_number": table.table_number,
                "table_type": table_type,
                "capacity": table.capacity,
                "assigned": assigned_count,
                "available": table.capacity - assigned_count,
                "fill_percentage": round((assigned_count / table.capacity * 100), 1) if table.capacity > 0 else 0
            })

        return {
            "seating_chart_id": str(seating_chart_id),
            "total_tables": total_tables,
            "total_capacity": total_capacity,
            "total_assigned": total_assigned,
            "total_unassigned": total_capacity - total_assigned,
            "assignment_percentage": round((total_assigned / total_capacity * 100), 1) if total_capacity > 0 else 0,
            "tables_by_type": tables_by_type,
            "average_table_size": round(total_capacity / total_tables, 1) if total_tables > 0 else 0,
            "table_stats": table_stats
        }

    async def validate_seat_assignment(
        self,
        table_layout_id: UUID,
        guest_id: UUID,
        event_id: UUID,
        db: AsyncSession
    ) -> Dict[str, Any]:
        """
        Validate if a seat assignment is allowed.

        Args:
            table_layout_id: Table layout UUID
            guest_id: Guest UUID
            event_id: Event UUID
            db: Database session

        Returns:
            Dict with validation result and error messages
        """
        errors = []

        # 1. Check if table exists
        table = await crud_seating.get_table_layout_by_id(db, table_layout_id, include_seats=True)
        if not table:
            return {"valid": False, "errors": ["Table not found"]}

        # 2. Check if guest exists and belongs to event
        result = await db.execute(
            select(Guest).where(and_(Guest.id == guest_id, Guest.event_id == event_id))
        )
        guest = result.scalar_one_or_none()
        if not guest:
            errors.append("Guest not found or does not belong to this event")

        # 3. Check table capacity
        capacity_info = await crud_seating.check_table_capacity(db, table_layout_id)
        if capacity_info.get("is_full"):
            errors.append(
                f"Table is at full capacity ({capacity_info['capacity']} seats)"
            )

        # 4. Check if guest is already assigned to this table
        is_duplicate = await crud_seating.check_duplicate_seat_assignment(
            db, table_layout_id, guest_id
        )
        if is_duplicate:
            errors.append("Guest is already assigned to a seat at this table")

        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "capacity_info": capacity_info if not errors else None
        }
