"""Seed script: create the WhatsApp bot service account.

Usage:
    BOT_EMAIL=... BOT_PASSWORD=... BOT_NAME=... python scripts/seed_bot_user.py

Required environment variables:
    BOT_EMAIL     Bot service account email (must be unique)
    BOT_PASSWORD  Bot service account password (min 12 chars)
    BOT_NAME      Bot display name (optional, default: "Therapy Bot")

Needs role=admin because therapy-mcp calls the /api/admin/* endpoints
(search/register patients, search/reschedule/cancel appointments) on the
bot's behalf. The script will FAIL if BOT_EMAIL or BOT_PASSWORD are not
set. The password is NEVER logged or printed.
"""

import asyncio
import os
import sys
from uuid import uuid4

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from therapy.auth.infrastructure.password_service import PasswordService
from therapy.config import Settings
from therapy.shared.infrastructure.database.tables.user_table import UserTable

settings = Settings()


async def seed_bot_user() -> None:
    email = os.environ.get("BOT_EMAIL")
    password = os.environ.get("BOT_PASSWORD")
    name = os.environ.get("BOT_NAME", "Therapy Bot")

    if not email:
        print("ERROR: BOT_EMAIL environment variable is required", file=sys.stderr)
        sys.exit(1)
    if not password:
        print("ERROR: BOT_PASSWORD environment variable is required", file=sys.stderr)
        sys.exit(1)
    if len(password) < 12:
        print("ERROR: BOT_PASSWORD must be at least 12 characters", file=sys.stderr)
        sys.exit(1)

    engine = create_async_engine(settings.database_url, echo=False)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        password_service = PasswordService()

        result = await session.execute(select(UserTable).where(UserTable.email == email))
        existing = result.scalar_one_or_none()
        if existing:
            print(f"Bot user already exists: {email}")
            return

        password_hash = password_service.hash(password)

        user = UserTable(
            id=str(uuid4()),
            name=name,
            email=email,
            email_verified=True,
            role="admin",
            password_hash=password_hash,
        )

        session.add(user)
        await session.commit()

        print(f"Bot user created: {email}")


if __name__ == "__main__":
    asyncio.run(seed_bot_user())
