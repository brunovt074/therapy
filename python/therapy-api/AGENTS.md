# Therapy API — Agent Guidelines

> Single Source of Truth for all AI coding agents working on this project.
> Compatible with: OpenCode, Claude Code, Codex, Cursor, Windsurf, Gemini CLI, Copilot, Aider, Junie.

---

## Agent Startup Protocol

**Before writing any code**, every agent MUST:

1. Read this file completely
2. Read `PROJECT_STATUS.md` to understand current state
3. Identify the task type (see Auto-invoke Rules below):
   - If it matches an **SDD workflow step** → Launch the corresponding subagent via `task` tool (skip step 4)
   - If it matches a **skill-based concern** → Read the relevant `skills/{name}/SKILL.md` file(s), then proceed to step 4
4. **For new dependencies/libraries** → Use **Context7** to research the library before adding it:
   ```bash
   context7_resolve_library_id(libraryName="fastapi", query="fastapi dependency injection")
   context7_query_docs(libraryId="/fastapi/fastapi", query="FastAPI Depends async SQLAlchemy")
   ```
5. **For past context** → Use **Engram** to search previous decisions:
   ```bash
   mem_search(query="patient repository upsert phone")
   mem_context(limit=10)
   ```
6. Confirm the target branch before any file modification

> Skipping this protocol produces inconsistent code that will be rejected at review.

---

## Project Overview

| Field | Value |
|-------|-------|
| Name | Therapy API |
| Language | Python 3.12+ |
| Framework | FastAPI 0.115+ |
| Architecture | Clean Architecture / DDD / Server-Centric |
| Database | PostgreSQL (Supabase) + SQLAlchemy 2.0 + Alembic |
| ORM | SQLAlchemy 2.0 (async) |
| Auth | JWT + passlib bcrypt |
| Settings | pydantic-settings |
| Testing | pytest + pytest-asyncio + pytest-cov + aiosqlite |
| Rate Limit | Redis (Upstash) + in-memory fallback |

---

## Setup & Validation Commands

```bash
# Install dependencies
pip install -e ".[dev]"

# Run tests (before every commit)
pytest

# Run tests with coverage
pytest --cov=src/therapy --cov-report=term-missing

# Run server locally
uvicorn therapy.main:app --reload --port 8000

# Run type checker
mypy src/therapy

# Run linter
ruff check src/therapy
```

## Agent Skills Setup

Install skills for your AI coding agent of choice:

```bash
./skills/setup.sh           # Interactive menu
./skills/setup.sh claude    # Claude Code
./skills/setup.sh opencode  # OpenCode
./skills/setup.sh gemini    # Gemini CLI
./skills/setup.sh codex     # OpenAI Codex
./skills/setup.sh copilot   # GitHub Copilot
./skills/setup.sh all       # All agents
```

After creating or modifying any skill, sync to all `AGENTS.md` files:

```bash
./skills/skill-sync/sync.sh
```

---

## Code Style

- **No comments** — code is self-documenting via good naming
- **No raw SQL** — SQLAlchemy ORM exclusively
- **Single file per class** — no embedded enums, no multiple classes per file
- **datetime with timezone** — ZoneInfo, UTC in backend, AR timezone only for display
- **DDD/Clean Architecture** — domain NEVER imports infrastructure
- **UI text in Spanish** (API responses), **code and tests in English**
- **Use Context7** for researching libraries before adding dependencies
- **Use Engram** for saving decisions, patterns, and bug fixes

---

## Testing Rules

- **100% coverage** for use cases and repositories
- **No garbage tests** — `assert True` or empty assertions are rejected
- Every test must represent a realistic business scenario
- Fake repositories for unit tests; SQLite in-memory for integration tests
- Use `*TestFactory` classes for all test data creation
- All tests must be independent — no shared mutable state between tests

---

## Git & Branch Strategy

- **NEVER** commit directly to `main`
- All work in feature branches: `feature/descriptive-name`
- Atomic commits with conventional format: `feat:`, `fix:`, `test:`, `refactor:`, `chore:`
- Validate build before every commit
- **COMMIT HANDOFF**: After implementing changes, NEVER auto-commit. Present the changes to the user with: `git status` + `git diff --stat` and explicitly request: "Dale, hace vos el commit."

---

## Architecture Rules

### Domain Layer (`src/therapy/{module}/domain/`)

```
{module}/
├── domain/
│   ├── model/
│   │   ├── {Entity}.py          # dataclass, immutable
│   │   └── {Enum}.py            # Enum separate file (one per file)
│   └── repository/
│       └── {Entity}Repository.py # ABC, domain language only
```

### Application Layer (`src/therapy/{module}/application/`)

```
{module}/
└── application/
    └── usecase/
        └── {Action}{Entity}UseCase.py
```

### Infrastructure Layer (`src/therapy/{module}/infrastructure/`)

```
{module}/
└── infrastructure/
    └── SqlAlchemy{Entity}Repository.py
```

### Shared Infrastructure (`src/therapy/shared/infrastructure/`)

```
shared/
└── infrastructure/
    ├── database/
    │   ├── connection.py
    │   ├── base.py
    │   └── tables/
    │       └── {Entity}Table.py
    ├── email/
    ├── rate_limit/
    └── audit/
```

### API Layer (`src/therapy/api/`)

