// Static invariants on the shipped single-file HTML artifact.
// Builder: require/inline these checks from your test_core.js (pass your entry
// filename). Both scans carry non-vacuous self-checks — copy that discipline.
//
//   offline-from-disk scan (lessons r.14): the game must open at file:// with
//   zero network — no fetch/XHR, no ESM modules, no external-host src/href.
//   dead-code scan (lessons r.21): every declared function in the inline UI
//   script must be referenced somewhere else (bundler-less files rot silently).

const fs = require('fs')

function stripComments(src) {
  return src.replace(/<!--[\s\S]*?-->/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1')
}

function offlineViolations(html) {
  const s = stripComments(html)
  const v = []
  if (/fetch\s*\(/.test(s)) v.push('fetch( call')
  if (/XMLHttpRequest/.test(s)) v.push('XMLHttpRequest')
  if (/<script[^>]+type\s*=\s*["']module["']/.test(s)) v.push('ESM module script')
  if (/^\s*import\s+[\w{*]/m.test(s)) v.push('bare ESM import')
  const ext = s.match(/(?:src|href)\s*=\s*["'](?:https?:)?\/\/[^"']+["']/g)
  if (ext) v.push(...ext.map(m => `external ref ${m}`))
  return v
}

function charsetViolation(html) {
  // Mojibake guard: a single-file game that ships non-ASCII text (em/en dashes,
  // arrows, accented labels) MUST declare <meta charset="utf-8"> near the top —
  // otherwise a browser opening it (especially from file://) guesses the encoding
  // and can render UTF-8 bytes as Latin-1 garble ("— " -> "â€" "). Pure-ASCII
  // files need no declaration. The charset must fall in the first ~1KB to apply.
  if (!/[^\x00-\x7F]/.test(html)) return null
  const head = html.slice(0, 1024)
  const declared = /<meta\s+charset\s*=\s*["']?utf-8["']?\s*\/?>/i.test(head) ||
    /<meta\s+http-equiv\s*=\s*["']content-type["'][^>]*charset\s*=\s*utf-8/i.test(head)
  return declared ? null : 'ships non-ASCII text but declares no <meta charset="utf-8"> in the first 1KB'
}

function deadFunctions(html) {
  const m = stripComments(html).match(/<script[^>]*>([\s\S]*?)<\/script>/g) || []
  const script = m.join('\n')
  const dead = []
  for (const decl of script.matchAll(/function\s+([A-Za-z_$][\w$]*)\s*\(/g)) {
    const name = decl[1]
    const uses = (script.match(new RegExp(`\\b${name}\\b`, 'g')) || []).length
    if (uses <= 1) dead.push(name) // only its own declaration
  }
  return dead
}

function selfCheck() {
  // Non-vacuous: the scans must FLAG obvious offenders and PASS clean input.
  const bad = '<script>fetch("x"); function unused(){}<\/script><script src="https://cdn.example/x.js"><\/script>'
  const good = '<script>function used(){} used();<\/script>'
  if (!offlineViolations(bad).length) throw new Error('offline scan is vacuous')
  if (offlineViolations(good).length) throw new Error('offline scan over-reaches')
  if (!deadFunctions(bad).includes('unused')) throw new Error('dead-code scan is vacuous')
  if (deadFunctions(good).length) throw new Error('dead-code scan over-reaches')
  // Charset scan: non-ASCII without a meta is flagged; with an early meta, or
  // pure-ASCII, it is not; a late meta (past 1KB) is still flagged.
  if (!charsetViolation('<title>a — b</title>')) throw new Error('charset scan is vacuous')
  if (charsetViolation('<meta charset="utf-8"><title>a — b</title>')) throw new Error('charset scan over-reaches (early meta)')
  if (charsetViolation('<title>plain ascii</title>')) throw new Error('charset scan over-reaches (pure ASCII)')
  if (!charsetViolation('<title>a — b</title>' + ' '.repeat(1100) + '<meta charset="utf-8">')) throw new Error('charset scan misses a too-late meta')
}

function runStaticInvariants(entryHtmlPath) {
  selfCheck()
  const html = fs.readFileSync(entryHtmlPath, 'utf8')
  const off = offlineViolations(html)
  if (off.length) throw new Error(`offline-from-disk invariant violated: ${off.join('; ')}`)
  const dead = deadFunctions(html)
  if (dead.length) throw new Error(`dead functions in inline UI script: ${dead.join(', ')}`)
  const charset = charsetViolation(html)
  if (charset) throw new Error(`charset invariant violated: ${charset}`)
  return true
}

module.exports = { runStaticInvariants, offlineViolations, deadFunctions, charsetViolation, stripComments }
