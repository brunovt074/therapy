from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from therapy.shared.infrastructure.database.tables.specialty_table import SpecialtyTable
from therapy.specialty.domain.model.specialty import Specialty
from therapy.specialty.domain.repository.specialty_repository import SpecialtyRepository


class SqlAlchemySpecialtyRepository(SpecialtyRepository):
    def __init__(self, session: AsyncSession):
        self._session = session

    async def find_by_id(self, id: int) -> Specialty | None:
        result = await self._session.execute(select(SpecialtyTable).where(SpecialtyTable.id == id))
        row = result.scalar_one_or_none()
        return self._to_entity(row) if row else None

    async def find_by_slug(self, slug: str) -> Specialty | None:
        result = await self._session.execute(select(SpecialtyTable).where(SpecialtyTable.slug == slug))
        row = result.scalar_one_or_none()
        return self._to_entity(row) if row else None

    async def find_all(self) -> list[Specialty]:
        result = await self._session.execute(select(SpecialtyTable))
        return [self._to_entity(row) for row in result.scalars().all()]

    async def find_active(self) -> list[Specialty]:
        result = await self._session.execute(select(SpecialtyTable).where(SpecialtyTable.active.is_(True)))
        return [self._to_entity(row) for row in result.scalars().all()]

    async def save(self, entity: Specialty) -> Specialty:
        table = self._to_table(entity)
        self._session.add(table)
        await self._session.flush()
        await self._session.refresh(table)
        return self._to_entity(table)

    async def update(self, entity: Specialty) -> Specialty:
        table = self._to_table(entity)
        await self._session.merge(table)
        await self._session.flush()
        return self._to_entity(table)

    async def deactivate(self, id: int) -> None:
        table = await self._session.get(SpecialtyTable, id)
        if not table:
            return
        table.active = False
        await self._session.flush()
        await self._session.commit()

    async def exists_by_slug(self, slug: str) -> bool:
        result = await self._session.execute(select(SpecialtyTable).where(SpecialtyTable.slug == slug))
        return result.scalar_one_or_none() is not None

    def _to_entity(self, table: SpecialtyTable) -> Specialty:
        return Specialty(
            id=table.id,
            name=table.name,
            slug=table.slug,
            description=table.description,
            duration_min=table.duration_min,
            color=table.color,
            active=table.active,
            max_slots=table.max_slots,
            available_slots=table.available_slots,
            created_at=table.created_at,
            updated_at=table.updated_at,
        )

    def _to_table(self, entity: Specialty) -> SpecialtyTable:
        kwargs: dict = dict(
            name=entity.name,
            slug=entity.slug,
            description=entity.description,
            duration_min=entity.duration_min,
            color=entity.color,
            active=entity.active,
            max_slots=entity.max_slots,
            available_slots=entity.available_slots,
            created_at=entity.created_at,
            updated_at=entity.updated_at,
        )
        if entity.id:
            kwargs["id"] = entity.id
        return SpecialtyTable(**kwargs)
