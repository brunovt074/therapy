from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # --- App metadata ---
    app_name: str = "Therapy API"
    debug: bool = False
    app_env: str = "development"

    # --- Required secrets (fail fast if missing) ---
    database_url: str = Field(..., description="Postgres async URL (postgresql+asyncpg://...)")
    jwt_secret: str = Field(..., min_length=32, description="JWT signing secret (>=32 chars)")

    # --- Required URLs ---
    app_url: str = Field(..., description="Frontend public URL")
    admin_email: str = Field(..., description="Admin contact email")

    # --- CORS (comma-separated origins) ---
    cors_origins: str = Field(..., description="Comma-separated allowed origins")

    # --- JWT config ---
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24

    # --- Business rules ---
    timezone: str = "America/Argentina/Buenos_Aires"
    slot_duration: int = 45
    business_hours_start: str = "09:00"
    business_hours_end: str = "19:00"
    business_work_days: list[int] = [0, 1, 2, 3, 4, 5]
    token_expiry_days: int = 30

    # --- Rate limits ---
    booking_rate_limit_requests: int = 5
    booking_rate_limit_window_ms: int = 60_000
    contact_rate_limit_requests: int = 3
    contact_rate_limit_window_ms: int = 3_600_000
    availability_rate_limit_requests: int = 30
    availability_rate_limit_window_ms: int = 60_000

    # --- Optional integrations ---
    resend_api_key: str | None = None
    upstash_redis_rest_url: str | None = None
    upstash_redis_rest_token: str | None = None
    cron_secret: str | None = None

    @field_validator("jwt_secret")
    @classmethod
    def jwt_secret_not_placeholder(cls, v: str) -> str:
        placeholders = {"change-me-in-production", "changeme", "secret", "dev"}
        if v.lower() in placeholders:
            raise ValueError(
                "JWT_SECRET is using a placeholder value. "
                "Generate a real secret: python -c 'import secrets; print(secrets.token_urlsafe(48))'"
            )
        return v

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]
