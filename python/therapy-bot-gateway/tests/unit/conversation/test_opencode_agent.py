import httpx
import pytest

from therapy_bot_gateway.conversation.domain.agent_unavailable_error import AgentUnavailableError
from therapy_bot_gateway.conversation.infrastructure.opencode_agent import OpenCodeAgent


def _agent(handler) -> OpenCodeAgent:
    http = httpx.AsyncClient(base_url="http://opencode.test", transport=httpx.MockTransport(handler))
    return OpenCodeAgent(base_url="http://opencode.test", agent="therapy-reception-bot", http=http)


async def test_open_session_posts_the_title_and_returns_the_session_id():
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.path == "/session"
        return httpx.Response(200, json={"id": "ses_123"})

    session_id = await _agent(handler).open_session(title="whatsapp:5492611234567")

    assert session_id == "ses_123"


async def test_send_always_includes_the_agent_field():
    captured = {}

    def handler(request: httpx.Request) -> httpx.Response:
        import json

        captured["body"] = json.loads(request.content)
        return httpx.Response(200, json={"parts": [{"type": "text", "text": "hola"}]})

    await _agent(handler).send("ses_123", "hola, quiero un turno")

    assert captured["body"]["agent"] == "therapy-reception-bot"


async def test_send_never_omits_the_agent_field_even_across_multiple_calls():
    bodies = []

    def handler(request: httpx.Request) -> httpx.Response:
        import json

        bodies.append(json.loads(request.content))
        return httpx.Response(200, json={"parts": [{"type": "text", "text": "ok"}]})

    agent = _agent(handler)
    await agent.send("ses_123", "primer mensaje")
    await agent.send("ses_123", "segundo mensaje")

    assert all(body.get("agent") == "therapy-reception-bot" for body in bodies)


async def test_send_extracts_and_joins_text_parts():
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200,
            json={
                "parts": [
                    {"type": "step-start"},
                    {"type": "text", "text": "Primera parte."},
                    {"type": "tool", "tool": "get_available_slots"},
                    {"type": "text", "text": "Segunda parte."},
                ]
            },
        )

    reply = await _agent(handler).send("ses_123", "hola")

    assert reply == "Primera parte.\nSegunda parte."


async def test_open_session_raises_agent_unavailable_on_http_error():
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(500)

    with pytest.raises(AgentUnavailableError):
        await _agent(handler).open_session(title="whatsapp:5492611234567")


async def test_send_raises_agent_unavailable_on_timeout():
    def handler(request: httpx.Request) -> httpx.Response:
        raise httpx.TimeoutException("timed out", request=request)

    with pytest.raises(AgentUnavailableError):
        await _agent(handler).send("ses_123", "hola")
