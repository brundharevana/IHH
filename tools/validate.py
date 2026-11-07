"""Validate inductee packages (SPEC sections 3, 4, 5).

Runs, for one inductee or all of them:
  SCHEMA    required fields, enums, id formats, https URLs, ISO dates, for every
            record type in SPEC section 3 plus snapshot meta files, review
            decisions and drafts/profile.json (ihh/schema.py; ihh/records.py runs the
            same checks on every record as it is written)
  IDS       id format with the inductee code, uniqueness (and unique codes with --all)
  REFS      evidence and media source ids, reconstruction basis, ids named in
            alt text, used_in locations, draft fact and media ids, review item ids
  SNAPSHOT  every saved snapshot exists, its sha256 matches the meta file and
            the source record, and the meta file names the record's url, method
            and (for http and api fetches) the URL the record is fetched from
  ALIASES   each alias is backed by an identity-fact evidence quote (warning)
  G1 G2 G5 G7 G9 G10 G11   the deterministic gates (tools/ihh/gates.py); G5 and G9 use the
            authority registry data/registry/institutions.json (tools/ihh/authority.py)
  G6        the grounding check on drafts/profile.json (tools/check_grounding.py);
            units without a current sentence-adversary verdict
            (drafts/grounding.jsonl) are noted, since the final export withholds them
  G8        a review state approved or edited is backed by the matching decision
            in review/decisions.jsonl (ihh/review.py)
  STATUS    stored status and verified_claim_sha256 match what
            tools/compute_status.py derives
  EXPORT    drafts use only verified facts and media; non-embeddable media and
            approved-but-unverified items are reported

Errors make the exit code 1. G1, G2, G7, G9 and G11 failures are errors unless the
fact is rejected or withdrawn. G5 and G10 failures are reported as notes: they
decide a status (single-source, disputed) rather than break the package, and
STATUS catches a stored status that ignores them. Warnings never fail the run.

Usage: python3 tools/validate.py <slug> | --all [--data-dir DIR] [--quiet]
"""

import argparse
import difflib
import sys
from collections import Counter
import check_grounding
import compute_status
from ihh import authority, gates, ids, normalize, paths, records
from ihh import review as review_log

from ihh.schema import (EMBEDDABLE, _ANY_ID, _short, as_dict, as_list, check_decision, check_fact,
                        check_grounding_row, check_inductee, check_media, check_profile_schema, check_search,
                        check_source, is_https, is_int)

GATES = ("SCHEMA", "IDS", "REFS", "SNAPSHOT", "ALIASES", "G1", "G2", "G5", "G6", "G7", "G8", "G9", "G10",
         "G11", "STATUS", "EXPORT")


# --- report -------------------------------------------------------------------------------

class Report:
    def __init__(self, slug):
        self.slug = slug
        self.errors = []    # (gate, message)
        self.warnings = []  # (gate, message)
        self.notes = []     # (gate, message): informational, never fails the run
        self.checked = Counter()
        self.failed = Counter()
        self.statuses = {}

    def error(self, gate, message):
        self.errors.append((gate, message))

    def warn(self, gate, message):
        self.warnings.append((gate, message))

    def note(self, gate, message):
        self.notes.append((gate, message))

    def gate(self, gate, rid, failures, level="error"):
        """Record one gate evaluation on one record."""
        self.checked[gate] += 1
        if failures:
            self.failed[gate] += 1
            add = {"error": self.error, "warning": self.warn, "note": self.note}[level]
            for f in failures:
                add(gate, f"{rid}: {f}")

    def count(self, gate, level):
        rows = {"error": self.errors, "warning": self.warnings, "note": self.notes}[level]
        return sum(1 for g, _ in rows if g == gate)


# --- ids --------------------------------------------------------------------------------------

def check_ids(report, code, groups):
    """groups: [(file name, kind, rows)]. Ids must be well formed, use the code, and be unique."""
    seen = {}
    for fname, kind, rows in groups:
        for row in rows:
            rid = row.get("id")
            report.checked["IDS"] += 1
            if not ids.is_id(rid, kind=kind):
                example = f"{code}-{ids.letter(kind)}-0001"
                report.error("IDS", f"{fname}: id {_short(rid)} must look like {example}")
                continue
            if code and ids.parse_id(rid)[0] != code:
                report.error("IDS", f"{fname}: id {rid} does not use the inductee code {code}")
            if rid in seen:
                report.error("IDS", f"duplicate id {rid} ({seen[rid]} and {fname})")
            else:
                seen[rid] = fname


