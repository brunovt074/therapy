ENV_FILE ?= .env.local
PROFILE ?= local
VPS ?=
PLATFORM ?= linux/amd64
SSH_KEY ?= ~/.ssh/id_ed25519

.PHONY: up up-local up-prod down build build-local build-prod dev watch migrate migrate-local seed-admin seed-admin-local setup setup-local setup-prod logs logs-backend logs-frontend shell-backend shell-postgres lint test backup backup-local restore clean install-hooks build-images ship-images deploy-prod seed-admin-prod up-bot down-bot logs-bot seed-bot-local

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

dev:
	docker compose --env-file .env.local up -d postgres backend
	@sleep 2
	@trap 'kill 0 2>/dev/null; true' EXIT; \
		PORT=$$(./scripts/find-port.sh 3000); \
		echo "Backend watch:   http://localhost:8001"; \
		echo "Frontend HMR:    http://localhost:$$PORT"; \
		docker compose --env-file .env.local watch & \
		cd ../../js/therapy-v3 && NEXT_PUBLIC_API_URL=http://localhost:8001 npm run dev -- -p $$PORT

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

seed-bot-local:
	@set -a; . ./.env.bot; set +a; \
		docker compose --env-file .env.local exec \
			-e BOT_EMAIL \
			-e BOT_PASSWORD \
			-e BOT_NAME \
			backend python scripts/seed_bot_user.py

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

# --- Bot stack (Evolution API + therapy-bot-gateway, local only) ---

up-bot:
	docker compose -f docker-compose.bot.yml --env-file .env.bot up -d

down-bot:
	docker compose -f docker-compose.bot.yml --env-file .env.bot down

logs-bot:
	docker compose -f docker-compose.bot.yml --env-file .env.bot logs -f

# --- Remote deploy (build local, ship via SSH, run on VPS) ---
# Usage: make deploy-prod VPS=opc@144.22.57.197
# First deploy: also run make seed-admin-prod VPS=...

build-images:
	@echo "Building backend image for $(PLATFORM)..."
	docker buildx build --platform $(PLATFORM) --load \
		-f Dockerfile.backend \
		-t therapy-backend:latest \
		../../python/therapy-api
	@echo "Building frontend image for $(PLATFORM)..."
	docker buildx build --platform $(PLATFORM) --load \
		-f Dockerfile.frontend \
		--build-arg NEXT_PUBLIC_API_URL=http://backend:8000 \
		-t therapy-frontend:latest \
		../../js/therapy-v3
	@echo "Images built."

ship-images:
	@if [ -z "$(VPS)" ]; then echo "ERROR: set VPS=user@host"; exit 1; fi
	@echo "Shipping images to $(VPS)..."
	docker save therapy-backend:latest therapy-frontend:latest | gzip | \
		ssh -i $(SSH_KEY) $(VPS) 'gunzip | docker load'
	@echo "Images loaded on $(VPS)."

deploy-prod: build-images ship-images
	@if [ -z "$(VPS)" ]; then echo "ERROR: set VPS=user@host"; exit 1; fi
	@echo "Copying compose files to $(VPS)..."
	scp -i $(SSH_KEY) \
		docker-compose.prod.yml Caddyfile .env.prod \
		$(VPS):~/therapy/
	@echo "Starting services on $(VPS)..."
	ssh -i $(SSH_KEY) $(VPS) \
		'cd ~/therapy && docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --remove-orphans'
	@echo "Running migrations..."
	ssh -i $(SSH_KEY) $(VPS) \
		'cd ~/therapy && docker compose -f docker-compose.prod.yml --env-file .env.prod exec -T backend alembic upgrade head'
	@echo ""
	@echo "=========================================="
	@echo "  Therapy deployed to $(VPS)!"
	@echo "  Check: http://$(shell echo $(VPS) | cut -d@ -f2)"
	@echo "  First deploy? Run: make seed-admin-prod VPS=$(VPS)"
	@echo "=========================================="

seed-admin-prod:
	@if [ -z "$(VPS)" ]; then echo "ERROR: set VPS=user@host"; exit 1; fi
	@set -a; . ./.env.prod; set +a; \
		ssh -i $(SSH_KEY) $(VPS) \
		"cd ~/therapy && ADMIN_EMAIL=$$ADMIN_EMAIL ADMIN_PASSWORD=$$ADMIN_PASSWORD ADMIN_NAME='$$ADMIN_NAME' \
		docker compose -f docker-compose.prod.yml --env-file .env.prod exec -T \
		-e ADMIN_EMAIL -e ADMIN_PASSWORD -e ADMIN_NAME \
		backend python scripts/seed_admin.py"