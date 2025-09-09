"""Pydantic schemas for user management."""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict
from app.models.user import UserRole


class UserBase(BaseModel):
    """Base user schema with common fields."""
    email: EmailStr
    first_name: str
    last_name: str
    phone: Optional[str] = None
    timezone: str = "UTC"


class UserCreate(UserBase):
    """Schema for creating a new user."""
    role: UserRole = UserRole.GUEST


class UserUpdate(BaseModel):
    """Schema for updating user information."""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    timezone: Optional[str] = None
    is_active: Optional[bool] = None


class UserInDBBase(UserBase):
    """Base schema for user data from database."""
    model_config = ConfigDict(from_attributes=True)
    
    id: str  # UUID as string
    role: UserRole
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None


class User(UserInDBBase):
    """Schema for user response (public data)."""
    pass


class UserInDB(UserInDBBase):
    """Schema for user data in database (internal use)."""
    pass