# --- validation of one inductee ---------------------------------------------------------------------

def _load_rows(report, path):
    rows, problems = records.read_jsonl_lenient(path)
    for problem in problems:
        report.error("SCHEMA", problem)
    return rows


def _orphan_snapshots(report, p, sources):
    if not p.snapshots.is_dir():
        return
    known = {s.get("id") for s in sources if isinstance(s.get("id"), str)}
    for item in sorted(p.snapshots.iterdir()):
        name = item.name
        sid = name[:-len(".meta.json")] if name.endswith(".meta.json") else (
            name[:-4] if name.endswith(".txt") else None)
        if sid is not None and sid not in known:
            report.warn("SNAPSHOT", f"snapshots/{name} belongs to no source record")


def media_gates(m, ctx, fact_status):
    """[(gate, problems)] for one media record: G1 (rights statement verbatim in a snapshot,
    license_class follows the approved rights rule, reconstruction basis), G2 (title and alt text
    add nothing) and G7 (edit lock). The one definition of the media gates: validate_inductee and
    media_problems (the site prebuild, tools/content_check.py) both run it."""
    return [("G1", gates.g1_media(m, ctx, fact_status)),
            ("G2", gates.g2_media(m, ctx)),
            ("G7", gates.g7_edit_lock(m, kind="media"))]


def media_problems(p, media_ids):
    """{media id: [problem text]} for each of media_ids on file in inductee folder p that fails the
    media checks validate.py runs: the SCHEMA check of the record and media_gates (G1, G2, G7).
    An id with no record is reported as unknown. Raises records.RecordError when the inductee's
    records or authority registry cannot be read."""
    facts, _ = records.read_jsonl_lenient(p.facts)
    sources, _ = records.read_jsonl_lenient(p.sources)
    media, _ = records.read_jsonl_lenient(p.media)
    sources_by_id = gates.by_id(sources)
    by_media = gates.by_id(media)
    ctx = records.load_context(p, facts)
    new_facts, _, _ = compute_status.compute(facts, media, ctx)
    fact_status = {fid: f.get("status") for fid, f in gates.by_id(new_facts).items()}
    out = {}
    for mid in dict.fromkeys(media_ids):
        m = by_media.get(mid)
        if m is None:
            out[mid] = ["unknown media record"]
            continue
        sink = Report(p.slug)
        check_media(sink, m, sources_by_id)
        for gate, problems in media_gates(m, ctx, fact_status):
            sink.gate(gate, mid, problems, "error")
        if sink.errors:
            out[mid] = [f"{gate}: {msg}" for gate, msg in sink.errors]
    return out


