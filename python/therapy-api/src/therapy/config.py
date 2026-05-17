from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Therapy API"
    debug: bool = False
    database_url: str = "postgresql+asyncpg://user:pass@localhost/therapy"
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24
    timezone: str = "America/Argentina/Buenos_Aires"
    slot_duration: int = 45
    business_hours_start: str = "09:00"
    business_hours_end: str = "19:00"
    business_work_days: list[int] = [0, 1, 2, 3, 4, 5]
    token_expiry_days: int = 30
    booking_rate_limit_requests: int = 5
    booking_rate_limit_window_ms: int = 60_000
    contact_rate_limit_requests: int = 3
    contact_rate_limit_window_ms: int = 3_600_000
    availability_rate_limit_requests: int = 30
    availability_rate_limit_window_ms: int = 60_000
    resend_api_key: str | None = None
    admin_email: str = "admin@therapy.local"
    app_url: str = "http://localhost:3000"
    upstash_redis_rest_url: str | None = None
    upstash_redis_rest_token: str | None = None
    cron_secret: str | None = None

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
