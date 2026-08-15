from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from therapy_bot_gateway.api.dependencies import get_agent, get_messenger, get_settings
from therapy_bot_gateway.api.schemas.evolution_webhook_request import EvolutionWebhookRequest
from therapy_bot_gateway.config import Settings
from therapy_bot_gateway.conversation.application.usecase.handle_incoming_message_usecase import (
    HandleIncomingMessageUseCase,
)
from therapy_bot_gateway.conversation.infrastructure.evolution_messenger import (
    EvolutionMessenger,
)
from therapy_bot_gateway.conversation.infrastructure.opencode_agent import OpenCodeAgent
from therapy_bot_gateway.conversation.infrastructure.sqlalchemy_bot_session_repository import (
    SqlAlchemyBotSessionRepository,
)
from therapy_bot_gateway.shared.infrastructure.database.connection import get_db

router = APIRouter()


@router.post("")
async def receive_webhook(
    request: EvolutionWebhookRequest,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
    agent: OpenCodeAgent = Depends(get_agent),
    messenger: EvolutionMessenger = Depends(get_messenger),
):
    message = request.to_incoming_message()
    if message is None:
        return {"status": "ignored"}

    session_repository = SqlAlchemyBotSessionRepository(db)
    use_case = HandleIncomingMessageUseCase(session_repository, agent, messenger, settings)
    await use_case.execute(message)
    return {"status": "ok"}
