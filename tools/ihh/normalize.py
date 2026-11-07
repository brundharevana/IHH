"""Text normalization, date parsing, and number words for the deterministic gates.

normalize_text() is the one normalization used to compare quotes with snapshots
(G1) and to hash claims (G7): NFKC, drop soft hyphens and zero-width characters,
unify curly quotes, apostrophes and dashes, casefold, collapse whitespace.

content_tokens() is the one construct behind G2 and G6 ("nothing added"): a
claim or draft unit may contain no content token its support lacks. It parses
dates (to ISO, full or partial, and a month named alone), numbers (digits and
number words, so "thirteen" equals "13", "first" equals "1st" and "a dozen"
equals "12"; "a decade" is 10 plus the unit "years"), decades ("1950s", "the
fifties"), ages ("in his forties"), codes that mix letters and digits, and
meaning-bearing symbols ("%", "$", "<", "~", a minus sign), then keeps every
other word as a content word: casefolded, accent- and possessive-stripped,
split at hyphens and lightly stemmed (stem()). A closed-class word ("not",
"may", "even", "will") is matched only by itself, never by another word's stem.
Only the audited FUNCTION_WORDS are dropped. There is no list of risky words to
keep up to date: quantities, seasons, relative periods, names and evaluative
words are all content words.

quoted_spans() is the one reader of quotations in draft text (G6): every
quotation style (straight, curly, guillemets, CJK corner brackets) is unified
by prepare() and read here.

name_problem() decides whether an alias is a name (aliases supply name words to
G2/G6, so a phrase posing as an alias could otherwise supply anything).
"""

import calendar
import hashlib
import re
import unicodedata
from dataclasses import dataclass, field

# --- text normalization ------------------------------------------------------------

_DROP = "\u00ad\u200b\u200c\u200d\u2060\ufeff"
_SINGLE_QUOTES = "\u2018\u2019\u201a\u201b\u2032\u02bc\u2039\u203a"
_DOUBLE_QUOTES = "\u201c\u201d\u201e\u201f\u2033\u00ab\u00bb\u301d\u301e\u300c\u300d\u300e\u300f"
_DASHES = "\u2010\u2011\u2012\u2013\u2014\u2015\u2212\u2043\ufe58\ufe63\uff0d"

_TRANSLATE = str.maketrans(
    {**{c: None for c in _DROP},
     **{c: "'" for c in _SINGLE_QUOTES},
     **{c: '"' for c in _DOUBLE_QUOTES},
     **{c: "-" for c in _DASHES}}
)
_WS = re.compile(r"\s+")


def prepare(text):
    """NFKC plus quote/dash unification, keeping case and spacing (for parsing)."""
    if not text:
        return ""
    return unicodedata.normalize("NFKC", str(text).translate(_TRANSLATE)).translate(_TRANSLATE)


def normalize_text(text):
    """The G1/G7 normalization: prepare(), casefold, NFKC again, collapse whitespace."""
    folded = unicodedata.normalize("NFKC", prepare(text).casefold())
    return _WS.sub(" ", folded).strip()


def sha256_text(text):
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def claim_sha256(claim):
    """sha256 of the normalized claim; stored as verified_claim_sha256 (G7)."""
    return sha256_text(normalize_text(claim or ""))


def _is_word_char(ch):
    return ch.isalnum() or ch == "_"


def contains_normalized(haystack, needle):
    """True if needle occurs in haystack without starting or ending inside a word.

    Both arguments must already be normalized. An empty needle never matches.
    """
    if not needle:
        return False
    start = 0
    while True:
        i = haystack.find(needle, start)
        if i < 0:
            return False
        j = i + len(needle)
        before_ok = i == 0 or not (_is_word_char(haystack[i - 1]) and _is_word_char(needle[0]))
        after_ok = j == len(haystack) or not (_is_word_char(haystack[j]) and _is_word_char(needle[-1]))
        if before_ok and after_ok:
            return True
        start = i + 1


def strip_enclosing_quotes(text):
    """Remove one pair of quotation marks wrapping the whole text, if present."""
    t = prepare(text).strip()
    if len(t) >= 2 and t[0] == t[-1] and t[0] in "\"'":
        return t[1:-1].strip()
    return t


