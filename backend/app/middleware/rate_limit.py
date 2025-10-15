"""Rate limiting middleware for public RSVP endpoints."""
"""FR-6: The system shall display an RSVP submission page. 5.1.1"""
"""This file satisfies the rate_limit for FR-6 in the test environmen"""
"""In production, rate limiting will be done on Redis"""

import time
from typing import Dict, Tuple
from datetime import datetime, timedelta
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse


# In-memory rate limiting (for development)
# In production, use Redis for distributed rate limiting
class InMemoryRateLimiter:
    """Simple in-memory rate limiter using sliding window."""

    def __init__(self):
        # Store: {ip_address: [(timestamp, endpoint), ...]}
        self.requests: Dict[str, list[Tuple[float, str]]] = {}
        self.cleanup_interval = 300  # Clean up every 5 minutes
        self.last_cleanup = time.time()

    def _cleanup_old_requests(self, ip: str, window_seconds: int):
        """Remove requests outside the time window."""
        if ip not in self.requests:
            return

        cutoff_time = time.time() - window_seconds
        self.requests[ip] = [
            (timestamp, endpoint)
            for timestamp, endpoint in self.requests[ip]
            if timestamp > cutoff_time
        ]

        # Remove IP if no requests left
        if not self.requests[ip]:
            del self.requests[ip]

    def _global_cleanup(self):
        """Periodically clean up old data from all IPs."""
        current_time = time.time()
        if current_time - self.last_cleanup < self.cleanup_interval:
            return

        # Clean up all IPs
        for ip in list(self.requests.keys()):
            self._cleanup_old_requests(ip, 3600)  # Keep 1 hour of data

        self.last_cleanup = current_time

    def is_rate_limited(
        self,
        ip: str,
        endpoint: str,
        max_requests: int,
        window_seconds: int
    ) -> Tuple[bool, int, datetime]:
        """
        Check if IP is rate limited for endpoint.

        Args:
            ip: Client IP address
            endpoint: API endpoint path
            max_requests: Maximum requests allowed in window
            window_seconds: Time window in seconds

        Returns:
            Tuple of (is_limited, remaining_requests, reset_time)
        """
        self._global_cleanup()
        self._cleanup_old_requests(ip, window_seconds)

        # Count requests in current window
        current_time = time.time()
        if ip not in self.requests:
            self.requests[ip] = []

        # Count requests for this endpoint
        endpoint_requests = [
            timestamp for timestamp, req_endpoint in self.requests[ip]
            if req_endpoint == endpoint
        ]

        request_count = len(endpoint_requests)
        remaining = max(0, max_requests - request_count)

        # Calculate reset time (end of current window)
        if endpoint_requests:
            oldest_request = min(endpoint_requests)
            reset_time = datetime.fromtimestamp(oldest_request + window_seconds)
        else:
            reset_time = datetime.fromtimestamp(current_time + window_seconds)

        if request_count >= max_requests:
            return True, 0, reset_time

        # Record this request
        self.requests[ip].append((current_time, endpoint))

        return False, remaining - 1, reset_time


# Global rate limiter instance
rate_limiter = InMemoryRateLimiter()


# Rate limit configurations for different endpoint types
RATE_LIMITS = {
    "validation": {"max_requests": 10, "window_seconds": 60},  # 10 req/min
    "submission": {"max_requests": 5, "window_seconds": 60},   # 5 req/min
    "update": {"max_requests": 5, "window_seconds": 60},       # 5 req/min
}


def get_client_ip(request: Request) -> str:
    """Extract client IP address from request."""
    # Check for X-Forwarded-For header (proxy/load balancer)
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        # X-Forwarded-For can contain multiple IPs, get the first one
        return forwarded.split(",")[0].strip()

    # Check for X-Real-IP header
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip

    # Fall back to direct client IP
    if request.client:
        return request.client.host

    return "unknown"


async def check_rate_limit(
    request: Request,
    endpoint_type: str = "validation"
) -> None:
    """
    Check rate limit for request.

    Args:
        request: FastAPI request object
        endpoint_type: Type of endpoint (validation, submission, update)

    Raises:
        HTTPException: 429 Too Many Requests if rate limited
    """
    if endpoint_type not in RATE_LIMITS:
        endpoint_type = "validation"

    config = RATE_LIMITS[endpoint_type]
    ip = get_client_ip(request)
    endpoint = request.url.path

    is_limited, remaining, reset_time = rate_limiter.is_rate_limited(
        ip=ip,
        endpoint=endpoint,
        max_requests=config["max_requests"],
        window_seconds=config["window_seconds"]
    )

    # Add rate limit headers to response (will be added by middleware)
    request.state.rate_limit_remaining = remaining
    request.state.rate_limit_reset = reset_time

    if is_limited:
        retry_after = int((reset_time - datetime.now()).total_seconds())

        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "error": "rate_limit_exceeded",
                "message": f"Too many requests. Please try again in {retry_after} seconds.",
                "retry_after": retry_after,
                "reset_at": reset_time.isoformat()
            },
            headers={
                "Retry-After": str(retry_after),
                "X-RateLimit-Limit": str(config["max_requests"]),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": reset_time.isoformat(),
            }
        )


async def add_rate_limit_headers(request: Request, response: JSONResponse):
    """Add rate limit headers to response."""
    if hasattr(request.state, "rate_limit_remaining"):
        response.headers["X-RateLimit-Remaining"] = str(request.state.rate_limit_remaining)

    if hasattr(request.state, "rate_limit_reset"):
        response.headers["X-RateLimit-Reset"] = request.state.rate_limit_reset.isoformat()

    return response
