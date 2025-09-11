"""CRUD operations for User model."""
from typing import Optional, List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from sqlalchemy.orm import selectinload

from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserUpdate


async def create_user(db: AsyncSession, user_data: UserCreate) -> User:
    """Create a new user."""
    db_user = User(
        email=user_data.email,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        phone=user_data.phone,
        timezone=user_data.timezone,
        role=user_data.role
    )
    db.add(db_user)
    await db.flush()
    await db.refresh(db_user)
    return db_user


async def get_user_by_id(db: AsyncSession, user_id: UUID) -> Optional[User]:
    """Get user by ID."""
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    """Get user by email."""
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def get_users(
    db: AsyncSession, 
    skip: int = 0, 
    limit: int = 100,
    role: Optional[UserRole] = None,
    is_active: Optional[bool] = None
) -> List[User]:
    """Get users with optional filtering."""
    query = select(User)
    
    if role:
        query = query.where(User.role == role)
    if is_active is not None:
        query = query.where(User.is_active == is_active)
    
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


async def update_user(db: AsyncSession, user_id: UUID, user_data: UserUpdate) -> Optional[User]:
    """Update user information."""
    update_data = user_data.model_dump(exclude_unset=True)
    if not update_data:
        return await get_user_by_id(db, user_id)
    
    await db.execute(
        update(User)
        .where(User.id == user_id)
        .values(**update_data)
    )
    return await get_user_by_id(db, user_id)


async def delete_user(db: AsyncSession, user_id: UUID) -> bool:
    """Delete a user."""
    result = await db.execute(delete(User).where(User.id == user_id))
    return result.rowcount > 0


async def activate_user(db: AsyncSession, user_id: UUID) -> Optional[User]:
    """Activate a user account."""
    await db.execute(
        update(User)
        .where(User.id == user_id)
        .values(is_active=True)
    )
    return await get_user_by_id(db, user_id)


async def deactivate_user(db: AsyncSession, user_id: UUID) -> Optional[User]:
    """Deactivate a user account."""
    await db.execute(
        update(User)
        .where(User.id == user_id)
        .values(is_active=False)
    )
    return await get_user_by_id(db, user_id)


async def verify_user_email(db: AsyncSession, user_id: UUID) -> Optional[User]:
    """Mark user email as verified."""
    await db.execute(
        update(User)
        .where(User.id == user_id)
        .values(is_verified=True)
    )
    return await get_user_by_id(db, user_id)