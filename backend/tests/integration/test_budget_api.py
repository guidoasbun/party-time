"""Integration tests for Budget API endpoints."""
import pytest
from httpx import AsyncClient
from decimal import Decimal
from datetime import date
from uuid import uuid4
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.crud import crud_user, crud_event, crud_budget
from app.schemas.user import UserCreate
from app.schemas.event import EventCreate
from app.models.user import UserRole


@pytest.mark.asyncio
class TestBudgetAPI:
    """Test suite for Budget API endpoints."""
    
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
        """Create a test event for budget testing."""
        event_data = EventCreate(
            name="Test Event",
            description="Test event for budget testing",
            type="birthday",
            start_date="2024-12-15T18:00:00",
            end_date="2024-12-15T22:00:00",
            budget_total=Decimal("2000.00")
        )
        event = await crud_event.create_event(async_session, event_data, test_user.id)
        return event
    
    @pytest.fixture
    async def auth_headers(self, test_user):
        """Mock authentication headers."""
        return {"Authorization": f"Bearer mock-token-{test_user.id}"}
    
    @pytest.fixture
    def category_data(self):
        """Sample budget category data for testing."""
        return {
            "name": "Decorations",
            "allocated_amount": 500.00,
            "color": "#FF5733"
        }
    
    @pytest.fixture
    def expense_data(self):
        """Sample expense data for testing."""
        return {
            "name": "Party Balloons",
            "description": "Colorful balloons for decoration",
            "amount": 75.50,
            "expense_date": "2024-12-10",
            "vendor_name": "Party Supply Store",
            "is_paid": False,
            "receipt_url": "https://example.com/receipt.pdf"
        }
    
    # Budget Category Tests
    
    async def test_create_budget_category_success(self, category_data, auth_headers, test_event):
        """Test successful budget category creation."""
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.post(
                f"/api/v1/events/{test_event.id}/categories/",
                json=category_data,
                headers=auth_headers
            )
        
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == category_data["name"]
        assert float(data["allocated_amount"]) == category_data["allocated_amount"]
        assert data["color"] == category_data["color"]
        assert "id" in data
        assert "created_at" in data
    
    async def test_create_budget_category_invalid_data(self, auth_headers, test_event):
        """Test budget category creation with invalid data."""
        invalid_data = {
            "name": "",  # Empty name should fail
            "allocated_amount": -100.00,  # Negative amount should fail
            "color": "invalid-color"  # Invalid hex color
        }
        
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.post(
                f"/api/v1/events/{test_event.id}/categories/",
                json=invalid_data,
                headers=auth_headers
            )
        
        assert response.status_code == 422  # Validation error
    
    async def test_get_budget_categories(self, category_data, auth_headers, test_event, async_session):
        """Test retrieving budget categories for an event."""
        # Create a test category first
        from app.schemas.budget import BudgetCategoryCreate
        category_create = BudgetCategoryCreate(**category_data)
        await crud_budget.create_budget_category(async_session, category_create, test_event.id)
        
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.get(
                f"/api/v1/events/{test_event.id}/categories/",
                headers=auth_headers
            )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert data[0]["name"] == category_data["name"]
    
    async def test_update_budget_category(self, category_data, auth_headers, test_event, async_session):
        """Test updating a budget category."""
        # Create a test category first
        from app.schemas.budget import BudgetCategoryCreate
        category_create = BudgetCategoryCreate(**category_data)
        category = await crud_budget.create_budget_category(async_session, category_create, test_event.id)
        
        update_data = {
            "name": "Updated Decorations",
            "allocated_amount": 750.00,
            "color": "#33FF57"
        }
        
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.put(
                f"/api/v1/events/{test_event.id}/categories/{category.id}",
                json=update_data,
                headers=auth_headers
            )
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Decorations"
        assert float(data["allocated_amount"]) == 750.00
        assert data["color"] == "#33FF57"
    
    async def test_delete_budget_category(self, category_data, auth_headers, test_event, async_session):
        """Test deleting a budget category."""
        # Create a test category first
        from app.schemas.budget import BudgetCategoryCreate
        category_create = BudgetCategoryCreate(**category_data)
        category = await crud_budget.create_budget_category(async_session, category_create, test_event.id)
        
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.delete(
                f"/api/v1/events/{test_event.id}/categories/{category.id}",
                headers=auth_headers
            )
        
        assert response.status_code == 204
    
    # Expense Tests
    
    async def test_create_expense_success(self, expense_data, auth_headers, test_event, async_session):
        """Test successful expense creation."""
        # Create a category first
        from app.schemas.budget import BudgetCategoryCreate
        category_data = BudgetCategoryCreate(
            name="Test Category",
            allocated_amount=Decimal("500.00")
        )
        category = await crud_budget.create_budget_category(async_session, category_data, test_event.id)
        
        expense_data_with_category = expense_data.copy()
        expense_data_with_category["category_id"] = str(category.id)
        
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.post(
                f"/api/v1/events/{test_event.id}/expenses/",
                json=expense_data_with_category,
                headers=auth_headers
            )
        
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == expense_data["name"]
        assert float(data["amount"]) == expense_data["amount"]
        assert data["vendor_name"] == expense_data["vendor_name"]
        assert data["is_paid"] == expense_data["is_paid"]
        assert "id" in data
    
    async def test_create_expense_without_category(self, expense_data, auth_headers, test_event):
        """Test creating expense without category."""
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.post(
                f"/api/v1/events/{test_event.id}/expenses/",
                json=expense_data,
                headers=auth_headers
            )
        
        assert response.status_code == 201
        data = response.json()
        assert data["category_id"] is None
    
    async def test_get_expenses(self, expense_data, auth_headers, test_event, async_session):
        """Test retrieving expenses for an event."""
        # Create a test expense first
        from app.schemas.budget import ExpenseCreate
        expense_create = ExpenseCreate(**expense_data)
        await crud_budget.create_expense(async_session, expense_create, test_event.id)
        
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.get(
                f"/api/v1/events/{test_event.id}/expenses/",
                headers=auth_headers
            )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert data[0]["name"] == expense_data["name"]
    
    async def test_get_expenses_with_filters(self, auth_headers, test_event):
        """Test getting expenses with query filters."""
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.get(
                f"/api/v1/events/{test_event.id}/expenses/",
                params={
                    "is_paid": False,
                    "limit": 10
                },
                headers=auth_headers
            )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    async def test_get_single_expense(self, expense_data, auth_headers, test_event, async_session):
        """Test retrieving a specific expense."""
        # Create a test expense first
        from app.schemas.budget import ExpenseCreate
        expense_create = ExpenseCreate(**expense_data)
        expense = await crud_budget.create_expense(async_session, expense_create, test_event.id)
        
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.get(
                f"/api/v1/events/{test_event.id}/expenses/{expense.id}",
                headers=auth_headers
            )
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(expense.id)
        assert data["name"] == expense_data["name"]
    
    async def test_update_expense(self, expense_data, auth_headers, test_event, async_session):
        """Test updating an expense."""
        # Create a test expense first
        from app.schemas.budget import ExpenseCreate
        expense_create = ExpenseCreate(**expense_data)
        expense = await crud_budget.create_expense(async_session, expense_create, test_event.id)
        
        update_data = {
            "name": "Updated Balloons",
            "amount": 125.75,
            "is_paid": True
        }
        
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.put(
                f"/api/v1/events/{test_event.id}/expenses/{expense.id}",
                json=update_data,
                headers=auth_headers
            )
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Balloons"
        assert float(data["amount"]) == 125.75
        assert data["is_paid"] == True
    
    async def test_delete_expense(self, expense_data, auth_headers, test_event, async_session):
        """Test deleting an expense."""
        # Create a test expense first
        from app.schemas.budget import ExpenseCreate
        expense_create = ExpenseCreate(**expense_data)
        expense = await crud_budget.create_expense(async_session, expense_create, test_event.id)
        
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.delete(
                f"/api/v1/events/{test_event.id}/expenses/{expense.id}",
                headers=auth_headers
            )
        
        assert response.status_code == 204
    
    async def test_mark_expense_paid(self, expense_data, auth_headers, test_event, async_session):
        """Test marking an expense as paid."""
        # Create a test expense first
        from app.schemas.budget import ExpenseCreate
        expense_create = ExpenseCreate(**expense_data)
        expense = await crud_budget.create_expense(async_session, expense_create, test_event.id)
        
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.patch(
                f"/api/v1/events/{test_event.id}/expenses/{expense.id}/mark-paid",
                headers=auth_headers
            )
        
        assert response.status_code == 200
        data = response.json()
        assert data["is_paid"] == True
    
    async def test_mark_expense_unpaid(self, expense_data, auth_headers, test_event, async_session):
        """Test marking an expense as unpaid."""
        # Create a paid expense first
        from app.schemas.budget import ExpenseCreate
        expense_data_paid = expense_data.copy()
        expense_data_paid["is_paid"] = True
        expense_create = ExpenseCreate(**expense_data_paid)
        expense = await crud_budget.create_expense(async_session, expense_create, test_event.id)
        
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.patch(
                f"/api/v1/events/{test_event.id}/expenses/{expense.id}/mark-unpaid",
                headers=auth_headers
            )
        
        assert response.status_code == 200
        data = response.json()
        assert data["is_paid"] == False
    
    # Analytics Tests
    
    async def test_get_budget_summary(self, auth_headers, test_event, async_session):
        """Test getting budget summary for an event."""
        # Create some test data
        from app.schemas.budget import BudgetCategoryCreate, ExpenseCreate
        
        # Create category
        category_data = BudgetCategoryCreate(
            name="Test Category",
            allocated_amount=Decimal("1000.00")
        )
        category = await crud_budget.create_budget_category(async_session, category_data, test_event.id)
        
        # Create expenses
        expense1 = ExpenseCreate(
            name="Expense 1",
            amount=Decimal("300.00"),
            is_paid=True,
            category_id=category.id
        )
        expense2 = ExpenseCreate(
            name="Expense 2", 
            amount=Decimal("150.00"),
            is_paid=False,
            category_id=category.id
        )
        await crud_budget.create_expense(async_session, expense1, test_event.id)
        await crud_budget.create_expense(async_session, expense2, test_event.id)
        
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.get(
                f"/api/v1/events/{test_event.id}/budget/summary",
                headers=auth_headers
            )
        
        assert response.status_code == 200
        data = response.json()
        assert "event_id" in data
        assert "total_allocated" in data
        assert "total_spent" in data
        assert "total_paid" in data
        assert "total_unpaid" in data
        assert "remaining_budget" in data
        assert "budget_utilization_percentage" in data
    
    async def test_get_category_spending_summary(self, auth_headers, test_event, async_session):
        """Test getting category spending summary."""
        # Create some test data
        from app.schemas.budget import BudgetCategoryCreate, ExpenseCreate
        
        category_data = BudgetCategoryCreate(
            name="Test Category",
            allocated_amount=Decimal("500.00"),
            color="#FF0000"
        )
        category = await crud_budget.create_budget_category(async_session, category_data, test_event.id)
        
        expense_data = ExpenseCreate(
            name="Test Expense",
            amount=Decimal("200.00"),
            category_id=category.id
        )
        await crud_budget.create_expense(async_session, expense_data, test_event.id)
        
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.get(
                f"/api/v1/events/{test_event.id}/budget/categories-summary",
                headers=auth_headers
            )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if len(data) > 0:
            category_summary = data[0]
            assert "category_name" in category_summary
            assert "allocated_amount" in category_summary
            assert "spent_amount" in category_summary
            assert "remaining_amount" in category_summary
            assert "utilization_percentage" in category_summary
    
    async def test_get_recent_expenses(self, expense_data, auth_headers, test_event, async_session):
        """Test getting recent expenses."""
        # Create a test expense
        from app.schemas.budget import ExpenseCreate
        expense_create = ExpenseCreate(**expense_data)
        await crud_budget.create_expense(async_session, expense_create, test_event.id)
        
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.get(
                f"/api/v1/events/{test_event.id}/expenses/recent",
                params={"limit": 5},
                headers=auth_headers
            )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
    
    async def test_get_expenses_by_category(self, expense_data, auth_headers, test_event, async_session):
        """Test getting expenses by category."""
        # Create category and expense
        from app.schemas.budget import BudgetCategoryCreate, ExpenseCreate
        
        category_data = BudgetCategoryCreate(
            name="Test Category",
            allocated_amount=Decimal("500.00")
        )
        category = await crud_budget.create_budget_category(async_session, category_data, test_event.id)
        
        expense_create = ExpenseCreate(
            **expense_data,
            category_id=category.id
        )
        await crud_budget.create_expense(async_session, expense_create, test_event.id)
        
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.get(
                f"/api/v1/events/categories/{category.id}/expenses",
                headers=auth_headers
            )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert data[0]["name"] == expense_data["name"]
    
    async def test_budget_access_control(self, category_data, auth_headers, async_session):
        """Test that users can only access budget data from their own events."""
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
        
        # Create budget category in other user's event
        from app.schemas.budget import BudgetCategoryCreate
        category_create = BudgetCategoryCreate(**category_data)
        other_category = await crud_budget.create_budget_category(async_session, category_create, other_event.id)
        
        # Try to access other user's budget data
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.get(
                f"/api/v1/events/{other_event.id}/categories/",
                headers=auth_headers
            )
        
        # Should be forbidden or not found
        assert response.status_code in [403, 404]
    
    async def test_invalid_expense_category(self, expense_data, auth_headers, test_event):
        """Test creating expense with invalid category."""
        fake_category_id = str(uuid4())
        expense_data_invalid = expense_data.copy()
        expense_data_invalid["category_id"] = fake_category_id
        
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.post(
                f"/api/v1/events/{test_event.id}/expenses/",
                json=expense_data_invalid,
                headers=auth_headers
            )
        
        assert response.status_code == 400
        assert "Invalid category" in response.json()["detail"]