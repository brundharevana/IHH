"""No committed file carries an absolute home-directory path, plain or encoded in a session folder name (Codex Task 19 Medium): e2e scripts,
tools, docs and data resolve paths relative to the repository or from an environment variable, so a
clean checkout on another machine runs them and no username leaks. Binary files count too (Blender
writes the .blend path into a PNG preview's text chunk)."""
import subprocess
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]


# built here so this file does not match itself
# the literal forms, and the encoded form a session folder carries (a dash, "Users", a dash, the name)
HOME_PATHS = ["/" + "Users/", "/" + "home/[a-z]", "-" + "Users-", "/private/" + "tmp/claude"]


def test_no_absolute_home_paths_in_tracked_files():
    args = [x for p in HOME_PATHS for x in ("-e", p)]
    out = subprocess.run(["git", "grep", "-l", *args], cwd=REPO, capture_output=True, text=True)
    assert out.returncode in (0, 1), out.stderr
    assert out.stdout.split("\n") == [""], f"absolute home paths in: {out.stdout}"
