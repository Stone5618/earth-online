"""Add event chain, era trigger, and outcome fields to event_templates.

Revision ID: add_event_template_fields
Revises: add_leaderboard_type_score
Create Date: 2026-05-01 10:00:00
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'add_event_template_fields'
down_revision: Union[str, None] = 'add_leaderboard_type_score'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('event_templates', sa.Column('cooldown_years', sa.Integer(), server_default='0', nullable=False))
    op.add_column('event_templates', sa.Column('is_chain_event', sa.Boolean(), server_default='false', nullable=False))
    op.add_column('event_templates', sa.Column('chain_id', sa.String(length=50), nullable=True))
    op.add_column('event_templates', sa.Column('step_id', sa.String(length=50), nullable=True))
    op.add_column('event_templates', sa.Column('immediate', sa.Boolean(), server_default='false', nullable=False))
    op.add_column('event_templates', sa.Column('era_trigger', sa.String(length=50), nullable=True))
    op.add_column('event_templates', sa.Column('outcome_weighted', sa.Boolean(), server_default='false', nullable=False))


def downgrade() -> None:
    op.drop_column('event_templates', 'outcome_weighted')
    op.drop_column('event_templates', 'era_trigger')
    op.drop_column('event_templates', 'immediate')
    op.drop_column('event_templates', 'step_id')
    op.drop_column('event_templates', 'chain_id')
    op.drop_column('event_templates', 'is_chain_event')
    op.drop_column('event_templates', 'cooldown_years')
