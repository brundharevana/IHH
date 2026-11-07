"""G8: a review state that publishes must be on record (SPEC sections 4 and 8).

review.state `approved` or `edited` is what lets tools/export.py publish a
fact or media item. The state alone is a field anyone can write, so it counts
only when review/decisions.jsonl holds the decision that set it: the latest
approve, edit or reject decision for the item must be the matching action, by
the same reviewer on the same date, and about the content as it is now. For a
fact, an approval's `before` and an edit's `after` must equal the current claim
after normalization; for a media item, an approval's `before` must be the
item's media_lock_sha256 (ihh.gates), the fingerprint of the fields the
reviewer saw, and an edit's `after` must equal the current alt text. A decision that does not name the content (no `before`) backs
nothing, because a later change to the claim or the media fields could not be
told apart from what was approved. tools/apply_review.py writes such decisions.
"""

from .gates import media_lock_sha256
from .normalize import normalize_text

PUBLISHING = ("approved", "edited")
_DECIDING = ("approve", "edit", "reject")
_ACTION_FOR = {"approved": "approve", "edited": "edit"}


def backing_problems(rec, kind, decisions):
    """Why rec's publishing review state is not backed by decisions; [] if it is (or it does not publish)."""
    review = rec.get("review") if isinstance(rec.get("review"), dict) else {}
    state = review.get("state")
    if state not in PUBLISHING:
        return []
    rid = rec.get("id")
    mine = [d for d in decisions if isinstance(d, dict) and d.get("item_id") == rid
            and d.get("action") in _DECIDING]
    who = f"{review.get('reviewer')} on {review.get('date')}"
    if not mine:
        return [f"review {state} by {who} has no matching decision in review/decisions.jsonl; "
                f"record reviews with tools/apply_review.py"]
    last = mine[-1]
    out = []
    if last.get("action") != _ACTION_FOR[state]:
        out.append(f"review {state}, but the latest decision in review/decisions.jsonl is "
                   f"{last.get('action')!r} by {last.get('reviewer')} on {last.get('date')}")
        return out
    if last.get("reviewer") != review.get("reviewer") or last.get("date") != review.get("date"):
        out.append(f"review {state} by {who}, but the decision on record is by {last.get('reviewer')} on "
                   f"{last.get('date')}")
    if kind == "fact":
        claim = normalize_text(rec.get("claim") if isinstance(rec.get("claim"), str) else "")
        key = "before" if state == "approved" else "after"
        value = last.get(key)
        if not isinstance(value, str):
            what = "approval" if state == "approved" else "edit"
            out.append(f"the {what} decision on record has no `{key}` claim, so it is not tied to the current "
                       f"claim; record the claim the reviewer saw (tools/apply_review.py does)")
        elif normalize_text(value) != claim:
            out.append(f"the decision on record is about other wording ({key} {value!r}), not the current claim")
    elif kind == "media" and state == "edited":
        # an edit corrects the alt text (tools/apply_review.py); its `after` must be the alt text as it is
        # now. The other locked fields (title, rights, sources) are covered by the adversary verdict the
        # edited item must earn again before it is verified (its judged fingerprint covers them).
        value = last.get("after")
        alt = normalize_text(rec.get("alt_text") if isinstance(rec.get("alt_text"), str) else "")
        if not isinstance(value, str):
            out.append("the edit decision on record has no `after` alt text, so it is not tied to the current "
                       "alt text; record edits with tools/apply_review.py")
        elif normalize_text(value) != alt:
            out.append(f"the edit decision on record is about other alt text (after {value!r}), not the current one")
    elif kind == "media":
        lock = media_lock_sha256(rec)
        value = last.get("before")
        if not isinstance(value, str):
            out.append("the approval decision on record has no `before` (the media_lock_sha256 of the item the "
                       "reviewer saw), so it is not tied to the current title, alt text and rights fields; "
                       "record approvals with tools/apply_review.py")
        elif value != lock:
            out.append("the item changed after the reviewer approved it (title, alt text, rights or source "
                       "fields: the media_lock_sha256 on record differs); it needs a new review")
    return out


def backing_decision(rec, kind, decisions, slug):
    """(id, date) of the decision that backs rec's approved or edited review state, else None.

    The id names the decision by its place in the log: "<slug>:decisions:<n>", n the 1-based row of
    review/decisions.jsonl (the numbering validate.py uses in its messages). It is the latest deciding
    row for the item, and only when backing_problems finds nothing wrong with it."""
    if backing_problems(rec, kind, decisions):
        return None
    rid = rec.get("id")
    rows = [(n, d) for n, d in enumerate(decisions, 1)
            if isinstance(d, dict) and d.get("item_id") == rid and d.get("action") in _DECIDING]
    if not rows:
        return None
    n, last = rows[-1]
    return f"{slug}:decisions:{n}", last.get("date")


__all__ = ["backing_problems", "backing_decision", "PUBLISHING"]
