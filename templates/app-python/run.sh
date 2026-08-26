#!/usr/bin/env bash
# Cold-start run wrapper — cwd-independent (lessons r.1/r.3).
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec python3 "$DIR/__MODULE__.py" "$@"
