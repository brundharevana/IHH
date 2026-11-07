"""Tests for the approved Library of Congress / National Archives rights rule (tools/ihh/rights.py,
DECISIONS 2026-10-09 "Rights mapping for LoC and NARA") and for G1 media applying it.

All data is fake (factories.py): the rule's holders are test registry entries with the rule's
ids ("loc", "nara") on example hosts.
"""

import pytest

import factories as fx
from ihh import gates, rights

PD, NOT_USABLE = rights.PUBLIC_DOMAIN, rights.NOT_USABLE

LOC_SNAPSHOT = ("title: Example portrait\n"
                "rights_advisory: {advisory}\n"
                "item.rights_advisory: {advisory}\n"
                "access_restricted: false\n"
                "unrestricted: true\n")
NARA_SNAPSHOT = ("title: Example naturalization record\n"
                 "useRestriction.status: {use}\n"
                 "accessRestriction.status: Unrestricted\n")


def loc_text(advisory):
    return LOC_SNAPSHOT.format(advisory=advisory)


def nara_text(use):
    return NARA_SNAPSHOT.format(use=use)


# --- rights_class: phrase -> class ------------------------------------------------------------

@pytest.mark.parametrize("statement", [
    "No known restrictions on publication.",
    "No known restrictions on publication",
    "no known restrictions on publication.",
    "NO KNOWN RESTRICTIONS ON PUBLICATION.",
    "No known restrictions on publication. For more information, see Harris & Ewing Collection.",
    "No known restrictions on publication. Photographer released restrictions on September 15, 2016.",
    "  No known  restrictions on publication.  ",
])
def test_loc_approved_phrase_is_public_domain(statement):
    assert rights.rights_class("loc", statement) == PD


@pytest.mark.parametrize("statement", ["Unrestricted", "unrestricted", "UNRESTRICTED", " Unrestricted. "])
def test_nara_unrestricted_is_public_domain(statement):
    assert rights.rights_class("nara", statement) == PD


@pytest.mark.parametrize("statement", [
    "Publication may be restricted. For information see \"Herbert Block\" collection.",
    "Rights status not evaluated. For general information see \"Copyright and Other Restrictions...\"",
    "rights status not evaluated.",
    # The approved phrase does not outweigh a barred one in the same advisory.
    "No known restrictions on publication. Publication may be restricted for some items.",
])
def test_loc_barred_phrases_are_not_usable(statement):
    assert rights.rights_class("loc", statement) == NOT_USABLE


@pytest.mark.parametrize("statement", ["Restricted", "Restricted - Possibly", "restricted - possibly",
                                       "Restricted – Possibly", "Restricted - Partly",
                                       "Restricted - Fully", "Undetermined"])
def test_nara_barred_statuses_are_not_usable(statement):
    assert rights.rights_class("nara", statement) == NOT_USABLE


@pytest.mark.parametrize("statement", [
    "No known restrictions on publication in the United States.",
    "No known copyright restrictions apply.",
    "No known restrictions on images made by the U.S. Government agencies.",
    "May be restricted:  Information on reproduction rights available in LC P&P Restrictions Statement.",
    "The books in this collection are in the public domain and are free to use and reuse.",
    "There are no known restrictions on publication.",
    "",
    None,
])
def test_loc_other_statements_are_not_decided_by_the_rule(statement):
    assert rights.rights_class("loc", statement) is None


@pytest.mark.parametrize("statement", ["Unrestricted use", "This record is unrestricted.",
                                       "Some of the materials in this file may be subject to copyright.",
                                       "No known restrictions on publication."])
def test_nara_other_statements_are_not_decided_by_the_rule(statement):
    assert rights.rights_class("nara", statement) is None


@pytest.mark.parametrize("holder", [None, "", "example-commons", "example-national-archives", "wikimedia-commons",
                                    "LOC", "loc.gov", "archives.gov"])
@pytest.mark.parametrize("statement", ["No known restrictions on publication.", "Unrestricted", "Public domain"])
def test_the_rule_applies_only_to_the_registry_holders_loc_and_nara(holder, statement):
    assert rights.rights_class(holder, statement) is None


def test_each_holder_has_only_its_own_phrase():
    assert rights.rights_class("loc", "Unrestricted") is None
    assert rights.rights_class("nara", "No known restrictions on publication.") is None


def test_rule_text_names_every_phrase():
    text = rights.RULE_TEXT
    for phrase in ("No known restrictions on publication", "Unrestricted", "Publication may be restricted",
                   "Rights status not evaluated", "Restricted - Possibly", "Undetermined",
                   "No known restrictions on images made by the U.S. Government",
                   "No known restrictions on work by staff photographers", "No known copyright restriction",
                   "Warren K. Leffler", "Thomas J. O'Halloran", "Marion S. Trikosko", "John Bledsoe",
                   "Chick Harrity", "World-Telegram", "may be restricted", "No renewal in Copyright office"):
        assert phrase in text, phrase
    assert "Commons" in text


