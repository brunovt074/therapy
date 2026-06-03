ENV_FILE ?= .env.local
PROFILE ?= local

.PHONY: up up-local up-prod down build build-local build-prod watch migrate migrate-local seed-admin seed-admin-local setup setup-local setup-prod logs logs-backend logs-frontend shell-backend shell-postgres lint test backup backup-local restore clean install-hooks

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
	@set -a; . ./$(ENV_FILE); set +a; \
		docker compose --env-file $(ENV_FILE) exec \
			-e ADMIN_EMAIL \
			-e ADMIN_PASSWORD \
			-e ADMIN_NAME \
			backend python scripts/seed_admin.py

seed-admin-local:
	@set -a; . ./.env.local; set +a; \
		docker compose --env-file .env.local exec \
			-e ADMIN_EMAIL \
			-e ADMIN_PASSWORD \
			-e ADMIN_NAME \
			backend python scripts/seed_admin.py

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
	@set -a; . ./.env.local; set +a; \
		docker compose --env-file .env.local exec \
			-e ADMIN_EMAIL \
			-e ADMIN_PASSWORD \
			-e ADMIN_NAME \
			backend python scripts/seed_admin.py
	@echo ""
	@echo "=========================================="
	@echo "  Therapy is running (LOCAL)!"
	@echo "  Frontend: http://localhost:3001"
	@echo "  Backend:  http://localhost:8001"
	@echo "  Admin:    see ADMIN_EMAIL in .env.local"
	@echo "=========================================="

setup-prod: build-prod
	@echo "Waiting for backend to start..."
	sleep 5
	docker compose --env-file .env.prod exec backend alembic upgrade head
	@set -a; . ./.env.prod; set +a; \
		docker compose --env-file .env.prod exec \
			-e ADMIN_EMAIL \
			-e ADMIN_PASSWORD \
			-e ADMIN_NAME \
			backend python scripts/seed_admin.py
	@echo ""
	@echo "=========================================="
	@echo "  Therapy is running (PROD)!"
	@echo "  Frontend: http://localhost:3000"
	@echo "  Backend:  http://localhost:8000"
	@echo "  Caddy:    http://localhost:8080"
	@echo "  Admin:    see ADMIN_EMAIL in .env.prod"
	@echo "=========================================="

setup: setup-local

backup:
	ENV_FILE=$(ENV_FILE) ./scripts/backup.sh

backup-local:
	ENV_FILE=.env.local ./scripts/backup.sh

restore:
ifndef BACKUP
	$(error Specify BACKUP=path/to/backup.sql.gz)
endif
	@set -a; . ./$(ENV_FILE); set +a; \
		gunzip -c $(BACKUP) | docker compose --env-file $(ENV_FILE) exec -T postgres \
			psql -U "$$POSTGRES_USER" -d "$$POSTGRES_DB"
	@echo "Restore complete from $(BACKUP)"

clean:
	docker compose --env-file $(ENV_FILE) down -v
	@echo "Volumes eliminados"

install-hooks:
	git config core.hooksPath .githooks
	@echo ""
	@echo "Hooks installed. Now set the monorepo path (one-time per machine):"
	@echo "  git config therapy.monorepoPath /path/to/therapy"
	@echo ""
	@echo "After that, every 'git push origin main' will auto-sync the monorepo."