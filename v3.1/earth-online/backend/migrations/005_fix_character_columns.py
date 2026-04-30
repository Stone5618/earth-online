"""Fix character table columns.

Revision ID: 005
Revises: 004
Create Date: 2026-04-29
"""
from alembic import op
import sqlalchemy as sa


def upgrade():
    # Add missing columns to characters table
    with op.batch_alter_table('characters', schema=None) as batch_op:
        batch_op.add_column(sa.Column('spouse_name', sa.String(length=100), nullable=True))
        batch_op.add_column(sa.Column('spouse_quality', sa.Integer(), default=0))


def downgrade():
    # Remove columns from characters table
    with op.batch_alter_table('characters', schema=None) as batch_op:
        batch_op.drop_column('spouse_quality')
        batch_op.drop_column('spouse_name')