# --- extended LoC rule (DECISIONS 2026-10-09 "Extended LoC rights rule") ----------------------------

USN = "No known restrictions on work by staff photographers."
CQ_ADVISORY = (USN + " Other material may be restricted by copyright. Privacy and publicity rights may also "
               "apply. For information see: \"CQ Roll Call Photograph Collection\" "
               "https://www.loc.gov/rr/print/res/683_cqrc.html")
NYWT = ("No known copyright restriction. For information see \"New York World-Telegram & ...,\" "
        "https://www.loc.gov/rr/print/res/076_nyw.html")
HABS = ("No known restrictions on images made by the U.S. Government; images     copied from other sources may "
        "be restricted.    https://www.loc.gov/rr/print/res/114_habs.html")
EIN_M_0006 = "No known restrictions on publication. No renewal in Copyright office (checked 8/31/76)."
NYWT_COLLECTION = ("item.part_of: New York World-Telegram and the Sun Newspaper Photograph Collection "
                   "(Library of Congress)\n")


HABS_RECORD = ("item.part_of: Historic American Buildings Survey (Library of Congress)",
               "item.creators[0].title: Historic American Buildings Survey", "item.creators[0].role: creator",
               # Survey staff count only when the heading itself carries the government affiliation.
               "item.creators[1].title: Boucher, Jack E., Historic American Buildings Survey",
               "item.creators[1].role: photographer",
               "contributor_names[0]: Historic American Buildings Survey, creator",
               "contributor_names[1]: Boucher, Jack E., Historic American Buildings Survey, photographer",
               "title: John Muir House, Alhambra Boulevard, Martinez, Contra Costa County, CA",
               # LoC ordering prose (not a field) mentions photocopies; it says nothing about this item.
               "The entire group can be ordered as photocopies or high-quality copies.")
HABS_RECOPY = ("resources[0].files[0][4].title: 1.  Historic American Buildings Survey Photograph Original 1900 - "
               "Recopy 1960 GENERAL VIEW FROM SOUTH")


def record(advisory, *lines):
    """A LoC snapshot: the rights fields plus credit lines as fetch_snapshot.py writes them."""
    return loc_text(advisory) + "".join(line + "\n" for line in lines)


@pytest.mark.parametrize("statement", [
    "No known restrictions on images made by the U.S. Government.",
    "No known restrictions on images made by the U.S. Government",
    "no known restrictions on images made by the u.s. government. For more information, see the HABS guide.",
])
def test_loc_us_government_images_are_public_domain(statement):
    assert rights.rights_class("loc", statement) == PD
    assert rights.rights_class("loc", statement, record(statement)) == PD


@pytest.mark.parametrize("lines", [
    HABS_RECORD,
    ("item.part_of: Historic American Landscapes Survey (Library of Congress)",
     "item.creators[0].title: Historic American Landscapes Survey", "item.creators[0].role: creator",
     "item.creators[1].title: Rachman, Fred, Historic American Landscapes Survey",
     "item.creators[1].role: historian",
     "item.notes[0]: Survey number: HALS CA-132"),
    ("contributor_names[0]: Historic American Engineering Record, creator",),
    ("item.part_of: Historic American Engineering Record (Library of Congress)",
     "item.creators[0].title: Lowe, Jet, Historic American Engineering Record",
     "item.creators[0].role: photographer"),
    # A U.S. Government agency as creator.
    ("item.creators[0].title: United States. Office of War Information", "item.creators[0].role: creator"),
    ("contributor_names[0]: United States. Farm Security Administration, creator",
     "contributor_names[1]: Lange, Dorothea, United States. Farm Security Administration, photographer"),
])
def test_full_us_government_wording_is_public_domain_for_a_government_created_record(lines):
    assert rights.rights_class("loc", HABS, record(HABS, *lines)) == PD


HALS_CA_132 = ("item.part_of: Historic American Landscapes Survey (Library of Congress)",
               "item.creators[0].title: Historic American Landscapes Survey", "item.creators[0].role: creator",
               "item.creators[1].title: Stevens, Christopher M., Historic American Landscapes Survey",
               "item.creators[1].role: transmitter")


@pytest.mark.parametrize("extra", [
    # An outside entry is not made by the government, even when the survey accepts it.
    ("item.notes[1]: 2016 HALS Challenge Entry: Documenting National Register Listed Landscapes",),
    ("notes[0]: HABS Challenge entry, 2014.",),
    ("item.notes[0]: Charles E. Peterson Prize entry, 2001.",),
    ("item.notes[0]: Student competition entry.",),
    # A named creator with no government role (family members, owners) is not shown as government work.
    ("item.creators[2].title: Muir, Louisa Wanda (Louie) Strentzel", "item.creators[2].role: subject"),
    ("item.creators[2].title: Smith, William A.", "item.creators[2].role: architect"),
    ("contributor_names[3]: Martinez, Ygnacio, owner",),
    # A staff role alone is not government evidence: the heading must carry the affiliation.
    ("item.creators[2].title: Boucher, Jack E.", "item.creators[2].role: photographer"),
    ("contributor_names[3]: Lowe, Jet, photographer",),
    ("item.creators[2].title: Rachman, Fred", "item.creators[2].role: historian"),
    ("item.creators[2].title: Stevens, Christopher M.", "item.creators[2].role: transmitter"),
])
def test_full_us_government_wording_needs_positive_government_creation(extra):
    assert rights.rights_class("loc", HABS, record(HABS, *HALS_CA_132)) == PD
    assert rights.rights_class("loc", HABS, record(HABS, *HALS_CA_132, *extra)) == NOT_USABLE


