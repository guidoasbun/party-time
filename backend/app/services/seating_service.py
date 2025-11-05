"""
Seating Chart Service for auto-assignment and validation.

FR-21: The system shall provide an interactive seating chart interface
Phase 6.1.2: Seating Chart API Endpoints
Phase 6.2.1: Smart Seating Suggestions

This service provides:
- Auto-assignment algorithms (fill_tables, distribute, smart)
- Capacity validation and checks
- Guest ownership verification
- Seating statistics and analytics
- Smart seating with compatibility scoring
"""

import logging
from typing import List, Dict, Any, Optional, Tuple
from uuid import UUID
from sqlalchemy import select, and_, func
from sqlalchemy.ext.asyncio import AsyncSession
from collections import defaultdict

from app.models.seating_chart import SeatingChart, TableLayout, SeatAssignment
from app.models.guest import Guest
from app.models.event import Event
from app.schemas.seating import AutoAssignRequest, SmartAssignPreferences, SuggestionScore
from app.crud import crud_seating
from app.utils.guest_matching import (
    score_guest_pair_compatibility,
    find_plus_one_pairs,
    parse_dietary_restrictions,
    extract_email_domain
)

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
        suggestions = []  # For smart strategy scoring

        if strategy == "fill_tables":
            assignments = await self._fill_tables_strategy(unassigned_guests, tables, db)
        elif strategy == "distribute":
            assignments = await self._distribute_strategy(unassigned_guests, tables, db)
        elif strategy == "smart":
            # Smart strategy returns (assignments, suggestions)
            preferences = request.preferences if hasattr(request, 'preferences') else None
            assignments, suggestions = await self._smart_strategy(unassigned_guests, tables, preferences, db)
        else:
            raise ValueError(f"Unknown strategy: {strategy}")

        # 6. Return assignment suggestions
        response = {
            "seating_chart_id": str(seating_chart_id),
            "strategy": strategy,
            "total_guests": len(request.guest_ids),
            "already_assigned": len(already_assigned_ids),
            "newly_assigned": len(assignments),
            "total_capacity": total_capacity,
            "remaining_capacity": total_capacity - (len(already_assigned_ids) + len(assignments)),
            "assignments": assignments
        }

        # Add suggestions for smart strategy
        if strategy == "smart" and suggestions:
            response["suggestions"] = [s.model_dump() for s in suggestions]
            response["statistics"] = self._calculate_smart_statistics(suggestions)

        return response

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

    """
    FR-21: The system shall provide an interactive seating chart interface
    Phase 6.2.1 Smart Seating Features
    """

    async def _smart_strategy(
        self,
        guests: List[Guest],
        tables: List[TableLayout],
        preferences: Optional[SmartAssignPreferences],
        db: AsyncSession
    ) -> Tuple[List[Dict[str, Any]], List[SuggestionScore]]:
        """
        Smart assignment using weighted compatibility scoring.

        Algorithm:
        1. Detect plus-one pairs (mandatory - must sit together)
        2. Build guest compatibility matrix based on dietary/org/family/meal
        3. Score each guest-table pairing based on existing assignments
        4. Use greedy algorithm: assign highest-scoring placements first
        5. Recalculate scores after each assignment
        6. Return assignments with detailed scoring breakdown

        Args:
            guests: List of guests to assign
            tables: List of available tables
            preferences: Smart assignment preferences (uses defaults if None)
            db: Database session

        Returns:
            Tuple of (assignments_list, suggestions_list)
        """
        logger.info(f"Starting smart assignment for {len(guests)} guests")

        # Use default preferences if not provided
        if preferences is None:
            preferences = SmartAssignPreferences()

        assignments = []
        suggestions = []

        # 1. Build guest data dict for compatibility scoring
        guest_data = {}
        for guest in guests:
            guest_data[str(guest.id)] = {
                "id": str(guest.id),
                "first_name": guest.first_name,
                "last_name": guest.last_name,
                "email": guest.email,
                "dietary_restrictions": guest.dietary_restrictions,
                "meal_preference": guest.meal_preference,
                "plus_one_allowed": guest.plus_one_allowed,
                "plus_one_name": guest.plus_one_name
            }

        # 2. Detect plus-one pairs (mandatory constraint)
        plus_one_pairs = find_plus_one_pairs(list(guest_data.values()))
        logger.info(f"Found {len(plus_one_pairs)} plus-one pairs")

        # 3. Build weights dict from preferences
        weights = {
            "dietary": preferences.weight_dietary if preferences.prioritize_dietary else 0.0,
            "organization": preferences.weight_organization if preferences.group_by_organization else 0.0,
            "family": preferences.weight_family if preferences.group_families else 0.0,
            "meal": preferences.weight_meal if preferences.cluster_meal_preferences else 0.0
        }

        # 4. Initialize table tracking
        table_info = {}
        for table in tables:
            existing_assignments = [seat for seat in table.seat_assignments if seat.guest_id]
            existing_guest_ids = [str(seat.guest_id) for seat in existing_assignments]

            all_seats = set(range(1, table.capacity + 1))
            taken_seats = set(seat.seat_number for seat in table.seat_assignments)
            free_seat_numbers = sorted(list(all_seats - taken_seats))

            table_info[str(table.id)] = {
                "table": table,
                "existing_guests": existing_guest_ids,
                "free_seats": free_seat_numbers,
                "capacity": table.capacity,
                "assigned_count": len(existing_assignments)
            }

        # 5. Handle plus-one pairs first (mandatory)
        unassigned_guest_ids = set(guest_data.keys())

        if preferences.keep_plus_ones_together:
            for guest_id_1, guest_id_2 in plus_one_pairs:
                if guest_id_1 not in unassigned_guest_ids or guest_id_2 not in unassigned_guest_ids:
                    continue  # Already assigned

                # Find table with at least 2 free seats
                best_table = None
                best_score = -1.0

                for table_id, info in table_info.items():
                    if len(info["free_seats"]) < 2:
                        continue

                    # Score compatibility with existing guests at table
                    avg_score = self._score_guest_table_compatibility(
                        guest_id_1, guest_data, info["existing_guests"], guest_data, weights
                    )

                    if avg_score > best_score:
                        best_score = avg_score
                        best_table = table_id

                if best_table:
                    # Assign both guests to this table
                    info = table_info[best_table]
                    table = info["table"]

                    for guest_id in [guest_id_1, guest_id_2]:
                        seat_number = info["free_seats"].pop(0)
                        guest = guest_data[guest_id]

                        assignment = {
                            "guest_id": guest_id,
                            "guest_name": f"{guest['first_name']} {guest['last_name']}",
                            "table_id": best_table,
                            "table_number": table.table_number,
                            "seat_number": seat_number
                        }

                        assignments.append(assignment)
                        info["existing_guests"].append(guest_id)
                        unassigned_guest_ids.remove(guest_id)

                        # Create suggestion score
                        suggestions.append(SuggestionScore(
                            guest_id=guest_id,
                            guest_name=assignment["guest_name"],
                            table_id=best_table,
                            table_number=table.table_number,
                            seat_number=seat_number,
                            total_score=1.0,  # Plus-ones always get max score
                            breakdown={"plus_one": 1.0},
                            reasoning=[f"Plus-one pair with {guest_data[guest_id_2 if guest_id == guest_id_1 else guest_id_1]['first_name']}"],
                            confidence="high"
                        ))

        # 6. Assign remaining guests using greedy algorithm
        while unassigned_guest_ids:
            best_assignment = None
            best_score = -1.0
            best_suggestion = None

            # Score all possible guest-table combinations
            for guest_id in unassigned_guest_ids:
                for table_id, info in table_info.items():
                    if not info["free_seats"]:
                        continue  # Table full

                    # Score compatibility
                    score, breakdown, reasoning = self._score_guest_table_assignment(
                        guest_id, guest_data, info["existing_guests"], guest_data, weights
                    )

                    if score > best_score:
                        best_score = score
                        seat_number = info["free_seats"][0]
                        guest = guest_data[guest_id]
                        table = info["table"]

                        best_assignment = {
                            "guest_id": guest_id,
                            "guest_name": f"{guest['first_name']} {guest['last_name']}",
                            "table_id": table_id,
                            "table_number": table.table_number,
                            "seat_number": seat_number
                        }

                        # Determine confidence level
                        if score >= 0.7:
                            confidence = "high"
                        elif score >= 0.4:
                            confidence = "medium"
                        else:
                            confidence = "low"

                        best_suggestion = SuggestionScore(
                            guest_id=guest_id,
                            guest_name=best_assignment["guest_name"],
                            table_id=table_id,
                            table_number=table.table_number,
                            seat_number=seat_number,
                            total_score=score,
                            breakdown=breakdown,
                            reasoning=reasoning,
                            confidence=confidence
                        )

            # Assign best match
            if best_assignment:
                assignments.append(best_assignment)
                suggestions.append(best_suggestion)

                table_info[best_assignment["table_id"]]["existing_guests"].append(best_assignment["guest_id"])
                table_info[best_assignment["table_id"]]["free_seats"].pop(0)
                unassigned_guest_ids.remove(best_assignment["guest_id"])
            else:
                # No valid assignments possible (shouldn't happen if capacity was checked)
                logger.warning(f"Could not assign {len(unassigned_guest_ids)} remaining guests")
                break

        logger.info(f"Smart assignment completed: {len(assignments)} assignments, {len(suggestions)} suggestions")
        return assignments, suggestions

    def _score_guest_table_compatibility(
        self,
        guest_id: str,
        guest_data: Dict[str, Dict],
        table_guest_ids: List[str],
        all_guest_data: Dict[str, Dict],
        weights: Dict[str, float]
    ) -> float:
        """
        Calculate average compatibility score between a guest and existing guests at a table.

        Args:
            guest_id: Guest ID to score
            guest_data: Dict of guest data
            table_guest_ids: List of guest IDs already at table
            all_guest_data: Complete guest data dict
            weights: Weight configuration

        Returns:
            Average compatibility score (0.0-1.0)
        """
        if not table_guest_ids:
            # Empty table - neutral score
            return 0.5

        guest = guest_data[guest_id]
        scores = []

        for table_guest_id in table_guest_ids:
            table_guest = all_guest_data[table_guest_id]
            score, _, _ = score_guest_pair_compatibility(guest, table_guest, weights)
            scores.append(score)

        return sum(scores) / len(scores) if scores else 0.5

    def _score_guest_table_assignment(
        self,
        guest_id: str,
        guest_data: Dict[str, Dict],
        table_guest_ids: List[str],
        all_guest_data: Dict[str, Dict],
        weights: Dict[str, float]
    ) -> Tuple[float, Dict[str, float], List[str]]:
        """
        Calculate detailed compatibility score for assigning a guest to a table.

        Args:
            guest_id: Guest ID to score
            guest_data: Dict of guest data
            table_guest_ids: List of guest IDs already at table
            all_guest_data: Complete guest data dict
            weights: Weight configuration

        Returns:
            Tuple of (total_score, breakdown_dict, reasoning_list)
        """
        if not table_guest_ids:
            # Empty table - return base score with generic reasoning
            return 0.5, {"base": 0.5}, ["First guest at table"]

        guest = guest_data[guest_id]
        all_breakdowns = []
        all_reasoning = []

        # Score against each existing guest at table
        for table_guest_id in table_guest_ids:
            table_guest = all_guest_data[table_guest_id]
            score, breakdown, reasoning = score_guest_pair_compatibility(guest, table_guest, weights)
            all_breakdowns.append(breakdown)
            all_reasoning.extend(reasoning)

        # Average the breakdowns
        avg_breakdown = {}
        for key in ["dietary", "organization", "family", "meal"]:
            values = [b.get(key, 0.0) for b in all_breakdowns]
            if values:
                avg_breakdown[key] = sum(values) / len(values)

        # Calculate total average score
        total_score = sum(avg_breakdown.values()) / len(avg_breakdown) if avg_breakdown else 0.5

        # Deduplicate reasoning
        unique_reasoning = list(set(all_reasoning))

        return total_score, avg_breakdown, unique_reasoning

    def _calculate_smart_statistics(self, suggestions: List[SuggestionScore]) -> Dict[str, Any]:
        """
        Calculate enhanced statistics for smart seating assignments.

        Args:
            suggestions: List of suggestion scores

        Returns:
            Dict with smart seating statistics
        """
        if not suggestions:
            return {}

        # Calculate average confidence score
        total_score = sum(s.total_score for s in suggestions)
        avg_score = total_score / len(suggestions)

        # Count confidence levels
        confidence_counts = {"high": 0, "medium": 0, "low": 0}
        for s in suggestions:
            confidence_counts[s.confidence] += 1

        # Count dietary groups formed (guests with shared dietary restrictions at same table)
        dietary_groups = 0
        tables_with_dietary = defaultdict(set)
        for s in suggestions:
            if "dietary" in " ".join(s.reasoning).lower():
                tables_with_dietary[s.table_id].add(s.guest_id)

        dietary_groups = sum(1 for guests in tables_with_dietary.values() if len(guests) >= 2)

        # Count families seated together
        families_together = 0
        tables_with_families = defaultdict(set)
        for s in suggestions:
            if "family" in " ".join(s.reasoning).lower():
                tables_with_families[s.table_id].add(s.guest_id)

        families_together = sum(1 for guests in tables_with_families.values() if len(guests) >= 2)

        # Count plus-ones paired
        plus_ones_paired = sum(1 for s in suggestions if "plus-one" in " ".join(s.reasoning).lower())

        # Count organization clusters
        org_clusters = 0
        tables_with_orgs = defaultdict(set)
        for s in suggestions:
            if "organization" in " ".join(s.reasoning).lower():
                tables_with_orgs[s.table_id].add(s.guest_id)

        org_clusters = sum(1 for guests in tables_with_orgs.values() if len(guests) >= 2)

        return {
            "avg_confidence_score": round(avg_score, 2),
            "confidence_distribution": confidence_counts,
            "dietary_groups_formed": dietary_groups,
            "families_seated_together": families_together,
            "plus_ones_paired": plus_ones_paired // 2 if plus_ones_paired > 0 else 0,  # Divide by 2 (pair counting)
            "organization_clusters": org_clusters,
            "total_suggestions": len(suggestions)
        }
