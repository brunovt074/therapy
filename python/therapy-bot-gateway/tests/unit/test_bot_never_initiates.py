"""Architecture guard for an explicit client requirement: the bot answers,
it never starts a conversation.

This is enforced structurally rather than by convention — an outbound
WhatsApp message can only be produced by handling an IncomingMessage. These
tests fail if someone later adds a scheduler, a background job, or a second
call site that could send unprompted.

The reminders feature (confirm/cancel by token) is still an open business
question with the client: a scheduled reminder is, technically, the bot
starting a conversation. If it's ever approved, these tests are the place to
encode the agreed boundary — don't just delete them.
"""

from pathlib import Path

SRC = Path(__file__).parent.parent.parent / "src" / "therapy_bot_gateway"

SCHEDULER_MARKERS = [
    "apscheduler",
    "celery",
    "rq.Queue",
    "repeat_every",
    "BackgroundTasks",
    "asyncio.create_task",
]


def _python_sources() -> list[Path]:
    return [p for p in SRC.rglob("*.py") if "__pycache__" not in p.parts]


def test_no_scheduler_or_background_job_is_wired_in():
    offenders = []
    for path in _python_sources():
        content = path.read_text()
        for marker in SCHEDULER_MARKERS:
            if marker in content:
                offenders.append(f"{path.relative_to(SRC)}: {marker}")

    assert not offenders, (
        "The bot must never initiate a conversation, so no scheduled or "
        f"background execution path may exist. Found: {offenders}"
    )


def test_outbound_messages_have_exactly_one_call_site():
    call_sites = [
        path.relative_to(SRC)
        for path in _python_sources()
        if "self._messenger.send_text(" in path.read_text()
    ]

    assert call_sites == [
        Path("conversation/application/usecase/handle_incoming_message_usecase.py")
    ], (
        "Outbound WhatsApp messages must only be sent while handling an "
        f"IncomingMessage. Found call sites: {call_sites}"
    )


def test_the_use_case_is_only_entered_from_the_inbound_webhook():
    entry_points = [
        path.relative_to(SRC)
        for path in _python_sources()
        if "HandleIncomingMessageUseCase(" in path.read_text()
        and "application/usecase" not in str(path)
    ]

    assert entry_points == [Path("api/public/webhook_routes.py")], (
        "The conversation use case must only be reachable from the inbound "
        f"Evolution API webhook. Found entry points: {entry_points}"
    )
