from datetime import datetime, timezone

from therapy_bot_gateway.conversation.domain.model.bot_session import BotSession
from therapy_bot_gateway.conversation.domain.repository.bot_session_repository import (
    BotSessionRepository,
)


class FakeBotSessionRepository(BotSessionRepository):
    def __init__(self):
        self._by_phone: dict[str, BotSession] = {}
        self._next_id = 1

    async def find_by_phone(self, phone_number: str) -> BotSession | None:
        return self._by_phone.get(phone_number)

    async def get_or_create(self, phone_number: str, session_id: str) -> BotSession:
        existing = self._by_phone.get(phone_number)
        if existing:
            return existing

        session = BotSession(
            id=self._next_id,
            phone_number=phone_number,
            session_id=session_id,
            created_at=datetime.now(timezone.utc),
        )
        self._next_id += 1
        self._by_phone[phone_number] = session
        return session