# --- owner decision 2026-10-18: HABS/HAER/HALS makers vs associated people, item-scoped copies ---

ASSOCIATED = (
    ("item.creators[2].title: Muir, John",),
    ("contributor_names[3]: Muir, Helen",),
    ("item.creators[2].title: Strentzel, John Theophil", "contributor_names[3]: Muir, Louisa Wanda (Louie) Strentzel"),
)


@pytest.mark.parametrize("extra", ASSOCIATED)
def test_a_survey_record_names_associated_people_without_a_role_who_are_not_makers(extra):
    assert rights.rights_class("loc", HABS, record(HABS, *HALS_CA_132, *extra)) == PD


@pytest.mark.parametrize("extra", [
    ("item.creators[2].title: Muir, John", "item.creators[2].role: owner"),
    ("item.creators[2].title: Muir, John", "item.creators[2].role: subject"),
    ("item.creators[2].title: Smith, William A.", "item.creators[2].role: architect"),
    ("contributor_names[3]: Martinez, Ygnacio, owner",),
    ("item.notes[0]: HABS Challenge entry, 2014.", "contributor_names[3]: Muir, John"),
])
def test_associated_people_do_not_excuse_a_role_that_is_not_survey_staff_or_an_outside_entry(extra):
    assert rights.rights_class("loc", HABS, record(HABS, *HALS_CA_132, *extra)) == NOT_USABLE


def test_roleless_names_are_not_excused_in_a_government_record_that_is_not_a_survey():
    lines = ("contributor_names[0]: United States. Farm Security Administration, creator",
             "contributor_names[1]: Muir, John")
    assert rights.rights_class("loc", HABS, record(HABS, *lines)) == NOT_USABLE


ROSTER = ("item.creators[2].title: Pope, Charles S.", "item.creators[2].role: project manager",
          "item.creators[3].title: Rotsch, Melvin M.", "item.creators[3].role: field team supervisor",
          "item.creators[4].title: Jones, David T.", "item.creators[4].role: field team",
          "item.creators[5].title: Boucher, Jack E.", "item.creators[5].role: photographer",
          "item.creators[6].title: Koue, A. Lewis", "item.creators[6].role: historian")


def test_a_survey_team_roster_makes_its_own_photographer_and_historian_survey_staff():
    assert rights.rights_class("loc", HABS, record(HABS, *HALS_CA_132, *ROSTER)) == PD
    # Without the roster a lone photographer or historian is still no evidence (tests above).
    lone = ("item.creators[2].title: Boucher, Jack E.", "item.creators[2].role: photographer")
    assert rights.rights_class("loc", HABS, record(HABS, *HALS_CA_132, *lone)) == NOT_USABLE
    # The roster never excuses a role outside the survey team.
    extra = ("item.creators[7].title: Smith, William A.", "item.creators[7].role: architect")
    assert rights.rights_class("loc", HABS, record(HABS, *HALS_CA_132, *ROSTER, *extra)) == NOT_USABLE
    # A roster is no evidence of government creation by itself.
    assert rights.rights_class("loc", HABS, record(HABS, *ROSTER)) == NOT_USABLE


PHOTOS = "https://tile.example/photos/"
FILES = ("resources[0].files[0][3].url: " + PHOTOS + "1v.jpg",
         "resources[0].files[0][4].title: 1.  Historic American Buildings Survey Photograph Original 1900 - Recopy 1960 VIEW",
         "resources[0].files[1][3].url: " + PHOTOS + "3v.jpg",
         "resources[0].files[1][4].title: 3. Historic American Buildings Survey, Jack E. Boucher, photographer, October 1960 DETAIL",
         "resources[1].files[0][3].url: https://tile.example/sheet/2v.jpg",
         "resources[1].files[0][4].title: 2. Basement and first floor plans")


def test_a_recopy_in_the_record_bars_only_its_own_file_and_the_record_page():
    text = record(HABS, *HABS_RECORD, *FILES)
    assert rights.rights_class("loc", HABS, text) == NOT_USABLE           # no item: whole record
    page = {"url": "https://www.loc.gov/item/ca0124/", "title": "John Muir House"}
    assert rights.rights_class("loc", HABS, text, page) == NOT_USABLE     # the page shows the recopy too
    recopy = {"url": PHOTOS + "1v.jpg", "title": "1. Recopy 1960 VIEW"}
    assert rights.rights_class("loc", HABS, text, recopy) == NOT_USABLE
    photo = {"url": PHOTOS + "3v.jpg", "title": "3. Historic American Buildings Survey, Jack E. Boucher, photographer"}
    assert rights.rights_class("loc", HABS, text, photo) == PD
    sheet = {"url": "https://tile.example/sheet/2v.jpg", "title": "2. Basement and first floor plans"}
    assert rights.rights_class("loc", HABS, text, sheet) == PD


