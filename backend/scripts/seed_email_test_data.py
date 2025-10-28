"""
Seed script for creating test email log data.

FR-7: The system shall send email invitations
5.2.1: Email Service Setup

This script populates the email_logs table with sample data for testing
the email logs and statistics endpoints without sending real emails.

Usage:
    python scripts/seed_email_test_data.py
"""

import sys
import os
from pathlib import Path
from datetime import datetime, timedelta
import random
import uuid

# Add backend directory to Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import get_settings
from app.models.email_log import EmailLog, EmailType, EmailStatus

settings = get_settings()


def create_test_email_logs(session, count=50):
    """
    Create test email log entries.

    Args:
        session: Database session
        count: Number of email logs to create
    """
    print(f"\n🔧 Creating {count} test email log entries...")

    # Email types distribution
    email_types = [
        (EmailType.TEST, 0.3),        # 30% test emails
        (EmailType.INVITATION, 0.3),   # 30% invitations
        (EmailType.CONFIRMATION, 0.15),# 15% confirmations
        (EmailType.REMINDER, 0.15),    # 15% reminders
        (EmailType.THANK_YOU, 0.05),   # 5% thank you
        (EmailType.CAMPAIGN, 0.03),    # 3% campaigns
        (EmailType.SYSTEM, 0.02),      # 2% system
    ]

    # Status distribution
    status_distribution = [
        (EmailStatus.SENT, 0.70),      # 70% sent successfully
        (EmailStatus.DELIVERED, 0.20),  # 20% confirmed delivered
        (EmailStatus.FAILED, 0.05),     # 5% failed
        (EmailStatus.BOUNCED, 0.03),    # 3% bounced
        (EmailStatus.COMPLAINED, 0.02), # 2% complained
    ]

    # Sample recipients
    recipients = [
        "test1@example.com",
        "test2@example.com",
        "john.doe@example.com",
        "jane.smith@example.com",
        "alice@demo.com",
        "bob@demo.com",
        "charlie@test.org",
        "diana@test.org",
    ]

    # Sample subjects by type
    subjects = {
        EmailType.TEST: [
            "Test Email - System Check",
            "Email Service Test",
            "Template Rendering Test",
        ],
        EmailType.INVITATION: [
            "You're Invited! - Sarah's Wedding",
            "Join us for John's 30th Birthday Party",
            "Corporate Event Invitation - Annual Gala",
        ],
        EmailType.CONFIRMATION: [
            "RSVP Confirmed - Thank You!",
            "Your Attendance is Confirmed",
            "Event Confirmation - Details Inside",
        ],
        EmailType.REMINDER: [
            "Reminder: Event Tomorrow!",
            "Don't Forget - RSVP Deadline in 3 Days",
            "One Week Until the Party!",
        ],
        EmailType.THANK_YOU: [
            "Thank You for Attending!",
            "We Appreciate Your Presence",
            "Thanks for Celebrating With Us",
        ],
        EmailType.CAMPAIGN: [
            "Special Offer for Event Planning",
            "Newsletter - Party Planning Tips",
            "Exclusive Discount Inside",
        ],
        EmailType.SYSTEM: [
            "Account Notification",
            "System Update",
            "Password Reset Request",
        ],
    }

    created_count = 0
    now = datetime.utcnow()

    for i in range(count):
        # Select email type based on distribution
        email_type = random.choices(
            [t for t, _ in email_types],
            weights=[w for _, w in email_types]
        )[0]

        # Select status based on distribution
        status = random.choices(
            [s for s, _ in status_distribution],
            weights=[w for _, w in status_distribution]
        )[0]

        # Random date in last 90 days
        days_ago = random.randint(0, 90)
        hours_ago = random.randint(0, 23)
        minutes_ago = random.randint(0, 59)
        sent_at = now - timedelta(days=days_ago, hours=hours_ago, minutes=minutes_ago)

        # If delivered, set delivered_at slightly after sent_at
        delivered_at = None
        if status == EmailStatus.DELIVERED:
            delivered_at = sent_at + timedelta(minutes=random.randint(1, 30))

        # Generate error message for failed/bounced
        error_message = None
        if status == EmailStatus.FAILED:
            errors = [
                "Connection timeout",
                "Invalid recipient",
                "Service temporarily unavailable",
            ]
            error_message = random.choice(errors)
        elif status == EmailStatus.BOUNCED:
            error_message = "Mailbox full or does not exist"
        elif status == EmailStatus.COMPLAINED:
            error_message = "Recipient marked as spam"

        # Create email log
        email_log = EmailLog(
            id=uuid.uuid4(),
            recipient_email=random.choice(recipients),
            subject=random.choice(subjects[email_type]),
            email_type=email_type,
            status=status,
            ses_message_id=f"{uuid.uuid4().hex[:16]}-{uuid.uuid4().hex[:8]}" if status != EmailStatus.FAILED else None,
            sent_at=sent_at if status != EmailStatus.QUEUED else None,
            delivered_at=delivered_at,
            error_message=error_message,
            created_at=sent_at - timedelta(seconds=random.randint(1, 60)),
            updated_at=delivered_at or sent_at,
        )

        session.add(email_log)
        created_count += 1

        # Progress indicator
        if (i + 1) % 10 == 0:
            print(f"  Created {i + 1}/{count} email logs...")

    session.commit()
    print(f"✅ Successfully created {created_count} email log entries!")

    return created_count


