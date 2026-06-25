from dataclasses import replace
from datetime import datetime, timezone

from therapy.api.schemas.patient_update_request import PatientUpdateRequest
from therapy.patient.domain.model.patient import Patient
from therapy.patient.domain.repository.patient_repository import PatientRepository
from therapy.shared.domain.errors.exceptions import NotFoundError


class UpdatePatientUseCase:
    def __init__(self, repository: PatientRepository):
        self._repository = repository

    async def execute(self, patient_id: int, update_request: PatientUpdateRequest) -> Patient:
        existing = await self._repository.find_by_id(patient_id)
        if not existing:
            raise NotFoundError(f"Patient with id {patient_id} not found")

        changes = update_request.model_dump(exclude_none=True)
        updated = replace(
            existing,
            **changes,
            updated_at=datetime.now(timezone.utc),
        )
        return await self._repository.update(updated)
