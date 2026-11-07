"""Atomic writes of whole text files (snapshots, exports, rewritten staging files).

Same guarantees as records.write_jsonl: an exclusive lock on the containing
folder, then a temporary file in that folder that is flushed, synced and moved
over the target with os.replace, so readers never see a partial file.
"""

from . import records

BOM = "\N{ZERO WIDTH NO-BREAK SPACE}"


def write_text(path, text, encoding="utf-8"):
    """Write text atomically. encoding='utf-8-sig' adds a byte order mark (for spreadsheets)."""
    if encoding == "utf-8-sig" and not text.startswith(BOM):
        text = BOM + text
    with records.locked(path):
        records._atomic_write(path, text)
