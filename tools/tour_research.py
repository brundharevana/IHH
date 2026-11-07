"""The tour-research step for one inductee (SPEC section 12).

    python3 tools/tour_research.py <command> <slug> [options] [--data-dir DIR]

Commands (each prints what it did; exit 0 ok, 1 error or rule problems, 2 blocked, 3 action needed):
  propose   write drafts/tour-map.json from verified facts (a first draft; --force to replace)
  seed      write drafts/tour-map.json from the shipped tour (--app-tour tour-use.generated.json)
  check     the tour-map rules (exit 1 on any problem)
  assemble  drafts/tour.json: chapters in time order, records, place photos, journey, gaps
  plan      the research work order: staging/tour/<run>/workorder.json
  search    one paced, logged catalog search (--family tour-loc|tour-ca|tour-nara|tour-wikidata)
  log       log a discovery search made elsewhere (web search); no network
  snapshot  fetch_snapshot.py for a staged source, paced; a block marks the host blocked for the run
  gate      snapshots, merge_staging, adversary (Codex), compute_status, validate; resumable
  docs      TOUR-RESEARCH.md, ROOMS.md, ARTIFACTS.md sections; export/tour-research.jsonld, export/tour.csv
  compare   drafts/tour.json against the shipped tour (--app-tour)
  status    print the run state

The step never commits, publishes, emails or signs in. Main record files change only through the
existing tools (merge_staging.py, adversary.py, compute_status.py) and ihh/records.py.
"""

import argparse
import datetime
import json
import re
import subprocess
import sys
import time
from pathlib import Path
from urllib.parse import urlsplit

from ihh import paths, polite, records, tour, tour_docs, tour_search
from ihh import staging as staging_mod

TOOLS = Path(__file__).resolve().parent
REPO = TOOLS.parent
DEFAULT_SEARCH_BUDGET = 60
DEFAULT_SNAPSHOT_BUDGET = 80
FEW_FACTS = 10
_BLOCK = re.compile(r"HTTP (403|429)|bot challenge", re.I)
_SHELL = re.compile(r"JavaScript|almost no text", re.I)
DOC_TITLES = {"TOUR-RESEARCH.md": "tour research", "ROOMS.md": "places and rooms", "ARTIFACTS.md": "records per chapter"}


def _call(tool, argv):
    return subprocess.run([sys.executable, str(TOOLS / tool), *argv], cwd=REPO, capture_output=True, text=True)


def _today():
    return datetime.date.today().isoformat()


def _paths(args):
    p = paths.inductee_paths(args.slug, args.data_dir)
    if not p.exists():
        raise SystemExit(f"tour_research: no inductee {args.slug!r} ({p.inductee_json} not found); "
                         "for a new inductee run the ihh-inductee-pipeline workflow first")
    return p


def _data(p):
    return str(p.root.parent.parent)


def _store(p):
    inductee = records.read_json(p.inductee_json)
    names = tuple([inductee.get("name")] + list(inductee.get("aliases") or []))
    return inductee, names, records.read_jsonl(p.facts), records.read_jsonl(p.media)


def _rulings(p):
    """The owner's display rulings on file (review/decisions.jsonl notes; see tour.owner_rulings)."""
    return tour.owner_rulings(records.read_jsonl(p.decisions))


def _map_path(p):
    return p.drafts / "tour-map.json"


def _run_dir(p, run_id):
    if not tour_docs.RUN_RE.match(run_id or ""):
        raise SystemExit(f"tour_research: bad run id {run_id!r}")
    return p.staging / "tour" / run_id


def _load_run(p, args, record_refusal=False):
    """The run state. A run first created only to record a refusal keeps its budget open: the first command
    that uses it (not another refusal) sets the budget from its own --budget / --max-snapshots, as a run it
    created would have had."""
    rp = _run_dir(p, args.run_id) / "run.json"
    st = records.read_json(rp, default=None)
    if st is not None:
        if st.get("budget_open") and not record_refusal:
            del st["budget_open"]
            for key, arg in (("searches", "budget"), ("snapshots", "max_snapshots")):
                if getattr(args, arg, None):
                    st["budget"][key] = getattr(args, arg)
        return rp, st
    st = {
        "run_id": args.run_id, "slug": args.slug, "created": getattr(args, "date", None) or _today(),
        "budget": {"searches": getattr(args, "budget", None) or DEFAULT_SEARCH_BUDGET,
                   "snapshots": getattr(args, "max_snapshots", None) or DEFAULT_SNAPSHOT_BUDGET},
        "searches_used": 0, "snapshots_used": 0, "blocked_hosts": {}, "last_request": {}, "snapshots": [],
        "refused": [], "deferred": [], "steps": {}, "new_ids": [], "all_new_ids": [], "failures": [],
        "in_flight": None}
    if record_refusal:
        st["budget_open"] = True
    return rp, st