def test_an_item_whose_own_title_marks_a_copy_is_barred_whatever_its_file():
    text = record(HABS, *HABS_RECORD, *FILES)
    odd = {"url": PHOTOS + "3v.jpg", "title": "3. Photocopy of photograph DETAIL"}
    assert rights.rights_class("loc", HABS, text, odd) == NOT_USABLE
    # A file the record does not list is not excused: only a listed, clean file is item-scoped.
    unknown = {"url": PHOTOS + "9v.jpg", "title": "9. Elsewhere"}
    assert rights.rights_class("loc", HABS, text, unknown) == NOT_USABLE


def test_item_scope_does_not_excuse_other_record_fields_that_mark_a_copy_or_outside_entry():
    for line in ("item.notes[1]: Copy of a photograph, ca. 1900.", "item.notes[0]: Student competition entry."):
        text = record(HABS, *HABS_RECORD, *FILES, line)
        photo = {"url": PHOTOS + "3v.jpg", "title": "3. DETAIL"}
        assert rights.rights_class("loc", HABS, text, photo) == NOT_USABLE


def test_ruling_and_derive_use_the_item_scope_of_a_media_record():
    w = fx.world()
    text = record(HABS, *HABS_RECORD, *FILES)
    m = fx.add_holder_media(w, 1, "loc", text, HABS, "unknown")
    m["url"], m["title"] = PHOTOS + "3v.jpg", "3. Item record 1"
    assert rights.derive(m, holders(w, m))[0] == {"license_class": "public-domain"}
    m["url"] = PHOTOS + "1v.jpg"
    assert rights.derive(m, holders(w, m))[0] == {}


def test_derive_reverts_public_domain_the_rule_itself_set_when_the_rule_now_bars_it():
    """A ruling the rule made earlier is the rule's to withdraw (it only ever makes an item less
    usable); public-domain set by a person, or reviewed by one, is still a problem for a person."""
    w = fx.world()
    lines = (*HALS_CA_132, "item.notes[1]: 2016 HALS Challenge Entry.")
    m = fx.add_holder_media(w, 1, "loc", record(HABS, *lines), HABS, "public-domain")
    m["notes"] = ("Older note.\n" + rights.change_note({"license_class": PD}, HABS, "2026-10-09",
                                                     "Historic American Landscapes Survey (Library of Congress)"))
    changes, problems = rights.derive(m, holders(w, m))
    assert changes == {"license_class": "unknown"} and problems == []
    assert "now bars" in rights.change_note(changes, HABS, "2026-10-10")
    reviewed = dict(m, review={"state": "approved", "reviewer": "x", "date": "2026-10-09", "note": ""})
    changes, problems = rights.derive(reviewed, holders(w, reviewed))
    assert changes == {} and problems and "never usable" in problems[0]
    by_hand = dict(m, notes="Set by a reviewer.")
    changes, problems = rights.derive(by_hand, holders(w, by_hand))
    assert changes == {} and problems
    # A licence a person set later (cc-by, cc0) is never silently overwritten, even after a grant line.
    for licence in ("cc-by", "cc0"):
        later = dict(m, license_class=licence)
        changes, problems = rights.derive(later, holders(w, later))
        assert changes == {} and problems and "never usable" in problems[0]
    # A rejected review is a person's decision too: no revert.
    rejected = dict(m, review={"state": "rejected", "reviewer": "x", "date": "2026-10-09", "note": ""})
    changes, problems = rights.derive(rejected, holders(w, rejected))
    assert changes == {} and problems


@pytest.mark.parametrize("copy_line", [
    HABS_RECOPY,
    "title: Photocopy of photograph (original in the John Muir papers)",
    "item.notes[1]: Copied from a print lent by the Muir family.",
    "item.notes[1]: Copy of a photograph, ca. 1900.",
    "item.notes[1]: Photograph of a photograph in the Strentzel album.",
    "resources[0].caption: Photocopies of historic photographs",
    "item.description[0]: Copy photograph of a 1890 lithograph.",
])
def test_full_us_government_wording_is_blocked_when_the_image_is_a_copy(copy_line):
    assert rights.rights_class("loc", HABS, record(HABS, *HABS_RECORD, copy_line)) == NOT_USABLE


@pytest.mark.parametrize("lines", [
    (),
    ("item.creators[0].title: Smith, John", "item.creators[0].role: photographer"),
    ("item.part_of: Detroit Publishing Company Photograph Collection (Library of Congress)",),
    ("title: Historic American Buildings Survey drawings, a private copy set",),   # a title is not creation
    ("item.creators[0].title: Historic American Buildings Survey", "item.creators[0].role: subject"),
])
def test_full_us_government_wording_is_blocked_without_government_creation(lines):
    assert rights.rights_class("loc", HABS, record(HABS, *lines)) == NOT_USABLE
    assert rights.rights_class("loc", HABS) == NOT_USABLE


