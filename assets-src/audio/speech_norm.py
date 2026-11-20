#!/usr/bin/env python3
"""Spoken-text normaliser for the guide's voice (captions are never touched).

Kokoro reads through espeak-ng, which says a bare year as a cardinal ("1881" -> "one thousand eight
hundred eighty one") and turns the full stops of abbreviations into pause tokens ("U.S." -> "U",
pause, "S"). normalize(text, seed) rewrites only the words the voice says:

Years (4 digits standing alone, 1100-2099, not a code, a count or part of a longer number):
  1100-1999   two styles, "eighteen eighty-one" or "eighteen hundred eighty-one"; the style is
              fixed per line by `seed` (deterministic, so a re-render is identical) and varies
              across lines so the guide does not sound repetitive (owner decision, round 5)
  1x00        "eighteen hundred";  1x01-1x09 "eighteen oh five" / "eighteen hundred five"
  1900-1909   always "nineteen hundred", "nineteen oh five"
  2000-2009   "two thousand", "two thousand five";  2010-2099 "twenty fourteen"
  decades     "1860s" -> "eighteen sixties";  ranges "1849-1856" -> "... to ..."
Dates: "June 18, 1943" -> "June eighteenth, nineteen forty-three"; "18 June 1943" -> "the eighteenth
of June, ..."; "June 18" -> "June eighteenth".
Abbreviations: U.S. -> US (one word, no pause; "the United States" where it ends a phrase), Dr.,
Lt., Rev., Prof., Mr., Mrs., St. (Saint before a name, Street after one), Mt., D.C., c./ca. before a
year (circa), No. before a number; every US state and Canadian province abbreviation after a place
name ("Orange, N. J." and "Princeton, N.J." -> "New Jersey", "San Antonio, Tex." -> "Texas"); the
months' and titles' short forms (Sept., Gen., Capt., Jr.); and a person's initials lose their full
stop ("Clifford L. Comstock" -> "Clifford L Comstock"), so the voice never pauses inside a name
(owner feedback round 9).

Not years: numbers with a thousands comma or more digits (patent 2,292,387), a number after
"number", "No.", "petition", "patent", "serial", "page", "box", "folder", "item", "file", "case",
"$", or before a unit or a count noun ("1500 people", "2000 miles").

Run this file to print the test list and, with Kokoro's tokenizer available, check the phonemes:
no pause token inside an abbreviation and no "thousand" in a year.
"""
import re

ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven",
        "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"]
TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"]
ORD = {"one": "first", "two": "second", "three": "third", "five": "fifth", "eight": "eighth", "nine": "ninth", "twelve": "twelfth"}
MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
MONTH_RE = "|".join(MONTHS)
NOT_YEAR_BEFORE = {"number", "no", "nos", "petition", "patent", "serial", "page", "pages", "box", "folder", "item",
                   "file", "case", "record", "catalog", "catalogue", "id", "room", "lot", "plate", "series"}
NOT_YEAR_AFTER = {"people", "men", "women", "children", "students", "members", "miles", "mile", "feet", "foot",
                  "metres", "meters", "metre", "meter", "km", "kilometres", "kilometers", "pounds", "dollars", "tons",
                  "acres", "copies", "books", "letters", "pages", "times", "words", "seats", "votes", "volts", "m",
                  "cm", "mm", "kg", "percent", "hours", "minutes", "seconds", "days", "years"}


def two(n):
    """0-99 in words, hyphenated like 'eighty-one'."""
    if n < 20:
        return ONES[n]
    t, o = divmod(n, 10)
    return TENS[t] + ("-" + ONES[o] if o else "")


def ordinal(n):
    w = two(n)
    head, _, last = w.rpartition("-")
    if last in ORD:
        last = ORD[last]
    elif last.endswith("y"):
        last = last[:-1] + "ieth"
    else:
        last += "th"
    return (head + "-" if head else "") + last


