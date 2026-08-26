---
name: factory-directive
description: File, list, or cancel directives for Elliot's autonomous software factory at $FACTORY_ROOT. Use whenever Elliot wants to steer the factory in any way — "tell the factory to…", "focus the factory on X", "have it add a feature to <prototype>", "the next prototype should be…", "pause new prototypes", "what's the factory working on", "any pending directives?" — even if he doesn't say the word "directive". Directives are consumed by the next heartbeat (every 3 hours).
---

# Factory Directive

Manages `$FACTORY_ROOT/directives/inbox.md` — Elliot's steering channel into the factory. Heartbeats read this file, so preserve its structure: instructions above the `---` divider, one directive per bullet below it.

## Filing a directive

1. Distill Elliot's request into one imperative bullet, naming the target prototype when there is one (check `portfolio/INDEX.md` for exact names — a directive against a misspelled prototype silently becomes a "build something new" signal to the selector).
2. Decide scope. Phrases like "until I say otherwise", "from now on", "always", "every heartbeat", "focus on" imply a standing directive — prefix the bullet with `standing: `. A single concrete ask ("add a --json flag to tidy") is one-shot: no prefix, the heartbeat archives it after acting.
3. Append below the divider; remove the `(no directives)` placeholder if present.
4. Confirm back to Elliot: the exact bullet as written, how many directives are now pending, and that the next scheduled heartbeat (top of every 3rd hour) will pick it up. If it sounds urgent, offer to run the `factory-heartbeat` skill right now — but don't run it unasked.

## Status (no directive given, or Elliot asks what's happening)

Show, briefly: pending directives from the inbox (flag standing ones), the last two ledger entries as one-liners, and the current `portfolio/INDEX.md` table. Point him at `portfolio/dashboard.html` for the visual version.

## Cancelling

If Elliot wants a directive gone before it runs, move its bullet to `directives/archive.md` with today's date and the note "cancelled before consumption". For standing directives he's retiring, same thing — they only stop when removed from the inbox.

## Examples

- "have the factory focus on tidy for now" → `- standing: focus every heartbeat on tidy until Elliot says otherwise`
- "get it to add an --exclude flag to tidy" → `- add an --exclude glob flag to tidy (skip matching files when sorting)`
- "next new one should be something for podcast transcripts" → `- next new prototype: a local tool for working with podcast transcripts`
