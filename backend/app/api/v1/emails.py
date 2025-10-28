"""
Email admin API endpoints.

FR-7: The system shall send email invitations
5.2.1: Email Service Setup

This module provides endpoints for:
- Sending test emails
- Viewing email logs
- Email statistics
- SES quota and verification
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional, Any, Dict
from datetime import datetime, timedelta
from uuid import UUID
from dateutil import parser as date_parser

from app.core.dependencies import get_db
from app.services.email_service import get_email_service
from app.models.email_log import EmailLog, EmailStatus, EmailType
from app.models.event import Event
from app.models.guest import Guest
from app.schemas.email import (
    EmailSendRequest,
    TemplatEmailSendRequest,
    EmailSendResponse,
    EmailLog as EmailLogSchema,
    EmailStatsResponse,
    EmailVerificationRequest,
    EmailVerificationResponse,
    EmailQuotaResponse,
    TemplatePreviewRequest,
    TemplatePreviewResponse,
)
from app.core.config import get_settings

settings = get_settings()
router = APIRouter()


@router.post("/test", response_model=EmailSendResponse, status_code=status.HTTP_200_OK)
async def send_test_email(
    request: EmailSendRequest,
    db: AsyncSession = Depends(get_db),
) -> EmailSendResponse:
    """
    Send a test email via AWS SES.

    This endpoint sends a simple test email to verify email service configuration.
    Requires admin authentication in production.

    Args:
        request: Email send request with recipient and content
        db: Database session

    Returns:
        EmailSendResponse with success status and message ID
    """
    try:
        email_service = get_email_service()

        # Send email
        result = await email_service.send_email(
            to_email=request.to_email,
            subject=request.subject,
            html_body=request.html_body,
            text_body=request.text_body,
            reply_to=request.reply_to,
            cc=request.cc,
            bcc=request.bcc,
        )

        # Create email log
        email_log = EmailLog(
            recipient_email=request.to_email,
            subject=request.subject,
            email_type=EmailType.TEST,
            status=EmailStatus.SENT,
            ses_message_id=result.get("message_id"),
            sent_at=datetime.utcnow(),
        )
        db.add(email_log)
        await db.commit()

        return EmailSendResponse(
            success=True,
            message_id=result.get("message_id"),
            recipient=request.to_email,
            message="Test email sent successfully"
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send test email: {str(e)}"
        )


@router.post("/send-template", response_model=EmailSendResponse, status_code=status.HTTP_200_OK)
async def send_template_email(
    request: TemplatEmailSendRequest,
    db: AsyncSession = Depends(get_db),
) -> EmailSendResponse:
    """
    Send email using a template.

    Args:
        request: Template email request
        db: Database session

    Returns:
        EmailSendResponse with success status
    """
    try:
        email_service = get_email_service()

        # Add current year and timestamp to context
        context = request.context.copy()
        context["current_year"] = datetime.utcnow().year
        context["timestamp"] = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

        # Send template email
        result = await email_service.send_template_email(
            to_email=request.to_email,
            subject=request.subject,
            template_name=request.template_name,
            context=context,
            reply_to=request.reply_to,
        )

        # Create email log
        email_log = EmailLog(
            recipient_email=request.to_email,
            subject=request.subject,
            email_type=EmailType.TEST,
            status=EmailStatus.SENT,
            ses_message_id=result.get("message_id"),
            sent_at=datetime.utcnow(),
        )
        db.add(email_log)
        await db.commit()

        return EmailSendResponse(
            success=True,
            message_id=result.get("message_id"),
            recipient=request.to_email,
            message="Template email sent successfully"
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send template email: {str(e)}"
        )


@router.get("/logs", response_model=List[EmailLogSchema])
async def get_email_logs(
    event_id: Optional[UUID] = Query(None, description="Filter by event ID"),
    guest_id: Optional[UUID] = Query(None, description="Filter by guest ID"),
    email_type: Optional[EmailType] = Query(None, description="Filter by email type"),
    email_status: Optional[EmailStatus] = Query(None, description="Filter by status"),
    days: int = Query(7, ge=1, le=90, description="Number of days to look back"),
    limit: int = Query(50, ge=1, le=500, description="Maximum number of results"),
    offset: int = Query(0, ge=0, description="Number of results to skip"),
    db: AsyncSession = Depends(get_db),
) -> List[EmailLogSchema]:
    """
    Get email delivery logs with filtering.

    Args:
        event_id: Filter by event ID (optional)
        guest_id: Filter by guest ID (optional)
        email_type: Filter by email type (optional)
        email_status: Filter by delivery status (optional)
        days: Number of days to look back (default: 7)
        limit: Maximum results to return (default: 50)
        offset: Results to skip for pagination (default: 0)
        db: Database session

    Returns:
        List of email log entries
    """
    query = select(EmailLog)

    # Apply filters
    if event_id:
        query = query.where(EmailLog.event_id == event_id)

    if guest_id:
        query = query.where(EmailLog.guest_id == guest_id)

    if email_type:
        query = query.where(EmailLog.email_type == email_type)

    if email_status:
        query = query.where(EmailLog.status == email_status)

    # Filter by date range
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    query = query.where(EmailLog.created_at >= cutoff_date)

    # Order by most recent first
    query = query.order_by(EmailLog.created_at.desc())

    # Apply pagination
    query = query.offset(offset).limit(limit)

    result = await db.execute(query)
    logs = result.scalars().all()

    return logs


@router.get("/stats", response_model=EmailStatsResponse)
async def get_email_stats(
    event_id: Optional[UUID] = Query(None, description="Filter by event ID"),
    days: int = Query(30, ge=1, le=365, description="Number of days for statistics"),
    db: AsyncSession = Depends(get_db),
) -> EmailStatsResponse:
    """
    Get email delivery statistics.

    Args:
        event_id: Filter by event ID (optional)
        days: Number of days for statistics (default: 30)
        db: Database session

    Returns:
        Email statistics including counts and success rate
    """
    query = select(EmailLog)

    # Filter by event if provided
    if event_id:
        query = query.where(EmailLog.event_id == event_id)

    # Filter by date range
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    query = query.where(EmailLog.created_at >= cutoff_date)

    # Get all logs for analysis
    result = await db.execute(query)
    logs = list(result.scalars().all())

    # Calculate statistics
    total_sent = sum(1 for log in logs if log.status in [EmailStatus.SENT, EmailStatus.DELIVERED])
    total_failed = sum(1 for log in logs if log.status == EmailStatus.FAILED)
    total_delivered = sum(1 for log in logs if log.status == EmailStatus.DELIVERED)
    total_bounced = sum(1 for log in logs if log.status == EmailStatus.BOUNCED)
    total_complained = sum(1 for log in logs if log.status == EmailStatus.COMPLAINED)

    # Calculate success rate
    total_attempts = len(logs)
    success_rate = (total_sent / total_attempts * 100) if total_attempts > 0 else 0.0

    # Count by type
    by_type = {}
    for email_type_value in EmailType:
        count = sum(1 for log in logs if log.email_type == email_type_value)
        if count > 0:
            by_type[email_type_value.value] = count

    return EmailStatsResponse(
        total_sent=total_sent,
        total_failed=total_failed,
        total_delivered=total_delivered,
        total_bounced=total_bounced,
        total_complained=total_complained,
        success_rate=round(success_rate, 2),
        by_type=by_type
    )


@router.post("/verify", response_model=EmailVerificationResponse)
async def verify_email_address(
    request: EmailVerificationRequest,
) -> EmailVerificationResponse:
    """
    Verify an email address with AWS SES.

    This sends a verification email to the provided address.
    Required when SES is in sandbox mode.

    Args:
        request: Email verification request

    Returns:
        Verification response with status
    """
    try:
        email_service = get_email_service()

        result = await email_service.verify_email_address(request.email)

        return EmailVerificationResponse(
            email=request.email,
            status="pending",
            verified=False,
            message=result.get("message")
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to verify email: {str(e)}"
        )


@router.get("/verify/{email}", response_model=EmailVerificationResponse)
async def check_verification_status(
    email: str,
) -> EmailVerificationResponse:
    """
    Check verification status of an email address.

    Args:
        email: Email address to check

    Returns:
        Verification status response
    """
    try:
        email_service = get_email_service()

        result = await email_service.get_verification_status(email)

        return EmailVerificationResponse(
            email=email,
            status=result.get("status"),
            verified=result.get("verified"),
            message=f"Verification status: {result.get('status')}"
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Failed to check verification status: {str(e)}"
        )


@router.get("/quota", response_model=EmailQuotaResponse)
async def get_ses_quota() -> EmailQuotaResponse:
    """
    Get AWS SES sending quota and usage.

    Returns:
        SES quota information including limits and current usage
    """
    try:
        email_service = get_email_service()

        quota = await email_service.get_send_quota()

        max_24_hour = quota["max_24_hour_send"]
        sent_24_hour = quota["sent_last_24_hours"]
        remaining = max_24_hour - sent_24_hour
        usage_pct = (sent_24_hour / max_24_hour * 100) if max_24_hour > 0 else 0.0

        return EmailQuotaResponse(
            max_24_hour_send=max_24_hour,
            max_send_rate=quota["max_send_rate"],
            sent_last_24_hours=sent_24_hour,
            remaining_24_hour=remaining,
            usage_percentage=round(usage_pct, 2)
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get SES quota: {str(e)}"
        )

"""
FR-7: The system shall send email invitations
5.2.2: Email Templates
"""

def convert_dates_in_dict(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Recursively convert ISO date strings to datetime objects in a dictionary.

    This helper is needed for mock_data in preview endpoint because Jinja2
    template filters expect datetime objects, not string dates.
    """
    if not isinstance(data, dict):
        return data

    result = {}
    for key, value in data.items():
        # Check if key suggests this is a date field
        if key in ['start_date', 'end_date', 'rsvp_deadline', 'created_at', 'updated_at']:
            if isinstance(value, str):
                try:
                    # Parse ISO 8601 date string to datetime
                    result[key] = date_parser.isoparse(value)
                except (ValueError, TypeError):
                    # If parsing fails, keep original value
                    result[key] = value
            else:
                result[key] = value
        elif isinstance(value, dict):
            # Recursively process nested dictionaries
            result[key] = convert_dates_in_dict(value)
        elif isinstance(value, list):
            # Process list items
            result[key] = [
                convert_dates_in_dict(item) if isinstance(item, dict) else item
                for item in value
            ]
        else:
            result[key] = value

    return result

