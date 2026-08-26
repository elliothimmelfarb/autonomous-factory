---
title: Game feel & juice — making a mechanic *read* over time
type: concept
updated: 2026-07-06
sources: [portfolio/chainfall/research/2026-07-05T2206-dossier.md, portfolio/chainfall/, portfolio/foldup/research/2026-07-06T1407-dossier.md, portfolio/foldup/, state/ledger.md]
---

# Game feel & juice — making a mechanic *read* over time

A correct rule set is not a fun game. The gap between the two is **juice**: the animation, timing, and feedback that let a player *watch* a mechanic unfold and *feel* the payoff. For the factory's small offline games this is where v0→v1 usually lives — the pure [core is thin-shell-separable](pure-core-thin-shell.md) and already correct; the graduation is making its output visible and snappy. chainfall's v1 slice is the worked example: a board that *teleported* to its resolved state (v0) threw away "the single most satisfying second of the game" — the [Drop7](prototype-chainfall.md) chain reaction — even though the scoring was already exact.

## The stepped-cascade skeleton (canonical, and praised)

The Drop7-clone canon converges on one skeleton for a chain: **clear-flash → collapse (gravity) → next step**, repeated per cascade step, with the score ratcheting each step. Implement exactly that; it is the shape players describe when they praise the feel. Key heuristics from the chainfall dossier:

- **The flash is a *pulse*, not a static highlight** — a brightness/scale ramp that peaks and falls reads as "these are clearing," where a constant highlight reads as "these are selected."
- **Surface the multiplier as it climbs.** Two complementary hooks: an escalating **chain-level** readout ("Chain ×N") and a floating **+points** per cluster. Seeing the number climb *during* the cascade is the reward; a single final score is not.
- **Tick the HUD score per step**, not in one jump to the final total — the per-step total is the drama.

## Timing is a dial, and the honest baseline is *slow*

Real Drop7 clones budget **~1.1 s per cascade step** (flash + fall). That is the cinematic-slow end — the baseline to *beat*, not copy. Tetris exposes the same dial as "line-clear delay," canonically **400–700 ms** for a slow cinematic feel, and snappy arcade play lives well below that. chainfall's rule: take the canonical *shape* but **compress the per-step budget ~4–6×** for a web feel, behind a single tunable `STEP_MS` constant so the pace is one edit away from re-calibration. Make the duration a named constant, never a magic number sprinkled across the render path.

## The right web primitive

Drive the animation with `requestAnimationFrame` for the intra-step ramp plus a per-step timer to advance steps — **not** a chain of bare `setTimeout`s. Two consequences the factory has now paid for:

- A deferred render opens a **double-input window**: the move commits synchronously but the board only *looks* resolved a few hundred ms later, so a second input mid-animation double-applies. Freeze the input surface for the animation (an in-flight flag + a *visible* disable) — this is [lessons rule 13](../rules/lessons.md), which chainfall's v0 did not need and its v1 does.
- **Automation cannot watch the animation.** Headless Chromium has no vsync, so `requestAnimationFrame` never fires, and Playwright throttles/pauses background timers between actions — so "wait then screenshot" cannot capture a multi-frame cascade. Verify the *feel* with a single representative captured frame plus unit tests over the pure per-step frames (`resolveBoard` exposing an additive `steps` list is what makes the animation unit-testable without a browser); do **not** burn hours trying to force deterministic frame-by-frame capture in headless. (chainfall's 2026-07-05 heartbeat lost ~2¾h to exactly that — recorded in the ledger.)

## Beyond the cascade — the fold as a single collapse beat ([foldup](prototype-foldup.md))

The stepped-cascade skeleton is for *multi-step* chains; foldup shows the same principle at the scale of **one gesture**. A fold's payoff IS the merge/collapse — the smaller flap sweeping over the crease and the overlapping cells canceling or lighting up — so teleporting straight to the pure `fold` result would throw away the wow exactly as chainfall's teleporting board did. The rule recurs: **the moment the mechanic resolves is the moment the animation must show.** foldup's build renders a FLIP (scale-X / rotate-Y sweep over ~200–350 ms), THEN settles to the pure result, behind the same single `STEP_MS`-style tunable so the pace is one edit away.

Two carry-over consequences the fold hits as hard as the cascade did:
- **Deferred-render double-input window (lessons rule 13).** The fold commits state synchronously but renders over hundreds of ms; a second gutter-click mid-sweep double-folds. foldup sets an `animating` in-flight flag, *visibly* freezes/greys the crease gutters, and re-entry-guards the click handler — pinned by the fake-DOM regression (queued timers, second click in the gap, exactly one fold applied). The double-input window is not cascade-specific; it opens for **any** deferred-render commit.
- **Automation still can't watch it, so the feel confirmation is a human playtest.** No vsync at `file://`/headless → `requestAnimationFrame` never fires; the fold's physicality (does the flap read as paper?) can only be judged by a person, which is why foldup ships **v0** pending that playtest. Same limit chainfall documented; foldup inherits the "one captured frame + unit-tested pure result, don't grind for frame capture" discipline.

## Why it matters for ideation

Juice is a *cheap, high-leverage* v0→v1 lever for revival games ([ad-ruined casual games](ad-ruined-casual-games.md)): the mechanic is already proven and the scoring already correct, so a small animation layer converts a "runs end-to-end" prototype into one that *feels* like the thing people remember. Favor mechanics whose payoff is a **visible unfolding event** (a cascade, a combo, a reveal) — they have the most juice headroom.

**Connections:** [pure-core-thin-shell](pure-core-thin-shell.md) (the separable core is what makes the frames unit-testable), [prototype-chainfall](prototype-chainfall.md) (the worked multi-step example), [prototype-foldup](prototype-foldup.md) (the single-gesture example — the fold's collapse beat), [ad-ruined-casual-games](ad-ruined-casual-games.md) (juice as the revival v0→v1 lever), [novel-puzzle-verbs](novel-puzzle-verbs.md) (Proofgrid's proof-replay needs juice headroom to land as payoff, not auto-solve).
