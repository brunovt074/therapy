from uuid import uuid4

from httpx import ASGITransport, AsyncClient

from therapy.auth.domain.model.user import User
from therapy.auth.domain.model.user_role import UserRole
from therapy.auth.infrastructure.jwt_service import JWTService
from therapy.auth.infrastructure.sqlalchemy_user_repository import SqlAlchemyUserRepository
from therapy.main import app
from therapy.shared.infrastructure.database.connection import AsyncSessionLocal
from therapy.shared.infrastructure.database.tables.user_table import UserTable

ADMIN_ENDPOINTS = [
    ("GET", "/api/admin/specialties"),
    ("GET", "/api/admin/appointments"),
    ("GET", "/api/admin/patients"),
    ("GET", "/api/admin/blocked-slots"),
    ("GET", "/api/admin/settings"),
]


async def test_admin_endpoints_reject_requests_without_token():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        for method, path in ADMIN_ENDPOINTS:
            response = await client.request(method, path)
            assert response.status_code == 401, f"{method} {path} should require auth"


async def test_admin_endpoints_reject_invalid_token():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get(
            "/api/admin/specialties", headers={"Authorization": "Bearer not-a-real-token"}
        )
        assert response.status_code == 401


async def test_admin_endpoints_reject_staff_token():
    user_id = str(uuid4())
    async with AsyncSessionLocal() as db:
        repo = SqlAlchemyUserRepository(db)
        await repo.save(
            User(id=user_id, name="Staff Test", email=f"{user_id}@test.local", role=UserRole.STAFF)
        )
        await db.commit()

    try:
        token = JWTService().create_token(user_id, UserRole.STAFF)
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            for method, path in ADMIN_ENDPOINTS:
                response = await client.request(
                    method, path, headers={"Authorization": f"Bearer {token}"}
                )
                assert response.status_code == 403, f"{method} {path} should reject staff role"
    finally:
        async with AsyncSessionLocal() as db:
            row = await db.get(UserTable, user_id)
            if row:
                await db.delete(row)
                await db.commit()
