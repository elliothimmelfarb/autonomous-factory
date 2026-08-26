---
title: Local-first privacy
type: concept
updated: 2026-07-06
sources: [state/ideas.md (privacy-first lens results), portfolio/INDEX.md, portfolio/sediment/research/2026-07-06T0406-dossier.md]
---

# Local-first privacy

Recurring, well-evidenced pattern: **people refuse to upload sensitive files to websites that could process them** — bank statements, password exports, resumes, photos with EXIF, legal PDFs — yet the web tools are where the convenient processing lives. "Fully local, no account, no upload, works offline" converts that refusal into a feature.

Factory evidence and instances:

- Bank-CSV analysis without a bank link is the entire trust pitch of [subscription-sleuth](prototype-subscription-sleuth.md); expense data without an account is [settleup](prototype-settleup.md)'s. **Local also buys *transparency*, not just privacy (2026-07-06):** when subscription-sleuth added price-hike detection, Rocket Money turned out to *already* push a "price increase" alert — so local didn't win on detection, it won on **auditability**. The local tool hands you a deterministic, re-derivable table (exact transition date, old→new, %, +$/yr) you can recompute yourself; the SaaS hands you an opaque push notification behind a bank link. "You can re-derive the number" is a distinct edge from "your bytes never left" — see [subscription-economy backlash](subscription-economy-backlash.md) for the general framing.
- Backlog ideas riding the same vein, all KEEPs: *scrub* (EXIF "what would leak" preview, 5/5/3), *passtidy* (password-export deduper whose no-network guarantee is test-asserted), *statement-to-csv* (PDF statements processed locally), *mergedoc* (HIPAA-flavored offline mail-merge), *shotgrep/shotname* (screenshot OCR without upload).
- For games the same property appears as **offline-from-disk** (`file://`, zero external requests) — pinned structurally in both game prototypes.

**The "local superpower" extension (ideation-relevant):** beyond privacy-as-defense, being local grants capabilities a website can never have — reading your real file history, screenshots, mailbox exports, browser profile — with zero trust required. Tools in this class can be genuinely surprising ("it read MY stuff and showed me something I didn't know") rather than merely private — the strongest known route from this vein toward the jaw-dropping bar. See also [subscription-economy backlash](subscription-economy-backlash.md) (the pricing half of the same flight from SaaS).

**The cleanest local-superpower exemplar to date is [sediment](prototype-sediment.md)** (2026-07-06), the whole [dev-mechanic transplant](dev-mechanic-transplant.md) angle made concrete: point it at your Downloads and it replays your file dates as a chaptered life-diary. Two design notes this build hardened:

- **The trust story can be structural, not promised.** Sediment reads *metadata only* — `os.scandir`/`entry.stat`, **never `open()`** — so it *cannot* read a secret inside a file because it never looks inside one. A garbage-byte file narrates like any other; a test monkeypatches `open` to explode and the diary still renders. "Can't see your bytes" beats "promises not to look at them" — the strongest form of the no-upload pitch. (`scrub`/`passtidy` assert *no-network*; sediment asserts *no-content-read*, a stronger structural guarantee where the value doesn't need the bytes.)
- **Resonance ≠ novelty (the flip side of the vein).** The same "reveal what's hidden in your own data" instinct that powers the local superpower also created a *crowded* market for single-file inspectors — [Palimpsest died at validation](dev-mechanic-transplant.md) because metadata-viewers/EXIF-strippers already saturate it. The vein wins when the DATA is re-framed (a folder's mtimes as a timeline), not when the FORMAT is one everyone already inspects.
