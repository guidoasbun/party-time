"""
Email Campaign Service for bulk invitation sending.

FR-7: The system shall send email invitations
5.2.3: Email Campaign Interface

This service provides:
- Bulk invitation sending with recipient filtering
- Guest selection based on RSVP status or invitation status
- Campaign statistics and tracking
- Guest invitation timestamp updates
"""

import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
from uuid import UUID
from sqlalchemy import select, and_, or_, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.guest import Guest, RsvpStatus
from app.models.event import Event
from app.models.email_log import EmailLog, EmailStatus, EmailType as EmailLogType
from app.schemas.email import (
    RecipientFilter,
    BulkInvitationRequest,
    BulkInvitationResponse,
    CampaignStatsResponse
)
from app.services.email_service import EmailService
from app.core.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)


class EmailCampaignService:
    """Service for managing email campaigns and bulk invitations"""

    def __init__(self):
        self.email_service = EmailService()
        self.default_subject = "You're Invited! {event_name}"

    async def send_bulk_invitations(
        self,
        event_id: UUID,
        request: BulkInvitationRequest,
        db: AsyncSession
    ) -> BulkInvitationResponse:
        """
        Send bulk invitation emails to selected guests.

        Args:
            event_id: Event UUID
            request: Bulk invitation request with filters and options
            db: Database session

        Returns:
            BulkInvitationResponse with campaign statistics
        """
        logger.info(f"Starting bulk invitation campaign for event {event_id}")
        logger.info(f"Recipient filter: {request.recipient_filter}, exclude_invited: {request.exclude_already_invited}")

        # 1. Fetch event
        event = await self._get_event(event_id, db)
        if not event:
            raise ValueError(f"Event {event_id} not found")

        # 2. Select recipients based on filter
        recipients = await self._select_recipients(
            event_id=event_id,
            recipient_filter=request.recipient_filter,
            guest_ids=request.guest_ids,
            exclude_already_invited=request.exclude_already_invited,
            db=db
        )

        total_recipients = len(recipients)
        logger.info(f"Selected {total_recipients} recipients for campaign")

        if total_recipients == 0:
            return BulkInvitationResponse(
                total_recipients=0,
                queued=0,
                failed=0,
                excluded=0,
                status="completed",
                error_messages=["No recipients match the selected criteria"]
            )

        # 3. Build email list for Celery task
        emails_to_send = []
        subject = request.subject_override or self.default_subject.format(event_name=event.name)

        for guest in recipients:
            # Build context for invitation template
            context = self.email_service.build_template_context(
                event=event,
                guest=guest,
                custom_data={
                    "rsvp_url": f"{settings.FRONTEND_URL}/rsvp/{guest.rsvp_token}",
                }
            )

            emails_to_send.append({
                "to_email": guest.email,
                "subject": subject,
                "template_name": "invitation",
                "context": context,
                "event_id": str(event_id),
                "guest_id": str(guest.id),
                "email_type": "invitation"
            })

        # 4. Handle test mode
        if request.test_mode:
            logger.info("Test mode enabled - not sending emails")
            return BulkInvitationResponse(
                total_recipients=total_recipients,
                queued=0,
                failed=0,
                status="test_mode"
            )

        # 5. Handle scheduling (future enhancement - for now just send immediately)
        if request.send_at:
            logger.warning("Scheduled sending not yet implemented - sending immediately instead")

        # 6. Queue emails via Celery task
        try:
            # Import here to avoid circular imports
            from app.tasks.email_tasks import send_bulk_emails

            # Use existing send_bulk_emails Celery task
            task_result = send_bulk_emails.delay(emails_to_send, batch_size=10)
            logger.info(f"Queued {len(emails_to_send)} emails via Celery task {task_result.id}")

            # 7. Update guest invitation timestamps
            guest_ids = [guest.id for guest in recipients]
            await self._update_invitation_timestamps(guest_ids, db)

            # 8. Create email log entries (in queued status)
            await self._create_email_logs(event_id, recipients, subject, db)

            return BulkInvitationResponse(
                campaign_id=None,  # Future: store campaign ID for tracking
                total_recipients=total_recipients,
                queued=len(emails_to_send),
                failed=0,
                excluded=0,
                status="queued"
            )

        except Exception as e:
            logger.error(f"Failed to queue bulk emails: {str(e)}")
            return BulkInvitationResponse(
                total_recipients=total_recipients,
                queued=0,
                failed=total_recipients,
                status="failed",
                error_messages=[str(e)]
            )

    async def get_campaign_stats(
        self,
        event_id: UUID,
        db: AsyncSession
    ) -> CampaignStatsResponse:
        """
        Get campaign delivery statistics for an event.

        Args:
            event_id: Event UUID
            db: Database session

        Returns:
            CampaignStatsResponse with delivery metrics
        """
        # Query email logs for invitation emails
        query = select(
            func.count(EmailLog.id).label('total'),
            func.count(EmailLog.id).filter(EmailLog.status == EmailStatus.SENT).label('sent'),
            func.count(EmailLog.id).filter(EmailLog.status == EmailStatus.DELIVERED).label('delivered'),
            func.count(EmailLog.id).filter(EmailLog.status == EmailStatus.FAILED).label('failed'),
            func.count(EmailLog.id).filter(EmailLog.status == EmailStatus.BOUNCED).label('bounced'),
            func.count(EmailLog.id).filter(EmailLog.status == EmailStatus.COMPLAINED).label('complained'),
            func.count(EmailLog.id).filter(EmailLog.status == EmailStatus.QUEUED).label('pending'),
        ).where(
            and_(
                EmailLog.event_id == event_id,
                EmailLog.email_type == EmailLogType.INVITATION
            )
        )

        result = await db.execute(query)
        row = result.first()

        total = row.total if row else 0
        sent = row.sent if row else 0
        delivered = row.delivered if row else 0
        failed = row.failed if row else 0
        bounced = row.bounced if row else 0
        complained = row.complained if row else 0
        pending = row.pending if row else 0

        # Calculate delivery rate
        delivery_rate = (delivered / total * 100) if total > 0 else 0.0

        return CampaignStatsResponse(
            total_invitations=total,
            sent=sent,
            delivered=delivered,
            failed=failed,
            bounced=bounced,
            complained=complained,
            pending=pending,
            delivery_rate=round(delivery_rate, 2)
        )

    async def _get_event(self, event_id: UUID, db: AsyncSession) -> Optional[Event]:
        """Fetch event by ID"""
        query = select(Event).where(Event.id == event_id)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    async def _select_recipients(
        self,
        event_id: UUID,
        recipient_filter: RecipientFilter,
        guest_ids: Optional[List[UUID]],
        exclude_already_invited: bool,
        db: AsyncSession
    ) -> List[Guest]:
        """
        Select guest recipients based on filter criteria.

        Args:
            event_id: Event UUID
            recipient_filter: Filter type (all, not_invited, pending_rsvp, etc.)
            guest_ids: Specific guest IDs (for custom filter)
            exclude_already_invited: Whether to exclude guests with invitation_sent_at set
            db: Database session

        Returns:
            List of Guest objects matching criteria
        """
        # Base query: guests for this event with valid email
        query = select(Guest).where(
            and_(
                Guest.event_id == event_id,
                Guest.email.isnot(None),
                Guest.email != ""
            )
        )

        # Apply recipient filter
        if recipient_filter == RecipientFilter.NOT_INVITED:
            query = query.where(Guest.invitation_sent_at.is_(None))

        elif recipient_filter == RecipientFilter.PENDING_RSVP:
            query = query.where(Guest.rsvp_status == RsvpStatus.PENDING)

        elif recipient_filter == RecipientFilter.ATTENDING:
            query = query.where(Guest.rsvp_status == RsvpStatus.ATTENDING)

        elif recipient_filter == RecipientFilter.NOT_ATTENDING:
            query = query.where(Guest.rsvp_status == RsvpStatus.NOT_ATTENDING)

        elif recipient_filter == RecipientFilter.MAYBE:
            query = query.where(Guest.rsvp_status == RsvpStatus.MAYBE)

        elif recipient_filter == RecipientFilter.CUSTOM:
            if not guest_ids:
                raise ValueError("guest_ids required when recipient_filter is 'custom'")
            query = query.where(Guest.id.in_(guest_ids))

        elif recipient_filter == RecipientFilter.ALL:
            # No additional filter - send to all guests
            pass

        # Apply exclude_already_invited filter
        if exclude_already_invited and recipient_filter != RecipientFilter.NOT_INVITED:
            query = query.where(Guest.invitation_sent_at.is_(None))

        # Execute query
        result = await db.execute(query)
        guests = result.scalars().all()

        return list(guests)

    async def _update_invitation_timestamps(
        self,
        guest_ids: List[UUID],
        db: AsyncSession
    ) -> None:
        """
        Update invitation_sent_at timestamp for selected guests.

        Args:
            guest_ids: List of guest UUIDs
            db: Database session
        """
        now = datetime.utcnow()

        # Fetch guests and update
        query = select(Guest).where(Guest.id.in_(guest_ids))
        result = await db.execute(query)
        guests = result.scalars().all()

        for guest in guests:
            guest.invitation_sent_at = now

        await db.commit()
        logger.info(f"Updated invitation_sent_at for {len(guest_ids)} guests")

    async def _create_email_logs(
        self,
        event_id: UUID,
        guests: List[Guest],
        subject: str,
        db: AsyncSession
    ) -> None:
        """
        Create email log entries for sent invitations.

        Args:
            event_id: Event UUID
            guests: List of guest recipients
            subject: Email subject line
            db: Database session
        """
        email_logs = []

        for guest in guests:
            log = EmailLog(
                event_id=event_id,
                guest_id=guest.id,
                recipient_email=guest.email,
                subject=subject,
                email_type=EmailLogType.INVITATION,
                status=EmailStatus.QUEUED
            )
            email_logs.append(log)

        db.add_all(email_logs)
        await db.commit()
        logger.info(f"Created {len(email_logs)} email log entries")
