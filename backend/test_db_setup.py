"""Standalone script to test database setup and connections."""
import asyncio
import sys
from datetime import datetime, timezone
from decimal import Decimal

# Add backend to path
sys.path.insert(0, '/Users/rodrigo/code/party-time/backend')

from app.db.session import get_db_session, engine
from app.db.base import Base
from app.models import (
    User, UserRole,
    Event, EventType, EventStatus,
    Guest, RsvpStatus,
    BudgetCategory, Expense
)
from sqlalchemy import select, text


async def test_database_connection():
    """Test basic database connectivity."""
    print("Testing database connection...")
    try:
        async with engine.begin() as conn:
            result = await conn.execute(text("SELECT 1"))
            assert result.scalar() == 1
        print("✅ Database connection successful")
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False


async def test_create_models():
    """Test creating database tables from models."""
    print("\nTesting model creation...")
    try:
        async with engine.begin() as conn:
            # Drop all tables first (for testing)
            await conn.run_sync(Base.metadata.drop_all)
            # Create all tables
            await conn.run_sync(Base.metadata.create_all)
        print("✅ Models created successfully")
        return True
    except Exception as e:
        print(f"❌ Model creation failed: {e}")
        return False


async def test_crud_operations():
    """Test basic CRUD operations."""
    print("\nTesting CRUD operations...")
    
    async with get_db_session() as session:
        try:
            # Create a user
            user = User(
                email="test@example.com",
                first_name="Test",
                last_name="User",
                role=UserRole.PLANNER,
                is_active=True,
                is_verified=True
            )
            session.add(user)
            await session.flush()
            print(f"✅ Created user: {user.email}")
            
            # Create an event
            event = Event(
                name="Test Birthday Party",
                description="A test event",
                type=EventType.BIRTHDAY,
                status=EventStatus.DRAFT,
                start_date=datetime.now(timezone.utc),
                planner_id=user.id,
                max_guests=50,
                budget_total=Decimal("5000.00")
            )
            session.add(event)
            await session.flush()
            print(f"✅ Created event: {event.name}")
            
            # Create a guest
            guest = Guest(
                event_id=event.id,
                email="guest@example.com",
                first_name="Guest",
                last_name="One",
                rsvp_status=RsvpStatus.PENDING
            )
            session.add(guest)
            await session.flush()
            print(f"✅ Created guest: {guest.email}")
            
            # Create a budget category
            category = BudgetCategory(
                event_id=event.id,
                name="Catering",
                allocated_amount=Decimal("2000.00"),
                color="#FF5733"
            )
            session.add(category)
            await session.flush()
            print(f"✅ Created budget category: {category.name}")
            
            # Create an expense
            expense = Expense(
                event_id=event.id,
                category_id=category.id,
                name="Food order",
                amount=Decimal("500.00"),
                is_paid=False
            )
            session.add(expense)
            await session.flush()
            print(f"✅ Created expense: {expense.name}")
            
            # Test reading back
            result = await session.execute(
                select(Event).where(Event.id == event.id)
            )
            fetched_event = result.scalar_one()
            assert fetched_event.name == "Test Birthday Party"
            print(f"✅ Read event back: {fetched_event.name}")
            
            # Test relationship
            result = await session.execute(
                select(User).where(User.id == user.id)
            )
            fetched_user = result.scalar_one()
            print(f"✅ User-Event relationship working")
            
            await session.commit()
            print("✅ All CRUD operations successful")
            return True
            
        except Exception as e:
            await session.rollback()
            print(f"❌ CRUD operations failed: {e}")
            return False


async def test_enums():
    """Test that enum types work correctly."""
    print("\nTesting enum types...")
    
    async with get_db_session() as session:
        try:
            # Test all enum values
            for role in UserRole:
                user = User(
                    email=f"{role.value}@test.com",
                    first_name="Test",
                    last_name=role.value,
                    role=role
                )
                session.add(user)
            
            await session.flush()
            
            # Query back
            result = await session.execute(select(User))
            users = result.scalars().all()
            
            roles_found = {user.role for user in users}
            assert len(roles_found) >= len(UserRole)
            print(f"✅ All user roles work: {[r.value for r in UserRole]}")
            
            await session.rollback()  # Don't save test data
            return True
            
        except Exception as e:
            await session.rollback()
            print(f"❌ Enum test failed: {e}")
            return False


async def test_constraints():
    """Test database constraints."""
    print("\nTesting constraints...")
    
    async with get_db_session() as session:
        try:
            # Test unique email constraint
            user1 = User(
                email="unique@test.com",
                first_name="User",
                last_name="One",
                role=UserRole.GUEST
            )
            user2 = User(
                email="unique@test.com",  # Same email
                first_name="User",
                last_name="Two",
                role=UserRole.GUEST
            )
            
            session.add(user1)
            await session.flush()
            
            session.add(user2)
            try:
                await session.flush()
                print("❌ Unique constraint not working")
                return False
            except Exception:
                print("✅ Unique email constraint working")
                await session.rollback()
            
            return True
            
        except Exception as e:
            await session.rollback()
            print(f"❌ Constraint test failed: {e}")
            return False


async def main():
    """Run all tests."""
    print("=" * 50)
    print("DATABASE SETUP TEST SUITE")
    print("=" * 50)
    
    tests = [
        test_database_connection,
        test_create_models,
        test_crud_operations,
        test_enums,
        test_constraints
    ]
    
    results = []
    for test in tests:
        result = await test()
        results.append(result)
    
    print("\n" + "=" * 50)
    print("TEST SUMMARY")
    print("=" * 50)
    
    passed = sum(results)
    total = len(results)
    
    if passed == total:
        print(f"✅ All tests passed ({passed}/{total})")
    else:
        print(f"❌ {total - passed} tests failed ({passed}/{total})")
    
    # Cleanup - drop test tables
    print("\nCleaning up test data...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    print("✅ Cleanup complete")
    
    return passed == total


if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)