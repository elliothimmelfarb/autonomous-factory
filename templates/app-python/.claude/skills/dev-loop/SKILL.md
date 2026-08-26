---
name: dev-loop
description: Dev loop for portfolio/__NAME__ — run, test, and debug the __NAME__ CLI. (Builder: rename this folder AND this name to "__NAME__-dev" at scaffold time; name must match the folder.)
---

# __NAME__ dev loop

## Run

```
./run.sh <args>                    # cwd-independent cold start
```

## Test

```
./run_tests.sh                     # full suite
python3 -m unittest tests.test___MODULE__.SomeClass -v   # one class
```

Throwaway fixture (lessons r.5 — always a fresh per-run temp dir, never a shared scratch path):

```
T="$(mktemp -d)" && <populate> && ./run.sh "$T"
```

## Debug — where to look when X is wrong

- Bad input not rejected cleanly → the `parse_*` boundary in `__MODULE__.py`
- Wrong core result → `__CORE_SEAMS__`
- Output/format issue → the render/CLI layer (`run`/`main`)
