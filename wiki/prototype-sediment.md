---
title: sediment (prototype)
type: prototype
updated: 2026-07-06
sources: [portfolio/sediment/, state/ledger.md, state/ideas.md (2026-07-06 app round), portfolio/sediment/research/2026-07-06T0406-dossier.md]
---

# sediment — your junk folder, replayed as a life-diary

**App, first slice (v0→v1).** Stdlib-only, read-only Python CLI that reads a
folder's file **metadata only** (`os.stat`: name, extension, size, times — never
file contents) and replays it as a chronological, chaptered life-diary: titled
**era blocks**, each with a date span, its 2–4 headline files, and a one-line
auto-caption (*"12 PDFs and a .zip over 4 days — looks like a tax filing"*).
`./run.sh examples/sample/` is the headline demo over a committed synthetic
sample (built by `touch -t`) with ≥3 distinct eras (a tax-PDF burst, a
trip-photo cluster, an abandoned code project). The core is three pure,
deterministic functions with an injectable `now`: `build_events`, `detect_eras`,
`caption_era`.

**The jaw-drop:** *flip the axis from space to time.* Everyone experiences their
Downloads/Desktop as a spatial junk drawer — clutter to sort or ignore — never as
a chronological record. But every file silently carries a birthtime/mtime, so the
folder has been keeping a dated diary of your attention the whole time; you just
never had a reader. The reaction is "that IS a diary — I've been keeping one for
years without knowing." Contrast with [tidy](prototype-tidy.md), the perfect foil:
tidy treats the same folder as a *set* to organize; sediment replays it as a
*record*. This is the [dev-mechanic transplant](dev-mechanic-transplant.md) angle
("folder is secretly a timeline") and the [local superpower](local-first-privacy.md)
route to the OMG ("it read MY stuff and showed me something I didn't know").

**Why the wow survived validation (novelty=clear):** three neighbouring families
all miss the specific inversion. Forensic timeliners (plaso/log2timeline, mactime)
build metadata timelines but as CSV rows to filter — no eras, captions, or emotion.
Manual-diary apps (StoryPad, Lifely) require every entry be *typed*. Personal-life
aggregators (automatic-diary, Timelinize, facebook/personal-timeline) ingest
*structured account exports* — automatic-diary explicitly does **not** scan random
file metadata. Direct searches for "folder as a story / file timeline diary" with
era auto-captioning returned zero tools. Resonance is independently documented: the
HN "archive your old projects" thread ("who you WERE and who you ARE are different
people"), "digital public archaeology" front-paging, "iPod archaeology inspires joy
and nostalgia." Two honest risks capped the scores (wow 4 / feasible 5 / useful 3):
the auto-caption heuristic is both the moat and the wow-risk (on a noisy real folder
it can read obvious/wrong; gap-clustering can fragment) — mitigated by the
deterministic committed sample; and one-time-novelty ("run it twice a year") caps
useful at 3, fine for a jaw-drop piece where wow leads.

**Domain knowledge embodied (from the [dossier](../portfolio/sediment/research/2026-07-06T0406-dossier.md)):**

- **Which timestamp to trust — and where it lies.** There is no reliable
  cross-platform "created" time. macOS/BSD expose `st_birthtime`; Linux often has
  no `st_birthtime` attribute at all (accessing it raises `AttributeError` — live
  CPython issue #122035); Windows `st_ctime` *is* creation (opposite of POSIX,
  where `st_ctime` is inode-metadata-change, **not** creation — a common trap).
  The shipped rule is `event_time = min(birthtime, mtime)` with an `mtime`
  fallback: the interesting instant is when the file *first entered this life*
  (earliest attestable evidence), and `min` is robust to whichever clock got
  clobbered — on Linux it degrades to `mtime` with no branch. **Never read POSIX
  `st_ctime` as a creation proxy.**
- **Clobbered timestamps are the #1 failure mode — and detectable.** Unzip/extract
  (Finder, `ditto`, 7-Zip), bulk copy/restore (`cp -p`, `rsync -t`, cloud sync),
  and `touch -t` fixtures all collapse many files onto one identical second. The
  tell that distinguishes a genuine burst from a clobber: a real burst has time
  *spread* (even a 20-photo trip spans distinct seconds); a clobber has near-zero
  internal variance. Sediment flags such eras `synthetic` and captions them
  honestly ("timestamps look synthetic — likely copied/unzipped together") rather
  than inventing a fake dense era; zero-span eras say "all at once", never
  "over 0 days".
- **Gap-clustering must be adaptive, not a fixed threshold.** The genre precedent
  is photo-collection event segmentation (Apple/Google Photos, 20 years of
  research): a bare "new era after 7-day gap" over/under-splits across a junk
  folder's huge dynamic range (tax-week gaps of minutes vs. abandoned-project gaps
  of days vs. life-era gaps of months). The shipped rule: a gap `g` is a boundary
  iff `g >= max(FLOOR, MULT × median(gaps))` with `MULT=8`, `FLOOR=3 days`. The
  `median` term adapts to the folder's own rhythm; the `FLOOR` stops a
  near-simultaneous blob from splitting on trivial gaps. `MULT=8` clears the
  "2–4× median = normal variation" band the photo literature treats as
  within-event. (Cooper/Foote/Girgensohn/Wilcox 2005, ACM TOMM.)
