from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.api.v1.auth import router as auth_router
from app.api.v1.events import router as events_router
from app.api.v1.guests import router as guests_router
from app.api.v1.budget import router as budget_router

settings = get_settings()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Party-Time Event Planning API",
    version="1.0.0",
)

# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    
    # Security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    
    # HSTS header (only for HTTPS in production)
    # Check for production environment via environment variable
    import os
    if os.getenv("ENVIRONMENT", "development") == "production":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
    
    # Content Security Policy (basic)
    response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
    
    return response

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=[
        "Accept",
        "Accept-Language",
        "Content-Language", 
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "X-CSRF-Token",
        "Cache-Control"
    ],
    expose_headers=["*"]
)

# Include routers
app.include_router(auth_router, prefix=f"{settings.API_V1_STR}/auth", tags=["authentication"])
app.include_router(events_router, prefix=f"{settings.API_V1_STR}/events", tags=["events"])
app.include_router(guests_router, prefix=f"{settings.API_V1_STR}/events", tags=["guests"])
app.include_router(budget_router, prefix=f"{settings.API_V1_STR}/events", tags=["budget"])


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Party-Time API is running!",
        "version": "1.0.0",
        "environment": "development"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}