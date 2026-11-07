"""The approved rights rule for Library of Congress and National Archives media.

Source: the user's decisions of 2026-10-09, docs/handoff/DECISIONS.md "Rights mapping for LoC and
NARA" and "Extended LoC rights rule". This module is the one place the rule lives. merge_staging.py
applies it when media are staged, apply_rights_rule.py applies it to media on file, G1 for media
(gates.g1_media, so compute_status.py, validate.py and adversary.py's selection) checks every record
against it, and adversary.py puts RULE_TEXT in the media prompt so the adversary judges by the same
rule.

The rule
    Library of Congress (registry entry "loc"): a rights advisory that begins with one of these
    wordings (alone, or followed by further sentences) -> public-domain:
      "No known restrictions on publication";
      "No known restrictions on images made by the U.S. Government";
      "No known restrictions on images made by the U.S. Government; images copied from other sources
        may be restricted" (LoC's full HABS/HAER/HALS wording), only when the record shows government
        creation (GOVERNMENT_CREATORS in part_of or a creator) and says nothing marking the image as a
        copy (COPY_MARKERS);
      "No known restrictions on work by staff photographers", only when the holder record credits
        a U.S. News & World Report staff photographer (STAFF_PHOTOGRAPHERS: a name heading in a
        creator or contributor field, or a credit form such as "photograph by <name>" in free text);
      "No known copyright restriction", only when the holder record is in the New York
        World-Telegram & Sun collection and credits one of its staff photographers.
    A conditional wording whose condition is not met, a record that credits a wire service, or an
    approved wording followed by a caveat that asserts a restriction (CAVEATS) -> never usable.
    National Archives (registry entry "nara"): use restriction status "Unrestricted" (records created
    by the federal government) -> public-domain.
    LoC "Publication may be restricted" or "Rights status not evaluated", and NARA use restriction
    "Restricted", "Restricted - Possibly", "Restricted - Partly", "Restricted - Fully" or
    "Undetermined" -> never usable (license_class unknown or rights-restricted).
    Anything else is not decided by this rule.

Matching is on exact phrases after the G1 normalization (case, whitespace, dash and quote style
ignored), and only for a source whose url the authority registry resolves to the "loc" or "nara"
entry (loc.gov, archives.gov in data/registry/institutions.json). The holder's words are read from
the holder's own rights field in its saved snapshot (LoC: rights_advisory and rights_information;
NARA: useRestriction.status, never accessRestriction), so an "Unrestricted" access flag is never
read as a use statement and a Wikimedia Commons tag never makes anything public domain. A staff
photographer credit is read only from the same snapshot's credit fields (creators, contributors,
statement of responsibility, notes), never from a title, a subject heading or another host. The
rule grants public-domain only when the record's rights_statement is that field's wording, so the
site shows the archive's exact words.

Python 3.12 standard library only.
"""

import re
from dataclasses import dataclass
from typing import Callable

from .normalize import normalize_text

PUBLIC_DOMAIN = "public-domain"
NOT_USABLE = "not-usable"
# Licence classes the site may embed (SPEC section 3.4); schema.EMBEDDABLE is this tuple.
EMBEDDABLE = ("public-domain", "cc0", "cc-by", "cc-by-sa")

LOC, NARA = "loc", "nara"
RULE_HOLDERS = (LOC, NARA)

LOC_APPROVED = "No known restrictions on publication"
LOC_US_GOVERNMENT = "No known restrictions on images made by the U.S. Government"
# LoC's full HABS/HAER/HALS wording: the second clause is part of the approved phrase (controller
# ruling 2026-10-09), so it qualifies only for a government-created record that is not a copy.
LOC_US_GOVERNMENT_FULL = LOC_US_GOVERNMENT + "; images copied from other sources may be restricted"
LOC_STAFF = "No known restrictions on work by staff photographers"
LOC_NYWT = "No known copyright restriction"
LOC_BARRED = ("Publication may be restricted", "Rights status not evaluated")
NARA_APPROVED = "Unrestricted"
NARA_BARRED = ("Restricted", "Restricted - Possibly", "Restricted - Partly", "Restricted - Fully", "Undetermined")

# U.S. News & World Report staff photographers (given name, middle initial or None, surname).
STAFF_PHOTOGRAPHERS = (("Warren", "K", "Leffler"), ("Thomas", "J", "O'Halloran"), ("Marion", "S", "Trikosko"),
                       ("John", None, "Bledsoe"), ("Chick", None, "Harrity"))
# Creators that show government creation: the federal surveys, or a "United States. <agency>" heading.
GOVERNMENT_CREATORS = ("Historic American Buildings Survey", "Historic American Landscapes Survey",
                       "Historic American Engineering Record")
