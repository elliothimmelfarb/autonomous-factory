# The Factory Wiki — Schema

This is the factory's compounding knowledge base, modeled on Karpathy's LLM-wiki pattern (April 2026): a persistent, structured, densely-interlinked collection of markdown pages that an LLM actively maintains, sitting between the raw sources and the agents that need knowledge. Raw sources are immutable and live elsewhere (design dossiers in each prototype's `research/`, `state/ideas.md`, ledger entries, reports); the wiki is the synthesis layer; this file is the schema that governs it.

**Why it exists:** research used to evaporate after each heartbeat. Now every heartbeat's research is ingested here, so knowledge compounds — and the ideation phase reads the wiki, so connections between ideas and concepts feed back into what gets built. The factory is a research factory as much as a software factory.

## The three layers

1. **Raw sources (immutable, read-only to the wiki):** `portfolio/<prototype>/research/*-dossier.md`, `state/ideas.md`, `state/ledger.md`, `reports/`. The wiki cites them; it never edits them.
2. **The wiki (this folder):** markdown pages the librarian agent creates, updates, and maintains.
3. **The schema (this file):** page types, conventions, and workflows. Evolve it when a convention demonstrably fails, and note the change in `log.md`.

## Page types

- **Concept pages** (`<kebab-case-concept>.md`) — cross-source syntheses of a theme, mechanic, demand pattern, or domain (e.g. `ad-ruined-casual-games.md`, `solver-verified-puzzle-generation.md`). The workhorses. One concept per page.
- **Prototype pages** (`prototype-<name>.md`) — one entity page per portfolio prototype: what it is, the domain knowledge it embodies, what building it taught us about the domain (NOT engineering process — that's `rules/lessons.md`), and its concept connections.
- **`index.md`** — the catalog: every page, one line each, grouped by category. The first thing any reader loads.
- **`log.md`** — append-only chronological record of ingests and maintenance passes.

## Conventions

- Frontmatter on every page: `title`, `type` (concept | prototype), `updated` (ISO date), `sources` (list of raw-source paths/URLs the page draws on).
- Link **densely** with standard markdown links to sibling pages: `[solver-verified generation](solver-verified-puzzle-generation.md)`. Every page should have inbound and outbound links; an unlinked fact is a fact the ideation phase will never find.
- Cite sources inline where a claim would otherwise be unverifiable — a wiki claim with no source is a rumor.
- **Contradictions are content.** When new research contradicts a page, don't silently overwrite: state the contradiction, date it, and resolve or leave both claims marked. ("2026-07 dossier says X; the 2026-06 ideas-backlog evidence said Y — X is newer and better-sourced.")
- Keep pages tight (roughly 150–400 words). Split a page that grows past two screens.

## Workflows

### Ingest (every heartbeat — the workflow's Ingest phase)

Inputs: this run's design dossier, ideation candidates + validation findings (new mode), and any domain knowledge surfaced by build/verify. Steps:

1. Read `index.md`; open every page the new material plausibly touches. A single ingest should touch **every page it genuinely concerns** — often 3–10 pages, not one.
2. Integrate: update concept pages, update the prototype page, create a new page only when a concept has no home (prefer enriching an existing page).
3. Cross-link both directions. Note contradictions explicitly.
4. Update `index.md` (one line per new page; revise lines whose summaries drifted).
5. Append one entry to `log.md`: date, what was ingested, pages touched.

**Scope guard:** the wiki holds PRODUCT and DOMAIN knowledge — problems, mechanics, demand evidence, data, market gaps, connections between ideas. Engineering process lessons (test patterns, UI-seam bug classes) belong in `rules/lessons.md`, not here.

### Query (ideation and design-research agents)

Start from `index.md`, follow links to relevant pages, and treat what you find as prior knowledge to build on — not to re-research. **File back what you use:** if you exploit a connection the wiki didn't already state, add it (a sentence and a link is enough). Good answers filed back are how the wiki compounds.

### Lint (occasional maintenance, when an ingest notices rot)

Check for: contradictions between pages, stale claims newer sources supersede, orphan pages with no inbound links, concepts important enough to deserve a page but lacking one, missing cross-references. Fix what you find; log the pass.
