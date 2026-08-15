from fastapi import FastAPI

from therapy_bot_gateway.api.router import api_router
from therapy_bot_gateway.config import Settings

settings = Settings()

app = FastAPI(
    title=settings.app_name,
    description="WhatsApp reception bot gateway: Evolution API webhook to opencode agent",
    version="0.1.0",
)

app.include_router(api_router)


@app.get("/health")
async def health_check():
    return {"status": "ok"}