# Every named creator or contributor must itself carry a government affiliation in its heading
# (a federal survey or a "United States. <agency>" heading). A role alone (photographer, historian,
# transmitter ...) shows nothing about who employed the person, and a name with no role (a family
# member, an owner) shows less, so either blocks the record.
# Owner decision 2026-10-18 (HABS CA-1890): in a record made by one of the federal surveys above, a
# name with no role is an associated person (an owner's family, a builder), not a maker, and the
# survey's own team roster (project manager, field team, field team supervisor) makes the same
# record's photographer and historian survey staff. Any other role (owner, architect, subject,
# transmitter ...) still blocks, and neither allowance applies outside a federal survey record.
ROSTER_ROLES = ("project manager", "field team", "field team supervisor")
TEAM_ROLES = ROSTER_ROLES + ("photographer", "historian")
# Record text that marks documentation made by outside entrants (HALS/HABS Challenge, Peterson Prize).
OUTSIDE_ENTRY_MARKERS = ("challenge", "competition", "contest", "prize")
# Record text that says the image is a copy of another work (HABS/HALS records bundle recopied
# historic photographs, which the government did not make).
COPY_MARKERS = ("photocopy", "photocopies", "photocopied", "copied from", "copy of", "copy photograph",
                "recopy", "recopied", "photograph of a photograph", "reproduction of")
# Record text that credits a New York World-Telegram & Sun staff photograph.
NYWT_COLLECTION = "New York World-Telegram"
NYWT_STAFF_CREDITS = ("staff photograph", "World-Telegram photo", "World-Telegram & Sun photo")
# Wire-service and agency credits: a record that credits one is never a staff photograph.
WIRE_SERVICES = ("Associated Press", "AP Photo", "AP Wirephoto", "Wirephoto", "Acme", "United Press", "UPI",
                 "International News Photo", "INP", "Underwood", "Harris & Ewing", "Wide World", "Keystone",
                 "Bain News", "Pacific & Atlantic")
# A sentence after an approved wording that asserts a restriction blocks it. A sentence that supports
# free status ("No renewal in Copyright office ...") or only points to more information does not.
CAVEATS = ("may be restricted", "restrictions apply", "restrictions may apply", "copyright restrictions",
           "permission required", "permission is required", "not in the public domain", "may be protected",
           "privacy and publicity rights")

# The snapshot fields that carry each holder's own rights wording ("key: value" lines, as
# fetch_snapshot.py writes JSON records; LoC arrays may carry an index).
_FIELDS = {
    LOC: re.compile(r"^(?:item\.)?rights_(?:advisory|information)(?:\[\d+\])?$"),
    NARA: re.compile(r"^useRestriction\.status$"),
}
# LoC credit fields: who made the item and the cataloguer's notes about it.
_CREDIT_FIELD = re.compile(r"^(?:item\.)?(?:contributor_names|contributors|creators|creator|contributor"
                           r"|stmt_of_responsibility|notes)(?:\[\d+\])?(?:\.title)?$")
_CREATOR_ROLE = re.compile(r"^(?:item\.)?creators\[(\d+)\]\.(title|role)$")
_COLLECTION_FIELD = re.compile(r"^(?:item\.)?(?:part_of|source_collection|notes)(?:\[\d+\])?$")
# Name headings (no free text): a staff photographer's name anywhere here is a credit.
_NAME_FIELD = re.compile(r"^(?:item\.)?(?:contributor_names|contributors|creators|creator|contributor)"
                         r"(?:\[\d+\])?(?:\.title)?$")
_HEADING_FIELD = re.compile(r"^(?:item\.)?(?:contributor_names|contributors|creator|contributor)(?:\[\d+\])?$")
_PART_OF_FIELD = re.compile(r"^(?:item\.)?part_of(?:\[\d+\])?(?:\.title)?$")
# Fields that describe the item itself: its title, notes, description, medium, credits and the
# titles and captions of its image files (never the page's ordering prose).
_ITEM_FIELD = re.compile(r"^(?:item\.)?(?:title|notes|description|summary|medium|mediums|stmt_of_responsibility"
                         r"|contributor_names|contributors|creators|creator|contributor)(?:\[\d+\])?(?:\.title)?$"
                         r"|^(?:item\.)?resources\[\d+\](?:\.files\[\d+\]\[\d+\])?\.(?:title|caption)$")
_PHOTO_BY = re.compile(r"\bphoto(?:graph)?(?:ed)? by\b")

_GOV_CREATOR = re.compile(r"^(?:" + "|".join(re.escape(normalize_text(x)) for x in GOVERNMENT_CREATORS)
                          + r")(?![\w])|^united states\.\s")

_GOV_AFFILIATION = re.compile(r"(?<!\w)(?:" + "|".join(re.escape(normalize_text(x)) for x in GOVERNMENT_CREATORS)
                              + r")(?!\w)|(?<!\w)united states\.\s")

# --- private writings in public files (owner decision 2026-10-20) ---------------------------------
# A privately written item (letter, petition, application text, memo) held in NARA, LoC or other
# public files is shown only if (a) every author died before DEATH_BEFORE (unpublished: life + 70),
# (b) the holder itself states it is public domain, or (c) it was published before PUBLISHED_BEFORE.
# Otherwise it is link-only. NARA "Unrestricted" (or an LoC "No known restrictions") alone is not a
# rights grant for it. Records created by the federal government keep the LoC / NARA rule above.
# The cut-off years are the owner's (2026-10-20); a person updates them each January.
PRIVATE, FEDERAL = "private", "federal"
AUTHORSHIP_KINDS = (PRIVATE, FEDERAL)
DEATH_BEFORE = 1956
PUBLISHED_BEFORE = 1931
PRIVATE_DECISION = "DECISIONS 2026-10-20, private writings in public archives"
_DEATH_WORD = re.compile(r"(?<!\w)(?:died|dies|death|deceased)(?!\w)")
_PUBLISH_WORD = re.compile(r"(?<!\w)(?:published|publication|printed)(?!\w)")
_HOLDER_PD = re.compile(r"(?<!\w)public domain(?!\w)")
_PD_NEGATED = re.compile(r"(?<!\w)(?:not|no|never|neither|nor)(?!\w)[^.;]{0,40}public domain")

