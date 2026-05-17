from dataclasses import replace
from datetime import datetime, timezone

from therapy.patient.domain.model.patient import Patient
from therapy.patient.domain.repository.patient_repository import PatientRepository


class UpsertPatientUseCase:
    def __init__(self, repository: PatientRepository):
        self._repository = repository

    async def execute(self, entity: Patient) -> Patient:
        existing = await self._repository.find_by_phone(entity.phone)

        if existing:
            updated = replace(
                existing,
                full_name=entity.full_name,
                email=entity.email or existing.email,
                birth_date=entity.birth_date or existing.birth_date,
                updated_at=datetime.now(timezone.utc),
            )
            return await self._repository.update(updated)

        if entity.email:
            existing_by_email = await self._repository.find_by_email(entity.email)
            if existing_by_email:
                updated = replace(
                    existing_by_email,
                    full_name=entity.full_name,
                    phone=entity.phone,
                    birth_date=entity.birth_date or existing_by_email.birth_date,
                    updated_at=datetime.now(timezone.utc),
                )
                return await self._repository.update(updated)

        return await self._repository.save(entity)
