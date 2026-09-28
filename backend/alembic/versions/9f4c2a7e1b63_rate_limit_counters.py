"""rate limiting counters

Adds the rate_limit_counters table backing app/core/rate_limit.py
(fixed-window counters shared across backend instances).

Safe to apply to fresh databases via `alembic upgrade head`.
On the existing production database, apply ONLY after it has been
stamped to the baseline (8372f2bcb026); this revision then creates
just this one new table and nothing else.

Revision ID: 9f4c2a7e1b63
Revises: 8372f2bcb026
Create Date: 2026-09-28

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '9f4c2a7e1b63'
down_revision: Union[str, None] = '8372f2bcb026'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'rate_limit_counters',
        sa.Column('key', sa.String(length=255), nullable=False),
        sa.Column('window_start', sa.DateTime(), nullable=False),
        sa.Column('count', sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint('key')
    )
    op.create_index(
        'ix_rate_limit_counters_window_start',
        'rate_limit_counters',
        ['window_start'],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        'ix_rate_limit_counters_window_start',
        table_name='rate_limit_counters',
    )
    op.drop_table('rate_limit_counters')
