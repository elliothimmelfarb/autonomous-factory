---
title: Solver-verified puzzle generation
type: concept
updated: 2026-07-06
sources: [state/ideas.md (game rounds — zebra, nonogram, Tangoquilt, Regicide, Ziptrace, floodgate, FreeCell, no-guess-minesweeper entries), portfolio/foldup/research/2026-07-06T1407-dossier.md]
---

# Solver-verified puzzle generation

A recurring frontier across the game backlog: **generators that PROVE a property of every puzzle they emit** — unique solution, no-guess solvability, winnability, a solvable-in-N move budget. The honest guarantee is the differentiator, because incumbent puzzle sites can't or won't make it: players of Minesweeper resent forced guesses, logic-puzzle fans distrust multi-solution boards, solitaire players resent unwinnable deals.

Backlog ideas blocked on (or elevated by) exactly this machinery:

- *Zebra* (Einstein logic grids) — constraint-propagation solver proving uniqueness + clue-dropping generator; interesting=5, explicitly "best next game pick once we want a harder core."
- *Gridlock/nonogram* — line-solver + uniqueness-checking generator, "puzzles always fair."
- *Tangoquilt* and *Regicide* (LinkedIn Tango/Queens clones) — both docked on the unique-solution generator being the hard part; they share the uniqueness machinery.
- *floodgate* — BFS reference solver guaranteeing the printed move budget is honest.
- *FreeCell* — winnable-by-design seeded deals (~99.999%), provably fair vs Klondike.
- *no-guess minesweeper* — REJECTED as a plain clone, "only the no-guess solver earns it a place."

**Strategic observation (2026-07-05):** the solver+generator core is a *shared, reusable capability* — building it once for any one of these unblocks several others, and the [pure-core-thin-shell](pure-core-thin-shell.md) architecture makes it fully unit-testable. It is also a credible **jaw-dropping vein**: "every puzzle provably fair — here's the proof" is a claim players didn't know they could ask for, but instantly understand ([the OMG shape](curated-content-as-product.md) inverted: instead of curated content, *certified* content). Feeds the demand documented in [daily-puzzle rituals](daily-puzzle-rituals.md).

**First shipped instance — [foldup](prototype-foldup.md)'s BFS par oracle (2026-07-06).** foldup certifies not *uniqueness* but a **minimum-move budget (par)**: `solveMinFolds(start, target)` does BFS-by-fold-depth over the fold-space and returns the true minimum, which the test suite asserts equals every shipped level's tagged par. Two lessons this instance banks:
- **The certification earns its keep by catching authoring drift, not just stamping a badge.** BFS rejected two hand-authored foldup levels — one target unreachable by the intended fold, one whose true par was 4 not 2. A hand-guessed par silently drifts from the content; the solver test makes it impossible.
- **Constraining the move set is what makes an otherwise-hard proof tractable.** General map-folding is #P-complete/open ([arXiv 2410.07666](https://arxiv.org/pdf/2410.07666)), but foldup constrains folds to single grid-line creases and the board *strictly shrinks* each fold (the target size lower-bounds it), so the reachable tree is shallow and narrow and BFS terminates in <1s. The same shape recurs across the [novel-puzzle-verbs](novel-puzzle-verbs.md) certified-content cluster (Proofgrid ships only *fully line-solvable* nonograms because the general problem is NP-complete; Deadlock-Free proves per-step liveness within a bounded depth). **Pick the constrained variant whose proof fits one heartbeat.**

**A new sub-form — reject the vacuous instance.** foldup adds a wrinkle: some *targets* trivialize the verb regardless of the solver. Folding to a 1×1 target is a pure parity coin-flip (order-independent, one bit), so foldup's validator rejects a 1×1 target outright — the puzzle is only certifiably *interesting* when the target has structure. Certification is therefore two-sided: prove the par is honest AND prove the instance isn't degenerate. See [foldup](prototype-foldup.md).
