from dataclasses import replace
from datetime import datetime, timezone

from therapy.shared.domain.slug import slugify
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

        slug = await self._generate_unique_slug(entity.name, entity.id)
        updated = replace(
            entity,
            slug=slug,
            active=existing.active,
            available_slots=entity.max_slots,
            created_at=existing.created_at,
            updated_at=datetime.now(timezone.utc),
        )
        return await self._repository.update(updated)

    async def _generate_unique_slug(self, name: str, entity_id: int) -> str:
        base = slugify(name)
        slug = base
        counter = 1
        while True:
            found = await self._repository.find_by_slug(slug)
            if found is None or found.id == entity_id:
                break
            slug = f"{base}-{counter}"
            counter += 1
        return slug
