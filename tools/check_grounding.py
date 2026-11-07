"""G6 grounded writing, deterministic part (SPEC sections 4 and 7).

Checks drafts/profile.json and the experience content (content/<slug>/chapters, --content-dir)
unit by unit; the content units' locations (content:<chapter id>:title, :reconstruction,
:narration:<cue>, :exhibit:<id>, :exhibit:<id>:note:<i>) come from iter_content_units, the same
list export.py publishes from. Every summary sentence, section
sentence and title, timeline text, title and date, artifact caption, and avatar
line must:
  - list fact ids (a section title draws on its sentences' facts);
  - cite only facts that exist and are `verified`;
  - contain no content word, date, number, decade or code that is missing from
    the cited claims, the inductee's name, or an alias backed by identity
    evidence (ihh/normalize.py content_tokens(); same rule as G2);
  - put inside quotation marks only text that matches a cited is_direct_quote
    fact verbatim (after normalization);
and an avatar `quote` line must equal a cited is_direct_quote fact verbatim.
A timeline date may also match a cited fact's event_date.

Titles are held to the same rule: a title such as "Teaching career" fails when
the cited claims say "taught", because neither "teaching" nor "career" is in
them. Write titles and sentences with the cited claims' own words; regular
inflections ("arrived", "arriving") match, synonyms and irregular forms do not.

The second half of G6 is the sentence adversary: an independent model confirms
that each unit says nothing its cited claims do not. Its verdicts live in
drafts/grounding.jsonl, one row per judged unit:
  {"location", "unit_sha256", "model", "run_id", "date", "verdict",
   "adds_information", "rationale"}
unit_sha256 fingerprints what was judged (the unit's kind and text and the
cited facts' claims). A verdict applies to whichever unit has that fingerprint
(location is kept for the audit trail), so it stops counting as soon as the
text or a cited claim changes, and removing other units does not move it. tools/export.py publishes a sentence, title or caption
only with a current verdict "supported" and adds_information false; the
deterministic check below is not enough on its own. Dates are fully checked
here and need no verdict; avatar lines are not published by export.py.

  --json            one JSON object per unit: loc, kind, text, fact_ids, ok,
                    failures, unit_sha256, and verdict_problem (why the unit has
                    no current sentence-adversary verdict, or null)
  --record FILE     record sentence-adversary verdicts. FILE is JSON Lines:
                    {"loc", "verdict": "supported|refuted|unclear",
                     "adds_information": true|false, "rationale",
                     "unit_sha256": "<from --json, copied unchanged>"}
                    A line is refused when unit_sha256 is missing or differs
                    from the unit as it is now (it was judged on other text).
                    --model (default claude:unknown) and --run-id are recorded.

Locations match the `used_in` field of facts:
  profile:summary:<i>              profile:sections:<id>:<k>   profile:sections:<id>:title
  profile:timeline:<i>             profile:timeline:<i>:title  profile:timeline:<i>:date
  profile:artifacts:<i>            profile:avatar_lines:<i>

Usage: python3 tools/check_grounding.py <slug> [--data-dir DIR] [--failures-only] [--json]
       python3 tools/check_grounding.py <slug> --record FILE [--model M] [--run-id R]
Exit codes: 0 all units pass the deterministic check (or no draft yet), or every
--record line was recorded; 1 a unit fails, a --record line was refused, or a
file is unreadable; 2 usage error or unknown slug.
"""

import argparse
import datetime
import hashlib
import json
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

from ihh import gates, normalize, paths, records, schema
from ihh.normalize import (contains_normalized, normalize_text, parse_date_parts,
                           strip_enclosing_quotes)


@dataclass
class Unit:
    location: str
    kind: str  # sentence, title, caption, date, avatar_quote
    text: object
    fact_ids: list = field(default_factory=list)


@dataclass
class UnitResult:
    location: str
    text: object
    failures: list


def _list(value):
    return value if isinstance(value, list) else []


def _ids(value):
    return [x for x in _list(value) if isinstance(x, str)]


