---
title: Subscription-economy backlash
type: concept
updated: 2026-07-06
sources: [state/ideas.md (2026-07-05 app rounds), state/ledger.md (subscription-sleuth, settleup entries)]
---

# Subscription-economy backlash

A live 2026 demand pattern: **simple tools people once owned are now metered subscriptions**, and users are actively fleeing. Two well-evidenced instances drove factory prototypes:

- **Splitwise's 2026 free-tier squeeze** (~3 expenses/day, ads, receipt scanning paywalled) produced a documented exodus — "leaving in droves," a wave of alternatives (splittyapp, areweeven, settlify). Built as [settleup](prototype-settleup.md).
- **Jobscan** ($50/mo, 5 free scans, resume-upload privacy worries) — the same squeeze applied to job seekers; backlog idea *matchpoint* (resume↔JD matcher) scored 5/5/4 and remains a strong future pick.
- The inverse pain: **forgotten subscriptions silently draining money**, hidden behind cryptic merchant strings — built as [subscription-sleuth](prototype-subscription-sleuth.md).

**The generalizable shape:** find a tool whose *core arithmetic/logic is simple and complete-able* (debt minimization, keyword matching, recurring-charge clustering) where the SaaS is charging rent on convenience, not capability. A fully-local version is a one-heartbeat build with instant resonance — see [local-first privacy](local-first-privacy.md) for why "no account, no upload" is the trust half of the pitch.

**Jaw-dropping ceiling note:** these builds are *gratefully received* rather than surprising — the user already knew they wanted it. To clear the higher bar, the local tool must do something the SaaS never did (e.g. subscription-sleuth's next-due projection was a step in this direction; a price-hike detector that names the exact hike date from your own CSV would be more so — **built 2026-07-06**). The strongest known route: attack a *capability* gap the SaaS left open, not just its pricing. [settleup](prototype-settleup.md)'s `--breakdown` does exactly this — it ships the itemized-balance transparency Splitwise has left "under review" since 2013 and calls "surprisingly tricky," because settleup's [declarative ledger vs. running tab](declarative-ledger-vs-running-tab.md) data model makes the feature a trivial pure re-derivation.

**Refinement — the gap is rarely raw *detection*; it's transparency (2026-07-06, subscription-sleuth price-change slice).** When [subscription-sleuth](prototype-subscription-sleuth.md) built price-hike detection, research showed **Rocket Money already pushes a "subscription price increase" alert** — so "attack a capability the SaaS lacks" was too naïve a reading. The realizable gap was one level down: not *whether* a hike is noticed, but whether the user gets a **local, exact, re-derivable record** — a deterministic table naming the exact transition date, old→new amounts, %, and the annualized +$/yr bite, computed from a CSV with nothing leaving the machine — versus an opaque push notification in a paid app they linked their bank to. This is the same shape as settleup's `--breakdown`: the SaaS gives you the *answer*; the local tool gives you the *auditable derivation*. Corollary for docs: don't over-claim "they can't detect it" (lessons rule 22) — the honest pitch is precise/local/re-derivable, not "does something they don't."
