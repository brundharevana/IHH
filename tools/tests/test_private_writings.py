"""Tests for the private-writings rights rule (owner decision 2026-10-20, docs/handoff/DECISIONS.md
"Private writings in public archives"; tools/ihh/rights.py, SPEC 3.4.3).

A privately written item (letter, petition, application text, memo) held in public files may be
embedded only if (a) every author died before 1956, each death year backed by a verified fact or a
quote in an intact source snapshot (an authority record), or (b) the holder itself states it is
public domain, or (c) it was published before 1931 (backed the same way). Otherwise it is link-only.
NARA "Unrestricted" alone is not a rights grant for such an item. Records created by the federal
government (authorship kind "federal", or no authorship recorded) follow the LoC / NARA rule as
before.

All data is fake (factories.py).
"""

import copy

import pytest

import factories as fx
from ihh import gates, judged, rights, schema

PD, NOT_USABLE = rights.PUBLIC_DOMAIN, rights.NOT_USABLE

NARA = "title: Example letter\nuseRestriction.status: Unrestricted\n"
DEATH_FACT = "TST-F-0005"
DEATH_CLAIM = "Testa Q. Persona died on March 1, 1950 in Example City."


def world_with_death_fact(status="verified", claim=DEATH_CLAIM, event_date="1950-03-01"):
    w = fx.world()
    w["facts"].append(fx.fact(DEATH_FACT, claim, "death", [("TST-S-0002", "Test Person")],
                              event_date=event_date, status=status))
    return w


def private(*authors, published=None):
    out = {"kind": "private", "authors": list(authors)}
    if published is not None:
        out["published"] = published
    return out


def author(name="Testa Q. Persona", year=1950, basis=None):
    return {"name": name, "death_year": year, "death_basis": basis if basis is not None else {"fact_id": DEATH_FACT}}


def letter(w, license_class="unknown", authorship=None, text=NARA, statement="Unrestricted", n=1, holder="nara"):
    m = fx.add_holder_media(w, n, holder, text, statement, license_class)
    m["media_type"] = "document"
    if authorship is not None:
        m["authorship"] = authorship
    m["verified_claim_sha256"] = gates.media_lock_sha256(m)
    fx.stamp(w, m, "media")
    return m


def statuses(w):
    return {f["id"]: f.get("status") for f in w["facts"]}


def g1(w, m):
    return gates.g1_media(m, fx.context(w), statuses(w))


def lookup(w):
    return gates.private_lookup(fx.context(w), statuses(w))


def holders(w, m):
    ctx = fx.context(w)
    return rights.holders_of(m, ctx.sources, lambda sid: w["snapshots"].get(sid), ctx.registry)


def ruling(w, m):
    return rights.item_ruling(m, holders(w, m), lookup(w))


# --- NARA "Unrestricted" is not a grant for a private writing ------------------------------------

def test_unrestricted_alone_does_not_make_a_private_letter_usable():
    w = fx.world()
    m = letter(w, "public-domain", private(author("Example Signer", None, None) | {"death_basis": None}))
    failures = g1(w, m)
    assert any("private-writings rule" in x for x in failures)
    m["license_class"] = "unknown"
    assert g1(w, m) == []
    assert rights.derive(m, holders(w, m), lookup(w)) == ({}, [])


def test_federal_and_unrecorded_authorship_keep_the_nara_rule():
    w = fx.world()
    fed = letter(w, "public-domain", {"kind": "federal", "authors": []})
    assert g1(w, fed) == []
    legacy = letter(w, "public-domain", None, n=2)
    assert g1(w, legacy) == []
    assert ruling(w, legacy).result == PD


# --- (a) every author died before 1956 -------------------------------------------------------------

def test_author_dead_before_1956_on_a_verified_fact_is_public_domain():
    w = world_with_death_fact()
    m = letter(w, "public-domain", private(author()))
    assert g1(w, m) == []
    r = ruling(w, m)
    assert r.result == PD and DEATH_FACT in r.basis and "1950" in r.basis


def test_derive_grants_public_domain_under_condition_a():
    w = world_with_death_fact()
    m = letter(w, "unknown", private(author()))
    changes, problems = rights.derive(m, holders(w, m), lookup(w))
    assert changes == {"license_class": PD} and problems == []
    assert any("private-writings rule" in x and "public-domain" in x for x in g1(w, m))


@pytest.mark.parametrize("year", [1956, 1970])
def test_author_dead_in_or_after_1956_is_link_only(year):
    claim = DEATH_CLAIM.replace("1950", str(year))
    w = world_with_death_fact(claim=claim, event_date=f"{year}-03-01")
    m = letter(w, "public-domain", private(author(year=year)))
    assert any("private-writings rule" in x for x in g1(w, m))
    assert ruling(w, m).result == NOT_USABLE