def iter_units(profile):
    """Every checkable piece of text in a profile, with the fact ids it rests on."""
    units = []
    for i, item in enumerate(_list(profile.get("summary"))):
        item = item if isinstance(item, dict) else {}
        units.append(Unit(f"profile:summary:{i}", "sentence", item.get("text"), _ids(item.get("fact_ids"))))
    for j, section in enumerate(_list(profile.get("sections"))):
        section = section if isinstance(section, dict) else {}
        sid = section.get("id") if isinstance(section.get("id"), str) and section.get("id") else str(j)
        sentences = [s if isinstance(s, dict) else {} for s in _list(section.get("sentences"))]
        pooled = list(dict.fromkeys(fid for s in sentences for fid in _ids(s.get("fact_ids"))))
        units.append(Unit(f"profile:sections:{sid}:title", "title", section.get("title"), pooled))
        for k, sentence in enumerate(sentences):
            units.append(Unit(f"profile:sections:{sid}:{k}", "sentence", sentence.get("text"),
                              _ids(sentence.get("fact_ids"))))
    for i, entry in enumerate(_list(profile.get("timeline"))):
        entry = entry if isinstance(entry, dict) else {}
        fids = _ids(entry.get("fact_ids"))
        units.append(Unit(f"profile:timeline:{i}", "sentence", entry.get("text"), fids))
        units.append(Unit(f"profile:timeline:{i}:title", "title", entry.get("title"), fids))
        units.append(Unit(f"profile:timeline:{i}:date", "date", entry.get("date"), fids))
    for i, artifact in enumerate(_list(profile.get("artifacts"))):
        artifact = artifact if isinstance(artifact, dict) else {}
        units.append(Unit(f"profile:artifacts:{i}", "caption", artifact.get("caption"),
                          _ids(artifact.get("fact_ids"))))
    for i, line in enumerate(_list(profile.get("avatar_lines"))):
        line = line if isinstance(line, dict) else {}
        kind = "avatar_quote" if line.get("kind") == "quote" else "sentence"
        units.append(Unit(f"profile:avatar_lines:{i}", kind, line.get("text"), _ids(line.get("fact_ids"))))
    return units


# --- experience content (content/<slug>/chapters/<n>.json) -----------------------------------
# The ONE list of content units. export.py publishes a unit only after looking up its verdict by
# the Unit built here, and --json / --record judge the same Units, so a verdict always applies to
# what is published. Locations: content:<chapter id>:title, :reconstruction, :narration:<cue>,
# :exhibit:<id> (the exhibit title) and :exhibit:<id>:note:<i>.

def chapter_id(ch, n):
    return ch.get("id") if isinstance(ch.get("id"), str) and ch.get("id") else f"chapter-{n}"


def exhibit_id(ex):
    return ex.get("id") if isinstance(ex.get("id"), str) and ex.get("id") else str(ex.get("number"))


def title_unit(cid, ch):
    return Unit(f"content:{cid}:title", "title", ch.get("title"), _ids(ch.get("title_fact_ids")))


def reconstruction_unit(cid, ch):
    rec = ch.get("reconstruction") if isinstance(ch.get("reconstruction"), dict) else {}
    return Unit(f"content:{cid}:reconstruction", "sentence", rec.get("note"), _ids(rec.get("basis_fact_ids")))


def narration_unit(cid, line):
    return Unit(f"content:{cid}:narration:{line.get('cue')}", "sentence", line.get("text"),
                _ids(line.get("fact_ids")))


def exhibit_title_unit(cid, ex):
    return Unit(f"content:{cid}:exhibit:{exhibit_id(ex)}", "title", ex.get("title"), _ids(ex.get("title_fact_ids")))


def exhibit_note_unit(cid, ex, i, note):
    return Unit(f"content:{cid}:exhibit:{exhibit_id(ex)}:note:{i}", "sentence", note.get("text"),
                _ids(note.get("fact_ids")))


def iter_content_units(chapters):
    """Every sentence, title and note the experience chapters publish, as Units (document order)."""
    units = []
    for n, ch in enumerate(chapters, 1):
        ch = ch if isinstance(ch, dict) else {}
        cid = chapter_id(ch, n)
        units.append(title_unit(cid, ch))
        rec = ch.get("reconstruction") if isinstance(ch.get("reconstruction"), dict) else {}
        if rec.get("note") is not None:
            units.append(reconstruction_unit(cid, ch))
        for line in _list(ch.get("narration")):
            units.append(narration_unit(cid, line if isinstance(line, dict) else {}))
        for ex in _list(ch.get("exhibits")):
            ex = ex if isinstance(ex, dict) else {}
            units.append(exhibit_title_unit(cid, ex))
            for i, note in enumerate(_list(ex.get("notes"))):
                units.append(exhibit_note_unit(cid, ex, i, note if isinstance(note, dict) else {}))
    return units


