"""FR-6: The system shall display an RSVP submission page. 5.1.1"""

"""Smoke tests for RSVP public API endpoints."""
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from uuid import uuid4
from datetime import datetime, timedelta, timezone

from app.main import app
from app.models.guest import Guest, RsvpStatus
from app.models.event import Event, EventType, EventStatus
from app.models.user import User, UserRole
from sqlalchemy.ext.asyncio import AsyncSession


@pytest_asyncio.fixture
async def test_user(async_session: AsyncSession):
    """Create a test user (event planner)."""
    user = User(
        email="planner@test.com",
        first_name="Test",
        last_name="Planner",
        role=UserRole.PLANNER,
        is_active=True,
        is_verified=True
    )
    async_session.add(user)
    await async_session.commit()
    await async_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def test_event(async_session: AsyncSession, test_user: User):
    """Create a test event."""
    event = Event(
        name="Test Event",
        description="A test event for RSVP",
        type=EventType.BIRTHDAY,
        status=EventStatus.CONFIRMED,
        start_date=datetime.now(timezone.utc) + timedelta(days=30),
        end_date=datetime.now(timezone.utc) + timedelta(days=30, hours=4),
        location="123 Test St, Test City",
        venue_name="Test Venue",
        planner_id=test_user.id,
        is_public=False
    )
    async_session.add(event)
    await async_session.commit()
    await async_session.refresh(event)
    return event


@pytest_asyncio.fixture
async def test_guest(async_session: AsyncSession, test_event: Event):
    """Create a test guest with RSVP token."""
    from app.utils.token_generator import generate_rsvp_token

    guest = Guest(
        event_id=test_event.id,
        email="guest@test.com",
        first_name="John",
        last_name="Doe",
        rsvp_token=generate_rsvp_token(),
        rsvp_status=RsvpStatus.PENDING,
        plus_one_allowed=True,
        token_expires_at=datetime.now(timezone.utc) + timedelta(days=90)
    )
    async_session.add(guest)
    await async_session.commit()
    await async_session.refresh(guest)
    return guest


