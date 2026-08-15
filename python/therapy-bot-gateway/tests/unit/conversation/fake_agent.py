import asyncio

from therapy_bot_gateway.conversation.domain.agent_unavailable_error import AgentUnavailableError
from therapy_bot_gateway.conversation.domain.port.agent_port import AgentPort


class FakeAgent(AgentPort):
    def __init__(self, reply: str = "ok", fail: bool = False):
        self.reply = reply
        self.fail = fail
        self.opened_titles: list[str] = []
        self.sent: list[tuple[str, str]] = []
        self._next_session_id = 1

    async def open_session(self, title: str) -> str:
        self.opened_titles.append(title)
        await asyncio.sleep(0)
        session_id = f"ses_{self._next_session_id}"
        self._next_session_id += 1
        return session_id

    async def send(self, session_id: str, text: str) -> str:
        self.sent.append((session_id, text))
        if self.fail:
            raise AgentUnavailableError()
        return self.reply
