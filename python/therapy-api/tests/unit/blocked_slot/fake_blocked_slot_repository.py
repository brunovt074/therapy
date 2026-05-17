from datetime import datetime, timezone

from therapy.blocked_slot.domain.model.blocked_slot import BlockedSlot
from therapy.blocked_slot.domain.repository.blocked_slot_repository import BlockedSlotRepository


class FakeBlockedSlotRepository(BlockedSlotRepository):
    def __init__(self):
        self._store: dict[int, BlockedSlot] = {}
        self._next_id = 1

    async def find_all(self) -> list[BlockedSlot]:
        return list(self._store.values())

    async def find_recurring(self) -> list[BlockedSlot]:
        return [b for b in self._store.values() if b.recurring]

    async def find_by_date_range(
        self, start: datetime, end: datetime
    ) -> list[BlockedSlot]:
        return [
            b for b in self._store.values()
            if b.start_at < end and b.end_at > start
        ]

    async def save(self, entity: BlockedSlot) -> BlockedSlot:
        from dataclasses import replace

        saved = replace(entity, id=self._next_id, created_at=datetime.now(timezone.utc))
        self._store[saved.id] = saved
        self._next_id += 1
        return saved

    async def delete_by_id(self, id: int) -> None:
        self._store.pop(id, None)

    async def exists_overlapping(
        self, start: datetime, end: datetime, exclude_id: int | None = None
    ) -> bool:
        for b in self._store.values():
            if exclude_id and b.id == exclude_id:
                continue
            if b.start_at < end and b.end_at > start:
                return True
        return False

    def clear(self) -> None:
        self._store.clear()
        self._next_id = 1
