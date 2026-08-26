# Setup

## `$FACTORY_ROOT`

Every path in this repo that used to be an absolute machine path is written as `$FACTORY_ROOT` — the absolute path of this checkout.

```
export FACTORY_ROOT="$(pwd)"   # from the repo root
```

Where it appears: `FACTORY.md` (workflow `scriptPath` and `factoryRoot` arg, Hard constraints), `skills/*/SKILL.md`, some `reports/*.html` run instructions. Everything else uses paths relative to the repo root (`state/ledger.md`, `wiki/index.md`, …).

Anything under `~/.claude/` is left literal — that is Claude Code's own config location, not machine-specific.

## Skills

`skills/factory-heartbeat/` and `skills/factory-directive/` live in `~/.claude/skills/` when installed. Copy or symlink:

```
ln -s "$FACTORY_ROOT/skills/factory-heartbeat" ~/.claude/skills/factory-heartbeat
ln -s "$FACTORY_ROOT/skills/factory-directive" ~/.claude/skills/factory-directive
```

## Not in this repo

`portfolio/` (each prototype is its own git repo), `state/ideas.md`, `state/heartbeat.lock`. The heartbeat creates `portfolio/` and the lock on first run.