def fold_token(token):
    """Comparison form of a word: casefold, strip accents and a possessive 's."""
    t = unicodedata.normalize("NFKD", prepare(token).casefold())
    t = "".join(ch for ch in t if not unicodedata.combining(ch))
    if t.endswith("'s"):
        t = t[:-2]
    return t.strip("'")


# --- dates ---------------------------------------------------------------------------

MONTHS = {
    "january": 1, "jan": 1, "february": 2, "feb": 2, "march": 3, "mar": 3, "april": 4, "apr": 4,
    "may": 5, "june": 6, "jun": 6, "july": 7, "jul": 7, "august": 8, "aug": 8, "september": 9,
    "sept": 9, "sep": 9, "october": 10, "oct": 10, "november": 11, "nov": 11, "december": 12,
    "dec": 12,
}
MONTH_NAMES = ("january", "february", "march", "april", "may", "june", "july", "august",
               "september", "october", "november", "december")
MIN_YEAR, MAX_YEAR = 1000, 2100

# Month names are matched in Title case or UPPER case only, so verbs like "may"
# and "march" in running text are not read as months.
_month_alts = sorted({form for name in MONTHS for form in (name.capitalize(), name.upper())},
                     key=len, reverse=True)
_MON = r"(?P<mon>(?:" + "|".join(_month_alts) + r")\.?)"
_DAY = r"(?P<day>\d{1,2})(?:st|nd|rd|th)?"
_YEAR = r"(?P<year>\d{4})"
_L = r"(?<![\w-])"
_R = r"(?![\w])"

# A month named alone ("in May", "by mid-March"), in Title or UPPER case and full form only
# ("Jan" and "May" at the start of a sentence stay words). It is a partial date (month only),
# so "may", "marched" and "august" in lower case are never months.
_MONTH_ALONE = re.compile(r"(?<![\w])(?P<mon>" + "|".join(
    sorted({form for name in MONTH_NAMES for form in (name.capitalize(), name.upper())}, key=len, reverse=True))
    + r")(?![\w])")

# Order matters: earlier patterns win over overlapping later ones.
_DATE_PATTERNS = [
    re.compile(_L + r"(?P<year>\d{4})-(?P<m>\d{2})-(?P<day>\d{2})" + r"(?![\w-])"),
    re.compile(_L + _MON + r"\s+" + _DAY + r",?\s+" + _YEAR + _R),
    re.compile(_L + r"(?:(?:[Tt]he)\s+)?" + _DAY + r"\s+(?:of\s+)?" + _MON + r",?\s+" + _YEAR + _R),
    re.compile(r"(?<![\w/])(?P<m>\d{1,2})/(?P<day>\d{1,2})/(?P<year>\d{4})(?![\w/])"),
    re.compile(_L + r"(?P<year>\d{4})-(?P<m>\d{2})" + r"(?![\w-])"),
    re.compile(_L + _MON + r",?\s+" + _YEAR + _R),
    re.compile(_L + _MON + r"\s+" + _DAY + _R),
    re.compile(_L + r"(?:(?:[Tt]he)\s+)?" + _DAY + r"\s+(?:of\s+)?" + _MON + _R),
]


@dataclass(frozen=True)
class PartialDate:
    year: int | None = None
    month: int | None = None
    day: int | None = None

    @property
    def iso(self):
        if self.year is not None:
            parts = [f"{self.year:04d}"]
            if self.month is not None:
                parts.append(f"{self.month:02d}")
                if self.day is not None:
                    parts.append(f"{self.day:02d}")
            return "-".join(parts)
        if self.month is not None:
            return f"--{self.month:02d}" + (f"-{self.day:02d}" if self.day is not None else "")
        return ""

    def within(self, other):
        """True if every component this date states is stated identically by other."""
        return all(a is None or a == b for a, b in
                   ((self.year, other.year), (self.month, other.month), (self.day, other.day)))


@dataclass(frozen=True)
class DateMatch:
    text: str
    start: int
    end: int
    options: tuple  # PartialDate interpretations; two only for ambiguous 1/2/1941 forms

    @property
    def iso(self):
        return self.options[0].iso


def _valid(year, month, day):
    if year is not None and not (MIN_YEAR <= year <= MAX_YEAR):
        return False
    if month is not None and not (1 <= month <= 12):
        return False
    if day is not None:
        if month is None or day < 1:
            return False
        last = calendar.monthrange(year if year is not None else 2000, month)[1]
        if day > last:
            return False
    return True


