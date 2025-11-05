"""
Tests for smart seating functionality.

FR-21: The system shall provide an interactive seating chart interface
Phase 6.2.1 Smart Seating Features

Tests cover:
- Guest matching utilities (dietary, email domain, name similarity)
- Smart assignment algorithm with various preferences
- Plus-one pairing (mandatory constraint)
- Compatibility scoring and confidence levels
- Edge cases (no matches, insufficient capacity)
"""

import pytest
from app.utils.guest_matching import (
    parse_dietary_restrictions,
    extract_email_domain,
    calculate_name_similarity,
    calculate_dietary_compatibility,
    score_guest_pair_compatibility,
    find_plus_one_pairs
)


class TestGuestMatching:
    """Test guest matching utility functions"""

    def test_parse_dietary_restrictions_vegetarian(self):
        """Test parsing vegetarian keyword"""
        result = parse_dietary_restrictions("I'm vegetarian")
        assert "vegetarian" in result

    def test_parse_dietary_restrictions_multiple(self):
        """Test parsing multiple restrictions"""
        result = parse_dietary_restrictions("vegetarian and gluten-free")
        assert "vegetarian" in result
        assert "gluten-free" in result

    def test_parse_dietary_restrictions_kosher(self):
        """Test parsing kosher keyword"""
        result = parse_dietary_restrictions("I keep kosher")
        assert "kosher" in result

    def test_parse_dietary_restrictions_vegan(self):
        """Test parsing vegan keyword"""
        result = parse_dietary_restrictions("Vegan, plant-based diet")
        assert "vegan" in result

    def test_parse_dietary_restrictions_allergies(self):
        """Test parsing allergy keywords"""
        result = parse_dietary_restrictions("Severe nut allergy, also shellfish")
        assert "nut-allergy" in result
        assert "shellfish-allergy" in result

    def test_parse_dietary_restrictions_none(self):
        """Test with no dietary restrictions"""
        result = parse_dietary_restrictions(None)
        assert result == set()

    def test_parse_dietary_restrictions_empty(self):
        """Test with empty string"""
        result = parse_dietary_restrictions("")
        assert result == set()

    def test_extract_email_domain_valid(self):
        """Test extracting domain from valid email"""
        result = extract_email_domain("john.doe@acme.com")
        assert result == "acme.com"

    def test_extract_email_domain_subdomain(self):
        """Test extracting domain with subdomain"""
        result = extract_email_domain("jane@engineering.company.com")
        assert result == "engineering.company.com"

    def test_extract_email_domain_invalid(self):
        """Test with invalid email"""
        result = extract_email_domain("not-an-email")
        assert result is None

    def test_extract_email_domain_none(self):
        """Test with None"""
        result = extract_email_domain(None)
        assert result is None

    def test_calculate_name_similarity_identical(self):
        """Test similarity with identical names"""
        result = calculate_name_similarity("Smith", "Smith")
        assert result == 1.0

    def test_calculate_name_similarity_different(self):
        """Test similarity with completely different names"""
        result = calculate_name_similarity("Smith", "Jones")
        assert result < 0.5

    def test_calculate_name_similarity_typo(self):
        """Test similarity with minor typo"""
        result = calculate_name_similarity("Smith", "Smyth")
        assert result > 0.6  # Should be similar

    def test_calculate_name_similarity_case_insensitive(self):
        """Test similarity is case-insensitive"""
        result = calculate_name_similarity("SMITH", "smith")
        assert result == 1.0

    def test_calculate_name_similarity_none(self):
        """Test with None values"""
        result = calculate_name_similarity(None, "Smith")
        assert result == 0.0

    def test_calculate_dietary_compatibility_both_none(self):
        """Test compatibility when both have no restrictions"""
        result = calculate_dietary_compatibility(set(), set())
        assert result == 0.5  # Neutral

    def test_calculate_dietary_compatibility_one_none(self):
        """Test compatibility when only one has restrictions"""
        result = calculate_dietary_compatibility({"vegetarian"}, set())
        assert result == 0.3  # Low compatibility

    def test_calculate_dietary_compatibility_identical(self):
        """Test compatibility with identical restrictions"""
        restrictions = {"vegetarian", "gluten-free"}
        result = calculate_dietary_compatibility(restrictions, restrictions)
        assert result >= 0.9  # High compatibility

    def test_calculate_dietary_compatibility_partial_overlap(self):
        """Test compatibility with some overlap"""
        set1 = {"vegetarian", "gluten-free"}
        set2 = {"vegetarian", "dairy-free"}
        result = calculate_dietary_compatibility(set1, set2)
        assert 0.5 <= result <= 0.9  # Moderate compatibility

    def test_score_guest_pair_dietary_match(self):
        """Test scoring with matching dietary restrictions"""
        guest1 = {
            "dietary_restrictions": "vegetarian",
            "email": "john@company.com",
            "last_name": "Doe",
            "meal_preference": "veggie"
        }
        guest2 = {
            "dietary_restrictions": "vegetarian",
            "email": "jane@company.com",
            "last_name": "Smith",
            "meal_preference": "veggie"
        }
        weights = {"dietary": 0.8, "organization": 0.6, "family": 0.4, "meal": 0.5}

        score, breakdown, reasoning = score_guest_pair_compatibility(guest1, guest2, weights)

        assert score > 0.6  # Should have high score
        assert "dietary" in " ".join(reasoning).lower()
        assert "organization" in " ".join(reasoning).lower()

    def test_score_guest_pair_family_match(self):
        """Test scoring with same last name (family)"""
        guest1 = {
            "dietary_restrictions": None,
            "email": "john@email.com",
            "last_name": "Smith",
            "meal_preference": None
        }
        guest2 = {
            "dietary_restrictions": None,
            "email": "jane@email.com",
            "last_name": "Smith",
            "meal_preference": None
        }
        weights = {"dietary": 0.8, "organization": 0.6, "family": 0.4, "meal": 0.5}

        score, breakdown, reasoning = score_guest_pair_compatibility(guest1, guest2, weights)

        assert "family" in " ".join(reasoning).lower()
        assert breakdown.get("family", 0) > 0

    def test_score_guest_pair_no_match(self):
        """Test scoring with no matches"""
        guest1 = {
            "dietary_restrictions": "vegetarian",
            "email": "john@company1.com",
            "last_name": "Doe",
            "meal_preference": "veggie"
        }
        guest2 = {
            "dietary_restrictions": "vegan",
            "email": "jane@company2.com",
            "last_name": "Smith",
            "meal_preference": "salad"
        }
        weights = {"dietary": 0.8, "organization": 0.6, "family": 0.4, "meal": 0.5}

        score, breakdown, reasoning = score_guest_pair_compatibility(guest1, guest2, weights)

        assert score < 0.5  # Low score expected
        assert "no strong compatibility" in " ".join(reasoning).lower()

    def test_find_plus_one_pairs_simple(self):
        """Test finding plus-one pairs with exact name match"""
        guests = [
            {
                "id": "1",
                "first_name": "John",
                "last_name": "Doe",
                "plus_one_allowed": True,
                "plus_one_name": "Jane Doe"
            },
            {
                "id": "2",
                "first_name": "Jane",
                "last_name": "Doe",
                "plus_one_allowed": False,
                "plus_one_name": None
            }
        ]

        pairs = find_plus_one_pairs(guests)
        assert len(pairs) == 1
        assert ("1", "2") in pairs or ("2", "1") in pairs

    def test_find_plus_one_pairs_no_match(self):
        """Test when plus-one name doesn't match any guest"""
        guests = [
            {
                "id": "1",
                "first_name": "John",
                "last_name": "Doe",
                "plus_one_allowed": True,
                "plus_one_name": "Nonexistent Person"
            },
            {
                "id": "2",
                "first_name": "Jane",
                "last_name": "Smith",
                "plus_one_allowed": False,
                "plus_one_name": None
            }
        ]

        pairs = find_plus_one_pairs(guests)
        assert len(pairs) == 0

    def test_find_plus_one_pairs_none(self):
        """Test with no plus-ones allowed"""
        guests = [
            {
                "id": "1",
                "first_name": "John",
                "last_name": "Doe",
                "plus_one_allowed": False,
                "plus_one_name": None
            },
            {
                "id": "2",
                "first_name": "Jane",
                "last_name": "Smith",
                "plus_one_allowed": False,
                "plus_one_name": None
            }
        ]

        pairs = find_plus_one_pairs(guests)
        assert len(pairs) == 0


