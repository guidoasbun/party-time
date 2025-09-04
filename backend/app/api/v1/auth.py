from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any
from app.core.auth import get_current_user, get_current_active_user

router = APIRouter()


@router.get("/me", response_model=Dict[str, Any])
async def get_current_user_info(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Get current user information from JWT token
    """
    return {
        "user_id": current_user.get("user_id"),
        "email": current_user.get("email"),
        "name": current_user.get("name"),
        "email_verified": current_user.get("email_verified"),
        "username": current_user.get("username"),
        "groups": current_user.get("groups", []),
    }


@router.get("/protected")
async def protected_route(current_user: Dict[str, Any] = Depends(get_current_active_user)):
    """
    Example protected route that requires verified email
    """
    return {
        "message": f"Hello {current_user.get('name', 'User')}! This is a protected route.",
        "user_id": current_user.get("user_id")
    }


@router.post("/logout")
async def logout():
    """
    Logout endpoint - client should discard the JWT token
    In a production app, you might want to add the token to a blacklist
    """
    return {"message": "Successfully logged out. Please discard your token."}