def load_chapters(content_dir, slug):
    """The experience chapters of content/<slug>/chapters/<n>.json in chapter-number order; [] if none."""
    folder = Path(content_dir) / slug / "chapters"
    if not folder.is_dir():
        return []
    numbered = []
    for f in folder.iterdir():
        m = re.fullmatch(r"(\d+)\.json", f.name)
        if m:
            numbered.append((int(m.group(1)), f))
    out = []
    for _, f in sorted(numbered):
        data = records.read_json(f)
        if not isinstance(data, dict):
            raise records.RecordError(f"{f.name}: a chapter must be a JSON object")
        out.append(data)
    return out


def default_content_dir():
    return paths.REPO_ROOT / "content"


def cited_locations(profile):
    """{location: fact_ids} for the locations a fact's used_in may name."""
    out = {}
    for unit in iter_units(profile):
        if unit.location.endswith((":title", ":date")):
            continue
        out[unit.location] = unit.fact_ids
    return out


# --- checks -------------------------------------------------------------------------

quoted_spans = normalize.quoted_spans  # every quotation style, read in one place


def _quote_matches(span, cited):
    needle = normalize_text(span).strip(" .,;:!?'\"")
    if not needle:
        return True
    for fact in cited:
        if fact.get("is_direct_quote") is True:
            claim = normalize_text(strip_enclosing_quotes(fact.get("claim") or ""))
            if contains_normalized(claim, needle):
                return True
    return False


def check_text(text, cited_facts, names):
    """G6 failures for one sentence, title or caption against its cited facts."""
    if not isinstance(text, str) or not text.strip():
        return ["missing text"]
    support = gates.Support.from_texts([f.get("claim") for f in cited_facts], names=names)
    failures = list(gates.unsupported_tokens(text, support, "cited claims"))
    for span in quoted_spans(text):
        if not _quote_matches(span, cited_facts):
            failures.append(f"quoted text {span!r} does not match a cited is_direct_quote fact verbatim")
    return failures


def check_date(value, cited_facts):
    if not isinstance(value, str) or not value.strip():
        return ["missing date"]
    parsed = parse_date_parts(value)
    if parsed is None:
        return [f"timeline date {value!r} is not a date"]
    extra = [parse_date_parts(str(f.get("event_date"))) for f in cited_facts if f.get("event_date")]
    support = gates.Support.from_texts([f.get("claim") for f in cited_facts], extra_dates=extra)
    if not support.has_date((parsed,)):
        return [f"timeline date {value} not in cited claims or their event_date"]
    return []


def check_avatar_quote(text, cited_facts):
    target = normalize_text(strip_enclosing_quotes(text or ""))
    for fact in cited_facts:
        if fact.get("is_direct_quote") is True and \
                normalize_text(strip_enclosing_quotes(fact.get("claim") or "")) == target:
            return []
    return ["avatar quote line must equal a cited is_direct_quote fact verbatim"]


# --- the sentence adversary (second half of G6) ---------------------------------------

NEEDS_VERDICT = ("sentence", "title", "caption")
VERDICTS = schema.GROUNDING_VERDICTS  # one definition, shared with the record schema
_HEX64 = re.compile(r"^[0-9a-f]{64}$")


def unit_sha256(unit, cited_facts):
    """Fingerprint of what a sentence adversary judges: kind, text and the cited claims."""
    claims = sorted([str(f.get("id")), normalize_text(f.get("claim") or ""), f.get("is_direct_quote") is True]
                    for f in cited_facts if isinstance(f, dict))
    text = unit.text if isinstance(unit.text, str) else ""
    payload = json.dumps([unit.kind, normalize_text(text), claims], ensure_ascii=False, sort_keys=True)
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def load_verdicts(p):
    """The rows of drafts/grounding.jsonl, in file order."""
    return records.read_jsonl(p.grounding)


