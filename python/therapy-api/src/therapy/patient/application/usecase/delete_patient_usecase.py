from therapy.patient.domain.repository.patient_repository import PatientRepository
from therapy.shared.domain.errors.exceptions import NotFoundError


class DeletePatientUseCase:
    def __init__(self, repository: PatientRepository):
        self._repository = repository

    async def execute(self, id: int) -> None:
        existing = await self._repository.find_by_id(id)
        if not existing:
            raise NotFoundError(f"Patient with id {id} not found")
        await self._repository.delete_by_id(id)
