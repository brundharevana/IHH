#!/usr/bin/env python3
"""Gate for the rewritten guide narration (assets-src/audio/narration/<slug>.json), every inductee.

Owner rule (2026-10-17): the guide may sound like a person, but FACTS MUST NOT CHANGE. Each line's
'text' is compared with its approved 'source' sentence using the pipeline's own content tokens
(tools/ihh/normalize.py content_tokens: dates as ISO, numbers, codes, stemmed content words; function
words and pronouns are dropped). A fact line fails when
  - a date, number or code of the source is missing or a new one appears;
  - a content word of the source is missing, except the inductee's name words (a pronoun replaces
    them after the first mention in a chapter) and a title before the name ("Prof.", "Dr.");
  - a content word appears that the source lacks, unless it is a listed connective below or the
    inductee's own name ("Naismith" in the source may be said as "James Naismith");
  - it uses a pronoun of the other gender more often than its source does ("his wife" in a
    sentence about her father is the source's own word);
  - its fact ids are not all verified in data/inductees/<slug>/facts.jsonl;
  - (every inductee but Einstein, whose sources are the approved chapter sentences in
    content/einstein/chapters) its source is not, verbatim, the claim of its one fact id.
The first line of each chapter must name the inductee.

A 'room-note' line (kind "room-note") describes the room model, not the inductee. It carries no
fact id; its 'source' is a list of excerpts, each found verbatim in its 'basis' file (the room's
INVENTORY.md), and its text may use no content word, date, number or code the excerpts lack.
A room note carries no number of its own: every number, count, measurement (a number with a unit, a
number word, an ordinal) and date in its text must be in the claim of one of its `number_facts`
(verified fact ids). INVENTORY figures are modelling estimates, never facts about the place (Task 14c
fix round 1, test_room_notes.py). A chapter of room notes only is exempt from the naming rule.

A chapter opening (spec 2.5: place + date, one human detail, an invitation to look around, as a human sentence, not a
dateline: owner feedback round 8, app/src/tour/data/narration.test.js) sits under
a chapter keyed by its kind (app/src/tour/data/chapters.js CHAPTER_KINDS):
  chapters.<kind>.opening = { text, speak?, source: [claims], fact_ids: [ids] }
or, for a further chapter of a kind the tour already uses (two "big-work" chapters), under that chapter's
id with its kind named: chapters.<chapter id> = { kind, opening } (the tour data points its `opening` at
'<slug>:ch:<chapter id>:opening'). Every check below applies the same way.
It is a selection from its facts, not a rewrite of one sentence, so nothing has to be kept, but
nothing may be added (check_line): every date, number and code must be in a cited fact (a date may
be said less precisely, "July 1923" or "1923" for July 11, 1923, never differently), every content
word must be in a cited fact or in the short OPENING_WORDS allowlist below (the invitation and the
"here" of the room), and a pronoun of the other gender is never allowed. The cited facts are the
verified set the app ships (app/src/tour/data/facts.generated.json, built from the IHH-facts store),
and 'source' must list their claims verbatim, in fact-id order: that is the provenance record the
chatbot export reads (narration line -> fact ids).

A 'record' line (kind "record", owner decision 2026-10-27) narrates the record a stop shows: what it shows
and why it matters for the turning point (check_record_line, test_record_lines.py). It names its records
(`media_ids`, each shown by a stop of the tour: app/src/tour/data/tour-use.generated.json `records`, and,
for a media record, verified and cleared in the fact index) and may cite verified facts (`fact_ids`). Its
'source' lists excerpts, each verbatim in the shipped card of a named record (title, date, maker, holder,
credit, alt text, catalogue id, recreation note) or in the claim of a cited fact; its text may use no
content word, date, number or code the excerpts lack, except the inductee's name, the record's kind word
("photograph" for a photograph, "page" for a document; RECORD_KIND_WORDS), "show", and the linking words.

Linking words (owner decision 2026-10-27; tightened in fix round 1): "here", and a time phrase ("that year",
"later", "a decade later", "eleven years after he received his Nobel Prize", "twenty-six years after").
time_phrase_errors places the two sides of each phrase in time, each by a year it states (a cited one) or by
the cited ground it shares most words with, and the phrase must be true in its direction: "later" / "after"
put the event they date after the other, "earlier" / "before" before it, "that year" in the same year; a span
must equal the gap (its number is then the only number it may add); "years" / "decades" with no number need
two / twenty years. A side that cannot be placed fails, and so does a time word outside a phrase ("for
years", "the same"). A record line's phrase rests on its cited facts' dates only, never on a record's own
date. Fact lines may add no causal or time connective ("and so", "then", "later", "again", "a few weeks"):
their one cited claim cannot date both sides. A record line may present the record as showing the inductee
(the name or a pronoun with "shows", "here", "photograph" ...) only when a named card's title or alt text
names them. A record that is not a media record must be a series whose letters are all verified and
cleared, or a labelled recreation, whose holder and credit words (IHH's card text) ground nothing.

A record line may narrate a photograph series (a series card with unit "photograph", owner feedback round 8: the
photographs of one moment at one stop): its own title and date are IHH's grouping, so only its photographs' own
cards ground the line, every photograph must be verified and cleared, and its kind words are "photograph(s)".

Street addresses (owner feedback round 8, test_addresses.py): a fact line or an opening may add the one word
"address" directly before a street address its own source states verbatim ("he lived at the address 2 Library
Place"), so a bare address is heard as one; nowhere else is "address" free.

The guide's own wayfinding lines (app/src/shared/guide/lines.json: landing offers, room arrivals,
intros, nudges, done) are gated here too, every run (check_guide_lines): a wayfinding line may make
no claim. Each of its content words must be in the short WAYFINDING allowlist below (moving, looking,
choosing; no information) or grounded in what the tour's own data says about that room or stop
(app/src/tour/data/guide-ground.generated.json, written by app/scripts/export_chapters.mjs): the room's
title and place label, the names of its stops, the stop's record's title, date, holder, credit, recreation label and
verified lines, the stop's place note, and the verified claims / room-note excerpts of the stop's own clip. An arrival is
grounded in the room's titles and its stops' names. Every date and number must be grounded the same
way (a year may stand for a full date of that year). Plain spatial words (wall, floor, corner...)
need no ground: they name where a visible thing is, not what it is. A date or number is never grounded
on a room note's INVENTORY excerpts, only on the room's and stop's own data and verified claims; "one" and the landing's count of inductees are
the only free numbers.

A 'speak' override (an opening's or a line's) is what the voice says in place of 'text'
(build_guide_audio.py), so it is held to the same rules (speak_errors, test_speak.py): read back as
written ("twenty-seventh" -> 27, "one twelve" -> 112, "Doctor" only where the text has "Dr."), it must
carry exactly the text's dates, numbers, codes and content words and no pronoun the text lacks, and the
line's own check is run on it too.

Usage (repo root): python3 assets-src/audio/check_narration.py [slug ...]   (no slug: all files)
exit 1 on any failure.
"""
import functools
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
NARRATION = ROOT / "assets-src" / "audio" / "narration"
sys.path.insert(0, str(ROOT / "tools"))
from ihh.normalize import content_tokens  # noqa: E402  (tools/ is not a package on the path)