def _save_run(rp, st):
    records.write_json(rp, st)


WITHHELD = "(withheld: the text failed the privacy check)"


def _refuse(st, query, family, reason):
    """A refused search, kept in the run. A query that fails the privacy check is never stored: only the
    reason, which names the kind of problem and not the text."""
    private = polite.privacy_problems(query or "", polite.load_hashes())
    st["refused"].append({"query": WITHHELD if private else query, "family": family, "reason": reason})


def _reconcile(st, today):
    """Under the run lock: a request marked in flight by a process that stopped before recording its
    outcome (killed mid-request). It was counted and spaced before it left; its outcome is unknown, so it
    is kept as a failure (its search row, if any, still says the outcome was not recorded)."""
    left = st.get("in_flight")
    if left:
        st["failures"].append({"step": left.get("kind"), "code": None, "date": today,
                               "stderr": f"outcome unknown: the process stopped during {left.get('kind')} "
                                         f"{left.get('target')} (started {left.get('started')})"})
    st["in_flight"] = None


def _append(path, rows):
    records.update_jsonl(path, lambda old: old + list(rows))


SEARCH_KEY = ("date", "family", "tool", "query", "agent", "run_id")  # merge_staging.py's key for "the same search"


PENDING = "outcome not recorded (the request may have been sent)"


def _finish_search(p, row, pending, notes, total):
    """Replace the last pending note (as written by _log_search for this search) with its outcome."""
    key = tuple(str(row.get(k)) for k in SEARCH_KEY)

    def finish(old):
        for r in old:
            text = r.get("notes") or ""
            if tuple(str(r.get(k)) for k in SEARCH_KEY) == key and pending in text:
                i = text.rindex(pending)
                r["notes"] = text[:i] + notes + text[i + len(pending):]
                if total is not None:
                    r["results"] = total
        return old
    records.update_jsonl(p.staging / f"{row['family']}.searches.jsonl", finish)


def _log_search(p, row):
    """Append a search row to staging/<family>.searches.jsonl, or fold it into the staged row with the
    same merge key (merge_staging.py refuses a second row with that key, and the candidates it produced
    would lose their search): the later try's notes are appended, its result count wins when known,
    and the produced lists are joined."""
    key = tuple(str(row.get(k)) for k in SEARCH_KEY)

    def fold(old):
        for r in old:
            if tuple(str(r.get(k)) for k in SEARCH_KEY) == key:
                r["notes"] = "; then: ".join(x for x in (r.get("notes"), row.get("notes")) if x)
                if row.get("results") is not None:
                    r["results"] = row["results"]
                r["produced"] = list(dict.fromkeys((r.get("produced") or []) + (row.get("produced") or [])))
                return old
        return old + [row]
    records.update_jsonl(p.staging / f"{row['family']}.searches.jsonl", fold)


def _print(obj):
    print(json.dumps(obj, ensure_ascii=False, indent=1))


# --- tour map commands -------------------------------------------------------------------------

def cmd_propose(args, **_):
    p = _paths(args)
    if _map_path(p).exists() and not args.force:
        print(f"tour_research: {_map_path(p)} exists; use --force to replace it", file=sys.stderr)
        return 1
    _, _, facts, media = _store(p)
    tm = tour.propose(facts, media, args.slug, args.run_id)
    records.write_json(_map_path(p), tm)
    _print({"written": str(_map_path(p)), "chapters": [c["id"] for c in tm["chapters"]],
            "unassigned_fact_ids": tm["unassigned_fact_ids"]})
    return 0


def cmd_seed(args, **_):
    p = _paths(args)
    if _map_path(p).exists() and not args.force:
        print(f"tour_research: {_map_path(p)} exists; use --force to replace it", file=sys.stderr)
        return 1
    app = json.loads(Path(args.app_tour).read_text(encoding="utf-8"))
    app = app["tours"][args.slug] if "tours" in app else app
    _, _, facts, _ = _store(p)
    tm = tour.seed_from_app(app, args.slug, facts, args.run_id)
    records.write_json(_map_path(p), tm)
    _print({"written": str(_map_path(p)), "chapters": [c["id"] for c in tm["chapters"]], "app_objects": tm["app_objects"]})
    return 0


def _read_map(p):
    if not _map_path(p).exists():
        raise SystemExit(f"tour_research: no {_map_path(p)}; run propose or seed first")
    return records.read_json(_map_path(p))


