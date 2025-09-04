import json
import httpx
from jose import jwt, JWTError
from typing import Optional, Dict, Any
import asyncio
import time
from app.core.config import get_settings

settings = get_settings()


class CognitoService:
    def __init__(self):
        self.user_pool_id = settings.COGNITO_USER_POOL_ID
        self.client_id = settings.COGNITO_CLIENT_ID
        self.client_secret = settings.COGNITO_CLIENT_SECRET
        self.region = settings.COGNITO_REGION
        self.jwks_url = f"https://cognito-idp.{self.region}.amazonaws.com/{self.user_pool_id}/.well-known/jwks.json"
        self.issuer = f"https://cognito-idp.{self.region}.amazonaws.com/{self.user_pool_id}"
        self._jwks_cache = None
        self._jwks_cache_time = 0
        self._cache_duration = 3600  # Cache for 1 hour
    
    async def get_jwks(self) -> Dict[str, Any]:
        """Fetch and cache JWKS from Cognito"""
        current_time = time.time()
        
        # Return cached JWKS if still valid
        if self._jwks_cache and (current_time - self._jwks_cache_time) < self._cache_duration:
            return self._jwks_cache
        
        # Fetch new JWKS
        async with httpx.AsyncClient() as client:
            response = await client.get(self.jwks_url)
            response.raise_for_status()
            self._jwks_cache = response.json()
            self._jwks_cache_time = current_time
            return self._jwks_cache
    
    async def verify_jwt_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify JWT token from Cognito"""
        try:
            # Get JWKS
            jwks = await self.get_jwks()
            
            # Decode header to get kid
            unverified_header = jwt.get_unverified_header(token)
            kid = unverified_header.get("kid")
            
            if not kid:
                print("❌ No kid in token header")
                return None
            
            # Find the correct key
            key = None
            for jwk in jwks.get("keys", []):
                if jwk.get("kid") == kid:
                    key = jwk
                    break
            
            if not key:
                print(f"❌ Key not found for kid: {kid}")
                return None
            
            # Verify and decode the token
            # Try with client_id audience first (for access tokens)
            try:
                payload = jwt.decode(
                    token,
                    key,
                    algorithms=["RS256"],
                    audience=self.client_id,
                    issuer=self.issuer
                )
                print(f"✅ Token validated as ACCESS token")
                return payload
            except JWTError as e1:
                print(f"⚠️  Access token validation failed: {e1}")
                # If that fails, try without audience validation (for ID tokens)
                try:
                    payload = jwt.decode(
                        token,
                        key,
                        algorithms=["RS256"],
                        issuer=self.issuer,
                        options={
                            "verify_aud": False,
                            "verify_at_hash": False  # Disable at_hash validation for ID tokens
                        }
                    )
                    print(f"✅ Token validated as ID token")
                    return payload
                except JWTError as e2:
                    print(f"❌ ID token validation also failed: {e2}")
                    return None
            
        except JWTError as e:
            print(f"❌ JWT Error: {e}")
            return None
        except Exception as e:
            print(f"❌ General Error: {e}")
            return None
    
    def get_user_info_from_token(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Extract user information from token payload"""
        # Check if user is from Google OAuth (has Google group)
        groups = payload.get("cognito:groups", [])
        is_google_user = any("Google" in group for group in groups)
        
        # Extract user information from token
        username = payload.get("cognito:username", "")
        
        # Get name and email from token (more likely in ID token)
        extracted_name = payload.get("name") or payload.get("given_name") or payload.get("nickname")
        extracted_email = payload.get("email")
        
        # For Google users, provide better fallback info
        if is_google_user and not extracted_name:
            extracted_name = "Google User"
        
        return {
            "user_id": payload.get("sub"),
            "email": extracted_email,
            "name": extracted_name,
            "email_verified": payload.get("email_verified", is_google_user),
            "username": username,
            "groups": groups,
            "token_use": payload.get("token_use"),
            "is_google_user": is_google_user,
        }


# Global instance
cognito_service = CognitoService()