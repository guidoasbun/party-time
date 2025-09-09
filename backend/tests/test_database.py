"""pytest tests for database models and operations."""
import pytest
from datetime import datetime, timezone, date
from decimal import Decimal
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.models import (
    User, UserRole,
    Event, EventType, EventStatus,
    Guest, RsvpStatus,
    BudgetCategory, Expense,
    Vendor, EventVendor
)


@pytest.mark.asyncio
async def test_create_user(async_session):
    """Test creating a user."""
    user = User(
        email="test@example.com",
        first_name="Test",
        last_name="User",
        role=UserRole.PLANNER
    )
    async_session.add(user)
    await async_session.commit()
    
    # Query back
    result = await async_session.execute(
        select(User).where(User.email == "test@example.com")
    )
    fetched_user = result.scalar_one()
    
    assert fetched_user.first_name == "Test"
    assert fetched_user.last_name == "User"
    assert fetched_user.role == UserRole.PLANNER
    assert fetched_user.is_active is True  # Default value
    assert fetched_user.is_verified is False  # Default value


@pytest.mark.asyncio
async def test_create_event(async_session):
    """Test creating an event with relationships."""
    # Create planner
    planner = User(
        email="planner@example.com",
        first_name="Event",
        last_name="Planner",
        role=UserRole.PLANNER
    )
    async_session.add(planner)
    await async_session.flush()
    
    # Create event
    event = Event(
        name="Company Holiday Party",
        description="Annual company celebration",
        type=EventType.CORPORATE,
        status=EventStatus.ACTIVE,
        start_date=datetime.now(timezone.utc),
        planner_id=planner.id,
        max_guests=100,
        budget_total=Decimal("10000.00"),
        venue_name="Grand Ballroom",
        venue_address="123 Main St"
    )
    async_session.add(event)
    await async_session.commit()
    
    # Query back with relationship
    result = await async_session.execute(
        select(Event).where(Event.name == "Company Holiday Party")
    )
    fetched_event = result.scalar_one()
    
    assert fetched_event.type == EventType.CORPORATE
    assert fetched_event.status == EventStatus.ACTIVE
    assert fetched_event.max_guests == 100
    assert fetched_event.budget_total == Decimal("10000.00")
    assert fetched_event.planner_id == planner.id


@pytest.mark.asyncio
async def test_guest_rsvp_system(async_session):
    """Test guest creation and RSVP functionality."""
    # Setup planner and event
    planner = User(
        email="planner2@example.com",
        first_name="Planner",
        last_name="Two",
        role=UserRole.PLANNER
    )
    async_session.add(planner)
    await async_session.flush()
    
    event = Event(
        name="Wedding Reception",
        type=EventType.WEDDING,
        status=EventStatus.ACTIVE,
        start_date=datetime.now(timezone.utc),
        planner_id=planner.id
    )
    async_session.add(event)
    await async_session.flush()
    
    # Create guest
    guest = Guest(
        event_id=event.id,
        email="guest@example.com",
        first_name="John",
        last_name="Doe",
        plus_one_allowed=True,
        dietary_restrictions="Vegetarian"
    )
    async_session.add(guest)
    await async_session.commit()
    
    # Verify guest
    result = await async_session.execute(
        select(Guest).where(Guest.email == "guest@example.com")
    )
    fetched_guest = result.scalar_one()
    
    assert fetched_guest.rsvp_status == RsvpStatus.PENDING  # Default
    assert fetched_guest.plus_one_allowed is True
    assert fetched_guest.dietary_restrictions == "Vegetarian"
    assert fetched_guest.rsvp_token is not None  # Auto-generated
    assert len(fetched_guest.rsvp_token) == 64  # 32 bytes hex = 64 chars


@pytest.mark.asyncio
async def test_budget_tracking(async_session):
    """Test budget categories and expenses."""
    # Setup
    planner = User(
        email="budget_planner@example.com",
        first_name="Budget",
        last_name="Planner",
        role=UserRole.PLANNER
    )
    async_session.add(planner)
    await async_session.flush()
    
    event = Event(
        name="Birthday Bash",
        type=EventType.BIRTHDAY,
        status=EventStatus.ACTIVE,
        start_date=datetime.now(timezone.utc),
        planner_id=planner.id,
        budget_total=Decimal("3000.00")
    )
    async_session.add(event)
    await async_session.flush()
    
    # Create budget categories
    catering = BudgetCategory(
        event_id=event.id,
        name="Catering",
        allocated_amount=Decimal("1500.00"),
        color="#FF5733"
    )
    decorations = BudgetCategory(
        event_id=event.id,
        name="Decorations",
        allocated_amount=Decimal("500.00"),
        color="#33FF57"
    )
    async_session.add_all([catering, decorations])
    await async_session.flush()
    
    # Create expenses
    expense1 = Expense(
        event_id=event.id,
        category_id=catering.id,
        name="Pizza order",
        amount=Decimal("350.00"),
        expense_date=date.today(),
        vendor_name="Pizza Palace",
        is_paid=True
    )
    expense2 = Expense(
        event_id=event.id,
        category_id=catering.id,
        name="Drinks",
        amount=Decimal("150.00"),
        is_paid=False
    )
    async_session.add_all([expense1, expense2])
    await async_session.commit()
    
    # Verify relationships
    result = await async_session.execute(
        select(BudgetCategory).where(BudgetCategory.event_id == event.id)
    )
    categories = result.scalars().all()
    assert len(categories) == 2
    
    result = await async_session.execute(
        select(Expense).where(Expense.category_id == catering.id)
    )
    catering_expenses = result.scalars().all()
    assert len(catering_expenses) == 2
    total_catering = sum(e.amount for e in catering_expenses)
    assert total_catering == Decimal("500.00")