def print_statistics(session):
    """Print statistics about created email logs."""
    print("\n📊 Email Log Statistics:")
    print("=" * 50)

    # Total count
    total = session.query(EmailLog).count()
    print(f"Total email logs: {total}")

    # Count by type
    print("\nBy Email Type:")
    for email_type in EmailType:
        count = session.query(EmailLog).filter(EmailLog.email_type == email_type).count()
        if count > 0:
            print(f"  {email_type.value:15} {count:3} ({count/total*100:5.1f}%)")

    # Count by status
    print("\nBy Status:")
    for status in EmailStatus:
        count = session.query(EmailLog).filter(EmailLog.status == status).count()
        if count > 0:
            print(f"  {status.value:15} {count:3} ({count/total*100:5.1f}%)")

    # Date range
    oldest = session.query(EmailLog).order_by(EmailLog.sent_at.asc()).first()
    newest = session.query(EmailLog).order_by(EmailLog.sent_at.desc()).first()

    if oldest and newest:
        print(f"\nDate Range:")
        print(f"  Oldest: {oldest.sent_at.strftime('%Y-%m-%d %H:%M')}")
        print(f"  Newest: {newest.sent_at.strftime('%Y-%m-%d %H:%M')}")

    print("=" * 50)


def main():
    """Main execution function."""
    print("\n" + "=" * 50)
    print("   EMAIL TEST DATA SEEDING SCRIPT")
    print("=" * 50)

    # Create database engine and session
    # Convert async URL to sync for seeding script
    db_url = settings.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
    if "postgresql://" not in db_url:
        db_url = settings.DATABASE_URL.replace("postgresql://", "postgresql://")

    print(f"\nConnecting to database...")
    engine = create_engine(db_url)
    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()

    try:
        # Check if email_logs table exists
        from sqlalchemy import inspect
        inspector = inspect(engine)
        if 'email_logs' not in inspector.get_table_names():
            print("\n❌ ERROR: email_logs table not found!")
            print("   Run database migration first:")
            print("   alembic upgrade head")
            return

        # Check existing count
        existing_count = session.query(EmailLog).count()
        print(f"Existing email logs in database: {existing_count}")

        if existing_count > 0:
            response = input(f"\n⚠️  Found {existing_count} existing email logs. Delete them? (yes/no): ")
            if response.lower() in ['yes', 'y']:
                session.query(EmailLog).delete()
                session.commit()
                print(f"✅ Deleted {existing_count} existing email logs")
            else:
                print("Keeping existing logs. New logs will be added.")

        # Create test data
        count = input("\nHow many test email logs to create? (default: 50): ").strip()
        count = int(count) if count.isdigit() else 50

        created = create_test_email_logs(session, count)

        # Print statistics
        print_statistics(session)

        print("\n✅ Seeding complete!")
        print("\n📝 Next steps:")
        print("   1. Open Postman")
        print("   2. Import Email-API-Tests.postman_collection.json")
        print("   3. Select 'Email API - Local (No AWS)' environment")
        print("   4. Run folder: '3. Email Logs'")
        print("   5. Run folder: '4. Email Statistics'")

    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        session.rollback()
        raise
    finally:
        session.close()


if __name__ == "__main__":
    main()
