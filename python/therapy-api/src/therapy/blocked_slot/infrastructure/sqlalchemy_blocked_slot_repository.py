from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from therapy.blocked_slot.domain.model.blocked_slot import BlockedSlot
from therapy.blocked_slot.domain.repository.blocked_slot_repository import BlockedSlotRepository
from therapy.shared.infrastructure.database.tables.blocked_slot_table import BlockedSlotTable


class SqlAlchemyBlockedSlotRepository(BlockedSlotRepository):
    def __init__(self, session: AsyncSession):
        self._session = session

    async def find_all(self) -> list[BlockedSlot]:
        result = await self._session.execute(select(BlockedSlotTable))
        return [self._to_entity(row) for row in result.scalars().all()]

    async def find_recurring(self) -> list[BlockedSlot]:
        result = await self._session.execute(select(BlockedSlotTable).where(BlockedSlotTable.recurring == True))
        return [self._to_entity(row) for row in result.scalars().all()]

    async def find_by_date_range(self, start, end) -> list[BlockedSlot]:
        result = await self._session.execute(
            select(BlockedSlotTable)
            .where(BlockedSlotTable.start_at < end)
            .where(BlockedSlotTable.end_at > start)
        )
        return [self._to_entity(row) for row in result.scalars().all()]

    async def save(self, entity: BlockedSlot) -> BlockedSlot:
        table = self._to_table(entity)
        self._session.add(table)
        await self._session.flush()
        await self._session.refresh(table)
        return self._to_entity(table)

    async def delete_by_id(self, id: int) -> None:
        table = await self._session.get(BlockedSlotTable, id)
        if table:
            await self._session.delete(table)
            await self._session.flush()

    async def exists_overlapping(self, start, end, exclude_id=None) -> bool:
        stmt = select(BlockedSlotTable).where(
            (BlockedSlotTable.start_at < end) & (BlockedSlotTable.end_at > start)
        )
        if exclude_id:
            stmt = stmt.where(BlockedSlotTable.id != exclude_id)
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none() is not None

    def _to_entity(self, table: BlockedSlotTable) -> BlockedSlot:
        return BlockedSlot(
            id=table.id,
            start_at=table.start_at,
            end_at=table.end_at,
            reason=table.reason,
            recurring=table.recurring,
            created_at=table.created_at,
        )

    def _to_table(self, entity: BlockedSlot) -> BlockedSlotTable:
        return BlockedSlotTable(
            id=entity.id,
            start_at=entity.start_at,
            end_at=entity.end_at,
            reason=entity.reason,
            recurring=entity.recurring,
            created_at=entity.created_at,
        )