PRIVATE_RULE_TEXT = (
    "Private writings in public files (owner decision 2026-10-20): a privately written item (a letter, "
    "petition, application text or memo, even when it is held in National Archives, Library of Congress or "
    "other public files) may be public-domain only if (a) every author died before "
    f"{DEATH_BEFORE} (unpublished works: life plus 70 years), or (b) the holder itself explicitly states the "
    "item is in the public domain (words such as \"public domain\" in the holder's own rights statement; "
    f"\"Unrestricted\" or \"No known restrictions\" is not such a statement), or (c) it was published before "
    f"{PUBLISHED_BEFORE}. Otherwise it is link-only: license_class must be unknown or rights-restricted. A "
    "National Archives \"Unrestricted\" use or access status alone is not a rights grant for such an item; it "
    "grants public-domain only to records created by the federal government. The media record carries "
    "authorship: kind private or federal, each author with a death year and the verified fact or "
    "authority-record quote that backs it, and optionally the publication year with its basis. Judge that "
    "the authorship is right: kind private when the holder's page shows the item was written by a private "
    "person or body (whoever holds it now), every author or signer the holder's page names is listed, and "
    "each death year matches its basis. A privately written item with no authorship, or marked federal, "
    "whose public-domain class rests only on \"Unrestricted\" or \"No known restrictions\" is not "
    "entailed.")

RULE_TEXT = (
    "The project's approved rights rule for Library of Congress and National Archives items "
    "(user decisions 2026-10-09). It applies only to a source whose registry standing is the Library of "
    "Congress (loc.gov) or the U.S. National Archives (archives.gov), and only to the holder's own rights "
    "field in that source's snapshot. Library of Congress: a rights advisory that begins "
    f"\"{LOC_APPROVED}\" or \"{LOC_US_GOVERNMENT}\" (alone or followed by further sentences) means "
    f"license_class public-domain. LoC's full wording \"{LOC_US_GOVERNMENT_FULL}\" (its second clause is part "
    "of the phrase, not a caveat) means public-domain only when the same LoC record gives positive "
    "evidence of government creation (its part_of or a creator with the role creator is "
    + ", ".join(GOVERNMENT_CREATORS) + ", or a \"United States. <agency>\" heading), no item field marks "
    "an outside entry (" + ", ".join(f'"{x}"' for x in OUTSIDE_ENTRY_MARKERS) + ", as in a \"HALS "
    "Challenge Entry\"), every named creator or contributor carries a government affiliation in its own "
    "heading (a federal survey or a \"United States. <agency>\" heading; a staff role such as photographer "
    "alone is not enough; an owner, architect or other role blocks it). Owner decision 2026-10-18: in a "
    "record made by a federal survey (HABS, HAER, HALS), a name with no role is an associated person "
    "(such as a family member), not a maker, and when the record lists the survey's team (project "
    "manager, field team, field team supervisor) its photographer and historian count as survey staff. "
    "For an item that is one image file of the record, the titles of the record's other image files are "
    "not read for copy markers (the item's own file title and title are), "
    "and nothing in the "
    "record's title, notes, description, credits or image titles and captions says the image is a copy ("
    + ", ".join(f'"{x}"' for x in COPY_MARKERS) + "); otherwise never usable. "
    f"\"{LOC_STAFF}\" means public-domain only when the same LoC record "
    "credits (a name heading in its creator or contributor fields; in its statement of responsibility, "
    "notes or the rights text only a credit such as \"photograph by <name>\", \"Photographer: <name>\" or "
    "\"<name>, photographer\", never a mention of the name) a U.S. News & World Report staff photographer: "
    + ", ".join(f"{g} {m + '. ' if m else ''}{s}" for g, m, s in STAFF_PHOTOGRAPHERS)
    + f"; otherwise the item is never usable. \"{LOC_NYWT}\" means public-domain only when the same LoC "
    "record is in the New York World-Telegram & Sun collection and credits a World-Telegram staff "
    "photographer (a photographer named in its creator or contributor field, \"photo by <name>\", or "
    f"record text such as {', '.join(f'"{x}"' for x in NYWT_STAFF_CREDITS)}); otherwise never usable. A "
    "record that credits a wire service or agency ("
    + ", ".join(WIRE_SERVICES) + ") is never a staff photograph. An approved wording followed by a caveat "
    "that asserts a restriction ("
    + ", ".join(f'"{x}"' for x in CAVEATS) + ") is never usable; a following sentence that supports free "
    "status (such as \"No renewal in Copyright office (checked ...)\") or only points to more information "
    "(\"For more information, see ...\") does not block it. National "
    f"Archives: a use restriction status of \"{NARA_APPROVED}\" (useRestriction.status, a record created by "
    f"the federal government; never the access restriction) means license_class public-domain. "
    f"Library of Congress \"{LOC_BARRED[0]}\" or \"{LOC_BARRED[1]}\", and National Archives use "
    f"restriction {', '.join(f'"{x}"' for x in NARA_BARRED)}, mean the item is "
    "never usable: license_class must be unknown or rights-restricted. Public domain under this rule needs "
    "the rights_statement to be the holder's exact wording from that field. The rule never applies to a "
    "Wikimedia Commons file page or tag, or to any other host; there, license_class follows strictly "
    "from the holder's own statement. " + PRIVATE_RULE_TEXT)