def cmd_check(args, **_):
    p = _paths(args)
    _, names, facts, media = _store(p)
    problems = tour.check(_read_map(p), facts, media, names, _rulings(p))
    _print({"ok": not problems, "problems": problems})
    return 1 if problems else 0


def cmd_assemble(args, **_):
    p = _paths(args)
    _, names, facts, media = _store(p)
    try:
        out = tour.assemble(_read_map(p), facts, media, names, date=args.date, rulings=_rulings(p))
    except tour.TourError as e:
        _print({"ok": False, "problems": e.problems})
        return 1
    records.write_json(p.drafts / "tour.json", out)
    _print({"ok": True, "written": str(p.drafts / "tour.json"), "chapters": [(c["id"], c["year"]) for c in out["chapters"]],
            "gaps": out["gaps"]})
    return 0


# --- research commands -------------------------------------------------------------------------

def cmd_plan(args, **_):
    p = _paths(args)
    inductee, _, facts, media = _store(p)
    tm = records.read_json(_map_path(p)) if _map_path(p).exists() else tour.propose(facts, media, args.slug, args.run_id)
    items = tour.plan_items(tm, facts, media, inductee["name"], args.max_items, _rulings(p))
    for n, it in enumerate(items, 1):
        it["id"], it["staging_label"] = f"r{n}", f"tour-r{n}"
    verified = sum(1 for f in facts if f.get("status") == "verified")
    if verified < FEW_FACTS:
        print(f"tour_research: {args.slug} has {verified} verified facts (fewer than {FEW_FACTS} verified facts); "
              "run the ihh-inductee-pipeline workflow first for a fuller store", file=sys.stderr)
    rp, st = _load_run(p, args)
    with records.locked(rp):
        rp, st = _load_run(p, args)
        st.setdefault("counts_before", tour_docs.counts(facts, media))
        st["steps"]["plan"] = args.date
        _save_run(rp, st)
    wo = {"slug": args.slug, "run_id": args.run_id, "date": args.date, "map_source": tm.get("source"), "items": items}
    records.write_json(_run_dir(p, args.run_id) / "workorder.json", wo)
    _print(wo)
    return 0


def cmd_search(args, opener=None, sleep=None, **_):
    p = _paths(args)
    try:
        url = tour_search.build_url(args.family, args.query, dates=args.dates, collection=args.collection, count=args.count)
    except ValueError as e:
        print(f"tour_research: {e}", file=sys.stderr)
        return 1
    rp, _ = _load_run(p, args)
    with records.locked(rp):
        rp, st = _load_run(p, args)
        _reconcile(st, args.date)

        def reserve():
            st["in_flight"] = {"kind": "search", "target": url, "started": time.time()}
            _save_run(rp, st)
        client = polite.PoliteClient(st, st["budget"]["searches"], tour_search.HOSTS, opener=opener,
                                     sleep=sleep or time.sleep, on_send=reserve)
        try:
            client.check_target(url)
            if st["searches_used"] >= st["budget"]["searches"]:
                raise polite.Refused(f"search budget of {st['budget']['searches']} reached for this run")
        except polite.Refused as e:
            _refuse(st, args.query, args.family, str(e))
            _save_run(rp, st)
            print(f"tour_research: refused, nothing sent: {e}", file=sys.stderr)
            return 3
        # the row is written before the request leaves, so no sent request goes unlogged
        sent = f"URL: {url}"
        row = tour_search.search_row(args.family, args.query, None, args.run_id, args.date, args.agent, f"{sent}; {PENDING}")
        _log_search(p, row)
        notes, total, leads, code = sent, None, [], 0
        try:
            total, leads = tour_search.parse(args.family, client.get_json(url))
        except polite.Refused as e:
            notes, code = f"{sent}; refused locally, nothing sent: {e}", 3
        except polite.Blocked as e:
            notes, code = f"{sent}; blocked: {e}", 2
        except polite.FetchFailed as e:
            notes, code = f"{sent}; failed: {e}", 1
        except tour_search.ShapeError as e:
            notes, code = f"{sent}; parse failed: {e}; result count unknown", 1
            print(f"tour_research: parse failed: {e}; the search is logged with no result count", file=sys.stderr)
        finally:
            _save_run(rp, st)  # the budget and any block are kept even if something unexpected is raised
        _finish_search(p, row, f"{sent}; {PENDING}", notes, total)
        st["in_flight"] = None  # cleared only once the outcome is in the search row
        _save_run(rp, st)
    _print({"total": total, "leads": leads, "logged": True, "blocked": code == 2})
    return code


AFTER = "logged after the search, without the pre-check"