"""
FR-7: The system shall send email invitations
5.2.2: Email Templates
"""

@router.post("/preview", response_model=TemplatePreviewResponse, status_code=status.HTTP_200_OK)
async def preview_template(
    request: TemplatePreviewRequest,
    db: AsyncSession = Depends(get_db),
) -> TemplatePreviewResponse:
    """
    Preview an email template with real or mock data.

    This endpoint renders a template and returns the HTML (and optionally text) content
    for browser preview without actually sending the email.

    Args:
        request: Template preview request with template name and data
        db: Database session

    Returns:
        TemplatePreviewResponse with rendered HTML and text content
    """
    try:
        email_service = get_email_service()

        # Determine template file names
        html_template = f"{request.template_name}.html"
        txt_template = f"{request.template_name}.txt"

        # Build context from event/guest data or mock data
        context = {}

        # If event_id provided, fetch event data
        if request.event_id:
            result = await db.execute(select(Event).where(Event.id == request.event_id))
            event = result.scalar_one_or_none()

            if not event:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Event with ID {request.event_id} not found"
                )

            context['event'] = event
            context['event_type_display'] = email_service.jinja_env.filters['event_type_display'](
                event.type if hasattr(event, 'type') else None
            )

        # If guest_id provided, fetch guest data
        if request.guest_id:
            result = await db.execute(select(Guest).where(Guest.id == request.guest_id))
            guest = result.scalar_one_or_none()

            if not guest:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Guest with ID {request.guest_id} not found"
                )

            context['guest'] = guest
            context['guest_name'] = guest.first_name if hasattr(guest, 'first_name') else "Guest"

            # Generate RSVP URL if guest has token
            if hasattr(guest, 'rsvp_token') and guest.rsvp_token:
                context['rsvp_url'] = f"{settings.FRONTEND_URL}/rsvp/{guest.rsvp_token}"

        # If mock data provided, use it (overrides real data)
        if request.mock_data:
            # Convert date strings to datetime objects for template filters
            converted_mock_data = convert_dates_in_dict(request.mock_data)
            context.update(converted_mock_data)

        # Add common context
        context['frontend_url'] = settings.FRONTEND_URL
        context['app_name'] = settings.PROJECT_NAME
        context['current_year'] = datetime.utcnow().year

        # Render HTML template
        try:
            html_content = email_service.render_template(html_template, context)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to render HTML template '{html_template}': {str(e)}"
            )

        # Try to render text template (optional)
        text_content = None
        try:
            text_content = email_service.render_template(txt_template, context)
        except Exception:
            # Text template is optional, so don't fail if it doesn't exist
            pass

        return TemplatePreviewResponse(
            template_name=request.template_name,
            html_content=html_content,
            text_content=text_content,
            rendered_at=datetime.utcnow()
        )

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to preview template: {str(e)}"
        )
