#!/usr/bin/env python3
"""Spike harness: python3 -m http.server with Cache-Control: no-store so edited modules are always re-read. Run from the spikes folder."""
import http.server, sys
class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store"); super().end_headers()
    def log_message(self, fmt, *a): sys.stderr.write("http: " + fmt % a + "\n")
if __name__ == "__main__":
    http.server.ThreadingHTTPServer(("127.0.0.1", 8702), H).serve_forever()
