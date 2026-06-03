from datetime import datetime, timedelta, timezone

from jose import JWTError as JoseJWTError, jwt

from therapy.config import Settings
from therapy.auth.domain.model.user_role import UserRole

settings = Settings()


class JWTService:
    def create_token(self, user_id: str, role: UserRole) -> str:
        now = datetime.now(timezone.utc)
        payload = {
            "sub": user_id,
            "role": role.value,
            "iat": now,
            "exp": now + timedelta(hours=settings.jwt_expiration_hours),
        }
        return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)

    def decode_token(self, token: str) -> dict:
        return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])

    def verify_token(self, token: str) -> dict | None:
        try:
            return self.decode_token(token)
        except JoseJWTError:
            return None
