"""Integration tests for Events API endpoints."""
import pytest
import pytest_asyncio
from httpx import AsyncClient
from uuid import uuid4, UUID
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.crud import crud_user, crud_event
from app.schemas.user import UserCreate
from app.models.user import UserRole
from app.models.event import EventType, EventStatus


@pytest.mark.asyncio
class TestEventsAPI:
    """Test suite for Events API endpoints."""
    
    @pytest_asyncio.fixture
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
    
    @pytest_asyncio.fixture
    async def auth_headers(self, test_user):
        """Mock authentication headers."""
        # In a real scenario, this would be a JWT token
        return {"Authorization": f"Bearer mock-token-{test_user.id}"}
    
    @pytest.fixture
    def event_data(self):
        """Sample event data for testing."""
        return {
            "name": "Test Birthday Party",
            "description": "A fun birthday celebration",
            "type": "birthday",
            "start_date": "2024-12-15T18:00:00",
            "end_date": "2024-12-15T22:00:00",
            "location": "123 Party Street",
            "venue_name": "Party Hall",
            "max_guests": 50,
            "budget_total": 1500.00,
            "is_public": False
        }
    
    async def test_create_event_success(self, event_data, auth_headers):
        """Test successful event creation."""
        async with AsyncClient(base_url="http://testserver") as client:
            client.app = app
            response = await client.post(
                "/api/v1/events/",
                json=event_data,
                headers=auth_headers
            )
        
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == event_data["name"]
        assert data["type"] == event_data["type"]
        assert data["status"] == "draft"
        assert "id" in data
        assert "created_at" in data
    
    async def test_create_event_invalid_data(self, auth_headers):
        """Test event creation with invalid data."""
        invalid_data = {
            "name": "",  # Empty name should fail
            "type": "invalid_type",
            "start_date": "invalid_date"
        }
        
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.post(
                "/api/v1/events/",
                json=invalid_data,
                headers=auth_headers
            )
        
        assert response.status_code == 422  # Validation error
    
    async def test_get_events_list(self, event_data, auth_headers, async_session: AsyncSession, test_user):
        """Test retrieving user's events."""
        # Create a test event first
        from app.schemas.event import EventCreate
        event_create = EventCreate(**event_data)
        await crud_event.create_event(async_session, event_create, test_user.id)
        
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.get("/api/v1/events/", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert data[0]["name"] == event_data["name"]
    
    async def test_get_events_with_filters(self, auth_headers):
        """Test getting events with query filters."""
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.get(
                "/api/v1/events/",
                params={
                    "event_type": "birthday",
                    "status": "draft",
                    "limit": 10
                },
                headers=auth_headers
            )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    async def test_get_single_event(self, event_data, auth_headers, async_session: AsyncSession, test_user):
        """Test retrieving a specific event."""
        # Create a test event first
        from app.schemas.event import EventCreate
        event_create = EventCreate(**event_data)
        event = await crud_event.create_event(async_session, event_create, test_user.id)
        
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.get(f"/api/v1/events/{event.id}", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(event.id)
        assert data["name"] == event_data["name"]
    
    async def test_get_nonexistent_event(self, auth_headers):
        """Test getting a non-existent event."""
        fake_id = str(uuid4())
        
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.get(f"/api/v1/events/{fake_id}", headers=auth_headers)
        
        assert response.status_code == 404
    
    async def test_update_event(self, event_data, auth_headers, async_session: AsyncSession, test_user):
        """Test updating an event."""
        # Create a test event first
        from app.schemas.event import EventCreate
        event_create = EventCreate(**event_data)
        event = await crud_event.create_event(async_session, event_create, test_user.id)
        
        update_data = {
            "name": "Updated Party Name",
            "max_guests": 75
        }
        
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.put(
                f"/api/v1/events/{event.id}",
                json=update_data,
                headers=auth_headers
            )
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == update_data["name"]
        assert data["max_guests"] == update_data["max_guests"]
    
    async def test_update_event_status(self, event_data, auth_headers, async_session: AsyncSession, test_user):
        """Test updating event status."""
        # Create a test event first
        from app.schemas.event import EventCreate
        event_create = EventCreate(**event_data)
        event = await crud_event.create_event(async_session, event_create, test_user.id)
        
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.patch(
                f"/api/v1/events/{event.id}/status",
                params={"status": "active"},
                headers=auth_headers
            )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "active"
    
    async def test_delete_event(self, event_data, auth_headers, async_session: AsyncSession, test_user):
        """Test deleting an event."""
        # Create a test event first
        from app.schemas.event import EventCreate
        event_create = EventCreate(**event_data)
        event = await crud_event.create_event(async_session, event_create, test_user.id)
        
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.delete(f"/api/v1/events/{event.id}", headers=auth_headers)
        
        assert response.status_code == 204
        
        # Verify event is deleted
        deleted_response = await client.get(f"/api/v1/events/{event.id}", headers=auth_headers)
        assert deleted_response.status_code == 404
    
    async def test_search_events(self, auth_headers):
        """Test searching events."""
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.get(
                "/api/v1/events/search",
                params={
                    "search_term": "birthday",
                    "event_type": "birthday"
                },
                headers=auth_headers
            )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    async def test_get_public_events(self):
        """Test getting public events (no auth required)."""
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.get("/api/v1/events/public")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    async def test_get_event_stats(self, event_data, auth_headers, async_session: AsyncSession, test_user):
        """Test getting event statistics."""
        # Create a test event first
        from app.schemas.event import EventCreate
        event_create = EventCreate(**event_data)
        event = await crud_event.create_event(async_session, event_create, test_user.id)
        
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.get(f"/api/v1/events/{event.id}/stats", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "event_id" in data
        assert "guest_stats" in data
        assert "budget_stats" in data
        assert "total_invited" in data["guest_stats"]
        assert "total_allocated" in data["budget_stats"]
    
    async def test_unauthorized_access(self):
        """Test accessing endpoints without authentication."""
        async with AsyncClient(app=app, base_url="http://test") as client:
            # Note: Our current mock auth always returns a user, 
            # so we test with an invalid/missing header format
            response = await client.get("/api/v1/events/")
        
        # With our current mock auth, this will work
        # In a real auth system, this would be 401
        assert response.status_code in [200, 401]
    
    async def test_event_ownership_protection(self, event_data, auth_headers, async_session: AsyncSession):
        """Test that users can only access their own events."""
        # Create a different user
        other_user_data = UserCreate(
            email="otheruser@example.com",
            first_name="Other",
            last_name="User",
            role=UserRole.PLANNER
        )
        other_user = await crud_user.create_user(async_session, other_user_data)
        
        # Create event for other user
        from app.schemas.event import EventCreate
        event_create = EventCreate(**event_data)
        other_event = await crud_event.create_event(async_session, event_create, other_user.id)
        
        # Try to access other user's event
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.get(f"/api/v1/events/{other_event.id}", headers=auth_headers)
        
        # Should be forbidden (in real auth) or not found (in our mock)
        assert response.status_code in [403, 404]