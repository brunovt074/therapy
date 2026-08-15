# therapy-mcp

MCP server exposing `therapy-api` as tools for the WhatsApp receptionist agent (opencode).
Availability and appointment data live in the same Postgres database `therapy-api` already
uses — no external calendar or spreadsheet integration.

## Setup

```
cp .env.example .env   # fill in THERAPY_API_URL and the bot-mcp credentials
pip install -e ".[dev]"
```

The service account (`bot-mcp@therapy.local` locally) needs `role=admin` in therapy-api —
see `integrations/therapy/scripts/seed_admin.py`.

## Run standalone

```
therapy-mcp
```

## Register in opencode

Add to `~/.config/opencode/opencode.jsonc` under `mcp`:

```jsonc
"therapy": {
  "command": ["/path/to/.venv/bin/therapy-mcp"],
  "enabled": true,
  "type": "local"
}
```
