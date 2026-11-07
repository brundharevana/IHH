"""Tour-research documents and provenance (SPEC section 12).

The step writes generated sections into TOUR-RESEARCH.md, ROOMS.md and ARTIFACTS.md between
markers named by run id, so hand-written history in those files is never touched, and exports the
outline for IHH's chatbot as export/tour-research.jsonld and export/tour.csv (PATTERNS: IHH chatbot
provenance). Text is plain and factual; ids are cited, never paraphrased.
"""

import csv
import io
import re

from . import tour

STATUSES = ("verified", "single-source", "disputed", "pending", "rejected", "conflicting")
CONTEXT = {"@vocab": "https://schema.org/", "prov": "http://www.w3.org/ns/prov#",
           "ihh": "https://immigranthallofhonor.org/ns#"}
RUN_RE = re.compile(r"^[A-Za-z0-9._-]+$")
BEGIN, END = "<!-- tour-research:begin {} -->", "<!-- tour-research:end {} -->"


def counts(facts, media):
    tally = lambda rows: {s: sum(1 for r in rows if r.get("status") == s) for s in STATUSES}
    return {"facts": tally(facts), "media": tally(media)}


def upsert_block(text, run_id, body):
    if not isinstance(run_id, str) or not RUN_RE.match(run_id):
        raise ValueError(f"run id {run_id!r} must be letters, digits, dots, underscores and hyphens")
    b, e = BEGIN.format(run_id), END.format(run_id)
    block = f"{b}\n{body.rstrip()}\n{e}\n"
    has_b, has_e = b in text, e in text
    if has_b != has_e or (has_b and text.index(b) > text.index(e)):
        raise ValueError(f"unbalanced tour-research markers for run {run_id}")
    if has_b:
        i, j = text.index(b), text.index(e) + len(e)
        if text[j:j + 1] == "\n":
            j += 1
        return text[:i] + block + text[j:]
    sep = "" if not text or text.endswith("\n\n") else ("\n" if text.endswith("\n") else "\n\n")
    return text + sep + block


def _cell(v):
    return str(v if v not in (None, "") else "-").replace("|", "/").replace("\n", " ")


def _place(c):
    p = c.get("place") or {}
    return f"{p['label']} ({p['fact_id']})" if p.get("label") else "-"


def _counts_rows(label, c):
    return [f"| {label} {kind} | " + " | ".join(str((c or {}).get(kind, {}).get(s, 0)) for s in STATUSES) + " |"
            for kind in ("facts", "media")]


GATE_STEPS = ("snapshot", "merge", "adversary", "status", "validate")


def _gate_line(ctx):
    """What the gate did in this run, from the run state's finished steps (never assumed)."""
    steps = ctx.get("steps") or {}
    done = [s for s in GATE_STEPS if s in steps]
    if not done:
        return ("3. The gate did not run in this run: no candidate was merged or judged, and the outline uses "
                "only records already on file with their current statuses.")
    if len(done) < len(GATE_STEPS):
        return (f"3. `tour_research.py gate` did not finish: done {', '.join(done)}; not done "
                f"{', '.join(s for s in GATE_STEPS if s not in steps)}. Nothing here has passed the gate.")
    return (f"3. The gate ran: snapshot, merge, adversary, status, validate (`fetch_snapshot.py`, `merge_staging.py`, "
            f"`adversary.py` with {ctx.get('engine') or 'codex'} ({ctx.get('model') or 'default model'}), "
            f"`compute_status.py`, `validate.py` (exit 0)).")


