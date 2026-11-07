"""Catalog search adapters for the tour-research step (SPEC section 12).

Discovery only: a lead is a page to read, never evidence. Its text becomes evidence only after
tools/fetch_snapshot.py saves it and the gates and the adversary pass it. Requests go through
ihh.polite.PoliteClient; each search is logged with search_row() into
staging/<family>.searches.jsonl, which merge_staging.py moves into searches.jsonl.
"""

import re
import urllib.parse

FAMILIES = ("tour-loc", "tour-ca", "tour-nara", "tour-wikidata")
HOSTS = ("www.loc.gov", "catalog.archives.gov", "www.wikidata.org")
TOOLS = {"tour-loc": "loc.gov search (JSON API)", "tour-ca": "loc.gov Chronicling America search",
         "tour-nara": "NARA catalog proxy search", "tour-wikidata": "Wikidata entity search (discovery only)"}
DATES_RE = re.compile(r"^[0-9]{4}(-[0-9]{2}-[0-9]{2})?/[0-9]{4}(-[0-9]{2}-[0-9]{2})?$")
COLLECTION_RE = re.compile(r"^[a-z0-9-]+(/[a-z0-9-]+)?$")


def build_url(family, query, dates=None, collection=None, count=25):
    if family not in FAMILIES:
        raise ValueError(f"unknown family {family!r}; use one of {', '.join(FAMILIES)}")
    if not isinstance(query, str) or not query.strip():
        raise ValueError("query must be text")
    count = max(1, min(int(count), 100))
    if dates is not None and not DATES_RE.match(dates):
        raise ValueError("dates must be YYYY/YYYY or YYYY-MM-DD/YYYY-MM-DD")
    if collection is not None and not COLLECTION_RE.match(collection):
        raise ValueError("collection must be a loc.gov path such as photos or collections/<name>")
    if family == "tour-loc":
        params = {"q": query, "fo": "json", "c": count}
        if dates:
            params = {"q": query, "dates": dates, "fo": "json", "c": count}
        return f"https://www.loc.gov/{collection or 'search'}/?" + urllib.parse.urlencode(params)
    if family == "tour-ca":
        params = {"q": query}
        if dates:
            params["dates"] = dates
        params.update({"fo": "json", "c": count})
        return "https://www.loc.gov/collections/chronicling-america/?" + urllib.parse.urlencode(params)
    if family == "tour-nara":
        return "https://catalog.archives.gov/proxy/records/search?" + urllib.parse.urlencode({"q": query, "limit": count})
    return "https://www.wikidata.org/w/api.php?" + urllib.parse.urlencode(
        {"action": "wbsearchentities", "search": query, "language": "en", "type": "item", "format": "json", "limit": count})


def _int(v):
    return v if isinstance(v, int) and not isinstance(v, bool) and v >= 0 else None


class ShapeError(ValueError):
    """A search response this adapter cannot read (a section missing or of another type). The search is
    logged as a parse failure with no result count; nothing is guessed from it."""


def _obj(value, where):
    if not isinstance(value, dict):
        raise ShapeError(f"{where} is {type(value).__name__ if value is not None else 'missing or null'}, not an object")
    return value


def _list(value, where):
    if not isinstance(value, list):
        raise ShapeError(f"{where} is {type(value).__name__ if value is not None else 'missing or null'}, not a list")
    return value


def _count(value, where):
    if _int(value) is None:
        raise ShapeError(f"{where} is {value!r}, not a non-negative integer")
    return value


def parse(family, data):
    """(total, leads) from a search response. Raises ShapeError for any section this adapter does not
    know (the response object, its results list, the result count and its container), so an odd answer
    is a logged parse failure, never a crash and never a guessed count."""
    data = _obj(data, "the response")
    if family in ("tour-loc", "tour-ca"):
        results = _list(data.get("results"), "results")
        total = _count(_obj(data.get("pagination"), "pagination").get("of"), "pagination.of")
        leads = []
        for r in results:
            if not isinstance(r, dict):
                continue
            fmt = r.get("original_format")
            leads.append({"title": r.get("title"), "url": r.get("url") or r.get("id"), "date": r.get("date"),
                          "format": fmt[0] if isinstance(fmt, list) and fmt else None, "has_image": bool(r.get("image_url"))})
        return total, leads
    if family == "tour-nara":
        hits = _obj(_obj(data.get("body"), "body").get("hits"), "body.hits")
        found = _list(hits.get("hits"), "body.hits.hits")
        total = _count(_obj(hits.get("total"), "body.hits.total").get("value"), "body.hits.total.value")
        leads = []
        for n, h in enumerate(found):
            r = _obj(_obj(_obj(h, f"hit {n}").get("_source"), f"hit {n} _source").get("record"), f"hit {n} record")
            if r.get("naId") is None:
                continue
            objects = r.get("digitalObjects")
            leads.append({"title": r.get("title"), "url": f"https://catalog.archives.gov/id/{r['naId']}",
                          "naId": r["naId"], "level": r.get("levelOfDescription"),
                          "digital_objects": len(objects) if isinstance(objects, list) else 0})
        return total, leads
    found = _list(data.get("search"), "search")
    leads = [{"id": e.get("id"), "label": e.get("label"), "description": e.get("description"),
              "url": f"https://www.wikidata.org/wiki/{e.get('id')}", "coord_ref": f"wikidata:{e.get('id')}"}
             for e in found if isinstance(e, dict) and re.match(r"^Q[1-9][0-9]*$", str(e.get("id")))]
    return len(leads), leads


def search_row(family, query, total, run_id, date, agent, notes):
    return {"date": date, "family": family, "tool": TOOLS.get(family, family), "query": query,
            "results": _int(total), "produced": [], "agent": agent, "run_id": run_id, "notes": notes}
