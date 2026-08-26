---
title: Dev-mechanic transplant (folder-as-timeline)
type: concept
updated: 2026-07-06
sources: [state/ideas.md (2026-07-06 app round), portfolio/sediment/research/2026-07-06T0406-dossier.md, state/ledger.md (sediment entry)]
---

# Dev-mechanic transplant onto data people already sit on

The generative angle that produced the 2026-07-06 app round and shipped
[sediment](prototype-sediment.md). **The seed: take a mechanic developers love and
own — one culturally welded to *code* and *Git* — and transplant it onto the
personal files a normal person already has, unaware they're the raw material.**
The payoff is always the same shape and it is the [local superpower](local-first-privacy.md)
route to the OMG: *it reads YOUR stuff and tells you something you didn't know*,
with zero trust required because it's fully local.

**Why the angle is fertile.** A beloved dev mechanic (blame, bisect, spaced
repetition, diff, contribution-graph) usually needs only two things a Git history
*happens* to provide but isn't special in providing — an *ordered series* and
*some per-element signal*. A folder of dated files is an ordered series; a filename,
an mtime, a cell value is the signal. People already possess the corpus
(budget-jan.csv, IMG_0001.jpg, backup folders) and already answer the question by
hand (opening ten copies to eyeball a drift, scanning snapshots one at a time) —
they've reinvented a worse version of a mechanic they already know but never named.
The "wiring between the mechanic and the data you already own" is the unthought part.

## The two sub-veins

**A. Folder-is-secretly-a-timeline** — flip the axis from *space* (junk drawer to
sort) to *time* (chronological record). File dates are a dated diary of your
attention nobody reads.

- [sediment](prototype-sediment.md) — **SHIPPED, wow survived.** Replay a junk
  folder as a chaptered life-diary (eras + auto-captions). Novelty=clear.
- **Afterdate** (KEEP, ideation 4/4/5) — harvest expiry/renewal/deadline dates from
  a document folder and forecast the next 90 days. Universal high-stakes pain
  (missed warranties/renewals/passports). Kill risks to validate: Paperless-ngx
  proximity; and whether enough docs carry the meaningful date in the *filename*
  vs only the PDF body — and can the classifier tell "this date DESCRIBES the doc"
  (tax year `1099R-2025.pdf`) from "this date is a DEADLINE" without a wall of
  false alarms.
- **Pulse** (KEEP but weaker sibling of sediment) — replay ONE project folder's
  work rhythm + forecast completion. Same seed, different question (tempo+forecast
  vs life-diary). Its own note: "pick the sharper of the two, not build both" —
  sediment won. Git-repo case is crowded (gitstats, git-of-theseus, WakaTime); the
  novel slice is the non-git mtime-only rhythm, and a naive
  files-touched-per-active-day forecast risks reading as a hand-wavy toy.
- **Daylog** (KEEP, ideation 5/3/4) — reconstruct a Tuesday you can't remember from
  mtimes + shell history + git commits. High wow (breadcrumbs you left unknowingly).
  Docked feasible: shell-history timestamps unreliable (many zsh users have no
  `EXTENDED_HISTORY`, so no timestamps at all), highest-signal sources (browser
  history, app logs) deferred; must degrade gracefully and still wow.
- **Nightwatch** (KEEP but overlap-flagged) — snapshot a directory tree, diff two
  snapshots ("what changed while you slept"). `git status` for a folder you never
  init'd. Drags: the two-snapshots-you-took-yourself workflow blunts the OMG (must
  plan ahead); overlaps [tidy](prototype-tidy.md)'s file-operating space and
  backup-diffs / `find -newer`.

**B. Literal git-mechanic transplant** — take the named mechanic (blame, bisect)
off code entirely.

- **cellblame** (KEEP, **TOP FUTURE PICK**, ideation 5/5/5) — `git blame` per
  *cell* across a folder of dated CSV/spreadsheet exports: "this cell says 4,200;
  it became that on the 2026-03 export, up from 3,800." A clean one-to-one
  transplant (row=source line, cell=token, "who/when/what changed this"=blame) and
  a [pure-core](pure-core-thin-shell.md) re-derivation (blame = a fold over ordered
  diffs). NOT yet validated — a strong ideation score is not a survived wow. Its
  four open questions are the exact next-round pressure-tests: (a) does a clean
  local per-cell-blame-across-snapshots tool already exist (kill risk); (b) do real
  people keep folders of dated same-schema exports (input-corpus reality); (c) is
  *align-rows-by-key* robust on messy real exports or does alignment quietly become
  the whole hard project — the exact [subscription-sleuth merchant-string
  trap](prototype-subscription-sleuth.md); (d) is terminal cell-blame legible or is
  the value inseparable from a visual grid (would push toward single-file HTML).
  **Run this through full validation FIRST next app heartbeat.**
- **whenbroke** (KEEP, ideation 4/5/4) — `git bisect` over a folder of dated
  snapshots + a good/bad predicate ("when did it break?"), turning O(n) manual
  archaeology into O(log n) with a proof of the boundary snapshot. Pure
  `bisect(items, verdicts)` core that reports "not a clean good→bad boundary"
  instead of lying. Risks: is the monotonic good→bad-exactly-once assumption
  realistic for real personal snapshot series; is it too dev-flavored for a general
  app (audience may collapse to developers). Sibling to cellblame — build cellblame
  first (broader, warmer).
