from therapy.auth.domain.invalid_token_error import InvalidTokenError
from therapy.auth.domain.model.user import User
from therapy.auth.domain.repository.user_repository import UserRepository
from therapy.auth.infrastructure.jwt_service import JWTService


class VerifyTokenUseCase:
    def __init__(self, user_repository: UserRepository):
        self._user_repository = user_repository
        self._jwt_service = JWTService()

    async def execute(self, token: str) -> User:
        payload = self._jwt_service.verify_token(token)
        if not payload:
            raise InvalidTokenError()

        user_id = payload.get("sub")
        if not user_id:
            raise InvalidTokenError()

        user = await self._user_repository.find_by_id(user_id)
        if not user:
            raise InvalidTokenError()

        return user
