#!/usr/bin/env bash
# Creates the bot_gateway database inside the evolution_postgres container on
# first boot. Runs automatically because docker-compose.bot.yml mounts this
# file into /docker-entrypoint-initdb.d/ — the official postgres image only
# creates POSTGRES_DB by default, so a second database needs an init script.
set -euo pipefail

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE DATABASE bot_gateway OWNER $POSTGRES_USER;
EOSQL
