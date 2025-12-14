from fastapi import APIRouter, Depends, HTTPException, Header
from fastapi.responses import JSONResponse
from typing import Dict, Any, Optional
from app.core.auth import get_current_user, get_current_active_user
from app.schemas.auth import (
    UserRegisterRequest, UserRegisterResponse,
    UserLoginRequest, UserLoginResponse,
    EmailVerificationRequest, EmailVerificationResponse,
    PasswordResetRequest, PasswordResetResponse,
    PasswordResetConfirmRequest, PasswordResetConfirmResponse,
    UserProfileResponse, UserProfileUpdateRequest, UserProfileUpdateResponse,
    AuthErrorResponse
)
from app.services.cognito_service import cognito_service

router = APIRouter()


@router.get("/me/", response_model=Dict[str, Any])
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


@router.get("/protected/")
async def protected_route(current_user: Dict[str, Any] = Depends(get_current_active_user)):
    """
    Example protected route that requires verified email
    """
    return {
        "message": f"Hello {current_user.get('name', 'User')}! This is a protected route.",
        "user_id": current_user.get("user_id")
    }


@router.post("/logout/")
async def logout():
    """
    Logout endpoint - client should discard the JWT token
    In a production app, you might want to add the token to a blacklist
    """
    return {"message": "Successfully logged out. Please discard your token."}


@router.post("/register/", response_model=UserRegisterResponse)
async def register_user(request: UserRegisterRequest):
    """
    Register a new user with email/password
    """
    try:
        result = await cognito_service.register_user(
            email=request.email,
            password=request.password,
            name=request.name
        )
        
        return UserRegisterResponse(
            user_id=result["user_id"],
            email=result["email"],
            name=result["name"],
            email_verified=result["email_verified"],
            message=f"Registration successful. Please check {request.email} for verification code."
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Registration failed. Please try again.")


@router.post("/login/", response_model=UserLoginResponse)
async def login_user(request: UserLoginRequest):
    """
    Authenticate user with email/password and return JWT tokens
    """
    try:
        result = await cognito_service.authenticate_user(
            email=request.email,
            password=request.password
        )
        
        return UserLoginResponse(
            access_token=result["access_token"],
            id_token=result["id_token"],
            refresh_token=result["refresh_token"],
            token_type="Bearer",
            expires_in=result["expires_in"],
            user_id=result["user_id"],
            email=result["email"],
            name=result["name"],
            email_verified=result["email_verified"]
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Authentication failed. Please try again.")


@router.post("/verify-email/", response_model=EmailVerificationResponse)
async def verify_email(request: EmailVerificationRequest):
    """
    Verify user email with confirmation code
    """
    try:
        result = await cognito_service.confirm_user_email(
            email=request.email,
            confirmation_code=request.verification_code
        )
        
        return EmailVerificationResponse(
            message=result["message"],
            verified=result["confirmed"]
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Email verification failed. Please try again.")


@router.post("/resend-verification/", response_model=EmailVerificationResponse)
async def resend_verification_code(request: PasswordResetRequest):
    """
    Resend email verification code
    """
    try:
        result = await cognito_service.resend_confirmation_code(request.email)
        
        return EmailVerificationResponse(
            message=result["message"],
            verified=False
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to resend verification code. Please try again.")


@router.post("/password-reset/", response_model=PasswordResetResponse)
async def initiate_password_reset(request: PasswordResetRequest):
    """
    Initiate password reset process
    """
    try:
        result = await cognito_service.initiate_password_reset(request.email)
        
        return PasswordResetResponse(
            message=result["message"]
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Password reset failed. Please try again.")


@router.post("/password-reset-confirm/", response_model=PasswordResetConfirmResponse)
async def confirm_password_reset(request: PasswordResetConfirmRequest):
    """
    Confirm password reset with new password
    """
    try:
        result = await cognito_service.confirm_password_reset(
            email=request.email,
            confirmation_code=request.confirmation_code,
            new_password=request.new_password
        )
        
        return PasswordResetConfirmResponse(
            message=result["message"]
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Password reset confirmation failed. Please try again.")


@router.get("/profile/", response_model=UserProfileResponse)
async def get_user_profile(authorization: str = Header(...)):
    """
    Get user profile using access token
    """
    try:
        # Extract token from Authorization header
        if not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Invalid authorization header format")
        
        access_token = authorization[7:]  # Remove "Bearer " prefix
        
        result = await cognito_service.get_user_profile(access_token)
        
        return UserProfileResponse(
            user_id=result["user_id"],
            email=result["email"],
            name=result["name"],
            email_verified=result["email_verified"],
            username=result["username"],
            created_at=result.get("created_at")
        )
        
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to get user profile. Please try again.")


@router.put("/profile/", response_model=UserProfileUpdateResponse)
async def update_user_profile(
    request: UserProfileUpdateRequest,
    authorization: str = Header(...)
):
    """
    Update user profile
    """
    try:
        # Extract token from Authorization header
        if not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Invalid authorization header format")
        
        access_token = authorization[7:]  # Remove "Bearer " prefix
        
        result = await cognito_service.update_user_profile(
            access_token=access_token,
            name=request.name
        )
        
        return UserProfileUpdateResponse(
            message=result["message"],
            updated_fields=result["updated_fields"]
        )
        
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Profile update failed. Please try again.")