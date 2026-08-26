# The Factory

A software factory that runs itself. Every three hours a scheduled Claude Code session wakes up, reads a written constitution, and executes one heartbeat: pick a unit of work, research it, build it, verify it adversarially, write a report a human can read over coffee, fold what it learned into a wiki — and then make exactly one improvement to itself before going back to sleep.

This repo is the factory's meta-layer, published as a working template. The state files are not mocked-up examples: the ledger, evolution log, wiki, and sample reports are the real artifacts from a factory that ran unattended on my machine for weeks, building a portfolio of small apps and games. The prototypes themselves live in their own repos; what's here is the machine that made them.

## How a heartbeat works

The constitution is [FACTORY.md](FACTORY.md). A heartbeat session reads it, claims a lock, checks disk headroom, and runs [workflows/heartbeat.js](workflows/heartbeat.js) — a nine-phase multi-agent workflow with JSON-schema-typed hand-offs:

```
Ideation → Validate → Brief → Dossier → Build → Verify → Coroner → Record → Ingest
```

- **Ideation** proposes candidates; **Validate** grades them against web research before anything gets built.
- **Brief** turns the winner into a contract; **Dossier** does design research the build is required to consume.
- **Build** ships one coherent unit of work — never fragments.
- **Verify** is adversarial and blocking. A verifier runs the code itself; for games, it plays them in a real browser and keeps the screenshots.
- **Coroner** examines every failure and is held to a budget: one durable check per failure class, never a family of sibling guards. Rules that stop firing get retired.
- **Record** writes the HTML report and updates the ledger; **Ingest** compounds the findings into the wiki, which feeds the next round of ideation.

After the workflow returns, the heartbeat applies **exactly one improvement to the factory itself** — and before doing so, it validates the previous improvement and reverts it if it didn't hold. The evolution log in [state/evolution.md](state/evolution.md) records both directions.

## The parts that earn their keep

**A constitution, not a prompt.** [FACTORY.md](FACTORY.md) is the source of truth for every run: mission, quality bar, mode selection, hard constraints only the operator can amend. Sessions come and go; the document persists and accumulates judgment.

**A coroner with a budget.** Most self-checking systems grow guards without limit until the guards are the workload. Here every caught failure buys the fix plus exactly one cheapest durable check — lint rule over regression test over written lesson — and [rules/lessons.md](rules/lessons.md) is the compiled result: 28 rules, each traceable to a real failure.

**Self-improvement that can lose.** Each heartbeat's evolution is checked by the next one. If it made things worse, it gets `git revert`ed and the log says so. The evolution log reads differently when the system is allowed to be wrong.

**Scar tissue in the procedure.** The disk-headroom guard exists because a real run filled the volume mid-heartbeat and lost its commit to `ENOSPC`. The lock's staleness-reclaim rule exists because a real run blocked seventeen hours on an agent conflict. The constitution documents both incidents where the rule now stands.

**A compounding wiki.** Every heartbeat writes what it learned into [wiki/](wiki/), Karpathy-LLM-wiki style, and every ideation phase reads it first. Knowledge is a product of each run, not an input consumed and discarded.

**One steering channel.** The operator files directives into [directives/inbox.md](directives/inbox.md) — everything else is the factory's own call. `standing:` directives persist across heartbeats; the rest are consumed and archived.

## What it produced

Read the three worked-example reports in [reports/](reports/) — real heartbeat output with embedded playtest screenshots — and the ledger in [state/ledger.md](state/ledger.md) for the run-by-run narrative. A sibling routine built on the same pattern has shipped 96 browser games to [aimade.games](https://aimade.games); its output repo is [aimade-drops](https://github.com/elliothimmelfarb/aimade-drops).

## Run your own

Requirements: [Claude Code](https://claude.com/claude-code) with a scheduler (a cron'd session or Claude Code's scheduled tasks).

1. Clone, then `export FACTORY_ROOT="$(pwd)"` — see [SETUP.md](SETUP.md) for the path convention.
2. Symlink the two skills into `~/.claude/skills/` (recipe in SETUP.md).
3. Empty [state/ledger.md](state/ledger.md), [state/evolution.md](state/evolution.md), and the wiki if you want a fresh start — or leave them and let your factory inherit this one's lessons.
4. Rewrite the mission section of FACTORY.md to say what *your* factory should build.
5. Schedule `factory-heartbeat` every 3 hours, or invoke it by hand to watch one run.

The heartbeat creates `portfolio/` and everything else it needs on first run. Prototypes are their own git repos; the factory repo only ever commits its meta-files.

## Layout

| Path | What it is |
|---|---|
| `FACTORY.md` | The constitution — every heartbeat reads it first |
| `workflows/heartbeat.js` | The nine-phase multi-agent workflow |
| `rules/lessons.md` | Coroner-compiled rules, each born from a real failure |
| `state/` | Ledger, evolution log, machine-readable catalog |
| `wiki/` | The compounding knowledge base |
| `templates/` | Prototype scaffolds that start lessons-compliant |
| `hub/` | Local portal (`hub/run.sh` → http://127.0.0.1:7777) to play and demo everything |
| `skills/` | `factory-heartbeat` and `factory-directive` for Claude Code |
| `reports/` | Report template plus three real worked examples |

---

<sub>Built by Elliot Himmelfarb with <a href="https://claude.com/claude-code">Claude Code</a>. The factory wrote most of its own state; a human wrote this README.</sub>
