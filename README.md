# Therapy

Sistema de turnos para clinica de fisioterapia.

## Estructura

Este repositorio es un **monorepo de git submodules**. Cada subcarpeta apunta a su repo independiente:

| Path | Repo | Descripcion |
|------|------|-------------|
| `python/therapy-api/` | [therapy-api](https://github.com/brunovt074/therapy-api) | Backend FastAPI + SQLAlchemy + Alembic |
| `js/therapy-v3/` | [therapy-v3](https://github.com/brunovt074/therapy-v3) | Frontend Next.js 16 |
| `integrations/therapy/` | [therapy-integrations](https://github.com/brunovt074/therapy-integrations) | Docker Compose + Caddy + scripts |

## Clonar

```bash
git clone --recurse-submodules git@github.com:brunovt074/therapy.git
cd therapy
```

Si ya clonaste sin `--recurse-submodules`:

```bash
git submodule update --init --recursive
```

## Requisitos

- Docker >= 27 + Docker Compose >= 2.30
- Make

## Inicio rapido (local)

```bash
cd integrations/therapy
cp .env.example .env.local
make setup-local
```

- Frontend: http://localhost:3001
- Backend:  http://localhost:8001/docs
- Admin:    ver `ADMIN_EMAIL` / `ADMIN_PASSWORD` en `.env.local`

## Comandos principales

| Comando | Que hace |
|---------|----------|
| `make setup-local` | Build + migrate + seed admin |
| `make up-local` | Levanta sin rebuild |
| `make down` | Frena todo |
| `make build-local` | Rebuild con cambios |
| `make logs-backend` | Logs del backend |
| `make logs-frontend` | Logs del frontend |
| `make test` | Tests en el backend |
| `make lint` | Ruff en el backend |
| `make migrate-local` | Corre migrations |
| `make shell-backend` | Bash dentro del backend |
| `make shell-postgres` | psql directo a la DB |
| `make backup-local` | pg_dump local |
| `make clean` | Frena y borra volumes |
| `make watch` | Sync en vivo de codigo |

## Puertos locales

| Servicio | Puerto |
|----------|--------|
| Frontend | 3001 |
| Backend  | 8001 |
| Postgres | 5433 |

## Actualizar submodules

Cuando hay cambios en cualquier subproyecto:

```bash
git submodule update --remote
git add python/therapy-api js/therapy-v3 integrations/therapy
git commit -m "chore: bump submodule pointers"
git push
```

## Deploy (Hostinger VPS)

Ver `integrations/therapy/.env.prod.example` para el template de produccion y `integrations/therapy/DB_STRATEGY.md` para la estrategia de base de datos.
