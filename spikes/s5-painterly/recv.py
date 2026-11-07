#!/usr/bin/env python3
"""Spike-only localhost helper for S5 (not a deliverable).
GET  /src/<name>                         serves an allowlisted source image from the session scratchpad (downloads stay out of the repo).
POST /save?dest=docs|out|scratch&name=<file>   body = raw bytes; writes one allowlisted file.
Port 8796; CORS only for the spike page origin (port 8706).
"""
import http.server, re, os, sys
from urllib.parse import urlparse, parse_qs
HERE = os.path.dirname(os.path.abspath(__file__))
SCRATCH = os.environ.get("SCRATCH", os.path.join(os.environ.get("TMPDIR", "/tmp"), "s5"))  # the session scratchpad
DEST = {
    "docs": os.path.abspath(os.path.join(HERE, "..", "..", "docs", "research", "direction", "spikes")),
    "out": os.path.join(HERE, "out"),
    "scratch": os.path.join(SCRATCH, "out"),
}
SAVE_RE = re.compile(r"^[a-z0-9][a-z0-9._-]{0,80}\.(webp|png|jpg|json|txt|bin)$")
DOCS_RE = re.compile(r"^s5-[a-z0-9._-]{1,80}\.(webp|png|jpg)$")
SRC_RE = re.compile(r"^[a-z0-9][a-z0-9._-]{0,80}\.(jpg|png|webp)$")
ORIGINS = {"http://127.0.0.1:8706", "http://localhost:8706"}
MAX = 64 * 1024 * 1024

class H(http.server.BaseHTTPRequestHandler):
    def _cors(self):
        o = self.headers.get("Origin", "")
        if o in ORIGINS:
            self.send_header("Access-Control-Allow-Origin", o)
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "content-type")
        self.send_header("Cache-Control", "no-store")
    def do_OPTIONS(self):
        self.send_response(204); self._cors(); self.end_headers()
    def do_GET(self):
        p = urlparse(self.path).path
        name = p[len("/src/"):] if p.startswith("/src/") else ""
        path = os.path.join(SCRATCH, name)
        if not SRC_RE.match(name) or not os.path.isfile(path):
            self.send_response(404); self._cors(); self.end_headers(); return
        data = open(path, "rb").read()
        ext = name.rsplit(".", 1)[1]
        self.send_response(200); self._cors()
        self.send_header("Content-Type", {"jpg": "image/jpeg", "png": "image/png", "webp": "image/webp"}[ext])
        self.send_header("Content-Length", str(len(data))); self.end_headers(); self.wfile.write(data)
    def do_POST(self):
        q = parse_qs(urlparse(self.path).query)
        dest = (q.get("dest") or [""])[0]; name = (q.get("name") or [""])[0]
        n = int(self.headers.get("content-length", "0"))
        ok = dest in DEST and SAVE_RE.match(name) and 0 < n <= MAX and (dest != "docs" or DOCS_RE.match(name))
        if not ok:
            self.send_response(400); self._cors(); self.end_headers(); self.wfile.write(b"bad request"); return
        body = self.rfile.read(n)
        path = os.path.join(DEST[dest], name)
        with open(path, "wb") as f: f.write(body)
        self.send_response(200); self._cors(); self.end_headers(); self.wfile.write(("saved %s %d" % (path, n)).encode())
    def log_message(self, fmt, *a): sys.stderr.write("recv: " + fmt % a + "\n")

if __name__ == "__main__":
    http.server.ThreadingHTTPServer(("127.0.0.1", 8796), H).serve_forever()
