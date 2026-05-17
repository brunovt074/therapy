"""Seed script: create admin user for testing.

Usage:
    python scripts/seed_admin.py

Environment:
    ADMIN_EMAIL    default: admin@therapy.local
    ADMIN_PASSWORD default: admin
    ADMIN_NAME     default: Admin User
"""

import asyncio
import os
import sys
from uuid import uuid4

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from therapy.config import Settings
from therapy.auth.infrastructure.password_service import PasswordService
from therapy.shared.infrastructure.database.tables.user_table import UserTable

settings = Settings()


async def seed_admin():
    engine = create_async_engine(settings.database_url, echo=False)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        password_service = PasswordService()

        email = os.environ.get("ADMIN_EMAIL", "admin@therapy.local")
        password = os.environ.get("ADMIN_PASSWORD", "admin")
        name = os.environ.get("ADMIN_NAME", "Admin User")

        result = await session.execute(select(UserTable).where(UserTable.email == email))
        existing = result.scalar_one_or_none()
        if existing:
            print(f"Admin user already exists: {email}")
            return

        password_hash = password_service.hash(password)

        user = UserTable(
            id=str(uuid4()),
            name=name,
            email=email,
            email_verified=False,
            role="admin",
            password_hash=password_hash,
        )

        session.add(user)
        await session.commit()

        print(f"Admin user created: {email} / {password}")


if __name__ == "__main__":
    asyncio.run(seed_admin())
