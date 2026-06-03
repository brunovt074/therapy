from abc import ABC, abstractmethod

from therapy.specialty.domain.model.specialty import Specialty


class SpecialtyRepository(ABC):
    @abstractmethod
    async def find_by_id(self, id: int) -> Specialty | None:
        pass

    @abstractmethod
    async def find_by_slug(self, slug: str) -> Specialty | None:
        pass

    @abstractmethod
    async def find_all(self) -> list[Specialty]:
        pass

    @abstractmethod
    async def find_active(self) -> list[Specialty]:
        pass

    @abstractmethod
    async def save(self, entity: Specialty) -> Specialty:
        pass

    @abstractmethod
    async def update(self, entity: Specialty) -> Specialty:
        pass

    @abstractmethod
    async def deactivate(self, id: int) -> None:
        pass

    @abstractmethod
    async def exists_by_slug(self, slug: str) -> bool:
        pass