- **The caption is where the OMG lives** — it fuses three curated signals in fixed
  priority: dominant *category* (extension→category map), a shared *filename token*
  (the most evocative and most under-used signal), and *burst size + span*. The DCF
  standard makes token detection reliable: every consumer camera since ~2003 names
  files `<4-char prefix><4-digit sequence>` (`IMG_`, `DSC_`, `PXL_`, `Screenshot`),
  so a photo era reliably shares a prefix ("a trip / camera roll") and its
  near-consecutive numbers corroborate a genuine burst. Degrade gracefully with no
  shared token → category+span phrasing, never an empty token clause. This curated
  data (extension map, token vocabulary, phrasing templates) IS the moat — see
  [curated content as product](curated-content-as-product.md).
- **Metadata-only is the load-bearing trust story, and it's testable.** The walk
  calls only `os.scandir`/`entry.stat`, never `open()` — it cannot read a secret
  inside a file because it never looks inside one. Proven structurally: a
  garbage-byte file still narrates, and a test monkeypatches `open` to explode yet
  the diary still renders. This is the [local-first](local-first-privacy.md)
  "local superpower" with zero trust required.

**Architecture:** textbook [pure core, thin shell](pure-core-thin-shell.md) — three
pure functions over immutable metadata event records, `now` injected, the `os.stat`
walk the only IO. A pure fold over ordered events re-derives every view (the
month sparkline, the era blocks) for free, exactly as the dossier's re-derivation
principle predicted.

**Connections:** the ideation angle is [dev-mechanic transplant](dev-mechanic-transplant.md)
("folder is secretly a timeline"); the trust pitch and OMG route are
[local-first privacy](local-first-privacy.md); the caption vocabulary is
[curated content as product](curated-content-as-product.md); the architecture is
[pure core, thin shell](pure-core-thin-shell.md); its foil is [tidy](prototype-tidy.md).
Sediment's era/event dates are reconstruction anchors (which past moment was that?),
so they fall under the [reversible-action-stack UX](reversible-action-stack-ux.md)
page's absolute-timestamp-for-reference rule — a printed timeline of past events is a
reference view, not a live feed, so full absolute dates beat relative "N days ago".

**Open direction:** content-parsing a later slice (dates/authors inside PDFs — the
[Afterdate](dev-mechanic-transplant.md) idea); a JSON/HTML render of the timeline;
richer captions for mixed-category eras. A visual grid would sharpen it but pushes
out of the CLI comfort zone.
