from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, Dict, Any
from app.services.cognito_service import cognito_service
from app.services.google_oauth_service import google_oauth_service
import logging

logger = logging.getLogger(__name__)
security = HTTPBearer()


class AuthError(Exception):
    def __init__(self, error: str, status_code: int):
        self.error = error
        self.status_code = status_code



async def _verify_token(token: str) -> Dict[str, Any]:
    """
    Helper function to verify JWT token.
    Supports both AWS Cognito and Google OAuth tokens.
    """
    
    # Try Cognito verification first
    try:
        logger.info("Attempting Cognito token verification...")
        payload = await cognito_service.verify_jwt_token(token)
        
        if payload:
            user_info = cognito_service.get_user_info_from_token(payload)
            if user_info.get("user_id"):
                logger.info(f"Cognito token verified for user: {user_info.get('email')}")
                return user_info
    except Exception as e:
        logger.info(f"Cognito verification failed: {str(e)}")
    
    # If Cognito fails, try Google ID token verification
    try:
        logger.info("🔄 Attempting Google ID token verification...")
        user_info = await google_oauth_service.verify_google_token(token)
        
        if user_info and user_info.get("user_id"):
            logger.info(f"Google ID token verified for user: {user_info.get('email')}")
            return user_info
    except Exception as e:
        logger.info(f"Google ID token verification failed: {str(e)}")
    
    # If ID token fails, try Google access token verification
    try:
        logger.info("Attempting Google access token verification...")
        user_info = await google_oauth_service.verify_google_access_token(token)
        
        if user_info and user_info.get("user_id"):
            logger.info(f"Google access token verified for user: {user_info.get('email')}")
            return user_info
    except Exception as e:
        logger.info(f"Google access token verification failed: {str(e)}")
    
    # If all verification methods fail, raise unauthorized
    logger.error("All token verification methods failed")
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials - token verification failed",
        headers={"WWW-Authenticate": "Bearer"},
    )

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """
    Dependency to get current authenticated user from JWT token.
    Supports both AWS Cognito and Google OAuth tokens.
    """
    return await _verify_token(credentials.credentials)


async def get_current_active_user(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """
    Dependency to get current active user (email verified)
    """
    if not current_user.get("email_verified"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email not verified"
        )
    
    return current_user


def require_role(required_role: str):
    """
    Dependency factory to require specific user role
    Usage: @app.get("/admin", dependencies=[Depends(require_role("admin"))])
    """
    def role_checker(current_user: Dict[str, Any] = Depends(get_current_active_user)):
        user_groups = current_user.get("groups", [])
        if required_role not in user_groups:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return current_user
    
    return role_checker