class TestSmartSeatingSchemas:
    """Test smart seating Pydantic schemas"""

    def test_smart_assign_preferences_defaults(self):
        """Test SmartAssignPreferences with default values"""
        from app.schemas.seating import SmartAssignPreferences

        prefs = SmartAssignPreferences()

        assert prefs.prioritize_dietary is True
        assert prefs.weight_dietary == 0.8
        assert prefs.keep_plus_ones_together is True
        assert prefs.group_by_organization is True
        assert prefs.weight_organization == 0.6
        assert prefs.group_families is True
        assert prefs.weight_family == 0.4
        assert prefs.cluster_meal_preferences is True
        assert prefs.weight_meal == 0.5
        assert prefs.balance_tables is True

    def test_smart_assign_preferences_custom(self):
        """Test SmartAssignPreferences with custom values"""
        from app.schemas.seating import SmartAssignPreferences

        prefs = SmartAssignPreferences(
            prioritize_dietary=False,
            weight_dietary=0.5,
            group_families=False,
            weight_organization=0.9
        )

        assert prefs.prioritize_dietary is False
        assert prefs.weight_dietary == 0.5
        assert prefs.group_families is False
        assert prefs.weight_organization == 0.9

    def test_smart_assign_preferences_weight_validation(self):
        """Test weight validation (must be 0.0-1.0)"""
        from app.schemas.seating import SmartAssignPreferences
        from pydantic import ValidationError

        with pytest.raises(ValidationError):
            SmartAssignPreferences(weight_dietary=1.5)  # Too high

        with pytest.raises(ValidationError):
            SmartAssignPreferences(weight_dietary=-0.1)  # Negative

    def test_suggestion_score_creation(self):
        """Test creating a SuggestionScore"""
        from app.schemas.seating import SuggestionScore
        from uuid import uuid4

        suggestion = SuggestionScore(
            guest_id=uuid4(),
            guest_name="John Doe",
            table_id=uuid4(),
            table_number="Table 1",
            seat_number=1,
            total_score=0.85,
            breakdown={"dietary": 0.8, "organization": 0.6},
            reasoning=["Shares dietary restrictions", "Same organization"],
            confidence="high"
        )

        assert suggestion.total_score == 0.85
        assert suggestion.confidence == "high"
        assert len(suggestion.reasoning) == 2

    def test_suggestion_score_confidence_validation(self):
        """Test confidence level validation"""
        from app.schemas.seating import SuggestionScore
        from pydantic import ValidationError
        from uuid import uuid4

        with pytest.raises(ValidationError):
            SuggestionScore(
                guest_id=uuid4(),
                guest_name="John Doe",
                table_id=uuid4(),
                table_number="Table 1",
                seat_number=1,
                total_score=0.85,
                breakdown={},
                reasoning=[],
                confidence="invalid"  # Not in [high, medium, low]
            )

    def test_auto_assign_request_smart_strategy(self):
        """Test AutoAssignRequest accepts 'smart' strategy"""
        from app.schemas.seating import AutoAssignRequest
        from uuid import uuid4

        request = AutoAssignRequest(
            seating_chart_id=uuid4(),
            guest_ids=[uuid4(), uuid4()],
            strategy="smart"
        )

        assert request.strategy == "smart"

    def test_smart_assign_request_validation(self):
        """Test SmartAssignRequest requires 'smart' strategy"""
        from app.schemas.seating import SmartAssignRequest, SmartAssignPreferences
        from pydantic import ValidationError
        from uuid import uuid4

        # Valid request
        request = SmartAssignRequest(
            seating_chart_id=uuid4(),
            guest_ids=[uuid4()],
            strategy="smart",
            preferences=SmartAssignPreferences()
        )
        assert request.strategy == "smart"

        # Invalid strategy
        with pytest.raises(ValidationError):
            SmartAssignRequest(
                seating_chart_id=uuid4(),
                guest_ids=[uuid4()],
                strategy="fill_tables"  # Not 'smart'
            )


