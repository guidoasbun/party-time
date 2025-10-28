"""
Tests for email service functionality.

FR-7: The system shall send email invitations
5.2.1: Email Service Setup

This module tests:
- Email validation
- Template rendering
- Email sending (mocked)
- Celery task queuing
"""

import pytest
from unittest.mock import Mock, patch, AsyncMock
from app.services.email_service import EmailService, get_email_service
from botocore.exceptions import ClientError


class TestEmailService:
    """Test cases for EmailService"""

    def test_email_service_initialization(self):
        """Test email service initializes correctly"""
        email_service = EmailService()

        assert email_service is not None
        assert email_service.ses_client is not None
        assert email_service.jinja_env is not None

    def test_validate_email_address_valid(self):
        """Test email validation with valid email"""
        email_service = EmailService()

        assert email_service.validate_email_address("test@example.com") is True
        assert email_service.validate_email_address("user+tag@domain.co.uk") is True

    def test_validate_email_address_invalid(self):
        """Test email validation with invalid email"""
        email_service = EmailService()

        assert email_service.validate_email_address("invalid") is False
        assert email_service.validate_email_address("@example.com") is False
        assert email_service.validate_email_address("user@") is False

    def test_render_template(self):
        """Test template rendering with context"""
        email_service = EmailService()

        # Template test.html should exist
        context = {
            "recipient_name": "Test User",
            "ses_region": "us-east-1",
            "from_email": "noreply@party-time.app",
            "timestamp": "2024-01-01 12:00:00 UTC",
            "current_year": 2024
        }

        html = email_service.render_template("test.html", context)

        assert html is not None
        assert "Test User" in html
        assert "us-east-1" in html

    @pytest.mark.asyncio
    @patch('app.services.email_service.boto3.client')
    async def test_send_email_success(self, mock_boto_client):
        """Test successful email sending"""
        # Mock SES client
        mock_ses = Mock()
        mock_ses.send_email.return_value = {
            'MessageId': 'test-message-id-12345'
        }
        mock_boto_client.return_value = mock_ses

        email_service = EmailService()

        result = await email_service.send_email(
            to_email="recipient@example.com",
            subject="Test Email",
            html_body="<p>Test body</p>",
            text_body="Test body"
        )

        assert result['success'] is True
        assert result['message_id'] == 'test-message-id-12345'
        assert result['recipient'] == 'recipient@example.com'

    @pytest.mark.asyncio
    async def test_send_email_disabled(self):
        """Test email sending when service is disabled"""
        with patch('app.services.email_service.settings') as mock_settings:
            mock_settings.EMAIL_ENABLED = False
            mock_settings.SES_FROM_EMAIL = "test@example.com"
            mock_settings.SES_FROM_NAME = "Test"
            mock_settings.SES_REGION = "us-east-1"
            mock_settings.AWS_ACCESS_KEY_ID = "test"
            mock_settings.AWS_SECRET_ACCESS_KEY = "test"

            email_service = EmailService()

            with pytest.raises(ValueError, match="Email sending is disabled"):
                await email_service.send_email(
                    to_email="test@example.com",
                    subject="Test",
                    html_body="<p>Test</p>"
                )

    @pytest.mark.asyncio
    async def test_send_email_invalid_recipient(self):
        """Test email sending with invalid recipient"""
        email_service = EmailService()

        with pytest.raises(ValueError, match="Invalid recipient email address"):
            await email_service.send_email(
                to_email="invalid-email",
                subject="Test",
                html_body="<p>Test</p>"
            )

    @pytest.mark.asyncio
    async def test_send_email_no_body(self):
        """Test email sending without body content"""
        email_service = EmailService()

        with pytest.raises(ValueError, match="Either html_body or text_body must be provided"):
            await email_service.send_email(
                to_email="test@example.com",
                subject="Test"
            )

    def test_get_email_service_singleton(self):
        """Test email service singleton pattern"""
        service1 = get_email_service()
        service2 = get_email_service()

        assert service1 is service2


class TestEmailTemplates:
    """Test cases for email templates"""

    def test_base_template_exists(self):
        """Test that base template exists"""
        email_service = EmailService()

        # Should not raise an exception
        html = email_service.render_template("base.html", {"current_year": 2024})
        assert html is not None
        assert "Party-Time" in html

    def test_test_template_exists(self):
        """Test that test template exists"""
        email_service = EmailService()

        context = {
            "recipient_name": "Test",
            "ses_region": "us-east-1",
            "from_email": "test@example.com",
            "timestamp": "2024-01-01",
            "current_year": 2024
        }

        html = email_service.render_template("test.html", context)
        assert html is not None
        assert "Email System is Working!" in html
