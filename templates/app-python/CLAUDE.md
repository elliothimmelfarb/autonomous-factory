# __NAME__

<!-- Agent orientation map. Keep every section current as the code evolves (lessons r.12 — the docs-consistency test cross-checks the symbols you name here). -->

## What it is

__ONE_PARAGRAPH__: what problem it solves, for whom, and the trust properties (fully local, no accounts, dry-run by default, …).

## How to run (cold start)

```
./run.sh <args>          # cwd-independent; the only command a user needs
```

Exit-code contract: 0 on success; 2 on bad/empty/garbage input (one clean `error: …` line on stderr, never a traceback — lessons r.4/r.7).

## How to test

```
./run_tests.sh           # = python3 -m unittest discover
```

## Where the core logic lives

Single module `__MODULE__.py`, walked by responsibility:

- `parse_*` — untrusted-input boundary: full-shape validation, one clean-error path (lessons r.7)
- `__CORE_SEAMS__` — the pure logic (IO-free; every invariant enforced at the domain constructor, lessons r.10)
- `run` / `main` — the only IO layer

## Design dossiers

`research/` holds the design dossiers this prototype's builds consumed (one per heartbeat that touched it).
