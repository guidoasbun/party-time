"""migrate_long_tokens_to_short_format

Revision ID: ae6cbe0f317d
Revises: 14cfb6b4f6bd
Create Date: 2025-10-15 21:41:30.474191+00:00

Migrates existing 64-character hex tokens to 8-character alphanumeric format.
"""
from typing import Sequence, Union
import secrets
import string

from alembic import op
import sqlalchemy as sa
from sqlalchemy import text


# revision identifiers, used by Alembic.
revision: str = 'ae6cbe0f317d'
down_revision: Union[str, None] = '14cfb6b4f6bd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def generate_short_token() -> str:
    """Generate 8-character alphanumeric token (A-Z, 0-9)."""
    alphabet = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(8))


def upgrade() -> None:
    """
    Migrate all guests with long tokens (>8 chars) to short format.

    This migration:
    1. Finds all guests with tokens longer than 8 characters
    2. Generates new unique 8-character tokens for them
    3. Updates the database with new tokens
    """
    connection = op.get_bind()

    # Get all guests with long tokens
    result = connection.execute(text(
        "SELECT id, rsvp_token FROM guests WHERE LENGTH(rsvp_token) > 8"
    ))

    long_token_guests = result.fetchall()

    if not long_token_guests:
        print("✓ No long tokens found - all guests already have short format tokens")
        return

    print(f"Found {len(long_token_guests)} guests with long tokens")

    # Track generated tokens to ensure uniqueness
    existing_tokens = set()

    # Get all current short tokens to avoid collisions
    short_tokens_result = connection.execute(text(
        "SELECT rsvp_token FROM guests WHERE LENGTH(rsvp_token) = 8"
    ))
    for row in short_tokens_result:
        existing_tokens.add(row[0])

    # Update each guest with a new unique short token
    updated_count = 0
    for guest_id, old_token in long_token_guests:
        # Generate unique token
        max_retries = 100
        for attempt in range(max_retries):
            new_token = generate_short_token()
            if new_token not in existing_tokens:
                existing_tokens.add(new_token)
                break
            if attempt == max_retries - 1:
                raise RuntimeError(f"Failed to generate unique token for guest {guest_id}")

        # Update database
        connection.execute(
            text("UPDATE guests SET rsvp_token = :new_token WHERE id = :guest_id"),
            {"new_token": new_token, "guest_id": str(guest_id)}
        )
        updated_count += 1

        if updated_count % 100 == 0:
            print(f"  Migrated {updated_count}/{len(long_token_guests)} tokens...")

    connection.commit()
    print(f"✓ Successfully migrated {updated_count} tokens to short format")


def downgrade() -> None:
    """
    Revert migration (not implemented).

    Note: Cannot automatically restore original long tokens as they were not stored.
    If needed, this would require backing up the old tokens before running upgrade.
    """
    print("⚠ Downgrade not supported - original long tokens were not backed up")
    print("  If you need to revert, restore from a database backup taken before migration")