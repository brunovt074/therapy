# Therapy API — Project Status

## Overview

Backend API para administracion de turnos de clinica de fisioterapia.
Migracion desde MVP Next.js monolitico a arquitectura Clean Architecture con FastAPI.

## Tech Stack

| Component | Technology |
|-----------|------------|
| Language | Python 3.12+ |
| Framework | FastAPI 0.136+ |
| ORM | SQLAlchemy 2.0 (async) |
| Migrations | Alembic |
| DB | PostgreSQL (Supabase) |
| Auth | JWT + passlib bcrypt |
| Settings | pydantic-settings |
| Testing | pytest + pytest-asyncio + pytest-cov |
| Rate Limit | Redis + in-memory fallback |

## Implementation Status

### Fase 0: Scaffolding ✅ COMPLETADO

- [x] Estructura de directorios
- [x] pyproject.toml con dependencias
- [x] AGENTS.md con workflow SDD
- [x] Skills: architecture, sqlalchemy-db, testing, fastapi-server, skill-creator, skill-sync
- [x] pytest configurado
- [x] uvicorn levanta

### Fase 1: Domain Layer ✅ COMPLETADO

- [x] config.py con timezone configurable
- [x] Domain exceptions
- [x] Value objects (TimeSlot, Period, ParsedDay)
- [x] Enums separados (AppointmentStatus, UserRole, ActorType)
- [x] Entidades: Specialty, Patient, Appointment, BlockedSlot, User, Session, AuditLog
- [x] Repository interfaces (ABC) para todas las entidades

### Fase 2: Application Layer ✅ COMPLETADO

- [x] CreateSpecialtyUseCase + tests
- [x] UpdateSpecialtyUseCase
- [x] DeactivateSpecialtyUseCase
- [x] UpsertPatientUseCase + tests (phone-first, email fallback)
- [x] CreateAppointmentUseCase + tests
- [x] ConfirmAppointmentUseCase + tests
- [x] CancelAppointmentUseCase + tests
- [x] GetAvailableSlotsUseCase
- [x] Fake repositories para testing
- [x] Test factories

### Fase 3: Infrastructure Layer 🔄 EN PROGRESO

- [x] SQLAlchemy base + connection
- [x] Database tables: Specialty, Patient, Appointment, BlockedSlot, User, AuditLog
- [x] SQLAlchemy repositories: Specialty, Patient, Appointment, BlockedSlot
- [x] Alembic migrations (4 migraciones aplicadas)
- [x] Rate limiting implementation (`shared/infrastructure/rate_limit/`)
- [ ] Email infrastructure (para otra etapa)

### Fase 4: API Layer ✅ COMPLETADO

- [x] FastAPI main app + CORS + health check
- [x] Router aggregation
- [x] Error handlers
- [x] Schemas: Specialty, Patient, Appointment, Availability, BlockedSlot
- [x] Public routes: specialties, appointments, availability
- [x] Admin routes: specialties, appointments, patients, blocked-slots, settings
- [x] Auth middleware + JWT (`get_current_user`)
- [x] Admin authorization guards (`require_admin`, 403 si el rol no es admin)
- [ ] Rate limiting middleware (implementación existe, falta wiring en las rutas)

### Fase 5: Testing ✅

- [x] 47 tests pasando (unit + integration)
- [ ] Integration tests con SQLite (hoy corren contra la Postgres real del contenedor)
- [x] API integration tests (401/403 sobre las 5 rutas admin)

## Decisiones Recientes

| Fecha | Decision |
|-------|----------|
| 2026-05-10 | Timezone configurable en Settings, no hardcoded UTC-3 |
| 2026-05-10 | Patient: id=int, unique por phone, mandatory name+phone, no DNI |
| 2026-05-10 | Specialty (not Service) con max_slots y available_slots |
| 2026-05-10 | Upsert: phone first, email fallback |
| 2026-05-10 | datetime.timezone.utc en vez de utcnow() |
| 2026-08-15 | Admin routes requerían token válido pero no rol — `require_admin` cierra el gap (403 con rol staff) |
| 2026-08-15 | Reprogramar/cancelar turno vía admin + chequeo de horario de atención al crear/reprogramar |

## Proxima Accion

Este backend es ahora la base de un bot de recepción por WhatsApp (ver
`python/therapy-mcp/` y `.opencode/agent/`, en la rama `feature/whatsapp-reception-bot`).

1. Wiring de rate limiting en las rutas (implementación existe, no está conectada)
2. Integration tests contra SQLite en vez de la Postgres real del contenedor
3. Email infrastructure

*Ultima actualizacion: 15 Aug 2026*
