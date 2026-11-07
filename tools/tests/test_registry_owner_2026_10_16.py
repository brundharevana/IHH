"""Registry rules added with the owner's approvals of 2026-10-16 (SPEC 3.6):

- supporting_only: a publisher that may count as an independent second holder for G5 but is never
  primary or institutional and never the sole source of a fact (Wien Geschichte Wiki).
- part_of: a publisher that is part of another registered holder (a presidential library of the
  National Archives) counts as that holder for G5, never as a second one.
- owner_approved_on: the date the owner approved the entry.

Hosts and names are invented placeholders.
"""

import copy

import factories as fx
import pytest
from ihh import authority, gates

BASE = {"id": "city-wiki", "name": "Example City History Wiki", "kind": "government",
        "domains": [], "hosts": ["history.city.example.org"], "may_be": ["secondary"],
        "supporting_only": True, "verified_on": "2026-10-16", "owner_approved_on": "2026-10-16",
        "note": "test entry"}


def registry_with(*entries):
    reg = copy.deepcopy(fx.REGISTRY)
    reg["entries"] += [copy.deepcopy(e) for e in entries]
    return reg


def load(*entries):
    return authority.Registry.from_dict(registry_with(*entries), source="test")


# --- loader ----------------------------------------------------------------------------------------

def test_supporting_only_entry_must_be_secondary_only():
    assert load(BASE).resolve("https://history.city.example.org/Page").supporting_only is True
    for may_be in (["institutional"], ["primary", "institutional"], ["primary"]):
        with pytest.raises(authority.RegistryError, match="supporting_only"):
            load({**BASE, "may_be": may_be})
    with pytest.raises(authority.RegistryError, match="supporting_only"):
        load({**BASE, "supporting_only": "yes"})


def test_owner_approved_on_must_be_a_date():
    with pytest.raises(authority.RegistryError, match="owner_approved_on"):
        load({**BASE, "owner_approved_on": "16 October"})
    assert load({**BASE, "owner_approved_on": "2026-10-16"}).resolve(
        "https://history.city.example.org/x").owner_approved_on == "2026-10-16"


def parent_child():
    parent = {"id": "national-archive", "name": "Example National Archive Service", "kind": "government",
              "domains": [], "hosts": ["natarchive.example.gov"], "may_be": ["primary", "institutional"],
              "verified_on": "2026-10-16", "note": "test"}
    child = {"id": "example-presidential-library", "name": "Example Presidential Library", "kind": "archive",
             "domains": [], "hosts": ["examplelibrary.example.org"], "may_be": ["institutional"],
             "part_of": "national-archive", "verified_on": "2026-10-16", "owner_approved_on": "2026-10-16",
             "note": "test"}
    return parent, child


def test_part_of_must_name_another_entry():
    parent, child = parent_child()
    with pytest.raises(authority.RegistryError, match="part_of"):
        load({**child, "part_of": "no-such-entry"})
    with pytest.raises(authority.RegistryError, match="part_of"):
        load(parent, {**child, "part_of": child["id"]})
    a = {**child, "id": "a-lib", "hosts": ["a.example.org"], "part_of": "b-lib"}
    b = {**child, "id": "b-lib", "hosts": ["b.example.org"], "part_of": "a-lib"}
    with pytest.raises(authority.RegistryError, match="part_of"):
        load(a, b)


def test_part_of_counts_as_the_parent_holder():
    parent, child = parent_child()
    reg = load(parent, child)
    s1 = {"url": "https://natarchive.example.gov/id/1", "institution": parent["name"], "type": "primary"}
    s2 = {"url": "https://examplelibrary.example.org/letter", "institution": child["name"], "type": "institutional"}
    assert authority.standing(s1, reg).same_holder(authority.standing(s2, reg))
    assert len(authority.independent_groups([s1, s2], reg)) == 1
    assert authority.source_problems(s2, reg) == []


# --- gates -----------------------------------------------------------------------------------------

def wiki_world(with_institution):
    w = fx.world()
    w["registry"] = registry_with(BASE)
    wiki = fx.source("TST-S-0050", "Testa Persona - Example City History Wiki", BASE["name"], "secondary",
                     "https://history.city.example.org/Testa_Persona")
    w["sources"].append(wiki)
    w["snapshots"]["TST-S-0050"] = "Testa Persona lived at 12 Example Street in Example City."
    evidence = [("TST-S-0050", "Testa Persona lived at 12 Example Street")]
    if with_institution:
        inst = next(s for s in w["sources"] if s.get("type") == "institutional")
        w["snapshots"][inst["id"]] = (w["snapshots"].get(inst["id"], "") +
                                      "\nTesta Persona lived at 12 Example Street.")
        evidence.append((inst["id"], "Testa Persona lived at 12 Example Street"))
    fact = fx.fact("TST-F-0050", "Testa Persona lived at 12 Example Street.", "other", evidence)
    w["facts"].append(fact)
    fx.restamp(w)
    return w, fact


def test_supporting_only_source_alone_fails_g9_and_g5():
    w, fact = wiki_world(with_institution=False)
    ctx = fx.context(w)
    problems = gates.g9_banned_sources(fact, ctx)
    assert any("supporting-only" in p and "sole" in p for p in problems), problems
    assert gates.g5_corroboration(fact, ctx)


def test_supporting_only_source_counts_as_an_independent_second_holder():
    w, fact = wiki_world(with_institution=True)
    ctx = fx.context(w)
    assert gates.g9_banned_sources(fact, ctx) == []
    assert gates.g5_corroboration(fact, ctx) == []
    assert len([g for g in gates.g5_holders(fact, ctx)]) == 2


def test_supporting_only_source_may_not_be_typed_institutional():
    reg = load(BASE)
    src = {"url": "https://history.city.example.org/Testa_Persona", "institution": BASE["name"],
           "type": "institutional"}
    assert any("not allowed" in p for p in authority.source_problems(src, reg))
