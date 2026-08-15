import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from therapy_bot_gateway.conversation.infrastructure.sqlalchemy_bot_session_repository import (
    SqlAlchemyBotSessionRepository,
)
from therapy_bot_gateway.shared.infrastructure.database.base import Base


@pytest.fixture
async def session_factory():
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    await engine.dispose()


async def test_get_or_create_persists_a_new_session(session_factory):
    async with session_factory() as session:
        repo = SqlAlchemyBotSessionRepository(session)

        created = await repo.get_or_create("5492611234567", "ses_1")
        await session.commit()

        assert created.phone_number == "5492611234567"
        assert created.session_id == "ses_1"
        assert created.id != 0


async def test_get_or_create_reuses_an_existing_session(session_factory):
    async with session_factory() as session:
        repo = SqlAlchemyBotSessionRepository(session)
        first = await repo.get_or_create("5492611234567", "ses_1")
        await session.commit()

        second = await repo.get_or_create("5492611234567", "ses_2")
        await session.commit()

        assert second.id == first.id
        assert second.session_id == "ses_1"


# No concurrent-race test here: SQLite in-memory shares a single physical
# connection (StaticPool), so two AsyncSessions can't hold independent
# uncommitted transactions the way Postgres's MVCC does — a "concurrent"
# test against it would prove something that doesn't hold in production.
# The race itself is proven at the use-case level against
# FakeBotSessionRepository (test_handle_incoming_message_usecase.py); this
# repository's IntegrityError-catch path is the standard Postgres upsert-by-
# catch pattern and should be re-verified with a real Postgres once the
# gateway is deployed (make up-bot).
