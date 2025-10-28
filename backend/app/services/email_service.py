"""
Email Service for Party-Time application using AWS SES.

FR-7: The system shall send email invitations
5.2.1: Email Service Setup

This service provides:
- Email sending via AWS SES
- Template rendering with Jinja2
- Email validation
- Error handling and logging
- SES verification status checking
"""

import boto3
import logging
from typing import Optional, Dict, Any, List
from botocore.exceptions import ClientError
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from jinja2 import Environment, FileSystemLoader, select_autoescape
from email_validator import validate_email, EmailNotValidError
from pathlib import Path

from app.core.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)


class EmailService:
    """Service for sending emails via AWS SES"""

    def __init__(self):
        """Initialize AWS SES client and Jinja2 template environment"""
        self.from_email = settings.SES_FROM_EMAIL
        self.from_name = settings.SES_FROM_NAME
        self.region = settings.SES_REGION
        self.enabled = settings.EMAIL_ENABLED

        # Initialize boto3 SES client
        self.ses_client = boto3.client(
            'ses',
            region_name=self.region,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
        )

        # Initialize Jinja2 template environment
        template_dir = Path(__file__).parent.parent / "templates" / "emails"
        self.jinja_env = Environment(
            loader=FileSystemLoader(str(template_dir)),
            autoescape=select_autoescape(['html', 'xml'])
        )

        logger.info(f"EmailService initialized with SES region: {self.region}")

    def validate_email_address(self, email: str) -> bool:
        """
        Validate email address format.

        Args:
            email: Email address to validate

        Returns:
            True if valid, False otherwise
        """
        try:
            validate_email(email, check_deliverability=False)
            return True
        except EmailNotValidError as e:
            logger.warning(f"Invalid email address {email}: {str(e)}")
            return False

    def render_template(self, template_name: str, context: Dict[str, Any]) -> str:
        """
        Render email template with context data.

        Args:
            template_name: Name of the template file (e.g., 'test.html')
            context: Dictionary of variables to pass to template

        Returns:
            Rendered HTML string
        """
        try:
            template = self.jinja_env.get_template(template_name)
            return template.render(**context)
        except Exception as e:
            logger.error(f"Error rendering template {template_name}: {str(e)}")
            raise

    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_body: Optional[str] = None,
        text_body: Optional[str] = None,
        reply_to: Optional[str] = None,
        cc: Optional[List[str]] = None,
        bcc: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Send email via AWS SES.

        Args:
            to_email: Recipient email address
            subject: Email subject line
            html_body: HTML version of email body (optional)
            text_body: Plain text version of email body (optional)
            reply_to: Reply-To email address (optional)
            cc: List of CC email addresses (optional)
            bcc: List of BCC email addresses (optional)

        Returns:
            Dictionary with SES response including MessageId

        Raises:
            ValueError: If email is disabled or invalid
            ClientError: If SES API call fails
        """
        if not self.enabled:
            logger.warning("Email sending is disabled")
            raise ValueError("Email sending is disabled")

        if not self.from_email:
            logger.error("SES_FROM_EMAIL not configured")
            raise ValueError("SES_FROM_EMAIL not configured in settings")

        # Validate recipient email
        if not self.validate_email_address(to_email):
            raise ValueError(f"Invalid recipient email address: {to_email}")

        # At least one body type is required
        if not html_body and not text_body:
            raise ValueError("Either html_body or text_body must be provided")

        try:
            # Build email destination
            destination = {"ToAddresses": [to_email]}

            if cc:
                destination["CcAddresses"] = cc

            if bcc:
                destination["BccAddresses"] = bcc

            # Build email message
            message: Dict[str, Any] = {
                "Subject": {"Data": subject, "Charset": "UTF-8"}
            }

            # Add body content
            body: Dict[str, Any] = {}

            if html_body:
                body["Html"] = {"Data": html_body, "Charset": "UTF-8"}

            if text_body:
                body["Text"] = {"Data": text_body, "Charset": "UTF-8"}

            message["Body"] = body

            # Prepare sender
            if self.from_name:
                source = f"{self.from_name} <{self.from_email}>"
            else:
                source = self.from_email

            # Send email via SES
            response = self.ses_client.send_email(
                Source=source,
                Destination=destination,
                Message=message,
                ReplyToAddresses=[reply_to] if reply_to else []
            )

            message_id = response['MessageId']
            logger.info(f"Email sent successfully to {to_email}, MessageId: {message_id}")

            return {
                "success": True,
                "message_id": message_id,
                "recipient": to_email
            }

        except ClientError as e:
            error_code = e.response['Error']['Code']
            error_message = e.response['Error']['Message']
            logger.error(f"SES ClientError: {error_code} - {error_message}")

            # Re-raise with more context
            raise ClientError(
                {
                    'Error': {
                        'Code': error_code,
                        'Message': f"Failed to send email to {to_email}: {error_message}"
                    }
                },
                'send_email'
            )
        except Exception as e:
            logger.error(f"Unexpected error sending email: {str(e)}")
            raise

    async def send_template_email(
        self,
        to_email: str,
        subject: str,
        template_name: str,
        context: Dict[str, Any],
        reply_to: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Send email using a Jinja2 template.

        Args:
            to_email: Recipient email address
            subject: Email subject line
            template_name: Name of template file (e.g., 'test.html')
            context: Dictionary of variables for template rendering
            reply_to: Reply-To email address (optional)

        Returns:
            Dictionary with SES response including MessageId
        """
        # Render the template
        html_body = self.render_template(template_name, context)

        # Send the email
        return await self.send_email(
            to_email=to_email,
            subject=subject,
            html_body=html_body,
            reply_to=reply_to
        )

    async def verify_email_address(self, email: str) -> Dict[str, Any]:
        """
        Verify an email address or domain with SES.

        Note: This sends a verification email to the address.
        Required for SES sandbox mode.

        Args:
            email: Email address to verify

        Returns:
            Dictionary with verification status
        """
        try:
            response = self.ses_client.verify_email_identity(EmailAddress=email)
            logger.info(f"Verification email sent to {email}")
            return {
                "success": True,
                "email": email,
                "message": "Verification email sent"
            }
        except ClientError as e:
            logger.error(f"Error verifying email {email}: {str(e)}")
            raise

    async def get_verification_status(self, email: str) -> Dict[str, Any]:
        """
        Check verification status of an email address.

        Args:
            email: Email address to check

        Returns:
            Dictionary with verification status
        """
        try:
            response = self.ses_client.get_identity_verification_attributes(
                Identities=[email]
            )

            attributes = response.get('VerificationAttributes', {})
            status = attributes.get(email, {}).get('VerificationStatus', 'NotFound')

            return {
                "email": email,
                "status": status,
                "verified": status == "Success"
            }
        except ClientError as e:
            logger.error(f"Error checking verification status for {email}: {str(e)}")
            raise

    async def get_send_quota(self) -> Dict[str, Any]:
        """
        Get SES sending quota and statistics.

        Returns:
            Dictionary with quota information
        """
        try:
            response = self.ses_client.get_send_quota()
            return {
                "max_24_hour_send": response['Max24HourSend'],
                "max_send_rate": response['MaxSendRate'],
                "sent_last_24_hours": response['SentLast24Hours']
            }
        except ClientError as e:
            logger.error(f"Error getting send quota: {str(e)}")
            raise


# Singleton instance
_email_service: Optional[EmailService] = None


def get_email_service() -> EmailService:
    """Get or create EmailService singleton instance"""
    global _email_service
    if _email_service is None:
        _email_service = EmailService()
    return _email_service
