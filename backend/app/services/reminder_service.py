"""Email reminder and thank you service for automated email flows (Phase 5.2.4)."""
from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import and_, or_
import logging

from app.models.event import Event
from app.models.guest import Guest, RsvpStatus
from app.tasks.email_tasks import send_template_email_async
from app.core.config import get_settings

settings = get_settings()

logger = logging.getLogger(__name__)


class ReminderService:
    """Service for handling automated reminder and thank you emails."""

    def __init__(self, db: Session):
        self.db = db

    def check_rsvp_deadline_reminders(self) -> dict[str, int]:
        """
        Check for events with upcoming RSVP deadlines and send reminders to pending guests.

        Returns:
            dict: Statistics about reminders sent (queued_count, skipped_count, error_count)
        """
        stats = {"queued_count": 0, "skipped_count": 0, "error_count": 0}

        now = datetime.utcnow()
        reminder_days = settings.REMINDER_DAYS_BEFORE_DEADLINE

        for days_before in reminder_days:
            # Calculate the target date range (with 1-hour window for flexibility)
            target_date = now + timedelta(days=days_before)
            start_window = target_date - timedelta(hours=1)
            end_window = target_date + timedelta(hours=1)

            # Find events with RSVP deadline in this window
            events = self.db.query(Event).filter(
                and_(
                    Event.rsvp_deadline >= start_window,
                    Event.rsvp_deadline <= end_window,
                    Event.rsvp_deadline > now
                )
            ).options(selectinload(Event.planner)).all()

            logger.info(f"Found {len(events)} events with RSVP deadline in {days_before} days")

            for event in events:
                # Find pending guests who haven't been reminded recently
                cooldown_time = now - timedelta(hours=settings.REMINDER_COOLDOWN_HOURS)

                pending_guests = self.db.query(Guest).filter(
                    and_(
                        Guest.event_id == event.id,
                        Guest.rsvp_status == RsvpStatus.PENDING,
                        Guest.invitation_sent_at.isnot(None),
                        Guest.email_notifications_enabled == True,
                        Guest.reminder_emails_enabled == True,
                        or_(
                            Guest.last_reminder_sent_at.is_(None),
                            Guest.last_reminder_sent_at < cooldown_time
                        )
                    )
                ).all()

                logger.info(f"Found {len(pending_guests)} eligible guests for event '{event.name}'")

                for guest in pending_guests:
                    try:
                        self._send_reminder_email(guest, event, "rsvp_deadline")

                        # Update last reminder timestamp
                        guest.last_reminder_sent_at = now
                        self.db.commit()

                        stats["queued_count"] += 1
                    except Exception as e:
                        logger.error(f"Failed to send reminder to {guest.email}: {str(e)}")
                        stats["error_count"] += 1
                        self.db.rollback()

        logger.info(f"RSVP deadline reminders: {stats}")
        return stats

    def check_event_reminders(self) -> dict[str, int]:
        """
        Check for upcoming events and send reminders to attending guests.

        Returns:
            dict: Statistics about reminders sent (queued_count, skipped_count, error_count)
        """
        stats = {"queued_count": 0, "skipped_count": 0, "error_count": 0}

        now = datetime.utcnow()
        reminder_days = settings.REMINDER_DAYS_BEFORE_EVENT

        for days_before in reminder_days:
            # Calculate the target date range (with 1-hour window for flexibility)
            target_date = now + timedelta(days=days_before)
            start_window = target_date - timedelta(hours=1)
            end_window = target_date + timedelta(hours=1)

            # Find events starting in this window
            events = self.db.query(Event).filter(
                and_(
                    Event.start_date >= start_window,
                    Event.start_date <= end_window,
                    Event.start_date > now
                )
            ).options(selectinload(Event.planner)).all()

            logger.info(f"Found {len(events)} events starting in {days_before} days")

            for event in events:
                # Find attending guests who haven't been reminded recently
                cooldown_time = now - timedelta(hours=settings.REMINDER_COOLDOWN_HOURS)

                attending_guests = self.db.query(Guest).filter(
                    and_(
                        Guest.event_id == event.id,
                        Guest.rsvp_status == RsvpStatus.ATTENDING,
                        Guest.email_notifications_enabled == True,
                        Guest.reminder_emails_enabled == True,
                        or_(
                            Guest.last_reminder_sent_at.is_(None),
                            Guest.last_reminder_sent_at < cooldown_time
                        )
                    )
                ).all()

                logger.info(f"Found {len(attending_guests)} eligible guests for event '{event.name}'")

                for guest in attending_guests:
                    try:
                        self._send_reminder_email(guest, event, "event_date")

                        # Update last reminder timestamp
                        guest.last_reminder_sent_at = now
                        self.db.commit()

                        stats["queued_count"] += 1
                    except Exception as e:
                        logger.error(f"Failed to send reminder to {guest.email}: {str(e)}")
                        stats["error_count"] += 1
                        self.db.rollback()

        logger.info(f"Event date reminders: {stats}")
        return stats

    def check_completed_events(self) -> dict[str, int]:
        """
        Check for recently completed events and send thank you emails to attending guests.

        Returns:
            dict: Statistics about thank you emails sent (queued_count, skipped_count, error_count)
        """
        stats = {"queued_count": 0, "skipped_count": 0, "error_count": 0}

        if not settings.THANK_YOU_ENABLED:
            logger.info("Thank you emails are disabled in config")
            return stats

        now = datetime.utcnow()
        days_after = settings.THANK_YOU_DAYS_AFTER_EVENT

        # Calculate the target date range (events that ended X days ago)
        target_date = now - timedelta(days=days_after)
        start_window = target_date - timedelta(hours=12)  # Wider window for completed events
        end_window = target_date + timedelta(hours=12)

        # Find events that ended in this window
        # Use end_date if available, otherwise start_date
        events = self.db.query(Event).filter(
            or_(
                and_(
                    Event.end_date.isnot(None),
                    Event.end_date >= start_window,
                    Event.end_date <= end_window,
                    Event.end_date < now
                ),
                and_(
                    Event.end_date.is_(None),
                    Event.start_date >= start_window,
                    Event.start_date <= end_window,
                    Event.start_date < now
                )
            )
        ).options(selectinload(Event.planner)).all()

        logger.info(f"Found {len(events)} completed events from {days_after} days ago")

        for event in events:
            # Find attending guests who haven't received thank you email
            attending_guests = self.db.query(Guest).filter(
                and_(
                    Guest.event_id == event.id,
                    Guest.rsvp_status == RsvpStatus.ATTENDING,
                    Guest.thank_you_sent_at.is_(None),
                    Guest.email_notifications_enabled == True,
                    Guest.thank_you_emails_enabled == True
                )
            ).all()

            logger.info(f"Found {len(attending_guests)} eligible guests for thank you email for event '{event.name}'")

            for guest in attending_guests:
                try:
                    self._send_thank_you_email(guest, event)

                    # Mark thank you email as sent
                    guest.thank_you_sent_at = now
                    self.db.commit()

                    stats["queued_count"] += 1
                except Exception as e:
                    logger.error(f"Failed to send thank you email to {guest.email}: {str(e)}")
                    stats["error_count"] += 1
                    self.db.rollback()

        logger.info(f"Thank you emails: {stats}")
        return stats

    def _send_reminder_email(self, guest: Guest, event: Event, reminder_type: str) -> None:
        """
        Queue a reminder email for a guest.

        Args:
            guest: Guest to send reminder to
            event: Event the reminder is for
            reminder_type: Type of reminder ("rsvp_deadline" or "event_date")
        """
        from app.services.email_service import EmailService

        email_service = EmailService()

        # Build context for reminder template
        context = email_service.build_template_context(
            guest=guest,
            event=event,
            template_type="reminder"
        )

        # Add reminder-specific context
        context["reminder_type"] = reminder_type
        context["unsubscribe_url"] = f"{settings.FRONTEND_URL}/rsvp/unsubscribe/{guest.unsubscribe_token}" if guest.unsubscribe_token else None

        # Queue the email via Celery
        send_template_email_async.delay(
            to_email=guest.email,
            template_name="reminder",
            context=context,
            email_type="REMINDER",
            event_id=str(event.id),
            guest_id=str(guest.id)
        )

        logger.info(f"Queued {reminder_type} reminder email to {guest.email} for event '{event.name}'")

    def _send_thank_you_email(self, guest: Guest, event: Event) -> None:
        """
        Queue a thank you email for a guest.

        Args:
            guest: Guest to send thank you to
            event: Event the thank you is for
        """
        from app.services.email_service import EmailService

        email_service = EmailService()

        # Build context for thank you template
        context = email_service.build_template_context(
            guest=guest,
            event=event,
            template_type="thank_you"
        )

        # Add unsubscribe link
        context["unsubscribe_url"] = f"{settings.FRONTEND_URL}/rsvp/unsubscribe/{guest.unsubscribe_token}" if guest.unsubscribe_token else None

        # Queue the email via Celery
        send_template_email_async.delay(
            to_email=guest.email,
            template_name="thank_you",
            context=context,
            email_type="THANK_YOU",
            event_id=str(event.id),
            guest_id=str(guest.id)
        )

        logger.info(f"Queued thank you email to {guest.email} for event '{event.name}'")


def send_reminder_batch(db: Session) -> dict[str, dict[str, int]]:
    """
    Batch process for sending reminder emails.
    Called by Celery Beat periodic task.

    Returns:
        dict: Statistics for each reminder type
    """
    service = ReminderService(db)

    results = {
        "rsvp_deadline": service.check_rsvp_deadline_reminders(),
        "event_date": service.check_event_reminders(),
        "thank_you": service.check_completed_events()
    }

    logger.info(f"Reminder batch completed: {results}")
    return results
