"""Add user profile fields and game saves table.

Revision ID: 003
Revises: 002
Create Date: 2026-04-28
"""
from alembic import op
import sqlalchemy as sa


def upgrade():
    # Add new columns to users table
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('avatar_color', sa.String(length=20), nullable=True, server_default='#3b82f6'))
        batch_op.add_column(sa.Column('display_name', sa.String(length=100), nullable=True))
        batch_op.add_column(sa.Column('bio', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('failed_attempts', sa.Integer(), nullable=True, server_default='0'))

    # Create game_saves table
    op.create_table(
        'game_saves',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('slot', sa.Integer(), nullable=False),
        sa.Column('save_data', sa.JSON(), nullable=False),
        sa.Column('character_name', sa.String(length=100), nullable=True),
        sa.Column('age', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_game_saves_id'), 'game_saves', ['id'], unique=False)
    op.create_index('ix_game_saves_user_slot', 'game_saves', ['user_id', 'slot'], unique=False)


def downgrade():
    # Remove game_saves table
    op.drop_index(op.f('ix_game_saves_id'), table_name='game_saves')
    op.drop_index('ix_game_saves_user_slot', table_name='game_saves')
    op.drop_table('game_saves')

    # Remove new columns from users table
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_column('failed_attempts')
        batch_op.drop_column('bio')
        batch_op.drop_column('display_name')
        batch_op.drop_column('avatar_color')
