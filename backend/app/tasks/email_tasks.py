"""
Celery tasks for email operations.

FR-7: The system shall send email invitations
5.2.1: Email Service Setup

This module defines asynchronous tasks for:
- Sending individual emails
- Sending bulk emails
- Email retries with exponential backoff
"""

import logging
from typing import Dict, Any, List, Optional
from celery import Task
from celery.exceptions import Retry
from sqlalchemy.orm import Session

from app.core.celery_app import celery_app
from app.services.email_service import get_email_service
from app.db.session import SessionLocal
from app.models.email_log import EmailLog, EmailStatus
from app.core.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)


class EmailTask(Task):
    """Base task with email log tracking"""

    def on_failure(self, exc, task_id, args, kwargs, einfo):
        """Handle task failure by updating email log"""
        logger.error(f"Email task {task_id} failed: {exc}")

        # Update email log if log_id is provided
        log_id = kwargs.get('log_id')
        if log_id:
            try:
                db = SessionLocal()
                email_log = db.query(EmailLog).filter(EmailLog.id == log_id).first()
                if email_log:
                    email_log.status = EmailStatus.FAILED
                    email_log.error_message = str(exc)
                    db.commit()
                db.close()
            except Exception as e:
                logger.error(f"Failed to update email log on failure: {e}")

    def on_success(self, retval, task_id, args, kwargs):
        """Handle task success by updating email log"""
        logger.info(f"Email task {task_id} completed successfully")

        # Update email log if log_id is provided
        log_id = kwargs.get('log_id')
        if log_id and retval and retval.get('success'):
            try:
                db = SessionLocal()
                email_log = db.query(EmailLog).filter(EmailLog.id == log_id).first()
                if email_log:
                    email_log.status = EmailStatus.SENT
                    email_log.ses_message_id = retval.get('message_id')
                    db.commit()
                db.close()
            except Exception as e:
                logger.error(f"Failed to update email log on success: {e}")


@celery_app.task(
    bind=True,
    base=EmailTask,
    max_retries=settings.EMAIL_MAX_RETRIES,
    default_retry_delay=settings.EMAIL_RETRY_DELAY,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_backoff_max=3600,  # Max 1 hour backoff
    retry_jitter=True,
)
def send_email_async(
    self,
    to_email: str,
    subject: str,
    html_body: Optional[str] = None,
    text_body: Optional[str] = None,
    reply_to: Optional[str] = None,
    cc: Optional[List[str]] = None,
    bcc: Optional[List[str]] = None,
    log_id: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Asynchronously send email via AWS SES.

    This task includes automatic retry with exponential backoff.

    Args:
        to_email: Recipient email address
        subject: Email subject line
        html_body: HTML version of email body
        text_body: Plain text version of email body
        reply_to: Reply-To email address
        cc: List of CC email addresses
        bcc: List of BCC email addresses
        log_id: ID of EmailLog record to update

    Returns:
        Dictionary with send result including MessageId

    Raises:
        Retry: If sending fails and retries are available
    """
    try:
        logger.info(f"Sending email to {to_email}: {subject}")

        # Get email service
        email_service = get_email_service()

        # Import asyncio to run async function
        import asyncio

        # Send email (need to run async function in sync context)
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            result = loop.run_until_complete(
                email_service.send_email(
                    to_email=to_email,
                    subject=subject,
                    html_body=html_body,
                    text_body=text_body,
                    reply_to=reply_to,
                    cc=cc,
                    bcc=bcc,
                )
            )
        finally:
            loop.close()

        logger.info(f"Email sent successfully to {to_email}, MessageId: {result.get('message_id')}")
        return result

    except Exception as exc:
        logger.error(f"Error sending email to {to_email}: {exc}")

        # Update log status to failed before retry
        if log_id:
            try:
                db = SessionLocal()
                email_log = db.query(EmailLog).filter(EmailLog.id == log_id).first()
                if email_log:
                    email_log.error_message = str(exc)
                    db.commit()
                db.close()
            except Exception as e:
                logger.error(f"Failed to update email log before retry: {e}")

        # Retry with exponential backoff
        raise self.retry(exc=exc)


@celery_app.task(
    bind=True,
    base=EmailTask,
    max_retries=settings.EMAIL_MAX_RETRIES,
)
def send_template_email_async(
    self,
    to_email: str,
    subject: str,
    template_name: str,
    context: Dict[str, Any],
    reply_to: Optional[str] = None,
    log_id: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Asynchronously send email using a template.

    Args:
        to_email: Recipient email address
        subject: Email subject line
        template_name: Name of template file
        context: Dictionary of template variables
        reply_to: Reply-To email address
        log_id: ID of EmailLog record to update

    Returns:
        Dictionary with send result
    """
    try:
        logger.info(f"Sending template email to {to_email}: {template_name}")

        # Get email service
        email_service = get_email_service()

        # Import asyncio to run async function
        import asyncio

        # Render template and send email
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            result = loop.run_until_complete(
                email_service.send_template_email(
                    to_email=to_email,
                    subject=subject,
                    template_name=template_name,
                    context=context,
                    reply_to=reply_to,
                )
            )
        finally:
            loop.close()

        logger.info(f"Template email sent to {to_email}, MessageId: {result.get('message_id')}")
        return result

    except Exception as exc:
        logger.error(f"Error sending template email to {to_email}: {exc}")
        raise self.retry(exc=exc)


@celery_app.task(bind=True, base=EmailTask)
def send_bulk_emails(
    self,
    emails: List[Dict[str, Any]],
    batch_size: int = 10,
) -> Dict[str, Any]:
    """
    Send multiple emails in batches.

    Args:
        emails: List of email dictionaries, each containing:
            - to_email: Recipient email
            - subject: Email subject
            - html_body or text_body: Email content
            - (optional) reply_to, cc, bcc, log_id
        batch_size: Number of emails to send per batch

    Returns:
        Dictionary with success/failure counts
    """
    logger.info(f"Starting bulk email send: {len(emails)} emails")

    results = {
        "total": len(emails),
        "sent": 0,
        "failed": 0,
        "errors": []
    }

    # Process emails in batches
    for i in range(0, len(emails), batch_size):
        batch = emails[i:i + batch_size]

        for email_data in batch:
            try:
                # Queue individual email task
                send_email_async.delay(**email_data)
                results["sent"] += 1

            except Exception as e:
                logger.error(f"Failed to queue email to {email_data.get('to_email')}: {e}")
                results["failed"] += 1
                results["errors"].append({
                    "email": email_data.get('to_email'),
                    "error": str(e)
                })

    logger.info(f"Bulk email send complete: {results['sent']} sent, {results['failed']} failed")
    return results


@celery_app.task
def cleanup_old_email_logs(days: int = 30) -> Dict[str, Any]:
    """
    Clean up old email logs (can be run periodically via Celery Beat).

    Args:
        days: Number of days to keep logs

    Returns:
        Dictionary with deletion count
    """
    from datetime import datetime, timedelta

    logger.info(f"Cleaning up email logs older than {days} days")

    try:
        db = SessionLocal()
        cutoff_date = datetime.utcnow() - timedelta(days=days)

        deleted = db.query(EmailLog).filter(
            EmailLog.sent_at < cutoff_date
        ).delete()

        db.commit()
        db.close()

        logger.info(f"Deleted {deleted} old email logs")
        return {"deleted": deleted}

    except Exception as e:
        logger.error(f"Error cleaning up email logs: {e}")
        return {"deleted": 0, "error": str(e)}
