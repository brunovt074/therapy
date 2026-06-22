from datetime import datetime, timezone
from sqlalchemy import JSON, String, Integer, Boolean, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column
from therapy.shared.infrastructure.database.base import Base


class SpecialtyTable(Base):
    __tablename__ = "specialties"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    duration_min: Mapped[int] = mapped_column(Integer, default=60)
    color: Mapped[str] = mapped_column(String(7), default="#7B8C76")
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    max_slots: Mapped[int] = mapped_column(Integer, default=1)
    available_slots: Mapped[int] = mapped_column(Integer, default=1)
    schedule_days: Mapped[list | None] = mapped_column(JSON, nullable=True, default=None)
    schedule_start: Mapped[str | None] = mapped_column(String(5), nullable=True, default=None)
    schedule_end: Mapped[str | None] = mapped_column(String(5), nullable=True, default=None)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
