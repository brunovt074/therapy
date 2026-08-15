import os

os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")
os.environ.setdefault("OPENCODE_BASE_URL", "http://opencode.test")
os.environ.setdefault("EVOLUTION_BASE_URL", "http://evolution.test")
os.environ.setdefault("EVOLUTION_API_KEY", "test-key")

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from tests.unit.conversation.fake_agent import FakeAgent
from tests.unit.conversation.fake_messenger import FakeMessenger
from therapy_bot_gateway.api.dependencies import get_agent, get_messenger
from therapy_bot_gateway.main import app
from therapy_bot_gateway.shared.infrastructure.database.base import Base
from therapy_bot_gateway.shared.infrastructure.database.connection import get_db


@pytest.fixture(autouse=True)
async def _wired_app():
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async def override_get_db():
        async with session_factory() as session:
            yield session

    agent = FakeAgent(reply="¡Hola! ¿En qué te ayudo?")
    messenger = FakeMessenger()

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_agent] = lambda: agent
    app.dependency_overrides[get_messenger] = lambda: messenger

    yield agent, messenger

    app.dependency_overrides.clear()
    await engine.dispose()


def _webhook_payload(text: str = "hola, quiero un turno") -> dict:
    return {
        "body": {
            "instance": "therapy-bot",
            "data": {
                "key": {"remoteJid": "5492611234567@s.whatsapp.net"},
                "pushName": "Marcela",
                "messageType": "conversation",
                "message": {"conversation": text},
            },
        }
    }


async def test_text_message_reaches_the_agent_and_replies_through_evolution(_wired_app):
    agent, messenger = _wired_app
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/webhook", json=_webhook_payload())

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    assert agent.opened_titles == ["whatsapp:5492611234567"]
    assert messenger.sent == [
        ("therapy-bot", "5492611234567", "¡Hola! ¿En qué te ayudo?")
    ]


async def test_group_messages_are_ignored_without_touching_the_agent(_wired_app):
    agent, messenger = _wired_app
    payload = _webhook_payload()
    payload["body"]["data"]["key"]["remoteJid"] = "120363012345678901@g.us"
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/webhook", json=payload)

    assert response.status_code == 200
    assert response.json() == {"status": "ignored"}
    assert agent.opened_titles == []
    assert messenger.sent == []


async def test_health_check():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