# Name words per inductee that may be replaced by a pronoun after the first mention. Only the
# public name: a legal name a record uses ("Hedy Kiesler Markey" on the patent) is content and
# stays, except where listed here.
NAME_WORDS = {
    "einstein": {"albert", "einstein", "prof"},
    "naismith": {"james", "naismith", "dr"},
    "muir": {"john", "muir"},
    "albright": {"madeleine", "albright", "korbel", "k"},
    "lamarr": {"hedy", "lamarr"},
}
HE = {"he", "him", "his", "himself"}
SHE = {"she", "her", "hers", "herself"}
# The pronouns that would misgender the inductee (content tokens drop pronouns, so a swapped
# "he"/"she" would otherwise pass).
# "they" too: each tour is about one person, so a plural pronoun the source lacks names someone else
# (or a group) the facts do not.
THEY = {"they", "them", "their", "theirs", "themselves"}
WRONG_PRONOUNS = {"einstein": SHE | THEY, "naismith": SHE | THEY, "muir": SHE | THEY, "albright": HE | THEY, "lamarr": HE | THEY}
# Words a fact line may add: framing only ("look closely", "take his letter of ..."). No causal or time
# connective: "and so" claims a cause, and "then", "later", "again", "a few weeks later" claim an order or a
# repetition; a time word a fact line adds goes through time_phrase_errors on its one cited claim (fix
# round 1 of round 7: the gate let "And so ... immigrated" and "a few weeks later" pass unchecked).
CONNECTIVES = {"look", "close", "closely", "take"}
FACT_TIME_WORDS = {"then", "again", "few", "week", "weeks"}


# Words an opening may add to its facts: the invitation to look around and the "here" of the room.
# Each is framing, not information about the inductee. Keep this list short.
OPENING_WORDS = {"take", "moment", "look", "around", "walk", "here", "time", "like", "if", "your"}
# A plainer verb for a fact's own verb, accepted only when the cited fact has that verb (stems).
OPENING_SYNONYMS = {"gave": {"deliver"}, "give": {"deliver"}}
# Linking words a record line or an opening may add (owner decision 2026-10-27). "here" is framing; the
# time words pass only through time_phrase_errors (both dates cited). Keep these lists short.
LINK_WORDS = {"here"}
TIME_WORDS = {"later", "earlier", "after", "before", "year", "years", "decade", "decades", "same"}
# The words a record line may use for the record itself, by the card's kind (artifacts.js kinds), and the
# verb that introduces what it shows. Nothing else about the record is free: the rest is its card.
RECORD_KIND_WORDS = {
    "photo": {"photograph", "photo", "picture"},
    "photoset": {"photograph", "photo", "picture"},
    "document": {"document", "page", "pages"},
    "sheet": {"page", "sheet"},
    "letter": {"letter", "page"},
    "series": {"letter", "letters"},
    # a series of photographs of one moment (a series card with unit "photograph")
    "photo-series": {"photograph", "photographs", "photo", "photos", "picture", "pictures"},
    "model": {"recreation", "model"},
}
RECORD_WORDS = {"show", "shows"}
# the shipped card fields a record line may quote (tour-use.generated.json records)
RECORD_GROUND = ("title", "date", "maker", "holder", "credit", "alt", "catalogueId", "recreation")
NUMBER_WORDS = {w: i for i, w in enumerate(
    "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen "
    "seventeen eighteen nineteen twenty".split())}
NUMBER_WORDS.update({"a": 1, "an": 1, "thirty": 30, "forty": 40, "fifty": 50, "sixty": 60, "seventy": 70, "eighty": 80, "ninety": 90})
_TENS = "twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety"
_ONES = "one|two|three|four|five|six|seven|eight|nine"
# a number of years in words or digits: "a", "eleven", "twenty-six", "38"
_NUM = rf"\d+|(?:{_TENS})[-\s](?:{_ONES})|" + "|".join(sorted(NUMBER_WORDS, key=len, reverse=True))


def _num_value(s):
    s = s.lower()
    if s.isdigit():
        return int(s)
    parts = re.split(r"[-\s]+", s)
    return sum(NUMBER_WORDS[p] for p in parts)
FACT_INDEX = ROOT / "app" / "src" / "tour" / "data" / "facts.generated.json"
KINDS_FILE = ROOT / "app" / "src" / "tour" / "data" / "chapters.js"


def chapter_kinds():
    m = re.search(r"CHAPTER_KINDS\s*=\s*\[([^\]]*)\]", KINDS_FILE.read_text())
    return re.findall(r"'([^']+)'", m.group(1)) if m else []


def _date_ok(t, cited):
    """A date in the text is grounded when a cited date agrees on every part the text states."""
    return any(
        t.year == c.year and (t.month is None or t.month == c.month) and (t.day is None or t.day == c.day)
        for c in cited
    )


def _first_ymd(d):
    o = next((o for o in d.options if getattr(o, "year", None)), None)
    return (o.year, o.month, o.day) if o else None


def _cited_times(src):
    """The dates of a line's cited ground (content tokens): its full dates, and its years said alone (a bare
    year is a number to the tokenizer), as (year, month, day) with None for the parts not stated."""
    out = [x for x in (_first_ymd(d) for d in src.dates) if x]
    out += [(int(n), None, None) for n in src.numbers if re.fullmatch(r"1[0-9]{3}|20[0-9]{2}", str(n))]
    return out


def _years_of(text):
    """The years a text states (full dates and years said alone)."""
    return {y for y, _, _ in _cited_times(content_tokens(text))}


# Abbreviations whose full stop is not a clause boundary (time_phrase_errors splits the line in clauses).
_ABBR = re.compile(r"\b(U\.S|N\.J|D\.C|Dr|Prof|Mrs|Mr|Rev|St|Calif|Conn|No|Lieut|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sept|Sep|Oct|Nov|Dec|[A-Z])\.")
# A time phrase, longest form first. kind: span (a number of years or decades), bare (years or decades, no
# number), same (that year, the same year), adverb (later, earlier), prep (after X, before X).
_PHRASES = [
    ("span", re.compile(r"\b(" + _NUM + r")\s+(decades?|years?)\s+(later|earlier|after|before)\b", re.I)),
    ("bare", re.compile(r"\b(years|decades)\s+(later|earlier|after|before)\b", re.I)),
    ("same", re.compile(r"\b(?:later\s+)?(that|the same)\s+year\b", re.I)),
    ("adverb", re.compile(r"\b(later|earlier)\b", re.I)),
    ("prep", re.compile(r"\b(after|before)\b", re.I)),
]


def _clauses(text):
    """[(start, end, text)] of the line's clauses, split at , ; : ( ) and full stops (not abbreviations)."""
    masked = _ABBR.sub(lambda m: m.group(0)[:-1] + "\x00", text)
    out, start = [], 0
    for m in re.finditer(r"[,;:()]|\.(?=\s|$)", masked):
        out.append((start, m.start(), text[start:m.start()]))
        start = m.end()
    out.append((start, len(text), text[start:]))
    return [c for c in out if c[2].strip()]


