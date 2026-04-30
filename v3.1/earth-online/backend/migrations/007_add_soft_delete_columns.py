"""Add deleted_at soft-delete columns to core tables.

Revision ID: 007
Revises: 006
Create Date: 2026-04-30
"""
from alembic import op
import sqlalchemy as sa


def upgrade():
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True))

    with op.batch_alter_table('system_config', schema=None) as batch_op:
        batch_op.add_column(sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True))

    with op.batch_alter_table('event_templates', schema=None) as batch_op:
        batch_op.add_column(sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True))


def downgrade():
    with op.batch_alter_table('event_templates', schema=None) as batch_op:
        batch_op.drop_column('deleted_at')

    with op.batch_alter_table('system_config', schema=None) as batch_op:
        batch_op.drop_column('deleted_at')

    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_column('deleted_at')
