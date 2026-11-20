"""Build the handoff package an inductee's review team at IHH receives (skill ihh-new-inductee).

    handoff/<slug>-<YYYY-MM-DD>/
      README-FOR-IHH.md   plain English: what is inside, how to review, how to publish, the chatbot files
      REVIEW.md           export/REVIEW.md, copied
      wordpress.html facts.csv sources.csv media.csv searches.csv provenance.jsonld
                          export/ files, copied
      tour-research.jsonld tour.csv
                          copied when the tour-research step wrote them
      CHECK-BY-HAND.md    hosts that blocked automated requests and sources nobody could fetch
      MANIFEST.json       sha256 and size of every other file

The tool copies only. It reads the inductee folder and never writes it: run tools/export.py first
(export.py --preview for a review package). It refuses (exit 1, nothing written) when an export file
is missing, when the bundle folder already exists (unless --force), or when a file it would hand over
holds a denied personal token (tools/tests/privacy_hashes.txt) or an email address. A copied export
file may carry an email address only when the inductee's own source snapshots hold it verbatim (a
holder's published contact address in a rights statement) or when a person names it with
--allow-email (an institution's published address in a search note; recorded in MANIFEST.json). The
files this tool writes carry none. A denied personal token is never allowed.

CHECK-BY-HAND.md reads, without changing them:
  staging/tour/<run>/run.json        blocked_hosts, deferred sources, JavaScript-only pages, refusals
  staging/deferred-<run>/*.jsonl     the deferred source rows (for their url and title)
  staging/check-by-hand.jsonl        rows {date, run_id, host, url, what, reason} the maintainer adds
                                     when a host blocks a request outside the tour-research CLI

--zip also writes handoff/<slug>-<date>.zip next to the folder, with fixed timestamps so the same
bundle gives the same bytes. The summary printed on stdout is JSON: fact counts by status, media
by licence class (rejected items left out), deferred hosts, and the bundle path.

Usage: python3 tools/handoff_bundle.py <slug> [--out DIR] [--zip] [--date YYYY-MM-DD] [--force]
       [--allow-email ADDRESS ...] [--data-dir DIR]
Exit codes: 0 written, 1 refused, 2 usage error (unknown inductee, bad date).
"""

import argparse
import datetime
import hashlib
import json
import re
import shutil
import sys
import tempfile
import zipfile
from pathlib import Path

from ihh import paths, polite, records

REPO = Path(__file__).resolve().parents[1]
DEFAULT_OUT = REPO / "handoff"
REQUIRED = ("REVIEW.md", "wordpress.html", "facts.csv", "sources.csv", "media.csv", "searches.csv",
            "provenance.jsonld")
OPTIONAL = ("tour-research.jsonld", "tour.csv")
STATUSES = ("verified", "single-source", "disputed", "pending", "rejected", "conflicting")
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
PREVIEW_STAMP = "DRAFT — NOT REVIEWED"


class Refused(Exception):
    """The bundle cannot be written; nothing was written."""


# --- reading the store (read only) ------------------------------------------------------------------

def counts(p):
    facts = records.read_jsonl(p.facts)
    media = records.read_jsonl(p.media)
    by_status = {s: sum(1 for f in facts if f.get("status") == s) for s in STATUSES}
    media_status = {s: sum(1 for m in media if m.get("status") == s) for s in STATUSES}
    by_class = {}
    for m in media:
        if m.get("status") == "rejected":
            continue
        cls = m.get("license_class") or "unknown"
        by_class[cls] = by_class.get(cls, 0) + 1
    return by_status, media_status, dict(sorted(by_class.items()))


def _rows(path):
    try:
        return records.read_jsonl(path)
    except records.RecordError:
        return []


