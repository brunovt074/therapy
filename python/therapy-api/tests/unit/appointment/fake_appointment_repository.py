from datetime import datetime, timezone
from uuid import uuid4

from therapy.appointment.domain.model.appointment import Appointment
from therapy.appointment.domain.model.appointment_status import AppointmentStatus
from therapy.appointment.domain.repository.appointment_repository import AppointmentRepository


class FakeAppointmentRepository(AppointmentRepository):
    def __init__(self):
        self._store: dict[int, Appointment] = {}
        self._next_id = 1

    async def find_by_id(self, id: int) -> Appointment | None:
        return self._store.get(id)

    async def find_by_confirmation_token(self, token) -> Appointment | None:
        for a in self._store.values():
            if a.confirmation_token == token:
                return a
        return None

    async def find_by_cancel_token(self, token) -> Appointment | None:
        for a in self._store.values():
            if a.cancel_token == token:
                return a
        return None

    async def find_by_patient_id(self, patient_id: int) -> list[Appointment]:
        return [a for a in self._store.values() if a.patient_id == patient_id]

    async def find_by_date_range(
        self, start: datetime, end: datetime
    ) -> list[Appointment]:
        return [
            a for a in self._store.values()
            if a.start_at < end and a.end_at > start
        ]

    async def find_by_status_and_date(
        self, status: list[AppointmentStatus], date: datetime
    ) -> list[Appointment]:
        from datetime import timedelta
        next_day = date + timedelta(days=1)
        return [
            a for a in self._store.values()
            if a.status in status and a.start_at >= date and a.start_at < next_day
        ]

    async def find_paginated(
        self,
        from_date: datetime | None,
        to_date: datetime | None,
        status: list[AppointmentStatus] | None,
        specialty_id: int | None,
        patient_id: int | None,
        page: int,
        per_page: int,
    ) -> tuple[list[Appointment], int]:
        appointments = list(self._store.values())
        if from_date:
            appointments = [a for a in appointments if a.start_at >= from_date]
        if to_date:
            appointments = [a for a in appointments if a.start_at <= to_date]
        if status:
            appointments = [a for a in appointments if a.status in status]
        if specialty_id:
            appointments = [a for a in appointments if a.specialty_id == specialty_id]
        if patient_id:
            appointments = [a for a in appointments if a.patient_id == patient_id]
        total = len(appointments)
        start = (page - 1) * per_page
        end = start + per_page
        return appointments[start:end], total

    async def save(self, entity: Appointment) -> Appointment:
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

    async def update(self, entity: Appointment) -> Appointment:
        from dataclasses import replace
        from datetime import datetime, timezone

        updated = replace(entity, updated_at=datetime.now(timezone.utc))
        self._store[updated.id] = updated
        return updated

    async def count_by_date_range(self, start: datetime, end: datetime) -> int:
        return len(await self.find_by_date_range(start, end))

    async def find_next_appointment(self) -> Appointment | None:
        now = datetime.now(timezone.utc)
        future = [a for a in self._store.values() if a.start_at > now and a.status != AppointmentStatus.CANCELLED]
        if not future:
            return None
        return min(future, key=lambda a: a.start_at)

    def clear(self) -> None:
        self._store.clear()
        self._next_id = 1