def year_words(y, style):
    """style 0: 'eighteen eighty-one', style 1: 'eighteen hundred eighty-one'."""
    if 2000 <= y <= 2009:
        return "two thousand" + (" " + ONES[y - 2000] if y > 2000 else "")
    hi, lo = divmod(y, 100)
    if lo == 0:
        return two(hi) + " hundred"
    if 1900 <= y <= 1909 or y >= 2010:
        return two(hi) + " " + ("oh " + ONES[lo] if lo < 10 else two(lo))
    if style == 1:
        return two(hi) + " hundred " + two(lo)
    return two(hi) + " " + ("oh " + ONES[lo] if lo < 10 else two(lo))


def decade_words(d):
    """1860 -> 'eighteen sixties', 1900 -> 'nineteen hundreds', 2000 -> 'two thousands'."""
    if d == 2000:
        return "two thousands"
    hi, lo = divmod(d, 100)
    if lo == 0:
        return two(hi) + " hundreds"
    t = TENS[lo // 10]
    return two(hi) + " " + t[:-1] + "ies"


def _word_before(text, i):
    m = re.search(r"([A-Za-z$#]+)\.?\s*$", text[:i])
    return m.group(1).lower() if m else ""


def _word_after(text, i):
    m = re.match(r"\s*([A-Za-z%]+)", text[i:])
    return m.group(1).lower() if m else ""


def _is_year(text, m):
    y = int(m.group(0))
    if not 1100 <= y <= 2099:
        return False
    s, e = m.start(), m.end()
    # part of a longer number: 2,292,387 / 12.1881 / 1881,000
    if s > 0 and re.match(r"[\d,.]", text[s - 1]) and not (text[s - 1] in ",." and (s < 2 or not text[s - 2].isdigit())):
        return False
    if e < len(text) and (text[e].isdigit() or (text[e] in ",." and e + 1 < len(text) and text[e + 1].isdigit())):
        return False
    before = _word_before(text, s)
    if before in NOT_YEAR_BEFORE or text[:s].rstrip().endswith(("$", "#")):
        return False
    after = _word_after(text, e)
    if after in NOT_YEAR_AFTER or text[e:e + 1] == "%":
        return False
    return True


# state and province abbreviations (AP and postal forms with full stops) said after a place name
# ("Orange, N. J."): the letters may be spaced; a form that is also a word (Miss., Ind., Wash., La.,
# Me.) is read as a state only after a comma
STATES = {
    "Ala": "Alabama", "Ariz": "Arizona", "Ark": "Arkansas", "Calif": "California", "Colo": "Colorado",
    "Conn": "Connecticut", "Del": "Delaware", "Fla": "Florida", "Ga": "Georgia", "Ill": "Illinois",
    "Ind": "Indiana", "Kan": "Kansas", "Kans": "Kansas", "Ky": "Kentucky", "La": "Louisiana", "Md": "Maryland",
    "Mass": "Massachusetts", "Mich": "Michigan", "Minn": "Minnesota", "Miss": "Mississippi", "Mo": "Missouri",
    "Mont": "Montana", "Neb": "Nebraska", "Nebr": "Nebraska", "Nev": "Nevada", "N.H": "New Hampshire",
    "N.J": "New Jersey", "N.M": "New Mexico", "N.Y": "New York", "N.C": "North Carolina",
    "N.D": "North Dakota", "Okla": "Oklahoma", "Ore": "Oregon", "Pa": "Pennsylvania", "Penn": "Pennsylvania",
    "R.I": "Rhode Island", "S.C": "South Carolina", "S.D": "South Dakota", "Tenn": "Tennessee",
    "Tex": "Texas", "Vt": "Vermont", "Va": "Virginia", "Wash": "Washington", "W.Va": "West Virginia",
    "Wis": "Wisconsin", "Wyo": "Wyoming", "Ont": "Ontario", "Que": "Quebec", "B.C": "British Columbia",
    "Alta": "Alberta", "Sask": "Saskatchewan", "Man": "Manitoba", "N.S": "Nova Scotia", "N.B": "New Brunswick",
}


def _state_pattern(abbr):
    # "N.J" -> N\.\s?J\. ; "Tex" -> Tex\.
    return r"\s?".join(re.escape(p) + r"\." for p in abbr.split("."))


# forms that are also words ("Miss. Kiesler", "Wash. when"): read as a state only after a comma and never before a
# capitalised word, which may be a name (round 9 fix round 1: "Ohio, Miss. Kiesler" is not Mississippi)
WORD_FORMS = {"Miss", "Ind", "Wash", "La", "Man"}


def _state_rule(abbr):
    pat = re.compile(r"(?<=,\s)" + _state_pattern(abbr) + r"(?=$|[\s,;:)])")
    full = STATES[abbr]
    word = abbr in WORD_FORMS

    def rep(m):
        after = m.string[m.end():]
        if re.match(r"\s+[A-Z]", after):
            # before a capitalised word: a word form may be a title before a name, so it is left alone; a state
            # abbreviation there ends the sentence, so the sentence keeps its full stop (round 9 fix round 1)
            return m.group(0) if word else full + "."
        return full
    return pat, rep


# the longest forms first, so "W.Va." is not read as "Va."
STATE_RULES = [_state_rule(a) for a in sorted(STATES, key=len, reverse=True)]
# a place's state abbreviation at the very end of a text ("..., Orange, N. J."): it ends the sentence when a
# capitalised word follows (ends_sentence)
STATE_AT_END = [re.compile(r",\s" + _state_pattern(a) + r"$") for a in sorted(STATES, key=len, reverse=True) if a not in WORD_FORMS]
# short forms of months, titles and the like, said in full
SHORT = [
    (r"\b(Jan|Feb|Aug|Sept|Sep|Oct|Nov|Dec)\.(?=\s+\d)", {"Jan": "January", "Feb": "February", "Aug": "August", "Sept": "September", "Sep": "September", "Oct": "October", "Nov": "November", "Dec": "December"}),
    (r"\b(Gen|Gov|Sen|Rep|Capt|Col|Maj|Sgt|Lieut|Hon)\.(?=\s+[A-Z])", {"Gen": "General", "Gov": "Governor", "Sen": "Senator", "Rep": "Representative", "Capt": "Captain", "Col": "Colonel", "Maj": "Major", "Sgt": "Sergeant", "Lieut": "Lieutenant", "Hon": "Honorable"}),
    (r"(?<=[A-Za-z],\s)(Jr|Sr)\.", {"Jr": "Junior", "Sr": "Senior"}),
    (r"(?<=[A-Za-z] )(Jr|Sr)\.", {"Jr": "Junior", "Sr": "Senior"}),
]


# short forms that abbreviate only before a number ("No. 5", "Dec. 7"): elsewhere a full stop after them ends
# the sentence ("He said no. Then ...")
BEFORE_NUMBER = {"no", "nos", "jan", "feb", "aug", "sept", "sep", "oct", "nov", "dec"}


def ends_sentence(word, before="", after=None):
    """False for a word whose full stop is an abbreviation's or an initial's, not a sentence end
    (build_guide_audio.py splits the lines into sentences with it). `before` is the text before the word and
    `after` the text after it, when known (round 9 fix round 1: a state abbreviation, "no.", "I." and "Dec."
    end a sentence when the words around them say so)."""
    w = word.strip("\"'“”‘’(")
    nxt = after.lstrip()[:1] if after is not None else ""
    if after is not None and nxt.isupper():
        # a place's state abbreviation closing the sentence: "They met at Orange, N. J. He left."
        tail = (before.rstrip() + " " + w).strip()
        if any(p.search(tail) for p in STATE_AT_END):
            return True
    if w == "I." and after is not None:
        # the pronoun ends the sentence ("So did I. Then"); after a capitalised name it is an initial ("Charles I. Smith")
        prev = before.split()[-1] if before.split() else ""
        return not (prev[:1].isupper() and prev[-1:].isalpha())
    if re.fullmatch(r"[A-Z]\.", w):  # an initial: "L.", the "N." of "N. J."
        return False
    if re.fullmatch(r"(?:[A-Za-z]\.){2,}", w):  # U.S., N.J., D.C., Ph.D.
        return False
    bare = w[:-1] if w.endswith(".") else w
    if bare in STATES or bare.replace(".", "") in {k.replace(".", "") for k in STATES}:
        return False
    if bare.lower() in BEFORE_NUMBER and after is not None:
        return not nxt.isdigit()
    return bare.lower() not in SHORT_WORDS


SHORT_WORDS = {"dr", "lt", "rev", "prof", "mr", "mrs", "mt", "st", "c", "ca", "no", "jan", "feb", "aug", "sept", "sep",
               "oct", "nov", "dec", "gen", "gov", "sen", "rep", "capt", "col", "maj", "sgt", "lieut", "hon", "jr", "sr", "calif", "conn"}


ABBREV = [
    # (pattern, replacement); order matters
    (r"\bU\.\s?S\.(?=\s+[A-Z])", "US"),                    # U.S. Senate, U.S. Patent
    (r"\bthe U\.\s?S\.(?=\s*(?:[,;:)]|$|\.|\s+[a-z]))", "the United States"),
    (r"\bU\.\s?S\.", "US"),
    (r"\bU\.\s?S\.?\s?A\.", "USA"),
    (r"\bD\.\s?C\.", "D C"),
    (r"\bN\.\s?J\.", "New Jersey"),
    (r"\bN\.\s?Y\.", "New York"),
    (r"\bCalif\.", "California"),
    (r"\bConn\.", "Connecticut"),
    (r"\bMass\.", "Massachusetts"),
    (r"\bWis\.", "Wisconsin"),
    (r"\bDr\.(?=\s)", "Doctor"),
    (r"\bLt\.(?=\s)", "Lieutenant"),
    (r"\bRev\.(?=\s)", "Reverend"),
    (r"\bProf\.(?=\s)", "Professor"),
    (r"\bMrs\.(?=\s)", "Missus"),
    (r"\bMr\.(?=\s)", "Mister"),
    (r"\bMt\.(?=\s)", "Mount"),
    (r"\b([A-Z][a-z]+) St\.(?=$|[,;.)]|\s+[a-z])", r"\1 Street"),  # Mercer St.
    (r"\bSt\.(?=\s+[A-Z])", "Saint"),                       # St. Louis
    (r"\b(?:c|ca)\.\s?(?=\d{4})", "circa "),
    (r"\bNo\.\s?(?=\d)", "number "),
    (r"\bPh\.\s?D\.", "P H D"),
    (r"(?<=\d) m\b(?=[.,;:)]|\s|$)", " metres"),
    (r"(?<=\d) cm\b(?=[.,;:)]|\s|$)", " centimetres"),
]


def normalize(text, seed=0):
    """The words the guide says for `text` (a caption sentence or a 'speak' override)."""
    style = seed % 2
    out = text
    for pat, rep in STATE_RULES:
        out = pat.sub(rep, out)
    for pat, rep in ABBREV:
        out = re.sub(pat, rep, out)
    for pat, names in SHORT:
        out = re.sub(pat, lambda m, names=names: names[m.group(1)], out)
    # a person's initials: "Clifford L. Comstock", "H. C. White" (not "I", which may end a sentence)
    out = re.sub(r"\b([A-HJ-Z])\.\s?(?=[A-Z][a-z]|[A-Z]\.|[A-Z]\b)", r"\1 ", out)

    # year ranges: 1849-1856, 1849–1856, 1977 to 1981 (the second is handled as a year anyway)
    def rng(m):
        a, b = int(m.group(1)), int(m.group(2))
        if 1100 <= a <= 2099 and 1100 <= b <= 2099 and a < b:
            return f"{year_words(a, style)} to {year_words(b, style)}"
        return m.group(0)
    out = re.sub(r"(?<![\d,.])(\d{4})\s?[-–]\s?(\d{4})(?![\d,])", rng, out)

    # decades
    out = re.sub(r"(?<![\d,.])(\d{3}0)['’]?s\b", lambda m: decade_words(int(m.group(1))) if 1100 <= int(m.group(1)) <= 2090 else m.group(0), out)

    # dates: "18 June 1943" and "June 18[, 1943]"
    out = re.sub(rf"\b(\d{{1,2}}) ({MONTH_RE})\b", lambda m: f"the {ordinal(int(m.group(1)))} of {m.group(2)}" if 1 <= int(m.group(1)) <= 31 else m.group(0), out)
    out = re.sub(rf"\b({MONTH_RE}) (\d{{1,2}})(?!\d|,\d)\b", lambda m: f"{m.group(1)} {ordinal(int(m.group(2)))}" if 1 <= int(m.group(2)) <= 31 else m.group(0), out)

    # years
    out = _years(out, style)
    # an expanded abbreviation that closed the sentence keeps the sentence's full stop
    if text.endswith(".") and not out.endswith((".", "!", "?")):
        out += "."
    return out


def _years(text, style):
    parts, last = [], 0
    for m in re.finditer(r"(?<!\d)\d{4}(?!\d)", text):
        if _is_year(text, m):
            parts.append(text[last:m.start()])
            parts.append(year_words(int(m.group(0)), style))
            last = m.end()
    parts.append(text[last:])
    return "".join(parts)


# Tricky strings: (input, seed, expected spoken text)
TESTS = [
    ("He was born in 1881.", 0, "He was born in eighteen eighty-one."),
    ("He was born in 1881.", 1, "He was born in eighteen hundred eighty-one."),
    ("In 1905, he wrote.", 1, "In nineteen oh five, he wrote."),
    ("In 1900 and 1800.", 1, "In nineteen hundred and eighteen hundred."),
    ("In 1805.", 0, "In eighteen oh five."),
    ("In 2003 and 2014.", 0, "In two thousand three and twenty fourteen."),
    ("In 2000.", 1, "In two thousand."),
    ("the 1860s", 0, "the eighteen sixties"),
    ("the 1900s", 0, "the nineteen hundreds"),
    ("on June 18, 1943, he wrote", 0, "on June eighteenth, nineteen forty-three, he wrote"),
    ("on June 18, 1943, he wrote", 1, "on June eighteenth, nineteen hundred forty-three, he wrote"),
    ("on 18 June 1943", 0, "on the eighteenth of June nineteen forty-three"),
    ("April 21", 0, "April twenty-first"),
    ("December 31, 1930", 0, "December thirty-first, nineteen thirty"),
    ("1849-1856", 0, "eighteen forty-nine to eighteen fifty-six"),
    ("from 1977 to 1981", 1, "from nineteen hundred seventy-seven to nineteen hundred eighty-one"),
    ("U.S. Patent 2,292,387", 0, "US Patent 2,292,387"),
    ("petition 4009", 0, "petition 4009"),
    ("petition number 4009", 0, "petition number 4009"),
    ("No. 1234", 0, "number 1234"),
    ("1500 people came", 0, "1500 people came"),
    ("the U.S. Senate confirmed her", 0, "the US Senate confirmed her"),
    ("he came to the U.S. in 1933.", 0, "he came to the United States in nineteen thirty-three."),
    ("a citizen of the U.S.", 0, "a citizen of the United States."),
    ("U.S. District Court for the District of New Jersey", 0, "US District Court for the District of New Jersey"),
    ("Dr. John Strentzel", 0, "Doctor John Strentzel"),
    ("Lt. Stephen Brunauer", 0, "Lieutenant Stephen Brunauer"),
    ("the Rev. Hector Cowan", 0, "the Reverend Hector Cowan"),
    ("St. Louis", 0, "Saint Louis"),
    ("112 Mercer St.", 0, "112 Mercer Street."),
    ("Mt. Ritter", 0, "Mount Ritter"),
    ("Princeton, N.J.", 0, "Princeton, New Jersey."),
    ("Martinez, Calif.", 0, "Martinez, California."),
    ("Washington, D.C.", 0, "Washington, D C."),
    ("a rally at Military Common, Orange, N. J.", 0, "a rally at Military Common, Orange, New Jersey."),
    ("at Princeton, N.J., he", 0, "at Princeton, New Jersey, he"),
    ("San Antonio, Tex., August 8", 0, "San Antonio, Texas, August eighth"),
    ("Springfield, Mass., in 1891", 0, "Springfield, Massachusetts, in eighteen ninety-one"),
    ("Charleston, W. Va., and Richmond, Va.", 0, "Charleston, West Virginia, and Richmond, Virginia."),
    ("Almonte, Ont.", 0, "Almonte, Ontario."),
    ("Jackson, Miss.", 0, "Jackson, Mississippi."),
    ("Miss Kiesler", 0, "Miss Kiesler"),
    ("with Lieutenant Clifford L. Comstock, a student officer", 0, "with Lieutenant Clifford L Comstock, a student officer"),
    ("H. C. White Co.", 0, "H C White Co."),
    ("Dr. James A. Naismith", 0, "Doctor James A Naismith"),
    ("On 1 Sept. 1943", 0, "On the first of September nineteen forty-three"),
    ("Gen. Eisenhower", 0, "General Eisenhower"),
    ("Martin Luther King, Jr.", 0, "Martin Luther King, Junior."),
    ("World War I. He", 0, "World War I. He"),
    ("in Washington, D.C. In 1921 he", 0, "in Washington, D C In nineteen twenty-one he"),
    ("Mrs. Einstein", 0, "Missus Einstein"),
    ("c. 1887", 0, "circa eighteen eighty-seven"),
    ("ca. 1887", 1, "circa eighteen hundred eighty-seven"),
    ("posts every 2.25 m, as photographed.", 0, "posts every 2.25 metres, as photographed."),
    ("I am here.", 0, "I am here."),
    ("$1500", 0, "$1500"),
    ("1,881 feet", 0, "1,881 feet"),
]


def selftest(verbose=True):
    bad = 0
    for src, seed, want in TESTS:
        got = normalize(src, seed)
        ok = got == want
        bad += not ok
        if verbose or not ok:
            print(f"{'ok ' if ok else 'BAD'} {src!r} -> {got!r}" + ("" if ok else f"  (want {want!r})"))
    return bad


def phoneme_check():
    """Listen-free check with Kokoro's own G2P: no pause token inside an abbreviation, no cardinal
    'thousand' reading of a year. Needs kokoro_onnx (the audio venv)."""
    try:
        from kokoro_onnx.tokenizer import Tokenizer
    except ImportError:
        print("kokoro_onnx not importable: phoneme check skipped")
        return 0
    tok = Tokenizer()
    bad = 0
    for src, seed, _ in TESTS:
        said = normalize(src, seed)
        ph = tok.phonemize(said)
        # a '.' between two letters of an initialism is the pause the owner heard
        pause = re.search(r"\w\.\s?\w", ph) is not None
        thousand = "θˈaʊzənd" in ph and not re.search(r"\b20\d\d\b|two thousand", said) and not re.search(r"\d,\d|\d{4}", said)
        if pause or thousand:
            bad += 1
            print(f"PHONEME {src!r} -> {said!r} -> {ph}")
    print(f"phoneme check: {bad} problems in {len(TESTS)} strings")
    return bad


if __name__ == "__main__":
    import sys
    n = selftest(verbose="-q" not in sys.argv)
    n += phoneme_check()
    print("FAIL" if n else "ALL OK")
    sys.exit(1 if n else 0)