def check_by_hand(p):
    """(blocked hosts, items): what a person has to look at by hand."""
    staged = {}
    for f in sorted(p.staging.glob("deferred-*/*.jsonl")):
        for r in _rows(f):
            if isinstance(r.get("id"), str):
                staged.setdefault(r["id"], dict(r, _folder=f.parent.name))
    hosts, items = {}, []
    for rj in sorted(p.staging.glob("tour/*/run.json")):
        try:
            st = records.read_json(rj, default={}) or {}
        except records.RecordError:
            continue
        run = st.get("run_id") or rj.parent.name
        for host, reason in sorted((st.get("blocked_hosts") or {}).items()):
            hosts.setdefault(host, []).append(f"{reason} (run {run})")
        for d in st.get("deferred") or []:
            row = staged.get(d.get("source"), {})
            items.append({"what": row.get("title") or d.get("source"), "id": d.get("source"), "url": row.get("url"),
                          "reason": d.get("reason"), "run": run})
        for s in st.get("snapshots") or []:
            if s.get("result") == "js-shell":
                row = staged.get(s.get("source"), {})
                items.append({"what": row.get("title") or s.get("source"), "id": s.get("source"),
                              "url": row.get("url"), "run": run,
                              "reason": f"JavaScript-only page on {s.get('host')}; read it in a browser by hand"})
        for r in st.get("refused") or []:
            items.append({"what": r.get("source") or r.get("query"), "id": r.get("source"), "url": None,
                          "reason": f"refused locally, nothing sent: {r.get('reason')}", "run": run})
    for r in _rows(p.staging / "check-by-hand.jsonl"):
        if r.get("host"):
            hosts.setdefault(r["host"], []).append(f"{r.get('reason')} (run {r.get('run_id')})")
        items.append({"what": r.get("what"), "id": r.get("id"), "url": r.get("url"), "reason": r.get("reason"),
                      "run": r.get("run_id")})
    listed = {i.get("id") for i in items if i.get("id")}
    leftovers = [r for sid, r in staged.items() if "-S-" in sid and sid not in listed and r.get("url")]
    return dict(sorted(hosts.items())), items, leftovers


# --- writing the bundle ------------------------------------------------------------------------------

def _cell(text):
    return str(text if text not in (None, "") else "-").replace("|", "/").replace("\n", " ")


def check_by_hand_md(name, hosts, items, leftovers):
    out = [f"# Check by hand: {name}", "",
           "The pipeline never works around a site that refuses automated requests, and it does not open pages",
           "in a browser on its own. These hosts and sources were set aside for a person to check. Nothing listed",
           "here was used as evidence.", ""]
    if not (hosts or items or leftovers):
        out += ["Nothing was deferred in this run.", ""]
        return "\n".join(out)
    out += ["## Hosts that refused automated requests", ""]
    if hosts:
        out += ["| Host | Reason |", "|---|---|"]
        out += [f"| {_cell(h)} | {_cell('; '.join(r))} |" for h, r in hosts.items()]
    else:
        out.append("None.")
    out += ["", "## Sources not fetched", ""]
    if items:
        out += ["| What | Id | Link | Reason | Run |", "|---|---|---|---|---|"]
        out += [f"| {_cell(i.get('what'))} | {_cell(i.get('id'))} | {_cell(i.get('url'))} | {_cell(i.get('reason'))} | "
                f"{_cell(i.get('run'))} |" for i in items]
    else:
        out.append("None.")
    if leftovers:
        out += ["", "## Other sources set aside", "",
                "Staged in an earlier step and moved aside (for example over the fact cap). They may still be worth",
                "a look.", "", "| Id | Title | Link | Folder |", "|---|---|---|---|"]
        out += [f"| {_cell(r.get('id'))} | {_cell(r.get('title'))} | {_cell(r.get('url'))} | {_cell(r.get('_folder'))} |"
                for r in leftovers]
    out.append("")
    return "\n".join(out)