def _place(seg, grounds, usable, names):
    """The year of a piece of the line: a usable year it states, else the year of the cited ground that
    shares most of its content words (names aside) and states one year; None when it cannot be placed."""
    stated = _years_of(seg) & usable
    if len(stated) == 1:
        return next(iter(stated))
    if len(stated) > 1:
        return None
    words = {key(w) for w in content_tokens(seg).words} - names
    best, score = set(), 0
    for g in grounds:
        ys = _years_of(g) & usable
        if len(ys) != 1:
            continue
        n = len(words & {key(w) for w in content_tokens(g).words})
        if n > score:
            best, score = set(ys), n
        elif n == score and n:
            best |= ys
    return next(iter(best)) if score and len(best) == 1 else None


def time_phrase_errors(text, added_words, src, grounds=None, usable=None, names=frozenset()):
    """(errors, span numbers) for the time words a line adds (added_words: their stems, not in its sources).
    src: the content tokens of the line's cited ground; grounds: its texts (claims or excerpts), each a
    candidate to place a piece of the line in time; usable: the years a time phrase may rest on (a record
    line: its cited facts' years only, never a record's own date; default: every cited year).
    Each added time word must sit in a time phrase, and the phrase must be true of the cited dates, in its
    direction: "X years later" / "later" / "X years after A" put the event they introduce after the other
    one, "earlier" / "before" before it; "that year" / "later that year" the same year; a span is the gap
    between the two placed years (its number is then allowed); "years" / "decades" without a number need at
    least two years / two decades. A piece of the line is placed by a year it states, else by the cited
    ground it shares most words with; a phrase whose two sides cannot both be placed fails."""
    time = added_words & _stems(TIME_WORDS)
    if not time:
        return [], set()
    grounds = list(grounds or [])
    usable = set(usable) if usable is not None else {y for y, _, _ in _cited_times(src)}
    errs, spans, covered = [], set(), []
    clauses = _clauses(text)
    # clauses that hold a time phrase: each is the other side of its own phrase, never the event another
    # phrase dates ("Three years after the Olympics, and two years after he retired, he died")
    phrased = {i for i, c in enumerate(clauses) for _, rx in _PHRASES if any(c[0] <= x.start() < c[1] for x in rx.finditer(text))}
    for kind, rx in _PHRASES:
        for m in rx.finditer(text):
            if any(a <= m.start() < b for a, b in covered):
                continue
            # a phrase the cited ground already says ("after he had debarked") is the source's, not added
            if not ({key(w) for w in content_tokens(m.group(0)).words} & time):
                continue
            covered.append((m.start(), m.end()))
            phrase = m.group(0)
            word = phrase.lower().split()[-1]
            k = next((i for i, c in enumerate(clauses) if c[0] <= m.start() < c[1]), None)
            if k is None:
                errs.append(f"time phrase {phrase!r} cannot be placed")
                continue
            c0, c1, ctext = clauses[k]
            rest = text[m.end():c1]
            before = text[c0:m.start()]
            others = [i for i in range(len(clauses)) if i != k and i not in phrased]
            fwd = [i for i in others if i > k]
            back = [i for i in reversed(others) if i < k]

            def first(idx, stated_only=False):
                for i in idx:
                    if stated_only:
                        ys = _years_of(clauses[i][2]) & usable
                        y = next(iter(ys)) if len(ys) == 1 else None
                    else:
                        y = _place(clauses[i][2], grounds, usable, names)
                    if y is not None:
                        return y
                return None

            if kind == "prep" or (kind in ("span", "bare") and word in ("after", "before")):
                ref = _place(rest, grounds, usable, names) if rest.strip() else None
                # the event the phrase dates: the clause's own words before it, else the nearest placed
                # clause before it (a heading: "1933. Eleven years after ..."), else after it
                main = (_place(before, grounds, usable, names) if before.strip() else None)
                # (a heading before it counts only by the year it states, never by a word it shares with a ground)
                main = main if main is not None else first(back, stated_only=True)
                main = main if main is not None else first(fwd)
                later = word == "after"
            else:
                main = _place(before + " " + rest, grounds, usable, names) if (before + rest).strip() else None
                main = main if main is not None else first(fwd)
                ref = first(back)
                later = word != "earlier"
            if main is None or ref is None:
                errs.append(f"time phrase {phrase!r} needs both of its dates cited and placed (main {main}, other {ref})")
                continue
            gap = main - ref if later else ref - main
            if kind == "same":
                if main != ref:
                    errs.append(f"time phrase {phrase!r}: the two dates are not of one year ({ref}, {main})")
                continue
            if gap < 0 or (gap == 0 and kind != "prep" and kind != "adverb"):
                errs.append(f"time phrase {phrase!r} runs the wrong way: {ref} then {main}")
                continue
            if kind == "span":
                value = _num_value(m.group(1)) * (10 if m.group(2).lower().startswith("decade") else 1)
                if value == gap:
                    spans.add(str(value))
                else:
                    errs.append(f"time span {phrase!r} is not the gap between its dates ({ref}, {main}: {gap})")
            elif kind == "bare":
                need = 20 if m.group(1).lower() == "decades" else 2
                if gap < need:
                    errs.append(f"time phrase {phrase!r} needs dates at least {need} years apart ({ref}, {main})")
            elif gap == 0:
                errs.append(f"time phrase {phrase!r} runs the wrong way: {ref} then {main}")
    # a time word outside every recognised phrase ("for years", "the same", "years on") is a claim with no check
    loose = []
    for w in re.finditer(r"[A-Za-z]+", text):
        if key(next(iter(content_tokens(w.group(0)).words), "")) in time and not any(a <= w.start() < b for a, b in covered):
            loose.append(w.group(0))
    if loose:
        errs.append(f"time word(s) {sorted(set(loose))} outside a time phrase")
    return errs, spans


# A street address in the line's own source ("2 Library Place", "126 and 128 High Street"). Owner feedback
# round 8: a bare address must be heard as a street address, so a line may add the one word "address"
# directly before a street address its source states verbatim ("he lived at the address 2 Library Place"),
# and nowhere else (test_addresses.py). It names what the source already says and adds no fact.
_STREET = r"\d+(?:\s+and\s+\d+)?(?:\s+[A-Z][\w’']*){1,3}?\s+(?:Street|Place|Avenue|Road|Drive|Lane|Square)\b"
_ADDRESS = re.compile(r"\baddress\s+(" + _STREET + ")")


def address_allowed(text, sources):
    """True when every "address" in text directly precedes a street address that one of sources states verbatim."""
    # every form the stemmer folds to "address" ("addressed", "addresses") counts: only the bare word directly before
    # a sourced street address is freed (review I-1)
    said = re.findall(r"\baddress\w*", text, re.I)
    if not said:
        return False
    ok = [m.group(1) for m in _ADDRESS.finditer(text) if any(m.group(1) in s for s in sources)]
    return len(ok) == len(said)


def _names(slug):
    raw = NAME_WORDS.get(slug, set())
    return frozenset(raw | {key(w) for w in content_tokens(" ".join(sorted(raw))).words})


