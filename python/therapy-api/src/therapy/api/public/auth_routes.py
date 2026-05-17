from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from therapy.api.schemas.login_request import LoginRequest
from therapy.api.schemas.token_response import TokenResponse
from therapy.api.schemas.user_response import UserResponse
from therapy.auth.application.usecase.authenticate_user_usecase import AuthenticateUserUseCase
from therapy.auth.application.usecase.verify_token_usecase import VerifyTokenUseCase
from therapy.auth.domain.invalid_credentials_error import InvalidCredentialsError
from therapy.auth.domain.invalid_token_error import InvalidTokenError
from therapy.auth.infrastructure.sqlalchemy_user_repository import SqlAlchemyUserRepository
from therapy.shared.infrastructure.database.connection import get_db

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    repo = SqlAlchemyUserRepository(db)
    use_case = AuthenticateUserUseCase(repo)
    try:
        return await use_case.execute(request.email, request.password)
    except InvalidCredentialsError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.get("/me", response_model=UserResponse)
async def me(authorization: str = Header(""), db: AsyncSession = Depends(get_db)):
    token = authorization.removeprefix("Bearer ")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")
    repo = SqlAlchemyUserRepository(db)
    use_case = VerifyTokenUseCase(repo)
    try:
        user = await use_case.execute(token)
        return UserResponse(user_id=user.id, role=user.role.value)
    except InvalidTokenError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