def test_the_short_government_wording_with_another_trailing_caveat_is_still_blocked():
    statement = "No known restrictions on images made by the U.S. Government; other material may be restricted."
    assert rights.rights_class("loc", statement, record(statement, *HABS_RECORD)) == NOT_USABLE


@pytest.mark.parametrize("credit", [
    "contributor_names[0]: Leffler, Warren K., photographer",
    "item.contributors[0]: Leffler, Warren K, photographer.",
    "item.creators[0].title: Trikosko, Marion S.",
    "contributor_names[0]: O'Halloran, Thomas J., photographer",
    "contributor_names[0]: O’Halloran, Thomas J., photographer",
    "item.stmt_of_responsibility: photo by Thomas J. O'Halloran.",
    "notes[0]: Photographer: John Bledsoe.",
    "contributor_names[1]: Harrity, Chick, photographer",
    "notes[1]: U.S. News & World Report photograph by Warren Leffler.",
    "item.notes[0]: Marion S. Trikosko, photographer, U.S. News & World Report.",
])
def test_staff_photographers_wording_is_public_domain_with_a_credited_us_news_staff_photographer(credit):
    text = record(USN, credit)
    assert rights.rights_class("loc", USN, text) == PD
    # A wire-service name inside another word ("Cupid", "Tupi") is not a wire credit.
    for note in ("notes[5]: Photograph of the Cupid fountain.", "notes[5]: Tupi pottery on the desk."):
        assert rights.rights_class("loc", USN, record(USN, credit, note)) == PD


def test_staff_photographers_wording_may_carry_the_credit_itself():
    statement = USN + " Photograph by Warren K. Leffler."
    assert rights.rights_class("loc", statement, record(statement)) == PD


@pytest.mark.parametrize("credit", [
    "",
    "contributor_names[0]: Graham, Douglas (Photographer), photographer",
    "contributor_names[0]: Ferrell, Scott J., photographer",
    "contributor_names[0]: Leffler, Ann, photographer",       # surname alone is not the photographer
    "contributor_names[0]: Warren, John K., photographer",
    "title: Portrait of Warren K. Leffler",                    # a title is not a credit field
    "notes[0]: Portrait of Warren K. Leffler at his desk.",    # a subject mention in notes is not a credit
    "notes[0]: Gift of Leffler, Warren K., 1990.",
    "item.notes[2]: Warren K. Leffler retired in 1985.",
    "subject[0]: Leffler, Warren K.",                          # nor a subject heading
])
def test_staff_photographers_wording_is_blocked_without_a_credited_us_news_staff_photographer(credit):
    text = record(USN, credit) if credit else record(USN)
    assert rights.rights_class("loc", USN, text) == NOT_USABLE
    # No record at all: the condition cannot be met.
    assert rights.rights_class("loc", USN) == NOT_USABLE


@pytest.mark.parametrize("credit", [
    "notes[0]: AP Wirephoto.",
    "contributor_names[1]: Associated Press, photographer",
    "notes[0]: United Press International photo.",
])
def test_staff_photographers_wording_is_blocked_by_a_wire_service_credit(credit):
    text = record(USN, "contributor_names[0]: Leffler, Warren K., photographer", credit)
    assert rights.rights_class("loc", USN, text) == NOT_USABLE


@pytest.mark.parametrize("lines", [
    (NYWT_COLLECTION, "contributor_names[0]: Aumuller, Al, photographer"),
    (NYWT_COLLECTION, "item.creators[0].title: Aumuller, Al", "item.creators[0].role: photographer"),
    (NYWT_COLLECTION, "notes[1]: NYWT&S staff photograph."),
    (NYWT_COLLECTION, "notes[0]: World-Telegram photo."),
    (NYWT_COLLECTION, "item.stmt_of_responsibility: World-Telegram & Sun photo by Phil Stanziola."),
    ("source_collection: New York World-Telegram and the Sun Newspaper Photograph Collection (Library of Congress)",
     "item.stmt_of_responsibility: photo by Al. Aumuller."),
])
def test_nywt_wording_is_public_domain_with_a_credited_world_telegram_staff_photographer(lines):
    text = record(NYWT, *[x.rstrip("\n") for x in lines])
    assert rights.rights_class("loc", NYWT, text) == PD