def check_line(text, fact_ids, facts, slug=None):
    """Errors for one opening line (empty list: it passes). facts: {fact id: verified claim}."""
    errs = []
    if not fact_ids:
        errs.append("an opening needs its fact ids")
    claims = []
    for fid in fact_ids:
        if fid not in facts:
            errs.append(f"fact {fid} is not verified")
        else:
            claims.append(facts[fid])
    src = content_tokens(" . ".join(claims))
    # "[sic]" marks a cited claim's own spelling (the 1923 report's "Gottenberg"): it must follow a word
    # of a cited claim, and it adds nothing
    joined = " ".join(claims).lower()
    for m in re.finditer(r"([\w'’-]+)\s*\[sic\]", text):
        if not re.search(rf"\b{re.escape(m.group(1).lower())}\b", joined):
            errs.append(f"[sic] follows a word no cited fact has: {m.group(1)!r}")
    text = re.sub(r"\s*\[sic\]", "", text)
    new = content_tokens(text)
    cited_dates = [o for d in src.dates for o in d.options]
    years = {str(o.year) for o in cited_dates if getattr(o, "year", None)}
    for d in new.dates:
        if not any(_date_ok(o, cited_dates) for o in d.options if hasattr(o, "year")):
            errs.append(f"date not in the cited facts: {d.text!r}")
    src_w = {key(w) for w in src.words}
    time_errs, spans = time_phrase_errors(text, {key(w) for w in new.words} - src_w, src, grounds=claims, names=_names(slug))
    errs += time_errs
    extra_n = [n for n in new.numbers if n not in src.numbers and n not in years and n not in spans]
    if extra_n:
        errs.append(f"numbers not in the cited facts: {sorted(extra_n)}")
    for kind in ("codes", "decades", "short_decades", "ages", "symbols"):
        extra = set(canon(getattr(new, kind))) - set(canon(getattr(src, kind)))
        if extra:
            errs.append(f"{kind} not in the cited facts: {sorted(extra)}")
    free = OPENING_WORDS | _stems(LINK_WORDS | TIME_WORDS)
    if address_allowed(text, claims):
        free = free | _stems({"address"})
    added = sorted(
        w for w in {key(w) for w in new.words} - src_w
        if w not in free and not (OPENING_SYNONYMS.get(w, set()) & src_w)
    )
    if added:
        errs.append(f"content words not in the cited facts {added}")
    t_w, s_w = words_of(text), words_of(" ".join(claims))
    bad_p = sorted(p for p in WRONG_PRONOUNS.get(slug, set()) if t_w.count(p) > s_w.count(p))
    if bad_p:
        errs.append(f"wrong pronoun(s) {bad_p}")
    return errs


# An opening is a human sentence, never a dateline (owner feedback round 8; review I-2): after at most a few
# fronted adverbials ("In 1898,", "On October 1, 1940,", "A year after his letter to the President,", "Later that
# year,"), the first clause's subject is the inductee, by name or by a subject pronoun. "Ulm, Germany, 14 March 1879:
# Albert Einstein was born here." fails, and so does any dateline closed by ":", ";", "—", "!", an appositive or an
# abbreviation's full stop: the place comes first, so the subject is not the inductee.
SUBJECT_NAMES = {
    "einstein": ["Albert Einstein", "Prof. Albert Einstein", "Einstein"],
    "naismith": ["Dr. James Naismith", "James Naismith", "Naismith"],
    "muir": ["John Muir", "Muir"],
    "albright": ["Madeleine Korbel Albright", "Madeleine K. Albright", "Madeleine Albright", "Albright"],
    "lamarr": ["Miss Hedy Lamarr", "Hedy Lamarr", "Lamarr", "Hedy Kiesler"],
}
SUBJECT_PRONOUNS = {"einstein": ["He"], "naismith": ["He"], "muir": ["He"], "albright": ["She"], "lamarr": ["She"]}
_STOP = r"[^,.:;—–!?]"
_LEADS = [
    # a date may carry its own comma ("On January 22, 1997,")
    re.compile(rf"(?:In|On|By|During|After|Before|From|Until|Since|At)\s(?:{_STOP}*?\b[A-Z][a-z]+\.?\s+\d{{1,2}},\s+\d{{4}}|{_STOP}*),\s+"),
    re.compile(rf"(?:A|An|\d+|[A-Za-z]+(?:-[a-z]+)?)\s+(?:years?|decades?)\s+(?:after|before|later){_STOP}*,\s+"),
    re.compile(rf"(?:Later\s+)?(?:That|The same)\s+year{_STOP}*,\s+"),
]


def opening_form_errors(text, slug):
    """Errors when an opening is not a human sentence whose first clause has the inductee as its subject."""
    rest = re.sub(r"\s*\[sic\]", "", text).strip()
    for _ in range(4):
        m = next((m for rx in _LEADS if (m := rx.match(rest))), None)
        if not m:
            break
        rest = rest[m.end():]
    subjects = sorted(SUBJECT_NAMES.get(slug, []) + SUBJECT_PRONOUNS.get(slug, []), key=len, reverse=True)
    for name in subjects:
        # a pronoun may lead a compound subject ("she and Antheil"); a possessive is not the subject
        if re.match(rf"{re.escape(name)}(?![\w'’])", rest, re.I if name in ("He", "She") else 0):
            return []
    return [f"an opening's first clause must have the inductee as its subject, by name or pronoun (a human sentence, not a dateline): {rest[:60]!r}"]


def check_opening(slug, opening, facts):
    ids = opening.get("fact_ids") or []
    errs = check_line(opening["text"], ids, facts, slug)
    errs += opening_form_errors(opening["text"], slug)
    want = [facts[f] for f in ids if f in facts]
    if opening.get("source") != want:
        errs.append("source must list the cited claims verbatim, in fact-id order")
    return errs


def load_fact_index():
    d = json.loads(FACT_INDEX.read_text())
    return {k: v["claim"] for k, v in d["facts"].items()}


@functools.lru_cache(maxsize=None)
def fact_media():
    """The fact index's media records ({id: {embeddable, ...}}): verified and cleared, or owner-ruled."""
    return json.loads(FACT_INDEX.read_text())["media"]


TOUR_USE = ROOT / "app" / "src" / "tour" / "data" / "tour-use.generated.json"


@functools.lru_cache(maxsize=None)
def shown_records():
    """The record cards the tour's stops open (tour-use.generated.json `records`, written by
    app/scripts/export_chapters.mjs; src/tour/data/narration.test.js keeps it equal to the tour data)."""
    return json.loads(TOUR_USE.read_text())["records"] if TOUR_USE.exists() else {}


def canon(items):
    """Order-free, position-free form of dates / numbers / codes (a date by its parsed options)."""
    return sorted(str(getattr(x, "options", x)) for x in items)


def key(w):
    """Closed-class connectives come back as '=word'; plain content words as their stem."""
    return w.lstrip("=")


def flat(text):
    """Whitespace and markdown emphasis folded, for finding an excerpt in a basis file."""
    return re.sub(r"\s+", " ", text.replace("**", "").replace("`", "")).strip()


def words_of(text):
    return re.findall(r"[a-z]+", text.lower())