def _norm(text):
    return normalize_text(text) if isinstance(text, str) else ""


def _key(phrase):
    return _norm(phrase)


def _fields(snapshot_text, pattern):
    """(key, value) for each "key: value" line of the snapshot whose key matches pattern."""
    if not isinstance(snapshot_text, str):
        return []
    out = []
    for line in snapshot_text.splitlines():
        key, sep, value = line.partition(": ")
        if sep and pattern.match(key.strip()) and value.strip():
            out.append((key.strip(), value.strip()))
    return out


def _words(phrases):
    return re.compile(r"(?<![\w&])(?:" + "|".join(re.escape(_key(p)) for p in phrases) + r")(?![\w&])")


_WIRE = _words(WIRE_SERVICES)
_NYWT_STAFF = _words(NYWT_STAFF_CREDITS)


def _staff_name(given, middle, surname):
    """(heading, credit): the name in a name heading, and the name in a credit form in free text."""
    g, s = re.escape(_key(given)), re.escape(_key(surname))
    m = rf"(?:\s+{re.escape(_key(middle))}\.?)?" if middle else ""
    name = rf"(?:{s},\s*{g}{m}|{g}{m}\s+{s})(?!\w)"
    heading = re.compile(rf"(?<!\w){name}")
    credit = re.compile(rf"(?:\bphoto(?:graph)?(?:ed)? by|\bphotographer:?)\s+{name}|(?<!\w){name},?\s+photographer\b")
    return heading, credit


_STAFF_NAMES = tuple(_staff_name(*p) for p in STAFF_PHOTOGRAPHERS)


def _credits(record_text):
    """The values of the record's credit fields, as written."""
    return [v for _, v in _fields(record_text, _CREDIT_FIELD)]


def _named_photographers(record_text):
    """Credit values that name a photographer: a contributor "<name>, photographer", a creator whose
    role is photographer, or a statement "photo by <name>"."""
    out = []
    for value in _credits(record_text):
        norm = _norm(value)
        if norm.rstrip(".").endswith(", photographer") or _PHOTO_BY.search(norm):
            out.append(value)
    roles = {}
    for key, value in _fields(record_text, _CREATOR_ROLE):
        idx, part = _CREATOR_ROLE.match(key).groups()
        roles.setdefault(idx, {})[part] = value
    out += [r["title"] for r in roles.values() if _norm(r.get("role")) == "photographer" and r.get("title")]
    return out


def _wire_credit(record_text):
    return next((v for v in _credits(record_text) if _WIRE.search(_norm(v))), None)


def _us_news_staff(record_text, statement):
    """The credit naming a U.S. News & World Report staff photographer, or None: a name heading
    in a creator or contributor field, or a credit form ("photograph by <name>", "Photographer:
    <name>", "<name>, photographer") in the free-text credit fields or the rights text."""
    for _, value in _fields(record_text, _NAME_FIELD):
        if any(heading.search(_norm(value)) for heading, _ in _STAFF_NAMES):
            return value
    for value in _credits(record_text) + [statement]:
        if any(credit.search(_norm(value)) for _, credit in _STAFF_NAMES):
            return value
    return None


def _affiliated(heading):
    """True when a creator heading itself carries a government affiliation (a role alone does not)."""
    return bool(_GOV_AFFILIATION.search(_norm(heading)))


def _creator_entries(record_text):
    """(name, role or None) for each creator or contributor heading of the record."""
    roles = {}
    for key, value in _fields(record_text, _CREATOR_ROLE):
        idx, part = _CREATOR_ROLE.match(key).groups()
        roles.setdefault(idx, {})[part] = value
    out = [(r["title"], _norm(r.get("role")) or None) for r in roles.values() if r.get("title")]
    for _, value in _fields(record_text, _HEADING_FIELD):
        name, _, last = value.rstrip(", ").rpartition(", ")
        if name and last[:1].islower():                 # "Surname, Given, role"
            out.append((value, _norm(last)))
        else:
            out.append((value, None))
    return out


def _survey_record(record_text):
    """True when the record is made by a federal survey (HABS, HAER, HALS), not another agency."""
    return any(_norm(g) in _norm(v) for g in GOVERNMENT_CREATORS
               for v in [_government_created(record_text) or ""])


def _non_government_creator(record_text):
    """A named creator or contributor whose heading carries no government affiliation, or None.

    In a federal survey record a roleless name (an associated person) and, when the record lists the
    survey's team roster, a team role (photographer, historian, project manager, field team) pass."""
    entries = _creator_entries(record_text)
    survey = _survey_record(record_text)
    roster = survey and any(role in ROSTER_ROLES for _, role in entries)
    for name, role in entries:
        if _affiliated(name):
            continue
        if survey and (role is None or (roster and role in TEAM_ROLES)):
            continue
        return name
    return None


