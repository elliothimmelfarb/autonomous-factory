export const meta = {
  name: 'factory-heartbeat',
  description: 'One factory heartbeat: ideate/validate/build a new prototype or improve an existing one, every build consuming a design-research dossier, with adversarial verification, a coroner pass, and wiki ingestion',
  phases: [
    { title: 'Ideation', detail: 'invent jaw-dropping candidates from the wiki + backlog (new mode only)' },
    { title: 'Validate', detail: 'web research pressure-tests the shortlist (new mode only)' },
    { title: 'Brief', detail: 'select and write the task brief' },
    { title: 'Dossier', detail: 'design research the build must consume' },
    { title: 'Build', detail: 'builder implements the brief against the dossier' },
    { title: 'Verify', detail: 'adversarial panel actually runs the code (games: real-browser playtest)' },
    { title: 'Coroner', detail: 'the fix plus ONE durable check per caught failure' },
    { title: 'Record', detail: 'ledger, index, dashboard, status.json' },
    { title: 'Ingest', detail: 'compound this run\'s research into the wiki' },
  ],
}

// args: { mode: 'new'|'improve', factoryRoot, timestamp, target?, directive?, ptype? ('app'|'game') }
// The harness may deliver `args` as a JSON *string* rather than a parsed object.
// Parse-if-string so factoryRoot/mode/timestamp/target actually reach the script:
// a raw string has no `.factoryRoot` etc., which silently forces the improve branch
// and passes "undefined" paths to every agent.
const A = typeof args === 'string' ? JSON.parse(args) : (args || {})
const ROOT = A.factoryRoot
const TS = A.timestamp
const MODE = A.mode
const DIRECTIVE = A.directive || 'none'
const PTYPE = A.ptype === 'game' ? 'game' : 'app'
const M = 'opus'
// Report/asset slug for this run: YYYY-MM-DDTHHmm derived from the timestamp.
const SLUG = String(TS).slice(0, 16).replace(/:/g, '')

const CONCEPTS = {
  type: 'object', required: ['ideas'],
  properties: {
    ideas: {
      type: 'array',
      items: {
        type: 'object',
        required: ['name', 'pitch', 'why_unthought', 'why_inevitable', 'first_slice', 'wow', 'feasible', 'useful', 'validation_questions'],
        properties: {
          name: { type: 'string' },
          pitch: { type: 'string', description: 'one sentence a person hears and says "OMG, that makes so much sense"' },
          why_unthought: { type: 'string', description: 'why most people would not have thought of this' },
          why_inevitable: { type: 'string', description: 'why it feels obvious/inevitable the moment it is seen' },
          first_slice: { type: 'string', description: 'end-to-end walking skeleton buildable in one heartbeat' },
          wow: { type: 'number' }, feasible: { type: 'number' }, useful: { type: 'number' },
          validation_questions: { type: 'array', items: { type: 'string' }, description: 'what web research must confirm or kill this idea' },
        },
      },
    },
  },
}

