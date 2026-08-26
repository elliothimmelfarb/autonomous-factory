---
title: Reversible-action-stack UX (inspect before you reverse)
type: concept
updated: 2026-07-06
sources: [portfolio/tidy/research/2026-07-06T0806-dossier.md, https://git-scm.com/docs/git-stash, https://uxmovement.com/content/absolute-vs-relative-timestamps-when-to-use-which/]
---

# Reversible-action-stack UX: inspect before you reverse

When a tool records a stack of reversible actions (an undo history, a snapshot
series, a stash), a bare "reverse" verb quietly pops the top of that stack — and
the user's real anxiety is *not knowing what the top is* before they pull the
trigger. The genre answer is a **read-only listing of the stack** that lets them
look before they leap. This page collects the conventions that separate a good
such listing from a mediocre one. First realized by [tidy](prototype-tidy.md)'s
`--undo --list`.

## The `git stash list` mental model (the reference implementation)

`git stash list` is the canonical "show me the reversible stack." Two
genre-defining conventions, both worth copying:

- **Most-recent-first.** `stash@{0}` (the top row) is the newest entry and is
  *exactly* what a bare `git stash pop`/`apply` acts on. Index climbs as you go
  back in history.
- **The ordering itself encodes "next."** There is no separate "which one is
  next" annotation — top = next to pop. `git stash list` is `--undo --list`; a
  bare `git stash pop` is `--undo --apply`. Matching this mapping is what makes a
  listing feel *inevitable* rather than invented.

**Be friendlier than git where the audience is broader.** git's 0-based index and
implicit "top = next" are fine for developers; for a general-tool audience,
[tidy](prototype-tidy.md) uses **1-based ordinals** (ordinal 1 = newest = next)
plus an **explicit marker** (`<- next to undo`) on top of the ordering. The
explicit marker is strictly more legible and costs nothing.

## The load-bearing invariants

- **The marked "next" row must be provably the same entry the reverse verb
  consumes.** Derive the listing order and the reverse target from the *same*
  chronological source (never a lexical filename sort — see [tidy](prototype-tidy.md)'s
  `manifest_sort_key`), so "next to undo" cannot drift from what `--undo --apply`
  actually reverses. Pin it with a test.
- **The marker follows *position in the stack*, not readability.** If the newest
  entry is corrupt, it is *still* ordinal 1 / next (a subsequent reverse would try
  it and fail cleanly) — do not silently promote an older readable entry to "next,"
  which would lie about what the reverse verb does.
- **A recognition signal per row.** git uses the stash *message*; a tool with no
  message must synthesize one from what it has. tidy uses the **moved-file count +
  `--by-month` flag** ("oh, that's the big 214-file by-month cleanup"). Pick the
  per-row facts that let a user recognize *their own* action.
- **Read-only is inviolable, and wins over an also-present mutate flag.** The
  listing must never mutate; if a reverse/apply flag is also present, listing wins
  and nothing is reversed (lower astonishment than silently upgrading a read into
  a write). Dispatch the read-only path *before* any config/state load so a
  corrupt config can never block a pure inspection.
- **Degrade per-entry, not all-or-nothing.** The listing reads *every* recorded
  entry, so one corrupt/hand-edited one must become an inline `(unreadable:
  <reason>)` note and the rest still render — a different posture from the reverse
  verb, which loads only the one entry it's about to act on and can bail. (This is
  [persisted-state-is-hostile](prototype-tidy.md) applied across a *collection*.)

## Timestamp display: absolute for reference, not relative

Choosing *which past action to reverse* is a **reference/reconstruction task**,
not a feed-scanning task — and UX research (UX Movement, "Absolute vs. Relative
Timestamps") says reference/archival content should use **absolute timestamps with
full dates**, while relative "2 hours ago" is for immediacy on frequently-updated
feeds. So the absolute timestamp is the primary, non-optional column; a relative
hint is at most a courtesy addition, never a replacement.

Two corollaries that recur:

- **Keep the recorded zone; label it.** If the record stores UTC, print UTC
  (`20260706T071011Z` → `2026-07-06 07:10:11 UTC`) — converting to the reader's
  local zone would make the printed value differ from the stored identity and from
  what another machine shows, defeating "reference the exact run." Reformat for
  legibility (a wall of digits → a readable date) but do not re-zone.
- **Relative time fights deterministic output.** A relative string depends on
  `now`, which is non-deterministic — it fights a [frozen-output test](pure-core-thin-shell.md).
  If you add one, compute it against an injectable `now`. Default to
  absolute-only. This same absolute-for-reference rule applies to any tool that
  prints a timeline of past events — e.g. [sediment](prototype-sediment.md)'s
  era/event timestamps are reconstruction anchors, not a live feed.

**Connections:** first shipped in [tidy](prototype-tidy.md) (`--undo --list`). The
listing is a [pure core / thin shell](pure-core-thin-shell.md) split (pure
row-builder + thin disk-reading renderer). It is itself an instance of the
[dev-mechanic transplant](dev-mechanic-transplant.md) angle — `git stash list` is
a beloved dev mechanic, and the `git bisect`/`git blame` transplants
([whenbroke, cellblame](dev-mechanic-transplant.md)) that operate over a snapshot
series would each want exactly this "inspect the stack before you act" listing.
The read-only-before-mutate default is the same trust-feature-as-product instinct
as [local-first privacy](local-first-privacy.md).