def _month_number(raw):
    return MONTHS.get(raw.rstrip(".").lower())


def _interpret(m):
    g = m.groupdict()
    year = int(g["year"]) if g.get("year") else None
    day = int(g["day"]) if g.get("day") else None
    if g.get("mon"):
        month = _month_number(g["mon"])
    else:
        month = int(g["m"]) if g.get("m") else None
    options = []
    if _valid(year, month, day):
        options.append(PartialDate(year, month, day))
    if "/" in m.group(0) and day is not None and month is not None and day != month:
        # 6/10/1941 is read as US month/day first; the day/month reading is kept
        # as a second option when it is also a valid date.
        if _valid(year, day, month):
            options.append(PartialDate(year, day, month))
    return tuple(options)


def _scan_dates(text):
    taken = []
    found = []
    for pattern in _DATE_PATTERNS:
        for m in pattern.finditer(text):
            s, e = m.span()
            if any(s < te and ts < e for ts, te in taken):
                continue
            options = _interpret(m)
            if not options:
                continue
            taken.append((s, e))
            found.append(DateMatch(m.group(0), s, e, options))
    found.sort(key=lambda d: d.start)
    return found


def find_dates(text):
    """Date expressions in running text (not bare years), in order of appearance."""
    return _scan_dates(prepare(text))


def parse_date_parts(text):
    """Parse a whole string as one date: full, year-month, month-day, or a bare year."""
    t = prepare(text).strip().rstrip(".").strip() if text else ""
    if not t:
        return None
    if re.fullmatch(r"\d{4}", t):
        year = int(t)
        return PartialDate(year) if _valid(year, None, None) else None
    for pattern in _DATE_PATTERNS:
        m = pattern.fullmatch(t)
        if m:
            options = _interpret(m)
            return options[0] if options else None
    return None


def parse_date(text):
    """ISO form ('1941-06-10', '1941-06', '1941') of a date string, or None."""
    d = parse_date_parts(text)
    return d.iso if d else None


# --- numbers -------------------------------------------------------------------------

_UNITS = {w: i for i, w in enumerate(
    "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen "
    "fifteen sixteen seventeen eighteen nineteen".split())}
_TENS = {w: 10 * i for i, w in enumerate(
    "twenty thirty forty fifty sixty seventy eighty ninety".split(), start=2)}
_SCALES = {"hundred": 100, "thousand": 1000, "million": 1_000_000}
_ORD_UNITS = {w: i for i, w in enumerate(
    "zeroth first second third fourth fifth sixth seventh eighth ninth tenth eleventh twelfth "
    "thirteenth fourteenth fifteenth sixteenth seventeenth eighteenth nineteenth".split())}
_ORD_TENS = {w: 10 * i for i, w in enumerate(
    "twentieth thirtieth fortieth fiftieth sixtieth seventieth eightieth ninetieth".split(), start=2)}
_ORD_SCALES = {"hundredth": 100, "thousandth": 1000, "millionth": 1_000_000}
NUMBER_WORDS = set(_UNITS) | set(_TENS) | set(_SCALES) | set(_ORD_UNITS) | set(_ORD_TENS) | set(_ORD_SCALES)


def _word_value(w):
    """(value, kind, ordinal) for one number word, else None."""
    for table, kind, ordinal in ((_UNITS, "unit", False), (_ORD_UNITS, "unit", True),
                                 (_TENS, "tens", False), (_ORD_TENS, "tens", True)):
        if w in table:
            return table[w], kind, ordinal
    if w in ("hundred", "hundredth"):
        return 100, "hundred", w.endswith("th")
    if w in _SCALES:
        return _SCALES[w], "scale", False
    if w in _ORD_SCALES:
        return _ORD_SCALES[w], "scale", True
    return None


