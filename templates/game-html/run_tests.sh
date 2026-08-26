#!/usr/bin/env bash
# Node test runner — cwd-independent (lessons r.1). No dependencies.
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec node "$DIR/test_core.js"
