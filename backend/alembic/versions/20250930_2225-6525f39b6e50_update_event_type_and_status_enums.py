"""update_event_type_and_status_enums

Revision ID: 6525f39b6e50
Revises: 56068ac2044e
Create Date: 2025-09-30 22:25:14.885640+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6525f39b6e50'
down_revision: Union[str, None] = '56068ac2044e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Apply migration."""
    # Add new values to EventType enum
    op.execute("ALTER TYPE eventtype ADD VALUE IF NOT EXISTS 'ANNIVERSARY'")
    op.execute("ALTER TYPE eventtype ADD VALUE IF NOT EXISTS 'BABY_SHOWER'")
    op.execute("ALTER TYPE eventtype ADD VALUE IF NOT EXISTS 'BRIDAL_SHOWER'")
    op.execute("ALTER TYPE eventtype ADD VALUE IF NOT EXISTS 'CONFERENCE'")
    op.execute("ALTER TYPE eventtype ADD VALUE IF NOT EXISTS 'WORKSHOP'")
    op.execute("ALTER TYPE eventtype ADD VALUE IF NOT EXISTS 'FUNDRAISER'")
    op.execute("ALTER TYPE eventtype ADD VALUE IF NOT EXISTS 'HOLIDAY_PARTY'")
    op.execute("ALTER TYPE eventtype ADD VALUE IF NOT EXISTS 'REUNION'")

    # Add new values to EventStatus enum
    op.execute("ALTER TYPE eventstatus ADD VALUE IF NOT EXISTS 'PLANNING'")
    op.execute("ALTER TYPE eventstatus ADD VALUE IF NOT EXISTS 'CONFIRMED'")
    op.execute("ALTER TYPE eventstatus ADD VALUE IF NOT EXISTS 'IN_PROGRESS'")
    op.execute("ALTER TYPE eventstatus ADD VALUE IF NOT EXISTS 'POSTPONED'")


def downgrade() -> None:
    """Revert migration."""
    # Note: PostgreSQL does not support removing enum values easily
    # This would require recreating the enum type, which is complex
    # For production, consider a more sophisticated approach
    pass