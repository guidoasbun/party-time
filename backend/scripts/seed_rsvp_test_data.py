"""FR-6: The system shall display an RSVP submission page. 5.1.1
Seed test data for RSVP API testing with Postman."""

"""Seed test data for RSVP API testing with Postman.

This script creates a complete test dataset including:
- 1 test event
- 1 event planner user
- 6 test guests with different scenarios:
  1. Valid token (pending RSVP)
  2. Expired token
  3. Token for 'not attending' test
  4. Token for 'maybe' test
  5. Token for plus-one allowed test
  6. Token for no plus-one allowed test

Run this script before running the Postman collection tests.

Usage:
    python backend/scripts/seed_rsvp_test_data.py
"""
import asyncio
import sys
from pathlib import Path
from datetime import datetime, timedelta, timezone

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import text

from app.models.user import User, UserRole
from app.models.event import Event, EventType, EventStatus
from app.models.guest import Guest, RsvpStatus
from app.utils.token_generator import generate_rsvp_token
from app.db.base import Base


# Database configuration
DATABASE_URL = "postgresql+asyncpg://party_admin:party_secure_2024@localhost:5432/party_time"


async def clear_test_data(session: AsyncSession):
    """Clear existing RSVP test data."""
    print("🧹 Clearing existing test data...")

    # Delete test guests
    await session.execute(
        text("DELETE FROM guests WHERE email LIKE '%rsvp-test%'")
    )

    # Delete test events
    await session.execute(
        text("DELETE FROM events WHERE name LIKE '%RSVP Test Event%'")
    )

    # Delete test users
    await session.execute(
        text("DELETE FROM users WHERE email = 'rsvp-tester@party-time.com'")
    )

    await session.commit()
    print("Test data cleared")


