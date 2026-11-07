"""Apply reviewer decisions to facts and media (SPEC sections 4 (G8), 6 and 8).

    python3 tools/apply_review.py <slug> <decisions.jsonl> [--dry-run] [--data-dir DIR]

Each line of the decisions file is
    {"date": "YYYY-MM-DD", "reviewer": "...", "item_id": "LAM-F-0007",
     "action": "approve" | "edit" | "reject" | "note", "before": ..., "after": ..., "note": "..."}

  approve  review.state -> approved. Only a `verified` item can be approved:
           approval never overrides the gates. `before` (if given) must be the
           content the reviewer saw: for a fact the current claim, for a media
           item its current media_lock_sha256 (ihh.gates; the fingerprint of its
           title, alt text, rights and source fields). The logged decision
           always carries that content, so G8 ties the approval to it and a
           later change to the claim or the media fields needs a new review.
  edit     a fact: claim -> `after`; a media item: alt_text -> `after` (the
           description of what the image shows; its rights, title and sources
           are never edited here). review.state -> edited. `before` (if given)
           must equal the current claim (fact) or alt text (media). The edit
           drops the item to
           re-verification (G8): the adversary verdict, which judged the old
           wording, is cleared and summarized in notes with the old text, and
           verified_claim_sha256 is cleared, so compute_status.py no longer counts
           it verified. A conflicting item is reopened as pending. The new text
           must then pass the gates and get a new adversary verdict before it can
           be exported. Rejected items cannot be edited (ids are never reused;
           stage a new candidate instead).
  reject   status -> rejected (a person may set it), review.state -> rejected.
  note     appends "<date> <reviewer>: <note>" to review.note; nothing else changes.

Decisions are applied in file order, so a later decision about the same item
wins. They are applied all or nothing: if any decision is invalid or refused,
nothing is written. A decision whose effect is already present is reported as
already applied, so the same file can be applied again safely.

Applied decisions are appended to review/decisions.jsonl (with `before` filled
in) unless that file is the one being applied. A review log applied as written
(the dashboard flow) must itself give `before` for each approval; G8 does not
count an approval without it, and the tool warns about such rows. Afterwards statuses are derived
again with tools/compute_status.py. A fact that is edited or rejected while a
draft cites it blocks the final export until the draft is revised (validate.py
reports it); the tool prints those draft locations.

Exit codes: 0 applied (or already applied), 1 a decision was refused or the file
is invalid (nothing written), 2 usage error or unknown slug.
"""

import argparse
import copy
import datetime
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

import compute_status
from ihh import gates, paths, records
from ihh.normalize import normalize_text

ACTIONS = ("approve", "edit", "reject", "note")
_ISO_DAY = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def _iso_day(value):
    if not isinstance(value, str) or not _ISO_DAY.match(value):
        return False
    try:
        datetime.date.fromisoformat(value)
    except ValueError:
        return False
    return True


def _text(value):
    return isinstance(value, str) and bool(value.strip())


@dataclass
class Outcome:
    number: int
    decision: dict
    result: str          # applied, already, refused
    message: str
    log: dict | None = None
    warnings: list = field(default_factory=list)


def decision_problems(d):
    """Schema problems with one decision line."""
    if not isinstance(d, dict):
        return ["not a JSON object"]
    out = []
    if not _iso_day(d.get("date")):
        out.append(f"date must be YYYY-MM-DD (got {d.get('date')!r})")
    if not _text(d.get("reviewer")):
        out.append("reviewer must be a name")
    if not _text(d.get("item_id")):
        out.append("item_id is missing")
    if d.get("action") not in ACTIONS:
        out.append(f"action must be one of {', '.join(ACTIONS)} (got {d.get('action')!r})")
    for key in ("before", "after", "note"):
        if d.get(key) is not None and not isinstance(d.get(key), str):
            out.append(f"{key} must be a string or null")
    return out


def _review(rec):
    review = rec.get("review")
    return review if isinstance(review, dict) else {"state": "pending", "reviewer": None, "date": None,
                                                    "note": ""}


def _set_review(rec, kind, state, d, keep_note=True):
    old = _review(rec)
    note = d.get("note") if _text(d.get("note")) else (old.get("note") if keep_note else "")
    records.set_field(rec, kind, "review", {"state": state, "reviewer": d["reviewer"], "date": d["date"],
                                            "note": note if note is not None else ""})


def _append_note(rec, kind, text):
    notes = rec.get("notes")
    records.set_field(rec, kind, "notes", f"{notes}\n{text}" if notes else text)


def _log_row(d, before, after):
    return records.order_keys({"date": d["date"], "reviewer": d["reviewer"], "item_id": d["item_id"],
                               "action": d["action"], "before": before, "after": after,
                               "note": d.get("note") if d.get("note") is not None else ""}, "decision")


