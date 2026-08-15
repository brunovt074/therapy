from therapy_bot_gateway.config import Settings
from therapy_bot_gateway.conversation.domain.agent_unavailable_error import AgentUnavailableError
from therapy_bot_gateway.conversation.domain.model.incoming_message import IncomingMessage
from therapy_bot_gateway.conversation.domain.model.message_kind import MessageKind
from therapy_bot_gateway.conversation.domain.port.agent_port import AgentPort
from therapy_bot_gateway.conversation.domain.port.messenger_port import MessengerPort
from therapy_bot_gateway.conversation.domain.repository.bot_session_repository import (
    BotSessionRepository,
)


class HandleIncomingMessageUseCase:
    def __init__(
        self,
        session_repository: BotSessionRepository,
        agent: AgentPort,
        messenger: MessengerPort,
        settings: Settings,
    ):
        self._session_repository = session_repository
        self._agent = agent
        self._messenger = messenger
        self._settings = settings

    async def execute(self, message: IncomingMessage) -> None:
        if message.kind == MessageKind.AUDIO:
            await self._reply(message, self._settings.audio_unsupported_reply)
            return

        if message.kind != MessageKind.TEXT or not message.text:
            await self._reply(message, self._settings.unsupported_message_reply)
            return

        session = await self._session_repository.find_by_phone(message.phone_number)
        if not session:
            session_id = await self._agent.open_session(title=f"whatsapp:{message.phone_number}")
            session = await self._session_repository.get_or_create(message.phone_number, session_id)

        try:
            reply = await self._agent.send(session.session_id, message.text)
        except AgentUnavailableError:
            reply = self._settings.fallback_reply

        await self._reply(message, reply)

    async def _reply(self, message: IncomingMessage, text: str) -> None:
        await self._messenger.send_text(message.instance_name, message.phone_number, text)
