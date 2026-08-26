---
name: dev-loop
description: Dev loop for portfolio/__NAME__ — run, test, playtest, and debug the __NAME__ game. (Builder: rename this folder AND this name to "__NAME__-dev" at scaffold time; name must match the folder.)
---

# __NAME__ dev loop

## Run

```
./run.sh                 # opens the single offline HTML file
./run.sh --print         # path + file:// URL
```

## Test

```
./run_tests.sh           # full dependency-free Node suite
```

## Playtest in a real browser (feel work)

```
python3 -m http.server 8191 --bind 127.0.0.1 &   # from this folder
# drive http://127.0.0.1:8191/__NAME__.html with Playwright (isolated temp profile);
# dispatch clicks IN-PAGE — full-DOM re-renders detach held element handles.
```

## Debug — where to look when X is wrong

- Rules/scoring wrong → `core.js` (pure; write a failing unit test first)
- A control double-fires or no-ops → the in-flight freeze in the inline shell script (lessons r.13/r.20)
- Crash on a weird click/resize → event-derived index validation (lessons r.25)
- Offline claim broken → the static scans in `test_static_invariants.js`
