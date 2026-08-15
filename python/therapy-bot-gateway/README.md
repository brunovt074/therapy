# therapy-bot-gateway

WhatsApp reception bot backend. Receives Evolution API webhooks, talks to a
running `opencode serve` instance (running the `therapy-reception-bot` agent,
which uses `therapy-mcp`'s tools against `therapy-api`), and replies back
through Evolution API.

Replaces the orchestration an n8n workflow would have done — that template
was inspiration for the message flow only, never a dependency: no n8n is
installed or deployed anywhere in this stack.

```
Evolution API (webhook) -> bot-gateway -> opencode serve (agent: therapy-reception-bot)
                                             -> therapy-mcp tools -> therapy-api -> Postgres
                         <- bot-gateway <-------------------------------------------|
Evolution API (reply)   <-
```

## Architecture

Hexagonal, mirroring `therapy-api`'s conventions (`AGENTS.md`): domain never
imports infrastructure.

- `conversation/domain/` — `IncomingMessage`, `MessageKind`, `BotSession`,
  and three ports: `AgentPort` (the LLM runner), `MessengerPort` (WhatsApp
  send), `TranscriberPort` (voice notes — declared, not implemented yet).
- `conversation/application/usecase/handle_incoming_message_usecase.py` —
  the only use case: route by message kind, open or reuse a session per
  phone number, forward to the agent, reply.
- `conversation/infrastructure/` — `OpenCodeAgent` (implements `AgentPort`
  against `opencode serve`'s HTTP API), `EvolutionMessenger` (implements
  `MessengerPort`), `SqlAlchemyBotSessionRepository`.

`AgentPort` is the swap point for a future runner (e.g. a Claude API-backed
agent for production deploys, since `opencode serve` needs the developer's
machine running). Adding one is a new `infrastructure/` file — domain and
the use case don't change.

## A safety invariant worth knowing before touching `OpenCodeAgent`

`opencode serve` does **not** pin the agent when a session is created —
passing `agent` to `POST /session` is silently ignored on the next message.
Every `POST /session/{id}/message` must carry `agent="therapy-reception-bot"`
in its own body, or the session falls back to `build`, which has bash and
file edit permissions. `OpenCodeAgent.send()` hardcodes this on every call;
`tests/unit/conversation/test_opencode_agent.py` asserts it's never omitted.
Don't add a code path that calls opencode without going through this class.

## Setup

```
cp .env.example .env   # fill in the values below
pip install -e ".[dev]"
alembic upgrade head
```

Required env vars: `DATABASE_URL` (its own `bot_sessions` table — reuses the
`evolution_postgres` container from `docker-compose.bot.yml`, a separate
`bot_gateway` database within it, not therapy-api's schema),
`OPENCODE_BASE_URL`, `EVOLUTION_BASE_URL`, `EVOLUTION_API_KEY`. See
`config.py` for the rest (agent name, opencode basic auth, reply strings).

## opencode serve must be reachable and password-protected

The gateway runs in a container and reaches the host via
`host.docker.internal`, so `opencode serve` has to bind to `0.0.0.0` (not
the default `127.0.0.1`) — which means it's reachable from outside the
container too, so it must be password-protected:

```
OPENCODE_SERVER_PASSWORD=<same value as OPENCODE_PASSWORD in .env.bot> \
  opencode serve --hostname 0.0.0.0
```

## Run standalone

```
uvicorn therapy_bot_gateway.main:app --reload --port 8000
```

`POST /webhook` is what Evolution API's webhook config points to. `GET
/health` for liveness checks.

## Tests

```
pytest                    # unit + integration (SQLite in-memory)
pytest --cov              # matches the fail_under=100 config; ABCs and
                           # untested wiring code will show as missing —
                           # same situation as therapy-api's own coverage
```

`tests/integration/test_webhook_routes.py` exercises the full FastAPI route
with fakes injected via `dependency_overrides` — no real opencode, Evolution
API, or WhatsApp number needed. That's deliberate: it's the check that used
to be blocked on having a phone number to test with.
