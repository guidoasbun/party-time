"""
Integration tests for authentication endpoints with Cognito mocking.
"""
import pytest
from unittest.mock import patch, AsyncMock
from fastapi import status
from fastapi.testclient import TestClient


class TestAuthEndpoints:
    """Test authentication-related endpoints."""

    @pytest.mark.auth
    def test_get_current_user_without_token(self, client: TestClient):
        """Test /me endpoint without authentication token."""
        response = client.get("/api/v1/auth/me")
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    @pytest.mark.auth
    def test_get_current_user_with_invalid_token(self, client: TestClient):
        """Test /me endpoint with invalid authentication token."""
        headers = {"Authorization": "Bearer invalid-token"}
        response = client.get("/api/v1/auth/me", headers=headers)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    @pytest.mark.auth
    def test_get_current_user_with_valid_token(self, client: TestClient, mock_get_current_user, mock_user):
        """Test /me endpoint with valid authentication token."""
        with patch("app.core.auth.get_current_user", return_value=mock_user):
            headers = {"Authorization": "Bearer valid-token"}
            response = client.get("/api/v1/auth/me", headers=headers)
            
            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            
            assert data["user_id"] == mock_user["user_id"]
            assert data["email"] == mock_user["email"]
            assert data["name"] == mock_user["name"]
            assert data["email_verified"] == mock_user["email_verified"]
            assert data["username"] == mock_user["username"]
            assert data["groups"] == mock_user["groups"]

    @pytest.mark.auth
    def test_protected_route_without_token(self, client: TestClient):
        """Test protected route without authentication token."""
        response = client.get("/api/v1/auth/protected")
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    @pytest.mark.auth
    def test_protected_route_with_valid_token(self, client: TestClient, mock_get_current_active_user, mock_user):
        """Test protected route with valid authentication token."""
        with patch("app.core.auth.get_current_active_user", return_value=mock_user):
            headers = {"Authorization": "Bearer valid-token"}
            response = client.get("/api/v1/auth/protected", headers=headers)
            
            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            
            assert "message" in data
            assert f"Hello {mock_user['name']}" in data["message"]
            assert data["user_id"] == mock_user["user_id"]

    @pytest.mark.auth
    def test_logout_endpoint(self, client: TestClient):
        """Test logout endpoint."""
        response = client.post("/api/v1/auth/logout")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert "message" in data
        assert "logged out" in data["message"].lower()

    @pytest.mark.auth
    def test_logout_endpoint_with_token(self, client: TestClient):
        """Test logout endpoint with authentication token."""
        headers = {"Authorization": "Bearer some-token"}
        response = client.post("/api/v1/auth/logout", headers=headers)
        
        # Logout should work regardless of token validity
        assert response.status_code == status.HTTP_200_OK

    @pytest.mark.auth
    @pytest.mark.slow
    def test_cognito_service_integration_mock(self, client: TestClient, mock_cognito_service):
        """Test that Cognito service can be properly mocked."""
        with patch("app.services.cognito_service.cognito_service", mock_cognito_service):
            # This test verifies our mocking setup works
            # In real integration tests, these endpoints would use cognito_service
            mock_cognito_service.authenticate_user.assert_not_called()
            
            # Verify mock is accessible
            assert mock_cognito_service.register_user is not None
            assert mock_cognito_service.authenticate_user is not None
            assert mock_cognito_service.verify_email is not None

    @pytest.mark.auth
    def test_auth_dependency_injection(self, client: TestClient):
        """Test that auth dependencies are properly configured."""
        # Test that the dependency injection system is working
        # by confirming that protected routes return 401 without proper auth
        
        protected_endpoints = [
            "/api/v1/auth/me",
            "/api/v1/auth/protected"
        ]
        
        for endpoint in protected_endpoints:
            response = client.get(endpoint)
            assert response.status_code == status.HTTP_401_UNAUTHORIZED

    @pytest.mark.auth
    def test_cors_on_auth_endpoints(self, client: TestClient):
        """Test that CORS is properly configured for auth endpoints."""
        # Test OPTIONS request to auth endpoints
        response = client.options("/api/v1/auth/me")
        
        # Should have CORS headers
        assert "access-control-allow-origin" in response.headers
        assert "access-control-allow-methods" in response.headers

    @pytest.mark.auth 
    def test_auth_endpoints_return_json(self, client: TestClient):
        """Test that auth endpoints return JSON content type."""
        # Test that error responses are also JSON
        response = client.get("/api/v1/auth/me")
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "application/json" in response.headers.get("content-type", "")