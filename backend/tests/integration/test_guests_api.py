"""Integration tests for Guests API endpoints."""
import pytest
from httpx import AsyncClient
from uuid import uuid4
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.crud import crud_user, crud_event, crud_guest
from app.schemas.user import UserCreate
from app.schemas.event import EventCreate
from app.models.user import UserRole
from app.models.guest import RsvpStatus


@pytest.mark.asyncio
class TestGuestsAPI:
    """Test suite for Guests API endpoints."""
    
    @pytest.fixture
    async def test_user(self, async_session: AsyncSession):
        """Create a test user for events."""
        user_data = UserCreate(
            email="testuser@example.com",
            first_name="Test",
            last_name="User",
            role=UserRole.PLANNER
        )
        user = await crud_user.create_user(async_session, user_data)
        return user
    
    @pytest.fixture
    async def test_event(self, async_session: AsyncSession, test_user):
        """Create a test event for guest testing."""
        event_data = EventCreate(
            name="Test Event",
            description="Test event for guest testing",
            type="birthday",
            start_date="2024-12-15T18:00:00",
            end_date="2024-12-15T22:00:00"
        )
        event = await crud_event.create_event(async_session, event_data, test_user.id)
        return event
    
    @pytest.fixture
    async def auth_headers(self, test_user):
        """Mock authentication headers."""
        return {"Authorization": f"Bearer mock-token-{test_user.id}"}
    
    @pytest.fixture
    def guest_data(self):
        """Sample guest data for testing."""
        return {
            "email": "guest@example.com",
            "first_name": "John",
            "last_name": "Doe",
            "phone": "+1234567890",
            "plus_one_allowed": True,
            "dietary_restrictions": "Vegetarian",
            "notes": "VIP guest"
        }
    
    async def test_create_guest_success(self, guest_data, auth_headers, test_event):
        """Test successful guest creation."""
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.post(
                f"/api/v1/events/{test_event.id}/guests/",
                json=guest_data,
                headers=auth_headers
            )
        
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == guest_data["email"]
        assert data["first_name"] == guest_data["first_name"]
        assert data["rsvp_status"] == "pending"
        assert "id" in data
        assert "rsvp_token" not in data  # Should not expose token in response
    
    async def test_create_guest_duplicate_email(self, guest_data, auth_headers, test_event, async_session):
        """Test creating guest with duplicate email."""
        # Create guest first
        from app.schemas.guest import GuestCreate
        guest_create = GuestCreate(**guest_data)
        await crud_guest.create_guest(async_session, guest_create, test_event.id)
        
        # Try to create another guest with same email
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.post(
                f"/api/v1/events/{test_event.id}/guests/",
                json=guest_data,
                headers=auth_headers
            )
        
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"]
    
    async def test_create_guests_bulk(self, auth_headers, test_event):
        """Test bulk guest creation."""
        bulk_guests = [
            {
                "email": "guest1@example.com",
                "first_name": "Guest",
                "last_name": "One",
                "plus_one_allowed": False
            },
            {
                "email": "guest2@example.com",
                "first_name": "Guest",
                "last_name": "Two",
                "plus_one_allowed": True
            },
            {
                "email": "guest3@example.com",
                "first_name": "Guest",
                "last_name": "Three",
                "dietary_restrictions": "Gluten-free"
            }
        ]
        
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.post(
                f"/api/v1/events/{test_event.id}/guests/bulk",
                json=bulk_guests,
                headers=auth_headers
            )
        
        assert response.status_code == 201
        data = response.json()
        assert len(data) == 3
        assert data[0]["email"] == "guest1@example.com"
        assert data[1]["plus_one_allowed"] == True
        assert data[2]["dietary_restrictions"] == "Gluten-free"
    
    async def test_get_guests_list(self, guest_data, auth_headers, test_event, async_session):
        """Test retrieving guests for an event."""
        # Create a test guest first
        from app.schemas.guest import GuestCreate
        guest_create = GuestCreate(**guest_data)
        await crud_guest.create_guest(async_session, guest_create, test_event.id)
        
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.get(
                f"/api/v1/events/{test_event.id}/guests/",
                headers=auth_headers
            )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert data[0]["email"] == guest_data["email"]
    
    async def test_get_guests_with_filters(self, auth_headers, test_event):
        """Test getting guests with query filters."""
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.get(
                f"/api/v1/events/{test_event.id}/guests/",
                params={
                    "rsvp_status": "pending",
                    "plus_one_only": True,
                    "limit": 10
                },
                headers=auth_headers
            )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    async def test_get_single_guest(self, guest_data, auth_headers, test_event, async_session):
        """Test retrieving a specific guest."""
        # Create a test guest first
        from app.schemas.guest import GuestCreate
        guest_create = GuestCreate(**guest_data)
        guest = await crud_guest.create_guest(async_session, guest_create, test_event.id)
        
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.get(
                f"/api/v1/events/{test_event.id}/guests/{guest.id}",
                headers=auth_headers
            )
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(guest.id)
        assert data["email"] == guest_data["email"]
    
    async def test_update_guest(self, guest_data, auth_headers, test_event, async_session):
        """Test updating a guest."""
        # Create a test guest first
        from app.schemas.guest import GuestCreate
        guest_create = GuestCreate(**guest_data)
        guest = await crud_guest.create_guest(async_session, guest_create, test_event.id)
        
        update_data = {
            "first_name": "Jane",
            "dietary_restrictions": "Vegan",
            "notes": "Updated VIP guest"
        }
        
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.put(
                f"/api/v1/events/{test_event.id}/guests/{guest.id}",
                json=update_data,
                headers=auth_headers
            )
        
        assert response.status_code == 200
        data = response.json()
        assert data["first_name"] == "Jane"
        assert data["dietary_restrictions"] == "Vegan"
        assert data["notes"] == "Updated VIP guest"
    
    async def test_delete_guest(self, guest_data, auth_headers, test_event, async_session):
        """Test deleting a guest."""
        # Create a test guest first
        from app.schemas.guest import GuestCreate
        guest_create = GuestCreate(**guest_data)
        guest = await crud_guest.create_guest(async_session, guest_create, test_event.id)
        
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.delete(
                f"/api/v1/events/{test_event.id}/guests/{guest.id}",
                headers=auth_headers
            )
        
        assert response.status_code == 204
        
        # Verify guest is deleted
        deleted_response = await client.get(
            f"/api/v1/events/{test_event.id}/guests/{guest.id}",
            headers=auth_headers
        )
        assert deleted_response.status_code == 404
    
    async def test_get_guest_by_rsvp_token(self, guest_data, async_session, test_event):
        """Test getting guest by RSVP token (public endpoint)."""
        # Create a test guest first
        from app.schemas.guest import GuestCreate
        guest_create = GuestCreate(**guest_data)
        guest = await crud_guest.create_guest(async_session, guest_create, test_event.id)
        
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.get(f"/api/v1/events/rsvp/{guest.rsvp_token}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(guest.id)
        assert data["email"] == guest_data["email"]
    
    async def test_get_guest_invalid_rsvp_token(self):
        """Test getting guest with invalid RSVP token."""
        fake_token = "invalid-token-123"
        
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.get(f"/api/v1/events/rsvp/{fake_token}")
        
        assert response.status_code == 404
        assert "Invalid RSVP token" in response.json()["detail"]
    
    async def test_update_rsvp_response(self, guest_data, async_session, test_event):
        """Test updating RSVP response (public endpoint)."""
        # Create a test guest first
        from app.schemas.guest import GuestCreate
        guest_create = GuestCreate(**guest_data)
        guest = await crud_guest.create_guest(async_session, guest_create, test_event.id)
        
        rsvp_data = {
            "rsvp_status": "attending",
            "plus_one_name": "Jane Smith"
        }
        
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.post(
                f"/api/v1/events/rsvp/{guest.rsvp_token}",
                json=rsvp_data
            )
        
        assert response.status_code == 200
        data = response.json()
        assert data["rsvp_status"] == "attending"
        assert data["plus_one_name"] == "Jane Smith"
        assert data["rsvp_responded_at"] is not None
    
    async def test_update_rsvp_not_attending(self, guest_data, async_session, test_event):
        """Test updating RSVP to not attending."""
        # Create a test guest first
        from app.schemas.guest import GuestCreate
        guest_create = GuestCreate(**guest_data)
        guest = await crud_guest.create_guest(async_session, guest_create, test_event.id)
        
        rsvp_data = {
            "rsvp_status": "not_attending"
        }
        
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.post(
                f"/api/v1/events/rsvp/{guest.rsvp_token}",
                json=rsvp_data
            )
        
        assert response.status_code == 200
        data = response.json()
        assert data["rsvp_status"] == "not_attending"
    
    async def test_get_guest_stats(self, auth_headers, test_event):
        """Test getting guest statistics for an event."""
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.get(
                f"/api/v1/events/{test_event.id}/guests/stats",
                headers=auth_headers
            )
        
        assert response.status_code == 200
        data = response.json()
        assert "event_id" in data
        assert "total_invited" in data
        assert "rsvp_responses" in data
        assert "attending" in data["rsvp_responses"]
        assert "response_rate" in data
    
    async def test_get_dietary_restrictions(self, guest_data, auth_headers, test_event, async_session):
        """Test getting guests with dietary restrictions."""
        # Create a guest with dietary restrictions
        from app.schemas.guest import GuestCreate
        guest_create = GuestCreate(**guest_data)
        await crud_guest.create_guest(async_session, guest_create, test_event.id)
        
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.get(
                f"/api/v1/events/{test_event.id}/guests/dietary-restrictions",
                headers=auth_headers
            )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if len(data) > 0:
            assert "dietary_restrictions" in data[0]
            assert "name" in data[0]
    
    async def test_send_invitation_mock(self, guest_data, auth_headers, test_event, async_session):
        """Test marking invitation as sent."""
        # Create a test guest first
        from app.schemas.guest import GuestCreate
        guest_create = GuestCreate(**guest_data)
        guest = await crud_guest.create_guest(async_session, guest_create, test_event.id)
        
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.post(
                f"/api/v1/events/{test_event.id}/guests/{guest.id}/send-invitation",
                headers=auth_headers
            )
        
        assert response.status_code == 200
        data = response.json()
        assert data["invitation_sent_at"] is not None
    
    async def test_guest_access_control(self, guest_data, auth_headers, async_session):
        """Test that users can only access guests from their own events."""
        # Create a different user and event
        other_user_data = UserCreate(
            email="otheruser@example.com",
            first_name="Other",
            last_name="User",
            role=UserRole.PLANNER
        )
        other_user = await crud_user.create_user(async_session, other_user_data)
        
        other_event_data = EventCreate(
            name="Other Event",
            description="Other user's event",
            type="birthday",
            start_date="2024-12-20T18:00:00"
        )
        other_event = await crud_event.create_event(async_session, other_event_data, other_user.id)
        
        # Create guest in other user's event
        from app.schemas.guest import GuestCreate
        guest_create = GuestCreate(**guest_data)
        other_guest = await crud_guest.create_guest(async_session, guest_create, other_event.id)
        
        # Try to access other user's guest
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.get(
                f"/api/v1/events/{other_event.id}/guests/{other_guest.id}",
                headers=auth_headers
            )
        
        # Should be forbidden or not found
        assert response.status_code in [403, 404]
    
    async def test_bulk_guests_duplicate_emails(self, auth_headers, test_event):
        """Test bulk guest creation with duplicate emails."""
        bulk_guests = [
            {
                "email": "duplicate@example.com",
                "first_name": "First",
                "last_name": "Duplicate"
            },
            {
                "email": "duplicate@example.com",  # Same email
                "first_name": "Second",
                "last_name": "Duplicate"
            }
        ]
        
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.post(
                f"/api/v1/events/{test_event.id}/guests/bulk",
                json=bulk_guests,
                headers=auth_headers
            )
        
        assert response.status_code == 400
        assert "Duplicate emails" in response.json()["detail"]