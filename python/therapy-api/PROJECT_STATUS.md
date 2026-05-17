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
- [ ] Alembic migrations
- [ ] Rate limiting implementation
- [ ] Email infrastructure (para otra etapa)

### Fase 4: API Layer 🔄 EN PROGRESO

- [x] FastAPI main app + CORS + health check
- [x] Router aggregation
- [x] Error handlers
- [x] Schemas: Specialty, Patient, Appointment, Availability, BlockedSlot
- [x] Public routes: specialties, appointments, availability
- [x] Admin routes: specialties, appointments, patients, blocked-slots
- [ ] Auth middleware + JWT
- [ ] Rate limiting middleware
- [ ] Admin authorization guards

### Fase 5: Testing ✅

- [x] 19 unit tests pasando (100% de use cases cubiertos)
- [ ] Integration tests con SQLite
- [ ] API integration tests

## Decisiones Recientes

| Fecha | Decision |
|-------|----------|
| 2026-05-10 | Timezone configurable en Settings, no hardcoded UTC-3 |
| 2026-05-10 | Patient: id=int, unique por phone, mandatory name+phone, no DNI |
| 2026-05-10 | Specialty (not Service) con max_slots y available_slots |
| 2026-05-10 | Upsert: phone first, email fallback |
| 2026-05-10 | datetime.timezone.utc en vez de utcnow() |

## Proxima Accion

1. Completar auth middleware + JWT
2. Agregar rate limiting
3. Crear Alembic migrations
4. Integration tests con SQLite

*Ultima actualizacion: 10 May 2026*
