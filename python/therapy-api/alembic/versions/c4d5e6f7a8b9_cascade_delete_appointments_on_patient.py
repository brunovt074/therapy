"""cascade_delete_appointments_on_patient

Revision ID: c4d5e6f7a8b9
Revises: b3c4d5e6f7a8
Create Date: 2026-06-23 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c4d5e6f7a8b9"
down_revision: Union[str, None] = "b3c4d5e6f7a8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_constraint("appointments_patient_id_fkey", "appointments", type_="foreignkey")
    op.create_foreign_key(
        "appointments_patient_id_fkey",
        "appointments",
        "patients",
        ["patient_id"],
        ["id"],
        ondelete="CASCADE",
    )


def downgrade() -> None:
    op.drop_constraint("appointments_patient_id_fkey", "appointments", type_="foreignkey")
    op.create_foreign_key(
        "appointments_patient_id_fkey",
        "appointments",
        "patients",
        ["patient_id"],
        ["id"],
    )
