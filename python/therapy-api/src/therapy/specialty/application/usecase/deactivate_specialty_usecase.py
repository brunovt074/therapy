from therapy.shared.domain.errors.exceptions import NotFoundError
from therapy.specialty.domain.repository.specialty_repository import SpecialtyRepository


class DeactivateSpecialtyUseCase:
    def __init__(self, repository: SpecialtyRepository):
        self._repository = repository

    async def execute(self, id: int) -> None:
        existing = await self._repository.find_by_id(id)
        if not existing:
            raise NotFoundError(f"Specialty with id {id} not found")
        await self._repository.deactivate(id)
