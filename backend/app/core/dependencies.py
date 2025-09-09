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
    token: str = Depends(get_settings),  # This will be updated when auth is implemented
    db: AsyncSession = Depends(get_async_session)
) -> User:
    """
    Get current authenticated user from JWT token.
    This is a placeholder - will be implemented when JWT auth is ready.
    """
    # TODO: Implement JWT token validation
    # For now, return None - this will be updated in auth implementation
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication not yet implemented",
        headers={"WWW-Authenticate": "Bearer"},
    )


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Get current active user (must be verified and active)."""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Inactive user"
        )
    return current_user


async def get_current_planner_user(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """Get current user with planner or admin role."""
    if current_user.role not in ["planner", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user


async def get_current_admin_user(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """Get current user with admin role."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user