#!/usr/bin/env python3
"""The Factory Hub — a local portal to everything the factory has built.

One stdlib server, one browser tab (http://127.0.0.1:7777):
  - games play directly in the browser (served from their prototype folders)
  - apps run their demo command over the bundled sample at the click of a button
  - every prototype links to its latest heartbeat report and README

Data source: state/status.json (maintained by the workflow scribe every
heartbeat). Prototypes never know the hub exists; the hub only reads them.
Local-only by design: binds 127.0.0.1, and the only commands it will run are
the demo commands curated in status.json — never anything from the request.
"""

import html
import json
import mimetypes
import os
import re
import subprocess
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

HUB_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HUB_DIR)
PORTFOLIO = os.path.join(ROOT, "portfolio")
REPORTS = os.path.join(ROOT, "reports")
STATUS_JSON = os.path.join(ROOT, "state", "status.json")
HOST, PORT = "127.0.0.1", 7777
DEMO_TIMEOUT_S = 60

SAFE_NAME = re.compile(r"^[a-z0-9][a-z0-9-]*$")


def load_status():
    with open(STATUS_JSON, encoding="utf-8") as f:
        return json.load(f)


def heartbeat_count():
    try:
        with open(os.path.join(ROOT, "state", "ledger.md"), encoding="utf-8") as f:
            return sum(1 for line in f if line.startswith("## "))
    except OSError:
        return 0


def safe_join(base, rel):
    """Resolve rel under base; return None on any traversal escape."""
    target = os.path.realpath(os.path.join(base, rel.lstrip("/")))
    base = os.path.realpath(base)
    if target == base or target.startswith(base + os.sep):
        return target
    return None


STYLE = """
:root { --bg:#0f1115; --surface:#181b22; --border:#2a2f3a; --text:#e8eaf0;
        --muted:#9aa3b2; --accent:#f5a623; --good:#4cc38a; --play:#7c9cff; }
* { box-sizing:border-box; margin:0; }
body { background:var(--bg); color:var(--text);
       font:16px/1.55 -apple-system,"Segoe UI",sans-serif; padding:40px 24px; }
main { max-width:980px; margin:0 auto; }
h1 { font-size:28px; letter-spacing:-0.02em; }
header p { color:var(--muted); margin-top:4px; }
.stats { display:flex; gap:16px; margin:24px 0; flex-wrap:wrap; }
.stat { background:var(--surface); border:1px solid var(--border);
        border-radius:10px; padding:12px 18px; min-width:130px; }
.stat b { display:block; font-size:24px; }
.stat span { color:var(--muted); font-size:13px; }
.grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:16px; }
.card { background:var(--surface); border:1px solid var(--border);
        border-radius:10px; padding:18px; display:flex; flex-direction:column; }
.card .type { float:right; font-size:12px; color:var(--muted); }
.card h2 { font-size:17px; }
.status { display:inline-block; font-size:12px; padding:2px 10px; border-radius:999px;
          border:1px solid var(--border); color:var(--muted); margin:8px 0; width:fit-content; }
.status.v0 { color:var(--accent); border-color:var(--accent); }
.status.v1, .status.polish { color:var(--good); border-color:var(--good); }
.card p { color:var(--muted); font-size:14px; flex:1; }
.actions { margin-top:14px; display:flex; gap:8px; flex-wrap:wrap; }
.btn { font-size:13.5px; padding:6px 14px; border-radius:8px; border:1px solid var(--border);
       background:transparent; color:var(--text); text-decoration:none; cursor:pointer; }
.btn.primary { background:var(--play); border-color:var(--play); color:#0f1115; font-weight:600; }
.btn:hover { border-color:var(--accent); }
pre.demo-out { background:#0b0d11; border:1px solid var(--border); border-radius:8px;
               padding:12px; margin-top:12px; font:12.5px/1.5 ui-monospace,Menlo,monospace;
               white-space:pre-wrap; overflow-x:auto; max-height:340px; overflow-y:auto;
               color:#c9d4e8; display:none; }
footer { margin-top:36px; color:var(--muted); font-size:13px; }
footer a { color:var(--accent); text-decoration:none; }
"""

SCRIPT = """
async function runDemo(name, btn) {
  const out = document.getElementById('out-' + name);
  out.style.display = 'block';
  out.textContent = 'running ' + name + ' demo\\u2026';
  btn.disabled = true;
  try {
    const r = await fetch('/api/demo/' + name, { method: 'POST' });
    const j = await r.json();
    out.textContent = j.ok
      ? ('$ ' + j.command + '\\n\\n' + j.stdout + (j.stderr ? '\\n[stderr]\\n' + j.stderr : ''))
      : ('demo failed (exit ' + j.exit + ')\\n' + (j.stderr || j.error || ''));
  } catch (e) { out.textContent = 'request failed: ' + e; }
  btn.disabled = false;
}
"""