def _outside_entry(record_text):
    """The item field marking documentation made by outside entrants, or None."""
    return next((v for _, v in _fields(record_text, _ITEM_FIELD) if _OUTSIDE.search(_norm(v))), None)


def _government_created(record_text):
    """The field showing the record was made by the U.S. Government, or None: a part_of naming a
    federal survey, or a creator (role creator) or contributor "<name>, creator" that is one."""
    for _, value in _fields(record_text, _PART_OF_FIELD):
        if _GOV_CREATOR.search(_norm(value)):
            return value
    roles = {}
    for key, value in _fields(record_text, _CREATOR_ROLE):
        idx, part = _CREATOR_ROLE.match(key).groups()
        roles.setdefault(idx, {})[part] = value
    for r in roles.values():
        if _norm(r.get("role")) == "creator" and r.get("title") and _GOV_CREATOR.search(_norm(r["title"])):
            return r["title"]
    for _, value in _fields(record_text, _NAME_FIELD):
        norm = _norm(value).rstrip(".")
        if norm.endswith(", creator") and _GOV_CREATOR.search(norm):
            return value
    return None


_OUTSIDE = re.compile(r"(?<!\w)(?:" + "|".join(re.escape(x) for x in OUTSIDE_ENTRY_MARKERS) + r")(?!\w)")
_COPY = re.compile(r"(?<!\w)(?:" + "|".join(re.escape(normalize_text(x)) for x in COPY_MARKERS) + r")(?!\w)")


_FILE_FIELD = re.compile(r"^(?:item\.)?resources\[(\d+)\]\.files\[(\d+)\]\[\d+\]\.(title|caption|url)$")


def _item_file(record_text, item):
    """The (resource, file) indexes of the record's image file that is the media item's own url, or None."""
    url = item.get("url") if isinstance(item, dict) else None
    if not isinstance(url, str) or not url.strip():
        return None
    for key, value in _fields(record_text, _FILE_FIELD):
        m = _FILE_FIELD.match(key)
        if m.group(3) == "url" and value.split("#")[0] == url.split("#")[0]:
            return m.group(1), m.group(2)
    return None


def _copy_marker(record_text, item=None):
    """The item field saying the image is a copy of another work, or None.

    With the media item (its url and title), the image-file titles of other files in the record are
    not read: a record that bundles recopied historic photographs with the survey's own photographs
    and drawings bars only the recopy's own file, and a record-page item (no file of its own) still
    reads them all. The item's own title is read as well."""
    if isinstance(item, dict) and _COPY.search(_norm(item.get("title"))):
        return item["title"]
    own = _item_file(record_text, item)
    for key, value in _fields(record_text, _ITEM_FIELD):
        m = _FILE_FIELD.match(key)
        if own and m and (m.group(1), m.group(2)) != own:
            continue
        if _COPY.search(_norm(value)):
            return value
    return None


def _us_government_original(record_text, statement, item=None):
    """The government-creation field when the record is government-made and not a copy, else None."""
    if _copy_marker(record_text, item) or _outside_entry(record_text) or _non_government_creator(record_text):
        return None
    return _government_created(record_text)


def _nywt_staff(record_text):
    """The credit naming a New York World-Telegram & Sun staff photographer, or None."""
    collection = _key(NYWT_COLLECTION)
    if not any(collection in _norm(v) for _, v in _fields(record_text, _COLLECTION_FIELD)):
        return None
    staff = [v for v in _credits(record_text) if _NYWT_STAFF.search(_norm(v))]
    return (staff or _named_photographers(record_text) or [None])[0]


# Approved LoC wordings, each with its condition: None (always) or a function of (record_text,
# statement) that returns the credit meeting it, or None.
_LOC_WORDINGS = (
    (LOC_APPROVED, None),
    (LOC_US_GOVERNMENT_FULL, _us_government_original),   # before the short form it begins with
    (LOC_US_GOVERNMENT, None),
    (LOC_STAFF, lambda record_text, statement, item=None: _us_news_staff(record_text, statement)),
    (LOC_NYWT, lambda record_text, statement, item=None: _nywt_staff(record_text)),
)


def _rest_after(text, phrase):
    """The text after an approved wording that text begins with ("" when it is alone), else None.

    The wording must end there: at the end, or at a period or semicolon."""
    key = _key(phrase)
    if not text.startswith(key):
        return None
    rest = text[len(key):]
    if rest in ("", "."):
        return ""
    if rest[0] in ".;" and rest[1:2] == " ":
        return rest[2:]
    return None


def _classify(holder_registry_id, rights_statement, record_text=None, item=None):
    """(result, basis): the rule's class and, for a conditional wording, the credit it rests on."""
    text = _norm(rights_statement)
    if not text:
        return None, None
    if holder_registry_id == LOC:
        if any(_key(p) in text for p in LOC_BARRED):
            return NOT_USABLE, None
        for phrase, condition in _LOC_WORDINGS:
            rest = _rest_after(text, phrase)
            if rest is None:
                continue
            caveat = next((c for c in CAVEATS if _key(c) in rest), None)
            if caveat:
                return NOT_USABLE, f"caveat {caveat!r}"
            if condition is None:
                return PUBLIC_DOMAIN, None
            wire = _wire_credit(record_text)
            if wire:
                return NOT_USABLE, f"wire-service credit {wire!r}"
            credit = condition(record_text, rights_statement, item)
            return (PUBLIC_DOMAIN, credit) if credit else (NOT_USABLE, None)
        return None, None
    if holder_registry_id == NARA:
        status = text.rstrip(".").strip()
        if status == _key(NARA_APPROVED):
            return PUBLIC_DOMAIN, None
        if status in {_key(p) for p in NARA_BARRED}:
            return NOT_USABLE, None
        return None, None
    return None, None


