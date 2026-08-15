import httpx

from therapy_bot_gateway.conversation.domain.agent_unavailable_error import AgentUnavailableError
from therapy_bot_gateway.conversation.domain.port.agent_port import AgentPort


class OpenCodeAgent(AgentPort):
    def __init__(
        self,
        base_url: str,
        agent: str,
        username: str | None = None,
        password: str | None = None,
        timeout_seconds: float = 60.0,
        http: httpx.AsyncClient | None = None,
    ):
        self._agent = agent
        auth = httpx.BasicAuth(username, password) if username and password else None
        self._http = http or httpx.AsyncClient(
            base_url=base_url.rstrip("/"), auth=auth, timeout=timeout_seconds
        )

    async def open_session(self, title: str) -> str:
        try:
            response = await self._http.post("/session", json={"title": title})
            response.raise_for_status()
        except httpx.HTTPError as e:
            raise AgentUnavailableError() from e
        return response.json()["id"]

    async def send(self, session_id: str, text: str) -> str:
        body = {
            "agent": self._agent,
            "parts": [{"type": "text", "text": text}],
        }
        try:
            response = await self._http.post(f"/session/{session_id}/message", json=body)
            response.raise_for_status()
        except httpx.HTTPError as e:
            raise AgentUnavailableError() from e
        return self._extract_reply(response.json())

    def _extract_reply(self, payload: dict) -> str:
        texts = [
            part["text"]
            for part in payload.get("parts", [])
            if part.get("type") == "text" and part.get("text")
        ]
        return "\n".join(texts)
