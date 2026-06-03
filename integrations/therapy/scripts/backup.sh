#!/usr/bin/env bash
# Therapy DB backup script
# Usage: ENV_FILE=.env.prod ./scripts/backup.sh
# Output: ./backups/therapy_YYYY-MM-DD_HHMMSS.sql.gz

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INTEGRATIONS_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${INTEGRATIONS_DIR}/backups"
ENV_FILE="${ENV_FILE:-${INTEGRATIONS_DIR}/.env.prod}"

if [[ ! -f "$ENV_FILE" ]]; then
    echo "ERROR: env file not found: $ENV_FILE" >&2
    exit 1
fi

# shellcheck disable=SC1090
set -a
source "$ENV_FILE"
set +a

mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +%Y-%m-%d_%H%M%S)
OUTFILE="${BACKUP_DIR}/therapy_${TIMESTAMP}.sql.gz"

docker compose --env-file "$ENV_FILE" exec -T postgres \
    pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner --no-acl \
    | gzip > "$OUTFILE"

echo "Backup written: $OUTFILE"
echo "Size: $(du -h "$OUTFILE" | cut -f1)"

# Retention: keep last 7 daily backups
find "$BACKUP_DIR" -name "therapy_*.sql.gz" -mtime +7 -delete

echo "Old backups (>7 days) cleaned."
