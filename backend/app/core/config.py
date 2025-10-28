from functools import lru_cache
from typing import List, Optional
import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Application
    PROJECT_NAME: str = "Party-Time"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str
    
    # Database
    DATABASE_URL: str
    
    # AWS Configuration
    AWS_REGION: str = "us-east-1"
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    
    # AWS Cognito
    COGNITO_USER_POOL_ID: Optional[str] = None
    COGNITO_CLIENT_ID: Optional[str] = None
    COGNITO_CLIENT_SECRET: Optional[str] = None
    COGNITO_REGION: str = "us-east-1"
    COGNITO_DOMAIN: Optional[str] = None

    # Google OAuth
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None

    """
    
    FR-7: The system shall send email invitations
    5.2.1: Email Service Setup

    """

    # AWS SES
    SES_FROM_EMAIL: Optional[str] = None
    SES_FROM_NAME: str = "Party-Time"
    SES_REGION: str = "us-east-1"

    # Redis & Celery
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: Optional[str] = None
    CELERY_RESULT_BACKEND: Optional[str] = None

    # Email Settings
    EMAIL_ENABLED: bool = True
    EMAIL_MAX_RETRIES: int = 3
    EMAIL_RETRY_DELAY: int = 300  # 5 minutes in seconds

    # Frontend URL (for email links and redirects)
    FRONTEND_URL: str = "http://localhost:3000"

    # JWT Configuration
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "http://localhost:3001",  # For test environments
        "http://127.0.0.1:3001"
    ]
    
    class Config:
        env_file = ".env"
        extra = "allow"


@lru_cache()
def get_settings():
    return Settings()