def cmd_log(args, **_):
    """A discovery search made elsewhere (a web search). With --before it is checked (personal data, the
    run's search budget), counted and logged as pending before it is made; the second call, with its
    result count, completes that row. A search logged only afterwards is still counted, and marked."""
    p = _paths(args)
    text = " ".join([args.query, args.notes or ""])
    problems = polite.privacy_problems(text, polite.load_hashes())
    if not re.match(r"^tour-[a-z0-9]+(-[a-z0-9]+)*$", args.family):
        print("tour_research: family must start with tour-", file=sys.stderr)
        return 1
    if problems:
        # recorded in the run like every other refusal (Codex round 9), with the text withheld
        rp, _ = _load_run(p, args, record_refusal=True)
        with records.locked(rp):
            rp, st = _load_run(p, args, record_refusal=True)
            _reconcile(st, args.date)
            _refuse(st, text, args.family, "the search text " + "; ".join(problems))
            _save_run(rp, st)
        print("tour_research: refused: the search text " + "; ".join(problems) + "; do not make this search",
              file=sys.stderr)
        return 3
    row = {"date": args.date, "family": args.family, "tool": args.tool, "query": args.query,
           "results": None if args.before else args.results, "produced": [], "agent": args.agent,
           "run_id": args.run_id, "notes": PENDING if args.before else args.notes}
    key = tuple(str(row.get(k)) for k in SEARCH_KEY)
    rp, _ = _load_run(p, args)
    with records.locked(rp):
        rp, st = _load_run(p, args)
        _reconcile(st, args.date)
        if args.before:
            if st["searches_used"] >= st["budget"]["searches"]:
                _refuse(st, args.query, args.family, f"search budget of {st['budget']['searches']} reached")
                _save_run(rp, st)
                print(f"tour_research: refused: search budget of {st['budget']['searches']} reached for this run; "
                      "do not make this search", file=sys.stderr)
                return 3
            st["searches_used"] += 1
            _log_search(p, row)
            _save_run(rp, st)
            _print({"logged": True, "pending": True, "next": "make the search, then log it again with --results"})
            return 0
        staged = records.read_jsonl(p.staging / f"{args.family}.searches.jsonl")
        if any(tuple(str(r.get(k)) for k in SEARCH_KEY) == key and PENDING in (r.get("notes") or "") for r in staged):
            _finish_search(p, row, PENDING, args.notes or "", args.results)
        else:
            st["searches_used"] += 1  # it was made: counted even past the budget
            row["notes"] = "; ".join(x for x in (AFTER, args.notes) if x)
            _log_search(p, row)
            _save_run(rp, st)
    _print({"logged": True})
    return 0


def classify_fetch_failure(stderr):
    """blocked (403, 429, bot challenge: never bypassed), js-shell (may be read in a browser) or error."""
    if _BLOCK.search(stderr or ""):
        return "blocked"
    if _SHELL.search(stderr or ""):
        return "js-shell"
    return "error"


def _staged_source(p, sid):
    for f in sorted(p.staging.glob("*.jsonl")):
        if f.name.endswith(".searches.jsonl"):
            continue
        for row in records.read_jsonl(f):
            if row.get("id") == sid:
                return row
    return None


SNAPSHOT_CLOCK = "(any host: previous snapshot)"
def snapshot_url_problems(src, hashes=None):
    """Why a staged source's url or fetch_url may not be requested: https only, and no email address or
    denied personal token (the same check PoliteClient makes for searches). Holder hosts are open, since
    a record may live at any holder; fetch_snapshot.py itself refuses a redirect to another record."""
    hashes = polite.load_hashes() if hashes is None else hashes
    out = []
    for key in ("url", "fetch_url"):
        u = src.get(key)
        if u in (None, ""):
            continue
        if not isinstance(u, str) or urlsplit(u).scheme != "https":
            out.append(f"{key} {u!r} is not https")
            continue
        out += [f"{key} {x}" for x in polite.privacy_problems(polite.unquote(u), hashes)]
    if not (src.get("url") or src.get("fetch_url")):
        out.append("no url")
    return out