def validate_inductee(p, content_dir=None):
    """Report for one inductee folder (ihh.paths.InducteePaths)."""
    report = Report(p.slug)
    try:
        inductee = records.read_json(p.inductee_json)
    except records.RecordError as exc:
        report.error("SCHEMA", str(exc))
        return report
    if not isinstance(inductee, dict):
        report.error("SCHEMA", f"{p.inductee_json} is missing or not a JSON object")
        return report
    report.checked["SCHEMA"] += 1
    check_inductee(report, inductee, p.slug)
    code = inductee.get("code") if isinstance(inductee.get("code"), str) else ""

    facts = _load_rows(report, p.facts)
    sources = _load_rows(report, p.sources)
    media = _load_rows(report, p.media)
    searches = _load_rows(report, p.searches)
    decisions = _load_rows(report, p.decisions)
    grounding = _load_rows(report, p.grounding)
    try:
        profile = records.read_json(p.profile)
    except records.RecordError as exc:
        report.error("SCHEMA", f"drafts/{exc}")
        profile = None
    if profile is not None and not isinstance(profile, dict):
        report.error("SCHEMA", "drafts/profile.json is not a JSON object")
        profile = None

    sources_by_id = gates.by_id(sources)
    facts_by_id = gates.by_id(facts)
    media_by_id = gates.by_id(media)

    # SCHEMA
    for s in sources:
        report.checked["SCHEMA"] += 1
        check_source(report, s, sources_by_id)
    for f in facts:
        report.checked["SCHEMA"] += 1
        check_fact(report, f, p.slug, sources_by_id)
    for m in media:
        report.checked["SCHEMA"] += 1
        check_media(report, m, sources_by_id)
    for s in searches:
        report.checked["SCHEMA"] += 1
        check_search(report, s)
    for n, d in enumerate(decisions, 1):
        report.checked["SCHEMA"] += 1
        check_decision(report, d, n)
    if profile is not None:
        report.checked["SCHEMA"] += 1
        check_profile_schema(report, profile, p.slug)
    for n, row in enumerate(grounding, 1):
        report.checked["SCHEMA"] += 1
        check_grounding_row(report, row, n)

    # IDS
    check_ids(report, code, [("sources.jsonl", "source", sources), ("facts.jsonl", "fact", facts),
                             ("media.jsonl", "media", media), ("searches.jsonl", "search", searches)])
    all_ids = set(sources_by_id) | set(facts_by_id) | set(media_by_id) | set(gates.by_id(searches))

    # SNAPSHOT
    snapshots = records.load_snapshots(p.root, sources)
    for s in sources:
        if not s.get("snapshot"):
            continue
        report.gate("SNAPSHOT", s.get("id"),
                    _unprefixed(s.get("id"), gates.snapshot_failures(s, snapshots.get(s.get("id")))))
        snap = snapshots.get(s.get("id"))
        if snap is not None and snap.meta is not None and snap.text is not None:
            # meta url, fetch_url and method are checked by gates.snapshot_failures above.
            meta = snap.meta
            size = len(snap.text.encode("utf-8"))
            if is_int(meta.get("bytes")) and meta["bytes"] != size:
                report.error("SNAPSHOT", f"{s.get('id')}: meta bytes {meta['bytes']} differs from "
                                         f"file size {size}")
    _orphan_snapshots(report, p, sources)

    # REFS
    for f in facts:
        for i, item in enumerate(as_list(f.get("evidence")), 1):
            sid = item.get("source_id") if isinstance(item, dict) else None
            report.checked["REFS"] += 1
            if not gates.known(sources_by_id, sid):
                report.error("REFS", f"{f.get('id')}: evidence {i} cites unknown source {sid}")
    for m in media:
        for sid in as_list(m.get("source_ids")):
            report.checked["REFS"] += 1
            if not gates.known(sources_by_id, sid):
                report.error("REFS", f"{m.get('id')}: unknown source {sid}")
        for rid in as_list(m.get("reconstruction_basis")):
            report.checked["REFS"] += 1
            if not gates.known(facts_by_id, rid) and not gates.known(sources_by_id, rid):
                report.error("REFS", f"{m.get('id')}: reconstruction_basis names unknown id {rid}")
        for rid in as_list(m.get("basis_for")):
            report.checked["REFS"] += 1
            if not gates.known(facts_by_id, rid):
                report.error("REFS", f"{m.get('id')}: basis_for names unknown fact {rid}")
            elif facts_by_id[rid].get("status") == "rejected":
                report.warn("REFS", f"{m.get('id')}: basis_for names rejected fact {rid}; link the photo to a "
                                    f"current stop fact")
        for rid in _ANY_ID.findall(str(m.get("alt_text") or "")):
            report.checked["REFS"] += 1
            if not gates.known(all_ids, rid):
                report.error("REFS", f"{m.get('id')}: alt_text names unknown id {rid}")
    for s in searches:
        for rid in as_list(s.get("produced")):
            report.checked["REFS"] += 1
            if not gates.known(all_ids, rid):
                report.warn("REFS", f"{s.get('id')}: produced names unknown id {rid}")
    for n, d in enumerate(decisions, 1):
        report.checked["REFS"] += 1
        if not gates.known(facts_by_id, d.get("item_id")) and not gates.known(media_by_id, d.get("item_id")):
            report.error("REFS", f"review/decisions.jsonl:{n}: unknown item {d.get('item_id')}")

    locations = check_grounding.cited_locations(profile) if profile is not None else {}
    for f in facts:
        for loc in as_list(f.get("used_in")):
            report.checked["REFS"] += 1
            if not gates.known(locations, loc):
                report.error("REFS", f"{f.get('id')}: used_in {loc} is not a location in drafts/profile.json")
            elif f.get("id") not in locations[loc]:
                report.error("REFS", f"{f.get('id')}: used_in {loc} but that location does not cite it")
    for loc, fids in locations.items():
        for fid in fids:
            report.checked["REFS"] += 1
            if not gates.known(facts_by_id, fid):
                report.error("REFS", f"{loc}: unknown fact id {fid}")
            elif loc not in as_list(facts_by_id[fid].get("used_in")):
                report.warn("REFS", f"{fid}: cited at {loc} but used_in does not list it")
    draft_media = _draft_media(profile)
    for loc, mid in draft_media:
        report.checked["REFS"] += 1
        if not gates.known(media_by_id, mid):
            report.error("REFS", f"{loc}: unknown media id {mid}")

    # Gates
    try:
        registry = authority.load(p.registry)
    except authority.RegistryError as exc:
        report.error("G9", f"authority registry: {exc}")
        registry = authority.Registry.empty(source=str(p.registry), missing=False)
    if registry.missing:
        report.warn("G9", f"no authority registry at {p.registry}; no source can be primary or institutional")
    ctx = gates.build_context(inductee, sources, snapshots, facts, registry)
    for alias in as_list(inductee.get("aliases")):
        report.checked["ALIASES"] += 1
        not_a_name = normalize.name_problem(alias) if isinstance(alias, str) else "it is not a string"
        if not_a_name:
            report.failed["ALIASES"] += 1
            report.error("ALIASES", f"alias {alias!r} is not a name ({not_a_name}); an alias may hold only name "
                                    f"words, so it is not used for name matching")
        elif alias not in ctx.names:
            report.failed["ALIASES"] += 1
            report.warn("ALIASES", f"alias {alias!r} has no identity-fact evidence quote in a snapshot; "
                                   f"it is not used for name matching")
    for s in sources:
        report.gate("G9", s.get("id"), _unprefixed(s.get("id"), gates.g9_source(s, ctx.registry)))
    for f in facts:
        rid = f.get("id")
        closed = f.get("status") == "rejected" or as_dict(f.get("extractor")).get("verdict") == "withdrawn"
        level = "note" if closed else "error"
        report.gate("G1", rid, gates.g1_evidence(f, ctx), level)
        report.gate("G2", rid, gates.g2_nothing_added(f, ctx), level)
        report.gate("G7", rid, gates.g7_edit_lock(f), level)
        report.gate("G9", rid, gates.g9_fact_use(f, ctx), level)
        report.gate("G11", rid, gates.g11_identity(f, ctx), level)
        report.gate("G5", rid, gates.g5_corroboration(f, ctx), "note")
        _near_duplicate_institutions(report, f, ctx)
        if isinstance(f.get("adversary"), dict):
            report.gate("G10", rid, gates.g10_snapshot_integrity(f, ctx), "note")

    new_facts, new_media, _ = compute_status.compute(facts, media, ctx)
    fact_status = {fid: f.get("status") for fid, f in gates.by_id(new_facts).items()}
    for m in media:
        rid = m.get("id")
        level = "note" if m.get("status") == "rejected" else "error"
        for gate, problems in media_gates(m, ctx, fact_status):
            report.gate(gate, rid, problems, level)
        if isinstance(m.get("adversary"), dict):
            report.gate("G10", rid, gates.g10_snapshot_integrity(m, ctx), "note")

    try:
        chapters = check_grounding.load_chapters(content_dir or check_grounding.default_content_dir(), p.slug)
    except records.RecordError as exc:
        report.error("SCHEMA", str(exc))
        chapters = []
    if profile is not None or chapters:
        profile = profile if isinstance(profile, dict) else {}
        for result in check_grounding.check_profile(profile, facts_by_id, ctx.names):
            report.gate("G6", result.location, result.failures)
        # The sentence-adversary half of G6 decides what the final export publishes; a unit
        # without a current "supported" verdict is withheld there, so it is a note here.
        verdicts = grounding
        units = check_grounding.iter_units(profile) + check_grounding.iter_content_units(chapters)
        for unit in units:
            if unit.kind in check_grounding.NEEDS_VERDICT:
                problem = check_grounding.verdict_problem(
                    unit, check_grounding.cited_facts(unit, facts_by_id), verdicts)
                if problem:
                    report.note("G6", f"{unit.location}: {problem}; the final export withholds it")
        known_locations = {u.location for u in units}
        for n, row in enumerate(grounding, 1):
            report.checked["REFS"] += 1
            if row.get("location") not in known_locations:
                report.warn("REFS", f"drafts/grounding.jsonl:{n}: {row.get('location')} is not a unit of "
                                    f"drafts/profile.json or of the experience content")

    # STATUS
    pairs = [(old, new, compute_status.derive_fact(old, ctx)) for old, new in zip(facts, new_facts)]
    pairs += [(old, new, compute_status.derive_media(old, ctx, fact_status))
              for old, new in zip(media, new_media)]
    for old, new, derivation in pairs:
        report.checked["STATUS"] += 1
        if old.get("status") != new.get("status"):
            why = f" ({'; '.join(derivation.reasons)})" if derivation.reasons else ""
            problem = f"stored status {old.get('status')} but the evidence gives {new.get('status')}{why}"
        elif old.get("verified_claim_sha256") != new.get("verified_claim_sha256"):
            problem = (f"stored verified_claim_sha256 {old.get('verified_claim_sha256')} but expected "
                       f"{new.get('verified_claim_sha256')}")
        else:
            continue
        report.failed["STATUS"] += 1
        report.error("STATUS", f"{old.get('id')}: {problem}; run tools/compute_status.py")
    report.statuses = {"facts": Counter(str(f.get("status")) for f in facts),
                       "media": Counter(str(m.get("status")) for m in media)}

    # EXPORT
    for f in facts:
        report.checked["EXPORT"] += 1
        status = f.get("status")
        used_in = [str(x) for x in as_list(f.get("used_in"))]
        if used_in and status != "verified":
            report.failed["EXPORT"] += 1
            report.error("EXPORT", f"{f.get('id')}: used in drafts ({', '.join(used_in)}) but status is "
                                   f"{status}; only verified facts may be used")
        _review_rules(report, f)
        report.gate("G8", f.get("id"), review_log.backing_problems(f, "fact", decisions))
    used_media = {}
    for loc, mid in draft_media:
        used_media.setdefault(mid, []).append(loc)
    for m in media:
        report.checked["EXPORT"] += 1
        mid = m.get("id")
        if gates.known(used_media, mid):
            where = ", ".join(used_media[mid])
            if m.get("status") != "verified":
                report.failed["EXPORT"] += 1
                report.error("EXPORT", f"{mid}: used in drafts ({where}) but status is {m.get('status')}; "
                                       f"only verified media may be used")
            elif m.get("license_class") not in EMBEDDABLE:
                report.warn("EXPORT", f"{mid}: license_class {m.get('license_class')}; the site must show "
                                      f"it as a link, never embed it ({where})")
        _review_rules(report, m)
        report.gate("G8", mid, review_log.backing_problems(m, "media", decisions))
    return report


