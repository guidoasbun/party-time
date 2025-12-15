"""
Phase 7: Monitoring - X-Ray Tracing Middleware
FR-22: The system shall be deployed on AWS Infrastructure.

AWS X-Ray integration for distributed tracing in FastAPI.
Provides request tracing, error tracking, and performance monitoring.

Usage:
    The middleware is automatically enabled when AWS_XRAY_SDK_ENABLED=true
    and the aws-xray-sdk package is installed.

Environment Variables:
    AWS_XRAY_SDK_ENABLED: Set to "true" to enable X-Ray tracing
    AWS_XRAY_DAEMON_ADDRESS: X-Ray daemon address (default: 127.0.0.1:2000)
    PROJECT_NAME: Project name for service identification
    ENVIRONMENT: Environment name (development, staging, production)
"""
import logging
import os
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)

# Check if X-Ray should be enabled
XRAY_ENABLED = os.getenv("AWS_XRAY_SDK_ENABLED", "false").lower() == "true"

# Initialize X-Ray SDK if enabled
if XRAY_ENABLED:
    try:
        from aws_xray_sdk.core import xray_recorder, patch_all
        from aws_xray_sdk.core.models.segment import Segment

        # Get configuration from environment
        service_name = f"{os.getenv('PROJECT_NAME', 'party-time')}-{os.getenv('ENVIRONMENT', 'development')}-backend"
        daemon_address = os.getenv("AWS_XRAY_DAEMON_ADDRESS", "127.0.0.1:2000")

        # Configure X-Ray recorder
        xray_recorder.configure(
            service=service_name,
            daemon_address=daemon_address,
            context_missing="LOG_ERROR",
            streaming_threshold=10,
        )

        # Patch AWS SDK, requests, and database libraries for automatic tracing
        # This will trace calls to boto3, requests, aiohttp, httplib, and more
        patch_all()

        logger.info(f"X-Ray SDK initialized: service={service_name}, daemon={daemon_address}")

    except ImportError:
        logger.warning("aws-xray-sdk not installed, X-Ray tracing disabled")
        XRAY_ENABLED = False
    except Exception as e:
        logger.warning(f"Failed to initialize X-Ray SDK: {e}")
        XRAY_ENABLED = False


class XRayMiddleware(BaseHTTPMiddleware):
    """
    FastAPI middleware for AWS X-Ray distributed tracing.

    Creates trace segments for each incoming request with:
    - HTTP method and URL path
    - Request headers (user-agent, client IP)
    - Response status code
    - Custom annotations (environment, path)
    - Error information on failures

    The middleware integrates with ALB/CloudFront trace headers
    to create a connected trace across all services.
    """

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """
        Process request with X-Ray tracing.

        Args:
            request: The incoming FastAPI request
            call_next: The next middleware/handler in the chain

        Returns:
            Response from the handler
        """
        # If X-Ray is not enabled, pass through without tracing
        if not XRAY_ENABLED:
            return await call_next(request)

        from aws_xray_sdk.core import xray_recorder

        # Extract trace header if present (from ALB/CloudFront)
        trace_header = request.headers.get("X-Amzn-Trace-Id")

        # Create segment name from method and path
        segment_name = f"{request.method} {request.url.path}"

        # Begin a new segment
        segment = xray_recorder.begin_segment(
            name=segment_name,
            traceid=trace_header,
        )

        try:
            # Add request metadata
            segment.put_http_meta("url", str(request.url))
            segment.put_http_meta("method", request.method)
            segment.put_http_meta("user_agent", request.headers.get("user-agent", ""))

            # Add client IP (handle proxied requests)
            client_ip = request.headers.get(
                "x-forwarded-for",
                request.client.host if request.client else ""
            )
            if client_ip:
                # X-Forwarded-For may contain multiple IPs, take the first
                client_ip = client_ip.split(",")[0].strip()
            segment.put_http_meta("client_ip", client_ip)

            # Add custom annotations for filtering in X-Ray console
            segment.put_annotation("environment", os.getenv("ENVIRONMENT", "development"))
            segment.put_annotation("path", request.url.path)
            segment.put_annotation("method", request.method)

            # Process the request
            response = await call_next(request)

            # Add response metadata
            segment.put_http_meta("status", response.status_code)

            # Mark as error/fault based on status code
            if response.status_code >= 500:
                segment.add_error_flag()
            elif response.status_code >= 400:
                segment.add_fault_flag()

            return response

        except Exception as e:
            # Record exception in the segment
            segment.add_exception(e, True)
            raise

        finally:
            # Always end the segment
            xray_recorder.end_segment()


def trace_subsegment(name: str):
    """
    Decorator to create X-Ray subsegments for functions.

    Use this to trace specific operations within a request,
    such as database queries, external API calls, or heavy computations.

    Usage:
        @trace_subsegment("database_query")
        async def get_events(user_id: str):
            # Database operations will be traced as a subsegment
            ...

    Args:
        name: Name for the subsegment (e.g., "database_query", "cache_lookup")

    Returns:
        Decorated function with X-Ray subsegment tracing
    """
    def decorator(func):
        async def wrapper(*args, **kwargs):
            if not XRAY_ENABLED:
                return await func(*args, **kwargs)

            from aws_xray_sdk.core import xray_recorder

            with xray_recorder.in_subsegment(name) as subsegment:
                try:
                    result = await func(*args, **kwargs)
                    return result
                except Exception as e:
                    subsegment.add_exception(e, True)
                    raise

        return wrapper
    return decorator


def trace_sync_subsegment(name: str):
    """
    Decorator for synchronous functions (non-async).

    Usage:
        @trace_sync_subsegment("heavy_computation")
        def calculate_seating_arrangement(guests: list):
            ...
    """
    def decorator(func):
        def wrapper(*args, **kwargs):
            if not XRAY_ENABLED:
                return func(*args, **kwargs)

            from aws_xray_sdk.core import xray_recorder

            with xray_recorder.in_subsegment(name) as subsegment:
                try:
                    result = func(*args, **kwargs)
                    return result
                except Exception as e:
                    subsegment.add_exception(e, True)
                    raise

        return wrapper
    return decorator