@pytest.mark.parametrize("lines", [
    (),
    (NYWT_COLLECTION,),                                                       # no photographer named
    ("contributor_names[0]: Aumuller, Al, photographer",),                    # not the NYWT&S collection
    (NYWT_COLLECTION, "contributor_names[0]: Aumuller, Al",),                 # a name with no photographer role
    (NYWT_COLLECTION, "item.creators[0].title: Aumuller, Al", "item.creators[0].role: subject"),
    (NYWT_COLLECTION, "contributor_names[0]: Associated Press, photographer"),
    (NYWT_COLLECTION, "contributor_names[0]: Aumuller, Al, photographer", "notes[0]: AP Wirephoto."),
    (NYWT_COLLECTION, "contributor_names[0]: Aumuller, Al, photographer", "notes[0]: Acme Newspictures photo."),
    (NYWT_COLLECTION, "item.stmt_of_responsibility: UPI photo.",),
    (NYWT_COLLECTION, "notes[0]: INP photo.", "notes[1]: World-Telegram photo."),
    (NYWT_COLLECTION, "notes[0]: Underwood & Underwood.", "contributor_names[0]: Aumuller, Al, photographer"),
    (NYWT_COLLECTION, "contributor_names[0]: Harris & Ewing, photographer"),
    ("title: Seen in the World-Telegram photo archive",),                     # a title is not a credit field
    (NYWT_COLLECTION, "title: Seen in the World-Telegram photo archive"),
    (NYWT_COLLECTION, "subject[0]: Photograph by Al Aumuller, photographer"),  # a subject is not a credit
])
def test_nywt_wording_is_blocked_without_a_staff_credit_or_with_a_wire_credit(lines):
    text = record(NYWT, *[x.rstrip("\n") for x in lines])
    assert rights.rights_class("loc", NYWT, text) == NOT_USABLE
    assert rights.rights_class("loc", NYWT) == NOT_USABLE


@pytest.mark.parametrize("statement", [
    "No known restrictions on publication. Other material may be restricted by copyright.",
    "No known restrictions on publication. Restrictions apply.",
    "No known restrictions on publication. Some images are subject to copyright restrictions.",
    "No known restrictions on publication. Permission required for commercial use.",
    "No known restrictions on publication. Permission is required for commercial use.",
    "No known restrictions on publication. This image is not in the public domain.",
    "No known restrictions on publication. The image may be protected by copyright.",
    "No known restrictions on publication. Privacy and publicity rights may also apply.",
    "No known restrictions on images made by the U.S. Government. Restrictions may apply.",
    CQ_ADVISORY,
])
def test_a_trailing_restrictive_caveat_blocks_the_approved_wording(statement):
    credited = record(statement, "contributor_names[0]: Leffler, Warren K., photographer")
    assert rights.rights_class("loc", statement, credited) == NOT_USABLE


def test_a_trailing_caveat_blocks_even_with_a_credited_staff_photographer():
    nywt = "No known copyright restriction. Other material may be restricted by copyright."
    text = record(nywt, NYWT_COLLECTION.rstrip("\n"), "notes[0]: NYWT&S staff photograph.")
    assert rights.rights_class("loc", nywt, text) == NOT_USABLE


@pytest.mark.parametrize("statement", [
    EIN_M_0006,
    "No known restrictions on publication. No renewal in Copyright office record.",
    "No known restrictions on publication. For more information, see Harris & Ewing Photographs - Rights and "
    "Restrictions Information https://www.loc.gov/rr/print/res/140_harr.html",
    "No known restrictions on publication. For general information see \"Copyright and Other Restrictions...\"",
    "No known restrictions on publication. Photographer released restrictions on September 15, 2016.",
])
def test_a_supportive_or_pointer_trailing_sentence_does_not_block(statement):
    assert rights.rights_class("loc", statement) == PD
    assert rights.rights_class("loc", statement, record(statement)) == PD


def test_ein_m_0006_stays_public_domain_through_g1_and_derive():
    w = fx.world()
    m = fx.add_holder_media(w, 1, "loc", loc_text(EIN_M_0006), EIN_M_0006, "public-domain")
    assert g1(w, m) == []
    assert rights.derive(m, holders(w, m)) == ({}, [])


def test_the_staff_credit_is_read_from_the_same_holder_snapshot_only():
    """A credit on a Commons page, or in another source's snapshot, never meets the condition."""
    w = fx.world()
    m = fx.add_holder_media(w, 1, "loc", record(USN), USN, "unknown")
    commons = fx.add_holder_media(w, 2, "commons", "rights_advisory: " + USN + "\n"
                                  "contributor_names[0]: Leffler, Warren K., photographer\n", USN, "unknown")
    m["source_ids"].append(commons["source_ids"][0])
    r = rights.ruling(USN, holders(w, m))
    assert r.result == NOT_USABLE


