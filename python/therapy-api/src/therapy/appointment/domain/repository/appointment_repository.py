from abc import ABC, abstractmethod
from datetime import datetime
from uuid import UUID

from therapy.appointment.domain.model.appointment import Appointment
from therapy.appointment.domain.model.appointment_status import AppointmentStatus


class AppointmentRepository(ABC):
    @abstractmethod
    async def find_by_id(self, id: int) -> Appointment | None:
        pass

    @abstractmethod
    async def find_by_confirmation_token(self, token: UUID) -> Appointment | None:
        pass

    @abstractmethod
    async def find_by_cancel_token(self, token: UUID) -> Appointment | None:
        pass

    @abstractmethod
    async def find_by_patient_id(self, patient_id: int) -> list[Appointment]:
        pass

    @abstractmethod
    async def find_by_date_range(
        self, start: datetime, end: datetime
    ) -> list[Appointment]:
        pass

    @abstractmethod
    async def find_by_status_and_date(
        self, status: list[AppointmentStatus], date: datetime
    ) -> list[Appointment]:
        pass

    @abstractmethod
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
        pass

    @abstractmethod
    async def save(self, entity: Appointment) -> Appointment:
        pass

    @abstractmethod
    async def update(self, entity: Appointment) -> Appointment:
        pass

    @abstractmethod
    async def count_by_date_range(
        self, start: datetime, end: datetime
    ) -> int:
        pass

    @abstractmethod
    async def find_next_appointment(self) -> Appointment | None:
        pass