@pytest.mark.parametrize("status", ["single-source", "pending", "disputed", "rejected"])
def test_death_fact_must_be_verified(status):
    w = world_with_death_fact(status=status)
    m = letter(w, "public-domain", private(author()))
    assert ruling(w, m).result == NOT_USABLE
    assert any("private-writings rule" in x for x in g1(w, m))


@pytest.mark.parametrize("claim,event_date", [
    ("Testa Q. Persona lived in Example City in 1950.", "1950"),         # no death word
    ("Example Other died on March 1, 1950.", "1950-03-01"),              # another person
    ("Testa Q. Persona died in Example City.", None),                     # no year at all
    ("Testa Q. Persona died on March 1, 1949.", "1949-03-01"),            # another year
])
def test_death_fact_must_state_the_authors_death_in_that_year(claim, event_date):
    w = world_with_death_fact(claim=claim, event_date=event_date)
    m = letter(w, "unknown", private(author()))
    assert ruling(w, m).result == NOT_USABLE


def test_event_date_year_backs_a_death_claim_without_the_year_in_its_text():
    w = world_with_death_fact(claim="Testa Q. Persona died in Example City.", event_date="1950")
    m = letter(w, "unknown", private(author()))
    assert ruling(w, m).result == PD


def test_unknown_death_fact_is_link_only():
    w = fx.world()
    m = letter(w, "unknown", private(author(basis={"fact_id": "TST-F-0999"})))
    assert ruling(w, m).result == NOT_USABLE


def test_authority_record_quote_backs_a_death_year():
    w = fx.world()
    text = NARA + "contributors[0].heading: Persona, Testa Q., 1900-1950\n"
    m = letter(w, "unknown", private(author(basis={"source_id": "TST-S-0101",
                                                   "quote": "Persona, Testa Q., 1900-1950"})), text=text)
    assert ruling(w, m).result == PD
    # A quote that is not in the snapshot backs nothing.
    m["authorship"] = private(author(basis={"source_id": "TST-S-0101", "quote": "Persona, Testa Q., 1900-1949"}))
    assert ruling(w, m).result == NOT_USABLE
    # An unknown source backs nothing.
    m["authorship"] = private(author(basis={"source_id": "TST-S-0999", "quote": "Persona, Testa Q., 1900-1950"}))
    assert ruling(w, m).result == NOT_USABLE


def test_authority_quote_must_name_the_author_and_their_death():
    w = fx.world()
    text = NARA + "note: Example Other, 1900-1950\nnote2: Persona, Testa Q., born 1950\n"
    m = letter(w, "unknown", private(author(basis={"source_id": "TST-S-0101", "quote": "Example Other, 1900-1950"})),
               text=text)
    assert ruling(w, m).result == NOT_USABLE
    m["authorship"] = private(author(basis={"source_id": "TST-S-0101", "quote": "Persona, Testa Q., born 1950"}))
    assert ruling(w, m).result == NOT_USABLE


def test_every_author_must_qualify():
    w = world_with_death_fact()
    other = {"name": "Example Cosigner", "death_year": None, "death_basis": None}
    m = letter(w, "public-domain", private(author(), other))
    assert ruling(w, m).result == NOT_USABLE
    assert any("Example Cosigner" in x for x in g1(w, m))


def test_a_private_item_with_no_authors_is_link_only():
    w = fx.world()
    m = letter(w, "unknown", private())
    assert ruling(w, m).result == NOT_USABLE


def test_a_barred_holder_status_still_bars_a_private_item():
    w = world_with_death_fact()
    text = "title: Example letter\nuseRestriction.status: Restricted - Possibly\n"
    m = letter(w, "public-domain", private(author()), text=text, statement="Restricted - Possibly")
    assert ruling(w, m).result == NOT_USABLE
    assert any("never usable" in x for x in g1(w, m))


# --- (b) the holder states public domain -----------------------------------------------------------

HOLDER_PD = "Rights: Public Domain, Free of Known Copyright Restrictions.\n"


def test_holder_statement_of_public_domain_makes_a_private_item_usable():
    w = fx.world()
    unknown = {"name": "Example Cosigner", "death_year": None, "death_basis": None}
    m = letter(w, "public-domain", private(unknown), text="title: Example letter\n" + HOLDER_PD,
               statement="Public Domain, Free of Known Copyright Restrictions.", holder="news")
    # news.example.org is not a registered holder in the test registry: it states nothing for the holder.
    assert ruling(w, m).result == NOT_USABLE
    w2 = fx.world()
    m2 = letter(w2, "unknown", private(unknown), text="title: Example letter\n" + HOLDER_PD,
                statement="Public Domain, Free of Known Copyright Restrictions.", holder="nara")
    r = ruling(w2, m2)
    assert r.result == PD and "TST-S-0101" in r.basis
    assert rights.derive(m2, holders(w2, m2), lookup(w2))[0] == {"license_class": PD}