def render_home():
    status = load_status()
    protos = status.get("prototypes", [])
    n_v1 = sum(1 for p in protos if p["status"] in ("v1", "polish"))
    cards = []
    for p in protos:
        name, e = p["name"], html.escape
        actions = []
        if p.get("entry"):
            actions.append(f'<a class="btn primary" href="/p/{e(name)}/{e(p["entry"])}" target="_blank">▶ Play</a>')
        if p.get("demo"):
            actions.append(f'<button class="btn primary" onclick="runDemo(\'{e(name)}\', this)">▶ Try it</button>')
        if p.get("report"):
            actions.append(f'<a class="btn" href="/reports/{e(p["report"])}" target="_blank">Report</a>')
        actions.append(f'<a class="btn" href="/p/{e(name)}/README.md" target="_blank">README</a>')
        cards.append(f'''
    <div class="card">
      <span class="type">{e(p["type"])}</span>
      <h2>{e(name)}</h2>
      <span class="status {e(p["status"])}">{e(p["status"])}</span>
      <p>{e(p["one_liner"])}</p>
      <div class="actions">{''.join(actions)}</div>
      <pre class="demo-out" id="out-{e(name)}"></pre>
    </div>''')
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Factory Hub</title>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg' viewBox='0 0 16 16'%3E%3Ctext y='13' font-size='13'%3E%F0%9F%8F%AD%3C/text%3E%3C/svg%3E">
<style>{STYLE}</style></head>
<body><main>
  <header><h1>🏭 Factory Hub</h1>
  <p>Everything the factory has built — play it, try it, read about it. Served locally from your machine.</p></header>
  <section class="stats">
    <div class="stat"><b>{len(protos)}</b><span>prototypes</span></div>
    <div class="stat"><b>{n_v1}</b><span>at v1 or beyond</span></div>
    <div class="stat"><b>{heartbeat_count()}</b><span>heartbeats run</span></div>
  </section>
  <section class="grid">{''.join(cards)}
  </section>
  <footer>Updated {html.escape(status.get("updated", "?"))} ·
    <a href="/reports/index.html">All heartbeat reports</a> ·
    <a href="/api/status">status.json</a> ·
    Source of truth: portfolio/INDEX.md</footer>
</main><script>{SCRIPT}</script></body></html>'''


class HubHandler(BaseHTTPRequestHandler):
    server_version = "FactoryHub/1.0"

    def log_message(self, fmt, *a):  # quiet: one line, no noise
        print("[hub]", self.address_string(), fmt % a)

    def _send(self, code, body, ctype="text/html; charset=utf-8"):
        data = body if isinstance(body, bytes) else body.encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)

    def _send_file(self, path):
        ctype = mimetypes.guess_type(path)[0] or "application/octet-stream"
        if ctype.startswith("text/") or ctype in ("application/javascript", "application/json"):
            ctype += "; charset=utf-8"
        try:
            with open(path, "rb") as f:
                self._send(200, f.read(), ctype)
        except OSError:
            self._send(404, "not found", "text/plain; charset=utf-8")

    def do_GET(self):
        path = self.path.split("?", 1)[0]
        if path in ("/", "/index.html"):
            try:
                return self._send(200, render_home())
            except Exception as exc:  # a broken status.json shouldn't 500 silently
                return self._send(500, f"hub error: {html.escape(str(exc))}", "text/plain; charset=utf-8")
        if path == "/api/status":
            try:
                with open(STATUS_JSON, encoding="utf-8") as f:
                    return self._send(200, f.read(), "application/json; charset=utf-8")
            except OSError:
                return self._send(404, "{}", "application/json; charset=utf-8")
        if path.startswith("/p/"):
            rel = path[len("/p/"):]
            name = rel.split("/", 1)[0]
            if not SAFE_NAME.match(name or ""):
                return self._send(400, "bad prototype name", "text/plain; charset=utf-8")
            target = safe_join(PORTFOLIO, rel)
            if target and os.path.isdir(target):
                target = os.path.join(target, "index.html")
            if target and os.path.isfile(target):
                return self._send_file(target)
            return self._send(404, "not found", "text/plain; charset=utf-8")
        if path.startswith("/reports/"):
            target = safe_join(REPORTS, path[len("/reports/"):])
            if target and os.path.isfile(target):
                return self._send_file(target)
            return self._send(404, "not found", "text/plain; charset=utf-8")
        return self._send(404, "not found", "text/plain; charset=utf-8")

    def do_POST(self):
        path = self.path.split("?", 1)[0]
        if not path.startswith("/api/demo/"):
            return self._send(404, '{"error":"not found"}', "application/json; charset=utf-8")
        name = path[len("/api/demo/"):]
        try:
            protos = {p["name"]: p for p in load_status().get("prototypes", [])}
        except Exception as exc:
            return self._send(500, json.dumps({"ok": False, "exit": -1, "error": f"status.json unreadable: {exc}"}),
                              "application/json; charset=utf-8")
        p = protos.get(name)
        if not p or not p.get("demo") or not SAFE_NAME.match(name):
            return self._send(404, json.dumps({"ok": False, "exit": -1, "error": "no demo for that prototype"}),
                              "application/json; charset=utf-8")
        cwd = os.path.join(PORTFOLIO, name)
        try:
            # Only the curated command from status.json ever runs — nothing from the request.
            proc = subprocess.run(["bash", "-lc", p["demo"]], cwd=cwd, timeout=DEMO_TIMEOUT_S,
                                  capture_output=True, text=True)
            body = {"ok": proc.returncode == 0, "exit": proc.returncode, "command": p["demo"],
                    "stdout": proc.stdout[-20000:], "stderr": proc.stderr[-4000:]}
        except subprocess.TimeoutExpired:
            body = {"ok": False, "exit": -1, "command": p["demo"], "error": f"timed out after {DEMO_TIMEOUT_S}s"}
        except OSError as exc:
            body = {"ok": False, "exit": -1, "command": p["demo"], "error": str(exc)}
        return self._send(200, json.dumps(body), "application/json; charset=utf-8")


def main():
    server = ThreadingHTTPServer((HOST, PORT), HubHandler)
    print(f"Factory Hub → http://{HOST}:{PORT}  (Ctrl-C to stop)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nhub stopped")


if __name__ == "__main__":
    main()
