"""Seed script: create admin user.

Usage:
    ADMIN_EMAIL=... ADMIN_PASSWORD=... ADMIN_NAME=... python scripts/seed_admin.py

Required environment variables:
    ADMIN_EMAIL     Admin email (must be unique)
    ADMIN_PASSWORD  Admin password (min 12 chars)
    ADMIN_NAME      Admin display name (optional, default: "Admin")

The script will FAIL if ADMIN_EMAIL or ADMIN_PASSWORD are not set.
The password is NEVER logged or printed.
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


async def seed_admin() -> None:
    email = os.environ.get("ADMIN_EMAIL")
    password = os.environ.get("ADMIN_PASSWORD")
    name = os.environ.get("ADMIN_NAME", "Admin")

    if not email:
        print("ERROR: ADMIN_EMAIL environment variable is required", file=sys.stderr)
        sys.exit(1)
    if not password:
        print("ERROR: ADMIN_PASSWORD environment variable is required", file=sys.stderr)
        sys.exit(1)
    if len(password) < 12:
        print("ERROR: ADMIN_PASSWORD must be at least 12 characters", file=sys.stderr)
        sys.exit(1)

    engine = create_async_engine(settings.database_url, echo=False)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        password_service = PasswordService()

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

        print(f"Admin user created: {email}")


if __name__ == "__main__":
    asyncio.run(seed_admin())
