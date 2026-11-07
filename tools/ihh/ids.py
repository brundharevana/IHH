"""Record ids namespaced by the inductee code (SPEC section 2).

    <CODE>-F-0001  fact      <CODE>-S-0001  source
    <CODE>-M-0001  media     <CODE>-Q-0001  search

Ids are never reused, even after rejection. Rejected records stay in their file,
so the next id is one past the highest number already present for that code and
kind. Numbers are zero-padded to four digits and grow past 9999 if needed.
"""

import re

KIND_LETTERS = {"fact": "F", "source": "S", "media": "M", "search": "Q"}
LETTER_KINDS = {v: k for k, v in KIND_LETTERS.items()}
ID_RE = re.compile(r"^(?P<code>[A-Z]{3})-(?P<letter>[FSMQ])-(?P<num>\d{4,})$")


def letter(kind):
    """Accept a kind name ('fact') or its letter ('F'); return the letter."""
    if kind in LETTER_KINDS:
        return kind
    if kind in KIND_LETTERS:
        return KIND_LETTERS[kind]
    raise ValueError(f"unknown record kind {kind!r}")


def format_id(code, kind, number):
    return f"{code}-{letter(kind)}-{number:04d}"


def parse_id(value):
    """Return (code, letter, number) for a well-formed id, else None."""
    if not isinstance(value, str):
        return None
    m = ID_RE.match(value)
    if not m:
        return None
    return m.group("code"), m.group("letter"), int(m.group("num"))


def is_id(value, code=None, kind=None):
    parsed = parse_id(value)
    if parsed is None:
        return False
    if code is not None and parsed[0] != code:
        return False
    if kind is not None and parsed[1] != letter(kind):
        return False
    return True


def kind_of(value):
    """'fact', 'source', 'media' or 'search' for a well-formed id, else None."""
    parsed = parse_id(value)
    return LETTER_KINDS[parsed[1]] if parsed else None


def next_ids(code, kind, existing, count):
    want = letter(kind)
    high = 0
    for value in existing:
        parsed = parse_id(value)
        if parsed and parsed[0] == code and parsed[1] == want:
            high = max(high, parsed[2])
    return [format_id(code, want, high + i) for i in range(1, count + 1)]


def next_id(code, kind, existing):
    return next_ids(code, kind, existing, 1)[0]
