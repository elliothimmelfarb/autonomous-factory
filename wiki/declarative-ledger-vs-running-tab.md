---
title: Declarative ledger vs. running tab
type: concept
updated: 2026-07-06
sources: [portfolio/settleup/research/2026-07-06T0206-dossier.md, "https://feedback.splitwise.com/forums/162446-general/suggestions/4674654-itemized-or-detailed-balances", "https://feedback.splitwise.com/knowledgebase/articles/425486-help-my-balances-are-wrong"]
---

# Declarative ledger vs. running tab

A structural data-model choice that decides which features are cheap and which are "surprisingly tricky." Two ways to model shared money:

- **Running tab (mutable, cloud-state):** balances accrete transaction-by-transaction; the current balance is the accumulated result, and the raw contributions that produced it are not kept in a form you can cleanly re-explain. Splitwise's model.
- **Declarative ledger (immutable list):** the source of truth is a complete list of expenses; every view — net balances, settle-up plan, per-person itemization — is a *pure re-derivation* from that list, order-independent and fully reproducible. [settleup](prototype-settleup.md)'s model (a hand-edited JSON file).

## The load-bearing consequence: itemized balances

Users have asked Splitwise since **October 2013** for "itemized or detailed balances" — select a person, see the exact list of expenses that make up what they owe. The request is still "under review" a decade later. Splitwise's own staff reply is the tell: *"We'd definitely like a better way to explain exactly why you owe what you owe, but unfortunately it's **surprisingly tricky, since people often pay for things out of order.**"* Their only workaround is a separate printable summary page. On unequal splits Splitwise also admits you **cannot see the shares/percentages entered** — only the final amounts — so the split is a black box even inside the app.

"Paid out of order" is a symptom of the running-tab model, not an inherent hardness of the problem. A declarative ledger has **no order problem at all**: order is irrelevant to a pure function over the full list, so the itemization is trivial, reconciling `paid − owed == net` by construction (see [settleup](prototype-settleup.md)'s `--breakdown`). The feature a SaaS called impossible for 13 years falls out of the data model for free.

## Why this generalizes (the factory principle)

This is the sharpest instance yet of a reusable pattern: **pick the data model that makes your differentiating feature a pure re-derivation, and the SaaS's hardest-to-ship feature becomes your cheapest.** It is the same "exactness-is-the-product / off-by-a-penny destroys trust" thesis applied to the *explanation* rather than the total. The transparency win (see auditability in [settleup](prototype-settleup.md)) is a direct dividend of [pure core, thin shell](pure-core-thin-shell.md) — a pure, IO-free core over immutable input can re-explain any output.

## Relation to other veins

- Concrete demand and pricing context: the [subscription-economy backlash](subscription-economy-backlash.md) (Splitwise squeeze) — but note this is a *capability* gap, not just a pricing one, which pushes settleup's breakdown toward the jaw-dropping bar (doing something the SaaS *never did*, not just cheaper).
- Ownership half of the pitch: [local-first privacy](local-first-privacy.md) — "your data is a file you own" and "here is exactly how your total is made" are the two halves of anti-black-box.
