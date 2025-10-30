"""add_email_automation_columns

FR-7: Email Automation
Phase 5.2.4: Automated Email Flows - Unsubscribe Page

Revision ID: 3ef72cb03241
Revises: e8a5cd0d1b28
Create Date: 2025-10-30 20:55:25.354389+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3ef72cb03241'
down_revision: Union[str, None] = 'e8a5cd0d1b28'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Apply migration."""
    # Add email automation columns to guests table
    op.add_column('guests', sa.Column('last_reminder_sent_at', sa.DateTime(), nullable=True))
    op.add_column('guests', sa.Column('thank_you_sent_at', sa.DateTime(), nullable=True))
    op.add_column('guests', sa.Column('email_notifications_enabled', sa.Boolean(), nullable=False, server_default='true'))
    op.add_column('guests', sa.Column('reminder_emails_enabled', sa.Boolean(), nullable=False, server_default='true'))
    op.add_column('guests', sa.Column('thank_you_emails_enabled', sa.Boolean(), nullable=False, server_default='true'))
    op.add_column('guests', sa.Column('unsubscribe_token', sa.String(length=255), nullable=True))

    # Add unique constraint on unsubscribe_token
    op.create_index(op.f('ix_guests_unsubscribe_token'), 'guests', ['unsubscribe_token'], unique=True)


def downgrade() -> None:
    """Revert migration."""
    # Remove index and columns in reverse order
    op.drop_index(op.f('ix_guests_unsubscribe_token'), table_name='guests')
    op.drop_column('guests', 'unsubscribe_token')
    op.drop_column('guests', 'thank_you_emails_enabled')
    op.drop_column('guests', 'reminder_emails_enabled')
    op.drop_column('guests', 'email_notifications_enabled')
    op.drop_column('guests', 'thank_you_sent_at')
    op.drop_column('guests', 'last_reminder_sent_at')