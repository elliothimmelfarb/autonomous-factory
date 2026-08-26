---
title: groupline (prototype)
type: prototype
updated: 2026-07-05
sources: [portfolio/groupline/, state/ledger.md]
---

# groupline — offline word-grouping puzzle

**Game, polish.** Single-HTML-file, fully-offline Connections-style puzzle: sort 16 words into 4 hidden themed groups, four mistakes allowed. 15 hand-curated puzzles, puzzle-picker board, shuffle, spoiler-free emoji share grid, inline data:-URI favicon. Pure DOM-free `core.js`, 539 tests; feel confirmed by a real-browser Playwright playtest (2026-07-05).

**Domain knowledge embodied:**

- **Overlap-bait is what makes grouping puzzles fun** — words that plausibly read into another group. Groupline models it as first-class curator-declared data with a test-enforced minimum per puzzle: puzzle *quality* made checkable. The strongest instance of [curated content as product](curated-content-as-product.md) in the portfolio.
- **The no-lockout promise needs UI, not just capability**: unlimited play only *felt* real once the picker board (per-puzzle session status + next-unplayed) existed — capability without a surface reads as absent. Demand context: [daily-puzzle rituals](daily-puzzle-rituals.md).
- **Share grids are cheap and load-bearing** — the social half of the ritual survives fully offline (clipboard with `file://` textarea fallback).

**Connections:** [ad-ruined casual games](ad-ruined-casual-games.md) (the gap it fills), [pure core, thin shell](pure-core-thin-shell.md) (architecture).

**Open direction:** mistakes indicator, difficulty filtering, daily-seed selector.