- **hindsight** (KEEP but adoption-risky, ideation 4/5/4) — Anki's spaced repetition
  transplanted onto your own *predictions*: log a call + confidence, the scheduler
  resurfaces it when the outcome resolves, then scores your calibration (Brier +
  calibration table). Fatal question is input burden (people must log predictions
  with numeric confidence or the calibration output has nothing to chew on); and
  whether SM-2's ease/interval actually beats a plain resolve-by-date calendar (if a
  due-date does 95% of the job the SR transplant is decoration and the OMG
  evaporates). Thinnest adoption story of the batch.

## The "reveal the hidden layer" cousins (adjacent, not folder-timeline)

Same "your own data secretly carries a layer you never see" spirit, but on a single
file/string rather than a folder-over-time. Logged here so the vein's boundaries are
clear:

- **Ghostchars** (KEEP, ideation 5/5/4) — reveal every invisible/deceptive character
  in text (zero-width spaces, Cyrillic homoglyphs `pаypal.com`, smart-quotes, mixed
  line endings). Curated Unicode-confusables subset is load-bearing shipped content
  ([curated content](curated-content-as-product.md), license-clean public data). Kill
  risk: editor "show invisibles" + unicode-inspector sites may already cover it —
  the wedge is local + pipeable + no-paste-privacy. Cut the "detect AI-text
  watermark" claim as over-reach before building.
- **Palimpsest — the file X-ray** (**REJECT, novelty=exists**, ideation 5/4/5 →
  validation wow **3**) — died at validation; see "Killed: Palimpsest" below for
  why, and the compounding lesson it teaches the vein.

## Killed: Palimpsest, and the lesson it teaches

**Palimpsest** ("drop any file, see everything secretly riding inside — DOCX author
+ deleted tracked-changes, photo GPS + stale thumbnail, PDF incremental-save
history") **died at validation: wow did not survive, novelty=exists.** A clean,
general, fully-local version already ships: **MetadataKit** (client-side WASM,
"analyzed locally, never uploaded", 500+ formats) surfaces the exact three claimed
differentiators — PDF incremental-updates history, Open-XML creator info, embedded
thumbnail, GPS — under the same "Every File Tells a Story, We Help You Read It" lens
the pitch called *unthought*. The DOCX tracked-changes/deleted-content wedge is
saturated (DocsCorp cleanDocs, PayneGroup Metadata Assistant, Litera Metadact,
Word's own Document Inspector); the PDF incremental-save reveal is a well-worn
forensic technique with OSS tooling (pdforensic, Didier Stevens). Feasibility was
actually *high* (stdlib `zipfile`+`xml.etree` suffices, no python-docx needed) — the
kill was purely wow: a stdlib CLI over 3 bundled samples would be a strictly-worse
re-implementation of a shipping, polished web app with no wedge left.

**The compounding lesson:** *the "reveal the hidden layer" instinct is powerful but
crowded on any well-known file format.* Metadata viewers, EXIF strippers, and
metadata-scrubbing tools are a mature, well-funded market precisely *because* the
resonance is real (Consumer Reports photo-GPS shock, resume-metadata leakage,
lawyer tracked-changes ethics breaches) — which means demand is *already met*.
Resonance proves nothing about novelty; it can be the very reason a clean tool
already exists. Contrast sediment, whose inversion (folder-as-*chronological-diary*,
not file-as-container) was genuinely unoccupied. **The transplant angle wins when
the DATA is one nobody has re-framed (a junk folder's mtimes, a folder of
snapshots), and loses when it's a FORMAT everyone already inspects (a single DOCX/PDF's
guts).** Prefer the folder-over-time sub-vein (A) and the literal-mechanic sub-vein
(B) over the single-file-reveal cousins.

**Connections:** the shipped instance is [sediment](prototype-sediment.md); the OMG
route is [local-first privacy](local-first-privacy.md)'s "local superpower"; the
alignment-hardness warning for cellblame is the
[subscription-sleuth](prototype-subscription-sleuth.md) merchant-string trap; every
candidate here rides [pure core, thin shell](pure-core-thin-shell.md) and several
lean on [curated content as product](curated-content-as-product.md). Any transplant
that operates over a snapshot series (whenbroke's bisect, cellblame's per-cell blame)
inherits the [reversible-action-stack UX](reversible-action-stack-ux.md) need — a
read-only "list the snapshots / inspect the stack before you act" view; `git stash
list` is itself a beloved dev mechanic, so [tidy](prototype-tidy.md)'s `--undo --list`
is a small transplant of the same instinct onto a file tool's undo history. **Twin
ideation-seed page:** this is the *app* round's generative angle; the *game* round's
is [novel-puzzle-verbs](novel-puzzle-verbs.md) (unclaimed core gestures), and the two
share the same discipline — resonance/desire ≠ novelty/mechanic: Palimpsest died
because the FORMAT was already inspected, Overunder died because the WIN CONDITION
was provably invariant under the verb.