def rights_class(holder_registry_id, rights_statement, record_text=None, item=None):
    """The rule for one holder statement: PUBLIC_DOMAIN, NOT_USABLE, or None (not decided).

    holder_registry_id is the authority registry entry id the statement's source resolves to;
    record_text is that source's saved snapshot, read for a staff photographer credit when the
    wording needs one (without it a conditional wording is never usable).
    """
    return _classify(holder_registry_id, rights_statement, record_text, item)[0]


def holder_values(holder_registry_id, snapshot_text):
    """The holder's own rights wording in its snapshot: the values of its rights fields, as written."""
    pattern = _FIELDS.get(holder_registry_id)
    return [] if pattern is None else [v for _, v in _fields(snapshot_text, pattern)]


@dataclass(frozen=True)
class Holder:
    """A source of a media item published by one of the rule's holders, with its snapshot text."""
    source_id: str
    registry_id: str
    url: str
    text: str
    item: dict | None = None    # the media item's own url and title (item-scoped copy check)


@dataclass(frozen=True)
class Ruling:
    result: str | None          # PUBLIC_DOMAIN, NOT_USABLE or None
    holder: Holder | None = None
    value: str | None = None    # the holder's wording the ruling rests on
    basis: str | None = None    # for a conditional wording, the record's credit it rests on


def holders_of(media, sources_by_id, snapshot_text_of, registry):
    """The media item's sources the registry resolves to a rule holder, with snapshot text.

    snapshot_text_of(source_id) returns the raw snapshot text, or None when the snapshot is
    missing or failed its integrity check (the caller decides; gates.g1_media passes only
    snapshots that pass G1).
    """
    out = []
    sids = media.get("source_ids") if isinstance(media.get("source_ids"), list) else []
    for sid in sids:
        src = sources_by_id.get(sid) if isinstance(sid, str) else None
        if not isinstance(src, dict):
            continue
        entry = registry.resolve(src.get("url"))
        if entry is None or entry.id not in RULE_HOLDERS:
            continue
        text = snapshot_text_of(sid)
        if isinstance(text, str):
            out.append(Holder(sid, entry.id, src.get("url"), text,
                              {"url": media.get("url"), "title": media.get("title")}))
    return out


def ruling(statement, holders):
    """The rule for a media item: NOT_USABLE if any holder field is barred; else PUBLIC_DOMAIN if
    the statement is a holder field's own wording that the rule approves; else None."""
    grant = None
    want = _norm(statement)
    for h in holders:
        for value in holder_values(h.registry_id, h.text):
            result, basis = _classify(h.registry_id, value, h.text, h.item)
            if result == NOT_USABLE:
                return Ruling(NOT_USABLE, h, value, basis)
            if result == PUBLIC_DOMAIN and grant is None and want and want == _norm(value):
                grant = Ruling(PUBLIC_DOMAIN, h, value, basis)
    return grant or Ruling(None)


@dataclass(frozen=True)
class Lookup:
    """What the private-writings rule reads outside the media record (gates.private_lookup builds it).

    fact_of(fact_id) -> the fact record or None; fact_status(fact_id) -> its current status;
    quote_in(source_id, quote) -> True when the quote is verbatim in that source's intact snapshot;
    holder_states(media, statement) -> the id of an item source on a registered holder (not a
    media-only host) whose intact snapshot carries the statement verbatim, or None."""
    fact_of: Callable
    fact_status: Callable
    quote_in: Callable
    holder_states: Callable


def _authorship(media):
    a = media.get("authorship") if isinstance(media, dict) else None
    return a if isinstance(a, dict) else None


def is_private(media):
    """True when the media record says the item is a private writing (authorship kind private)."""
    a = _authorship(media)
    return bool(a) and a.get("kind") == PRIVATE


def _surname(name):
    words = _norm(name).replace(",", " ").split()
    return words[-1] if words else ""


def _year_in(text, year):
    return bool(re.search(rf"(?<!\d){year}(?!\d)", text))


