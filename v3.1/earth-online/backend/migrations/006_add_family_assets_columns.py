"""Add family, assets and career columns to characters table.

Revision ID: 006
Revises: 005
Create Date: 2026-04-29
"""
from alembic import op
import sqlalchemy as sa


def upgrade():
    # Add missing columns to characters table
    with op.batch_alter_table('characters', schema=None) as batch_op:
        # 职业系统
        batch_op.add_column(sa.Column('career_title', sa.String(length=100), nullable=True, server_default=''))
        # 资产系统
        batch_op.add_column(sa.Column('house_level', sa.Integer(), nullable=True, server_default='0'))
        batch_op.add_column(sa.Column('car_level', sa.Integer(), nullable=True, server_default='0'))
        batch_op.add_column(sa.Column('house_name', sa.String(length=100), nullable=True))
        batch_op.add_column(sa.Column('car_name', sa.String(length=100), nullable=True))
        # 债务系统
        batch_op.add_column(sa.Column('debts', sa.JSON(), nullable=True, server_default='[]'))
        # 家族系统
        batch_op.add_column(sa.Column('family_name', sa.String(length=100), nullable=True))
        batch_op.add_column(sa.Column('family_reputation', sa.Float(), nullable=True, server_default='50'))
        # 子女系统
        batch_op.add_column(sa.Column('children_data', sa.JSON(), nullable=True, server_default='[]'))


def downgrade():
    # Remove columns from characters table
    with op.batch_alter_table('characters', schema=None) as batch_op:
        batch_op.drop_column('children_data')
        batch_op.drop_column('family_reputation')
        batch_op.drop_column('family_name')
        batch_op.drop_column('debts')
        batch_op.drop_column('car_name')
        batch_op.drop_column('house_name')
        batch_op.drop_column('car_level')
        batch_op.drop_column('house_level')
        batch_op.drop_column('career_title')