def test_g1_and_derive_apply_the_extended_rule():
    w = fx.world()
    nywt_text = record(NYWT, NYWT_COLLECTION.rstrip("\n"), "contributor_names[0]: Aumuller, Al, photographer",
                       "notes[1]: NYWT&S staff photograph.")
    m = fx.add_holder_media(w, 1, "loc", nywt_text, NYWT, "unknown")
    assert any("approved rights rule" in x and "public-domain" in x for x in g1(w, m))
    changes, problems = rights.derive(m, holders(w, m))
    assert changes == {"license_class": "public-domain"} and problems == []
    # Blocked: a CQ Roll Call staff photographer is not a U.S. News staff photographer.
    cq = fx.add_holder_media(w, 2, "loc", record(CQ_ADVISORY, "contributor_names[0]: Graham, Douglas, photographer"),
                             CQ_ADVISORY, "public-domain")
    assert any("never usable" in x for x in g1(w, cq))
    cq["license_class"] = "unknown"
    assert g1(w, cq) == []
    # The full government wording: public-domain for a government-created, uncopied record.
    habs = fx.add_holder_media(w, 3, "loc", record(HABS, *HABS_RECORD), HABS, "unknown")
    assert any("public-domain" in x for x in g1(w, habs))
    assert rights.derive(habs, holders(w, habs)) == ({"license_class": "public-domain"}, [])
    # ... and never usable when the record is a copy or the creator is not the government.
    copied = fx.add_holder_media(w, 4, "loc", record(HABS, *HABS_RECORD, HABS_RECOPY), HABS, "public-domain")
    assert any("never usable" in x for x in g1(w, copied))
    private = fx.add_holder_media(w, 5, "loc", loc_text(HABS), HABS, "unknown")
    assert g1(w, private) == [] and rights.derive(private, holders(w, private)) == ({}, [])


def test_change_note_names_the_staff_credit():
    w = fx.world()
    text = record(USN, "contributor_names[0]: Leffler, Warren K., photographer")
    m = fx.add_holder_media(w, 1, "loc", text, USN, "unknown")
    r = rights.ruling(USN, holders(w, m))
    assert r.result == PD and "Leffler" in (r.basis or "")
    note = rights.change_note({"license_class": PD}, r.value, "2026-10-09", r.basis)
    assert "Leffler, Warren K., photographer" in note


# --- holder values read from the holder's snapshot -------------------------------------------------

def test_holder_values_read_the_rights_fields_only():
    assert rights.holder_values("loc", loc_text("No known restrictions on publication.")) == \
        ["No known restrictions on publication.", "No known restrictions on publication."]
    # NARA: the use restriction, never the access restriction.
    assert rights.holder_values("nara", nara_text("Undetermined")) == ["Undetermined"]
    assert rights.holder_values("example-commons", "LicenseShortName: Public domain\n") == []
    assert rights.holder_values("loc", None) == []


# --- G1 media applies the rule ----------------------------------------------------------------------

def g1(w, m):
    return gates.g1_media(m, fx.context(w), {})


def test_g1_passes_when_license_class_follows_the_rule():
    w = fx.world()
    m = fx.add_holder_media(w, 1, "loc", loc_text("No known restrictions on publication."),
                            "No known restrictions on publication.", "public-domain")
    assert g1(w, m) == []
    m = fx.add_holder_media(w, 2, "nara", nara_text("Unrestricted"), "Unrestricted", "public-domain")
    assert g1(w, m) == []


def test_g1_fails_when_the_rule_gives_public_domain_and_the_record_does_not():
    w = fx.world()
    m = fx.add_holder_media(w, 1, "loc", loc_text("No known restrictions on publication."),
                            "No known restrictions on publication.", "unknown")
    failures = g1(w, m)
    assert any("approved rights rule" in x and "public-domain" in x for x in failures)


def test_g1_fails_when_a_barred_holder_statement_is_marked_usable():
    w = fx.world()
    m = fx.add_holder_media(w, 1, "loc", loc_text("Rights status not evaluated."),
                            "Rights status not evaluated.", "public-domain")
    assert any("approved rights rule" in x for x in g1(w, m))
    m = fx.add_holder_media(w, 2, "nara", nara_text("Restricted - Possibly"), "Restricted - Possibly", "cc0")
    assert any("approved rights rule" in x for x in g1(w, m))


def test_g1_unrestricted_access_is_not_an_unrestricted_use():
    """A NARA snapshot whose access restriction is Unrestricted but whose use restriction is
    Undetermined: the statement "Unrestricted" is in the snapshot, but the record is not usable."""
    w = fx.world()
    m = fx.add_holder_media(w, 1, "nara", nara_text("Undetermined"), "Unrestricted", "public-domain")
    assert any("approved rights rule" in x for x in g1(w, m))
    m = fx.add_holder_media(w, 2, "nara", nara_text("Undetermined"), "Unrestricted", "unknown")
    assert g1(w, m) == []


def test_g1_loc_access_flag_is_not_a_rights_statement():
    w = fx.world()
    m = fx.add_holder_media(w, 1, "loc", loc_text("Rights status not evaluated."), "unrestricted", "unknown")
    assert g1(w, m) == []
    assert rights.ruling("unrestricted", [rights.Holder("TST-S-0101", "loc", "u", w["snapshots"]["TST-S-0101"])]
                         ).result == NOT_USABLE


@pytest.mark.parametrize("holder", ["commons", "news"])
def test_g1_never_infers_public_domain_from_other_hosts(holder):
    w = fx.world()
    text = "LicenseShortName: Public domain\nrights_advisory: No known restrictions on publication.\n"
    m = fx.add_holder_media(w, 1, holder, text, "No known restrictions on publication.", "unknown")
    assert g1(w, m) == []


