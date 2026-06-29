from dataclasses import replace
from datetime import datetime, timezone

from therapy.patient.domain.model.patient import Patient
from therapy.patient.domain.repository.patient_repository import PatientRepository
from therapy.shared.domain.errors.exceptions import NotFoundError


class UpdatePatientUseCase:
    def __init__(self, repository: PatientRepository):
        self._repository = repository

    async def execute(self, id: int, data: dict) -> Patient:
        existing = await self._repository.find_by_id(id)
        if not existing:
            raise NotFoundError(f"Patient with id {id} not found")

        updated = replace(
            existing,
            **data,
            updated_at=datetime.now(timezone.utc),
        )
        return await self._repository.update(updated)
