# Prototype scaffolds

Builders: when scaffolding a NEW prototype, copy the matching template into `portfolio/<name>/`, replace every `__NAME__` / `__MODULE__` placeholder, rename the skill folder to `<name>-dev`, then `git init` and build. The templates encode the lessons rules every prototype has re-derived (cwd-independent wrappers r.1/r.3, docs-vs-code guard r.12, offline scan r.14, dead-code scan r.21, clean-error contract r.4/r.7) so you start compliant instead of getting caught by the coroner.

- `app-python/` — stdlib Python CLI: `run.sh`, `run_tests.sh`, `CLAUDE.md`, dev-loop skill, docs-consistency test.
- `game-html/` — single-file HTML game: `run.sh` (`--print`), `CLAUDE.md`, dev-loop skill, static-invariants test harness (offline + dead-code scans with non-vacuous self-checks).

Coroner: when a caught failure class is generic to a prototype KIND (not one prototype), harden the template here — that guards every future prototype at zero per-heartbeat cost.

These are starting points, not frameworks — adapt freely; delete what a given prototype doesn't need.