def check_fact_line(slug, line, first, facts):
    errs = []
    src, new = content_tokens(line["source"]), content_tokens(line["text"])
    for kind in ("dates", "numbers", "codes"):
        a, b = canon(getattr(src, kind)), canon(getattr(new, kind))
        if a != b:
            errs.append(f"{kind} differ: source {a} vs text {b}")
    raw = NAME_WORDS.get(slug, set())
    names = raw | {key(w) for w in content_tokens(" ".join(sorted(raw))).words}  # as stems: james -> jame
    src_w, new_w = {key(w) for w in src.words}, {key(w) for w in new.words}
    missing = {w for w in src_w - new_w if w not in names}
    timed = (new_w - src_w) & (_stems(TIME_WORDS) | _stems(FACT_TIME_WORDS))
    if timed:
        # one cited claim: a time phrase needs its two dates in it, in its direction
        time_errs, _ = time_phrase_errors(line["text"], timed & _stems(TIME_WORDS), src, grounds=[line["source"]], names=frozenset(names))
        errs += time_errs
        for w in sorted(timed & _stems(FACT_TIME_WORDS)):
            errs.append(f"connective {w!r} claims an order or repetition no cited date checks")
    added = {w for w in new_w - src_w if w not in CONNECTIVES and w not in names and w not in timed}
    if address_allowed(line["text"], [line["source"]]):
        added -= _stems({"address"})
    if missing:
        errs.append(f"missing content words {sorted(missing)}")
    if added:
        errs.append(f"added content words {sorted(added)}")
    t_w, s_w = words_of(line["text"]), words_of(line["source"])
    bad_p = sorted(p for p in WRONG_PRONOUNS.get(slug, set()) if t_w.count(p) > s_w.count(p))
    if bad_p:
        errs.append(f"wrong pronoun(s) {bad_p}")
    if first and not (names & new_w):
        errs.append("first line of the chapter must name the inductee")
    ids = line.get("fact_ids") or []
    if not ids:
        errs.append("a fact line needs its fact id")
    for fid in ids:
        if facts.get(fid, {}).get("status") != "verified":
            errs.append(f"fact {fid} is not verified")
    if slug != "einstein" and len(ids) == 1 and facts.get(ids[0], {}).get("claim") != line["source"]:
        errs.append(f"source is not the verbatim claim of {ids[0]}")
    # a line that joins several facts (any inductee): its source is their verbatim claims, in fact-id order, so
    # every content word of each is said and none is added
    if len(ids) > 1 and " ".join(facts.get(f, {}).get("claim", "") for f in ids) != line["source"]:
        errs.append(f"source is not the verbatim claims of {', '.join(ids)}, joined in order")
    return errs


def check_room_note(line, facts=None):
    """facts: {fact id: fact record} (data/inductees/<slug>/facts.jsonl). A room note's numbers and
    dates are claims about the real place: each must be in a verified claim of its `number_facts`."""
    basis = ROOT / line.get("basis", "")
    if not line.get("basis") or not basis.is_file():
        return [f"basis file missing: {line.get('basis')}"]
    errs = []
    doc = flat(basis.read_text())
    excerpts = line["source"] if isinstance(line["source"], list) else [line["source"]]
    for ex in excerpts:
        if flat(ex) not in doc:
            errs.append(f"excerpt not in {line['basis']}: {ex!r}")
    src = content_tokens(" . ".join(excerpts))
    new = content_tokens(line["text"])
    for kind in ("dates", "numbers", "codes"):
        extra = set(canon(getattr(new, kind))) - set(canon(getattr(src, kind)))
        if extra:
            errs.append(f"{kind} not in the excerpts: {sorted(extra)}")
    added = {key(w) for w in new.words} - {key(w) for w in src.words} - CONNECTIVES
    if added:
        errs.append(f"content words not in the excerpts {sorted(added)}")
    if line.get("fact_ids"):
        errs.append("a room note carries no fact id (it is not a fact about the inductee)")
    errs += room_note_number_errors(line, new, facts or {})
    return errs


def check_record_line(line, slug, facts, media, records):
    """Errors for one record line (empty: it passes). facts: {fact id: verified claim} (the fact index);
    media: the fact index's media ({id: {embeddable, ...}}); records: the shipped record cards a stop
    opens ({id: card}, tour-use.generated.json). See the module docstring and test_record_lines.py."""
    errs, ground, kinds, cards, fact_claims = [], [], set(), [], []
    ids = line.get("media_ids") or []
    if not ids:
        errs.append("a record line names no record (media_ids)")
    for mid in ids:
        card = records.get(mid)
        if not card:
            errs.append(f"record {mid} is shown by no stop of the tour")
            continue
        if re.fullmatch(r"[A-Z]{3}-M-\d{4}", mid):
            if not (media.get(mid) or {}).get("embeddable"):
                errs.append(f"record {mid} is not verified and cleared")
            fields = RECORD_GROUND
        elif card.get("kind") == "series":
            # a series grounds narration only when every letter in it is verified and cleared
            letters = card.get("letters") or []
            if not letters or not all((media.get(x) or {}).get("embeddable") for x in letters):
                errs.append(f"series {mid}: not every letter is verified and cleared")
            fields = RECORD_GROUND
            if card.get("unit") == "photograph":
                # a photograph series (round 8: the photographs of one moment at one stop) is IHH's grouping:
                # its own title and date are IHH's words, so only its photographs' own cards ground the line
                fields = ()
                for x in letters:
                    member = records.get(x) or {}
                    ground += [str(member[k]) for k in RECORD_GROUND if member.get(k)]
        elif card.get("kind") == "model" and card.get("recreation"):
            # a labelled recreation (IHH's model, not a holder's record): only its title, its description and
            # its recreation note ground narration, never the card's holder or credit words
            fields = ("title", "alt", "recreation")
        else:
            errs.append(f"record {mid} is neither a verified, cleared media record, a cleared series nor a labelled recreation")
            fields = ()
        ground += [str(card[k]) for k in fields if card.get(k)]
        cards.append(card)
        cards += [records[x] for x in card.get("letters") or [] if x in records]
        kinds.add("photo-series" if card.get("kind") == "series" and card.get("unit") == "photograph" else card.get("kind"))
    for fid in line.get("fact_ids") or []:
        if fid not in facts:
            errs.append(f"fact {fid} is not verified")
        else:
            ground.append(facts[fid])
            fact_claims.append(facts[fid])
    excerpts = line.get("source") if isinstance(line.get("source"), list) else [line.get("source") or ""]
    if not any(excerpts):
        errs.append("a record line lists its excerpts in 'source'")
    pool = [flat(g) for g in ground]
    # whole words only: an excerpt never cuts a word of the card ("Germ" out of "Germany")
    for ex in excerpts:
        whole = re.compile(r"(?<!\w)" + re.escape(flat(ex)) + r"(?!\w)") if ex else None
        if ex and not any(whole.search(g) for g in pool):
            errs.append(f"excerpt not in a named record's card or a cited fact: {ex!r}")
    src = content_tokens(" . ".join(excerpts))
    text = re.sub(r"\s*\[sic\]", "", line["text"])
    new = content_tokens(text)
    src_w, new_w = {key(w) for w in src.words}, {key(w) for w in new.words}
    raw = NAME_WORDS.get(slug, set())
    names = raw | _stems(raw)
    # a time phrase rests on cited facts' dates only, never on a record's own date
    fact_years = {y for c in fact_claims for y in _years_of(c)}
    time_errs, spans = time_phrase_errors(text, new_w - src_w, src, grounds=fact_claims, usable=fact_years, names=frozenset(names))
    errs += time_errs
    errs += depiction_errors(text, slug, cards)
    cited_dates = [o for d in src.dates for o in d.options]
    years = {str(o.year) for o in cited_dates if getattr(o, "year", None)}
    for d in new.dates:
        if not any(_date_ok(o, cited_dates) for o in d.options if hasattr(o, "year")):
            errs.append(f"date not in the excerpts: {d.text!r}")
    extra_n = sorted(str(n) for n in new.numbers if n not in src.numbers and str(n) not in years and str(n) not in spans)
    if extra_n:
        errs.append(f"numbers not in the excerpts: {extra_n}")
    for kind in ("codes", "decades", "short_decades", "ages", "symbols"):
        extra = set(canon(getattr(new, kind))) - set(canon(getattr(src, kind)))
        if extra:
            errs.append(f"{kind} not in the excerpts: {sorted(extra)}")
    kind_words = set().union(*(RECORD_KIND_WORDS.get(k, set()) for k in kinds)) if kinds else set()
    # not the fact lines' CONNECTIVES: "a few weeks later" would pass the time check on any two dates
    free = names | _stems(LINK_WORDS | TIME_WORDS | RECORD_WORDS | kind_words | {"look", "closely"})
    added = sorted(new_w - src_w - free)
    if added:
        errs.append(f"content words not in the excerpts {added}")
    t_w, s_w = words_of(text), words_of(" ".join(excerpts))
    bad_p = sorted(p for p in WRONG_PRONOUNS.get(slug, set()) if t_w.count(p) > s_w.count(p))
    if bad_p:
        errs.append(f"wrong pronoun(s) {bad_p}")
    return errs


