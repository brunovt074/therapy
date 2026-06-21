"""add_clinic_settings_table

Revision ID: a1b2c3d4e5f6
Revises: 47582f79e700
Create Date: 2026-06-21 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, None] = "47582f79e700"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "clinic_settings",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("business_hours_ranges", sa.JSON(), nullable=False),
        sa.Column("business_work_days", sa.JSON(), nullable=False),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )
    op.execute(
        "INSERT INTO clinic_settings (id, business_hours_ranges, business_work_days) "
        "VALUES (1, "
        "'[{\"start\": \"08:00\", \"end\": \"12:00\"}, {\"start\": \"16:00\", \"end\": \"20:00\"}]'::jsonb, "
        "'[0, 1, 2, 3, 4, 5]'::jsonb)"
    )


def downgrade() -> None:
    op.drop_table("clinic_settings")
