from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
import re


class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    name: str = Field(..., min_length=1, max_length=100)
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one number')
        return v
    
    @validator('name')
    def validate_name(cls, v):
        if not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip()


class UserRegisterResponse(BaseModel):
    user_id: str
    email: str
    name: str
    email_verified: bool
    message: str


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)


class UserLoginResponse(BaseModel):
    access_token: str
    id_token: str
    refresh_token: str
    token_type: str = "Bearer"
    expires_in: int
    user_id: str
    email: str
    name: str
    email_verified: bool


class EmailVerificationRequest(BaseModel):
    email: EmailStr
    verification_code: str = Field(..., min_length=6, max_length=6)


class EmailVerificationResponse(BaseModel):
    message: str
    verified: bool


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetResponse(BaseModel):
    message: str


class PasswordResetConfirmRequest(BaseModel):
    email: EmailStr
    confirmation_code: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=8, max_length=128)
    
    @validator('new_password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one number')
        return v


class PasswordResetConfirmResponse(BaseModel):
    message: str


class UserProfileResponse(BaseModel):
    user_id: str
    email: str
    name: str
    email_verified: bool
    username: Optional[str] = None
    groups: List[str] = []
    is_google_user: bool = False
    created_at: Optional[str] = None


class UserProfileUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    
    @validator('name')
    def validate_name(cls, v):
        if v is not None and not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip() if v else v


class UserProfileUpdateResponse(BaseModel):
    message: str
    updated_fields: List[str]


class AuthErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None