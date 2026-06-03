from therapy.shared.domain.errors.exceptions import AlreadyExistsError
from therapy.specialty.domain.model.specialty import Specialty
from therapy.specialty.domain.repository.specialty_repository import SpecialtyRepository


class CreateSpecialtyUseCase:
    def __init__(self, repository: SpecialtyRepository):
        self._repository = repository

    async def execute(self, entity: Specialty) -> Specialty:
        if await self._repository.exists_by_slug(entity.slug):
            raise AlreadyExistsError(
                f"Specialty with slug '{entity.slug}' already exists"
            )
        return await self._repository.save(entity)
