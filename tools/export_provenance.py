"""Export the provenance log for people and machines.

Writes to data/provenance/export/:
- <kind>.csv           one spreadsheet per log file, for the IHH team
- provenance.jsonld    schema.org + PROV-O graph, for IHH's AI chatbot

Refuses to export if the log fails validation.

Usage: python3 tools/export_provenance.py [data/provenance]
"""

import csv
import json
import sys
from pathlib import Path

from validate_provenance import FILES, load, validate

CONTEXT = {
    "@vocab": "https://schema.org/",
    "prov": "http://www.w3.org/ns/prov#",
    "ihh": "https://immigranthallofhonor.org/ns#",
}


def _cell(value):
    if isinstance(value, list):
        return "; ".join(str(v) for v in value)
    return "" if value is None else value


def write_csv(rows, path):
    fields = []
    for row in rows:
        for key in row:
            if key not in fields:
                fields.append(key)
    with path.open("w", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=fields)
        writer.writeheader()
        for row in rows:
            writer.writerow({k: _cell(row.get(k)) for k in fields})


def to_jsonld(log):
    graph = []
    for s in log["sources"]:
        graph.append({
            "@id": f"ihh:{s['id']}",
            "@type": "CreativeWork",
            "name": s["title"],
            "url": s["url"],
            "publisher": {"@type": "Organization", "name": s["institution"]},
            "identifier": s.get("catalog_id"),
            "ihh:sourceType": s["type"],
            "prov:atTime": s["accessed"],
        })
    for f in log["facts"]:
        graph.append({
            "@id": f"ihh:{f['id']}",
            "@type": "Claim",
            "text": f["claim"],
            "about": {"@type": "Person", "name": f["inductee"]},
            "citation": [{"@id": f"ihh:{sid}"} for sid in f["source_ids"]],
            "ihh:status": f["status"],
            "ihh:category": f.get("category"),
            "ihh:eventDate": f.get("event_date"),
            "ihh:verifiedOn": f.get("verified_on"),
            "prov:wasDerivedFrom": [{"@id": f"ihh:{sid}"} for sid in f["source_ids"]],
        })
    for m in log["media"]:
        graph.append({
            "@id": f"ihh:{m['id']}",
            "@type": "MediaObject",
            "name": m.get("title"),
            "license": m["license"],
            "creditText": m["credit"],
            "ihh:reconstruction": m["reconstruction"],
            "prov:wasDerivedFrom": [{"@id": f"ihh:{sid}"} for sid in m["source_ids"]],
        })
    for q in log["searches"]:
        graph.append({
            "@id": f"ihh:{q['id']}",
            "@type": "prov:Activity",
            "prov:startedAtTime": q["date"],
            "instrument": q["tool"],
            "query": q["query"],
            "prov:generated": [{"@id": f"ihh:{x}"} for x in q.get("produced", [])],
        })
    return {"@context": CONTEXT, "@graph": graph}


def main(argv):
    directory = Path(argv[1] if len(argv) > 1 else "data/provenance")
    log = load(directory)
    errors = validate(log)
    if errors:
        for e in errors:
            print(f"ERROR {e}")
        print("Export refused: fix the log first.")
        return 1
    out = directory / "export"
    out.mkdir(exist_ok=True)
    for kind in FILES:
        write_csv(log[kind], out / f"{kind}.csv")
    (out / "provenance.jsonld").write_text(json.dumps(to_jsonld(log), indent=2) + "\n")
    print(f"Exported to {out}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