def _phrase_value(words):
    """Value of a list of lowercase number words, or None if not a well-formed number.

    Accepts forms such as "thirteen", "twenty one", "one hundred and five",
    "a hundred", "two thousand", "nineteen hundred", and an ordinal as the last
    word ("twenty first", "hundredth").
    """
    if not words:
        return None
    total, current = 0, 0
    state = "start"  # start, unit, tens, hundred, scale, and, a
    for i, w in enumerate(words):
        last = i == len(words) - 1
        if w == "a":
            nxt = words[i + 1] if not last else ""
            if state != "start" or last or (_word_value(nxt) or (0, ""))[1] not in ("hundred", "scale"):
                return None
            current, state = 1, "a"
            continue
        if w == "and":
            if state not in ("hundred", "scale") or last:
                return None
            state = "and"
            continue
        info = _word_value(w)
        if info is None:
            return None
        value, kind, ordinal = info
        if ordinal and not last:
            return None
        if kind == "unit":
            if state in ("start", "hundred", "scale", "and"):
                current += value
            elif state == "tens" and 1 <= value <= 9:
                current += value
            else:
                return None
            state = "unit"
        elif kind == "tens":
            if state not in ("start", "hundred", "scale", "and"):
                return None
            current += value
            state = "tens"
        elif kind == "hundred":
            if state == "start":
                current = 100
            elif state in ("unit", "tens", "a") and current < 100:
                current = max(current, 1) * 100
            else:
                return None
            state = "hundred"
        else:  # thousand, million
            if state == "start":
                current = 1
            elif state not in ("unit", "tens", "hundred", "a"):
                return None
            total += current * value
            current = 0
            state = "scale"
    if state in ("and", "a"):
        return None
    return total + current


def number_word_value(phrase):
    """Integer value of a number phrase such as 'twenty-one' or 'thirteenth', else None."""
    if not phrase:
        return None
    words = [w for w in re.split(r"[\s-]+", phrase.strip().lower()) if w]
    return _phrase_value(words)


_NUM_RE = re.compile(r"(?<![\w.,])(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d+))?(?:st|nd|rd|th)?(?!\w)")
# A minus sign: a hyphen right before a digit that does not follow a word, digit or
# closing bracket ("-5", "(-5)"; not the range "1914-1918").
_SIGN_RE = re.compile(r"(?<![\w.,)\]])-(?=\d)")
# Punctuation that only structures text. Every other non-space character that is not a
# letter or digit (%, $, the pound and euro signs, <, >, ~, the approximately-equals sign,
# +, =, the dagger, #, *, the degree sign, ...) is a content token of its own.
_STRUCTURAL = set(".,;:!?'\"/&\u2026\u00b7\u00a1\u00bf_")
_STRUCTURAL_CATEGORIES = ("Ps", "Pe", "Pi", "Pf", "Pd", "Pc", "Sk", "Mn", "Mc", "Me", "Cf")


def is_symbol(ch):
    """True if ch is a meaning-bearing symbol (a content token), not a letter, digit,
    space or structural punctuation."""
    if ch.isalnum() or ch.isspace() or ch in _STRUCTURAL:
        return False
    return unicodedata.category(ch) not in _STRUCTURAL_CATEGORIES
_DECADE_RE = re.compile(r"(?<![\w.,])(\d{3}0)'?s(?!\w)")

# Decades written as words: "the fifties", "the nineteen-fifties", "the mid-fifties".
_DECADE_WORDS = {w: 10 * i for i, w in enumerate(
    "twenties thirties forties fifties sixties seventies eighties nineties".split(), start=2)}
_CENTURY_WORDS = {"eighteen": 1800, "nineteen": 1900, "twenty": 2000}
_DECADE_WORD_RE = re.compile(
    r"(?<![A-Za-z])(?:(?P<century>eighteen|nineteen|twenty)[\s-]+)?(?P<decade>" +
    "|".join(_DECADE_WORDS) + r")(?![A-Za-z])", re.I)
# A decade word after a possessive is an age ("in his forties", "in her early twenties"),
# never a calendar decade.
_AGE_PREFIX = re.compile(r"(?:\b(?:his|her|their|my|your|its|our|one's)|\w's)\s+(?:(?:early|mid|late)[\s-]+)?$",
                         re.I)
# A count of dozens, scores, decades or centuries is a number: "a dozen" is 12,
# "half a dozen" 6, "a score" 20, "two dozen" 24. A decade or century is a span of
# time, so it keeps its unit: "a decade" is 10 plus the word "years", "half a century"
# 50 plus "years" (a bare count of 10 or 50 does not support it).
_MULTIPLES = {"dozen": 12, "score": 20, "decade": 10, "century": 100}
_TIME_MULTIPLES = {"decade": "years", "century": "years"}
_MULTIPLE_RE = re.compile(
    r"(?<![A-Za-z\d.,])(?P<lead>half[\s-]+an?|an?[\s-]+half|half|an?|one|two|three|four|five|six|seven|"
    r"eight|nine|ten|eleven|twelve|\d{1,3})[\s-]+(?P<unit>dozens?|scores?|decades?|centur(?:y|ies))(?![A-Za-z])",
    re.I)