# the words of a clause that present a record as showing someone
_DEPICT = re.compile(r"\b(show|shows|showing|here|photograph|photographed|picture|portrait)\b", re.I)


def depiction_errors(text, slug, cards):
    """A record line may say a record shows the inductee (the name or a pronoun of theirs in a clause that
    presents the record: "shows", "here", "photograph" ...) only when a named card's title or alt text
    names them: "This picture shows Albert Einstein in Ulm" on the Ulm photochrom fails."""
    raw = {w for w in NAME_WORDS.get(slug, set()) if len(w) > 2 and w not in ("prof",)}
    pron = {"einstein": HE, "naismith": HE, "muir": HE, "albright": SHE, "lamarr": SHE}.get(slug, HE | SHE)
    person = raw | pron
    shown = " ".join(str(c.get(k) or "") for c in cards for k in ("title", "alt")).lower()
    if any(re.search(rf"\b{re.escape(w)}\b", shown) for w in raw):
        return []
    for _, _, clause in _clauses(text):
        ws = set(words_of(clause))
        if _DEPICT.search(clause) and ws & person:
            return [f"the line says the record shows the inductee ({clause.strip()!r}), but no named card's title or alt names them"]
    return []


def room_note_number_errors(line, new, facts):
    """Every number, date, code, decade, age or symbol in a room note must be in the claim of one of its
    `number_facts`, each a verified fact. An INVENTORY measurement is a modelling estimate, never a
    fact about the place, so a note without `number_facts` carries no number (Task 14c fix round 1)."""
    claims, errs = [], []
    for fid in line.get("number_facts") or []:
        f = facts.get(fid) or {}
        if f.get("status") != "verified":
            errs.append(f"number fact {fid} is not verified")
        else:
            claims.append(f["claim"])
    cited = content_tokens(" . ".join(claims))
    cited_dates = [o for d in cited.dates for o in d.options]
    years = {str(o.year) for o in cited_dates if getattr(o, "year", None)}
    for d in new.dates:
        if not any(_date_ok(o, cited_dates) for o in d.options if hasattr(o, "year")):
            errs.append(f"date in a room note not in a verified number fact: {d.text!r}")
    bad_n = sorted(str(n) for n in new.numbers if n not in cited.numbers and str(n) not in years)
    if bad_n:
        errs.append(f"numbers in a room note not in a verified number fact: {bad_n}")
    for kind in ("codes", "decades", "short_decades", "ages", "symbols"):
        extra = set(canon(getattr(new, kind))) - set(canon(getattr(cited, kind)))
        if extra:
            errs.append(f"{kind} in a room note not in a verified number fact: {sorted(extra)}")
    return errs


def opening_key_errors(n, ch, kinds, chapters=None):
    """An opening sits under its chapter kind; a second chapter of a kind the tour already uses keys its
    opening by the chapter id and names its kind ("kind"). The voiced key is '<slug>:ch:<n>:opening'.
    chapters: the tour's chapters in order ([{id, kind}], app/src/tour/data/chapters.generated.json), or
    None for a tour not in the chapter shape: an id key is accepted only for a chapter of that id and
    kind that follows an earlier chapter of the same kind."""
    if n in kinds:
        return [] if ch.get("kind", n) == n else [f"{n!r} is a chapter kind; it cannot name another kind {ch['kind']!r}"]
    kind = ch.get("kind")
    if kind not in kinds:
        return [f"an opening sits under a chapter kind ({', '.join(kinds)}), or under a chapter id with its 'kind', not {n!r}"]
    ids = [c["id"] for c in chapters or []]
    if n not in ids or chapters[ids.index(n)]["kind"] != kind:
        return [f"{n!r} is not a chapter of kind {kind!r} in the tour"]
    if not any(c["kind"] == kind for c in chapters[: ids.index(n)]):
        return [f"{n!r} is the first {kind!r} chapter: its opening sits under {kind!r}"]
    return []


# --- 'speak' overrides --------------------------------------------------------------------------
# build_guide_audio.py voices a line's 'speak' in place of its 'text' when it has one, so the voice could
# say what the caption does not. A speak is held to its text: read back as written (written_form), it
# must carry exactly the text's dates, numbers, codes and content words, and no pronoun the text lacks.
# The line's own check (facts, excerpts, number facts) is also run on it, as on the text.

# (written form in the text, the form the voice says). An expansion is read back only where the text
# has the written form, so "Doctor" never passes for a title the text does not give.
SPOKEN_FORMS = [
    ("World War II", "World War Two"), ("N.J.", "New Jersey"), ("Calif.", "California"),
    ("Conn.", "Connecticut"), ("Prof.", "Professor"), ("Dr.", "Doctor"), ("Dr", "Doctor"),
    ("Mrs.", "Missus"), ("Mr.", "Mister"), ("Rev.", "Reverend"),
    ("Kansas U.", "Kansas University"), ("U.S.", "U S"),
]
_ONES = "zero one two three four five six seven eight nine".split()
_TEENS = "ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split()
_TENS_W = "twenty thirty forty fifty sixty seventy eighty ninety".split()
_ORD_ONES = "first second third fourth fifth sixth seventh eighth ninth".split()
_ORD_TEENS = "tenth eleventh twelfth thirteenth fourteenth fifteenth sixteenth seventeenth eighteenth nineteenth".split()
_ORD_TENS_W = "twentieth thirtieth".split()
_MON = "(?:" + "|".join(
    "January February March April May June July August September October November December".split()) + ")"


def _alt(words):
    return "(?:" + "|".join(words) + ")"


# a day said as an ordinal word, 1st-31st
_ORD_DAY = rf"(?:(?:twenty|thirty)[\s-]{_alt(_ORD_ONES)}|{_alt(_ORD_TEENS + _ORD_ONES + _ORD_TENS_W)})"
# one group of a number read in pairs ("one twelve" 112, "forty oh nine" 4009): 0-99, or "oh" + a digit
_GROUP = rf"(?:oh[\s-]{_alt(_ONES[1:])}|{_alt(_TENS_W)}(?:[\s-]{_alt(_ONES[1:])})?|{_alt(_TEENS + _ONES)})"
_PAIRS = re.compile(
    rf"(?<![\w-]){_GROUP}(?:\s+{_GROUP})+(?![\w-])(?!\s*,?\s*(?:hundred|thousand|million))", re.I)
