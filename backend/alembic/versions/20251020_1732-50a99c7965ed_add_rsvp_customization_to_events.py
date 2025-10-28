"""add_rsvp_customization_to_events

Revision ID: 50a99c7965ed
Revises: ae6cbe0f317d
Create Date: 2025-10-20 17:32:57.476018+00:00

FR-6: The system shall display an RSVP submission page.
5.1.4: RSVP Customization
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '50a99c7965ed'
down_revision: Union[str, None] = 'ae6cbe0f317d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Apply migration - Add RSVP customization fields to events table."""
    # Add RSVP deadline
    op.add_column('events', sa.Column('rsvp_deadline', sa.DateTime(timezone=True), nullable=True))

    # Add plus-one setting
    op.add_column('events', sa.Column('allow_plus_ones', sa.Boolean(), nullable=False, server_default='false'))

    # Add meal options (JSON array)
    op.add_column('events', sa.Column('meal_options', sa.dialects.postgresql.JSONB(), nullable=True))

    # Add custom questions (JSON array)
    op.add_column('events', sa.Column('custom_questions', sa.dialects.postgresql.JSONB(), nullable=True))

    # Add dietary restrictions toggle
    op.add_column('events', sa.Column('dietary_restrictions_enabled', sa.Boolean(), nullable=False, server_default='false'))


def downgrade() -> None:
    """Revert migration - Remove RSVP customization fields."""
    op.drop_column('events', 'dietary_restrictions_enabled')
    op.drop_column('events', 'custom_questions')
    op.drop_column('events', 'meal_options')
    op.drop_column('events', 'allow_plus_ones')
    op.drop_column('events', 'rsvp_deadline')