"""initial_schema

Revision ID: d9044c34c7f9
Revises:
Create Date: 2026-08-15 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "d9044c34c7f9"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "bot_sessions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("phone_number", sa.String(20), unique=True, nullable=False),
        sa.Column("session_id", sa.String(64), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("bot_sessions")
