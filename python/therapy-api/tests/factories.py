from datetime import datetime, timezone

from therapy.specialty.domain.model.specialty import Specialty


class SpecialtyTestFactory:
    @staticmethod
    def create(
        id: int = 0,
        name: str = "Pilates",
        slug: str = "pilates",
        description: str | None = None,
        duration_min: int = 45,
        color: str = "#7B8C76",
        active: bool = True,
        max_slots: int = 4,
        available_slots: int = 4,
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
            created_at=created_at or datetime.now(timezone.utc),
            updated_at=updated_at or datetime.now(timezone.utc),
        )
