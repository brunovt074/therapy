from abc import ABC, abstractmethod

from therapy.patient.domain.model.patient import Patient


class PatientRepository(ABC):
    @abstractmethod
    async def find_by_id(self, id: int) -> Patient | None:
        pass

    @abstractmethod
    async def find_by_phone(self, phone: str) -> Patient | None:
        pass

    @abstractmethod
    async def find_by_email(self, email: str) -> Patient | None:
        pass

    @abstractmethod
    async def find_paginated(
        self, query: str | None, page: int, per_page: int
    ) -> tuple[list[Patient], int]:
        pass

    @abstractmethod
    async def save(self, entity: Patient) -> Patient:
        pass

    @abstractmethod
    async def update(self, entity: Patient) -> Patient:
        pass

    @abstractmethod
    async def upsert_by_phone_or_email(self, entity: Patient) -> Patient:
        pass
