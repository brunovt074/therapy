ENV_FILE ?= .env.local
PROFILE ?= local

.PHONY: up up-local up-prod down build watch migrate seed-admin setup setup-local setup-prod logs logs-backend logs-frontend shell-backend lint test clean

up-local:
	docker compose --env-file .env.local --profile local up -d

up-prod:
	docker compose --env-file .env.prod --profile prod up -d

up: up-local

down:
	docker compose --env-file $(ENV_FILE) down

build:
	docker compose --env-file $(ENV_FILE) up --build -d

build-local:
	docker compose --env-file .env.local --profile local up --build -d

build-prod:
	docker compose --env-file .env.prod --profile prod up --build -d

watch:
	docker compose --env-file $(ENV_FILE) watch

migrate:
	docker compose --env-file $(ENV_FILE) exec backend alembic upgrade head

migrate-local:
	docker compose --env-file .env.local exec backend alembic upgrade head

seed-admin:
	docker compose --env-file $(ENV_FILE) exec backend python scripts/seed_admin.py

seed-admin-local:
	docker compose --env-file .env.local exec backend python scripts/seed_admin.py

logs:
	docker compose --env-file $(ENV_FILE) logs -f

logs-backend:
	docker compose --env-file $(ENV_FILE) logs -f backend

logs-frontend:
	docker compose --env-file $(ENV_FILE) logs -f frontend

shell-backend:
	docker compose --env-file $(ENV_FILE) exec backend bash

shell-postgres:
	docker compose --env-file $(ENV_FILE) exec postgres psql -U therapy -d therapy

lint:
	docker compose --env-file $(ENV_FILE) exec backend ruff check src/therapy

test:
	docker compose --env-file $(ENV_FILE) exec backend pytest

setup-local: build-local
	@echo "Waiting for postgres to be ready..."
	sleep 3
	docker compose --env-file .env.local exec backend alembic upgrade head
	docker compose --env-file .env.local exec backend python scripts/seed_admin.py
	@echo ""
	@echo "=========================================="
	@echo "  Therapy is running (LOCAL)!"
	@echo "  Frontend: http://localhost:3001"
	@echo "  Backend:  http://localhost:8001"
	@echo "  Admin:    admin@therapy.local / admin"
	@echo "=========================================="

setup-prod: build-prod
	@echo "Waiting for backend to start..."
	sleep 5
	docker compose --env-file .env.prod exec backend alembic upgrade head
	docker compose --env-file .env.prod exec backend python scripts/seed_admin.py
	@echo ""
	@echo "=========================================="
	@echo "  Therapy is running (PROD)!"
	@echo "  Frontend: http://localhost:3000"
	@echo "  Backend:  http://localhost:8000"
	@echo "  Caddy:    http://localhost:8080"
	@echo "  Admin:    admin@therapy.local / admin"
	@echo "=========================================="

setup: setup-local

clean:
	docker compose --env-file $(ENV_FILE) down -v
	@echo "Volumes eliminados"