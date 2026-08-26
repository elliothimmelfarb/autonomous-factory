---
title: chainfall (prototype)
type: prototype
updated: 2026-07-05
sources: [portfolio/chainfall/, portfolio/chainfall/research/2026-07-05T2206-dossier.md, state/ledger.md]
---

# chainfall — Drop7 cascade revival

**Game, v1.** Single-HTML-file, fully-offline revival of Drop7: drop numbered discs into a 7×7 grid; a disc clears when its number equals the occupancy of its full row or column; clears cascade with the exact escalating chain-score sequence `[7, 39, 109, 224, 391, 617, …]`; grey blanks crack→reveal after two adjacent clears; a rising floor forces the pace. Pure `core.js`, **225 tests**. Graduated v0→v1 on 2026-07-05 with the **visible, stepped cascade** (see below), an on-canvas HUD, a game-over/restart overlay, and the feel confirmed in a real browser.

**Domain knowledge embodied:**

- **The blanks and rising floor are load-bearing for the fun**, not decorations — the research round found the volatility layer is what separates Drop7 from a math exercise (the folded `dropseven-blanks-off` idea recorded this explicitly).
- **The known chain-score sequence doubles as a test oracle** — reviving a game with a documented scoring table means correctness is externally checkable, a hidden benefit of revival ideas. The v1 dossier re-confirmed the published table (`[7, 39, 109, 224, 391, 617, 907, 1267, …]`) beats the cubic closed-form past step 6, so it's a guard-rail against "correcting" the constants, not a formula to derive.
- **The cascade is the soul, and it has to be *watched*.** The v0→v1 slice made the chain a visible stepped animation (clear-flash → collapse → next step, per-step score tick + "Chain ×N" readout) — the worked example behind [game feel & juice](game-feel-juice.md). A board that teleports to its resolved state throws away the most satisfying second of the game.
- A scripted seeded 40-drop playthrough (score 1867, real cascades) demonstrated the fun is *measurable from the core alone* — the strongest evidence yet for [pure core, thin shell](pure-core-thin-shell.md). The same separable core is what let `resolveBoard` expose additive per-step frames the animation plays back *and* unit-tests assert, so the feel is testable without a browser.

**Connections:** the gap it fills is [ad-ruined casual games](ad-ruined-casual-games.md) (Zynga-mangled classic); revival-as-discovery relates to the lost-masterpiece ideation angle; its v0→v1 graduation is the [game feel & juice](game-feel-juice.md) lever in action.

**Open direction (toward polish):** best-score memory (`localStorage`), an inline `data:` favicon, and a rising-floor danger warning.