def _near_duplicate_institutions(report, fact, ctx):
    """Warn when two holders G5 counts apart have nearly the same name (a typo of a holder's
    name on another site, which authority.claimed() does not catch)."""
    srcs = [ctx.sources[sid] for sid in gates._record_source_ids(fact) if sid in ctx.sources]
    if any(s.get("type") == "primary" for s in srcs):
        return
    groups = gates.g5_holders(fact, ctx, srcs)
    names = [(g[0].get("institution"), authority.institution_key(g[0].get("institution"))) for g in groups]
    for i in range(len(names)):
        for j in range(i + 1, len(names)):
            if difflib.SequenceMatcher(None, names[i][1], names[j][1]).ratio() >= 0.85:
                report.warn("G5", f"{fact.get('id')}: institutions {names[i][0]!r} and {names[j][0]!r} look "
                                  f"like the same holder; G5 counts them as two. Check and correct one")


def _unprefixed(rid, messages):
    """Drop a leading '<id>: ' or '<id> ' from gate messages that already name the record."""
    out = []
    for message in messages:
        for prefix in (f"{rid}: ", f"{rid} "):
            if isinstance(rid, str) and message.startswith(prefix):
                message = message[len(prefix):]
                break
        out.append(message)
    return out


def _draft_media(profile):
    """[(location, media_id)] for every media item the draft shows."""
    if not isinstance(profile, dict):
        return []
    out = []
    for i, entry in enumerate(as_list(profile.get("timeline"))):
        if isinstance(entry, dict):
            for mid in as_list(entry.get("media_ids")):
                if isinstance(mid, str):
                    out.append((f"profile:timeline:{i}", mid))
    for i, artifact in enumerate(as_list(profile.get("artifacts"))):
        if isinstance(artifact, dict) and isinstance(artifact.get("media_id"), str):
            out.append((f"profile:artifacts:{i}", artifact.get("media_id")))
    return out


