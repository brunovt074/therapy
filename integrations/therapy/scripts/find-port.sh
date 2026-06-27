#!/usr/bin/env bash
# Find first available TCP port starting from START_PORT.
# Usage: ./find-port.sh [START_PORT]
# Output: port number (to stdout)

set -euo pipefail

START_PORT="${1:-3000}"
MAX_PORT=65535

for ((port = START_PORT; port <= MAX_PORT; port++)); do
    if ! ss -tln | awk '{print $4}' | grep -qx "0.0.0.0:${port}"; then
        if ! ss -tln | awk '{print $4}' | grep -qx "\[::\]:${port}"; then
            if ! ss -tln | awk '{print $4}' | grep -qx "\*:${port}"; then
                echo "$port"
                exit 0
            fi
        fi
    fi
done

echo "ERROR: no available port found in range $START_PORT-$MAX_PORT" >&2
exit 1