def verdict_problem(unit, cited_facts, verdicts):
    """Why a unit lacks a current sentence-adversary approval, or None if it has one.

    verdicts is the list of drafts/grounding.jsonl rows. A verdict applies to a
    unit by its fingerprint, not its location, so removing or reordering other
    units does not move verdicts onto other text; the last matching row wins.
    """
    sha = unit_sha256(unit, cited_facts)
    rows = [r for r in verdicts if isinstance(r, dict)]
    row = next((r for r in reversed(rows) if r.get("unit_sha256") == sha), None)
    if row is None:
        if any(r.get("location") == unit.location for r in rows):
            return "the text or a cited claim changed after the sentence adversary judged it (G6); judge it again"
        return "no sentence-adversary verdict yet (G6)"
    if row.get("verdict") != "supported":
        return f"the sentence adversary's verdict is {row.get('verdict')} (G6): {row.get('rationale')}"
    if row.get("adds_information") is not False:
        return f"the sentence adversary found it adds information (G6): {row.get('rationale')}"
    return None


def cited_facts(unit, facts_by_id):
    return [facts_by_id[fid] for fid in unit.fact_ids if fid in facts_by_id]


def check_profile(profile, facts_by_id, names):
    """One UnitResult per unit of the profile, in document order."""
    return check_units(iter_units(profile if isinstance(profile, dict) else {}), facts_by_id, names)


def check_units(units, facts_by_id, names):
    """One UnitResult per Unit: the deterministic G6 check."""
    results = []
    for unit in units:
        failures = []
        if not unit.fact_ids:
            failures.append("no fact ids")
        cited = []
        for fid in unit.fact_ids:
            fact = facts_by_id.get(fid)
            if fact is None:
                failures.append(f"unknown fact id {fid}")
                continue
            if fact.get("status") != "verified":
                failures.append(f"cited fact {fid} is not verified (status {fact.get('status')})")
            cited.append(fact)
        if unit.kind == "date":
            failures.extend(check_date(unit.text, cited))
        else:
            failures.extend(check_text(unit.text, cited, names))
            if unit.kind == "avatar_quote":
                failures.extend(check_avatar_quote(unit.text, cited))
        results.append(UnitResult(unit.location, unit.text, list(dict.fromkeys(failures))))
    return results


def run(p):
    """UnitResults for one inductee, or None when there is no draft yet."""
    profile = records.read_json(p.profile)
    if profile is None:
        return None
    facts = records.read_jsonl(p.facts)
    ctx = records.load_context(p, facts)
    return check_profile(profile, gates.by_id(facts), ctx.names)


def unit_report(p, content_dir=None):
    """[(Unit, UnitResult, unit_sha256, verdict_problem)] for one inductee's profile units and
    experience content units, or None when it has neither."""
    profile = records.read_json(p.profile)
    chapters = load_chapters(content_dir or default_content_dir(), p.slug)
    if profile is None and not chapters:
        return None
    facts = records.read_jsonl(p.facts)
    facts_by_id = gates.by_id(facts)
    ctx = records.load_context(p, facts)
    verdicts = load_verdicts(p)
    profile = profile if isinstance(profile, dict) else {}
    units = iter_units(profile) + iter_content_units(chapters)
    results = check_units(units, facts_by_id, ctx.names)
    out = []
    for unit, result in zip(units, results):
        cited = cited_facts(unit, facts_by_id)
        problem = verdict_problem(unit, cited, verdicts) if unit.kind in NEEDS_VERDICT else None
        out.append((unit, result, unit_sha256(unit, cited), problem))
    return out


