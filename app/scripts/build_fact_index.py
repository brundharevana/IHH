"""Write app/src/tour/data/facts.generated.json: verified facts and verified media, with an
'embeddable' flag (verified AND public-domain / cc0 / cc-by, unless ruled reference only; plus the few
disputed records the owner ruled on, OWNER_RULED). The tour may show nothing else.

The store is read from this repository's own data/inductees/ (merged from revamp/facts), never from a
sibling checkout, so every machine builds the same index from the same commit. A missing store is a
broken checkout and fails the build. `--check` writes nothing and exits 1 when the committed index
differs from a fresh build (drift between the data and the shipped index)."""
import json, sys
from pathlib import Path

# the facts store's tools (tools/ihh/gates.py, imported for the owner-ruling lock) need Python 3.12: say so
# plainly instead of failing deep in an import when an older python3 is first on PATH
if sys.version_info < (3, 12):
    sys.exit(f"build_fact_index.py needs Python 3.12 or later (this is {sys.version.split()[0]}): "
             "put it first on PATH, e.g. export PATH=~/.pyenv/shims:$PATH")

CLEARED = {"public-domain", "cc0", "cc-by"}

# Verified, cleared records the project has ruled reference only (modelling reference, never shown):
# their pixels never ship, so they are not embeddable here (the tour's validator, the landing and the
# chapter export all read this flag). Each entry is the ruling's reason, carried into the index.
REFERENCE_ONLY = {
    "MUI-M-0055": "NPGallery record RL_01362 names Photographer: Unknown, so NPS authorship (the ground for "
    "public domain) is not shown; ruled reference only (assets-src/muir-dunbar/DECISION.md, controller ruling "
    "Task 12). The photograph shows the sea at Dunbar, not the birthplace.",
    "MUI-M-0060": "NPGallery record names Photographer: Unknown (same ground as MUI-M-0055); reference only "
    "(controller ruling Task 12).",
}

# Disputed records the owner has ruled on (above the adversary's open question). Each ruling holds only
# while the store's status is "disputed" (never rejected) and its licence class public-domain, and only
# for the record as ruled: ALB-M-0055 while the store records it federal; every other ruling only while
# the record's media_lock_sha256 (tools/ihh/gates.py: its url, rights words and licence, credit, sources,
# title, alt text and authorship) is the one pinned in OWNER_RULED_LOCK, so any change to the record
# voids the ruling until the owner rules again. The reason is carried into the index (`ownerRuling`) as
# the provenance of its display.
_CA_1933_1939 = ("Owner ruling 2026-10-27: 1933-1939 Library of Congress Chronicling America newspaper pages may "
                 "display under LoC's rights statement. The adversary refuted the licence class on that statement's "
                 "wording alone (a page under 95 years old); the ruling covers exactly that question "
                 "(review/decisions.jsonl note; DECISIONS 2026-10-27).")
_ANNALEN_1905 = ("Owner ruling 2026-10-27: the 1905 Annalen der Physik first pages may display: the publication is "
                 "public domain by date (US, and EU since 2026); HathiTrust \"pdus\" is the library rights statement. "
                 "The adversary refuted the licence class on the statement's wording alone (review/decisions.jsonl "
                 "note; DECISIONS 2026-10-27).")
_CA_1940_1961 = ("Owner ruling 2026-10-29: Library of Congress Chronicling America pages of 1940-1961 may display under LoC's "
                 "rights statement. The adversary refuted the licence class on that statement's wording alone (a page under 95 "
                 "years old); the ruling covers exactly that question (review/decisions.jsonl note; DECISIONS 2026-10-29).")
_PRE_1931 = ("Owner ruling 2026-10-29: publications before 1931 are public domain wherever published. No holder rights "
             "statement exists for the scan: the record's rights words are its holder page's publication date or the Internet "
             "Archive's copyright-status field, which the adversary refuted as not a rights statement; the ruling covers "
             "exactly that question (review/decisions.jsonl note; DECISIONS 2026-10-29).")
_FEDERAL = ("Owner ruling 2026-10-29: US federal publications (GPO/govinfo, USPTO patents, NARA press releases) may display. "
            "The adversary refuted the record because the public-domain statement is the publisher's site-wide notice, not a "
            "line on the item page; the ruling covers exactly that question (review/decisions.jsonl note; DECISIONS 2026-10-29).")
