from dataclasses import replace
from datetime import datetime, timezone

from therapy.shared.domain.errors.exceptions import NotFoundError
from therapy.specialty.domain.model.specialty import Specialty
from therapy.specialty.domain.repository.specialty_repository import SpecialtyRepository


class UpdateSpecialtyUseCase:
    def __init__(self, repository: SpecialtyRepository):
        self._repository = repository

    async def execute(self, entity: Specialty) -> Specialty:
        existing = await self._repository.find_by_id(entity.id)
        if not existing:
            raise NotFoundError(f"Specialty with id {entity.id} not found")
        updated = replace(
            entity,
            created_at=existing.created_at,
            updated_at=datetime.now(timezone.utc),
        )
        return await self._repository.update(updated)