def render_tour_research(tour_out, F, M, ctx):
    L = [f"## Tour-research step: run {ctx['run_id']} ({ctx['date']})", "",
         "Written by `tools/tour_research.py docs`; this section is rebuilt when the same run is documented again. "
         "Chapters and pins use verified facts; records are verified, or disputed and shown under a current owner ruling (ARTIFACTS.md gives each record's status). Nothing here is publishable until a reviewer "
         "approves it through `review/decisions.jsonl`.", "",
         "### Counts", "", "| | " + " | ".join(STATUSES) + " |", "|---|" + "---|" * len(STATUSES)]
    L += _counts_rows("Before:", ctx.get("counts_before")) + _counts_rows("After:", ctx.get("counts_after"))
    L += ["", "### Chapters in time order", "",
          "| # | Chapter | Kind | Year (fact) | Verified facts | Place (fact) | Usable records | Link-only | Gaps |",
          "|---|---|---|---|---|---|---|---|---|"]
    for n, c in enumerate(tour_out["chapters"], 1):
        L.append(f"| {n} | {_cell(c.get('title') or c['id'])} | {c['kind']} | {c['year']} ({c['year_fact']}) | "
                 f"{', '.join(c['fact_ids'])} | {_cell(_place(c))} | {_cell(', '.join(c['usable_records']))} | "
                 f"{_cell(', '.join(c['link_only_records']))} | {_cell('; '.join(c['gaps']))} |")
    L += ["", "### Journey", ""]
    j = tour_out.get("journey")
    if not j:
        L.append("No journey: no verified origin and arrival places yet.")
    else:
        L += [f"Chapter: {j['chapter']}.", "", "| From | To | Line | Route facts | Mode |", "|---|---|---|---|---|"]
        for n, s in enumerate(j["segments"]):
            a, b = j["places"][n], j["places"][n + 1]
            line = "routed" if s["routed"] else s["note"]
            L.append(f"| {_cell(a['label'])} ({', '.join(a['fact_ids'])}) | {_cell(b['label'])} ({', '.join(b['fact_ids'])}) | "
                     f"{_cell(line)} | {_cell(', '.join(s['route_facts']))} | {_cell(s['mode'])} |")
    L += ["", "### Gaps", ""] + [f"- {g}" for g in tour_out.get("gaps") or ["none"]]
    if tour_out.get("unassigned_fact_ids"):
        L += ["", "Verified facts not in any chapter: " + ", ".join(tour_out["unassigned_fact_ids"]) + "."]
    searches = ctx.get("searches") or []
    blocked = [s for s in searches if "blocked" in (s.get("notes") or "")]
    fams = {}
    for s in searches:
        fams[s.get("family")] = fams.get(s.get("family"), 0) + 1
    L += ["", "### Searches and blocks", "",
          f"{len(searches)} searches ({len(blocked)} blocked) in this run: "
          + (", ".join(f"{k} {v}" for k, v in sorted(fams.items())) or "none") + ". Every search is in `searches.jsonl`."]
    hosts = ctx.get("blocked_hosts") or {}
    L.append("Blocked hosts: " + (", ".join(f"{h} ({r}; not bypassed)" for h, r in sorted(hosts.items())) or "none") + ".")
    deferred = ctx.get("deferred") or []
    L.append("Deferred sources: " + (", ".join(f"{d.get('source')} ({d.get('reason')})" for d in deferred) or "none") + ".")
    L += ["", "### Method", "",
          "1. `tour_research.py plan`: the work order from the tour map and the store.",
          "2. Research agents (at most two at a time): `tour_research.py search` (paced, logged) and "
          "`tour_research.py snapshot` (saved, hashed copies); candidates staged in `staging/tour-r<n>.jsonl`.",
          _gate_line(ctx),
          "4. `tour_research.py check` and `assemble`: verified facts; records verified, or disputed and shown under a current "
          "owner ruling; chapters in time order.",
          "5. `tour_research.py docs`: these sections and `export/tour-research.jsonld`, `export/tour.csv`."]
    return "\n".join(L) + "\n"