def readme_md(name, slug, date, preview, files, fact_counts, media_status, by_class, n_hosts, n_items):
    has = set(files)
    lines = [f"# {name}: review package for the Immigrant Hall of Honor", "",
             f"Prepared {date}. Inductee folder: `{slug}`.", ""]
    if preview:
        lines += ["**This is a preview package. Do not publish it.** Every block of `wordpress.html` is stamped",
                  f"\"{PREVIEW_STAMP}\". It is for your review only. After your decisions are recorded, the",
                  "maintainer builds the final package, which holds only the statements you approved.", ""]
    else:
        lines += ["This is a final package: it holds only verified statements that a reviewer approved.", ""]
    lines += ["## What is inside", "", "| File | What it is for |", "|---|---|",
              "| `README-FOR-IHH.md` | This guide |",
              "| `REVIEW.md` | Your checklist: every statement and image that needs a decision, with the source quote and the checker's reasons |",
              "| `wordpress.html` | The page content, ready to paste into the WordPress block editor |",
              "| `facts.csv` | Every statement, its status and its sources (opens in Excel or Google Sheets) |",
              "| `sources.csv` | Every source: title, institution, link, date read |",
              "| `media.csv` | Every image or document found, with the holder's rights statement, licence and credit line |",
              "| `searches.csv` | Every search that was run, including the ones that found nothing |",
              "| `provenance.jsonld` | The same records in machine-readable form, for IHH's chatbot |"]
    if "tour-research.jsonld" in has:
        lines.append("| `tour-research.jsonld` | The museum tour research (chapters, places, records) for the chatbot |")
    if "tour.csv" in has:
        lines.append("| `tour.csv` | The tour chapters and the facts and records in each, as a table |")
    lines += ["| `CHECK-BY-HAND.md` | Sites that refused automated requests and sources a person should look at |",
              "| `MANIFEST.json` | A fingerprint (sha256) of every file, so you can tell nothing changed in transit |", ""]
    lines += ["## Where things stand", "",
              "| Status | Statements | Images and documents |", "|---|---|---|"]
    lines += [f"| {s} | {fact_counts[s]} | {media_status[s]} |" for s in STATUSES]
    lines += ["", "Images and documents by licence (rejected items left out): "
              + (", ".join(f"{k} {v}" for k, v in by_class.items()) or "none") + ".",
              f"To check by hand: {n_hosts} site(s), {n_items} source(s) (see `CHECK-BY-HAND.md`).", ""]
    lines += ["## What the statuses mean", "",
              "- **verified**: backed by the original record, or by two independent institutions, and an independent",
              "  checker agreed. It can be published once you approve it.",
              "- **single-source**: the source supports it, but only one institution says so. Not publishable yet.",
              "- **disputed**: the independent checker disagreed or could not confirm it. A person decides.",
              "- **pending**: not checked yet, or a check failed.",
              "- **rejected**: withdrawn. It stays in the log so the history is complete.",
              "- **conflicting**: sources disagree; both versions are recorded.", ""]
    lines += ["## How to review", "",
              "1. Open `REVIEW.md`. For each item, open the source link and find the quoted sentence.",
              "2. Check that the statement says no more than the quote does.",
              "3. Mark your decision next to the item: approve, edit (write the new wording), reject, or note.",
              "4. Send the marked-up file back to the maintainer, who records the decisions. Edited statements are",
              "   checked again before they can be used.",
              "",
              "Approving does not override the checks: a statement is published only when it is verified and approved.",
              ""]
    lines += ["## How to publish to WordPress (final package only)", "",
              f"Never paste a preview (a preview has \"{PREVIEW_STAMP}\" on every block).", "",
              "1. Open the inductee's page in the WordPress editor. WordPress keeps revisions, so the previous version",
              "   can be restored; you can also make a draft copy of the page first.",
              "2. Open the options menu (the three dots at the top right) and choose **Code editor**.",
              "3. Paste the contents of `wordpress.html` where the new content should go.",
              "4. Choose **Exit code editor**. The content appears as normal blocks with source links and credit lines.",
              "5. Preview the page, check that the images show and the source links open, then save or update.",
              "",
              "Only images the holder marks as public domain or under an open licence (CC0, CC BY, CC BY-SA) are shown;",
              "everything else appears as a link. Keep every credit line and source link as it is.", ""]
    lines += ["## The chatbot files", "",
              "`provenance.jsonld` (and `tour-research.jsonld` when present) describe every statement, source, image,",
              "search and checker verdict in a standard machine-readable form (JSON-LD). IHH's chatbot can read them to",
              "answer questions with the source behind each answer. `searches.csv` lists every search, including the",
              "empty ones, so the chatbot can also say where the research looked.", ""]
    lines += ["## Checking the files", "",
              "`MANIFEST.json` lists each file with its sha256 fingerprint. On a Mac, `shasum -a 256 <file>` prints",
              "the same value; if it differs, the file changed after the package was built.", ""]
    return "\n".join(lines)


def holder_addresses(p):
    """Email addresses that appear in the inductee's own source snapshots: a holder's published contact
    address quoted verbatim in a rights statement (for example an archive's permissions address)."""
    found = set()
    for snap in sorted(p.snapshots.glob("*.txt")):
        found |= {m.lower() for m in polite.EMAIL.findall(snap.read_text(encoding="utf-8", errors="replace"))}
    return found


def privacy_hits(name, data, hashes, allowed=frozenset()):
    """Reasons a file may not be handed over: an email address (other than an allowed holder address
    quoted from a snapshot) or a denied personal token (always refused)."""
    try:
        text = data.decode("utf-8")
    except UnicodeDecodeError:
        return []
    out = []
    if any(m.lower() not in allowed for m in polite.EMAIL.findall(text)):
        out.append(f"{name} contains an email address")
    if hashes:
        hits = {t for t in polite.TOKEN.findall(text.lower()) if hashlib.sha256(t.encode()).hexdigest() in hashes}
        if hits:
            out.append(f"{name} contains {len(hits)} denied personal token(s)")
    return out


def _zip(folder, zpath, date):
    stamp = tuple(int(x) for x in date.split("-")) + (0, 0, 0)
    tmp = zpath.with_name(zpath.name + ".tmp")
    with zipfile.ZipFile(tmp, "w", compression=zipfile.ZIP_DEFLATED) as z:
        for f in sorted(folder.iterdir()):
            info = zipfile.ZipInfo(f"{folder.name}/{f.name}", date_time=stamp)
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o644 << 16
            z.writestr(info, f.read_bytes())
    tmp.replace(zpath)


