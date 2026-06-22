from dataclasses import replace

from therapy.shared.domain.slug import slugify
from therapy.specialty.domain.model.specialty import Specialty
from therapy.specialty.domain.repository.specialty_repository import SpecialtyRepository


class CreateSpecialtyUseCase:
    def __init__(self, repository: SpecialtyRepository):
        self._repository = repository

    async def execute(self, entity: Specialty) -> Specialty:
        slug = await self._generate_unique_slug(entity.name)
        specialty = replace(
            entity,
            slug=slug,
            available_slots=entity.max_slots,
        )
        return await self._repository.save(specialty)

    async def _generate_unique_slug(self, name: str) -> str:
        base = slugify(name)
        slug = base
        counter = 1
        while await self._repository.exists_by_slug(slug):
            slug = f"{base}-{counter}"
            counter += 1
        return slug