OWNER_RULED = {
    "ALB-M-0055": "Owner ruling 2026-10-22: the typed memorandum for the President from the Secretary of State, "
    "drafted and cleared by State Department staff, is an official federal record (public domain) and may be "
    "displayed. The adversary had left federal authorship unclear (data/inductees/albright/ARTIFACTS.md). Her "
    "handwritten letters (the other two Clinton Library items of that run) stay link-only.",
    "EIN-M-0077": _CA_1933_1939,
    "EIN-M-0078": _CA_1933_1939,
    "NAI-M-0067": _CA_1933_1939,
    "NAI-M-0068": _CA_1933_1939,
    "EIN-M-0082": _ANNALEN_1905,
    "EIN-M-0083": _ANNALEN_1905,
    # round 9 (2026-10-30): the chapter records the owner ruled on (DECISIONS 2026-10-29)
    "EIN-M-0087": _CA_1933_1939,
    "EIN-M-0089": _CA_1933_1939,
    "EIN-M-0090": _CA_1933_1939,
    "EIN-M-0091": _CA_1940_1961,
    "EIN-M-0092": _CA_1940_1961,
    "NAI-M-0075": _CA_1933_1939,
    "NAI-M-0076": _CA_1940_1961,
    "NAI-M-0077": _CA_1940_1961,
    "MUI-M-0094": _PRE_1931,
    "MUI-M-0095": _PRE_1931,
    "MUI-M-0096": _PRE_1931,
    "MUI-M-0097": _PRE_1931,
    "ALB-M-0092": _FEDERAL,
    "ALB-M-0094": _FEDERAL,
    "ALB-M-0095": _FEDERAL,
    "LAM-M-0032": _CA_1933_1939,
    "LAM-M-0033": _CA_1933_1939,
    "LAM-M-0036": _FEDERAL,
    "LAM-M-0031": _CA_1940_1961,
    "LAM-M-0034": _CA_1940_1961,
    "LAM-M-0035": _CA_1940_1961,
    "LAM-M-0037": _CA_1940_1961,
    "LAM-M-0038": _CA_1940_1961,
    "LAM-M-0039": _CA_1940_1961,
}
# The record each lock-pinned ruling was given for (media_lock_sha256 on 2026-10-27; the round-9 ones on 2026-10-30).
OWNER_RULED_LOCK = {
    "EIN-M-0077": "b6375cf6c977fce912334fb47e0174fc9515ef55023a15abd63b345cfa173756",
    "EIN-M-0078": "1099c38c996f818474ddb53e4b563b6756ef3827a4fddc2cfa2b617a203473cc",
    "NAI-M-0067": "72e0a7538af20d1b35b079714714bab063757b8c6f11677d26e39caeac5db38a",
    "NAI-M-0068": "8e684fd9a7556e9734d865de8795bbd2e136c59ac97422ba83b847f6018328ab",
    "EIN-M-0082": "99cecef87a5219b3a9a68d32c96b389238cf4c79a83053b9dd42bd5b43679db3",
    "EIN-M-0083": "4467efb457738b9a568bfc0faf82ba473e1909a44db3067ca68a0482d7b3900a",
    "EIN-M-0087": "73d7aa37cac081a9ba1ba67f50ab7b35c729cee27bec635e636ab325c617637a",
    "EIN-M-0089": "1a6bbe256fdece488c7e04a1b7c82e5283c0e611c2bac7493747472853d2e7ad",
    "EIN-M-0090": "3adc6bc8fbf94577226e6e37a63b42a3f3c9f7b6a046b3e735042febbd13be33",
    "EIN-M-0091": "41146e42c876cd3c5bb6d3627f27a98308a47b6d45baba65c8bb1066acf6a512",
    "EIN-M-0092": "1e6bd415efa0b07fda4d783cfa38329a3eaeeaa0f3aadc1d7b1213da3ee4ed3c",
    "NAI-M-0075": "8584c67dd40e252e9cef24bc6d37497b252b89d702956c5aa051f362229f4295",
    "NAI-M-0076": "da8c0f1481e9b0061d17f2b4599186a287bf2bf62230f588fafcecf92e7da65a",
    "NAI-M-0077": "43cb4f566ecebd2ba59f5a5132043d46fd54ce2b5407731edf783063f555138a",
    "MUI-M-0094": "956588149402d74752cf8ad51e39c284b048593fd925b40011d28f7d70a18b77",
    "MUI-M-0095": "08ad11e54cf46a2730802cfe396c39842205397c3cc4cb6ee4d557043cad282d",
    "MUI-M-0096": "43379c2810c2e3b9a2fd2315fe58c8b31822675af0b6bce766b8899c7e734c44",
    "MUI-M-0097": "3abf520a9d7fd1e1c5f1692d27ff2e07a5ba7cb43ccfaf591a469970e2ef078e",
    "ALB-M-0092": "ad774fbdb9b61414c06775de7fbba99701f3572f1f7baa67cce898ae0e5c1d74",
    "ALB-M-0094": "b24e1fe0398acb75d688d3d2775c193d899e2c29f60318b18995c941401da2ed",
    "ALB-M-0095": "236cab08b92c72ed090d5b43a414eca00aa934a07c16176fa74fe069b416702f",
    "LAM-M-0032": "629bc1e11ebc4b2ca5439b02dc77b4f72bbe3ddab85bcfd4952566fb1496fbd1",
    "LAM-M-0033": "7e20c95f85e440e8110364b9c7b4fd0dfd68a6fdb023df65e086ca111341eb59",
    "LAM-M-0036": "060caa7323443cad03de46cd1701db51edd5660c5d2803e3c1bd7763648ea997",
    "LAM-M-0031": "00cf7e0a8cf31a51a9e7de525426256d33029daab1fa6a2dab0b686f44123475",
    "LAM-M-0034": "db949158be86c256358a7c1a9452307d960a0baa43489598329ce8080e948f47",
    "LAM-M-0035": "5f3b6ff1d02ffbad62a9772628bedeb30fe28d1ee3031792a24eb0b59868fcd1",
    "LAM-M-0037": "81cd63ef864fcdf7a5aea6b6cb501c1660618e09d42bb14cbe5377abf4980a26",
    "LAM-M-0038": "a08cda5d73a6daa1ed263ffc4d05775086e87e55900e930a52e05f4e3647ff15",
    "LAM-M-0039": "b0d1c82d327e68d9e30495aa7233bb4fc0df4d7ab1d0ab4db77500626249cc89",
}