@pytest.mark.parametrize("statement", [
    "This item is not in the public domain.",
    "Not public domain; permission required.",
    "Unrestricted",
    "No known restrictions on publication.",
])
def test_only_an_explicit_public_domain_statement_counts(statement):
    w = fx.world()
    unknown = {"name": "Example Cosigner", "death_year": None, "death_basis": None}
    m = letter(w, "unknown", private(unknown), text=f"title: Example letter\nrights: {statement}\n",
               statement=statement, holder="nara")
    assert ruling(w, m).result == NOT_USABLE


def test_a_media_only_host_never_states_public_domain_for_the_holder():
    w = fx.world()
    unknown = {"name": "Example Cosigner", "death_year": None, "death_basis": None}
    m = letter(w, "unknown", private(unknown), text="LicenseShortName: Public domain\n",
               statement="Public domain", holder="commons")
    assert ruling(w, m).result == NOT_USABLE


# --- (c) published before 1931 ----------------------------------------------------------------------

def test_publication_before_1931_makes_a_private_item_usable():
    w = fx.world()
    text = NARA + "note: Printed and published in 1913 by the Example Society.\n"
    unknown = {"name": "Example Cosigner", "death_year": None, "death_basis": None}
    pub = {"year": 1913, "basis": {"source_id": "TST-S-0101", "quote": "published in 1913"}}
    m = letter(w, "unknown", private(unknown, published=pub), text=text)
    r = ruling(w, m)
    assert r.result == PD and "1913" in r.basis
    late = {"year": 1931, "basis": {"source_id": "TST-S-0101", "quote": "published in 1913"}}
    m["authorship"] = private(unknown, published=late)
    assert ruling(w, m).result == NOT_USABLE
    # The basis must say the item was published in that year.
    bad = {"year": 1913, "basis": {"source_id": "TST-S-0101", "quote": "Example Society"}}
    m["authorship"] = private(unknown, published=bad)
    assert ruling(w, m).result == NOT_USABLE


# --- derive withdraws a grant that rested only on the LoC / NARA wording ----------------------------

def test_derive_withdraws_an_unreviewed_grant_that_rested_on_unrestricted():
    w = fx.world()
    unknown = {"name": "Example Cosigner", "death_year": None, "death_basis": None}
    m = letter(w, "public-domain", private(unknown))
    changes, problems = rights.derive(m, holders(w, m), lookup(w))
    assert changes == {"license_class": "unknown"} and problems == []
    r = ruling(w, m)
    note = rights.change_note(changes, r.value, "2026-10-20", r.basis, private=True)
    assert "private-writings rule" in note and "2026-10-20" in note


def test_derive_never_overrides_a_person_approved_licence():
    w = fx.world()
    unknown = {"name": "Example Cosigner", "death_year": None, "death_basis": None}
    m = letter(w, "public-domain", private(unknown))
    m["review"] = {"state": "approved", "reviewer": "Example Reviewer", "date": fx.TODAY, "note": ""}
    changes, problems = rights.derive(m, holders(w, m), lookup(w))
    assert changes == {} and problems and "private-writings rule" in problems[0]


# --- schema ---------------------------------------------------------------------------------------

def media_errors(m):
    return schema.record_problems("media", m)[0]


def test_schema_accepts_well_formed_authorship():
    w = world_with_death_fact()
    m = letter(w, "public-domain", private(author()))
    assert not [e for e in media_errors(m) if "authorship" in e]
    m["authorship"] = {"kind": "federal", "authors": []}
    assert not [e for e in media_errors(m) if "authorship" in e]
    m["authorship"] = private({"name": "X Y", "death_year": None, "death_basis": None},
                              published={"year": 1913, "basis": {"source_id": "TST-S-0101", "quote": "q"}})
    assert not [e for e in media_errors(m) if "authorship" in e]


@pytest.mark.parametrize("bad", [
    {"kind": "corporate", "authors": []},
    {"kind": "private"},
    {"kind": "private", "authors": [{"name": "", "death_year": 1950, "death_basis": {"fact_id": "TST-F-0005"}}]},
    {"kind": "private", "authors": [{"name": "X Y", "death_year": 1950, "death_basis": None}]},
    {"kind": "private", "authors": [{"name": "X Y", "death_year": "1950", "death_basis": {"fact_id": "TST-F-0005"}}]},
    {"kind": "private", "authors": [{"name": "X Y", "death_year": 1950, "death_basis": {"fact_id": "nope"}}]},
    {"kind": "private", "authors": [{"name": "X Y", "death_year": 1950,
                                     "death_basis": {"source_id": "TST-S-0101"}}]},
    {"kind": "private", "authors": [], "published": {"year": 1913}},
    "private",
])
def test_schema_refuses_malformed_authorship(bad):
    w = fx.world()
    m = letter(w, "unknown")
    m["authorship"] = bad
    assert any("authorship" in e for e in media_errors(m))


