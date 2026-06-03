from abc import ABC, abstractmethod
from datetime import datetime

from therapy.blocked_slot.domain.model.blocked_slot import BlockedSlot


class BlockedSlotRepository(ABC):
    @abstractmethod
    async def find_all(self) -> list[BlockedSlot]:
        pass

    @abstractmethod
    async def find_recurring(self) -> list[BlockedSlot]:
        pass

    @abstractmethod
    async def find_by_date_range(
        self, start: datetime, end: datetime
    ) -> list[BlockedSlot]:
        pass

    @abstractmethod
    async def save(self, entity: BlockedSlot) -> BlockedSlot:
        pass

    @abstractmethod
    async def delete_by_id(self, id: int) -> None:
        pass

    @abstractmethod
    async def exists_overlapping(
        self, start: datetime, end: datetime, exclude_id: int | None = None
    ) -> bool:
        pass