def _review_rules(report, rec):
    review = rec.get("review") if isinstance(rec.get("review"), dict) else {}
    state = review.get("state")
    status = rec.get("status")
    if state in ("approved", "edited") and status != "verified":
        report.warn("EXPORT", f"{rec.get('id')}: review {state} but status is {status}; it will not be "
                              f"exported until verified")
    if state == "rejected" and status != "rejected":
        report.warn("EXPORT", f"{rec.get('id')}: review rejected but status is {status}")


# --- output ------------------------------------------------------------------------------------

def print_report(report, quiet=False):
    print(f"== {report.slug} ==")
    for gate, message in report.errors:
        print(f"ERROR [{gate}] {message}")
    for gate, message in report.warnings:
        print(f"WARN  [{gate}] {message}")
    if not quiet:
        for gate, message in report.notes:
            print(f"NOTE  [{gate}] {message}")
    print(f"  {'gate':<9}{'checked':>8}{'failed':>8}{'errors':>8}{'warnings':>10}")
    for gate in GATES:
        print(f"  {gate:<9}{report.checked[gate]:>8}{report.failed[gate]:>8}"
              f"{report.count(gate, 'error'):>8}{report.count(gate, 'warning'):>10}")
    for kind, counts in report.statuses.items():
        if counts:
            listing = ", ".join(f"{k} {v}" for k, v in sorted(counts.items(), key=lambda kv: str(kv[0])))
            print(f"  {kind}: {listing}")
    verdict = "FAIL" if report.errors else "OK"
    print(f"{verdict} {report.slug}: {len(report.errors)} error(s), {len(report.warnings)} warning(s)")