def render_rooms(tour_out, F, M, ctx):
    L = [f"## Tour-research step: places and photos (run {ctx['run_id']})", "",
         "Photo availability and rights only; full rebuild versus photo room is a person's call. Restricted or unknown "
         "photos are private modelling reference only (owner rule 2026-10-16).", "",
         "| # | Chapter | Place (fact) | Coord | Place photos | Photo status |", "|---|---|---|---|---|---|"]
    for n, c in enumerate(tour_out["chapters"], 1):
        photos = c.get("place_photos") or []
        cells = ", ".join(f"{p['media_id']} ({p['license_class']}, {'display' if p['display'] else 'reference only'})"
                          for p in photos)
        if c.get("place") is None:
            status = "no verified place"
        elif any(p["display"] for p in photos):
            status = "photo available"
        else:
            status = "reference only" if photos else "no photo"
        coord = (c.get("place") or {}).get("coord")
        L.append(f"| {n} | {_cell(c.get('title') or c['id'])} | {_cell(_place(c))} | {_cell(coord)} | {_cell(cells)} | {status} |")
    return "\n".join(L) + "\n"


def render_artifacts(tour_out, F, M, ctx):
    L = [f"## Tour-research step: records per chapter (run {ctx['run_id']})", "",
         f"Usable means verified, or disputed under a current owner ruling, with a public-domain, CC0, CC BY or CC BY-SA "
         f"licence from the holder; the target is "
         f"{tour.MIN_RECORDS} per chapter where possible (owner 2026-10-29). Link-only records are shown as links."]
    for n, c in enumerate(tour_out["chapters"], 1):
        k = len(c["usable_records"])
        L += ["", f"### {n}. {c.get('title') or c['id']} ({c['year']})", "",
              f"Usable records: {k}" + (f" (fewer than {tour.MIN_RECORDS})" if k < tour.MIN_RECORDS else "") + ".", ""]
        if not c["records"]:
            L.append("No records yet.")
            continue
        L += ["| Media | Title | Licence | Status | Use | Credit |", "|---|---|---|---|---|---|"]
        for mid in c["records"]:
            m = M.get(mid) or {}
            use = ("usable (owner ruling)" if mid in c.get("owner_ruled_records", [])
                   else "usable" if mid in c["usable_records"] else "link only")
            if mid in c.get("unlinked_records", []):
                use += "; no recorded link to a chapter fact"
            L.append(f"| {mid} | {_cell(m.get('title'))} | {_cell(m.get('license_class'))} | {_cell(m.get('status'))} | {use} | "
                     f"{_cell(m.get('credit'))} |")
    return "\n".join(L) + "\n"


def render_compare(rep):
    s = rep["summary"]
    L = ["# Tour-research dry run: comparison with the shipped tour", "",
         f"Matched {s['matched']} of {s['app_chapters']} chapters; mean fact recall {s['mean_fact_recall']}; "
         f"mean record recall {s['mean_record_recall']}; journey endpoints equal: {rep['journey']['endpoints_equal']}; "
         f"routed flags equal: {rep['journey']['routed_equal']}.", "",
         "| Shipped chapter | Kind | Year | Draft chapter | Year | Fact recall | Missing facts | New facts | Record recall | Missing records | New records |",
         "|---|---|---|---|---|---|---|---|---|---|---|"]
    for r in rep["chapters"]:
        L.append(f"| {r['app_chapter']} | {r['kind']} | {r['app_year']} | {_cell(r['draft_chapter'])} | {_cell(r['draft_year'])} | "
                 f"{_cell(r['fact_recall'])} | {_cell(', '.join(r['missing_facts']))} | {_cell(', '.join(r['new_facts']))} | "
                 f"{_cell(r['record_recall'])} | {_cell(', '.join(r['missing_records']))} | {_cell(', '.join(r['new_records']))} |")
    L += ["", "Draft-only chapters: " + (", ".join(rep["draft_only_chapters"]) or "none") + ".",
          "Shipped objects that are not media records (recreations, panels): "
          + (", ".join(f"{o['object']} ({o['chapter']})" for o in rep["app_objects"]) or "none") + "."]
    return "\n".join(L) + "\n"


def _clean(node):
    return {k: v for k, v in node.items() if v is not None and v != "" and v != [] and v != {}}


def _refs(ids):
    return [{"@id": f"ihh:{i}"} for i in ids]


