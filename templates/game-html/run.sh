#!/usr/bin/env bash
# Single offline HTML game — no server needed. cwd-independent (lessons r.1).
#   ./run.sh           opens the game in the default browser (file://)
#   ./run.sh --print   prints the absolute path and file:// URL (for automation)
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENTRY="$DIR/__NAME__.html"
if [[ "${1:-}" == "--print" ]]; then
  echo "$ENTRY"
  echo "file://$ENTRY"
  exit 0
fi
open "$ENTRY" 2>/dev/null || xdg-open "$ENTRY"