async def create_test_data(session: AsyncSession):
    """Create comprehensive test data for RSVP API testing."""
    print("\nCreating test data...")

    # 1. Create test planner user
    print("  → Creating test planner user...")
    planner = User(
        email="rsvp-tester@party-time.com",
        first_name="RSVP",
        last_name="Tester",
        role=UserRole.PLANNER,
        is_active=True,
        is_verified=True
    )
    session.add(planner)
    await session.flush()
    await session.refresh(planner)
    print(f"  ✓ Planner created: {planner.email}")

    # 2. Create test event
    print("  → Creating test event...")
    event = Event(
        name="RSVP Test Event - Birthday Party",
        description="Test event for RSVP API testing with Postman",
        type=EventType.BIRTHDAY,
        status=EventStatus.CONFIRMED,
        start_date=datetime.now(timezone.utc) + timedelta(days=30),
        end_date=datetime.now(timezone.utc) + timedelta(days=30, hours=4),
        location="123 Test Street, Test City, TC 12345",
        venue_name="Test Venue Hall",
        venue_address="123 Test Street, Test City, TC 12345",
        planner_id=planner.id,
        is_public=False,
        max_guests=50,
        budget_total=5000.00
    )
    session.add(event)
    await session.flush()
    await session.refresh(event)
    print(f"  ✓ Event created: {event.name}")

    # 3. Create test guests with different scenarios
    print("  → Creating test guests...")

    # Generate unique tokens
    tokens = {
        'valid': generate_rsvp_token(),
        'expired': generate_rsvp_token(),
        'not_attending': generate_rsvp_token(),
        'maybe': generate_rsvp_token(),
        'plus_one': generate_rsvp_token(),
        'no_plus_one': generate_rsvp_token()
    }

    guests_data = [
        {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe-rsvp-test@example.com",
            "rsvp_token": tokens['valid'],
            "rsvp_status": RsvpStatus.PENDING,
            "plus_one_allowed": True,
            "token_expires_at": datetime.now(timezone.utc) + timedelta(days=90),
            "description": "Valid token for general testing"
        },
        {
            "first_name": "Expired",
            "last_name": "Token",
            "email": "expired-rsvp-test@example.com",
            "rsvp_token": tokens['expired'],
            "rsvp_status": RsvpStatus.PENDING,
            "plus_one_allowed": False,
            "token_expires_at": datetime.now(timezone.utc) - timedelta(days=1),
            "description": "Expired token for testing 410 error"
        },
        {
            "first_name": "Will",
            "last_name": "NotAttend",
            "email": "will.notattend-rsvp-test@example.com",
            "rsvp_token": tokens['not_attending'],
            "rsvp_status": RsvpStatus.PENDING,
            "plus_one_allowed": False,
            "token_expires_at": datetime.now(timezone.utc) + timedelta(days=90),
            "description": "For testing 'not attending' response"
        },
        {
            "first_name": "Maybe",
            "last_name": "Coming",
            "email": "maybe.coming-rsvp-test@example.com",
            "rsvp_token": tokens['maybe'],
            "rsvp_status": RsvpStatus.PENDING,
            "plus_one_allowed": True,
            "token_expires_at": datetime.now(timezone.utc) + timedelta(days=90),
            "description": "For testing 'maybe' response"
        },
        {
            "first_name": "Plus",
            "last_name": "One",
            "email": "plus.one-rsvp-test@example.com",
            "rsvp_token": tokens['plus_one'],
            "rsvp_status": RsvpStatus.ATTENDING,
            "plus_one_allowed": True,
            "token_expires_at": datetime.now(timezone.utc) + timedelta(days=90),
            "description": "For testing plus-one updates (attending status)"
        },
        {
            "first_name": "Solo",
            "last_name": "Guest",
            "email": "solo.guest-rsvp-test@example.com",
            "rsvp_token": tokens['no_plus_one'],
            "rsvp_status": RsvpStatus.PENDING,
            "plus_one_allowed": False,
            "token_expires_at": datetime.now(timezone.utc) + timedelta(days=90),
            "description": "For testing plus-one not allowed error"
        }
    ]

    for guest_data in guests_data:
        guest = Guest(
            event_id=event.id,
            first_name=guest_data["first_name"],
            last_name=guest_data["last_name"],
            email=guest_data["email"],
            rsvp_token=guest_data["rsvp_token"],
            rsvp_status=guest_data["rsvp_status"],
            plus_one_allowed=guest_data["plus_one_allowed"],
            token_expires_at=guest_data["token_expires_at"]
        )
        session.add(guest)
        print(f"    ✓ {guest_data['first_name']} {guest_data['last_name']} - {guest_data['description']}")

    await session.commit()
    print("  ✓ All guests created")

    # Print summary with tokens for Postman environment
    print("\n" + "=" * 70)
    print("🎉 Test Data Created Successfully!")
    print("=" * 70)
    print(f"\n📋 Event Details:")
    print(f"   Event ID: {event.id}")
    print(f"   Event Name: {event.name}")
    print(f"   Planner: {planner.first_name} {planner.last_name} ({planner.email})")

    print(f"\n🎫 RSVP Tokens for Postman Environment:")
    print(f"   Set these in your Postman environment variables:\n")
    print(f"   valid_token            = {tokens['valid']}")
    print(f"   expired_token          = {tokens['expired']}")
    print(f"   not_attending_token    = {tokens['not_attending']}")
    print(f"   maybe_token            = {tokens['maybe']}")
    print(f"   plus_one_token         = {tokens['plus_one']}")
    print(f"   no_plus_one_token      = {tokens['no_plus_one']}")

    print(f"\n📊 Guest Summary:")
    print(f"   Total Guests: {len(guests_data)}")
    print(f"   - Pending RSVP: 4")
    print(f"   - Attending: 1")
    print(f"   - Expired Token: 1")
    print(f"   - Plus-One Allowed: 3")
    print(f"   - No Plus-One: 3")

    print(f"\n✅ Ready for Postman Testing!")
    print(f"   1. Update the Postman environment with tokens above")
    print(f"   2. Run the collection: RSVP API - Public Endpoints")
    print(f"   3. All tests should pass!")
    print("=" * 70 + "\n")

    return tokens


async def main():
    """Main execution function."""
    print("\n" + "=" * 70)
    print("🚀 RSVP API Test Data Seeder")
    print("=" * 70)

    # Create async engine
    engine = create_async_engine(
        DATABASE_URL,
        echo=False,
        future=True
    )

    # Create session
    async_session_maker = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False
    )

    try:
        async with async_session_maker() as session:
            # Clear old test data
            await clear_test_data(session)

            # Create new test data
            tokens = await create_test_data(session)

    except Exception as e:
        print(f"\n Error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
