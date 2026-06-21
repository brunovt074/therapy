from datetime import datetime, timezone
from sqlalchemy import Integer, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column
from therapy.shared.infrastructure.database.base import Base


class ClinicSettingsTable(Base):
    __tablename__ = "clinic_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    business_hours_ranges: Mapped[list] = mapped_column(JSON, nullable=False)
    business_work_days: Mapped[list] = mapped_column(JSON, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