_ALPHA_RE = re.compile(r"[A-Za-z]+")
_CODE_RE = re.compile(r"(?<!\w)\w*\d\w*(?!\w)")
WORD_RE = re.compile(r"[^\W\d_]+(?:['-][^\W\d_]+)*")


def _multiple_value(m):
    """Canonical number string for a _MULTIPLE_RE match ("half a dozen" -> "6")."""
    lead = " ".join(m.group("lead").lower().replace("-", " ").split())
    unit = m.group("unit").lower()
    unit = "century" if unit.startswith("centur") else unit.rstrip("s")
    if lead.startswith("half") or lead.endswith("half"):
        count = 0.5
    elif lead in ("a", "an", "one"):
        count = 1
    elif lead.isdigit():
        count = int(lead)
    else:
        count = _UNITS[lead]
    value = count * _MULTIPLES[unit]
    return str(int(value)) if value == int(value) else str(value)


def _number_string(int_part, frac):
    value = str(int(int_part.replace(",", "")))
    frac = (frac or "").rstrip("0")
    return f"{value}.{frac}" if frac else value


def _scan_number_words(text):
    """(start, end, value) for each number phrase made of English number words."""
    toks = [(m.start(), m.end(), m.group(0).lower()) for m in _ALPHA_RE.finditer(text)]
    found = []
    i = 0
    while i < len(toks):
        if toks[i][2] not in NUMBER_WORDS and toks[i][2] != "a":
            i += 1
            continue
        # Extend over neighbouring number words joined by spaces or single hyphens.
        j = i
        while j + 1 < len(toks):
            gap = text[toks[j][1]:toks[j + 1][0]]
            nxt = toks[j + 1][2]
            if not re.fullmatch(r"\s+|\s*-\s*", gap):
                break
            if nxt not in NUMBER_WORDS and nxt != "and":
                break
            j += 1
        best = None
        for k in range(j, i - 1, -1):
            value = _phrase_value([t[2] for t in toks[i:k + 1]])
            if value is not None:
                best = (k, value)
                break
        if best is None:
            i += 1
            continue
        k, value = best
        found.append((toks[i][0], toks[k][1], value))
        i = k + 1
    return found


# --- sentence analysis ------------------------------------------------------------------

@dataclass(frozen=True)
class Token:
    text: str
    start: int
    end: int

    @property
    def folded(self):
        return fold_token(self.text)

    @property
    def acronym(self):
        """Two or more letters, all capitals: "US", "NASA"."""
        letters = [ch for ch in self.text if ch.isalpha()]
        return len(letters) >= 2 and all(ch.isupper() for ch in letters)


@dataclass
class Analysis:
    dates: list
    numbers: list
    decades: list
    codes: list
    tokens: list
    short_decades: list = field(default_factory=list)  # "the fifties" -> 50 (century not stated)
    ages: list = field(default_factory=list)           # "in his forties" -> ("forties", 40)
    symbols: list = field(default_factory=list)        # "%", "$", "<", "-" (a minus sign), ...
    grouped: set = field(default_factory=set)          # numbers written with separators ("2,292,387")
    implied: list = field(default_factory=list)        # (start, written, key): "years" of "a decade"


def _mask(chars, start, end):
    for k in range(start, end):
        chars[k] = " "