def main(argv=None):
    parser = argparse.ArgumentParser(description="Validate inductee packages (SPEC sections 3-5).")
    parser.add_argument("slug", nargs="?", help="inductee slug")
    parser.add_argument("--all", action="store_true", help="every inductee under the data folder")
    parser.add_argument("--data-dir", help="data folder (default: repo data/ or $IHH_DATA_DIR)")
    parser.add_argument("--content-dir", help="experience content folder (default: repo content/)")
    parser.add_argument("--quiet", action="store_true", help="omit notes (single-source, G10)")
    args = parser.parse_args(argv)
    if bool(args.slug) == bool(args.all):
        parser.print_usage(sys.stderr)
        print("validate: give one slug or --all", file=sys.stderr)
        return 2

    if args.all:
        slugs = paths.list_slugs(args.data_dir)
        if not slugs:
            print(f"No inductees under {paths.data_dir(args.data_dir) / 'inductees'}")
            return 0
    else:
        slugs = [args.slug]

    failed = 0
    codes = {}
    for slug in slugs:
        try:
            p = paths.inductee_paths(slug, args.data_dir)
        except ValueError as exc:
            print(f"ERROR {exc}")
            return 1
        if not p.exists():
            print(f"ERROR no inductee '{slug}' ({p.inductee_json} not found)")
            return 1
        report = validate_inductee(p, args.content_dir)
        try:
            code = as_dict(records.read_json(p.inductee_json)).get("code")
        except (records.RecordError, AttributeError):
            code = None
        if isinstance(code, str) and code:
            if code in codes:
                report.error("IDS", f"inductee code {code} is also used by {codes[code]}")
            else:
                codes[code] = slug
        print_report(report, args.quiet)
        failed += bool(report.errors)

    if failed:
        print(f"FAIL: {failed} of {len(slugs)} inductee(s) have errors")
        return 1
    print(f"OK: {len(slugs)} inductee(s) valid")
    return 0


if __name__ == "__main__":
    sys.exit(main())
