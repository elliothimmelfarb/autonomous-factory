---
title: tidy (prototype)
type: prototype
updated: 2026-07-06
sources: [portfolio/tidy/, state/ledger.md]
---

# tidy — safe reversible file organizer

**App, v1.** Stdlib-only Python CLI that sorts loose files (Downloads/Desktop) into category subfolders. Dry-run by default, never overwrites, every `--apply` reversible via a JSON move manifest + `--undo`; `--undo --list` is a read-only view of the undo stack (recorded applies newest-first, next-to-undo marked); optional user config for custom extension→category rules; `--json` plan output for piping.

**Domain knowledge embodied:**

- The messy-Downloads problem is high-frequency but low-stakes — users' real fear is *irreversibility*, so the trust features (dry-run default, undo, never-overwrite) ARE the product, not extras.
- Persisted state read back from disk (manifests, configs) behaves as hostile input in practice: hand-edits, NUL bytes, path traversal, and lexical-vs-chronological filename sorting all actually occurred and shaped the design.
- Composability demand: `--json` was repeatedly the requested next step across heartbeats — CLI users think in pipes.
- **Inspect-before-reverse ergonomics (`--undo --list`).** `git stash list` is the reference implementation of "show me the reversible stack" — its genre-defining convention is *most-recent-first with the top row being exactly what a bare pop consumes*, so the ordering itself encodes "next." tidy adopts newest-first ordering (a reverse of the chronological `manifest_sort_key` order, never a lexical filename sort) but is strictly friendlier than git: 1-based ordinals for a non-git audience plus an *explicit* `<- next to undo` marker, and the marked row is provably the same manifest a plain `--undo --apply` reverses. The load-bearing per-row fact is an **absolute UTC timestamp** reformatted for legibility (`20260706T071011Z` → `2026-07-06 07:10:11 UTC`, kept UTC and labelled so it matches the `Z`-stamped filename): deciding *which past apply to reverse* is a reference/reconstruction task, and UX research says reference content uses absolute timestamps, not relative "2 hours ago" (which would also fight the frozen-output test). The moved-file count + `--by-month` flag are the *recognition* signal (git uses the stash message; tidy has none) — "oh, that's the big by-month cleanup I did." Because the manifest's `timestamp` field isn't among those the manifest validator enforces, the reformatter must be defensive (rule 7): a missing/garbage value falls back rather than raising.

**Connections:** trust-features-as-product parallels [local-first privacy](local-first-privacy.md); the config/category system is a small instance of [curated content as product](curated-content-as-product.md) (user-curated, here). Architecture: [pure core, thin shell](pure-core-thin-shell.md). The `--undo --list` design is the shipped instance of [reversible-action-stack UX](reversible-action-stack-ux.md) (the git-stash-list precedent, the absolute-timestamp-for-reference rule, and the per-entry corrupt-degradation posture all live there now as reusable domain knowledge). tidy is [sediment](prototype-sediment.md)'s **foil**: both point at the same messy folder, but tidy treats it as a *set to reorganize* (space) while sediment reads it as a *record to replay* (time) — the axis-flip is exactly what makes sediment feel non-obvious. (tidy's shipped `EXTENSION_MAP` is also the seed sediment's finer-grained `EXTENSION_CATEGORY` extends.)

**Open direction:** `--undo --list --json` (machine-readable undo history for piping); config-driven category ordering; an interactive per-category confirm before applying.