# "two million, two hundred ..." is one number: the commas are the voice's pauses
_SCALE_COMMA = re.compile(r"\b(million|thousand),\s+(?=" + _alt(_ONES[1:] + _TEENS + _TENS_W) + r"\b)", re.I)


def _ordinal_value(phrase):
    w = phrase.lower().replace("-", " ").split()
    tens = {"twenty": 20, "thirty": 30}.get(w[0], 0) if len(w) == 2 else 0
    if w[-1] in _ORD_ONES:
        return tens + _ORD_ONES.index(w[-1]) + 1
    if w[-1] in _ORD_TEENS:
        return 10 + _ORD_TEENS.index(w[-1])
    return (_ORD_TENS_W.index(w[-1]) + 2) * 10


def _group_value(group):
    w = group.lower().replace("-", " ").split()
    if w[0] == "oh":
        return "0" + str(_ONES.index(w[1]))
    if w[0] in _TENS_W:
        return str((_TENS_W.index(w[0]) + 2) * 10 + (_ONES.index(w[1]) if len(w) > 1 else 0))
    return str(_TEENS.index(w[0]) + 10 if w[0] in _TEENS else _ONES.index(w[0]))


def _pairs_value(m):
    groups = re.findall(_GROUP, m.group(0), re.I)
    return _group_value(groups[0]) + "".join(_group_value(g).zfill(2) for g in groups[1:])


def written_form(speak, text):
    """The speak with its spoken forms read back as written, for comparing with the text."""
    s = speak
    for written, spoken in SPOKEN_FORMS:
        if re.search(rf"(?<!\w){re.escape(written)}(?!\w)", text):
            s = re.sub(rf"(?<!\w){re.escape(spoken)}(?!\w)", written, s)
    # a phrase the text writes in capitals, said in plain case ("THE ARMY HOUR" -> "The Army Hour")
    for caps in set(re.findall(r"\b[A-Z]{2,}(?:\s+[A-Z]{2,})*\b", text)):
        s = re.sub(rf"\b{re.escape(caps)}\b", caps, s, flags=re.I)
    s = re.sub(rf"\bthe\s+({_ORD_DAY})\s+of\s+({_MON}),?(?=\s+\d{{4}})",
               lambda m: f"{_ordinal_value(m.group(1))} {m.group(2)}", s, flags=re.I)
    s = re.sub(rf"\b({_MON})\s+({_ORD_DAY})\b", lambda m: f"{m.group(1)} {_ordinal_value(m.group(2))}", s, flags=re.I)
    s = _SCALE_COMMA.sub(r"\1 ", s)
    return _PAIRS.sub(_pairs_value, s)


def speak_errors(text, speak, slug=None):
    """Errors for a speak override against its line's text (empty list: it passes)."""
    text = re.sub(r"\s*\[sic\]", "", text)
    a, b = content_tokens(text), content_tokens(written_form(speak, text))
    errs = []
    for kind in ("dates", "numbers", "codes", "decades", "short_decades", "ages", "symbols"):
        x, y = canon(getattr(a, kind)), canon(getattr(b, kind))
        if x != y:
            errs.append(f"speak: {kind} differ from the text: text {x} vs speak {y}")
    wa, wb = {key(w) for w in a.words}, {key(w) for w in b.words}
    if wa - wb:
        errs.append(f"speak: missing content words of the text {sorted(wa - wb)}")
    if wb - wa:
        errs.append(f"speak: content words the text lacks {sorted(wb - wa)}")
    t_w, s_w = words_of(text), words_of(speak)
    bad_p = sorted(p for p in WRONG_PRONOUNS.get(slug, HE | SHE | THEY) if s_w.count(p) > t_w.count(p))
    if bad_p:
        errs.append(f"speak: pronoun(s) the text lacks {bad_p}")
    return errs


def spoken_errors(item, slug, run):
    """For an opening or line with a speak: speak_errors plus the item's own check run on the speak
    read back as written (run: item -> errors). Empty when there is no speak."""
    speak = item.get("speak")
    if speak is None:
        return []
    errs = speak_errors(item["text"], speak, slug)
    as_text = {**item, "text": written_form(speak, re.sub(r"\s*\[sic\]", "", item["text"]))}
    return errs + [f"speak: {e}" for e in run(as_text)]


TOUR_CHAPTERS = ROOT / "app" / "src" / "tour" / "data" / "chapters.generated.json"


def tour_chapters(slug):
    """The slug's chapters in order (chapters.generated.json, written by export_chapters.mjs), or None."""
    return json.loads(TOUR_CHAPTERS.read_text()).get(slug) if TOUR_CHAPTERS.exists() else None


def check(slug):
    script = json.loads((NARRATION / f"{slug}.json").read_text())
    facts = {}
    for row in (ROOT / "data" / "inductees" / slug / "facts.jsonl").read_text().splitlines():
        if row.strip():
            f = json.loads(row)
            facts[f["id"]] = f
    bad, seen = 0, set()
    kinds, index = None, None
    for n, ch in script["chapters"].items():
        if any(l.get("kind") == "record" for l in ch.get("lines", [])):
            index = index or load_fact_index()
        if "opening" in ch:
            kinds = kinds or chapter_kinds()
            index = index or load_fact_index()
            errs = check_opening(slug, ch["opening"], index) + opening_key_errors(n, ch, kinds, tour_chapters(slug))
            errs += spoken_errors(ch["opening"], slug, lambda o: check_opening(slug, o, index))
            tag = f"{slug} {n} opening"
            if errs:
                bad += 1
                print(f"FAIL {tag}: " + "; ".join(errs))
            else:
                if VERBOSE:
                    print(f"ok   {tag}: {ch['opening']['text']}  [{', '.join(ch['opening']['fact_ids'])}]")
        lines = ch.get("lines", [])
        notes_only = all(l.get("kind") in ("room-note", "record") for l in lines)
        for i, line in enumerate(lines):
            if line.get("kind") == "room-note":
                def run(item):
                    return check_room_note(item, facts)
            elif line.get("kind") == "record":
                def run(item):
                    return check_record_line(item, slug, index, fact_media(), shown_records())
            else:
                def run(item, first=i == 0 and not notes_only):
                    return check_fact_line(slug, item, first, facts)
            errs = run(line) + spoken_errors(line, slug, run)
            if (n, line["cue"]) in seen:
                errs.append("duplicate cue")
            seen.add((n, line["cue"]))
            tag = f"{slug} ch{n} {line['cue']}"
            if errs:
                bad += 1
                print(f"FAIL {tag}: " + "; ".join(errs))
            else:
                if VERBOSE:
                    print(f"ok   {tag}: {line['text']}")
    return bad


