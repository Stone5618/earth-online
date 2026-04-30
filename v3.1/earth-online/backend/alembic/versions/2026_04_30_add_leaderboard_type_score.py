"""Add type and score columns to leaderboard_records.

Revision ID: add_leaderboard_type_score
Revises:
Create Date: 2026-04-30 15:32:00
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'add_leaderboard_type_score'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('leaderboard_records', sa.Column('type', sa.String(length=50), nullable=False, server_default='life_score'))
    op.add_column('leaderboard_records', sa.Column('score', sa.Float(), nullable=False, server_default='0'))
    op.create_index('idx_leaderboard_type', 'leaderboard_records', ['type'])


def downgrade() -> None:
    op.drop_index('idx_leaderboard_type', table_name='leaderboard_records')
    op.drop_column('leaderboard_records', 'score')
    op.drop_column('leaderboard_records', 'type')
