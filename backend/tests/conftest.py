"""
Pytest configuration and fixtures for the Party-Time backend tests.
"""
import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, MagicMock, patch
from typing import Dict, Any, AsyncGenerator
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from app.main import app
from app.core.config import Settings
from app.db.base import Base


@pytest.fixture(scope="session")
def test_settings():
    """Override settings for testing."""
    return Settings(
        PROJECT_NAME="Party-Time Test",
        API_V1_STR="/api/v1",
        SECRET_KEY="test-secret-key",
        DATABASE_URL="sqlite:///./test_party_time.db",
        AWS_REGION="us-east-1",
        AWS_ACCESS_KEY_ID="test-key",
        AWS_SECRET_ACCESS_KEY="test-secret",
        COGNITO_USER_POOL_ID="test-pool-id",
        COGNITO_CLIENT_ID="test-client-id",
        COGNITO_CLIENT_SECRET="test-client-secret",
        COGNITO_REGION="us-east-1",
        COGNITO_DOMAIN="https://test.amazoncognito.com",
        JWT_SECRET_KEY="test-jwt-secret",
        JWT_ALGORITHM="HS256",
        ACCESS_TOKEN_EXPIRE_MINUTES=30,
        CORS_ORIGINS=["http://localhost:3000", "http://testserver"],
    )


@pytest.fixture(scope="session")
def client(test_settings):
    """Create a test client for the FastAPI app."""
    with patch("app.core.config.get_settings", return_value=test_settings):
        with TestClient(app) as test_client:
            yield test_client


@pytest.fixture
def mock_cognito_service():
    """Mock the Cognito service for testing."""
    mock = MagicMock()
    
    # Mock successful responses
    mock.register_user = AsyncMock(return_value={
        "user_id": "test-user-123",
        "email": "test@example.com",
        "username": "testuser"
    })
    
    mock.authenticate_user = AsyncMock(return_value={
        "access_token": "test-access-token",
        "refresh_token": "test-refresh-token",
        "token_type": "Bearer",
        "expires_in": 3600
    })
    
    mock.verify_email = AsyncMock(return_value={"message": "Email verified successfully"})
    mock.reset_password = AsyncMock(return_value={"message": "Password reset initiated"})
    mock.confirm_password_reset = AsyncMock(return_value={"message": "Password reset successfully"})
    
    return mock


@pytest.fixture
def valid_jwt_token():
    """Create a valid JWT token for testing."""
    return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXItMTIzIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwibmFtZSI6IlRlc3QgVXNlciIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJ1c2VybmFtZSI6InRlc3R1c2VyIiwiZ3JvdXBzIjpbXSwidXNlcl9pZCI6InRlc3QtdXNlci0xMjMifQ"


@pytest.fixture
def mock_user():
    """Mock authenticated user data."""
    return {
        "user_id": "test-user-123",
        "email": "test@example.com",
        "name": "Test User",
        "email_verified": True,
        "username": "testuser",
        "groups": []
    }


@pytest.fixture
def auth_headers(valid_jwt_token):
    """Create authentication headers with valid JWT token."""
    return {"Authorization": f"Bearer {valid_jwt_token}"}


@pytest.fixture(autouse=True)
def setup_test_environment():
    """Set up test environment variables."""
    os.environ["ENVIRONMENT"] = "test"
    yield
    # Cleanup if needed
    if "ENVIRONMENT" in os.environ:
        del os.environ["ENVIRONMENT"]


@pytest.fixture
def mock_get_current_user(mock_user):
    """Mock the get_current_user dependency."""
    def _mock_get_current_user():
        return mock_user
    return _mock_get_current_user


@pytest.fixture
def mock_get_current_active_user(mock_user):
    """Mock the get_current_active_user dependency."""
    def _mock_get_current_active_user():
        return mock_user
    return _mock_get_current_active_user


@pytest.fixture
def test_credentials():
    """Real test credentials for Cognito integration testing."""
    return {
        "email": "guido@asbun.io",
        "password": "Baarracuda007!!",
        "username": "guido",
        "name": "Guido Asbun"
    }


@pytest.fixture
def real_cognito_service():
    """Real Cognito service for integration testing (not mocked)."""
    from app.services.cognito_service import cognito_service
    return cognito_service


# Database fixtures for testing
@pytest_asyncio.fixture
async def async_engine():
    """Create async test database engine."""
    # Use in-memory SQLite for tests (faster)
    # Note: Some PostgreSQL-specific features may not work
    SQLALCHEMY_DATABASE_URL = "sqlite+aiosqlite:///:memory:"
    
    engine = create_async_engine(
        SQLALCHEMY_DATABASE_URL,
        echo=False,
        future=True
    )
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield engine
    
    await engine.dispose()


@pytest_asyncio.fixture
async def async_session(async_engine) -> AsyncGenerator[AsyncSession, None]:
    """Create async database session for tests."""
    async_session_maker = async_sessionmaker(
        async_engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False,
    )
    
    async with async_session_maker() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture
async def async_session_with_commit(async_engine) -> AsyncGenerator[AsyncSession, None]:
    """Create async database session that commits (for testing commits)."""
    async_session_maker = async_sessionmaker(
        async_engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False,
    )
    
    async with async_session_maker() as session:
        yield session