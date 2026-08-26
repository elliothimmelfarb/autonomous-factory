---
title: Daily-puzzle rituals
type: concept
updated: 2026-07-06
sources: [state/ideas.md (game rounds), state/ledger.md (groupline entries)]
---

# Daily-puzzle rituals

The daily-puzzle habit economy that NYT (Wordle, Connections, Mini) and LinkedIn (Queens, Tango, Zip) built runs on **artificial scarcity**: one puzzle per day, replay locked, archive paywalled. The scarcity manufactures ritual and virality but generates a persistent, documented demand for **unlimited, offline, archive-open variants** — the single most repeated complaint across the factory's game research.

Key structure:

- **Scarcity is the product decision, not a technical one** — which is why "unlimited + offline" is a real gap a local version fills instantly. [groupline](prototype-groupline.md)'s pitch ("play back-to-back, no lockout") is exactly this, and its puzzle-picker board is the feature that delivered it.
- **Share-grid culture** — the spoiler-free emoji result grid is the viral loop and half the ritual's social value. It costs nothing to generate locally (groupline ships one, clipboard + `file://` fallback), so a local variant loses none of the social layer.
- **The archive is the moat the incumbents refuse to open** — an unlimited generator or a deep hand-curated bank (see [curated content as product](curated-content-as-product.md)) substitutes for it.
- LinkedIn's logic puzzles (Queens/Tango/Zip) are the current hot demand center; their one-a-day lockout complaints seeded three backlog ideas (Regicide, Tangoquilt, Ziptrace), all blocked on unique-solution generators — see [solver-verified generation](solver-verified-puzzle-generation.md).
- **Par-vs-used is the daily hook for minimum-move puzzles, but showing par *before* the solve spoils it.** The Unflip HN thread (the nearest relative of [foldup](prototype-foldup.md)) surfaced this: a visible par is motivating as *a number to beat*, but as a pre-solve hint it makes levels too easy — players asked to **hide par until the level is solved once**. Daily Unfold (a Wordle-like *daily fold* puzzle with a deterministic seed) already proves the daily format works for a fold puzzle. foldup ships par-visible for v0 (its brief), with hide-par-until-first-solve and a daily-seed selector noted as v1 daily-ritual polish. The seeded-determinism that enables "share this exact puzzle" is the [pure-core](pure-core-thin-shell.md) property that makes all of this free.

Related: [ad-ruined casual games](ad-ruined-casual-games.md) (the monetization half of the same complaint space).