def test_g1_statement_must_be_the_holder_wording_for_the_rule_to_apply():
    """The rule grants public-domain only for the holder's own wording, shown verbatim."""
    w = fx.world()
    text = loc_text("No known restrictions on publication.") + "note: Example photograph.\n"
    m = fx.add_holder_media(w, 1, "loc", text, "Example photograph.", "unknown")
    assert g1(w, m) == []


# --- missing rights statements (item 4) -------------------------------------------------------------

def test_g1_allows_no_statement_when_the_item_is_not_usable():
    w = fx.world()
    m = fx.add_holder_media(w, 1, "commons", "LicenseShortName: Public domain\n", None, "unknown")
    assert g1(w, m) == []
    m["rights_statement"] = ""
    assert g1(w, m) == []


def test_g1_still_requires_a_statement_for_a_usable_item():
    w = fx.world()
    m = fx.add_holder_media(w, 1, "commons", "LicenseShortName: Public domain\n", None, "public-domain")
    assert g1(w, m) == ["no rights_statement"]


def test_g1_no_statement_still_checks_sources():
    w = fx.world()
    m = fx.add_holder_media(w, 1, "commons", "LicenseShortName: Public domain\n", None, "unknown")
    m["source_ids"] = ["TST-S-0999"]
    assert any("TST-S-0999" in x for x in g1(w, m))


def test_g1_no_statement_while_the_holder_snapshot_has_one():
    w = fx.world()
    m = fx.add_holder_media(w, 1, "loc", loc_text("Rights status not evaluated."), None, "unknown")
    assert any("holder's snapshot" in x for x in g1(w, m))


# --- derive: what the tools write -------------------------------------------------------------------

def holders(w, m):
    ctx = fx.context(w)
    return rights.holders_of(m, ctx.sources, lambda sid: w["snapshots"].get(sid), ctx.registry)


def test_derive_sets_public_domain_from_the_holder_wording():
    w = fx.world()
    m = fx.add_holder_media(w, 1, "loc", loc_text("No known restrictions on publication."),
                            "No known restrictions on publication.", "unknown")
    changes, problems = rights.derive(m, holders(w, m))
    assert changes == {"license_class": "public-domain"}
    assert problems == []


def test_derive_copies_a_missing_statement_verbatim_from_the_holder_snapshot():
    w = fx.world()
    m = fx.add_holder_media(w, 1, "nara", nara_text("Unrestricted"), None, "unknown")
    changes, problems = rights.derive(m, holders(w, m))
    assert changes == {"rights_statement": "Unrestricted", "rights_url": "https://nara.example.org/item/1",
                       "license_class": "public-domain"}
    assert problems == []
    m = fx.add_holder_media(w, 2, "loc", loc_text("Rights status not evaluated. See  the guide."), None, "unknown")
    changes, _ = rights.derive(m, holders(w, m))
    assert changes == {"rights_statement": "Rights status not evaluated. See  the guide.",
                       "rights_url": "https://loc.example.org/item/2"}


def test_derive_leaves_other_items_alone():
    w = fx.world()
    m = fx.add_holder_media(w, 1, "commons", "LicenseShortName: Public domain\n", None, "unknown")
    assert rights.derive(m, holders(w, m)) == ({}, [])
    assert rights.derive(w["media"][0], holders(w, w["media"][0])) == ({}, [])
    m = fx.add_holder_media(w, 2, "loc", loc_text("Publication may be restricted."),
                            "Publication may be restricted.", "rights-restricted")
    assert rights.derive(m, holders(w, m)) == ({}, [])


def test_derive_reports_a_barred_item_marked_usable():
    w = fx.world()
    m = fx.add_holder_media(w, 1, "nara", nara_text("Restricted - Fully"), "Restricted - Fully", "public-domain")
    changes, problems = rights.derive(m, holders(w, m))
    assert changes == {}
    assert problems and "approved rights rule" in problems[0]


def test_derive_skips_reconstructions():
    w = fx.world()
    m = fx.add_holder_media(w, 1, "loc", loc_text("No known restrictions on publication."), None, "unknown")
    m["reconstruction"] = True
    assert rights.derive(m, holders(w, m)) == ({}, [])


def test_g1_reads_the_rule_only_from_snapshots_that_pass_g1():
    """A tampered holder snapshot fails G1 on its hash; the rule never reads its words."""
    import dataclasses
    w = fx.world()
    m = fx.add_holder_media(w, 1, "loc", loc_text("Rights status not evaluated.") +
                            "note: No known restrictions on publication.\n",
                            "No known restrictions on publication.", "unknown")
    assert gates.g1_media(m, fx.context(w), {}) == []
    ctx = fx.context(w)
    snap = ctx.snapshots["TST-S-0101"]
    forged = loc_text("No known restrictions on publication.")
    ctx.snapshots["TST-S-0101"] = dataclasses.replace(snap, text=forged, sha256=fx.sha(forged))
    failures = gates.g1_media(m, ctx, {})
    assert any("sha256" in x for x in failures)
    assert not any("approved rights rule" in x for x in failures)
