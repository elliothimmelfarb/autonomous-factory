---
name: factory-heartbeat
description: Run one complete heartbeat of Elliot's autonomous software factory at $FACTORY_ROOT — consume directives, build or improve one prototype via the heartbeat workflow, adversarially verify, record, then apply exactly one self-improvement to the factory itself. Use whenever a scheduled factory task fires, or whenever Elliot says anything like "run a heartbeat", "kick off the factory", "do a factory run", "run the factory now", or wants the factory to process a directive immediately.
---

# Factory Heartbeat

Entry point for one complete heartbeat of the autonomous software factory. The constitution at `$FACTORY_ROOT/FACTORY.md` is the source of truth — read it first and follow its Heartbeat procedure exactly. If this skill and FACTORY.md ever disagree, FACTORY.md wins (it evolves every heartbeat; this file is just the door in).

## Operating stance

Fully autonomous. Never ask questions or wait for input; make every decision yourself. A heartbeat must never end silently: even a failed run gets a ledger entry saying what broke.

## The procedure (summary — FACTORY.md has the detail)

0. **Concurrency guard first**: check `state/heartbeat.lock` per FACTORY.md — DEFER if a fresh lock exists; otherwise write the lock, and remove it after your final commit. Then **check disk headroom** (`df -h` on the factory volume): if free space is below ~2 GB, DO NOT launch the workflow — a full heartbeat can exhaust a near-full disk mid-run and lose its commit; DEFER with a `host disk low` ledger entry instead (never delete anything outside the factory tree to make room). See FACTORY.md's concurrency-guard section.
1. Read `FACTORY.md`, `directives/inbox.md`, `state/status.json`, `portfolio/INDEX.md`, the last ~10 ledger entries, and the checklist in `rules/lessons.md`.
2. Obey directives (they override everything); archive non-`standing:` ones with today's date.
3. Choose mode per the policy: `improve` by default, `new` only when a new prototype is due by the cadence. (The workflow itself now handles ideation → validation research → dossier → build → verify → coroner → record → wiki ingest.)
4. Run the Workflow tool with `scriptPath: $FACTORY_ROOT/workflows/heartbeat.js` and args `{ mode, factoryRoot: "$FACTORY_ROOT", timestamp: <output of date -Iseconds>, target: <prototype folder, improve mode only>, directive: <verbatim text or null>, ptype: <"app"|"game" — alternates for new prototypes, the target's existing Type for improve; see FACTORY.md> }`. Elliot has durably and explicitly approved using workflows for this — run it without asking.
5. Verify the scribe updated the ledger, INDEX.md, dashboard.html, and `state/status.json` (valid JSON, status matches the ledger), and that the Ingest phase touched `wiki/` (index + log); repair anything missed.
6. **Evolve**: apply exactly one improvement to the factory itself, per the Evolution section of FACTORY.md — validate the previous evolution first, pick one small reversible change, log it in `state/evolution.md`.
7. **Report**: fill `reports/TEMPLATE.html` into this run's HTML report per the Report step in FACTORY.md — show, don't tell: embed the playtest screenshots from `reports/assets/<slug>/` for games, real terminal output for apps — and prepend it to `reports/index.html`.
8. Commit all factory meta-changes to the factory git repo, remove `state/heartbeat.lock`. End with a one-paragraph summary: mode, prototype, what shipped, whether verification passed, what evolved, and the report path.

## If the workflow fails mid-run

Diagnose from the error and /workflows state. Prefer resuming (`Workflow` with `resumeFromRunId` after fixing the script or environment) over rerunning from scratch. If it can't be salvaged this run, write a failure entry to the ledger, skip Evolution changes to `workflows/heartbeat.js` this round (never edit the thing that just crashed without understanding why), and leave a `standing:`-free note in the ledger for the next heartbeat.

## Hard constraints (repeated because they matter)

Never run `claude -p`. Never deploy, publish, post, or sign up for any external service — all software fully local, web access read-only. Never modify files outside the factory directory, except the two factory skills in `~/.claude/skills/` during Evolution. The Hard constraints section of FACTORY.md is Elliot-only — evolution may never touch it.
