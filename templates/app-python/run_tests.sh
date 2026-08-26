#!/usr/bin/env bash
# Test runner — cwd-independent (lessons r.1).
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"
exec python3 -m unittest discover -v
