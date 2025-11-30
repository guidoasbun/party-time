"""add_event_venues_table
FR-8: The system shall provide a venue search interface.
Phase 7.1.1: Google Places API Integration

Phase 7.1.1: Google Places API Integration
Creates event_venues table for storing venue information linked to events.
Supports multiple venues per event (1:many relationship).
Uses hybrid storage: basic info stored locally + google_place_id for fresh details.

Revision ID: a1b2c3d4e5f6
Revises: 704a4e491e23
Create Date: 2025-11-30 12:00:00.000000+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '704a4e491e23'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Apply migration - create event_venues table."""
    op.create_table(
        'event_venues',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('event_id', sa.UUID(), nullable=False),
        # Basic venue information
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('address', sa.String(length=500), nullable=False),
        sa.Column('latitude', sa.Float(), nullable=False),
        sa.Column('longitude', sa.Float(), nullable=False),
        # Google Places reference
        sa.Column('google_place_id', sa.String(length=255), nullable=True),
        # Cached data from Google Places
        sa.Column('phone', sa.String(length=50), nullable=True),
        sa.Column('website', sa.String(length=500), nullable=True),
        sa.Column('rating', sa.Float(), nullable=True),
        sa.Column('price_level', sa.Integer(), nullable=True),
        sa.Column('photo_url', sa.Text(), nullable=True),
        # Manual venue flag and notes
        sa.Column('is_manual', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('notes', sa.Text(), nullable=True),
        # Display ordering
        sa.Column('display_order', sa.Integer(), nullable=False, server_default='0'),
        # Timestamps
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        # Constraints
        sa.ForeignKeyConstraint(['event_id'], ['events.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    # Create indexes for common queries
    op.create_index(op.f('ix_event_venues_event_id'), 'event_venues', ['event_id'], unique=False)
    op.create_index(op.f('ix_event_venues_google_place_id'), 'event_venues', ['google_place_id'], unique=False)


def downgrade() -> None:
    """Revert migration - drop event_venues table."""
    op.drop_index(op.f('ix_event_venues_google_place_id'), table_name='event_venues')
    op.drop_index(op.f('ix_event_venues_event_id'), table_name='event_venues')
    op.drop_table('event_venues')
