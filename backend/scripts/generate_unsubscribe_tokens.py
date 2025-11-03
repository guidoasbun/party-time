"""Generate unsubscribe tokens for existing guests.

    FR-7: Email Automation
    Phase 5.2.4: Automated Email Flows - Unsubscribe Page
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.db.session import SessionLocal
from app.models.guest import Guest
from app.utils.token_generator import generate_rsvp_token


def generate_unsubscribe_tokens():
    """Generate unsubscribe tokens for all guests that don't have one."""
    db = SessionLocal()

    try:
        # Find guests without unsubscribe tokens
        guests_without_tokens = db.query(Guest).filter(
            Guest.unsubscribe_token.is_(None)
        ).all()

        print(f"Found {len(guests_without_tokens)} guests without unsubscribe tokens")

        # Generate tokens
        for guest in guests_without_tokens:
            guest.unsubscribe_token = generate_rsvp_token()

        db.commit()
        print(f"Successfully generated {len(guests_without_tokens)} unsubscribe tokens")

        # Verify
        total_guests = db.query(Guest).count()
        guests_with_tokens = db.query(Guest).filter(
            Guest.unsubscribe_token.isnot(None)
        ).count()

        print(f"\nVerification:")
        print(f"  Total guests: {total_guests}")
        print(f"  Guests with unsubscribe tokens: {guests_with_tokens}")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    generate_unsubscribe_tokens()
