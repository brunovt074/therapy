from therapy.auth.domain.invalid_credentials_error import InvalidCredentialsError
from therapy.auth.domain.repository.user_repository import UserRepository
from therapy.auth.infrastructure.jwt_service import JWTService


class AuthenticateUserUseCase:
    def __init__(self, user_repository: UserRepository):
        self._user_repository = user_repository
        self._jwt_service = JWTService()

    async def execute(self, email: str, password: str) -> dict:
        user = await self._user_repository.find_by_email(email)
        if not user:
            raise InvalidCredentialsError()

        valid = await self._user_repository.verify_password(email, password)
        if not valid:
            raise InvalidCredentialsError()

        token = self._jwt_service.create_token(user.id, user.role)

        from therapy.config import Settings

        settings = Settings()
        return {
            "access_token": token,
            "token_type": "bearer",
            "expires_in": settings.jwt_expiration_hours * 3600,
        }