def analyze(text):
    """Dates, numbers, decades, codes and the remaining word tokens of one piece of text.

    Each kind is masked out of the text once found, so a date's day is not also
    read as a number and a number word is not also read as a word.
    """
    t = prepare(text)
    chars = list(t)

    dates = _scan_dates(t)
    for d in dates:
        _mask(chars, d.start, d.end)
    masked = "".join(chars)
    for m in _MONTH_ALONE.finditer(masked):
        before = masked[:m.start()].rstrip().rstrip("\"'([")
        if not before.strip() or before.rstrip()[-1] in ".!?":
            continue  # the first word of a sentence ("May she...", "March was cold") stays a word
        dates.append(DateMatch(m.group(0), m.start(), m.end(), (PartialDate(None, _month_number(m.group(0))),)))
        _mask(chars, *m.span())
    dates.sort(key=lambda d: d.start)
    masked = "".join(chars)

    numbers = []
    decades = []
    short_decades = []
    ages = []
    grouped = set()
    implied = []
    symbols = []
    for m in _DECADE_RE.finditer(masked):
        decades.append(int(m.group(1)))
        _mask(chars, *m.span())
    masked = "".join(chars)
    for m in _DECADE_WORD_RE.finditer(masked):
        value = _DECADE_WORDS[m.group("decade").lower()]
        if m.group("century"):
            decades.append(_CENTURY_WORDS[m.group("century").lower()] + value)
        elif _AGE_PREFIX.search(masked[:m.start()]):
            ages.append((m.group("decade").lower(), value))
        else:
            short_decades.append(value)
        _mask(chars, *m.span())
    masked = "".join(chars)
    for m in _MULTIPLE_RE.finditer(masked):
        numbers.append((m.start(), _multiple_value(m)))
        unit = m.group("unit").lower()
        unit = "century" if unit.startswith("centur") else unit.rstrip("s")
        if unit in _TIME_MULTIPLES:
            implied.append((m.start(), unit, _TIME_MULTIPLES[unit]))
        _mask(chars, *m.span())
    masked = "".join(chars)
    for m in _SIGN_RE.finditer(masked):
        symbols.append((m.start(), "-"))
        _mask(chars, *m.span())
    masked = "".join(chars)
    for m in _NUM_RE.finditer(masked):
        value = _number_string(m.group(1), m.group(2))
        numbers.append((m.start(), value))
        if "," in m.group(1):
            grouped.add(value)
        _mask(chars, *m.span())
    masked = "".join(chars)
    for s, e, value in _scan_number_words(masked):
        numbers.append((s, str(value)))
        _mask(chars, s, e)
    masked = "".join(chars)
    numbers.sort()

    codes = []
    for m in _CODE_RE.finditer(masked):
        codes.append(fold_token(m.group(0)))
        _mask(chars, *m.span())
    masked = "".join(chars)

    symbols.extend((i, ch) for i, ch in enumerate(masked) if is_symbol(ch))
    symbols.sort()
    tokens = [Token(m.group(0), m.start(), m.end()) for m in WORD_RE.finditer(masked)]
    return Analysis(dates=dates, numbers=[v for _, v in numbers], decades=decades, codes=codes,
                    tokens=tokens, short_decades=short_decades, ages=ages, symbols=[c for _, c in symbols],
                    grouped=grouped, implied=implied)


def find_numbers(text):
    """Number values (as canonical strings) in running text, dates excluded."""
    return analyze(text).numbers


# --- content words: the one construct behind G2 and G6 -----------------------------------
#
# Rule (SPEC section 4, G2 and G6): a claim, or a draft unit, may contain no content
# word that its evidence, or its cited facts, does not contain. content_tokens() is
# the only place that decides what a content word is; gates.unsupported_tokens() is
# the only place that applies the rule.

# FUNCTION_WORDS are the only words content_tokens() drops. Audit rule: a word may be
# listed only if it is grammatical glue (an article, a plain preposition, a personal,
# relative or demonstrative pronoun, a form of "be", "have" or "do", or the
# conjunctions "and" and "than") whose presence cannot by itself add a fact, and that
# is not also a content word in another sense ("mine" the pit, "does" the deer). Never
# listed: quantifiers (some, many, all, few, several, each, both, any), negation (no,
# not, never, nor, without), temporal or ordering words (before, after, during, since,
# until, later, early, once, then, when, first, next, following), modals (may, can,
# could, would, will, must), degree and evaluative words (more, most, only, also, even,
# very, renowned), causal or contrastive links (because, although, if, but, or), and
# every number word. tests/test_normalize.py fails if one of those is added here.
FUNCTION_WORDS = frozenset("""
a an the
of in on at by for from to into onto upon with as via per
i me my he him his she her hers it its we us our ours you your yours they them their theirs
himself herself itself themselves
this that these those who whom whose which what there
is was were be been being are am has have had having do did
and than
""".split())

