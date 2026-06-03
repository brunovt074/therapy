from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from therapy.appointment.domain.model.appointment import Appointment
from therapy.appointment.domain.model.appointment_status import AppointmentStatus
from therapy.appointment.domain.repository.appointment_repository import AppointmentRepository
from therapy.shared.infrastructure.database.tables.appointment_table import AppointmentTable


class SqlAlchemyAppointmentRepository(AppointmentRepository):
    def __init__(self, session: AsyncSession):
        self._session = session

    async def find_by_id(self, id: int) -> Appointment | None:
        result = await self._session.execute(select(AppointmentTable).where(AppointmentTable.id == id))
        row = result.scalar_one_or_none()
        return self._to_entity(row) if row else None

    async def find_by_confirmation_token(self, token) -> Appointment | None:
        result = await self._session.execute(select(AppointmentTable).where(AppointmentTable.confirmation_token == token))
        row = result.scalar_one_or_none()
        return self._to_entity(row) if row else None

    async def find_by_cancel_token(self, token) -> Appointment | None:
        result = await self._session.execute(select(AppointmentTable).where(AppointmentTable.cancel_token == token))
        row = result.scalar_one_or_none()
        return self._to_entity(row) if row else None

    async def find_by_patient_id(self, patient_id: int) -> list[Appointment]:
        result = await self._session.execute(select(AppointmentTable).where(AppointmentTable.patient_id == patient_id))
        return [self._to_entity(row) for row in result.scalars().all()]

    async def find_by_date_range(self, start, end) -> list[Appointment]:
        result = await self._session.execute(
            select(AppointmentTable)
            .where(AppointmentTable.start_at < end)
            .where(AppointmentTable.end_at > start)
        )
        return [self._to_entity(row) for row in result.scalars().all()]

    async def find_by_status_and_date(self, status, date) -> list[Appointment]:
        from datetime import timedelta
        next_day = date + timedelta(days=1)
        result = await self._session.execute(
            select(AppointmentTable)
            .where(AppointmentTable.status.in_([s.value for s in status]))
            .where(AppointmentTable.start_at >= date)
            .where(AppointmentTable.start_at < next_day)
        )
        return [self._to_entity(row) for row in result.scalars().all()]

    async def find_paginated(self, from_date, to_date, status, specialty_id, patient_id, page, per_page):
        stmt = select(AppointmentTable)
        if from_date:
            stmt = stmt.where(AppointmentTable.start_at >= from_date)
        if to_date:
            stmt = stmt.where(AppointmentTable.start_at <= to_date)
        if status:
            stmt = stmt.where(AppointmentTable.status.in_([s.value for s in status]))
        if specialty_id:
            stmt = stmt.where(AppointmentTable.specialty_id == specialty_id)
        if patient_id:
            stmt = stmt.where(AppointmentTable.patient_id == patient_id)
        count_result = await self._session.execute(select(AppointmentTable).from_statement(stmt))
        total = len(count_result.scalars().all())
        stmt = stmt.offset((page - 1) * per_page).limit(per_page)
        result = await self._session.execute(stmt)
        appointments = [self._to_entity(row) for row in result.scalars().all()]
        return appointments, total

    async def save(self, entity: Appointment) -> Appointment:
        table = self._to_table(entity)
        self._session.add(table)
        await self._session.flush()
        await self._session.refresh(table)
        return self._to_entity(table)

    async def update(self, entity: Appointment) -> Appointment:
        table = self._to_table(entity)
        await self._session.merge(table)
        await self._session.flush()
        return self._to_entity(table)

    async def count_by_date_range(self, start, end) -> int:
        result = await self._session.execute(
            select(AppointmentTable)
            .where(AppointmentTable.start_at >= start)
            .where(AppointmentTable.start_at < end)
        )
        return len(result.scalars().all())

    async def find_next_appointment(self) -> Appointment | None:
        from datetime import datetime, timezone
        now = datetime.now(timezone.utc)
        result = await self._session.execute(
            select(AppointmentTable)
            .where(AppointmentTable.start_at > now)
            .where(AppointmentTable.status != AppointmentStatus.CANCELLED.value)
            .order_by(AppointmentTable.start_at)
            .limit(1)
        )
        row = result.scalar_one_or_none()
        return self._to_entity(row) if row else None

    def _to_entity(self, table: AppointmentTable) -> Appointment:
        return Appointment(
            id=table.id,
            patient_id=table.patient_id,
            specialty_id=table.specialty_id,
            start_at=table.start_at,
            end_at=table.end_at,
            status=AppointmentStatus(table.status),
            confirmation_token=table.confirmation_token,
            cancel_token=table.cancel_token,
            notes=table.notes,
            admin_notes=table.admin_notes,
            confirmed_by=table.confirmed_by,
            created_at=table.created_at,
            updated_at=table.updated_at,
        )

    def _to_table(self, entity: Appointment) -> AppointmentTable:
        kwargs: dict = dict(
            patient_id=entity.patient_id,
            specialty_id=entity.specialty_id,
            start_at=entity.start_at,
            end_at=entity.end_at,
            status=entity.status.value,
            confirmation_token=entity.confirmation_token,
            cancel_token=entity.cancel_token,
            notes=entity.notes,
            admin_notes=entity.admin_notes,
            confirmed_by=entity.confirmed_by,
            created_at=entity.created_at,
            updated_at=entity.updated_at,
        )
        if entity.id:
            kwargs["id"] = entity.id
        return AppointmentTable(**kwargs)