# Owner rulings that let a room texture come from an item without its own media record: the item
# inherits the rights of a record it belongs to (check_textures.py). `inherits` lists the records whose
# status and licence the ruling rides on; each must stay verified and cleared.
TEXTURE_RULINGS = {
    "nara-roll-WHPO-P02724": {
        "inherits": ["ALB-M-0088", "ALB-M-0089"],
        "ruling": "Owner ruling 2026-10-24: every frame of NARA roll WHPO-P02724 (William J. Clinton Library, "
        "White House Photograph Office, Oval Office, 20 April 1993; file unit NAID 187792855, use restriction "
        "\"Unrestricted\") inherits the roll's federal public-domain status, so textures may come from any frame "
        "of the roll. Frames 16 and 24 are the media records ALB-M-0088 and ALB-M-0089.",
    },
}

def _media_lock(m):
    sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "tools"))
    from ihh.gates import media_lock_sha256  # the store's own record fingerprint (G7, apply_review)
    return media_lock_sha256(m)

def _owner_cleared(m):
    if not (m["id"] in OWNER_RULED and m.get("status") == "disputed" and m.get("license_class") == "public-domain"):
        return False
    if m["id"] in OWNER_RULED_LOCK:
        return _media_lock(m) == OWNER_RULED_LOCK[m["id"]]
    return (m.get("authorship") or {}).get("kind") == "federal"

def _rows(p):
    return [json.loads(l) for l in p.read_text().splitlines() if l.strip()] if p.exists() else []

def build(root):
    out = {"facts": {}, "media": {}}
    for d in sorted((Path(root) / "data/inductees").iterdir()):
        for f in _rows(d / "facts.jsonl"):
            if f.get("status") == "verified":
                out["facts"][f["id"]] = {"claim": f["claim"], "slug": d.name}
        for m in _rows(d / "media.jsonl"):
            if m.get("status") == "verified":
                ruled = REFERENCE_ONLY.get(m["id"])
                out["media"][m["id"]] = {
                    "embeddable": m.get("license_class") in CLEARED and not ruled,
                    "basisFor": m.get("basis_for", []),
                    "title": m.get("title"), "holder": m.get("credit"), "rights": m.get("license_class"),
                    **({"referenceOnly": ruled} if ruled else {}),
                }
            elif _owner_cleared(m):
                out["media"][m["id"]] = {
                    "embeddable": True, "basisFor": m.get("basis_for", []),
                    "title": m.get("title"), "holder": m.get("credit"), "rights": m.get("license_class"),
                    "ownerRuling": OWNER_RULED[m["id"]],
                }
    return out

def render(root):
    return json.dumps(build(root), indent=1, ensure_ascii=False) + "\n"

def main(root, target, check=False):
    root, target = Path(root), Path(target)
    if not (root / "data/inductees").is_dir():
        print(f"facts store not found at {root / 'data/inductees'}; the index cannot be built", file=sys.stderr)
        return 1
    text = render(root)
    if check:
        if not target.exists() or target.read_text() != text:
            print(f"{target.name} differs from a fresh build of {root / 'data/inductees'}; "
                  "run python3 app/scripts/build_fact_index.py and commit the result", file=sys.stderr)
            return 1
        print(f"{target.name} matches the store")
        return 0
    target.write_text(text)
    print(f"wrote {target}")
    return 0

REPO = Path(__file__).resolve().parents[2]
TARGET = Path(__file__).resolve().parents[1] / "src/tour/data/facts.generated.json"

if __name__ == "__main__":
    sys.exit(main(REPO, TARGET, check="--check" in sys.argv[1:]))
