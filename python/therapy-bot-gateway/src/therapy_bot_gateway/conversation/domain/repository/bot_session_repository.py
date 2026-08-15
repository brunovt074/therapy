from abc import ABC, abstractmethod

from therapy_bot_gateway.conversation.domain.model.bot_session import BotSession


class BotSessionRepository(ABC):
    @abstractmethod
    async def find_by_phone(self, phone_number: str) -> BotSession | None:
        pass

    @abstractmethod
    async def get_or_create(self, phone_number: str, session_id: str) -> BotSession:
        pass
