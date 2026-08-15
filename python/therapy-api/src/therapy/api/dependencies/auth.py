from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from therapy.auth.application.usecase.verify_token_usecase import VerifyTokenUseCase
from therapy.auth.domain.invalid_token_error import InvalidTokenError
from therapy.auth.domain.model.user import User
from therapy.auth.domain.model.user_role import UserRole
from therapy.auth.infrastructure.sqlalchemy_user_repository import SqlAlchemyUserRepository
from therapy.shared.infrastructure.database.connection import get_db


async def get_current_user(
    authorization: str = Header(""), db: AsyncSession = Depends(get_db)
) -> User:
    token = authorization.removeprefix("Bearer ")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")

    repo = SqlAlchemyUserRepository(db)
    use_case = VerifyTokenUseCase(repo)
    try:
        return await use_case.execute(token)
    except InvalidTokenError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


async def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin role required")
    return user
