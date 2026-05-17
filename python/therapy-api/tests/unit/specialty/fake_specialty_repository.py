from therapy.specialty.domain.model.specialty import Specialty
from therapy.specialty.domain.repository.specialty_repository import SpecialtyRepository


class FakeSpecialtyRepository(SpecialtyRepository):
    def __init__(self):
        self._store: dict[int, Specialty] = {}
        self._next_id = 1

    async def find_by_id(self, id: int) -> Specialty | None:
        return self._store.get(id)

    async def find_by_slug(self, slug: str) -> Specialty | None:
        for s in self._store.values():
            if s.slug == slug:
                return s
        return None

    async def find_all(self) -> list[Specialty]:
        return list(self._store.values())

    async def find_active(self) -> list[Specialty]:
        return [s for s in self._store.values() if s.active]

    async def save(self, entity: Specialty) -> Specialty:
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

    async def update(self, entity: Specialty) -> Specialty:
        from dataclasses import replace
        from datetime import datetime, timezone

        updated = replace(entity, updated_at=datetime.now(timezone.utc))
        self._store[updated.id] = updated
        return updated

    async def deactivate(self, id: int) -> None:
        from dataclasses import replace

        if id in self._store:
            self._store[id] = replace(self._store[id], active=False)

    async def exists_by_slug(self, slug: str) -> bool:
        return any(s.slug == slug for s in self._store.values())

    def clear(self) -> None:
        self._store.clear()
        self._next_id = 1