def _used_in(rec):
    used = rec.get("used_in")
    return [str(x) for x in used] if isinstance(used, list) else []


def apply_decisions(facts, media, decisions):
    """(new_facts, new_media, outcomes); inputs are not modified."""
    facts = copy.deepcopy(facts)
    media = copy.deepcopy(media)
    items = {}
    for kind, rows in (("fact", facts), ("media", media)):
        for rec in rows:
            if isinstance(rec.get("id"), str):
                items[rec["id"]] = (kind, rec)
    outcomes = []
    for n, d in enumerate(decisions, 1):
        problems = decision_problems(d)
        if problems:
            outcomes.append(Outcome(n, d, "refused", "; ".join(problems)))
            continue
        iid = d["item_id"]
        if iid not in items:
            outcomes.append(Outcome(n, d, "refused", f"unknown item {iid} (not a fact or media id in this package)"))
            continue
        kind, rec = items[iid]
        outcomes.append(_apply_one(n, d, kind, rec))
    return facts, media, outcomes


def _apply_one(n, d, kind, rec):
    iid, action = d["item_id"], d["action"]
    review = _review(rec)
    status = rec.get("status")
    claim = rec.get("claim") if kind == "fact" else None
    # What a decision is about: a fact's claim, or a media item's lock fingerprint
    # (the title, alt text, rights and source fields the reviewer saw).
    content = claim if kind == "fact" else gates.media_lock_sha256(rec)
    before = d.get("before")
    if kind == "fact":
        stale = before is not None and normalize_text(before) != normalize_text(claim or "")
    else:
        stale = before is not None and before != content

    def refuse(message):
        return Outcome(n, d, "refused", f"{iid}: {message}")

    if action == "approve":
        if review.get("state") == "approved" and review.get("reviewer") == d["reviewer"] and \
                review.get("date") == d["date"]:
            return Outcome(n, d, "already", f"{iid} approved")
        if stale:
            if kind == "fact":
                return refuse(f"the claim changed since the reviewer saw it (reviewed {before!r}, now {claim!r})")
            return refuse(f"the item changed since the reviewer saw it (`before` {before!r} is not its current "
                          f"media_lock_sha256 {content!r})")
        if status != "verified":
            return refuse(f"status is {status}; only verified items can be approved (reject, edit or note it)")
        _set_review(rec, kind, "approved", d)
        return Outcome(n, d, "applied", f"{iid} approved", _log_row(d, content, None))

    if action == "edit":
        field = "claim" if kind == "fact" else "alt_text"
        current = rec.get(field)
        after = d.get("after")
        if not _text(after):
            return refuse(f"an edit needs the new {'claim' if kind == 'fact' else 'alt text'} in `after`")
        after = after.strip()
        if review.get("state") == "edited" and normalize_text(current or "") == normalize_text(after):
            return Outcome(n, d, "already", f"{iid} edited")
        if status == "rejected":
            return refuse(f"rejected {'facts' if kind == 'fact' else 'media items'} cannot be edited; stage a new "
                          f"candidate instead")
        if before is not None and normalize_text(before) != normalize_text(current or ""):
            return refuse(f"the {field} changed since the reviewer saw it (reviewed {before!r}, now {current!r})")
        adversary = rec.get("adversary") if isinstance(rec.get("adversary"), dict) else None
        note = f"Edited by {d['reviewer']} on {d['date']} (G8): the {'claim' if kind == 'fact' else 'alt text'} was {current!r}."
        if adversary:
            note += (f" Adversary verdict '{adversary.get('verdict')}' by {adversary.get('model')} (run "
                     f"{adversary.get('run_id')}, {adversary.get('date')}) cleared for re-verification.")
        _append_note(rec, kind, note)
        records.set_field(rec, kind, field, after)
        records.set_field(rec, kind, "adversary", None)
        records.set_field(rec, kind, "verified_claim_sha256", None)
        if status == "conflicting":
            records.set_field(rec, kind, "status", "pending")
        _set_review(rec, kind, "edited", d)
        out = Outcome(n, d, "applied", f"{iid} edited; it needs re-verification (tools/adversary.py, then "
                                       f"tools/compute_status.py) before it can be exported",
                      _log_row(d, current, after))
        if _used_in(rec):
            out.warnings.append(f"{iid} is used in drafts at {', '.join(_used_in(rec))}; revise the draft "
                                f"before the final export")
        return out

    if action == "reject":
        if review.get("state") == "rejected" and status == "rejected":
            return Outcome(n, d, "already", f"{iid} rejected")
        records.set_field(rec, kind, "status", "rejected")
        records.set_field(rec, kind, "verified_claim_sha256", None)
        _set_review(rec, kind, "rejected", d)
        out = Outcome(n, d, "applied", f"{iid} rejected", _log_row(d, content, None))
        if _used_in(rec):
            out.warnings.append(f"{iid} is used in drafts at {', '.join(_used_in(rec))}; revise the draft "
                                f"before the final export")
        return out

    # note
    text = d.get("note")
    if not _text(text):
        return refuse("a note needs text in `note`")
    line = f"{d['date']} {d['reviewer']}: {' '.join(text.split())}"
    existing = review.get("note") or ""
    if line in existing.split("\n"):
        return Outcome(n, d, "already", f"{iid} note")
    new_review = dict(review)
    new_review["note"] = f"{existing}\n{line}" if existing else line
    records.set_field(rec, kind, "review", new_review)
    return Outcome(n, d, "applied", f"{iid} note added", _log_row(d, content, None))