def _basis_problem(basis, year, lookup, *, name=None, word=_DEATH_WORD):
    """None when the basis backs the year (a death year of name, or a publication year), else why not.

    A fact basis: the fact is verified and its claim (or event_date) gives the year, the name's
    surname and the event word. A source basis: the quote is verbatim in the source's intact
    snapshot and gives the year, the surname and the event word (for a death year, a life span
    "<birth>-<year>" as authority headings write it counts as the word)."""
    if not isinstance(basis, dict) or lookup is None:
        return "no basis"
    surname = _surname(name) if name else None
    fid, sid = basis.get("fact_id"), basis.get("source_id")
    if isinstance(fid, str):
        fact = lookup.fact_of(fid)
        if not isinstance(fact, dict):
            return f"basis fact {fid} is not on file"
        status = lookup.fact_status(fid)
        if status != "verified":
            return f"basis fact {fid} is {status}, not verified"
        claim = _norm(fact.get("claim"))
        date = fact.get("event_date") if isinstance(fact.get("event_date"), str) else ""
        if not (_year_in(claim, year) or date[:4] == str(year)):
            return f"basis fact {fid} does not give the year {year}"
        text = claim
    elif isinstance(sid, str):
        quote = basis.get("quote")
        if not isinstance(quote, str) or not quote.strip() or not lookup.quote_in(sid, quote):
            return f"basis quote is not verbatim in an intact snapshot of {sid}"
        text = _norm(quote)
        if not _year_in(text, year):
            return f"basis quote in {sid} does not give the year {year}"
    else:
        return "basis names no fact_id or source_id"
    if surname and not re.search(rf"(?<!\w){re.escape(surname)}(?!\w)", text):
        return f"basis does not name {name}"
    life_span = word is _DEATH_WORD and re.search(rf"(?<!\d)\d{{4}}\s*[-\u2013]\s*{year}(?!\d)", text)
    if not (word.search(text) or life_span):
        return "basis does not say " + ("the author died that year" if word is _DEATH_WORD else
                                        "the item was published that year")
    return None


def _holder_pd(media, lookup):
    """The holder source whose own statement says the item is in the public domain, or None."""
    statement = media.get("rights_statement")
    text = _norm(statement)
    if not text or not _HOLDER_PD.search(text) or _PD_NEGATED.search(text) or lookup is None:
        return None
    return lookup.holder_states(media, statement)


def private_grant(media, lookup):
    """(condition, None) when a private writing may be public-domain, else (None, why not)."""
    a = _authorship(media) or {}
    pub = a.get("published")
    if isinstance(pub, dict) and isinstance(pub.get("year"), int) and not isinstance(pub.get("year"), bool):
        if pub["year"] < PUBLISHED_BEFORE and _basis_problem(pub.get("basis"), pub["year"], lookup,
                                                              word=_PUBLISH_WORD) is None:
            b = pub["basis"]
            return (f"published in {pub['year']}, before {PUBLISHED_BEFORE} "
                    f"({b.get('fact_id') or b.get('source_id')})"), None
    holder = _holder_pd(media, lookup)
    if holder:
        return f"the holder states it is public domain ({holder})", None
    authors = a.get("authors") if isinstance(a.get("authors"), list) else []
    if not authors:
        return None, "no author is recorded"
    shown = []
    for au in authors:
        au = au if isinstance(au, dict) else {}
        name, year = au.get("name"), au.get("death_year")
        if not isinstance(year, int) or isinstance(year, bool):
            return None, f"no sourced death year for {name}"
        if year >= DEATH_BEFORE:
            return None, f"{name} died in {year}, not before {DEATH_BEFORE}"
        problem = _basis_problem(au.get("death_basis"), year, lookup, name=name)
        if problem:
            return None, f"death year {year} of {name} is not backed: {problem}"
        b = au["death_basis"]
        shown.append(f"{name} d. {year} ({b.get('fact_id') or b.get('source_id')})")
    return f"every author died before {DEATH_BEFORE}: " + "; ".join(shown), None


@dataclass(frozen=True)
class ItemRuling(Ruling):
    private: bool = False       # decided by the private-writings rule
    rested_on_holder: bool = False   # the LoC / NARA wording alone would have granted public-domain


def item_ruling(media, holders, lookup=None):
    """The rule for a media item: the LoC / NARA rule, and for a private writing (authorship kind
    private) the private-writings rule on top of it. A barred holder status still bars."""
    statement = media.get("rights_statement")
    base = ruling(statement, holders)
    if not is_private(media):
        return ItemRuling(base.result, base.holder, base.value, base.basis)
    if base.result == NOT_USABLE:
        return ItemRuling(base.result, base.holder, base.value, base.basis)
    condition, why = private_grant(media, lookup)
    rested = base.result == PUBLIC_DOMAIN
    if condition:
        return ItemRuling(PUBLIC_DOMAIN, base.holder, statement, "private writing; " + condition, True, rested)
    return ItemRuling(NOT_USABLE, base.holder, statement, "private writing; " + why, True, rested)


def _has_text(value):
    return isinstance(value, str) and bool(value.strip())


def _short(text, limit=80):
    text = " ".join(str(text).split())
    return text if len(text) <= limit else text[: limit - 3] + "..."


def _conflict(license_class, r):
    """A problem when license_class disagrees with the ruling, else None."""
    if getattr(r, "private", False):
        if r.result == PUBLIC_DOMAIN and license_class != PUBLIC_DOMAIN:
            return (f"license_class {license_class} does not follow the private-writings rule ({PRIVATE_DECISION}): "
                    f"{r.basis}, so it is public-domain (tools/apply_rights_rule.py)")
        if r.result == NOT_USABLE and license_class in EMBEDDABLE:
            return (f"license_class {license_class} does not follow the private-writings rule ({PRIVATE_DECISION}): "
                    f"{r.basis}; a private writing is link-only (unknown or rights-restricted) unless every author "
                    f"died before {DEATH_BEFORE}, the holder states it is public domain, or it was published "
                    f"before {PUBLISHED_BEFORE}")
        return None
    where = f"{r.holder.source_id}" if r.holder else "the holder"
    if r.result == PUBLIC_DOMAIN and license_class != PUBLIC_DOMAIN:
        return (f"license_class {license_class} does not follow the approved rights rule: the holder's "
                f"statement in {where} ({_short(r.value)!r}) is public-domain (tools/apply_rights_rule.py)")
    if r.result == NOT_USABLE and license_class in EMBEDDABLE:
        return (f"license_class {license_class} does not follow the approved rights rule: the holder's "
                f"statement in {where} ({_short(r.value)!r}) is never usable (unknown or rights-restricted)")
    return None