GUIDE_LINES = ROOT / "app" / "src" / "shared" / "guide" / "lines.json"
GUIDE_GROUND = ROOT / "app" / "src" / "tour" / "data" / "guide-ground.generated.json"
INDUCTEES_JSON = ROOT / "app" / "src" / "landing" / "data" / "inductees.json"
# Words a wayfinding line may use without grounding: moving, looking, choosing and courtesy, plus the
# museum's own framing of a recreated room (it is built from photographs). None says anything about an
# inductee, a place or an object. Keep this list short; ground a word in the tour data instead.
WAYFINDING = """
look see come go leave walk turn tilt stand step spend take pick choose start open keep scroll follow
lead meet ask tell know hear catch care like would can shall let wait
now here there before next again still yet ready when how about through over across around along
up down above beside toward back head eye minute moment time pace way right
haven't don't i'll you'd you've you're it's that's there's let's here's
welcome hello good fine course rush no all any anything something everything every whatever wherever
whole little closer closely too just own together far top
miss worth if s seen
wall floor roof corner centre end side row under outside
object room tour story point portrait hall inductee people
photograph show built recreation
""".split()


def _stems(words):
    return {key(w) for w in content_tokens(" ".join(words)).words}


def _year_ok(text_token, ground_dates):
    years = {o.year for d in ground_dates for o in d.options if getattr(o, "year", None)}
    return str(text_token) in {str(y) for y in years}


def check_wayfinding(text, ground, free_numbers=("1",), number_ground=None):
    """Errors for one wayfinding line (empty: it passes). ground: texts it may draw on; number_ground:
    the texts its dates and numbers may draw on (default: ground). A room note's INVENTORY excerpts
    ground words, never numbers: they are modelling estimates, not facts about the place."""
    errs = []
    g = content_tokens(" . ".join(t for t in ground if t))
    gn = g if number_ground is None else content_tokens(" . ".join(t for t in number_ground if t))
    new = content_tokens(text.replace("{n}", " ").replace("{pos}", "his"))
    ok = {key(w) for w in g.words} | _stems(WAYFINDING)
    added = sorted({key(w) for w in new.words} - ok)
    if added:
        errs.append(f"words not grounded in the room or stop {added}")
    cited = [o for d in gn.dates for o in d.options]
    for d in new.dates:
        if not any(_date_ok(o, cited) for o in d.options if hasattr(o, "year")):
            errs.append(f"date not grounded: {d.text!r}")
    extra = [n for n in new.numbers if n not in gn.numbers and str(n) not in free_numbers and not _year_ok(n, gn.dates)]
    if extra:
        errs.append(f"numbers not grounded: {sorted(map(str, extra))}")
    for kind in ("codes", "decades", "ages", "symbols"):
        more = set(canon(getattr(new, kind))) - set(canon(getattr(gn, kind)))
        if more:
            errs.append(f"{kind} not grounded: {sorted(more)}")
    return errs


def narration_sources():
    """'<slug>:<chapter>:<cue>' and '<slug>:ch:<kind>:opening' -> the texts that line rests on. A room
    note's key is also in ROOM_NOTE_KEYS (its excerpts ground words, never numbers)."""
    out = {}
    ROOM_NOTE_KEYS.clear()
    for f in NARRATION.glob("*.json"):
        d = json.loads(f.read_text())
        for n, ch in d["chapters"].items():
            if "opening" in ch:
                out[f"{d['inductee']}:ch:{n}:opening"] = list(ch["opening"]["source"])
            for line in ch.get("lines", []):
                src = line["source"]
                k = f"{d['inductee']}:{n}:{line['cue']}"
                out[k] = src if isinstance(src, list) else [src]
                if line.get("kind") == "room-note":
                    ROOM_NOTE_KEYS.add(k)
    return out


ROOM_NOTE_KEYS = set()


def stop_ground(stop, sources, numbers=False):
    """The texts a stop's wayfinding lines may draw on; numbers=True: those its numbers may draw on
    (a room note's INVENTORY excerpts are left out)."""
    t = [stop["name"], stop.get("placeNote", "")]
    r = stop.get("record")
    if r:
        t += [r["title"], r.get("date", ""), r["recreation"], r.get("holder", ""), r.get("credit", "")] + r["lines"]
    for k in stop["clipKeys"]:
        if numbers and k in ROOM_NOTE_KEYS:
            continue
        t += sources.get(k, [])
    return t


def check_guide_lines(lines=None, ground=None, sources=None, inductees=None):
    """Every line of shared/guide/lines.json against the tour data; returns the failure count."""
    lines = lines or json.loads(GUIDE_LINES.read_text())
    rooms = (ground or json.loads(GUIDE_GROUND.read_text()))["rooms"]
    sources = sources if sources is not None else narration_sources()
    count = inductees if inductees is not None else len(json.loads(INDUCTEES_JSON.read_text()))
    bad = 0

    def run(tag, texts, gr, free=("1",), num=None):
        nonlocal bad
        for text in texts:
            errs = check_wayfinding(text, gr, free, num)
            if errs:
                bad += 1
                print(f"FAIL guide {tag}: {text!r}: " + "; ".join(errs))

    for group, texts in lines["landing"].items():
        run(f"landing.{group}", texts, [], ("1", str(count)))
    tour = lines["tour"]
    run("tour.done", tour["done"], [])

    def room(tag, rid, own):
        nonlocal bad
        r = rooms.get(rid)
        if not r:
            bad += 1
            print(f"FAIL guide {tag}: room {rid} is in no tour")
            return
        base = list(r["titles"]) + [s["name"] for s in r["stops"].values()]
        run(f"{tag}.arrivals", own["arrivals"], base)
        for kind in ("intros", "nudges"):
            # a room with stops must have both sections (a missing one would skip every check); a room with no
            # stop (round 9) may leave them out or empty
            if kind not in own:
                if r["stops"]:
                    bad += 1
                    print(f"FAIL guide {tag}: no {kind} section for a room with stops")
                continue
            # every stop of the room has its own non-empty list, and no list is for a stop the room does not have
            # (Codex review 2: the app otherwise spoke another stop's intro, or nothing)
            for sid in r["stops"]:
                if not own[kind].get(sid):
                    bad += 1
                    print(f"FAIL guide {tag}.{kind}: no line for the stop {sid}")
            for sid in own[kind]:
                if sid not in r["stops"]:
                    bad += 1
                    print(f"FAIL guide {tag}.{kind}: lines for {sid}, which is not a stop of the room")
            for sid, texts in own[kind].items():
                st = r["stops"].get(sid)
                run(f"{tag}.{kind}.{sid}", texts, base + (stop_ground(st, sources) if st else []),
                    num=base + (stop_ground(st, sources, numbers=True) if st else []))

    # the tour-level lists are the study's (rooms without their own lines)
    room("tour", "study", tour)
    for rid, own in tour["rooms"].items():
        room(f"tour.rooms.{rid}", rid, own)
    return bad


VERBOSE = True  # --quiet (the build's prebuild gate) prints only failures and the totals


def main(slugs):
    global VERBOSE
    if "--quiet" in slugs:
        VERBOSE, slugs = False, [s for s in slugs if s != "--quiet"]
    slugs = slugs or sorted(p.stem for p in NARRATION.glob("*.json"))
    bad = sum(check(s) for s in slugs)
    print(f"{bad} failing line(s) in {', '.join(slugs)}")
    guide = check_guide_lines()
    print(f"{guide} failing guide wayfinding line(s) in {GUIDE_LINES.relative_to(ROOT)}")
    return 1 if bad or guide else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