def run(p, decisions_path, dry_run=False):
    """(exit code, outcomes). Writes nothing unless every decision is valid."""
    with records.locked(p.facts):
        decisions = records.read_jsonl(decisions_path)
        facts = records.read_jsonl(p.facts)
        media = records.read_jsonl(p.media)
        new_facts, new_media, outcomes = apply_decisions(facts, media, decisions)
        if any(o.result == "refused" for o in outcomes):
            return 1, outcomes
        is_log = Path(decisions_path).resolve() == p.decisions.resolve()
        if is_log:
            # The log is applied as written, so an approval in it that names no
            # content stays unbound, and G8 does not count it (ihh.review).
            for o in outcomes:
                if o.decision.get("action") == "approve" and o.decision.get("before") is None:
                    o.warnings.append(f"{o.decision.get('item_id')}: this approval in the review log has no "
                                      f"`before`, so G8 will not count it; the log must record the claim (for "
                                      f"media, the media_lock_sha256) the reviewer approved")
        rows = [o.log for o in outcomes if o.result == "applied" and o.log is not None]

        def append(existing):
            return existing + [r for r in rows if r not in existing]
        # Every file is checked against the record schema before any is written (the write
        # boundary, ihh.records), so a refused record never leaves a partial review behind.
        with records.locked(p.decisions):
            records.check_records(p.facts, new_facts)
            records.check_records(p.media, new_media)
            if rows and not is_log:
                records.check_records(p.decisions, append(records.read_jsonl(p.decisions)))
        if dry_run:
            return 0, outcomes
        if new_facts != facts:
            records.write_jsonl(p.facts, new_facts)
        if new_media != media:
            records.write_jsonl(p.media, new_media)
        if rows and not is_log:
            records.update_jsonl(p.decisions, append)
        compute_status.run(p)
    return 0, outcomes


def main(argv=None):
    parser = argparse.ArgumentParser(description="Apply reviewer decisions (SPEC sections 6 and 8).")
    parser.add_argument("slug", help="inductee slug")
    parser.add_argument("decisions", help="decisions file (JSON Lines), e.g. review/decisions.jsonl")
    parser.add_argument("--dry-run", action="store_true", help="check and report; write nothing")
    parser.add_argument("--data-dir", help="data folder (default: repo data/ or $IHH_DATA_DIR)")
    args = parser.parse_args(argv)
    try:
        p = paths.inductee_paths(args.slug, args.data_dir)
    except ValueError as exc:
        print(f"apply_review: {exc}", file=sys.stderr)
        return 2
    if not p.exists():
        print(f"apply_review: no inductee '{args.slug}' ({p.inductee_json} not found)", file=sys.stderr)
        return 2
    if not Path(args.decisions).is_file():
        print(f"apply_review: {args.decisions} not found", file=sys.stderr)
        return 1
    try:
        code, outcomes = run(p, args.decisions, args.dry_run)
    except records.RecordError as exc:
        print(f"apply_review: {exc}; nothing written", file=sys.stderr)
        return 1

    for o in outcomes:
        label = {"applied": "would apply" if args.dry_run else "applied", "already": "already applied",
                 "refused": "REFUSED"}[o.result]
        line = f"{o.number:>3} {label}: {o.message}"
        print(line, file=sys.stderr if o.result == "refused" else sys.stdout)
        for warning in o.warnings:
            print(f"    warning: {warning}")
    if code:
        print(f"apply_review: {sum(o.result == 'refused' for o in outcomes)} decision(s) refused; nothing "
              f"written. Fix or remove them and run again.", file=sys.stderr)
        return code
    applied = sum(o.result == "applied" for o in outcomes)
    done = "would be applied (dry run)" if args.dry_run else "applied"
    print(f"{args.slug}: {applied} decision(s) {done}, "
          f"{sum(o.result == 'already' for o in outcomes)} already applied")
    return 0


if __name__ == "__main__":
    sys.exit(main())