const SHORTLIST = {
  type: 'object', required: ['shortlist', 'rationale'],
  properties: {
    shortlist: {
      type: 'array', maxItems: 3,
      items: {
        type: 'object', required: ['name', 'pitch', 'why_unthought', 'why_inevitable', 'first_slice', 'validation_questions'],
        properties: {
          name: { type: 'string' }, pitch: { type: 'string' },
          why_unthought: { type: 'string' }, why_inevitable: { type: 'string' },
          first_slice: { type: 'string' },
          validation_questions: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    rationale: { type: 'string' },
  },
}

const VALIDATION = {
  // Only the SMALL decision fields the selector depends on are required (name + the novelty
  // enum, wow_survives bool, revised scores, and the strong/weak verdict) — none can bloat the
  // tool-call XML. The two LARGE free-text evidence fields (prior_art, resonance_evidence) are
  // NOT required: exactly like the dossier's key_findings, forcing a big URL-laden string through
  // the StructuredOutput XML can mangle it and burn the retry cap, so a validate:<name> agent
  // returns null and that candidate is silently dropped from selection. Keeping them optional lets
  // a mangled-and-dropped field still validate first-try; the agent still provides them normally,
  // so the selector/wiki keep the evidence in the common case. See state/evolution.md 2026-07-06.
  type: 'object', required: ['name', 'novelty', 'wow_survives', 'revised', 'verdict'],
  properties: {
    name: { type: 'string' },
    novelty: { type: 'string', enum: ['clear', 'crowded', 'exists'], description: 'clear = no good existing version found; crowded = versions exist but all miss the point; exists = a good version already exists' },
    prior_art: { type: 'string', description: 'the closest existing things, with URLs — keep CONCISE (a few URLs + a line each); optional so a large payload can never crash the return, but still provide it' },
    resonance_evidence: { type: 'string', description: 'evidence real people would care, with URLs — adjacent complaints, wishes, petitions, loves; keep CONCISE (a few URLs + a line each); optional so a large payload can never crash the return, but still provide it' },
    feasibility_notes: { type: 'string' },
    wow_survives: { type: 'boolean', description: 'does the OMG survive contact with the prior art?' },
    revised: {
      type: 'object', required: ['wow', 'feasible', 'useful'],
      properties: { wow: { type: 'number' }, feasible: { type: 'number' }, useful: { type: 'number' } },
    },
    verdict: { type: 'string', enum: ['strong', 'weak'] },
  },
}

const BRIEF = {
  type: 'object', required: ['title', 'prototype_dir', 'goal', 'acceptance_criteria', 'tasks'],
  properties: {
    title: { type: 'string' },
    prototype_dir: { type: 'string', description: 'kebab-case folder name under portfolio/' },
    goal: { type: 'string' },
    acceptance_criteria: { type: 'array', items: { type: 'string' } },
    tasks: { type: 'array', items: { type: 'string' } },
    non_goals: { type: 'array', items: { type: 'string' } },
  },
}

const DOSSIER = {
  // key_findings is intentionally NOT required: the dossier FILE at dossier_path is the
  // real deliverable (every downstream agent reads the file, not this array), and forcing a
  // large key_findings array through the StructuredOutput tool-call has crashed a run when the
  // XML mangled and dropped the required field (5 retries → cap → throw). Keeping it optional and
  // small lets the return validate on the first call. See state/evolution.md 2026-07-06.
  type: 'object', required: ['dossier_path'],
  properties: {
    dossier_path: { type: 'string', description: 'absolute path of the dossier file you wrote' },
    key_findings: {
      type: 'array',
      description: 'a BRIEF highlight list (3-8 items max) of the load-bearing findings; the FULL dossier detail lives in the file at dossier_path, which the builder reads — do NOT paste the whole dossier here, keep this array small so the return serializes cleanly',
      items: {
        type: 'object', required: ['finding', 'source', 'how_build_consumes'],
        properties: {
          finding: { type: 'string' },
          source: { type: 'string', description: 'URL or wiki page' },
          how_build_consumes: { type: 'string', description: 'the concrete way the build must use this finding' },
        },
      },
    },
    content_payload_summary: { type: 'string', description: 'what shippable content (data, curated entries, rule tables) the dossier carries, if any' },
  },
}

const BUILD = {
  type: 'object', required: ['summary', 'run_command', 'test_command', 'tests_passing'],
  properties: {
    summary: { type: 'string' },
    run_command: { type: 'string' },
    test_command: { type: 'string' },
    tests_passing: { type: 'boolean' },
    dossier_findings_consumed: { type: 'string', description: 'which dossier findings landed in the build, and where' },
    notes: { type: 'string' },
  },
}

const VERDICT = {
  type: 'object', required: ['lens', 'verdict', 'blocking_issues', 'non_blocking_issues'],
  properties: {
    lens: { type: 'string' },
    verdict: { type: 'string', enum: ['pass', 'fail'] },
    blocking_issues: { type: 'array', items: { type: 'string' } },
    non_blocking_issues: { type: 'array', items: { type: 'string' } },
  },
}

// The coroner reports which of the still-open blocking issues its own committed
// fixes/guards resolved, so the workflow's RETURN VALUE (read by the heartbeat
// session at close-out) reflects the POST-coroner truth, not the pre-coroner
// verify snapshot. The durable ledger status stays the scribe's job — it
// re-derives against committed code — so this only fixes the return contract.
const CORONER = {
  type: 'object', required: ['resolved_blocking', 'still_blocking'],
  properties: {
    resolved_blocking: { type: 'array', items: { type: 'string' }, description: 'the still-open blocking issues your committed coroner work RESOLVED this pass (verbatim from the list given)' },
    still_blocking: { type: 'array', items: { type: 'string' }, description: 'blocking issues that STILL reproduce against the committed code after your pass' },
  },
}

const INGEST = {
  type: 'object', required: ['pages_created', 'pages_updated', 'log_appended'],
  properties: {
    pages_created: { type: 'array', items: { type: 'string' } },
    pages_updated: { type: 'array', items: { type: 'string' } },
    connections_noted: { type: 'array', items: { type: 'string' }, description: 'new cross-idea connections recorded this ingest' },
    log_appended: { type: 'boolean' },
  },
}

const CTX = `Factory root: ${ROOT}. Timestamp: ${TS}. Active directive: ${DIRECTIVE}.
Before doing anything else, read ${ROOT}/FACTORY.md (quality bar and hard constraints) and ${ROOT}/rules/lessons.md (obey the checklist; consult the appendix when a rule fires), and obey both. The factory keeps a domain-knowledge wiki at ${ROOT}/wiki (start at index.md; schema in WIKI.md). Never modify files outside ${ROOT}. Never deploy, publish, or sign up for any service. Never run claude -p.
Product type this round: ${PTYPE}. Apps must solve a real problem; games must be genuinely fun, small, and COMPLETE — terminal or single-file HTML canvas, no engines or downloaded assets — with core logic (rules, scoring, generation) unit-testable even where feel is judged by playing.`

let brief
let ideationOut = null
let validationOut = null

if (MODE === 'new') {
  phase('Ideation')
  // Generative angles — the bar is JAW-DROPPING: something most people wouldn't
  // think of, but that feels obvious/inevitable the moment they see it. Research
  // no longer generates ideas (complaint mining only ever surfaces what people
  // already know they want); it validates them in the next phase. Rotate a
  // window of 3 angles per run via the timestamp hash (no Date/random in the
  // workflow sandbox).
  const anglePool = PTYPE === 'game' ? [
    'unseen-verb: invent a small game around a mechanic that does not exist yet — a verb no game uses. Merge, match, rotate, drop, and swipe are taken; find the untaken verb and build the smallest complete game around it',
    'provable-fairness: a puzzle game whose generator PROVES a property no incumbent offers — unique solution, no-guess solvability, winnable-by-construction — and shows the player the guarantee. The honest certificate IS the wow (the wiki has a page on this vein)',
    'real-structure-play: a game whose boards/levels are generated from real structure (language, number theory, music, the calendar, geography) so every level feels DISCOVERED rather than authored',
    'cross-genre-transplant: fuse two well-loved mechanics from genres nobody combines, where the fusion changes how both feel (deduction + falling blocks, typing + tower defense, solitaire + roguelike)',
    'toy-into-game: take a mesmerizing pure toy (physics, automata, emergence, generative art) and add the smallest scoring frame that turns fiddling into a game people replay',
    'lost-masterpiece: resurrect a genuinely LOST design — pre-web, Flash-era, handheld, BBS — that most people never saw. The OMG is discovery ("this existed?!"), not nostalgia for the famous',
  ] : [
    'invisible-made-visible: invent a tool that makes something invisible in everyday computing suddenly visible and legible — what a file really contains, what changed overnight, where the disk/time/money actually went. The OMG is seeing it for the first time',
    'local-superpower: invent something only-possible-because-local — it reads your real files, history, screenshots, or exports with zero upload and shows you something about YOUR OWN data you did not know. A website could never be trusted to do it',
    'dataset-nobody-assembled: build an experience on a locally-bundled dataset nobody has bothered to assemble (curate it as shipped content — the wiki has a page on curated content as product). The OMG is that the data exists in one place at all',
    'expert-trick-for-everyone: take a move specialists do by hand — forensic, archival, typographic, statistical, acoustic — and turn it into a one-command tool anyone can run on their own files',
    'cross-domain-transplant: transplant a beloved mechanic from one domain into another where nobody uses it — spaced repetition for X, git-blame for Y, diff for Z, autocomplete for W',
    'time-machine: build a tool around TIME — replay, rewind, forecast, time-lapse — applied to something people never think of as having a timeline',
  ]
  // Deterministic per-run offset from the timestamp (no Date/random in the sandbox);
  // TS changes every heartbeat, so the 3-angle window rotates between runs.
  const tsSeed = String(TS).split('').reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) % 1000000007, 7)
  const angleOffset = tsSeed % anglePool.length
  const angles = [0, 1, 2].map(k => anglePool[(angleOffset + k) % anglePool.length])
  log(`ideation angles (window ${angleOffset}/${anglePool.length}): ${angles.map(a => a.split(':')[0]).join(', ')}`)

  ideationOut = (await parallel(angles.map((angle, i) => () =>
    agent(`${CTX}
You are an ideation agent for an autonomous software factory. Your generative angle: ${angle}.
THE BAR IS JAW-DROPPING: an idea most people wouldn't think of, but that feels obvious and inevitable the moment they see it — "OMG, that makes so much sense". Useful-but-expected is a FAIL at this phase, no matter how well-evidenced.
First, load prior knowledge: read ${ROOT}/wiki/index.md and follow the links relevant to your angle (the wiki is the factory's compounded research — build ON it, don't rediscover it), and skim ${ROOT}/state/ideas.md so you don't re-pitch existing prototypes or already-rejected ideas. You MAY elevate a backlog idea if you can twist it past the jaw-dropping bar — say so in why_unthought.
Then INVENT: return 2-4 ${PTYPE} concepts. This is invention, not search — do not do web research here (validation does that next); reason from the wiki, the angle, and first principles. Every concept must be buildable fully locally (no accounts, no paid APIs, no deployment), testable, and honest about its first slice. Score wow/feasible/useful 1-5 and write validation_questions that would genuinely kill the idea if answered badly.`,
      { label: `ideate:${angle.split(':')[0]}`, phase: 'Ideation', model: M, schema: CONCEPTS })
  ))).filter(Boolean).flatMap(r => r.ideas)

  if (!ideationOut.length) throw new Error('ideation produced no concepts')
  log(`${ideationOut.length} concepts generated`)

  phase('Validate')
  const short = await agent(`${CTX}
You are the triage judge. Candidate concepts (JSON): ${JSON.stringify(ideationOut)}
Read ${ROOT}/portfolio/INDEX.md and ${ROOT}/state/ideas.md; discard duplicates of existing prototypes and previously rejected ideas. Then pick the 2-3 candidates with the strongest genuine wow — weighing wow/inevitability FIRST, then feasible, then useful. A merely-useful expected idea loses to one that would make someone say OMG. Return them verbatim (keep their validation_questions) with your rationale.`,
    { label: 'shortlist', phase: 'Validate', model: M, schema: SHORTLIST })

  validationOut = (await parallel(short.shortlist.map(c => () =>
    agent(`${CTX}
You are a validation researcher. Concept under test (JSON): ${JSON.stringify(c)}
Do REAL web research with WebSearch/WebFetch — your job is to pressure-test this concept, not to sell it. Answer its validation_questions and determine: (1) NOVELTY — what already exists? If a good clean version exists, the idea is dead (novelty "exists"); if versions exist but all demonstrably miss the point, "crowded" with evidence; if you genuinely can't find one, "clear". (2) RESONANCE — evidence real people would care: adjacent complaints, wishes, petitions, forum love for neighboring things. Cite URLs for both. (3) FEASIBILITY of the first slice as stated. Then judge honestly whether the wow survives contact with the prior art, revise the scores, and return verdict strong/weak. Kill your darlings — a weak verdict here saves a wasted heartbeat.`,
      { label: `validate:${c.name}`, phase: 'Validate', model: M, schema: VALIDATION })
  ))).filter(Boolean)

  phase('Brief')
  brief = await agent(`${CTX}
You are the selector. Shortlisted concepts with validation results (JSON): ${JSON.stringify({ shortlist: short.shortlist, validations: validationOut })}
Full ideation pool for context: ${JSON.stringify(ideationOut)}
1. Pick the winner: the strongest validated concept, weighing wow/inevitability FIRST (then feasible, then useful) among those whose wow SURVIVED validation. If NO concept clears the jaw-dropping bar with a strong verdict, do NOT ship a mediocre wow-attempt: instead pick the strongest candidate from ${ROOT}/state/ideas.md's backlog for this product type and say so — a proven backlog idea deepened by a great dossier beats a hollow flashy one.
2. Append the unpicked concepts (with their validation results, scores, and a one-line keep-or-reject rationale) to ${ROOT}/state/ideas.md so they aren't re-invented.
3. Return a brief for the FIRST SLICE only — an end-to-end walking skeleton achievable in one heartbeat. prototype_dir must be a NEW kebab-case folder name under portfolio/. The acceptance_criteria must include the specific moments that carry the wow — if the OMG isn't in the acceptance criteria, the builder won't build it.`,
    { label: 'select+brief', phase: 'Brief', model: M, schema: BRIEF })
} else {
  phase('Brief')
  brief = await agent(`${CTX}
You are the brief writer. Target prototype: ${ROOT}/portfolio/${A.target}.
Read its BRIEF.md, README.md, code, and git log, plus the wiki's page on this prototype (${ROOT}/wiki/prototype-${A.target}.md, if present) and any linked concept pages — the wiki may know domain directions the code alone doesn't suggest. If a directive is active, it defines the work; otherwise choose the single highest-leverage next step toward graduation (v0: runs end-to-end -> v1: tested, documented, genuinely usable -> polish). PREFER USER-FEELABLE work — features, feel, content someone experiences — over doc-seam hardening or meta-guard accumulation; guards get added by the coroner when failures earn them, not by briefs.
Return a brief for ONE coherent unit of work. prototype_dir must be exactly "${A.target}".`,
    { label: `brief:${A.target}`, phase: 'Brief', model: M, schema: BRIEF })
}

const dir = `${ROOT}/portfolio/${brief.prototype_dir}`
log(`brief ready: ${brief.title} -> ${brief.prototype_dir}`)

// Design research: every build consumes a dossier. Research stopped being only a
// way to FIND work; it now DEEPENS the chosen work, and the dossier is stored in
// the prototype itself (committed with the build) then compounded into the wiki.
phase('Dossier')
const dossier = await agent(`${CTX}
You are the design researcher. The following brief has been selected for this heartbeat — your job is to make the resulting build DEEPER than what a builder would produce from the brief alone:
${JSON.stringify(brief, null, 2)}
First read ${ROOT}/wiki/index.md and follow the relevant links — reuse what the factory already knows and cite the wiki pages you leaned on; spend your web research (WebSearch/WebFetch — do it for real) on what the wiki does NOT yet know.
Research the DOMAIN of this brief: genre-defining details and expert heuristics (what separates the best instance of this kind of thing from an average one), real data formats and their edge cases, the exact touches users of the best versions rave about, and — highest value — CURATABLE CONTENT the build can ship (actual entries, rule tables, curated data; not pointers to it). See the wiki's curated-content-as-product page for why content payloads beat advice.
Write the dossier to ${dir}/research/${SLUG}-dossier.md (create the folder; in new mode the prototype folder may not exist yet — create it too; the builder will git-init and commit it, so just write the file). Structure it as: a short orientation, then for EACH finding — the finding, the source (URL or wiki page), and exactly how the build should consume it; end with the content payload section if you curated content. Right-size to the brief: a tiny mechanical fix warrants a short dossier, a new prototype a deep one — but there is always a dossier.
Return the path and the key findings.`,
  { label: 'dossier', phase: 'Dossier', model: M, schema: DOSSIER })
log(`dossier: ${(dossier.key_findings || []).length} findings -> ${dossier.dossier_path}`)

phase('Build')
let build = await agent(`${CTX}
You are the builder. FIRST read the design dossier at ${dossier.dossier_path} — the brief assumes its findings are consumed, and your report must say which findings landed where (dossier_findings_consumed). Implement this brief completely in ${dir}:
${JSON.stringify(brief, null, 2)}
Rules: if the folder does not exist, scaffold it starting from the matching template in ${ROOT}/templates/ (app-python or game-html — copy, rename placeholders, adapt; it starts you lessons-compliant), then run git init inside it. Commit the research/ dossier with your work. Write real tests and run them — tests_passing must reflect what you actually observed, with the command output to prove it. Maintain README.md with a one-command run instruction and BRIEF.md with this brief. Every prototype is agent-native: also maintain a CLAUDE.md at the prototype root (what it is, how to run and test it, where the core logic lives) and a .claude/skills/ folder with at least one project skill (typically a dev-loop skill: run, test, debug) — keep both current with this change. Commit your work with a clear message. Do not touch anything outside ${dir}.`,
  { label: 'build', phase: 'Build', model: M, schema: BUILD })

// Verifier lenses. Games get a 4th "playtest" lens that drives the real UI in a
// browser over a localhost static server — the FEEL dimension the file:// offline
// tests structurally cannot reach (lessons rule 14). The static offline-invariant
// test STAYS as the file:// guard; this lens is additive and game-only.
const verifyLenses = [
  ['correctness', 'Run the test command and the run command yourself, then attack the acceptance criteria with edge cases. Do not trust any of the builder\'s claims — reproduce them.'],
  ['usefulness', `Judge it as the intended user. Does it genuinely solve the stated problem? Is the README one-command run real from a cold start? Walk the happy path yourself. ALSO judge the wow: the brief's goal was selected for being jaw-dropping or genuinely delightful — does the shipped thing actually deliver that moment, and did the builder consume the design dossier at ${dossier.dossier_path} (spot-check its key findings against the code/content)? A build that ignored the dossier's load-bearing findings is a blocking issue.`],
  ['quality', 'Hunt for crashes on bad input, hardcoded absolute paths, missing error handling, and security problems. Your job is to REFUTE that this is shippable.'],
]
if (PTYPE === 'game') verifyLenses.push(['playtest', `This prototype is a GAME — judge its FEEL by actually PLAYING it in a real browser over a localhost static server. This is the dimension the file:// offline tests structurally cannot cover (lessons rule 14), so it is your job, not theirs. Steps: (1) Start a localhost static server from ${dir} on a high port, e.g. \`python3 -m http.server 8191 --bind 127.0.0.1 &\` (pick a port unlikely to clash; capture the PID and kill it when done). Confirm it serves the entry HTML (curl -> HTTP 200). (2) Drive the game over http://127.0.0.1:<port>/<entry .html file> with Playwright. To sidestep the shared Playwright MCP browser-profile LOCK, write a SELF-CONTAINED throwaway Node script (in your OWN mktemp -d dir) that launches Playwright with an ISOLATED temp profile: resolve the module on this machine (try /opt/homebrew/lib/node_modules/@playwright/test, /opt/homebrew/lib/node_modules/playwright, then the npx cache under ~/.npm/_npx), then \`const ctx = await chromium.launchPersistentContext(fs.mkdtempSync(...), { channel: 'chrome', headless: true, viewport: { width: 560, height: 900 } });\`. Dispatch clicks IN-PAGE (page.evaluate(() => el.click())) — many single-file games re-render the whole DOM on each action and detach live element handles, so held handles go stale. (3) Actually PLAY: at least one full round to a WIN and one to a LOSS, plus the primary controls (restart/next, any board/picker/shuffle), watching for jank, unclear or misleading feedback, dead controls, or broken layout (also check a 375px mobile viewport). (4) Capture 3-6 screenshots into ${ROOT}/reports/assets/${SLUG}/ (the SAME slug the report uses), and name them in your notes — aim for a few DISTINCT game STATES (fresh board, a post-action / mid-cascade frame, a win or game-over state), not many frames of one animation. ANIMATION-CAPTURE REALITY (read this before you try to film a cascade): headless Chromium has NO vsync, so \`requestAnimationFrame\` never fires on its own, and Playwright throttles/pauses background timers BETWEEN tool calls — so you CANNOT capture a multi-frame animation (a cascade, a combo, a shuffle) by "wait then screenshot", and you must NOT burn time trying to force deterministic frame-by-frame capture (fake \`performance.now\` clocks, manual \`setTimeout\` pumps, repeated re-navigations — this exact rabbit hole has sunk >2 hours of a single heartbeat). Trigger the animated action, capture the ONE frame the page happens to show, and rely on the pure per-step frames' UNIT TESTS for animation correctness. The playtest confirms the shell RENDERS, input REGISTERS, text/labels are legible, and console/network are clean — NOT that every animation frame is pixel-perfect. (5) Assert ZERO uncaught console/page errors and ZERO external (non-localhost) network requests during play — an external request would break the offline claim. Also eyeball the rendered text for encoding mojibake (garbled em-dashes/arrows such as "â€"" or "â†'") — the symptom of a missing \`<meta charset="utf-8">\`; the static charset invariant guards it, but a real render is the honest check. Kill the server and the browser when done. Do NOT delete or weaken the static offline-from-disk invariant test — it stays the file:// guard. BUDGET / HARD STOP: this lens is BOUNDED. The moment you have (a) a handful of distinct-state screenshots and (b) the zero-console-error + zero-external-request assertions, you are DONE — stop immediately and report; do NOT keep iterating to improve capture quality or to film a smoother animation. If one capture won't cooperate after ~2 attempts, note it as a non_blocking limitation and move on. Report a blocking_issue for any real feel/interaction defect you can REPRODUCE (a crash, a dead/no-op control, unreadable or misleading feedback, a broken 375px layout), and non_blocking_issues for rough edges. IF Playwright genuinely cannot be driven in THIS environment (module not installed, or the browser will not launch after a real attempt), DEGRADE GRACEFULLY: confirm the server returns HTTP 200 for the entry file AND the static offline scan passes, then return verdict "pass" with a non_blocking note that the interactive playtest could not run here — do NOT hard-fail the heartbeat on a missing/broken browser environment.`])
const verify = () => parallel(verifyLenses.map(([lens, charge]) => () =>
  agent(`${CTX}
You are an adversarial verifier. Lens: ${lens}. Prototype: ${dir}.
Brief: ${JSON.stringify(brief)}
Builder report: ${JSON.stringify(build)}
${charge}
When you create scratch files or folders to exercise the tool, make your OWN fresh per-run temp dir (mktemp -d / tempfile.mkdtemp) unique to this verifier — never a shared or fixed scratch path — because the verifiers run CONCURRENTLY and a shared path cross-contaminates their fixtures and yields false failures (lessons rule 5).
Return verdict "fail" with blocking_issues unless you personally verified the behavior.`,
    { label: `verify:${lens}`, phase: 'Verify', model: M, schema: VERDICT })))

phase('Verify')
let verdicts = (await verify()).filter(Boolean)
let blocking = verdicts.flatMap(v => v.blocking_issues)
const firstRoundIssues = verdicts.flatMap(v => v.blocking_issues.concat(v.non_blocking_issues))

if (blocking.length) {
  log(`${blocking.length} blocking issues -> fix round`)
  build = await agent(`${CTX}
You are the fixer. Prototype: ${dir}. Brief: ${JSON.stringify(brief)}
The design dossier is at ${dossier.dossier_path} — consult it where a fix touches domain behavior. Fix ALL of these blocking issues, run the tests yourself, and commit:
- ${blocking.join('\n- ')}`,
    { label: 'fix', phase: 'Build', model: M, schema: BUILD })
  verdicts = (await verify()).filter(Boolean)
  blocking = verdicts.flatMap(v => v.blocking_issues)
}

const shipped = blocking.length === 0

phase('Coroner')
let coronerResult = null
if (firstRoundIssues.length) {
  coronerResult = await agent(`${CTX}
You are the coroner. These issues were caught during this heartbeat in ${dir}:
- ${firstRoundIssues.join('\n- ')}
For each, generalize the failure CLASS, then add the cheapest durable check that would catch that class automatically next time, in this preference order: (1) a lint rule, invariant, or pre-commit check inside the prototype, (2) a regression test inside the prototype, (3) a generalized rule appended to ${ROOT}/rules/lessons.md (update BOTH the one-line checklist index and the appendix). BUDGET: for each caught failure, the fix plus EXACTLY ONE cheapest durable check — never a family of sibling guards; prefer deepening an existing check over adding a new one, and prefer improving ${ROOT}/templates/ (so every FUTURE prototype starts guarded) over per-prototype accumulation when the class is generic. Deduplicate against existing rules in lessons.md. While there, move any Active rule that has clearly stopped firing across recent heartbeats to the Retired section. COMMIT HYGIENE: commit ONLY prototype-repo changes (inside ${dir}); you may EDIT ${ROOT}/rules/lessons.md and ${ROOT}/templates/ but leave ALL factory-repo files uncommitted — the heartbeat session commits the factory repo in one clean commit.
That is your PRIMARY job — do it fully first. THEN, separately, report status: the following blocking issues were still open after the fix round (may be empty): ${blocking.length ? blocking.map(b => `\n  - ${b}`).join('') : '\n  (none — no blocking issues remained after the fix round)'}
For EACH such issue, decide against the CURRENT committed code whether your coroner work (or the prior fixer) resolved it: list the verbatim issue text under resolved_blocking if it no longer reproduces, or under still_blocking if it still does. If no blocking issues remained, return both lists empty. Do not invent issues that were not listed.`,
    { label: 'coroner', phase: 'Coroner', model: M, schema: CORONER })
} else {
  log('clean heartbeat — no coroner work')
}

// Return value must reflect the POST-coroner truth: the coroner frequently
// commits the fix that resolves the last blocking issue. Fall back to the
// pre-coroner `blocking` only when the coroner did not run (clean heartbeat).
const stillBlocking = coronerResult ? coronerResult.still_blocking : blocking

phase('Record')
await agent(`${CTX}
You are the scribe. Record this heartbeat:
- mode: ${MODE}, prototype: ${brief.prototype_dir}, title: ${brief.title}
- shipped as of the PRE-CORONER verify (all verifiers passed then): ${shipped}${shipped ? '' : `; blocking issues at that point: ${blocking.join('; ')}`}
- builder summary (PRE-CORONER — may be stale): ${JSON.stringify(build && build.summary)}
The coroner runs AFTER the builder and may have changed tests, sample data, or output — so the builder summary's figures (test totals, row/dollar counts, example output) can be out of date. Before writing anything, re-run the prototype's own test command and its cold-start run command yourself, and record the ACTUAL final numbers you observe. Never copy a count or sample figure from the builder summary without confirming it against the committed code. The shipped flag and blocking issues above are ALSO pre-coroner: the coroner frequently RESOLVES the last blocking issue itself by committing the fix/guard, which flips the true status to shipped. So do not copy that flag either — reproduce EACH listed blocking issue against the CURRENT committed code, and record the run as shipped (noting the coroner resolved it) when none still reproduce, or as still-blocked only for issues you can personally still reproduce.
1. First decide this prototype's status on the FACTORY.md ladder — one of exactly idea/v0/v1/polish — from what actually shipped this run. You will use this ONE status value in the ledger heading, the INDEX row, AND status.json, and they MUST match. Then append EXACTLY ONE entry to ${ROOT}/state/ledger.md — this run's, with a heading in EXACTLY this format (a real status, never a placeholder word like "prototype", "new", or "shipped"; NEVER fabricate or backfill an entry for any other timestamp or any other run's work):
   ## ${TS} — ${MODE} — ${brief.prototype_dir} (<status>)
   and follow the heading with: what was done, verified-or-not, and open issues.
2. Update the prototype's row in ${ROOT}/portfolio/INDEX.md using the SAME status (type app/game, status, one-line problem description, next step). If this run SHIPPED a feature that the row's "next step" column previously listed as future work, move it into the description — a shipped capability must not linger advertised as an idea (lessons rule 24).
3. Update ${ROOT}/portfolio/dashboard.html so it matches INDEX.md and the ledger — keep its existing style and structure, edit content only (see the card template comment inside it). Refresh EVERY dynamic region, not just the card: (a) the three STATS numbers (prototypes / at-v1-or-beyond / heartbeats-run — the last equals the ledger entry count); (b) this prototype's card — its status pill, description, next-step to match INDEX.md, its href pointed at this run's report file ${ROOT}/reports/${SLUG}-${brief.prototype_dir}.html (the heartbeat session writes that report right after this workflow returns, so the link is valid by the time anyone clicks it), AND its <div class="meta"> line: set the bolded heartbeat count to this prototype's number of ledger entries (headings naming it) INCLUDING this run's just-appended entry, and the "updated" date to the YYYY-MM-DD of ${TS} (use "heartbeat" singular when the count is 1) — a card you touch this run is the one whose count just went up, so it MUST be incremented; and (c) the footer's "Last heartbeat:" stamp, set to ${TS}. Coherence check before finishing: the per-card meta counts across ALL cards must sum to the "heartbeats-run" STAT (both equal the ledger entry count). Regions (b's meta line) and (c) are neither a plain stat nor the card's prose, so they are the regions most often left stale — set them every run.
4. Update ${ROOT}/state/status.json — the machine-readable catalog the hub serves and heartbeats read for mode/target selection. Set this prototype's status to the SAME value, set last_advanced to ${TS}, refresh its one_liner/next_step/report fields, and keep entry (games: the entry .html file) / demo (apps: the safe demo command over the bundled sample) correct. Update the top-level "updated" stamp. Validate it parses as JSON before finishing.`,
  { label: 'scribe', phase: 'Record', model: M })

phase('Ingest')
const ingest = await agent(`${CTX}
You are the wiki librarian. Read ${ROOT}/wiki/WIKI.md and follow its Ingest workflow exactly. Compound this heartbeat's research into the wiki:
- The design dossier at ${dossier.dossier_path} (the primary source — its findings, sources, and any content-payload knowledge).
${MODE === 'new' ? `- The ideation concepts and validation findings from this run (JSON): ${JSON.stringify({ concepts: ideationOut, validations: validationOut })} — unbuilt-but-validated knowledge (prior art, resonance evidence, killed ideas and WHY they died) is exactly what compounds: it feeds future ideation.` : `- Any domain knowledge this improve run surfaced (from the dossier, the build, or verification) that the wiki does not yet hold.`}
- Update the prototype page ${ROOT}/wiki/prototype-${brief.prototype_dir}.md (create it from the schema if this is a new prototype).
Touch every page the material genuinely concerns, cross-link both directions, note contradictions explicitly, update index.md, and append one entry to log.md. SCOPE GUARD: the wiki holds PRODUCT and DOMAIN knowledge only — engineering process lessons stay in ${ROOT}/rules/lessons.md. Do not commit — the heartbeat session commits the factory repo.`,
  { label: 'ingest', phase: 'Ingest', model: M, schema: INGEST })

return {
  mode: MODE, prototype: brief.prototype_dir, title: brief.title,
  shipped: stillBlocking.length === 0, openIssues: stillBlocking,
  dossier: dossier.dossier_path,
  wiki: { created: ingest ? ingest.pages_created : [], updated: ingest ? ingest.pages_updated : [] },
}