def snapshot_one(p, args, sid, call, sleep):
    src = _staged_source(p, sid)
    if src is None:
        return "error", f"{sid} is not a staged source"
    host = urlsplit(src.get("fetch_url") or src.get("url") or "").hostname or ""
    rp, _ = _load_run(p, args)
    with records.locked(rp):
        rp, st = _load_run(p, args)
        _reconcile(st, getattr(args, "date", None))
        problems = snapshot_url_problems(src)
        if problems:
            st["refused"].append({"source": sid, "reason": "; ".join(problems)})
            _save_run(rp, st)
            return "refused", f"{sid}: " + "; ".join(problems) + "; nothing sent"
        hit = polite.blocked_reason(st["blocked_hosts"], host)
        if hit:
            return "blocked", f"{host} blocked earlier in this run ({hit[0]}: {hit[1]}); not retried"
        if st["snapshots_used"] >= st["budget"]["snapshots"]:
            return "budget", f"snapshot budget of {st['budget']['snapshots']} reached"
        # fetch_snapshot.py may make more than one request (a LoC page record, then its OCR text on
        # tile.loc.gov), so a snapshot starts at least MIN_INTERVAL after the previous one ended, on any host
        polite.wait_turn(st["last_request"], host, sleep=sleep)
        polite.wait_turn(st["last_request"], SNAPSHOT_CLOCK, sleep=sleep)
        st["snapshots_used"] += 1
        # counted, spaced and marked in flight on disk before fetch_snapshot.py sends anything
        st["last_request"][host] = st["last_request"][SNAPSHOT_CLOCK] = time.time()
        st["in_flight"] = {"kind": "snapshot", "target": sid, "started": time.time()}
        _save_run(rp, st)
        try:
            # --pace spaces the requests inside the snapshot too (a followed redirect, a LoC page's OCR text)
            r = call("fetch_snapshot.py", [args.slug, sid, "--data-dir", _data(p), "--pace", str(polite.MIN_INTERVAL)])
        finally:
            st["last_request"][host] = st["last_request"][SNAPSHOT_CLOCK] = time.time()
            _save_run(rp, st)
        kind = "ok" if r.returncode == 0 else (classify_fetch_failure(r.stderr) if r.returncode == 2 else "error")
        if kind == "blocked":
            reason = (r.stderr or "blocked").strip().splitlines()[0][:200]
            # the refused request may have been a second one on another host of the holder (the error names
            # the first URL), so the block closes the holder's whole domain (polite.blocked_reason)
            st["blocked_hosts"][host] = reason
        st["snapshots"].append({"source": sid, "host": host, "result": kind, "date": getattr(args, "date", None)})
        st["in_flight"] = None
        _save_run(rp, st)
    return kind, (r.stderr or r.stdout or "").strip()


def cmd_snapshot(args, call=None, sleep=None, **_):
    p = _paths(args)
    kind, msg = snapshot_one(p, args, args.source_id, call or _call, sleep or time.sleep)
    if kind == "blocked":
        # fetch_snapshot.py's own advice for a block is to paste the page from a browser; the owner rule for
        # this step is the opposite (2026-11-01), so only its first line is shown
        first = msg.splitlines()[0] if msg else "blocked"
        print(f"{first}\ntour_research: the host blocked the request; drop this source, never retry it, "
              "never open it in a browser. It goes on the run's check-by-hand list.", file=sys.stderr)
    elif msg:
        print(msg, file=sys.stderr)
    return {"ok": 0, "blocked": 2, "js-shell": 3, "refused": 3}.get(kind, 1)


# --- documents ----------------------------------------------------------------------------------

def _run_searches(p, run_id):
    """The run's searches as logged in searches.jsonl (docs refuses while any search is still staged)."""
    return [r for r in records.read_jsonl(p.searches) if r.get("run_id") == run_id]


def unmerged_staging(p):
    """What is still at the top of staging/ and not merged: every staged search row (merge_staging.py
    moves merged files away) and every candidate with a temporary id, as 'file: id or record n'."""
    out = []
    for f in sorted(p.staging.glob("*" + staging_mod.SEARCHES_SUFFIX)):
        out += [f"{f.name}: {r.get('id') or f'record {n}'}" for n, r in enumerate(records.read_jsonl(f), 1)]
    out += [f"{f.name}: {r['id']}" for f, r in staged_rows(p) if _letter(r.get("id"))]
    return out


