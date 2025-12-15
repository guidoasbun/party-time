"""
FR-21: The system shall provide an interactive seating chart interface.
FR-22: The system shall be deployed on AWS Infrastructure.
Phase 6: 6.1.2 Seating Chart API Endpoints
Phase 9.1: Performance Optimization - Added response timing middleware
Phase 7: Monitoring - Added X-Ray tracing and enhanced health checks
"""
import logging
import os
import time
from datetime import datetime, timezone

from fastapi import FastAPI, Request
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware
from app.core.config import get_settings

# Phase 7: X-Ray tracing middleware
from app.middleware.xray import XRayMiddleware, XRAY_ENABLED

logger = logging.getLogger(__name__)
from app.api.v1.auth import router as auth_router
from app.api.v1.events import router as events_router
from app.api.v1.guests import router as guests_router
from app.api.v1.budget import router as budget_router
from app.api.v1.rsvp import router as rsvp_router
from app.api.v1.emails import router as emails_router
from app.api.v1.seating import router as seating_router
from app.api.v1.venues import router as venues_router

settings = get_settings()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Party-Time Event Planning API",
    version="1.0.0",
    redirect_slashes=False,  # Disable to avoid HTTP redirect issues behind CloudFront
)

# ProxyHeadersMiddleware: Respect X-Forwarded-Proto header from CloudFront/ALB
# This ensures redirects (like trailing slash redirects) use HTTPS instead of HTTP
# when the app is behind a reverse proxy that terminates SSL
app.add_middleware(ProxyHeadersMiddleware, trusted_hosts=["*"])

# Phase 7: X-Ray tracing middleware (must be early in chain)
if XRAY_ENABLED:
    app.add_middleware(XRayMiddleware)
    logger.info("X-Ray tracing middleware enabled")


# CloudFront forwards CloudFront-Forwarded-Proto instead of X-Forwarded-Proto
# This middleware copies it to X-Forwarded-Proto so ProxyHeadersMiddleware can use it
@app.middleware("http")
async def cloudfront_proto_header(request: Request, call_next):
    """Copy CloudFront-Forwarded-Proto to X-Forwarded-Proto for proper HTTPS detection."""
    cf_proto = request.headers.get("cloudfront-forwarded-proto")
    if cf_proto and not request.headers.get("x-forwarded-proto"):
        # Create mutable headers
        request.scope["headers"] = [
            (k, v) for k, v in request.scope["headers"]
            if k.lower() != b"x-forwarded-proto"
        ] + [(b"x-forwarded-proto", cf_proto.encode())]
    return await call_next(request)

# Phase 9.1: Performance Optimization - Response timing middleware
@app.middleware("http")
async def add_timing_header(request: Request, call_next):
    """Add X-Response-Time header and log slow requests."""
    start_time = time.perf_counter()

    response = await call_next(request)

    process_time = (time.perf_counter() - start_time) * 1000
    response.headers["X-Response-Time"] = f"{process_time:.2f}ms"

    # Log slow requests (> 500ms)
    if process_time > 500:
        logger.warning(
            f"Slow request: {request.method} {request.url.path} "
            f"took {process_time:.2f}ms"
        )

    return response


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
    # Note: cdn.jsdelivr.net is required for Swagger UI to load
    response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data: https:; font-src 'self' data:;"

    return response

# Include routers
app.include_router(auth_router, prefix=f"{settings.API_V1_STR}/auth", tags=["authentication"])
app.include_router(events_router, prefix=f"{settings.API_V1_STR}/events", tags=["events"])
app.include_router(guests_router, prefix=f"{settings.API_V1_STR}/events", tags=["guests"])
app.include_router(budget_router, prefix=f"{settings.API_V1_STR}/events", tags=["budget"])
app.include_router(rsvp_router, prefix=settings.API_V1_STR, tags=["rsvp"])
app.include_router(emails_router, prefix=f"{settings.API_V1_STR}/emails", tags=["emails"])
app.include_router(seating_router, prefix=f"{settings.API_V1_STR}/events", tags=["seating"])
app.include_router(venues_router, prefix=f"{settings.API_V1_STR}/venues", tags=["venues"])


@app.get("/")
async def root():
    """Root endpoint with basic API info"""
    return {
        "message": "Party-Time API is running!",
        "version": "1.0.0",
        "environment": os.getenv("ENVIRONMENT", "development")
    }


@app.get("/health")
async def health_check():
    """
    Enhanced health check endpoint with dependency verification.

    Phase 7: Monitoring - Provides detailed health status for:
    - Overall application health
    - Database connectivity
    - Redis/cache connectivity
    - Environment information

    Returns:
        JSON with health status and individual service checks
    """
    checks = {}
    overall_healthy = True

    # Check database connection
    try:
        from app.db.session import engine
        from sqlalchemy import text

        start = time.perf_counter()
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        latency = (time.perf_counter() - start) * 1000
        checks["database"] = {"status": "healthy", "latency_ms": round(latency, 2)}
    except Exception as e:
        checks["database"] = {"status": "unhealthy", "error": str(e)[:100]}
        overall_healthy = False

    # Check Redis connection
    try:
        from app.core.cache import cache_manager

        start = time.perf_counter()
        redis_client = await cache_manager.get_redis(db=0)
        if redis_client:
            await redis_client.ping()
            latency = (time.perf_counter() - start) * 1000
            checks["redis"] = {"status": "healthy", "latency_ms": round(latency, 2)}
        else:
            checks["redis"] = {"status": "not_configured", "message": "Redis not available"}
    except Exception as e:
        checks["redis"] = {"status": "degraded", "error": str(e)[:100]}
        # Redis failure is degraded, not critical for health check

    return {
        "status": "healthy" if overall_healthy else "unhealthy",
        "checks": checks,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "1.0.0",
        "environment": os.getenv("ENVIRONMENT", "development"),
        "xray_enabled": XRAY_ENABLED
    }


@app.get("/ready")
async def readiness_probe():
    """
    Readiness probe for container orchestration (ECS/Kubernetes).

    Returns 200 when the application is ready to accept traffic.
    """
    return {"ready": True}


@app.get("/live")
async def liveness_probe():
    """
    Liveness probe for container orchestration (ECS/Kubernetes).

    Returns 200 when the application process is alive.
    """
    return {"alive": True}