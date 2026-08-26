# The Factory

This is Elliot's autonomous software factory: a scheduled heartbeat (every 3 hours) builds and improves a portfolio of small local **apps and games** through a multi-agent workflow, then applies one improvement to the factory itself. **`FACTORY.md` is the constitution** — read it before changing anything here. It defines the heartbeat procedure, quality bar, evolution rules, and hard constraints.

## Orientation

- `FACTORY.md` — the constitution; binding on every agent working here
- `portfolio/` — one folder per prototype, each its own git repo and agent-native (own `CLAUDE.md` + `.claude/skills/` + `research/` design dossiers); `INDEX.md` is the catalog, `dashboard.html` the static visual catalog
- `hub/` — the Factory Hub: `hub/run.sh` then open http://127.0.0.1:7777 — play the games in-browser, run app demos, open reports. The front door for humans.
- `wiki/` — the factory's compounding knowledge base (Karpathy LLM-wiki pattern); `WIKI.md` is the schema, `index.md` the catalog. Ingested every heartbeat; read by ideation and design research.
- `templates/` — prototype scaffolds builders copy in new mode (start lessons-compliant)
- `reports/` — one detailed HTML report per heartbeat (`assets/<slug>/` holds playtest screenshots); start at `reports/index.html`
- `state/` — `ledger.md` (append-only run log), `status.json` (machine-readable catalog: statuses, demo/entry commands — the hub's data source), `ideas.md` (idea backlog with validation results), `evolution.md` (self-improvement log), `heartbeat.lock` (transient concurrency guard)
- `rules/lessons.md` — coroner-compiled lessons: obey the checklist; consult the appendix when a rule fires
- `directives/inbox.md` — Elliot's steering channel (the `factory-directive` skill writes here)
- `workflows/heartbeat.js` — the heartbeat Workflow script; run it, don't re-implement it

## Rules for any session working in this tree

- Factory meta-files are version-controlled in the factory repo at this root; commit changes with clear messages. Prototypes commit to their own repos (they're gitignored here).
- `state/ledger.md`, `portfolio/INDEX.md`, `portfolio/dashboard.html`, and `reports/` are maintained by heartbeats. Hand-edit only to fix an error, and note the repair in the ledger.
- To change factory behavior, prefer filing a directive in `directives/inbox.md` over hand-editing policy — directives are how changes stay visible in the factory's own history. The Hard constraints section of `FACTORY.md` changes only on Elliot's explicit say-so.
- Everything here is local-only: never deploy, publish, post, or sign up for services from this tree. Never run `claude -p`.
- New prototypes alternate between apps and games (Type column in `portfolio/INDEX.md`); every prototype must stay runnable via the one command in its README.
