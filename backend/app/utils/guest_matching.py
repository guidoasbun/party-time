"""
FR-21: The system shall provide an interactive seating chart interface
Phase 6.2.1 Smart Seating Features

Guest matching utilities for smart seating suggestions.

This module provides helper functions to analyze guest data and calculate
compatibility scores for intelligent seating assignments.
"""

import re
from typing import Dict, List, Optional, Set, Tuple
from difflib import SequenceMatcher


# Common dietary restriction keywords for parsing
DIETARY_KEYWORDS = {
    "vegetarian": ["vegetarian", "veggie", "no meat"],
    "vegan": ["vegan", "plant-based", "plant based"],
    "gluten-free": ["gluten free", "gluten-free", "celiac", "no gluten"],
    "dairy-free": ["dairy free", "dairy-free", "lactose", "no dairy"],
    "kosher": ["kosher"],
    "halal": ["halal"],
    "nut-allergy": ["nut allergy", "peanut allergy", "tree nut", "no nuts"],
    "shellfish-allergy": ["shellfish", "seafood allergy"],
    "pescatarian": ["pescatarian", "fish only"],
    "keto": ["keto", "ketogenic", "low carb"],
    "paleo": ["paleo", "paleolithic"],
}


def parse_dietary_restrictions(text: Optional[str]) -> Set[str]:
    """
    Extract dietary restriction keywords from free-text field.

    Args:
        text: Free-text dietary restrictions field from guest record

    Returns:
        Set of normalized dietary restriction categories found in text

    Examples:
        >>> parse_dietary_restrictions("I'm vegetarian and gluten-free")
        {'vegetarian', 'gluten-free'}

        >>> parse_dietary_restrictions("No shellfish please!")
        {'shellfish-allergy'}
    """
    if not text:
        return set()

    text_lower = text.lower()
    found_restrictions = set()

    for category, keywords in DIETARY_KEYWORDS.items():
        for keyword in keywords:
            if keyword in text_lower:
                found_restrictions.add(category)
                break  # Found this category, move to next

    return found_restrictions


def extract_email_domain(email: Optional[str]) -> Optional[str]:
    """
    Extract organization domain from email address.

    Args:
        email: Email address (e.g., "john@acme.com")

    Returns:
        Domain name (e.g., "acme.com") or None if invalid email

    Examples:
        >>> extract_email_domain("john.doe@acme.com")
        'acme.com'

        >>> extract_email_domain("invalid-email")
        None
    """
    if not email:
        return None

    # Simple email validation pattern
    email_pattern = r"^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$"
    match = re.match(email_pattern, email.strip())

    if match:
        return match.group(1).lower()

    return None


def calculate_name_similarity(name1: Optional[str], name2: Optional[str]) -> float:
    """
    Calculate similarity score between two names (for family detection).

    Uses SequenceMatcher for fuzzy string matching to handle variations
    like "Smith" vs "Smyth" or "O'Brien" vs "OBrien".

    Args:
        name1: First name to compare
        name2: Second name to compare

    Returns:
        Similarity score between 0.0 (completely different) and 1.0 (identical)

    Examples:
        >>> calculate_name_similarity("Smith", "Smith")
        1.0

        >>> calculate_name_similarity("Smith", "Smyth")
        0.8

        >>> calculate_name_similarity("Jones", "Williams")
        0.2
    """
    if not name1 or not name2:
        return 0.0

    # Normalize: lowercase and strip whitespace
    name1_norm = name1.lower().strip()
    name2_norm = name2.lower().strip()

    if not name1_norm or not name2_norm:
        return 0.0

    # Exact match
    if name1_norm == name2_norm:
        return 1.0

    # Fuzzy match using SequenceMatcher
    return SequenceMatcher(None, name1_norm, name2_norm).ratio()


def calculate_dietary_compatibility(
    restrictions1: Set[str],
    restrictions2: Set[str]
) -> float:
    """
    Calculate dietary compatibility score between two guests.

    Guests with identical dietary restrictions have high compatibility (1.0).
    Guests with overlapping restrictions have moderate compatibility.
    Guests with no restrictions have neutral compatibility (0.5).

    Args:
        restrictions1: Set of dietary restriction categories for guest 1
        restrictions2: Set of dietary restriction categories for guest 2

    Returns:
        Compatibility score between 0.0 and 1.0
    """
    # Both have no restrictions - neutral compatibility
    if not restrictions1 and not restrictions2:
        return 0.5

    # One has restrictions, other doesn't - low compatibility
    if not restrictions1 or not restrictions2:
        return 0.3

    # Calculate Jaccard similarity (intersection over union)
    intersection = restrictions1 & restrictions2
    union = restrictions1 | restrictions2

    if not union:
        return 0.5

    jaccard = len(intersection) / len(union)

    # Boost score if they share at least one restriction
    if intersection:
        return min(0.5 + jaccard * 0.5, 1.0)  # Scale to 0.5-1.0 range

    return 0.3  # Different restrictions - low compatibility


