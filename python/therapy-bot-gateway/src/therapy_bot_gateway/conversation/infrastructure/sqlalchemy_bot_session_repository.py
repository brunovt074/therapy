from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from therapy_bot_gateway.conversation.domain.model.bot_session import BotSession
from therapy_bot_gateway.conversation.domain.repository.bot_session_repository import (
    BotSessionRepository,
)
from therapy_bot_gateway.shared.infrastructure.database.tables.bot_session_table import (
    BotSessionTable,
)


class SqlAlchemyBotSessionRepository(BotSessionRepository):
    def __init__(self, session: AsyncSession):
        self._session = session

    async def find_by_phone(self, phone_number: str) -> BotSession | None:
        result = await self._session.execute(
            select(BotSessionTable).where(BotSessionTable.phone_number == phone_number)
        )
        row = result.scalar_one_or_none()
        return self._to_entity(row) if row else None

    async def get_or_create(self, phone_number: str, session_id: str) -> BotSession:
        table = BotSessionTable(phone_number=phone_number, session_id=session_id)
        try:
            async with self._session.begin_nested():
                self._session.add(table)
                await self._session.flush()
        except IntegrityError:
            existing = await self.find_by_phone(phone_number)
            if existing:
                return existing
            raise
        await self._session.refresh(table)
        return self._to_entity(table)

    def _to_entity(self, table: BotSessionTable) -> BotSession:
        return BotSession(
            id=table.id,
            phone_number=table.phone_number,
            session_id=table.session_id,
            created_at=table.created_at,
        )
