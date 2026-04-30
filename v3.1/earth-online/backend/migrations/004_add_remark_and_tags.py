"""Add remark and tags columns to users table.

Revision ID: 004
Revises: 003
Create Date: 2026-04-29
"""
from alembic import op
import sqlalchemy as sa


def upgrade():
    # Add remark and tags columns to users table
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('remark', sa.String(length=500), nullable=True))
        batch_op.add_column(sa.Column('tags', sa.JSON(), nullable=True))


def downgrade():
    # Remove remark and tags columns from users table
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_column('tags')
        batch_op.drop_column('remark')