```
api/
├── dependencies.py
├── error_handlers.py
├── router.py
├── schemas/
│   ├── {entity}_create_request.py
│   ├── {entity}_update_request.py
│   └── {entity}_response.py
├── public/
│   └── {entity}_routes.py
└── admin/
    └── {entity}_routes.py
```

### Dependency Rule
```
domain <- application <- infrastructure
  ^                         ^
  |                         |
  +---- NEVER depends on ---+

api -> application -> domain
      (FastAPI)      (pure Python)
```

- Domain: entities, value objects, repository interfaces (ABC)
- Application: use cases that orchestrate domain
- Infrastructure: SQLAlchemy repositories, database config
- API: FastAPI routes consuming use cases

---

## Skills

Skills provide specialized context for each concern area. They are **not optional** — they encode decisions made through trial and error on this project.

### Available Skills

| Skill | File | Scope |
|-------|------|-------|
| `architecture` | `skills/architecture/SKILL.md` | shared |
| `sqlalchemy-db` | `skills/sqlalchemy-db/SKILL.md` | shared |
| `testing` | `skills/testing/SKILL.md` | shared |
| `fastapi-server` | `skills/fastapi-server/SKILL.md` | api |
| `skill-creator` | `skills/skill-creator/SKILL.md` | skills |
| `skill-sync` | `skills/skill-sync/SKILL.md` | root |

### Auto-invoke Rules

When performing any of these actions, follow the corresponding workflow:

#### SDD Workflow (Use Subagents)

When a task matches an SDD workflow step, **launch the corresponding subagent** via the `task` tool:

| Action | Use This Subagent | Prompt Guide |
|--------|-------------------|--------------|
| Think through or explore a feature | `sdd-explore` | Include user request, codebase context, existing specs |
| Create a change proposal | `sdd-propose` | Include exploration results, user requirements |
| Write specifications | `sdd-spec` | Include proposal, user requirements |
| Create technical design | `sdd-design` | Include specs, proposal |
| Break down into tasks | `sdd-tasks` | Include design, specs |
| Implement tasks | `sdd-apply` | Include task list, design, specs |
| Verify implementation | `sdd-verify` | Include implementation, specs, design |
| Archive completed change | `sdd-archive` | Include implementation results, task list |

#### Skill-Based Concerns (Read Skills)

When a task matches a skill-based concern, **read the skill FIRST**, then proceed:

| Action | Read This Skill |
|--------|------------------|
| Creating domain entities or value objects | `architecture` |
| Creating or modifying repository interfaces | `architecture` |
| Creating use cases | `architecture` |
| Adding a new domain module | `architecture` |
| Creating SQLAlchemy table definitions | `sqlalchemy-db` |
| Writing or modifying database migrations | `sqlalchemy-db` |
| Implementing repository adapters (SQLAlchemy) | `sqlalchemy-db` |
| Writing unit tests for use cases | `testing` |
| Writing integration tests for repositories | `testing` |
| Creating fake repositories or test factories | `testing` |
| Reviewing or fixing test coverage | `testing` |
| Creating FastAPI routes | `fastapi-server` |
| Creating or modifying API schemas | `fastapi-server` |
| Wiring FastAPI dependencies | `fastapi-server` |
| Creating a new skill | `skill-creator` -> then run `skill-sync` |
| After modifying a skill's scope or description | `skill-sync` |

---

## Decision Log

Architectural decisions made — do not relitigate without strong justification:

| Decision | Rationale |
|----------|----------|
| FastAPI + Pydantic | Native async, auto-docs, type-safe, Python AI ecosystem |
| SQLAlchemy 2.0 + Alembic | Mature ORM, migrations, DB abstraction for future migration |
| Repository Pattern (abstract) | Decouples domain from infrastructure; swap DB with minimal changes |
| Use Cases as classes | Single `execute()` method, constructor injection, testable with fakes |
| Pydantic schemas separate from domain | API schemas = HTTP contracts, not domain models. Avoid coupling |
| Jinja2 for emails | Python-native, no JSX/React Email dependency |
| UUID4 for tokens | Consistency with MVP (`gen_random_uuid()`) |
| datetime with timezone | UTC in backend, AR timezone only for display. ZoneInfo for conversion |
| Alembic (not auto-migrate) | Tracked migrations, production-grade |
| Fake repos for unit tests | Speed + isolation, no I/O in unit tests |
| TestFactory objects | Centralized test data, same convention as ERP |
| Timezone configurable in config | Single source of truth, not hardcoded UTC-3 |
| Patient unique by phone | Business rule: phone is the primary identifier |
| Specialty (not Service) | Avoid semantic collision with software "service" concept |
| max_slots/available_slots on Specialty | Pilates/kinesio = 4 slots, wellness = 1 slot |
| Context7 for library research | Ensure stable versions and compatibility before adding deps |
| Engram for persistent memory | Save decisions, patterns, bugs across sessions |

---

## Context Files

Read these files when starting a session or resuming work:

| File | When to Read |
|------|-------------|
| `AGENTS.md` | Always — this file |
| `PROJECT_STATUS.md` | Always — current state, pending tasks, known issues |
| `skills/{name}/SKILL.md` | Before touching that concern area |

---

## Current Status

See [PROJECT_STATUS.md](PROJECT_STATUS.md) for detailed implementation progress.