# Closed-class words state negation, modality, quantity, degree, time, order, cause or
# contrast and never inflect. Each is matched only by the identical word: its key is
# "=" + the word, which no stem can produce, so "noted" never supplies "not", "willed"
# never supplies "will" and "evening" never supplies "even".
CLOSED_CLASS_WORDS = frozenset("""
no not never nor none nothing nobody neither without
may might can could would should must will shall
some many much more most less least few fewer several all each every both any either other another
same such only also too even very quite rather just still again once twice thrice almost nearly
about around approximately ago soon now then later earlier already yet always often sometimes
usually formerly recently eventually finally before after during since until till while when
whenever where within throughout because although though if unless whether so therefore thus hence
or but against despite except instead
""".split())

# The plural of a counting unit ("hundreds", "decades", "years") states a count the
# text does not give, so it is never reduced to the singular; "a decade" and
# "decades" say different things.
_COUNT_UNITS = frozenset(NUMBER_WORDS | set(_MULTIPLES) |
                         {"billion", "year", "month", "week", "day", "hour", "minute", "time"})
_UNDOUBLE_KEEP = set("aeiouylsfz")  # "fill", "pass", "staff", "buzz" keep their double letter


def _undouble(stem):
    """'stopp' -> 'stop', 'admitt' -> 'admit' (the consonant doubled before -ed/-ing)."""
    if len(stem) >= 4 and stem[-1] == stem[-2] and stem[-1] not in _UNDOUBLE_KEEP:
        return stem[:-1]
    return stem


def stem(word):
    """Light deterministic stem of one folded word: regular English inflections only.

    -ies/-ied -> y ("studies", "studied" -> "study"); -es after s, x, z, ch, sh;
    -s (not -ss, -us, -is), and then -ing ("buildings" meets "building"); -ed and -ing (keeping a stem of 3+ letters, undoing a
    doubled consonant); then a final -e on a stem of 5+ letters ("arrive" ->
    "arriv"), so "arrive", "arrives", "arrived" and "arriving" meet. Irregular forms
    ("taught") and derivations ("citizenship") are not joined: no lemma or synonym
    table. Short words (3 letters or fewer) and words with an apostrophe ("don't")
    are left alone, and the e-rule's 5-letter floor keeps "note" from becoming "not".
    """
    w = word
    if len(w) <= 3 or not w.isalpha():
        return w
    if (w.endswith("s") and w[:-1] in _COUNT_UNITS) or (w.endswith("ies") and w[:-3] + "y" in _COUNT_UNITS):
        return w
    if w.endswith(("ies", "ied")) and len(w) > 4:
        w = w[:-3] + "y"
    elif w.endswith(("sses", "shes", "ches", "xes", "zes")):
        w = w[:-2]
    elif w.endswith("s") and not w.endswith(("ss", "us", "is")):
        w = w[:-1]
        if w.endswith("ing") and len(w) - 3 >= 3:
            w = _undouble(w[:-3])  # "buildings" -> "build", as "building" does
    elif w.endswith("ed") and len(w) - 2 >= 3:
        w = _undouble(w[:-2])
    elif w.endswith("ing") and len(w) - 3 >= 3:
        w = _undouble(w[:-3])
    if w.endswith("e") and len(w) >= 5:
        w = w[:-1]
    return w


@dataclass
class Content:
    """The content tokens of one text. Every kind must be covered by the support."""
    dates: list          # DateMatch, compared after parsing (June 10, 1941 == 1941-06-10; "May" alone)
    numbers: list        # canonical strings: "13" for 13, thirteen, 13th; "6" for half a dozen
    decades: list        # 1950 for 1950s or the nineteen-fifties
    short_decades: list  # 50 for "the fifties" (century not stated)
    codes: list          # folded tokens mixing letters and digits ("us2292387a")
    words: list          # comparison keys of the content words, in order (word_key())
    written: list        # each content word as written, for messages (parallel to words)
    ages: list = field(default_factory=list)      # ("forties", 40) for "in his forties"
    symbols: list = field(default_factory=list)   # meaning-bearing symbols, "-" for a minus sign
    grouped: set = field(default_factory=set)     # numbers written with separators ("2,292,387")


def word_key(folded):
    """Comparison key of one folded content word: "=" + the word for a closed-class word
    (matched only by itself), else its stem. Case never changes the key: "PATENTS" is "patents"."""
    return "=" + folded if folded in CLOSED_CLASS_WORDS else stem(folded)


