"""
Integration tests for the main FastAPI application endpoints.
"""
import pytest
from fastapi import status
from fastapi.testclient import TestClient


class TestMainEndpoints:
    """Test the main application endpoints."""

    def test_root_endpoint(self, client: TestClient):
        """Test the root endpoint returns the correct message."""
        response = client.get("/")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert data["message"] == "Party-Time API is running!"
        assert data["version"] == "1.0.0"
        assert "environment" in data

    def test_health_check_endpoint(self, client: TestClient):
        """Test the health check endpoint."""
        response = client.get("/health")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert data["status"] == "healthy"

    def test_cors_headers_present(self, client: TestClient):
        """Test that CORS headers are properly configured."""
        response = client.options("/")
        
        # Check that CORS headers are present
        assert "access-control-allow-origin" in response.headers
        assert "access-control-allow-methods" in response.headers
        assert "access-control-allow-headers" in response.headers

    def test_security_headers_present(self, client: TestClient):
        """Test that security headers are properly set."""
        response = client.get("/")
        
        # Check security headers
        assert response.headers.get("X-Content-Type-Options") == "nosniff"
        assert response.headers.get("X-Frame-Options") == "DENY"
        assert response.headers.get("X-XSS-Protection") == "1; mode=block"
        assert response.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"
        assert "Content-Security-Policy" in response.headers

    def test_hsts_header_not_present_in_test(self, client: TestClient):
        """Test that HSTS header is not set in test environment."""
        response = client.get("/")
        
        # HSTS should not be present in test environment
        assert "Strict-Transport-Security" not in response.headers

    @pytest.mark.integration
    def test_api_v1_prefix_accessible(self, client: TestClient):
        """Test that API v1 routes are accessible under the correct prefix."""
        # This will test the auth routes under /api/v1/auth
        response = client.get("/api/v1/auth/me")
        
        # Should return 401 (unauthorized) not 404 (not found)
        # This confirms the route exists but requires authentication
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_nonexistent_endpoint_returns_404(self, client: TestClient):
        """Test that nonexistent endpoints return 404."""
        response = client.get("/nonexistent")
        
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_content_type_is_json(self, client: TestClient):
        """Test that API responses have correct content type."""
        response = client.get("/")
        
        assert "application/json" in response.headers.get("content-type", "")

    @pytest.mark.integration
    def test_app_startup_and_configuration(self, client: TestClient):
        """Test that the app starts up correctly with test configuration."""
        # Test root endpoint to ensure app is configured correctly
        response = client.get("/")
        assert response.status_code == status.HTTP_200_OK
        
        # Test health endpoint to ensure basic functionality
        response = client.get("/health")
        assert response.status_code == status.HTTP_200_OK