@pytest.mark.asyncio
async def test_vendor_management(async_session):
    """Test vendor and event-vendor relationships."""
    # Create vendor
    vendor = Vendor(
        name="DJ Amazing",
        type="DJ/Music",
        contact_email="dj@amazing.com",
        contact_phone="555-0123",
        rating=Decimal("4.75")
    )
    async_session.add(vendor)
    await async_session.flush()
    
    # Create event
    planner = User(
        email="vendor_planner@example.com",
        first_name="Vendor",
        last_name="Manager",
        role=UserRole.PLANNER
    )
    async_session.add(planner)
    await async_session.flush()
    
    event = Event(
        name="Graduation Party",
        type=EventType.GRADUATION,
        status=EventStatus.ACTIVE,
        start_date=datetime.now(timezone.utc),
        planner_id=planner.id
    )
    async_session.add(event)
    await async_session.flush()
    
    # Link vendor to event
    event_vendor = EventVendor(
        event_id=event.id,
        vendor_id=vendor.id,
        service_description="4 hours of DJ service",
        contract_amount=Decimal("800.00"),
        contract_date=date.today(),
        is_confirmed=True
    )
    async_session.add(event_vendor)
    await async_session.commit()
    
    # Verify
    result = await async_session.execute(
        select(EventVendor).where(EventVendor.event_id == event.id)
    )
    fetched_ev = result.scalar_one()
    assert fetched_ev.contract_amount == Decimal("800.00")
    assert fetched_ev.is_confirmed is True


@pytest.mark.asyncio
async def test_unique_constraints(async_session):
    """Test database unique constraints."""
    # Test unique email for users
    user1 = User(
        email="unique@test.com",
        first_name="User",
        last_name="One",
        role=UserRole.GUEST
    )
    user2 = User(
        email="unique@test.com",  # Duplicate email
        first_name="User",
        last_name="Two",
        role=UserRole.GUEST
    )
    
    async_session.add(user1)
    await async_session.commit()
    
    async_session.add(user2)
    with pytest.raises(IntegrityError):
        await async_session.commit()
    
    await async_session.rollback()
    
    # Test unique guest per event
    planner = User(
        email="constraint_planner@example.com",
        first_name="Constraint",
        last_name="Tester",
        role=UserRole.PLANNER
    )
    async_session.add(planner)
    await async_session.flush()
    
    event = Event(
        name="Test Event",
        type=EventType.OTHER,
        status=EventStatus.DRAFT,
        start_date=datetime.now(timezone.utc),
        planner_id=planner.id
    )
    async_session.add(event)
    await async_session.flush()
    
    guest1 = Guest(
        event_id=event.id,
        email="guest@unique.com",
        first_name="Guest",
        last_name="One"
    )
    guest2 = Guest(
        event_id=event.id,
        email="guest@unique.com",  # Same email for same event
        first_name="Guest",
        last_name="Two"
    )
    
    async_session.add(guest1)
    await async_session.commit()
    
    async_session.add(guest2)
    with pytest.raises(IntegrityError):
        await async_session.commit()


@pytest.mark.asyncio
async def test_cascade_delete(async_session):
    """Test cascade deletion of related records."""
    # Create planner and event
    planner = User(
        email="cascade_test@example.com",
        first_name="Cascade",
        last_name="Tester",
        role=UserRole.PLANNER
    )
    async_session.add(planner)
    await async_session.flush()
    
    event = Event(
        name="Event to Delete",
        type=EventType.OTHER,
        status=EventStatus.DRAFT,
        start_date=datetime.now(timezone.utc),
        planner_id=planner.id
    )
    async_session.add(event)
    await async_session.flush()
    
    # Add related records
    guest = Guest(
        event_id=event.id,
        email="will_be_deleted@example.com",
        first_name="Will",
        last_name="BeDeleted"
    )
    category = BudgetCategory(
        event_id=event.id,
        name="Test Category",
        allocated_amount=Decimal("100.00")
    )
    async_session.add_all([guest, category])
    await async_session.commit()
    
    # Delete event
    await async_session.delete(event)
    await async_session.commit()
    
    # Verify cascade deletion
    result = await async_session.execute(
        select(Guest).where(Guest.email == "will_be_deleted@example.com")
    )
    assert result.scalar_one_or_none() is None
    
    result = await async_session.execute(
        select(BudgetCategory).where(BudgetCategory.name == "Test Category")
    )
    assert result.scalar_one_or_none() is None