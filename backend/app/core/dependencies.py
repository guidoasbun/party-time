"""FastAPI dependencies for dependency injection."""
from functools import lru_cache
from typing import AsyncGenerator, Optional
from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from jose import JWTError, jwt

from app.core.config import Settings, get_settings
from app.db.session import get_async_session
from app.models.user import User
from app.schemas.auth import TokenData


@lru_cache()
def get_settings_cached():
    """Get cached application settings."""
    return Settings()


async def get_current_user(
    # token: str = Depends(get_settings),  # This will be updated when auth is implemented
    # db: AsyncSession = Depends(get_async_session)
) -> dict:
    """
    Get current authenticated user from JWT token.
    This is a placeholder - will be implemented when JWT auth is ready.
    """
    # TODO: Implement JWT token validation
    # For now, return a mock user for API testing
    return {
        "user_id": "123e4567-e89b-12d3-a456-426614174000",  # Mock UUID
        "email": "test@example.com",
        "name": "Test User",
        "email_verified": True,
        "username": "testuser",
        "groups": ["planner"],
        "role": "planner"
    }


async def get_current_active_user(
    current_user: dict = Depends(get_current_user)
) -> dict:
    """Get current active user (must be verified and active)."""
    # For now, all mock users are active
    return current_user


async def get_current_planner_user(
    current_user: dict = Depends(get_current_active_user)
) -> dict:
    """Get current user with planner or admin role."""
    if current_user.get("role") not in ["planner", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user


async def get_current_admin_user(
    current_user: dict = Depends(get_current_active_user)
) -> dict:
    """Get current user with admin role."""
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Get database session."""
    async for session in get_async_session():
        yield session