def rule_problems(media, holders, lookup=None):
    """G1 for media, the rights rule part: [] when the record agrees with the rule (lookup: the
    private-writings rule's reader, gates.private_lookup; without it no private item qualifies)."""
    if media.get("reconstruction") is True:
        return []
    out = []
    statement = media.get("rights_statement")
    if not _has_text(statement):
        for h in holders:
            values = holder_values(h.registry_id, h.text)
            if values:
                out.append(f"no rights_statement, but the holder's snapshot {h.source_id} carries one: "
                           f"{_short(values[0])!r} (copy it verbatim: tools/apply_rights_rule.py)")
                break
    problem = _conflict(media.get("license_class"), item_ruling(dict(media, rights_statement=statement),
                                                                holders, lookup))
    if problem:
        out.append(problem)
    return out


def derive(media, holders, lookup=None):
    """(changes, problems): the fields the rule sets on a media item, and conflicts it cannot fix.

    A missing rights_statement is copied verbatim from the first holder field found (with
    rights_url the holder's page when that is empty too); license_class becomes public-domain when
    the rule grants it. An item the rule bars but that is marked usable is a problem, never
    rewritten (a person decides), with one exception: when the rule itself granted public-domain
    (its last audit line in notes is a grant) and no person has approved or edited the item, the
    rule withdraws its own grant and license_class goes back to unknown. Only public-domain is
    withdrawn: a licence a person set later (cc0, cc-by ...) is a problem for a person.
    """
    if media.get("reconstruction") is True:
        return {}, []
    changes = {}
    statement = media.get("rights_statement")
    if not _has_text(statement):
        for h in holders:
            values = holder_values(h.registry_id, h.text)
            if values:
                statement = changes["rights_statement"] = values[0]
                if not _has_text(media.get("rights_url")):
                    changes["rights_url"] = h.url
                break
    r = item_ruling(dict(media, rights_statement=statement), holders, lookup)
    if r.result == PUBLIC_DOMAIN and media.get("license_class") != PUBLIC_DOMAIN:
        changes["license_class"] = PUBLIC_DOMAIN
    if r.result == NOT_USABLE and media.get("license_class") == PUBLIC_DOMAIN and (
            _rule_granted(media) or (r.private and r.rested_on_holder and _unreviewed(media))):
        # The rule withdraws its own grant; and the private-writings rule withdraws a public-domain
        # class that rested only on the LoC / NARA wording, while no person has decided the item.
        changes["license_class"] = "unknown"
    problem = _conflict(changes.get("license_class", media.get("license_class")), r)
    return changes, [problem] if problem else []


_NOTE_PREFIX = "Applied the approved rights rule"
_GRANT = "license_class set to public-domain"


def _unreviewed(media):
    """True when no person has approved, edited or rejected the item."""
    review = media.get("review") if isinstance(media.get("review"), dict) else {}
    return review.get("state") not in ("approved", "edited", "rejected")


def _rule_granted(media):
    """True when the rule's last audit line in notes granted public-domain and no person has
    approved or edited the item."""
    if not _unreviewed(media):
        return False
    notes = media.get("notes") if isinstance(media.get("notes"), str) else ""
    lines = [x for x in notes.splitlines() if x.startswith(_NOTE_PREFIX)]
    return bool(lines) and _GRANT in lines[-1]


def change_note(changes, r_value, today, basis=None, private=False):
    """The audit note apply_rights_rule.py and merge_staging.py add to a changed record."""
    if private:
        parts = []
        if "rights_statement" in changes:
            parts.append(f"rights_statement copied verbatim from the holder's snapshot ({_short(changes['rights_statement'])!r})")
        if changes.get("license_class") == "unknown":
            parts.append(f"license_class set back to unknown (link-only): {basis}; the holder's statement "
                         f"{_short(r_value)!r} alone is not a rights grant for a private writing")
        elif "license_class" in changes:
            parts.append(f"license_class set to public-domain: {basis}")
        return f"{_NOTE_PREFIX} ({PRIVATE_DECISION}, private-writings rule) on {today}: " + "; ".join(parts) + "."
    parts = []
    if "rights_statement" in changes:
        parts.append(f"rights_statement copied verbatim from the holder's snapshot ({_short(changes['rights_statement'])!r})")
    if changes.get("license_class") == "unknown":
        parts.append(f"license_class set back to unknown: the rule now bars the holder's statement {_short(r_value)!r}"
                     " and withdraws its own earlier public-domain grant")
    elif "license_class" in changes:
        part = f"license_class set to public-domain from the holder's statement {_short(r_value)!r}"
        if basis:
            part += f", on the condition shown in the holder's record ({_short(basis)!r})"
        parts.append(part)
    return (f"{_NOTE_PREFIX} (DECISIONS 2026-10-09, LoC/NARA and extended LoC rule) on {today}: "
            + "; ".join(parts) + ".")
