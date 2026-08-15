import asyncio

from tests.unit.conversation.fake_agent import FakeAgent
from tests.unit.conversation.fake_bot_session_repository import FakeBotSessionRepository
from tests.unit.conversation.fake_messenger import FakeMessenger
from therapy_bot_gateway.conversation.application.usecase.handle_incoming_message_usecase import (
    HandleIncomingMessageUseCase,
)
from therapy_bot_gateway.conversation.domain.model.incoming_message import IncomingMessage
from therapy_bot_gateway.conversation.domain.model.message_kind import MessageKind


def _use_case(settings, agent=None, messenger=None, repo=None):
    return HandleIncomingMessageUseCase(
        session_repository=repo or FakeBotSessionRepository(),
        agent=agent or FakeAgent(),
        messenger=messenger or FakeMessenger(),
        settings=settings,
    )


def _text_message(phone_number: str = "5492611234567", text: str = "hola") -> IncomingMessage:
    return IncomingMessage(
        phone_number=phone_number,
        push_name="Marcela",
        instance_name="therapy-bot",
        kind=MessageKind.TEXT,
        text=text,
    )


async def test_opens_a_new_session_for_a_first_time_patient(settings):
    agent = FakeAgent(reply="¡Hola! ¿En qué te ayudo?")
    messenger = FakeMessenger()
    repo = FakeBotSessionRepository()
    use_case = _use_case(settings, agent=agent, messenger=messenger, repo=repo)

    await use_case.execute(_text_message())

    assert agent.opened_titles == ["whatsapp:5492611234567"]
    assert len(agent.sent) == 1
    assert agent.sent[0][1] == "hola"
    assert messenger.sent == [("therapy-bot", "5492611234567", "¡Hola! ¿En qué te ayudo?")]

    stored_session = await repo.find_by_phone("5492611234567")
    assert stored_session is not None
    assert stored_session.session_id == agent.sent[0][0]


async def test_reuses_the_session_for_a_returning_patient(settings):
    agent = FakeAgent()
    repo = FakeBotSessionRepository()
    use_case = _use_case(settings, agent=agent, repo=repo)

    await use_case.execute(_text_message(text="quiero un turno"))
    await use_case.execute(_text_message(text="para el martes"))

    assert len(agent.opened_titles) == 1
    assert [t for _, t in agent.sent] == ["quiero un turno", "para el martes"]
    session_ids_used = {sid for sid, _ in agent.sent}
    assert len(session_ids_used) == 1


async def test_concurrent_first_messages_from_the_same_patient_create_a_single_session(settings):
    agent = FakeAgent()
    repo = FakeBotSessionRepository()
    use_case = _use_case(settings, agent=agent, repo=repo)

    await asyncio.gather(
        use_case.execute(_text_message(text="hola")),
        use_case.execute(_text_message(text="hola de nuevo")),
    )

    assert len(agent.opened_titles) == 2
    session_ids_used = {sid for sid, _ in agent.sent}
    assert len(session_ids_used) == 1


async def test_audio_message_gets_the_unsupported_audio_reply_without_calling_the_agent(settings):
    agent = FakeAgent()
    messenger = FakeMessenger()
    use_case = _use_case(settings, agent=agent, messenger=messenger)
    message = IncomingMessage(
        phone_number="5492611234567",
        push_name="Marcela",
        instance_name="therapy-bot",
        kind=MessageKind.AUDIO,
    )

    await use_case.execute(message)

    assert agent.opened_titles == []
    assert agent.sent == []
    assert messenger.sent == [
        ("therapy-bot", "5492611234567", settings.audio_unsupported_reply)
    ]


async def test_unsupported_message_kind_gets_the_generic_reply(settings):
    messenger = FakeMessenger()
    use_case = _use_case(settings, messenger=messenger)
    message = IncomingMessage(
        phone_number="5492611234567",
        push_name="Marcela",
        instance_name="therapy-bot",
        kind=MessageKind.UNSUPPORTED,
    )

    await use_case.execute(message)

    assert messenger.sent == [
        ("therapy-bot", "5492611234567", settings.unsupported_message_reply)
    ]


async def test_agent_failure_falls_back_to_the_configured_reply(settings):
    agent = FakeAgent(fail=True)
    messenger = FakeMessenger()
    use_case = _use_case(settings, agent=agent, messenger=messenger)

    await use_case.execute(_text_message())

    assert messenger.sent == [("therapy-bot", "5492611234567", settings.fallback_reply)]
