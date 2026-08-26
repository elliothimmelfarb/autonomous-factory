---
title: settleup (prototype)
type: prototype
updated: 2026-07-06
sources: [portfolio/settleup/, state/ledger.md, portfolio/settleup/research/2026-07-06T0206-dossier.md]
---

# settleup — exact-arithmetic expense splitter

**App, v1.** Stdlib-only, report-only Python CLI: reads a plain git-diffable JSON expense ledger, prints per-person net balances and a greedy near-minimal "X pays Y $N.NN" settle-up plan. Money is exact integer cents via Decimal; equal and weighted splits reconcile to the penny. An opt-in `--breakdown` / `-b` flag adds a per-person **itemization** — every expense each person owes a share of (tagged equal/weighted) and paid, closing to the same net balance the top table shows.

**Domain knowledge embodied:**

- **Exactness is the product**: split math that's off by a penny destroys trust instantly; deterministic remainder-penny allocation (shares sum EXACTLY to the amount) and a balances-sum-to-zero invariant are the two load-bearing guarantees.
- **The plain-text ledger is a feature**: git-diffable, hand-editable, no lock-in — the anti-Splitwise position isn't just "no account," it's "your data is a file you own." ([local-first privacy](local-first-privacy.md))
- **Auditability closes the trust gap**: the `--breakdown` view answers "why do I owe *this much*?" line by line, each block ending with a reconciliation line (`paid − owed = net`) that visually proves the itemization sums to the balance. This is exactly the transparency [Splitwise never shipped](declarative-ledger-vs-running-tab.md) — an itemized-balance feature open since 2013 that Splitwise calls "surprisingly tricky, since people often pay for things out of order." settleup has no order problem: the breakdown is a pure re-derivation from a complete declarative ledger. See [declarative ledger vs. running tab](declarative-ledger-vs-running-tab.md).
- **The breakdown was free architecture, not new domain**: it reuses `split_expense`/`compute_balances` unchanged, so `paid − owed == net` reconciles by construction, not by re-derived math — the payoff of [pure core, thin shell](pure-core-thin-shell.md). Two render heuristics matter: mirror the top table's *words* (`is owed`/`owes`) rather than raw signed numbers (the #1 confusion in split apps), and show *every* line a person is on — even $0.00/tiny shares — because completeness is what defuses "I don't remember agreeing to that" disputes.
- Debt minimization (greedy largest-creditor/largest-debtor) is near-minimal, not provably minimal — honestly documented; a provably-minimal mode is a known upgrade path (kin to the honest-guarantee pattern in [solver-verified generation](solver-verified-puzzle-generation.md)).

**Connections:** demand from the [subscription-economy backlash](subscription-economy-backlash.md) (Splitwise squeeze); architecture [pure core, thin shell](pure-core-thin-shell.md); the breakdown's differentiator is [declarative ledger vs. running tab](declarative-ledger-vs-running-tab.md).

**Open direction:** `--json`, write-back add/edit CLI, multi-currency.