@pytest_asyncio.fixture
async def http_client():
    """Create test HTTP client."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


class TestRSVPPublicEndpoints:
    """Test public RSVP endpoints (no authentication required)."""

    @pytest.mark.asyncio
    async def test_validate_rsvp_token_valid(self, http_client: AsyncClient, test_guest: Guest):
        """Test validating a valid RSVP token."""
        response = await http_client.get(f"/api/v1/rsvp/{test_guest.rsvp_token}/validate")

        assert response.status_code == 200
        data = response.json()
        assert data["is_valid"] is True
        assert data["guest_name"] == f"{test_guest.first_name} {test_guest.last_name}"
        assert data["current_rsvp_status"] == RsvpStatus.PENDING.value
        assert data["plus_one_allowed"] is True

    @pytest.mark.asyncio
    async def test_validate_rsvp_token_invalid(self, http_client: AsyncClient):
        """Test validating an invalid RSVP token."""
        response = await http_client.get("/api/v1/rsvp/INVALID1/validate")

        assert response.status_code == 200
        data = response.json()
        assert data["is_valid"] is False
        assert "error_message" in data

    @pytest.mark.asyncio
    async def test_get_rsvp_event_details(
        self,
        http_client: AsyncClient,
        test_guest: Guest,
        test_event: Event,
        test_user: User
    ):
        """Test getting complete event details for RSVP page."""
        response = await http_client.get(
            f"/api/v1/rsvp/{test_guest.rsvp_token}/event-details"
        )

        assert response.status_code == 200
        data = response.json()

        # Check guest information
        assert data["guest"]["first_name"] == test_guest.first_name
        assert data["guest"]["last_name"] == test_guest.last_name
        assert data["guest"]["email"] == test_guest.email
        assert data["guest"]["plus_one_allowed"] is True

        # Check event information
        assert data["event"]["name"] == test_event.name
        assert data["event"]["description"] == test_event.description
        assert data["event"]["type"] == test_event.type.value
        assert data["event"]["venue_name"] == test_event.venue_name

        # Check host name
        assert data["host_name"] == f"{test_user.first_name} {test_user.last_name}"

    @pytest.mark.asyncio
    async def test_submit_rsvp_attending(self, http_client: AsyncClient, test_guest: Guest):
        """Test submitting RSVP response (attending)."""
        response = await http_client.post(
            f"/api/v1/rsvp/{test_guest.rsvp_token}/respond",
            json={
                "rsvp_status": RsvpStatus.ATTENDING.value,
                "dietary_restrictions": "Vegetarian",
                "notes": "Looking forward to it!"
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["rsvp_status"] == RsvpStatus.ATTENDING.value
        assert "message" in data

    @pytest.mark.asyncio
    async def test_submit_rsvp_not_attending(self, http_client: AsyncClient, test_guest: Guest):
        """Test submitting RSVP response (not attending)."""
        response = await http_client.post(
            f"/api/v1/rsvp/{test_guest.rsvp_token}/respond",
            json={
                "rsvp_status": RsvpStatus.NOT_ATTENDING.value
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["rsvp_status"] == RsvpStatus.NOT_ATTENDING.value

    @pytest.mark.asyncio
    async def test_submit_rsvp_with_plus_one(self, http_client: AsyncClient, test_guest: Guest):
        """Test submitting RSVP with plus-one information."""
        response = await http_client.post(
            f"/api/v1/rsvp/{test_guest.rsvp_token}/respond",
            json={
                "rsvp_status": RsvpStatus.ATTENDING.value,
                "plus_one_name": "Jane Doe"
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    @pytest.mark.asyncio
    async def test_update_rsvp_preferences(self, http_client: AsyncClient, test_guest: Guest):
        """Test updating RSVP preferences (dietary restrictions, meal choice)."""
        response = await http_client.patch(
            f"/api/v1/rsvp/{test_guest.rsvp_token}/preferences",
            json={
                "dietary_restrictions": "Gluten-free",
                "meal_preference": "Fish"
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "dietary_restrictions" in data

    @pytest.mark.asyncio
    async def test_update_plus_one(self, http_client: AsyncClient, test_guest: Guest, async_session: AsyncSession):
        """Test updating plus-one information."""
        # First set RSVP to attending so plus-one is valid
        test_guest.rsvp_status = RsvpStatus.ATTENDING
        await async_session.commit()

        response = await http_client.patch(
            f"/api/v1/rsvp/{test_guest.rsvp_token}/plus-one",
            json={
                "plus_one_name": "Jane Smith"
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["plus_one_name"] == "Jane Smith"


class TestRSVPErrorHandling:
    """Test RSVP error handling."""

    @pytest.mark.asyncio
    async def test_expired_token(self, http_client: AsyncClient, test_guest: Guest, async_session: AsyncSession):
        """Test accessing with expired token."""
        # Set token expiration to past
        test_guest.token_expires_at = datetime.now(timezone.utc) - timedelta(days=1)
        await async_session.commit()

        response = await http_client.get(
            f"/api/v1/rsvp/{test_guest.rsvp_token}/event-details"
        )

        assert response.status_code == 410  # Gone

    @pytest.mark.asyncio
    async def test_invalid_token_format(self, http_client: AsyncClient):
        """Test with invalid token format."""
        response = await http_client.get("/api/v1/rsvp/invalid/validate")

        assert response.status_code == 200
        data = response.json()
        assert data["is_valid"] is False

    @pytest.mark.asyncio
    async def test_plus_one_not_allowed(self, http_client: AsyncClient, async_session: AsyncSession, test_event: Event):
        """Test plus-one when not allowed."""
        from app.utils.token_generator import generate_rsvp_token

        # Create guest without plus-one allowed
        guest = Guest(
            event_id=test_event.id,
            email="noplusone@test.com",
            first_name="Solo",
            last_name="Guest",
            rsvp_token=generate_rsvp_token(),
            rsvp_status=RsvpStatus.PENDING,
            plus_one_allowed=False
        )
        async_session.add(guest)
        await async_session.commit()
        await async_session.refresh(guest)

        response = await http_client.post(
            f"/api/v1/rsvp/{guest.rsvp_token}/respond",
            json={
                "rsvp_status": RsvpStatus.ATTENDING.value,
                "plus_one_name": "Someone"
            }
        )

        assert response.status_code == 400  # Bad request
