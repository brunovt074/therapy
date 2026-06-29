from therapy.patient.domain.model.patient import Patient
from therapy.patient.domain.repository.patient_repository import PatientRepository
from therapy.shared.domain.errors.exceptions import AlreadyExistsError


class CreatePatientUseCase:
    def __init__(self, repository: PatientRepository):
        self._repository = repository

    async def execute(self, entity: Patient) -> Patient:
        existing = await self._repository.find_by_phone(entity.phone)
        if existing:
            raise AlreadyExistsError(f"Patient with phone {entity.phone} already exists")
        return await self._repository.save(entity)
