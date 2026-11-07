#!/usr/bin/env python3
"""Spike-only file receiver (localhost, allowlisted names). Not part of any deliverable.
POST /save?dest=docs|out|root&name=<file>  body = raw bytes. Port 8792, origin 8702 only.
"""
import http.server, re, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
DEST = {
    "docs": os.path.abspath(os.path.join(HERE, "..", "..", "docs", "research", "direction", "spikes")),
    "out": os.path.join(HERE, "out"),
    "root": HERE,
}
NAME_RE = re.compile(r"^[a-z0-9][a-z0-9._-]{0,63}\.(webp|png|jpg|json|txt)$")
ORIGIN = "http://localhost:8702"
MAX = 8 * 1024 * 1024

class H(http.server.BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", ORIGIN)
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "content-type")
    def do_OPTIONS(self):
        self.send_response(204); self._cors(); self.end_headers()
    def do_POST(self):
        from urllib.parse import urlparse, parse_qs
        q = parse_qs(urlparse(self.path).query)
        dest = (q.get("dest") or [""])[0]; name = (q.get("name") or [""])[0]
        n = int(self.headers.get("content-length", "0"))
        if dest not in DEST or not NAME_RE.match(name) or n <= 0 or n > MAX:
            self.send_response(400); self._cors(); self.end_headers(); self.wfile.write(b"bad request"); return
        body = self.rfile.read(n)
        path = os.path.join(DEST[dest], name)
        with open(path, "wb") as f: f.write(body)
        self.send_response(200); self._cors(); self.end_headers(); self.wfile.write(("saved %s %d" % (path, n)).encode())
    def log_message(self, fmt, *a): sys.stderr.write("recv: " + fmt % a + "\n")

if __name__ == "__main__":
    http.server.ThreadingHTTPServer(("127.0.0.1", 8792), H).serve_forever()
