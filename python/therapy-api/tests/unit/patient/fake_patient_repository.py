from therapy.patient.domain.model.patient import Patient
from therapy.patient.domain.repository.patient_repository import PatientRepository


class FakePatientRepository(PatientRepository):
    def __init__(self):
        self._store: dict[int, Patient] = {}
        self._next_id = 1

    async def find_by_id(self, id: int) -> Patient | None:
        return self._store.get(id)

    async def find_by_phone(self, phone: str) -> Patient | None:
        for p in self._store.values():
            if p.phone == phone:
                return p
        return None

    async def find_by_email(self, email: str) -> Patient | None:
        for p in self._store.values():
            if p.email == email:
                return p
        return None

    async def find_paginated(
        self, query: str | None, page: int, per_page: int
    ) -> tuple[list[Patient], int]:
        patients = list(self._store.values())
        if query:
            patients = [
                p for p in patients
                if query.lower() in p.full_name.lower() or (p.email and query.lower() in p.email.lower())
            ]
        total = len(patients)
        start = (page - 1) * per_page
        end = start + per_page
        return patients[start:end], total

    async def save(self, entity: Patient) -> Patient:
        from dataclasses import replace
        from datetime import datetime, timezone

        saved = replace(
            entity,
            id=self._next_id,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        self._store[saved.id] = saved
        self._next_id += 1
        return saved

    async def update(self, entity: Patient) -> Patient:
        from dataclasses import replace
        from datetime import datetime, timezone

        updated = replace(entity, updated_at=datetime.now(timezone.utc))
        self._store[updated.id] = updated
        return updated

    async def upsert_by_phone_or_email(self, entity: Patient) -> Patient:
        existing = await self.find_by_phone(entity.phone)
        if existing:
            return await self.update(entity)
        if entity.email:
            existing_by_email = await self.find_by_email(entity.email)
            if existing_by_email:
                return await self.update(entity)
        return await self.save(entity)

    def clear(self) -> None:
        self._store.clear()
        self._next_id = 1
