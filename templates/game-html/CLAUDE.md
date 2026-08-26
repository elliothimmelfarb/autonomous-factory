# __NAME__

<!-- Agent orientation map. Keep current as the code evolves (lessons r.12). -->

## What it is

__ONE_PARAGRAPH__: the game, why it's fun, and the offline pitch (single HTML file, opens from disk at `file://`, no server, no network, no ads).

## How to run (cold start)

```
./run.sh             # opens the game in the default browser
./run.sh --print     # prints the absolute path + file:// URL
```

Dev loop over http (needed for browser automation — Playwright blocks `file://`):

```
python3 -m http.server 8191 --bind 127.0.0.1   # from this folder, then open http://127.0.0.1:8191/__NAME__.html
```

## How to test

```
./run_tests.sh       # = node test_core.js (dependency-free)
```

The suite includes the static invariants from `test_static_invariants.js`: the offline-from-disk scan (lessons r.14), the dead-code scan (r.21), and the charset scan (a file that ships non-ASCII text must declare `<meta charset="utf-8">` near the top, or a browser opening it from `file://` can render UTF-8 as Latin-1 mojibake). All have non-vacuous self-checks.

## Where the core logic lives

- `core.js` — ALL rules, pure and DOM-free (validation, state reducer, scoring, seeded RNG). Every entry point boundary-validates (lessons r.4; `Number.isInteger` gates on any event-derived index, r.25).
- `__NAME__.html` — the thin shell only: render, input handlers (in-flight freeze on deferred renders, r.13), inline data: favicon. The pack/data may be mirrored inline; a test asserts it matches the source file.

## Design dossiers

`research/` holds the design dossiers this prototype's builds consumed.
