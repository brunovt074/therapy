from fastapi import APIRouter

from therapy_bot_gateway.api.public import webhook_routes

api_router = APIRouter()
api_router.include_router(webhook_routes.router, prefix="/webhook")
