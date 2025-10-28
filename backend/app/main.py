from fastapi import FastAPI, Request
from app.core.config import get_settings
from app.api.v1.auth import router as auth_router
from app.api.v1.events import router as events_router
from app.api.v1.guests import router as guests_router
from app.api.v1.budget import router as budget_router
from app.api.v1.rsvp import router as rsvp_router
from app.api.v1.emails import router as emails_router

settings = get_settings()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Party-Time Event Planning API",
    version="1.0.0",
)

# Complete CORS and OPTIONS handling middleware
@app.middleware("http")
async def handle_cors_and_security(request: Request, call_next):
    # Handle OPTIONS requests for CORS preflight
    if request.method == "OPTIONS":
        from fastapi.responses import Response
        response = Response()
        response.headers["Access-Control-Allow-Origin"] = "http://localhost:3000"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, PATCH, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Accept, Accept-Language, Authorization, Cache-Control, Content-Language, Content-Type, X-CSRF-Token, X-Requested-With, X-Request-Timestamp"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Max-Age"] = "600"
        return response

    # Process the request
    response = await call_next(request)

    # Add CORS headers to all responses, including redirects
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:3000"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Accept, Accept-Language, Authorization, Cache-Control, Content-Language, Content-Type, X-CSRF-Token, X-Requested-With, X-Request-Timestamp"
    response.headers["Vary"] = "Origin"

    # Security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

    # HSTS header (only for HTTPS in production)
    import os
    if os.getenv("ENVIRONMENT", "development") == "production":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"

    # Content Security Policy (basic)
    response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"

    return response

# Include routers
app.include_router(auth_router, prefix=f"{settings.API_V1_STR}/auth", tags=["authentication"])
app.include_router(events_router, prefix=f"{settings.API_V1_STR}/events", tags=["events"])
app.include_router(guests_router, prefix=f"{settings.API_V1_STR}/events", tags=["guests"])
app.include_router(budget_router, prefix=f"{settings.API_V1_STR}/events", tags=["budget"])
app.include_router(rsvp_router, prefix=settings.API_V1_STR, tags=["rsvp"])
app.include_router(emails_router, prefix=f"{settings.API_V1_STR}/emails", tags=["emails"])


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