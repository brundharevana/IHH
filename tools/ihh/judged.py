"""What the adversary judges, and the fingerprint that ties a verdict to it (SPEC 3.3, 3.4, 4).

payload_for() reduces a fact or media item to the fields the adversary may see:
for a fact, the claim, category, date, place, direct-quote flag and each
evidence quote and locator with its source's title, type, institution, url,
fetch_url, archive_url, catalog id, snapshot file and fetch method; for a media
item, its title, type, url, rights statement and url, licence class, credit,
alt text and sources, and for a reconstruction also the claims and sources it
depicts. It never includes the extractor's model or reasoning, notes, review,
used_in, status or an earlier verdict.

fingerprint() is the sha256 of that payload (snapshot paths as the source
records give them, so it does not depend on where the project folder is) plus
the sha256 of every source snapshot it names. tools/adversary.py stores it in
the verdict as `judged_sha256`. A verdict counts only while the record still
has the same fingerprint (verdict_problem()): a changed claim, quote, source
type, institution, url, snapshot, rights field, alt text or basis fact makes
the verdict stale, and tools/compute_status.py treats it as no verdict.
"""

import hashlib
import json
from pathlib import Path


def _text(value):
    return value if isinstance(value, str) and value.strip() else None


def _scalar(value):
    if isinstance(value, bool) or value is None:
        return None
    if isinstance(value, (int, float)):
        return str(value)
    return _text(value)


def _list(value):
    return value if isinstance(value, list) else []


def source_view(sid, src, root):
    """Where a source is and what kind it is; never its notes.

    root None keeps the snapshot path as the record gives it; otherwise it is
    resolved under root to an absolute path.
    """
    src = src if isinstance(src, dict) else {}
    snapshot = src.get("snapshot")
    if isinstance(snapshot, str) and snapshot.strip():
        path = snapshot if root is None else str((Path(root) / snapshot).resolve())
    else:
        path = None
    view = {
        "source_id": sid if isinstance(sid, str) else None,
        "source_title": _text(src.get("title")),
        "source_type": _text(src.get("type")),
        "institution": _text(src.get("institution")),
        "url": _text(src.get("url")),
        "fetch_url": _text(src.get("fetch_url")),
        "archive_url": _text(src.get("archive_url")),
        "catalog_id": _scalar(src.get("catalog_id")),
        "snapshot": path,
        "fetch_method": _text(src.get("fetch_method")),
    }
    # Only when set, so the fingerprint of every source without it is unchanged (2026-10-10).
    if _text(src.get("content_part")):
        view["content_part"] = _text(src.get("content_part"))
    return view


def _source(sources, sid):
    return sources.get(sid) if isinstance(sid, str) else None


def fact_payload(fact, sources, root):
    evidence = []
    for e in _list(fact.get("evidence")):
        if not isinstance(e, dict):
            continue
        sid = e.get("source_id")
        view = source_view(sid, _source(sources, sid), root)
        evidence.append({"source_id": view.pop("source_id"), "quote": _text(e.get("quote")),
                         "locator": _text(e.get("locator")), **view})
    return {
        "id": fact.get("id"),
        "kind": "fact",
        "claim": _text(fact.get("claim")),
        "category": _text(fact.get("category")),
        "event_date": _scalar(fact.get("event_date")),
        "place": _text(fact.get("place")),
        "is_direct_quote": fact.get("is_direct_quote") is True,
        "evidence": evidence,
    }


def media_payload(media, sources, root, facts=None):
    """facts ({id: fact}) is needed for a reconstruction, whose basis facts are shown."""
    facts = facts or {}
    sids = [s for s in _list(media.get("source_ids")) if isinstance(s, str)]
    evidence = [source_view(sid, _source(sources, sid), root) for sid in dict.fromkeys(sids)]
    payload = {
        "id": media.get("id"),
        "kind": "media",
        "title": _text(media.get("title")),
        "media_type": _text(media.get("media_type")),
        "media_url": _text(media.get("url")),
        "rights_statement": _text(media.get("rights_statement")),
        "rights_url": _text(media.get("rights_url")),
        "license_class": _text(media.get("license_class")),
        "credit": _text(media.get("credit")),
        "alt_text": _text(media.get("alt_text")),
        "reconstruction": media.get("reconstruction") is True,
        "evidence": evidence,
    }
    if media.get("record_kind") == "basis-photo":
        # Owner decision 2026-10-16: a basis photo is judged against the place its stop facts name.
        # Only on such records, so every other media fingerprint is unchanged.
        payload["record_kind"] = "basis-photo"
        payload["basis_for"] = [
            {"fact_id": rid, "claim": _text(facts[rid].get("claim")), "event_date": _scalar(facts[rid].get("event_date")),
             "place": _text(facts[rid].get("place"))} if isinstance(facts.get(rid), dict) else {"fact_id": rid}
            for rid in _list(media.get("basis_for")) if isinstance(rid, str)]
    authorship = media.get("authorship")
    if isinstance(authorship, dict):
        # Private writings (owner decision 2026-10-20): the adversary judges the authorship the rights
        # class rests on. Only on such records, so every other media fingerprint is unchanged. Basis
        # sources are named "basis_source" (not source_id): their quotes are checked against the
        # snapshot by G1, and they are not item sources the adversary must find live (G10).
        payload["authorship"] = {
            "kind": _text(authorship.get("kind")),
            "authors": [_authorship_author(a, facts) for a in _list(authorship.get("authors")) if isinstance(a, dict)],
            "published": _authorship_published(authorship.get("published"), facts),
        }
    if payload["reconstruction"]:
        basis = []
        for rid in _list(media.get("reconstruction_basis")):
            if not isinstance(rid, str):
                continue
            if rid in facts and isinstance(facts[rid], dict):
                f = facts[rid]
                basis.append({"fact_id": rid, "claim": _text(f.get("claim")),
                              "event_date": _scalar(f.get("event_date")), "place": _text(f.get("place")),
                              "evidence": fact_payload(f, sources, root)["evidence"]})
            else:
                basis.append(source_view(rid, _source(sources, rid), root))
        payload["basis"] = basis
    return payload


