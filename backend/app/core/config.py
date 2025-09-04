from functools import lru_cache
from typing import List
import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Application
    PROJECT_NAME: str = "Party-Time"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "party-time-dev-secret-key-2024"
    
    # Database
    DATABASE_URL: str = "postgresql://party_admin:party_secure_2024@localhost:5432/party_time"
    
    # AWS Configuration
    AWS_REGION: str = "us-east-1"
    AWS_ACCESS_KEY_ID: str = "dev-placeholder"
    AWS_SECRET_ACCESS_KEY: str = "dev-placeholder"
    
    # AWS Cognito
    COGNITO_USER_POOL_ID: str = "us-east-1_q6asPG962"
    COGNITO_CLIENT_ID: str = "3sk5doi3dv8rml3vv3bs3kr2h3"
    COGNITO_CLIENT_SECRET: str = "1msm0tncnlvk0h20ius95vsblcvj1ant7ufg4420vfm8lvo7bppq"
    COGNITO_REGION: str = "us-east-1"
    COGNITO_DOMAIN: str = "https://us-east-1q6aspg962.auth.us-east-1.amazoncognito.com"
    
    # JWT Configuration
    JWT_SECRET_KEY: str = "party-time-jwt-dev-secret-2024"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    class Config:
        env_file = ".env"
        extra = "allow"


@lru_cache()
def get_settings():
    return Settings()