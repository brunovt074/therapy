# Database Strategy

## Current — Phase 1 (Docker Postgres primary)

- **Primary DB**: Postgres 16-alpine in Docker on the Hostinger VPS
- **Volume**: `postgres_data` (Docker-managed named volume — survives container restarts)
- **Auth**: Custom JWT (no Supabase Auth dependency)
- **Schema**: Managed via Alembic migrations
- **Backup**: Local daily `pg_dump` via `scripts/backup.sh` (see below)

### Operations

```bash
# Run migrations
make migrate            # uses ENV_FILE=.env.local by default
make migrate-local      # explicit local

# Manual backup (production)
ENV_FILE=.env.prod make backup

# Local backup
make backup-local

# Restore from backup
ENV_FILE=.env.prod make restore BACKUP=backups/therapy_YYYY-MM-DD_HHMMSS.sql.gz
```

### Backup retention

`scripts/backup.sh` keeps the last 7 daily backups and deletes older ones automatically.
Store backups offsite (S3, Backblaze, rsync to another server) for disaster recovery.

---

## Future — Phase 2 (Supabase offsite backup)

Once Phase 1 is stable in production, add Supabase as a hot-standby/backup:

1. Create matching schema in Supabase: `alembic upgrade head` against Supabase `DATABASE_URL`
2. Add cron job: nightly `pg_dump` from Docker Postgres → `pg_restore` to Supabase
3. In an emergency: swap `DATABASE_URL` to the Supabase URL — the app continues working

### Why migration to Supabase is near-zero-effort when needed

- ORM (SQLAlchemy 2.0 async) is database-agnostic — no Postgres-specific features used
- No triggers, RLS policies, plpgsql functions, or extensions in the schema
- `connection.py` already configures `statement_cache_size=0` for PgBouncer (Supabase pooler)
- Custom JWT auth is fully decoupled from any identity provider
- Frontend only talks to the backend REST API — no direct DB access

**Migration cost: swap one env var + run one migration command.**

---

## Decision log

| Date | Decision | Reason |
|------|----------|--------|
| 2026-05-17 | Phase 1: Docker Postgres | Data sovereignty, simpler ops, lower cost for current scale |
| 2026-05-17 | Phase 2: Supabase backup (future) | Offsite redundancy, managed backups, near-zero code change |
