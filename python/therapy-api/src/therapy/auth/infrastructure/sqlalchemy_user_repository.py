from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from therapy.auth.domain.model.user import User
from therapy.auth.domain.model.user_role import UserRole
from therapy.auth.domain.repository.user_repository import UserRepository
from therapy.auth.infrastructure.password_service import PasswordService
from therapy.shared.infrastructure.database.tables.user_table import UserTable


class SqlAlchemyUserRepository(UserRepository):
    def __init__(self, session: AsyncSession):
        self._session = session
        self._password_service = PasswordService()

    async def find_by_id(self, id: str) -> User | None:
        result = await self._session.execute(select(UserTable).where(UserTable.id == id))
        row = result.scalar_one_or_none()
        return self._to_domain(row) if row else None

    async def find_by_email(self, email: str) -> User | None:
        result = await self._session.execute(select(UserTable).where(UserTable.email == email))
        row = result.scalar_one_or_none()
        return self._to_domain(row) if row else None

    async def save(self, entity: User) -> User:
        row = UserTable(
            id=entity.id,
            name=entity.name,
            email=entity.email,
            email_verified=entity.email_verified,
            image=entity.image,
            role=entity.role.value,
        )
        self._session.add(row)
        await self._session.flush()
        return self._to_domain(row)

    async def verify_password(self, email: str, password: str) -> bool:
        result = await self._session.execute(
            select(UserTable.password_hash).where(UserTable.email == email)
        )
        password_hash = result.scalar_one_or_none()
        if not password_hash:
            return False
        return self._password_service.verify(password, password_hash)

    def _to_domain(self, row: UserTable) -> User:
        return User(
            id=row.id,
            name=row.name,
            email=row.email,
            email_verified=row.email_verified,
            image=row.image,
            role=UserRole(row.role),
            created_at=row.created_at,
            updated_at=row.updated_at,
        )