# --- edit lock and the adversary see authorship -------------------------------------------------------

def test_lock_and_fingerprint_cover_authorship_only_when_set():
    w = world_with_death_fact()
    m = letter(w, "public-domain")
    plain_lock = gates.media_lock_sha256(m)
    plain_fp = judged.record_fingerprint(m, "media", gates.by_id(w["sources"]), gates.by_id(w["facts"]))
    m2 = copy.deepcopy(m)
    m2["authorship"] = None
    assert gates.media_lock_sha256(m2) == plain_lock
    m2["authorship"] = private(author())
    assert gates.media_lock_sha256(m2) != plain_lock
    fp2 = judged.record_fingerprint(m2, "media", gates.by_id(w["sources"]), gates.by_id(w["facts"]))
    assert fp2 != plain_fp
    payload = judged.media_payload(m2, gates.by_id(w["sources"]), None, gates.by_id(w["facts"]))
    assert payload["authorship"]["authors"][0]["death_basis"]["claim"] == DEATH_CLAIM
    # The death basis is not a source the adversary must report live (G10 reads payload source ids).
    assert judged.payload_source_ids(payload) == ["TST-S-0101"]


def test_rule_text_states_the_private_writings_rule():
    text = rights.RULE_TEXT
    for needle in ("2026-10-20", "1956", "1931", "public domain", "Unrestricted", "link-only", "authorship"):
        assert needle in text


def test_adversary_prompt_shows_authorship_and_the_rule(tmp_path):
    import adversary as adv
    w = world_with_death_fact()
    m = letter(w, "public-domain", private(author()))
    payload = judged.media_payload(m, gates.by_id(w["sources"]), tmp_path, gates.by_id(w["facts"]))
    item = adv.Item(id=m["id"], kind="media", group="TST-S-0101", payload=payload, fingerprint="x")
    prompt = adv.build_prompt([item], w["inductee"], cwd=tmp_path)
    assert "authorship: private" in prompt
    assert "Testa Q. Persona" in prompt and DEATH_CLAIM in prompt
    assert "private-writings rule" in prompt


# --- tools on disk: set_authorship.py then apply_rights_rule.py ---------------------------------------

def test_set_authorship_then_apply_rights_rule_withdraws_and_grants(tmp_path):
    import json as _json
    import apply_rights_rule as arr
    import set_authorship as sa
    w = world_with_death_fact()
    letter(w, "public-domain", None, n=1)                    # an unsigned-off private letter, PD from Unrestricted
    letter(w, "unknown", None, n=2)                          # a letter by the inductee
    root = fx.write_world(tmp_path, w)
    unknown = {"name": "Example Cosigner", "death_year": None, "death_basis": None}
    args = ["--data-dir", str(tmp_path)]
    assert sa.main(["testperson", "TST-M-0101", "--json", _json.dumps(private(unknown)), *args]) == 0
    assert sa.main(["testperson", "TST-M-0102", "--json", _json.dumps(private(author())), *args]) == 0
    assert sa.main(["testperson", "TST-M-0999", "--json", _json.dumps(private(author())), *args]) == 1
    assert sa.main(["testperson", "TST-M-0102", "--json", '{"kind": "corporate", "authors": []}', *args]) == 1
    assert arr.main(["testperson", *args]) == 0
    rows = {m["id"]: m for m in fx.read_rows(root, "media")}
    assert rows["TST-M-0101"]["license_class"] == "unknown"
    assert "private-writings rule" in rows["TST-M-0101"]["notes"]
    assert rows["TST-M-0102"]["license_class"] == PD
    assert rows["TST-M-0102"]["authorship"]["authors"][0]["death_basis"] == {"fact_id": DEATH_FACT}
    assert arr.main(["testperson", *args]) == 0              # idempotent
    assert {m["id"]: m for m in fx.read_rows(root, "media")} == rows


def test_media_csv_shows_authorship():
    import export
    assert "authorship" in export.MEDIA_COLUMNS
    a = private(author(), {"name": "Example Cosigner", "death_year": None, "death_basis": None})
    assert export.authorship_text(a) == \
        "private: Testa Q. Persona d. 1950 (TST-F-0005); Example Cosigner (death year not sourced)"
    assert export.authorship_text(None) is None
