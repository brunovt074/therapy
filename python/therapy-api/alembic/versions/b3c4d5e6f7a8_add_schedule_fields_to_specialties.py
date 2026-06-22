"""add_schedule_fields_to_specialties

Revision ID: b3c4d5e6f7a8
Revises: a1b2c3d4e5f6
Create Date: 2026-06-21 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "b3c4d5e6f7a8"
down_revision: Union[str, None] = "a1b2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("specialties", sa.Column("schedule_days", sa.JSON(), nullable=True))
    op.add_column("specialties", sa.Column("schedule_start", sa.String(5), nullable=True))
    op.add_column("specialties", sa.Column("schedule_end", sa.String(5), nullable=True))


def downgrade() -> None:
    op.drop_column("specialties", "schedule_end")
    op.drop_column("specialties", "schedule_start")
    op.drop_column("specialties", "schedule_days")