def build(slug, out, date, data=None, make_zip=False, force=False, allow_emails=()):
    p = paths.inductee_paths(slug, data)
    if not p.exists():
        raise FileNotFoundError(f"no inductee '{slug}' ({p.inductee_json} not found)")
    inductee = records.read_json(p.inductee_json, default={}) or {}
    name = inductee.get("name") or slug
    export = p.root / "export"
    missing = [n for n in REQUIRED if not (export / n).is_file()]
    if missing:
        raise Refused(f"export file(s) missing: {', '.join(missing)}; run python3 tools/export.py {slug} --preview first")
    copied = {n: (export / n).read_bytes() for n in REQUIRED + OPTIONAL if (export / n).is_file()}
    preview = PREVIEW_STAMP in copied["wordpress.html"].decode("utf-8", "replace")
    fact_counts, media_status, by_class = counts(p)
    hosts, items, leftovers = check_by_hand(p)
    generated = {
        "CHECK-BY-HAND.md": check_by_hand_md(name, hosts, items, leftovers).encode("utf-8"),
        "README-FOR-IHH.md": readme_md(name, slug, date, preview, list(copied), fact_counts, media_status, by_class,
                                       len(hosts), len(items) + len(leftovers)).encode("utf-8"),
    }
    files = dict(copied, **generated)
    hashes = polite.load_hashes()
    # copied export files may quote a holder's address from a snapshot; the files this tool writes may not
    allowed = sorted({a.strip().lower() for a in allow_emails if a and a.strip()})
    quoted = holder_addresses(p) | set(allowed)
    problems = [x for n, b in sorted(files.items())
                for x in privacy_hits(n, b, hashes, quoted if n in copied else frozenset())]
    if problems:
        raise Refused("; ".join(problems) + "; fix the store or export, never the bundle")

    out = Path(out)
    folder = out / f"{slug}-{date}"
    if folder.exists() and not force:
        raise Refused(f"{folder} exists; pass --force to replace it")
    manifest = {"slug": slug, "name": name, "date": date, "preview": preview, "allowed_emails": allowed,
                "files": [{"path": n, "sha256": hashlib.sha256(b).hexdigest(), "bytes": len(b)}
                          for n, b in sorted(files.items())]}
    files["MANIFEST.json"] = (json.dumps(manifest, indent=2, ensure_ascii=False) + "\n").encode("utf-8")
    out.mkdir(parents=True, exist_ok=True)
    tmp = Path(tempfile.mkdtemp(prefix=f".{slug}-{date}.", dir=out))
    try:
        for n, b in files.items():
            (tmp / n).write_bytes(b)
        if folder.exists():
            shutil.rmtree(folder)
        tmp.rename(folder)
    finally:
        if tmp.exists():
            shutil.rmtree(tmp)
    zpath = None
    if make_zip:
        zpath = out / f"{slug}-{date}.zip"
        _zip(folder, zpath, date)
    return {"bundle": str(folder), "zip": str(zpath) if zpath else None, "preview": preview,
            "facts": fact_counts, "media": media_status, "media_by_licence": by_class,
            "deferred_hosts": sorted(hosts), "check_by_hand_items": len(items) + len(leftovers)}


def main(argv=None):
    ap = argparse.ArgumentParser(description="Build the IHH handoff package for one inductee (copies only).")
    ap.add_argument("slug")
    ap.add_argument("--out", default=str(DEFAULT_OUT), help="parent folder (default: repo handoff/)")
    ap.add_argument("--zip", action="store_true", help="also write <slug>-<date>.zip next to the folder")
    ap.add_argument("--date", default=datetime.date.today().isoformat(), help="bundle date (default today)")
    ap.add_argument("--force", action="store_true", help="replace a bundle folder of the same date")
    ap.add_argument("--allow-email", action="append", default=[], metavar="ADDRESS",
                    help="an institution's published address a person confirmed may appear in a copied export "
                         "file (repeatable; recorded in MANIFEST.json; never allowed in the files this tool writes)")
    ap.add_argument("--data-dir", help="data folder (default: repo data/ or $IHH_DATA_DIR)")
    args = ap.parse_args(argv)
    if not DATE_RE.match(args.date):
        print("handoff_bundle: --date must be YYYY-MM-DD", file=sys.stderr)
        return 2
    try:
        summary = build(args.slug, args.out, args.date, args.data_dir, args.zip, args.force, args.allow_email)
    except (FileNotFoundError, ValueError) as e:
        print(f"handoff_bundle: {e}", file=sys.stderr)
        return 2
    except (Refused, records.RecordError) as e:
        print(f"handoff_bundle: refused, nothing written: {e}", file=sys.stderr)
        return 1
    print(json.dumps(summary, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
