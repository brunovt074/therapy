from datetime import datetime, timezone

from therapy.specialty.domain.model.specialty import Specialty


class SpecialtyTestFactory:
    @staticmethod
    def create(
        id: int = 0,
        name: str = "Pilates",
        slug: str = "pilates",
        description: str | None = None,
        duration_min: int = 60,
        color: str = "#7B8C76",
        active: bool = True,
        max_slots: int = 4,
        available_slots: int = 4,
        schedule_days: list[int] | None = None,
        schedule_start: str | None = None,
        schedule_end: str | None = None,
        created_at: datetime | None = None,
        updated_at: datetime | None = None,
    ) -> Specialty:
        return Specialty(
            id=id,
            name=name,
            slug=slug,
            description=description,
            duration_min=duration_min,
            color=color,
            active=active,
            max_slots=max_slots,
            available_slots=available_slots,
            schedule_days=schedule_days,
            schedule_start=schedule_start,
            schedule_end=schedule_end,
            created_at=created_at or datetime.now(timezone.utc),
            updated_at=updated_at or datetime.now(timezone.utc),
        )