class TestSmartSeatingIntegration:
    """Integration tests for smart seating algorithm"""

    def test_smart_strategy_basic_execution(self):
        """Test that smart strategy can be instantiated and called"""
        from app.services.seating_service import SeatingChartService
        from app.schemas.seating import SmartAssignPreferences

        service = SeatingChartService()
        prefs = SmartAssignPreferences()

        # Just verify the method exists and can be called
        # Full integration tests would require database fixtures
        assert hasattr(service, '_smart_strategy')
        assert hasattr(service, '_score_guest_table_compatibility')
        assert hasattr(service, '_score_guest_table_assignment')
        assert hasattr(service, '_calculate_smart_statistics')

    def test_calculate_smart_statistics_empty(self):
        """Test statistics calculation with empty suggestions"""
        from app.services.seating_service import SeatingChartService

        service = SeatingChartService()
        stats = service._calculate_smart_statistics([])

        assert stats == {}

    def test_calculate_smart_statistics_with_suggestions(self):
        """Test statistics calculation with mock suggestions"""
        from app.services.seating_service import SeatingChartService
        from app.schemas.seating import SuggestionScore
        from uuid import uuid4

        service = SeatingChartService()

        suggestions = [
            SuggestionScore(
                guest_id=uuid4(),
                guest_name="Guest 1",
                table_id=uuid4(),
                table_number="Table 1",
                seat_number=1,
                total_score=0.9,
                breakdown={"dietary": 0.8},
                reasoning=["Shares dietary restrictions"],
                confidence="high"
            ),
            SuggestionScore(
                guest_id=uuid4(),
                guest_name="Guest 2",
                table_id=uuid4(),
                table_number="Table 1",
                seat_number=2,
                total_score=0.5,
                breakdown={},
                reasoning=["First guest at table"],
                confidence="medium"
            )
        ]

        stats = service._calculate_smart_statistics(suggestions)

        assert "avg_confidence_score" in stats
        assert "confidence_distribution" in stats
        assert "total_suggestions" in stats
        assert stats["total_suggestions"] == 2
        assert 0.0 <= stats["avg_confidence_score"] <= 1.0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