def record(p, path, model, run_id, date, content_dir=None):
    """Record sentence-adversary verdicts from a JSON Lines file. Returns (recorded, refused)."""
    rows = records.read_jsonl(path)
    report = unit_report(p, content_dir)
    if report is None:
        return [], [f"{p.slug}: no drafts/profile.json or experience content; nothing to record"]
    current = {unit.location: (unit, sha) for unit, _, sha, _ in report}
    accepted, refused = [], []
    for n, row in enumerate(rows, 1):
        loc = row.get("loc", row.get("location"))
        errs = []
        unknown = sorted(set(row) - {"loc", "location", "verdict", "adds_information", "rationale", "unit_sha256",
                                     "text", "fact_ids", "round"})
        if unknown:
            errs.append(f"unknown key(s) {', '.join(unknown)}")
        if not isinstance(loc, str) or loc not in current:
            errs.append(f"location {loc!r} is not a unit of drafts/profile.json or of the experience content")
        elif current[loc][0].kind not in NEEDS_VERDICT:
            errs.append(f"{loc} is a {current[loc][0].kind} unit, which needs no sentence-adversary verdict")
        if row.get("verdict") not in VERDICTS:
            errs.append(f"verdict {row.get('verdict')!r} is not one of {', '.join(VERDICTS)}")
        if not isinstance(row.get("adds_information"), bool):
            errs.append("adds_information must be true or false")
        if not isinstance(row.get("rationale"), str):
            errs.append("rationale must be a string")
        sha = row.get("unit_sha256")
        if not isinstance(sha, str) or not _HEX64.match(sha):
            errs.append("unit_sha256 is missing; copy it from check_grounding.py --json")
        elif isinstance(loc, str) and loc in current and sha != current[loc][1]:
            errs.append("the unit's text or cited claims changed after it was judged (unit_sha256 differs); "
                        "judge it again")
        if errs:
            refused.append(f"line {n} ({loc}): {'; '.join(errs)}")
            continue
        accepted.append(records.order_keys({
            "location": loc, "unit_sha256": sha, "model": model, "run_id": run_id, "date": date,
            "verdict": row["verdict"], "adds_information": row["adds_information"],
            "rationale": row["rationale"]}, "grounding"))
    if accepted:
        def merge(existing):
            done = {r["unit_sha256"] for r in accepted}
            return [r for r in existing if r.get("unit_sha256") not in done] + accepted
        records.update_jsonl(p.grounding, merge)
    return [r["location"] for r in accepted], refused


def main(argv=None):
    parser = argparse.ArgumentParser(description="G6 grounding check for drafts/profile.json.")
    parser.add_argument("slug", help="inductee slug")
    parser.add_argument("--data-dir", help="data folder (default: repo data/ or $IHH_DATA_DIR)")
    parser.add_argument("--content-dir", help="experience content folder (default: repo content/)")
    parser.add_argument("--failures-only", action="store_true", help="print failing units only")
    parser.add_argument("--json", action="store_true", help="one JSON object per unit, with unit_sha256")
    parser.add_argument("--record", metavar="FILE", help="record sentence-adversary verdicts (JSON Lines)")
    parser.add_argument("--model", default="claude:unknown", help="with --record: the judging model")
    parser.add_argument("--run-id", default=None, help="with --record: the run id")
    args = parser.parse_args(argv)
    try:
        p = paths.inductee_paths(args.slug, args.data_dir)
    except ValueError as exc:
        print(f"check_grounding: {exc}", file=sys.stderr)
        return 2
    if not p.exists():
        print(f"check_grounding: no inductee '{args.slug}' ({p.inductee_json} not found)", file=sys.stderr)
        return 2
    try:
        if args.record:
            date = datetime.date.today().isoformat()
            recorded, refused = record(p, args.record, args.model, args.run_id or f"g6-{date}", date, args.content_dir)
            print(f"{args.slug}: {len(recorded)} sentence-adversary verdict(s) recorded in {p.grounding}")
            for line in refused:
                print(f"  refused {line}")
            return 1 if refused or not recorded else 0
        report = unit_report(p, args.content_dir)
    except records.RecordError as exc:
        print(f"check_grounding: {args.slug}: {exc}", file=sys.stderr)
        return 1
    if report is None:
        print(f"{args.slug}: no drafts/profile.json or experience content yet; nothing to check")
        return 0
    results = [r for _, r, _, _ in report]
    failed = [r for r in results if r.failures]
    if args.json:
        for unit, r, sha, problem in report:
            print(json.dumps({"loc": r.location, "kind": unit.kind, "text": r.text, "fact_ids": unit.fact_ids,
                              "ok": not r.failures, "failures": r.failures, "unit_sha256": sha,
                              "verdict_problem": problem}, ensure_ascii=False))
        return 1 if failed else 0
    for r in results:
        if r.failures:
            print(f"FAIL {r.location}: {'; '.join(r.failures)}")
            print(f"     text: {r.text!r}")
        elif not args.failures_only:
            print(f"PASS {r.location}")
    unjudged = [unit.location for unit, _, _, problem in report if problem]
    print(f"{args.slug}: {len(results)} units, {len(results) - len(failed)} pass, {len(failed)} fail; "
          f"{len(unjudged)} without a current sentence-adversary verdict (needed for the final export)")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
