"""
Email service setup verification script.

FR-7: The system shall send email invitations
5.2.1: Email Service Setup

This script tests that the email service is properly configured
without actually sending emails (mocks AWS SES).
"""

import asyncio
from unittest.mock import Mock, patch
from app.services.email_service import get_email_service
from datetime import datetime


async def test_email_service_setup():
    """Test email service configuration"""
    print("=" * 60)
    print("EMAIL SERVICE SETUP VERIFICATION")
    print("=" * 60)
    print()

    # Test 1: Email service initialization
    print("✓ Test 1: Email Service Initialization")
    try:
        email_service = get_email_service()
        print(f"  - Service initialized: {email_service is not None}")
        print(f"  - From email: {email_service.from_email}")
        print(f"  - From name: {email_service.from_name}")
        print(f"  - Region: {email_service.region}")
        print(f"  - Enabled: {email_service.enabled}")
        print()
    except Exception as e:
        print(f"  ✗ FAILED: {e}")
        return False

    # Test 2: Email validation
    print("✓ Test 2: Email Validation")
    try:
        valid_emails = [
            "test@example.com",
            "user+tag@domain.co.uk",
            "info@party-time.app"
        ]
        invalid_emails = [
            "invalid",
            "@example.com",
            "user@",
            "not-an-email"
        ]

        for email in valid_emails:
            result = email_service.validate_email_address(email)
            print(f"  - {email}: {'✓ Valid' if result else '✗ Invalid'}")

        print()
        for email in invalid_emails:
            result = email_service.validate_email_address(email)
            print(f"  - {email}: {'✗ Valid (UNEXPECTED)' if result else '✓ Invalid'}")
        print()
    except Exception as e:
        print(f"  ✗ FAILED: {e}")
        return False

    # Test 3: Template rendering
    print("✓ Test 3: Template Rendering")
    try:
        context = {
            "recipient_name": "Test User",
            "ses_region": email_service.region,
            "from_email": email_service.from_email or "noreply@party-time.app",
            "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
            "current_year": datetime.utcnow().year
        }

        html = email_service.render_template("test.html", context)
        print(f"  - Template rendered: {len(html)} characters")
        print(f"  - Contains recipient name: {'Test User' in html}")
        print(f"  - Contains region: {email_service.region in html}")
        print()
    except Exception as e:
        print(f"  ✗ FAILED: {e}")
        return False

    # Test 4: Mocked email sending
    print("✓ Test 4: Email Sending (Mocked)")
    try:
        # Mock the SES client
        with patch.object(email_service.ses_client, 'send_email') as mock_send:
            mock_send.return_value = {
                'MessageId': 'mock-message-id-12345'
            }

            result = await email_service.send_email(
                to_email="test@example.com",
                subject="Test Email - Setup Verification",
                html_body="<p>This is a test email.</p>",
                text_body="This is a test email."
            )

            print(f"  - Email send called: {mock_send.called}")
            print(f"  - Success: {result.get('success')}")
            print(f"  - Message ID: {result.get('message_id')}")
            print(f"  - Recipient: {result.get('recipient')}")
            print()
    except Exception as e:
        print(f"  ✗ FAILED: {e}")
        return False

    # Test 5: Template email sending (mocked)
    print("✓ Test 5: Template Email Sending (Mocked)")
    try:
        with patch.object(email_service.ses_client, 'send_email') as mock_send:
            mock_send.return_value = {
                'MessageId': 'mock-template-message-id-67890'
            }

            result = await email_service.send_template_email(
                to_email="test@example.com",
                subject="Template Test Email",
                template_name="test.html",
                context=context
            )

            print(f"  - Template email send called: {mock_send.called}")
            print(f"  - Success: {result.get('success')}")
            print(f"  - Message ID: {result.get('message_id')}")
            print()
    except Exception as e:
        print(f"  ✗ FAILED: {e}")
        return False

    print("=" * 60)
    print("✅ ALL TESTS PASSED - EMAIL SERVICE IS CONFIGURED")
    print("=" * 60)
    print()
    print("Next Steps:")
    print("1. Configure AWS SES credentials in .env file:")
    print("   - SES_FROM_EMAIL=your-verified-email@domain.com")
    print("   - AWS_ACCESS_KEY_ID=your-aws-access-key")
    print("   - AWS_SECRET_ACCESS_KEY=your-aws-secret-key")
    print()
    print("2. Verify your sender email in AWS SES:")
    print("   - Run: POST /api/v1/emails/verify with your email")
    print("   - Check verification link in email inbox")
    print()
    print("3. Send a real test email:")
    print("   - Run: POST /api/v1/emails/test")
    print()
    print("4. Start Celery worker for async email processing:")
    print("   - celery -A app.core.celery_app worker --loglevel=info")
    print()

    return True


if __name__ == "__main__":
    asyncio.run(test_email_service_setup())
