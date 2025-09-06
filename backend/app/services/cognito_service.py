import json
import httpx
import boto3
from jose import jwt, JWTError
from botocore.exceptions import ClientError
from typing import Optional, Dict, Any
import asyncio
import time
import hmac
import hashlib
import base64
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
        
        # Initialize boto3 client for Cognito operations
        self.cognito_client = boto3.client(
            'cognito-idp',
            region_name=self.region,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
        )
    
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
        
        # Handle email_verified claim - it might be boolean, string, or missing
        email_verified = payload.get("email_verified", False)
        
        # Convert string "true"/"false" to boolean if needed
        if isinstance(email_verified, str):
            email_verified = email_verified.lower() == "true"
        
        # For Google users, assume email is verified
        # For email/password users in access tokens, email_verified might not be present
        # so we'll be more lenient and assume verified if it's missing but user has an email
        if is_google_user:
            email_verified = True
        elif email_verified is False and extracted_email and payload.get("token_use") == "access":
            # For access tokens from email/password users, assume verified if email exists
            # The actual verification happens during login, so if they have an access token, they're verified
            email_verified = True
        
        return {
            "user_id": payload.get("sub"),
            "email": extracted_email,
            "name": extracted_name,
            "email_verified": email_verified,
            "username": username,
            "groups": groups,
            "token_use": payload.get("token_use"),
            "is_google_user": is_google_user,
        }
    
    def _calculate_secret_hash(self, username: str) -> str:
        """Calculate secret hash for Cognito client operations"""
        message = bytes(username + self.client_id, 'utf-8')
        key = bytes(self.client_secret, 'utf-8')
        secret_hash = base64.b64encode(
            hmac.new(key, message, digestmod=hashlib.sha256).digest()
        ).decode()
        return secret_hash
    
    async def register_user(self, email: str, password: str, name: str) -> Dict[str, Any]:
        """Register a new user with Cognito"""
        try:
            secret_hash = self._calculate_secret_hash(email)
            
            response = self.cognito_client.sign_up(
                ClientId=self.client_id,
                Username=email,
                Password=password,
                SecretHash=secret_hash,
                UserAttributes=[
                    {
                        'Name': 'email',
                        'Value': email
                    },
                    {
                        'Name': 'name',
                        'Value': name
                    }
                ]
            )
            
            return {
                "user_id": response['UserSub'],
                "email": email,
                "name": name,
                "email_verified": False,
                "username": email,
                "confirmation_delivery": response.get('CodeDeliveryDetails', {})
            }
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            error_message = e.response['Error']['Message']
            
            if error_code == 'UsernameExistsException':
                raise ValueError("User with this email already exists")
            elif error_code == 'InvalidPasswordException':
                raise ValueError("Password does not meet requirements")
            elif error_code == 'InvalidParameterException':
                raise ValueError("Invalid email or parameter format")
            else:
                raise Exception(f"Registration failed: {error_message}")
    
    async def authenticate_user(self, email: str, password: str) -> Dict[str, Any]:
        """Authenticate user with email/password and return JWT tokens"""
        try:
            secret_hash = self._calculate_secret_hash(email)
            
            response = self.cognito_client.initiate_auth(
                ClientId=self.client_id,
                AuthFlow='USER_PASSWORD_AUTH',
                AuthParameters={
                    'USERNAME': email,
                    'PASSWORD': password,
                    'SECRET_HASH': secret_hash
                }
            )
            
            if 'ChallengeName' in response:
                # Handle challenges like NEW_PASSWORD_REQUIRED, MFA, etc.
                challenge_name = response['ChallengeName']
                if challenge_name == 'NEW_PASSWORD_REQUIRED':
                    raise ValueError("New password required. Please reset your password.")
                elif challenge_name == 'SMS_MFA' or challenge_name == 'SOFTWARE_TOKEN_MFA':
                    raise ValueError("MFA challenge required")
                else:
                    raise ValueError(f"Authentication challenge required: {challenge_name}")
            
            auth_result = response['AuthenticationResult']
            
            # Decode ID token to get user info
            id_token = auth_result['IdToken']
            user_info = jwt.get_unverified_claims(id_token)
            
            return {
                "access_token": auth_result['AccessToken'],
                "id_token": id_token,
                "refresh_token": auth_result['RefreshToken'],
                "expires_in": auth_result['ExpiresIn'],
                "user_id": user_info.get('sub'),
                "email": user_info.get('email'),
                "name": user_info.get('name', ''),
                "email_verified": user_info.get('email_verified', False)
            }
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            error_message = e.response['Error']['Message']
            
            if error_code == 'NotAuthorizedException':
                raise ValueError("Incorrect email or password")
            elif error_code == 'UserNotConfirmedException':
                raise ValueError("Email not verified. Please verify your email first.")
            elif error_code == 'UserNotFoundException':
                raise ValueError("User not found. Please check your email or register.")
            elif error_code == 'TooManyRequestsException':
                raise ValueError("Too many login attempts. Please try again later.")
            elif error_code == 'PasswordResetRequiredException':
                raise ValueError("Password reset required. Please reset your password.")
            else:
                raise Exception(f"Authentication failed: {error_message}")
    
    async def confirm_user_email(self, email: str, confirmation_code: str) -> Dict[str, Any]:
        """Confirm user email with verification code"""
        try:
            secret_hash = self._calculate_secret_hash(email)
            
            response = self.cognito_client.confirm_sign_up(
                ClientId=self.client_id,
                Username=email,
                ConfirmationCode=confirmation_code,
                SecretHash=secret_hash
            )
            
            return {
                "confirmed": True,
                "message": "Email verified successfully"
            }
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            error_message = e.response['Error']['Message']
            
            if error_code == 'CodeMismatchException':
                raise ValueError("Invalid verification code")
            elif error_code == 'ExpiredCodeException':
                raise ValueError("Verification code has expired")
            elif error_code == 'UserNotFoundException':
                raise ValueError("User not found")
            else:
                raise Exception(f"Email verification failed: {error_message}")
    
    async def resend_confirmation_code(self, email: str) -> Dict[str, Any]:
        """Resend email verification code"""
        try:
            secret_hash = self._calculate_secret_hash(email)
            
            response = self.cognito_client.resend_confirmation_code(
                ClientId=self.client_id,
                Username=email,
                SecretHash=secret_hash
            )
            
            return {
                "message": "Verification code resent",
                "delivery": response.get('CodeDeliveryDetails', {})
            }
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            error_message = e.response['Error']['Message']
            
            if error_code == 'UserNotFoundException':
                raise ValueError("User not found")
            elif error_code == 'InvalidParameterException':
                raise ValueError("User is already verified")
            else:
                raise Exception(f"Failed to resend code: {error_message}")
    
    async def initiate_password_reset(self, email: str) -> Dict[str, Any]:
        """Initiate password reset process"""
        try:
            secret_hash = self._calculate_secret_hash(email)
            
            response = self.cognito_client.forgot_password(
                ClientId=self.client_id,
                Username=email,
                SecretHash=secret_hash
            )
            
            return {
                "message": "Password reset code sent",
                "delivery": response.get('CodeDeliveryDetails', {})
            }
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            error_message = e.response['Error']['Message']
            
            if error_code == 'UserNotFoundException':
                raise ValueError("User not found")
            elif error_code == 'InvalidParameterException':
                raise ValueError("User is not confirmed or invalid parameter")
            else:
                raise Exception(f"Password reset failed: {error_message}")
    
    async def confirm_password_reset(self, email: str, confirmation_code: str, new_password: str) -> Dict[str, Any]:
        """Confirm password reset with new password"""
        try:
            secret_hash = self._calculate_secret_hash(email)
            
            response = self.cognito_client.confirm_forgot_password(
                ClientId=self.client_id,
                Username=email,
                ConfirmationCode=confirmation_code,
                Password=new_password,
                SecretHash=secret_hash
            )
            
            return {
                "message": "Password reset successfully"
            }
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            error_message = e.response['Error']['Message']
            
            if error_code == 'CodeMismatchException':
                raise ValueError("Invalid confirmation code")
            elif error_code == 'ExpiredCodeException':
                raise ValueError("Confirmation code has expired")
            elif error_code == 'InvalidPasswordException':
                raise ValueError("New password does not meet requirements")
            elif error_code == 'UserNotFoundException':
                raise ValueError("User not found")
            else:
                raise Exception(f"Password reset confirmation failed: {error_message}")
    
    async def get_user_profile(self, access_token: str) -> Dict[str, Any]:
        """Get user profile using access token"""
        try:
            response = self.cognito_client.get_user(
                AccessToken=access_token
            )
            
            # Extract attributes
            attributes = {}
            for attr in response.get('UserAttributes', []):
                attributes[attr['Name']] = attr['Value']
            
            return {
                "user_id": response.get('Username'),
                "email": attributes.get('email'),
                "name": attributes.get('name'),
                "email_verified": attributes.get('email_verified', 'false').lower() == 'true',
                "username": response.get('Username'),
                "created_at": response.get('UserCreateDate').isoformat() if response.get('UserCreateDate') else None,
                "updated_at": response.get('UserLastModifiedDate').isoformat() if response.get('UserLastModifiedDate') else None
            }
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            error_message = e.response['Error']['Message']
            
            if error_code == 'NotAuthorizedException':
                raise ValueError("Invalid access token")
            else:
                raise Exception(f"Failed to get user profile: {error_message}")
    
    async def update_user_profile(self, access_token: str, name: Optional[str] = None) -> Dict[str, Any]:
        """Update user profile attributes"""
        try:
            user_attributes = []
            updated_fields = []
            
            if name is not None:
                user_attributes.append({
                    'Name': 'name',
                    'Value': name
                })
                updated_fields.append('name')
            
            if user_attributes:
                response = self.cognito_client.update_user_attributes(
                    UserAttributes=user_attributes,
                    AccessToken=access_token
                )
            
            return {
                "message": "Profile updated successfully",
                "updated_fields": updated_fields
            }
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            error_message = e.response['Error']['Message']
            
            if error_code == 'NotAuthorizedException':
                raise ValueError("Invalid access token")
            elif error_code == 'InvalidParameterException':
                raise ValueError("Invalid parameter value")
            else:
                raise Exception(f"Profile update failed: {error_message}")


# Global instance
cognito_service = CognitoService()