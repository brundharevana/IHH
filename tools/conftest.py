"""Pytest setup for the tools suite.

Run from the repository root with `python3 -m pytest tools`. The command-line
tools live directly in tools/ and import the `ihh` package from there, so the
tests need tools/ (for the tools and the package) and tools/tests/ (for the
shared fake-data builders) on sys.path regardless of the import mode.
"""

import sys
from pathlib import Path

TOOLS = Path(__file__).resolve().parent
for entry in (TOOLS, TOOLS / "tests"):
    if str(entry) not in sys.path:
        sys.path.insert(0, str(entry))