def _authorship_basis(basis, facts):
    if not isinstance(basis, dict):
        return None
    fid = basis.get("fact_id")
    if isinstance(fid, str):
        f = facts.get(fid) if isinstance(facts.get(fid), dict) else {}
        return {"fact_id": fid, "claim": _text(f.get("claim")), "event_date": _scalar(f.get("event_date"))}
    return {"basis_source": _text(basis.get("source_id")), "quote": _text(basis.get("quote"))}


def _authorship_author(a, facts):
    year = a.get("death_year")
    return {"name": _text(a.get("name")), "death_year": year if isinstance(year, int) else None,
            "death_basis": _authorship_basis(a.get("death_basis"), facts)}


def _authorship_published(pub, facts):
    if not isinstance(pub, dict):
        return None
    year = pub.get("year")
    return {"year": year if isinstance(year, int) else None, "basis": _authorship_basis(pub.get("basis"), facts)}


def payload_for(record, kind, sources, root, facts=None):
    if kind == "fact":
        return fact_payload(record, sources, root)
    return media_payload(record, sources, root, facts)


def _source_ids_in(value, out):
    if isinstance(value, dict):
        if isinstance(value.get("source_id"), str):
            out.append(value["source_id"])
        for v in value.values():
            _source_ids_in(v, out)
    elif isinstance(value, list):
        for v in value:
            _source_ids_in(v, out)
    return out


def payload_source_ids(payload):
    """Every source id the payload shows the adversary (evidence, and for a reconstruction its
    basis), once each, in order. The adversary reports one live result per id
    (adversary.live_by_source)."""
    return list(dict.fromkeys(_source_ids_in(payload, [])))


def _canonical(value, sources):
    """The payload with every snapshot path as the source record gives it."""
    if isinstance(value, dict):
        out = {k: _canonical(v, sources) for k, v in value.items()}
        sid = value.get("source_id")
        if "snapshot" in out and isinstance(sid, str):
            src = sources.get(sid)
            out["snapshot"] = src.get("snapshot") if isinstance(src, dict) else None
        return out
    if isinstance(value, list):
        return [_canonical(v, sources) for v in value]
    return value


def fingerprint(payload, sources):
    """sha256 of what the adversary judged: the payload plus each named source's snapshot hash."""
    hashes = []
    for sid in dict.fromkeys(_source_ids_in(payload, [])):
        src = sources.get(sid)
        hashes.append([sid, src.get("snapshot_sha256") if isinstance(src, dict) else None])
    text = json.dumps([_canonical(payload, sources), hashes], sort_keys=True, ensure_ascii=False)
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def record_fingerprint(record, kind, sources, facts=None):
    """The fingerprint of a record as it is now; sources and facts are {id: record}."""
    return fingerprint(payload_for(record, kind, sources, None, facts), sources)


def verdict_problem(record, kind, sources, facts=None):
    """Why the stored adversary verdict does not apply to the record as it is now, else None."""
    adversary = record.get("adversary")
    if not isinstance(adversary, dict) or not adversary:
        return None
    stored = adversary.get("judged_sha256")
    if not isinstance(stored, str) or not stored:
        return ("the adversary verdict does not record what it judged (no judged_sha256); "
                "judge the item again")
    if stored != record_fingerprint(record, kind, sources, facts):
        return ("the record or its sources changed after the adversary judged it (judged_sha256 no longer "
                "matches); judge the item again")
    return None


__all__ = ["source_view", "fact_payload", "media_payload", "payload_for", "payload_source_ids", "fingerprint",
           "record_fingerprint", "verdict_problem"]
