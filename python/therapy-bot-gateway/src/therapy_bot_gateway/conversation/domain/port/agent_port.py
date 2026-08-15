from abc import ABC, abstractmethod


class AgentPort(ABC):
    @abstractmethod
    async def open_session(self, title: str) -> str:
        pass

    @abstractmethod
    async def send(self, session_id: str, text: str) -> str:
        pass
