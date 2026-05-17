# Therapy

Monorepo del sistema de turnos para clinica de fisioterapia.

## Estructura

```
├── python/therapy-api/       ← Backend FastAPI + PostgreSQL
├── js/therapy-v3/            ← Frontend Next.js 16
└── integrations/therapy/     ← Docker Compose + config de entorno
```

## Requisitos

- Docker >= 27 + Docker Compose >= 2.30
- Make (opcional)

## Inicio rapido (local)

```bash
cd integrations/therapy
cp .env.example .env.local
make setup-local
```

- Frontend http://localhost:3001
- Backend  http://localhost:8001/docs
- Admin    admin@therapy.local / admin

## Comandos principales

| Comando | Que hace |
|---------|----------|
| `make setup-local` | Build completo + migrate + seed admin |
| `make up-local` | Levanta sin rebuild |
| `make down` | Frena todo |
| `make build-local` | Rebuild con cambios |
| `make logs-backend` | Logs del backend |
| `make logs-frontend` | Logs del frontend |
| `make test` | Corre tests en backend |
| `make lint` | Ruff en backend |
| `make migrate-local` | Corre migrations |
| `make shell-backend` | Bash dentro del backend |
| `make shell-postgres` | psql directo a la DB |
| `make clean` | Frena y borra volumenes |
| `make watch` | Sync en vivo de codigo |

## Puertos locales

| Servicio | Puerto |
|----------|--------|
| Frontend | 3001 |
| Backend | 8001 |
| Postgres | 5433 |

## Variables de entorno

Copiar `.env.example` a `.env.local` y ajustar si hace falta.

| Variable | Default | Descripcion |
|----------|---------|-------------|
| `POSTGRES_PORT` | `5433` | Puerto host para PostgreSQL |
| `BACKEND_PORT` | `8001` | Puerto host para API |
| `FRONTEND_PORT` | `3001` | Puerto host para frontend |
| `DATABASE_URL` | `postgresql+asyncpg://...` | Conexion DB |
| `JWT_SECRET` | (requerido) | Secret para tokens JWT |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8001` | URL de API que usa el frontend |
