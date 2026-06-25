from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from therapy.patient.domain.model.patient import Patient
from therapy.patient.domain.repository.patient_repository import PatientRepository
from therapy.shared.infrastructure.database.tables.appointment_table import AppointmentTable
from therapy.shared.infrastructure.database.tables.patient_table import PatientTable


class SqlAlchemyPatientRepository(PatientRepository):
    def __init__(self, session: AsyncSession):
        self._session = session

    async def find_by_id(self, id: int) -> Patient | None:
        result = await self._session.execute(select(PatientTable).where(PatientTable.id == id))
        row = result.scalar_one_or_none()
        return self._to_entity(row) if row else None

    async def find_by_phone(self, phone: str) -> Patient | None:
        result = await self._session.execute(select(PatientTable).where(PatientTable.phone == phone))
        row = result.scalar_one_or_none()
        return self._to_entity(row) if row else None

    async def find_by_email(self, email: str) -> Patient | None:
        result = await self._session.execute(select(PatientTable).where(PatientTable.email == email))
        row = result.scalar_one_or_none()
        return self._to_entity(row) if row else None

    async def find_paginated(
        self, query: str | None, page: int, per_page: int
    ) -> tuple[list[Patient], int]:
        filters = []
        if query:
            filters.append(
                (PatientTable.full_name.ilike(f"%{query}%")) |
                (PatientTable.email.ilike(f"%{query}%"))
            )
        count_stmt = select(func.count()).select_from(PatientTable)
        if filters:
            count_stmt = count_stmt.where(*filters)
        count_result = await self._session.execute(count_stmt)
        total = count_result.scalar_one()

        stmt = select(PatientTable)
        if filters:
            stmt = stmt.where(*filters)
        stmt = stmt.offset((page - 1) * per_page).limit(per_page)
        result = await self._session.execute(stmt)
        patients = [self._to_entity(row) for row in result.scalars().all()]
        return patients, total

    async def save(self, entity: Patient) -> Patient:
        table = self._to_table(entity)
        self._session.add(table)
        await self._session.flush()
        await self._session.refresh(table)
        return self._to_entity(table)

    async def update(self, entity: Patient) -> Patient:
        table = self._to_table(entity)
        await self._session.merge(table)
        await self._session.flush()
        return self._to_entity(table)

    async def upsert_by_phone_or_email(self, entity: Patient) -> Patient:
        existing = await self.find_by_phone(entity.phone)
        if existing:
            merged = Patient(
                id=existing.id,
                full_name=entity.full_name,
                phone=entity.phone,
                email=entity.email or existing.email,
                birth_date=existing.birth_date,
                notes=existing.notes,
                medical_history=existing.medical_history,
                created_at=existing.created_at,
                updated_at=existing.updated_at,
            )
            return await self.update(merged)
        if entity.email:
            existing_by_email = await self.find_by_email(entity.email)
            if existing_by_email:
                merged = Patient(
                    id=existing_by_email.id,
                    full_name=entity.full_name,
                    phone=entity.phone,
                    email=entity.email,
                    birth_date=existing_by_email.birth_date,
                    notes=existing_by_email.notes,
                    medical_history=existing_by_email.medical_history,
                    created_at=existing_by_email.created_at,
                    updated_at=existing_by_email.updated_at,
                )
                return await self.update(merged)
        return await self.save(entity)

    async def delete_by_id(self, id: int) -> None:
        await self._session.execute(delete(PatientTable).where(PatientTable.id == id))

    async def count_appointments_by_patient(self, patient_id: int) -> int:
        result = await self._session.execute(
            select(func.count()).select_from(AppointmentTable).where(
                AppointmentTable.patient_id == patient_id
            )
        )
        return result.scalar_one()

    def _to_entity(self, table: PatientTable) -> Patient:
        return Patient(
            id=table.id,
            full_name=table.full_name,
            phone=table.phone,
            email=table.email,
            birth_date=table.birth_date,
            notes=table.notes,
            medical_history=table.medical_history,
            created_at=table.created_at,
            updated_at=table.updated_at,
        )

    def _to_table(self, entity: Patient) -> PatientTable:
        kwargs: dict = dict(
            full_name=entity.full_name,
            phone=entity.phone,
            email=entity.email,
            birth_date=entity.birth_date,
            notes=entity.notes,
            medical_history=entity.medical_history,
            created_at=entity.created_at,
            updated_at=entity.updated_at,
        )
        if entity.id:
            kwargs["id"] = entity.id
        return PatientTable(**kwargs)
