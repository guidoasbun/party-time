import os
import requests
from typing import Dict, Any, Optional
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import logging

logger = logging.getLogger(__name__)

class GoogleOAuthService:
    def __init__(self):
        self.client_id = os.getenv('GOOGLE_CLIENT_ID')
        self.client_secret = os.getenv('GOOGLE_CLIENT_SECRET')
        
        if not self.client_id or not self.client_secret:
            logger.warning("Google OAuth credentials not found in environment variables")
    
    async def verify_google_token(self, token: str) -> Optional[Dict[str, Any]]:
        """
        Verify Google OAuth ID token and return user information
        """
        try:
            # Verify the token with Google
            idinfo = id_token.verify_oauth2_token(
                token, 
                google_requests.Request(), 
                self.client_id
            )
            
            # Verify the issuer
            if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                logger.error(f"Invalid token issuer: {idinfo['iss']}")
                return None
            
            # Extract user information
            user_info = {
                'user_id': idinfo['sub'],
                'email': idinfo['email'],
                'name': idinfo.get('name', ''),
                'given_name': idinfo.get('given_name', ''),
                'family_name': idinfo.get('family_name', ''),
                'picture': idinfo.get('picture', ''),
                'email_verified': idinfo.get('email_verified', False),
                'provider': 'google',
                'username': idinfo['email'].split('@')[0],  # Use email prefix as username
                'groups': ['user']  # Default group for Google OAuth users
            }
            
            logger.info(f"✅ Google token verified for user: {user_info['email']}")
            return user_info
            
        except ValueError as e:
            logger.error(f"❌ Google token verification failed: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"❌ Unexpected error during Google token verification: {str(e)}")
            return None
    
    async def verify_google_access_token(self, access_token: str) -> Optional[Dict[str, Any]]:
        """
        Verify Google OAuth access token by calling Google's userinfo endpoint
        """
        try:
            # Call Google's userinfo endpoint
            response = requests.get(
                'https://www.googleapis.com/oauth2/v2/userinfo',
                headers={'Authorization': f'Bearer {access_token}'},
                timeout=10
            )
            
            if response.status_code != 200:
                logger.error(f"❌ Google userinfo API returned {response.status_code}")
                return None
            
            userinfo = response.json()
            
            # Transform to our expected format
            user_info = {
                'user_id': userinfo['id'],
                'email': userinfo['email'],
                'name': userinfo.get('name', ''),
                'given_name': userinfo.get('given_name', ''),
                'family_name': userinfo.get('family_name', ''),
                'picture': userinfo.get('picture', ''),
                'email_verified': userinfo.get('verified_email', False),
                'provider': 'google',
                'username': userinfo['email'].split('@')[0],
                'groups': ['user']
            }
            
            logger.info(f"✅ Google access token verified for user: {user_info['email']}")
            return user_info
            
        except requests.exceptions.RequestException as e:
            logger.error(f"❌ Network error during Google access token verification: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"❌ Unexpected error during Google access token verification: {str(e)}")
            return None

# Global service instance
google_oauth_service = GoogleOAuthService()