def score_guest_pair_compatibility(
    guest1: Dict,
    guest2: Dict,
    weights: Dict[str, float]
) -> Tuple[float, Dict[str, float], List[str]]:
    """
    Calculate overall compatibility score between two guests.

    Combines multiple matching criteria with configurable weights to produce
    an overall compatibility score and detailed breakdown.

    Args:
        guest1: First guest data dict with fields: dietary_restrictions,
                meal_preference, email, last_name
        guest2: Second guest data dict (same structure)
        weights: Weight configuration dict with keys: dietary, organization,
                 family, meal

    Returns:
        Tuple of (total_score, breakdown_dict, reasoning_list):
        - total_score: Weighted average compatibility (0.0-1.0)
        - breakdown_dict: Individual scores by criterion
        - reasoning_list: Human-readable explanations

    Example:
        >>> g1 = {"dietary_restrictions": "vegetarian", "email": "john@acme.com",
                  "last_name": "Smith", "meal_preference": "veggie"}
        >>> g2 = {"dietary_restrictions": "vegan", "email": "jane@acme.com",
                  "last_name": "Smith", "meal_preference": "veggie"}
        >>> weights = {"dietary": 0.8, "organization": 0.6, "family": 0.4, "meal": 0.5}
        >>> score, breakdown, reasoning = score_guest_pair_compatibility(g1, g2, weights)
        >>> score > 0.7  # High compatibility
        True
    """
    breakdown = {}
    reasoning = []

    # 1. Dietary restrictions matching
    dietary1 = parse_dietary_restrictions(guest1.get("dietary_restrictions"))
    dietary2 = parse_dietary_restrictions(guest2.get("dietary_restrictions"))
    dietary_score = calculate_dietary_compatibility(dietary1, dietary2)
    breakdown["dietary"] = dietary_score * weights.get("dietary", 0.0)

    if dietary1 & dietary2:  # Shared restrictions
        shared = dietary1 & dietary2
        reasoning.append(f"Share dietary restrictions: {', '.join(shared)}")

    # 2. Organization matching (email domain)
    domain1 = extract_email_domain(guest1.get("email"))
    domain2 = extract_email_domain(guest2.get("email"))
    org_score = 1.0 if (domain1 and domain2 and domain1 == domain2) else 0.0
    breakdown["organization"] = org_score * weights.get("organization", 0.0)

    if org_score > 0:
        reasoning.append(f"Same organization ({domain1})")

    # 3. Family name matching
    name_similarity = calculate_name_similarity(
        guest1.get("last_name"),
        guest2.get("last_name")
    )
    # Consider family match if similarity > 0.8 (handles typos/variations)
    family_score = 1.0 if name_similarity > 0.8 else 0.0
    breakdown["family"] = family_score * weights.get("family", 0.0)

    if family_score > 0:
        reasoning.append(f"Same family (last name: {guest1.get('last_name')})")

    # 4. Meal preference matching
    meal1 = (guest1.get("meal_preference") or "").lower().strip()
    meal2 = (guest2.get("meal_preference") or "").lower().strip()
    meal_score = 1.0 if (meal1 and meal2 and meal1 == meal2) else 0.0
    breakdown["meal"] = meal_score * weights.get("meal", 0.0)

    if meal_score > 0:
        reasoning.append(f"Same meal preference ({meal1})")

    # Calculate weighted total
    total_score = sum(breakdown.values())
    total_weight = sum(weights.values())

    if total_weight > 0:
        total_score = total_score / total_weight
    else:
        total_score = 0.0

    # Add generic reasoning if no specific matches found
    if not reasoning:
        reasoning.append("No strong compatibility indicators found")

    return total_score, breakdown, reasoning


def find_plus_one_pairs(guests: List[Dict]) -> List[Tuple[str, str]]:
    """
    Detect plus-one relationships from guest data.

    Identifies guests who should be seated together based on:
    1. plus_one_allowed=True and plus_one_name matching another guest's name
    2. Matching last names with plus_one_allowed flag

    Args:
        guests: List of guest data dictionaries

    Returns:
        List of tuples (guest_id1, guest_id2) representing pairs that must sit together

    Example:
        >>> guests = [
        ...     {"id": "1", "first_name": "John", "last_name": "Doe",
        ...      "plus_one_allowed": True, "plus_one_name": "Jane Doe"},
        ...     {"id": "2", "first_name": "Jane", "last_name": "Doe",
        ...      "plus_one_allowed": False}
        ... ]
        >>> find_plus_one_pairs(guests)
        [('1', '2')]
    """
    pairs = []

    for guest in guests:
        if not guest.get("plus_one_allowed"):
            continue

        plus_one_name = (guest.get("plus_one_name") or "").strip()
        if not plus_one_name:
            continue

        # Try to find matching guest by name
        plus_one_name_lower = plus_one_name.lower()

        for other_guest in guests:
            if other_guest["id"] == guest["id"]:
                continue

            # Check if other guest's full name matches plus_one_name
            other_full_name = f"{other_guest.get('first_name') or ''} {other_guest.get('last_name') or ''}".strip()

            if other_full_name.lower() == plus_one_name_lower:
                # Found the plus-one guest
                pair = tuple(sorted([guest["id"], other_guest["id"]]))
                if pair not in pairs:
                    pairs.append(pair)
                break

    return pairs