def word_keys(text):
    """[(as written, key)] for one word token, hyphenated parts split, function words dropped."""
    out = []
    for part in [p for p in text.split("-") if p]:
        tok = Token(part, 0, len(part))
        folded = tok.folded
        if not folded:
            continue
        if folded in FUNCTION_WORDS:
            if tok.acronym:
                out.append((part, folded.upper()))  # "US" (country) is not "us" (pronoun)
            continue
        out.append((part, word_key(folded)))
    return out


def content_tokens(text):
    """Content of one text: dates, numbers, decades, codes and content words.

    NFKC, quotes, apostrophes and dashes are unified (prepare()); dates and numbers
    are parsed to canonical forms by the parsers above; the remaining words are
    casefolded, stripped of accents and a possessive 's, split at hyphens, stemmed
    (stem()), and dropped only when they are FUNCTION_WORDS.
    """
    a = analyze(text if isinstance(text, str) else "")
    located = [(tok.start, pair) for tok in a.tokens for pair in word_keys(tok.text)]
    located += [(start, (written, key)) for start, written, key in a.implied]
    pairs = [pair for _, pair in sorted(located, key=lambda x: x[0])]
    return Content(dates=a.dates, numbers=a.numbers, decades=a.decades, short_decades=a.short_decades,
                   codes=a.codes, words=[k for _, k in pairs], written=[w for w, _ in pairs],
                   ages=a.ages, symbols=a.symbols, grouped=a.grouped)


# --- quotations (G6) -----------------------------------------------------------------------

_DOUBLE_SPAN = re.compile(r'"([^"]+)"')
# A single-quoted span opens after a non-word character and closes before one; an
# apostrophe between two letters ("It's") stays inside, so "Einstein's" opens nothing.
_SINGLE_SPAN = re.compile(r"(?<![\w'])'((?:[^']|(?<=\w)'(?=\w))+?)'(?!\w)")


def quoted_spans(text):
    """Every quotation in text, in any style (straight or curly, single or double,
    guillemets, CJK corner brackets; prepare() unifies them)."""
    t = prepare(str(text or ""))
    spans = [m.group(1) for m in _DOUBLE_SPAN.finditer(t)]
    for m in _SINGLE_SPAN.finditer(_DOUBLE_SPAN.sub(lambda d: " " * len(d.group(0)), t)):
        spans.append(m.group(1))
    spans.extend(m.group(1) for d in _DOUBLE_SPAN.finditer(t) for m in _SINGLE_SPAN.finditer(d.group(1)))
    return spans


# --- names (aliases) ------------------------------------------------------------------------

# Lowercase words a personal name may contain besides function words ("Ludwig van Beethoven").
NAME_PARTICLES = frozenset("""
von van de der den del della delle di da das dos du la le les zu zur ten ter bin ibn al el y e
""".split())


def is_capitalized(word):
    """True for "Persona", "O'Brien", "d'Alembert", "McCarthy" (a capital after an optional
    one- or two-letter elided prefix)."""
    w = re.sub(r"^[a-z]{1,2}'", "", word)
    return bool(w) and w[0].isupper()


def name_problem(text):
    """Why text is not a personal name, else None.

    A name holds only words: no date, number, decade, age, code or symbol, and every
    content word capitalized unless it is a name particle ("van", "de"). Aliases supply
    name words to G2/G6, so this keeps a phrase ("for 13 years") from posing as one.
    """
    if not isinstance(text, str) or not text.strip():
        return "it is empty"
    a = analyze(text)
    kinds = [kind for kind, found in (("a date", a.dates), ("a number", a.numbers),
                                      ("a decade", a.decades or a.short_decades or a.ages),
                                      ("a code", a.codes), ("a symbol", a.symbols)) if found]
    if kinds:
        return f"it contains {', '.join(kinds)}"
    lower = [tok.text for tok in a.tokens for part, _ in word_keys(tok.text)
             if not is_capitalized(part) and fold_token(part) not in NAME_PARTICLES]
    if lower:
        return f"it contains words that are not name words: {', '.join(lower)}"
    return None


def name_words(text):
    """[(key, capitalized)] for the content words of a name, for G2/G6 name matching.
    Only words: a name supplies no date, number, code or symbol."""
    out = []
    for m in WORD_RE.finditer(prepare(text if isinstance(text, str) else "")):
        for part, key in word_keys(m.group(0)):
            out.append((key, is_capitalized(part)))
    return out