def tour_graph(tour_out, inductee, ctx):
    slug = inductee["slug"]
    run = f"ihh:run-{slug}-{ctx['run_id']}"
    g = [_clean({"@id": run, "@type": "prov:Activity", "name": f"Tour-research run {ctx['run_id']}",
                 "prov:startedAtTime": ctx.get("date"), "ihh:searchCount": len(ctx.get("searches") or []),
                 "ihh:blockedHosts": sorted(ctx.get("blocked_hosts") or {}), "ihh:adversary": ctx.get("engine"),
                 "ihh:adversaryModel": ctx.get("model")})]
    for n, c in enumerate(tour_out["chapters"], 1):
        place = c.get("place") or {}
        g.append(_clean({
            "@id": f"ihh:tour-{slug}-{c['id']}", "@type": "ihh:TourChapter", "name": c.get("title") or c["id"],
            "position": n, "ihh:kind": c["kind"], "temporalCoverage": str(c["year"]),
            "ihh:yearFact": {"@id": f"ihh:{c['year_fact']}"}, "ihh:usesFact": _refs(c["fact_ids"]),
            "ihh:place": place.get("label"), "ihh:placeFact": {"@id": f"ihh:{place['fact_id']}"} if place.get("fact_id") else None,
            "ihh:coordSource": place.get("coord"), "ihh:showsMedia": _refs(c["usable_records"]),
            "ihh:linkOnlyMedia": _refs(c["link_only_records"]),
            "ihh:ownerRuledMedia": _refs(c.get("owner_ruled_records", [])),
            "ihh:unlinkedMedia": _refs(c.get("unlinked_records", [])),
            "ihh:placePhoto": [{"@id": f"ihh:{p['media_id']}", "ihh:display": p["display"]} for p in c["place_photos"]],
            "ihh:gap": c["gaps"], "about": {"@id": f"ihh:person-{slug}"}, "prov:wasGeneratedBy": {"@id": run}}))
    j = tour_out.get("journey")
    if j:
        g.append(_clean({
            "@id": f"ihh:journey-{slug}", "@type": "ihh:Journey", "ihh:chapter": {"@id": f"ihh:tour-{slug}-{j['chapter']}"},
            "ihh:place": [_clean({"name": p["label"], "ihh:coordSource": p["coord"], "ihh:fact": _refs(p["fact_ids"])})
                          for p in j["places"]],
            "ihh:segment": [_clean({"ihh:routed": s["routed"], "ihh:routeFact": _refs(s["route_facts"]), "ihh:mode": s["mode"],
                                    "ihh:modeFact": _refs(s["mode_facts"]), "description": s["note"]}) for s in j["segments"]],
            "about": {"@id": f"ihh:person-{slug}"}, "prov:wasGeneratedBy": {"@id": run}}))
    return {"@context": CONTEXT, "@graph": g}


CSV_COLUMNS = ("position", "chapter_id", "kind", "year", "year_fact", "fact_ids", "place", "place_fact", "coord",
               "usable_records", "owner_ruled_records", "link_only_records", "unlinked_records", "place_photos", "gaps")


def _safe(v):
    v = "" if v is None else str(v)
    return "'" + v if v[:1] in ("=", "+", "-", "@") else v


def tour_csv(tour_out):
    buf = io.StringIO()
    w = csv.writer(buf, lineterminator="\n")
    w.writerow(CSV_COLUMNS)
    for n, c in enumerate(tour_out["chapters"], 1):
        p = c.get("place") or {}
        w.writerow([_safe(x) for x in (n, c["id"], c["kind"], c["year"], c["year_fact"], " ".join(c["fact_ids"]),
                                       p.get("label"), p.get("fact_id"), p.get("coord"), " ".join(c["usable_records"]),
                                       " ".join(c.get("owner_ruled_records", [])),
                                       " ".join(c["link_only_records"]), " ".join(c.get("unlinked_records", [])),
                                       " ".join(f"{x['media_id']}:{'display' if x['display'] else 'reference'}" for x in c["place_photos"]),
                                       "; ".join(c["gaps"]))])
    return "﻿" + buf.getvalue()