def cmd_docs(args, **_):
    p = _paths(args)
    left = unmerged_staging(p)
    if left:
        # a search or candidate staged after the last gate (a coordinate search in Assemble, say) is not in
        # searches.jsonl or the main files yet; the docs would describe a provenance that is not on file
        print(f"tour_research: docs refused, nothing written: {len(left)} staged item(s) not merged: "
              + "; ".join(left[:20]) + ("; ..." if len(left) > 20 else "")
              + f". Run the gate first: tour_research.py gate {args.slug} --run-id {args.run_id} ...", file=sys.stderr)
        return 1
    inductee, names, facts, media = _store(p)
    # rebuilt from the current map and store, never read back from drafts/tour.json, so a stale or
    # hand-edited outline is never documented or exported
    try:
        out = tour.assemble(_read_map(p), facts, media, names, date=args.date, rulings=_rulings(p))
    except tour.TourError as e:
        _print({"ok": False, "problems": e.problems})
        return 1
    records.write_json(p.drafts / "tour.json", out)
    _, st = _load_run(p, args)
    F = {f["id"]: f for f in facts if isinstance(f.get("id"), str)}
    M = {m["id"]: m for m in media if isinstance(m.get("id"), str)}
    ctx = {"name": inductee["name"], "run_id": args.run_id, "date": args.date, "counts_before": st.get("counts_before"),
           "counts_after": tour_docs.counts(facts, media), "searches": _run_searches(p, args.run_id),
           "blocked_hosts": st.get("blocked_hosts"), "deferred": st.get("deferred"), "steps": st.get("steps"),
           "engine": st.get("engine"),
           "model": st.get("model")}
    for name, render in (("TOUR-RESEARCH.md", tour_docs.render_tour_research), ("ROOMS.md", tour_docs.render_rooms),
                         ("ARTIFACTS.md", tour_docs.render_artifacts)):
        path = p.root / name
        old = path.read_text(encoding="utf-8") if path.exists() else f"# {inductee['name']}: {DOC_TITLES[name]}\n"
        new = tour_docs.upsert_block(old, args.run_id, render(out, F, M, ctx))
        tmp = path.with_suffix(".md.tmp")
        tmp.write_text(new, encoding="utf-8")
        tmp.replace(path)
    p.export.mkdir(parents=True, exist_ok=True)
    (p.export / "tour-research.jsonld").write_text(
        json.dumps(tour_docs.tour_graph(out, inductee, ctx), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (p.export / "tour.csv").write_text(tour_docs.tour_csv(out), encoding="utf-8")
    _print({"written": [str(p.root / n) for n in DOC_TITLES] + [str(p.export / "tour-research.jsonld"), str(p.export / "tour.csv")]})
    return 0


def cmd_compare(args, **_):
    p = _paths(args)
    out = records.read_json(p.drafts / "tour.json")
    app = json.loads(Path(args.app_tour).read_text(encoding="utf-8"))
    app = app["tours"][args.slug] if "tours" in app else app
    rep = tour.compare(out, app)
    d = _run_dir(p, args.run_id)
    records.write_json(d / "compare.json", rep)
    (d / "compare.md").write_text(tour_docs.render_compare(rep), encoding="utf-8")
    _print({"summary": rep["summary"], "journey": rep["journey"], "written": str(d / "compare.md")})
    return 0


def cmd_status(args, **_):
    p = _paths(args)
    _, st = _load_run(p, args)
    _print(st)
    return 0


# --- gate ---------------------------------------------------------------------------------------

GATE_STEPS = ("snapshot", "merge", "adversary", "status", "validate")
JUDGED_ID = re.compile(r"^[A-Z]{3}-[FM]-[0-9]{4}$")


def staged_rows(p):
    return [(f, row) for f in sorted(p.staging.glob("*.jsonl")) if not f.name.endswith(staging_mod.SEARCHES_SUFFIX)
            for row in records.read_jsonl(f)]


def _letter(rid):
    m = staging_mod.TEMP_ID_RE.match(rid) if isinstance(rid, str) else None
    return m.group("letter") if m else None


def unsnapshotted_sources(p):
    return [row["id"] for _, row in staged_rows(p)
            if _letter(row.get("id")) == "S" and not (p.staging / "snapshots" / f"{row['id']}.txt").exists()]


def _cites(row, gone):
    refs = {e.get("source_id") for e in row.get("evidence") or [] if isinstance(e, dict)}
    for key in ("source_ids", "reconstruction_basis", "basis_for"):
        if isinstance(row.get(key), list):
            refs.update(x for x in row[key] if isinstance(x, str))
    if isinstance(row.get("derived_from"), str):
        refs.add(row["derived_from"])  # a source that reproduces a deferred source goes with it
    return bool(refs & gone)


def defer_candidates(p, source_ids, run_id, reason):
    """Move the given staged sources, and every candidate that cites one of them (directly or through
    a removed fact), to staging/deferred-<run>/, and drop them from the searches' produced lists, so the
    merge never sees a candidate without its evidence. Returns the removed ids."""
    gone = set(source_ids)
    files = [f for f in sorted(p.staging.glob("*.jsonl")) if not f.name.endswith(staging_mod.SEARCHES_SUFFIX)]
    rows = {f: records.read_jsonl(f) for f in files}
    removed = {f: [] for f in files}
    changed = True
    while changed:
        changed = False
        for f in files:
            keep = []
            for r in rows[f]:
                if r.get("id") in gone or _cites(r, gone):
                    removed[f].append(r)
                    if r.get("id") not in gone:
                        gone.add(r.get("id"))
                        changed = True
                else:
                    keep.append(r)
            rows[f] = keep
    note = f" Deferred by the tour-research gate ({run_id}): {reason}"
    for f in files:
        if removed[f]:
            moved = [dict(r, notes=((r.get("notes") or "") + note).strip()) for r in removed[f]]
            _append(p.staging / f"deferred-{run_id}" / f.name, moved)
            records.write_jsonl(f, rows[f])

    def strip(old):
        for r in old:
            prod = r.get("produced") or []
            kept = [x for x in prod if x not in gone]
            if kept != prod:
                r["produced"] = kept
                r["notes"] = ((r.get("notes") or "") + " Deferred candidates removed: "
                              + ", ".join(sorted(set(prod) - set(kept))) + ".").strip()
        return old
    for sf in sorted(p.staging.glob("*" + staging_mod.SEARCHES_SUFFIX)):
        records.update_jsonl(sf, strip)
    return sorted(r.get("id") for rs in removed.values() for r in rs)


def _staged_sha(p):
    """A fingerprint of the staged candidates (rows with temporary ids) and staged searches, to see
    whether they changed since the gate last ran."""
    import hashlib
    rows = sorted(records.dumps_line(r) for _, r in staged_rows(p) if _letter(r.get("id")))
    rows += sorted(f"{sf.name}\t{records.dumps_line(r)}" for sf in sorted(p.staging.glob("*" + staging_mod.SEARCHES_SUFFIX))
                   for r in records.read_jsonl(sf))  # a search logged after a gate must merge too
    return hashlib.sha256("\n".join(rows).encode("utf-8")).hexdigest()


def _ids_on_file(p):
    return {r.get("id") for path in (p.facts, p.media) for r in records.read_jsonl(path) if isinstance(r.get("id"), str)}


def _fail(rp, st, step, r, code=1):
    st["failures"].append({"step": step, "code": r.returncode, "stderr": (r.stderr or "")[-2000:]})
    _save_run(rp, st)
    print(f"tour_research: gate step {step} failed (exit {r.returncode}); records were not changed to pass it.\n"
          f"{(r.stderr or '').strip()[-2000:]}", file=sys.stderr)
    return code


def cmd_gate(args, call=None, sleep=None, **_):
    call, sleep = call or _call, sleep or time.sleep
    p = _paths(args)
    data = _data(p)
    rp, st = _load_run(p, args)
    with records.locked(rp):
        rp, st = _load_run(p, args)
        reset = None
        if args.from_step:
            reset = args.from_step
        if st["steps"].get("snapshot") and _staged_sha(p) != st.get("staged_sha"):
            reset = "snapshot"  # candidates were staged or changed after the last gate: every step again
        elif args.rejudge.strip() and (reset is None or GATE_STEPS.index(reset) > GATE_STEPS.index("adversary")):
            reset = "adversary"  # ids to judge again: the adversary runs, then status and validate
        if reset:
            if reset in ("snapshot", "merge") and "merge" in st["steps"]:
                st.pop("merge_before", None)  # the last merge finished; the next one starts from what is on file
            for name in GATE_STEPS[GATE_STEPS.index(reset):]:
                st["steps"].pop(name, None)
        _save_run(rp, st)

    if "snapshot" not in st["steps"]:
        needs, deferred = [], []
        for sid in unsnapshotted_sources(p):
            kind, msg = snapshot_one(p, args, sid, call, sleep)
            if kind == "budget":
                print(f"tour_research: {msg}; raise --max-snapshots or split the run", file=sys.stderr)
                return 1
            if kind == "js-shell":
                needs.append({"source": sid, "message": msg.splitlines()[0] if msg else ""})
            elif kind in ("blocked", "error", "refused"):
                deferred.append((sid, kind, msg.splitlines()[0] if msg else kind))
        removed = defer_candidates(p, [d[0] for d in deferred], args.run_id, "source not fetched") if deferred else []
        with records.locked(rp):
            rp, st = _load_run(p, args)
            st["deferred"] += [{"source": sid, "reason": f"{kind}: {msg}", "removed": removed} for sid, kind, msg in deferred]
            if needs:
                _save_run(rp, st)
                _print({"needs_browser": needs, "rule": "JavaScript-only pages may be read in your own browser tab; "
                        "blocked hosts may not"})
                return 3
            st["steps"]["snapshot"] = args.date
            st["staged_sha"] = _staged_sha(p)
            _save_run(rp, st)

    if "merge" not in st["steps"]:
        r = call("merge_staging.py", [args.slug, "--run-id", args.run_id, "--dry-run", "--data-dir", data])
        if r.returncode != 0:
            rp, st = _load_run(p, args)
            return _fail(rp, st, "merge", r)
        rp, st = _load_run(p, args)
        if "merge_before" not in st:
            # saved before the real merge writes anything, so a run that stops inside or right after the
            # merge still knows which ids are new and judges them on resume
            st["merge_before"] = sorted(_ids_on_file(p))
            _save_run(rp, st)
        before = set(st["merge_before"])
        r = call("merge_staging.py", [args.slug, "--run-id", args.run_id, "--data-dir", data])
        if r.returncode != 0:
            rp, st = _load_run(p, args)
            return _fail(rp, st, "merge", r)
        rp, st = _load_run(p, args)
        st["new_ids"] = sorted(_ids_on_file(p) - before)
        st["all_new_ids"] = sorted(set(st["all_new_ids"]) | set(st["new_ids"]))
        st["steps"]["merge"] = args.date
        st["staged_sha"] = _staged_sha(p)
        _save_run(rp, st)

    if "adversary" not in st["steps"]:
        rejudge = [x for x in args.rejudge.replace(" ", ",").split(",") if x]
        ids = [i for i in dict.fromkeys(st["new_ids"] + rejudge) if JUDGED_ID.match(i)]
        if ids:
            argv = [args.slug, "--ids", ",".join(ids), "--engine", "codex", "--run-id", args.run_id, "--data-dir", data]
            if args.model:
                argv += ["--model", args.model]
            r = call("adversary.py", argv)
            if r.returncode != 0:
                rp, st = _load_run(p, args)
                return _fail(rp, st, "adversary", r, code=3 if r.returncode == 3 else 1)
        rp, st = _load_run(p, args)
        st["steps"]["adversary"], st["engine"], st["model"] = args.date, "codex", args.model
        _save_run(rp, st)

    for name, tool in (("status", "compute_status.py"), ("validate", "validate.py")):
        if name not in st["steps"]:
            r = call(tool, [args.slug, "--data-dir", data])
            rp, st = _load_run(p, args)
            if r.returncode != 0:
                return _fail(rp, st, name, r)
            st["steps"][name] = args.date
            _save_run(rp, st)
    _print({"ok": True, "new_ids": st["new_ids"], "deferred": st["deferred"], "blocked_hosts": st["blocked_hosts"]})
    return 0


# --- parser -------------------------------------------------------------------------------------

def _parser():
    ap = argparse.ArgumentParser(description="The tour-research step (SPEC section 12).")
    sub = ap.add_subparsers(dest="command", required=True)

    def add(name, run_id=True, run_required=True):
        s = sub.add_parser(name)
        s.add_argument("slug")
        s.add_argument("--data-dir")
        s.add_argument("--date", default=_today())
        if run_id:
            s.add_argument("--run-id", required=run_required)
        return s

    for name in ("propose", "seed"):
        s = add(name, run_required=False)
        s.add_argument("--force", action="store_true")
        if name == "seed":
            s.add_argument("--app-tour", required=True)
    add("check", run_id=False)
    add("assemble", run_id=False)
    s = add("plan")
    s.add_argument("--max-items", type=int, default=25)
    s = add("search")
    s.add_argument("--family", required=True, choices=tour_search.FAMILIES)
    s.add_argument("--query", required=True)
    s.add_argument("--dates")
    s.add_argument("--collection")
    s.add_argument("--count", type=int, default=25)
    s.add_argument("--agent")
    s.add_argument("--budget", type=int)
    s = add("log")
    for a in ("--family", "--tool", "--query"):
        s.add_argument(a, required=True)
    s.add_argument("--results", type=int)
    s.add_argument("--notes", default="")
    s.add_argument("--agent")
    s.add_argument("--before", action="store_true", help="check, count and log the search before it is made")
    s = add("snapshot")
    s.add_argument("source_id")
    s.add_argument("--max-snapshots", type=int)
    s = add("gate")
    s.add_argument("--model")
    s.add_argument("--rejudge", default="")
    s.add_argument("--from-step", choices=("snapshot", "merge", "adversary", "status", "validate"))
    s.add_argument("--max-snapshots", type=int)
    add("docs")
    s = add("compare")
    s.add_argument("--app-tour", required=True)
    add("status")
    return ap


COMMANDS = {"propose": cmd_propose, "seed": cmd_seed, "check": cmd_check, "assemble": cmd_assemble,
            "plan": cmd_plan, "search": cmd_search, "log": cmd_log, "snapshot": cmd_snapshot,
            "docs": cmd_docs, "compare": cmd_compare, "status": cmd_status}
COMMANDS["gate"] = cmd_gate


def main(argv=None, call=None, opener=None, sleep=None):
    args = _parser().parse_args(argv)
    try:
        return COMMANDS[args.command](args, call=call, opener=opener, sleep=sleep)
    except records.RecordError as e:
        print(f"tour_research: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
