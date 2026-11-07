// The number rule for displayed copy (Task 19, Codex re-reviews): every number, date or measurement a
// visitor reads must be stated by what THAT piece of copy cites, about the same thing:
//   - grounds: the claims of the verified facts the item cites, and the verified, cleared records the
//     item itself cites (title, alt text, credit and the holder's words in its saved sources); never a
//     pool of other records. A modelling reference (not verified and cleared) grounds nothing.
//   - a number keeps its whole value and unit: 1.2 m is not 2.1 m, 34 m is not 34 years.
//   - a number is bound to its own phrase in the copy (the content words within PHRASE tokens of it,
//     in its clause): one clause of a ground must state the same number and contain every one of those
//     words. "The college was built in 1887" is not grounded by "In 1887 he entered the college".
//   - catalogue numbers are identifiers, not quantities, but only in the precise forms the holders use
//     (ID_PATTERNS); any other letter-and-digit string is checked like a number.
// The rule checks numbers only, lexically. Whether the non-numeric words of a label are true is not
// checked by code; app/README.md and data/export/METHOD.md say so.

// copy a visitor reads; identifiers, links, file paths and camera numbers are not copy
export const SHOWN = ['title', 'label', 'labelText', 'labelFallback', 'note', 'placeNote', 'name', 'eyebrow', 'text', 'date', 'alt', 'caption', 'recreation', 'recreationNote', 'subtitle', 'place']

// holders' catalogue and listing numbers, each in its exact form
export const ID_PATTERNS = [
  /\bNAID \d{5,10}\b/g, // National Archives identifier
  /\bLoC \d{8,10}\b/g, // Library of Congress item
  /\bLC-[A-Z]{2,5}\d*-\d{3,6}\b/g, // LoC reproduction number (LC-USZ62-60242)
  /\bMP-\d{4}\.\d{1,4}\.\d{1,3}\b/g, // McCord Stewart Museum
  /\bII-\d{5,6}\b/g, // McCord Stewart Museum, Notman archive
  /\bRG \d{1,3}\/\d{1,3}\b/g, // a record group and series (KU University Archives)
  /\bLC-[A-Z]{2}\d{2}-\d{4}\b/g, // LoC call number (LC-GB05-5929)
  /\bLB\d{4,6}\b/g, // Historic Environment Scotland listed building
  /\bS\d{5}\b/g, // UW-Madison Archives
  /\bWHi \d{4,6}\b/g, // Wisconsin Historical Society
  /\bRL_\d{4,6}\b/g, // NPGallery (Yosemite)
  /\bGhmF:\d{1,6}\b/g, // Göteborgs stadsmuseum
  /\bWHPO-P\d{5}\b/g, // White House Photograph Office roll
  /\b(?:U\.S\. )?Patent (?:No\. )?\d,\d{3},\d{3}\b/g, // a patent number
  /\b\d{2}-[A-Z]-\d{4,6}\b/g, // NARA still picture series number (80-G-42918)
  /\bIAS E \d{1,4}\b/g, // Institute for Advanced Study archives
  /\bCC(?:0|(?: BY(?:-(?:SA|NC|ND))*)(?: \d\.\d)?)(?![\w.])/g, // a Creative Commons licence (CC0, CC BY 4.0)
]

const WORDS = { two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90, hundred: 100, thousand: 1000 }
const UNIT = /^\s*-?\s*(m|metres?|meters?|ft|feet|foot|km|kilometres?|miles?|cm|mm|kg|tons?|years?|storeys?|stories|floors?|rows?|%|percent)\b/i
const STOP = new Set('this that with from were was have has had been their there they them then than into onto upon over under about after before here where when which while what also only more most some such these those other each very just like same both does done photograph photographed recreation based shown chapter place view around later early first last years year page pages image images record records'.split(' '))

export const stripIds = (t) => ID_PATTERNS.reduce((s, re) => s.replace(re, ' '), String(t ?? ''))

const unitAfter = (t, end) => (UNIT.exec(t.slice(end)) || [])[1]?.toLowerCase().replace(/s$/, '') || null

// a number keeps its whole value: "1,200" is 1200, "1.2 m" is 1.2 m (never 1 and 2)
const TOKEN = /\d+(?:,\d{3})*(?:\.\d+)?|[a-z][a-z'’-]*/gi
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const MONTH = Object.fromEntries([...MONTHS.map((m, i) => [m, i + 1]), ...MONTHS.map((m, i) => [m.slice(0, 3), i + 1]), ['sept', 9]])
const normWord = (w) => {
  const x = w.toLowerCase().replace(/[’']s$/, '').replace(/[’'-]+$/, '')
  return MONTH[x] && x !== 'may' && x !== 'mar' ? MONTHS[MONTH[x] - 1] : x
}
const isContent = (w) => /^[a-z][a-z'-]{3,}$/.test(w) && !STOP.has(w) && !(w in WORDS)
const MONTH_RE = '(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|apr|jun|jul|aug|sept|sep|oct|nov|dec)\\.?'

const prep = (text) =>
  stripIds(text)
    .replace(/\b3D\b/g, ' ')
    .replace(/(?<![\d-])(\d{2})(\d{2})\s?[-–]\s?(\d{2})(?![\d-])/g, '$1$2-$1$3')

// the dates in a text, by the character offset of their numbers: a year (1000-2100, no unit), or a day
// with its month ("October 18", "18 October", "1940 Oct. 18", "1997-02-22", "8/2/1939")
function dateMarks(t) {
  const at = new Map()
  for (const m of t.matchAll(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/g)) at.set(m.index, { month: Number(m[1]) }).set(m.index + m[1].length + 1, { day: `${Number(m[1])}-${Number(m[2])}` })
  for (const m of t.matchAll(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/g)) {
    const mo = Number(m[2])
    at.set(m.index + m[1].length + 1, { month: mo })
    at.set(m.index + m[1].length + m[2].length + 2, { day: `${mo}-${Number(m[3])}` })
  }
  for (const m of t.matchAll(new RegExp(`\\b${MONTH_RE}\\s+(\\d{1,2})(?![\\d,]*\\d{3})\\b`, 'gi'))) at.set(m.index + m[0].length - m[2].length, { day: `${MONTH[m[1].toLowerCase()]}-${Number(m[2])}` })
  for (const m of t.matchAll(new RegExp(`\\b(\\d{1,2})\\s+${MONTH_RE}(?![a-z])`, 'gi'))) at.set(m.index, { day: `${MONTH[m[2].toLowerCase()]}-${Number(m[1])}` })
  return at
}

// the tokens of a text, ids removed ("1977-81" reads 1977 and 1981; "3D" is not a number):
// [{ s, w } | { s, num: { n, unit, word, date } }]
function tokens(text) {
  const t = prep(text)
  const marks = dateMarks(t)
  return [...t.matchAll(TOKEN)].map((m) => {
    const s = m[0]
    const end = m.index + s.length
    if (/^\d/.test(s)) {
      const n = Number(s.replace(/,/g, ''))
      const unit = unitAfter(t, end)
      const mark = marks.get(m.index)
      const date = mark?.day ? { day: mark.day } : mark?.month ? { month: true } : !unit && /^\d{4}$/.test(s) && n >= 1000 && n <= 2100 ? { year: n } : null
      return { s, num: { n, unit, date } }
    }
    const w = normWord(s)
    if (WORDS[w] != null) return { s, num: { n: WORDS[w], unit: unitAfter(t, end), word: true } }
    return { s, w }
  })
}

// [{ n, unit, word, date }] for every number in a text
export const numbersWithUnits = (text) => tokens(text).filter((x) => x.num).map((x) => x.num)
export const numbersIn = (text) => numbersWithUnits(text).filter((x) => !x.word).map((x) => x.n)

// sentences, not split after an abbreviation ("U.S.", "Dr.", "c.")
const ABBREV = /(?:\b(?:[A-Z]\.){1,3}|\b(?:Dr|St|Mr|Mrs|Ms|No|Jr|Sr|Prof|Rev|Co|Inc|Ltd|ca|c|Wm|Ont|Calif|Conn|Mass|Oct|Nov|Dec|Jan|Feb|Aug|Sept|Sep)\.)$/
const sentences = (text) => {
  const out = []
  for (const part of String(text ?? '').split(/(?<=[.;!?])\s+|\s+·\s+|\n+/)) {
    if (out.length && ABBREV.test(out[out.length - 1])) out[out.length - 1] += ` ${part}`
    else out.push(part)
  }
  return out.filter((s) => s.trim())
}
// a clause: a sentence cut at ; : ( ) and dashes, never at a comma ("May 17, 1943")
const clauses = (text) => sentences(text).flatMap((s) => s.split(/\s*[;:()—]\s*|\s+[–-]{1,2}\s+/)).filter((c) => c.trim())

// the number's own phrase: the content words within PHRASE tokens of it, in its clause
export const PHRASE = 4
function numbersInContext(clause) {
  const tk = tokens(clause)
  const words = new Set(tk.filter((x) => x.w && isContent(x.w)).map((x) => x.w))
  const nums = []
  tk.forEach((x, k) => {
    if (!x.num) return
    const near = new Set()
    for (let j = Math.max(0, k - PHRASE); j <= Math.min(tk.length - 1, k + PHRASE); j++) if (tk[j].w && isContent(tk[j].w)) near.add(tk[j].w)
    // the thing the number counts or measures: the word right after it (after its unit, if any),
    // else the word right before it; a date has none (its month and year bind it)
    let subject = null
    if (!x.num.date) {
      const after = tk[k + (x.num.unit ? 2 : 1)]
      const before = tk[k - 1]
      subject = after?.w && isContent(after.w) ? after.w : before?.w && isContent(before.w) ? before.w : null
    }
    nums.push({ ...x.num, near, subject })
  })
  return { nums, words }
}

// a holder's date field for the record itself in its saved page ("Date ca. 1885", "date: 1904-01-01",
// "created_published_date: [between 1908 and 1928]", NARA "productionDates[0].logicalDate: 1993-04-20");
// nothing else on that page is a date of the record
const DATE_FIELD = /\b(?:Date|date|created_published_date|Created\/Published|productionDates\[\d+\]\.logicalDate)\s*:?\s*\[?(?:ca\.\s*|c\.?\s*|circa\s+|about\s+|between\s+)?\d{4}(?:-\d{2}-\d{2}|\s+and\s+\d{4})?\]?/g

// the dates a record gives for itself: those in its own title, alt text and credit, and its holder's
// date fields
// the date marks of one text (a title, or a holder's saved page: hundreds of KB of OCR), found once
const DATE_CACHE = new Map()
function textDates(text, fieldsOnly) {
  const k = `${fieldsOnly ? 's' : 'o'}${text}`
  let hit = DATE_CACHE.get(k)
  if (hit) return hit
  hit = []
  for (const f of fieldsOnly ? text.match(DATE_FIELD) || [] : [text])
    for (const x of numbersWithUnits(f)) if (x.date?.year) hit.push(`y${x.date.year}`)
    else if (x.date?.day) hit.push(`d${x.date.day}`)
  DATE_CACHE.set(k, hit)
  return hit
}
function recordDates(record) {
  const out = new Set()
  for (const t of record.own || []) for (const d of textDates(String(t), false)) out.add(d)
  for (const t of record.sources || []) for (const d of textDates(String(t), true)) out.add(d)
  return out
}

// [{ path, text, missing }] for one item: its strings against its own grounds, { facts, records }:
// - facts: the claims of the verified facts the item cites;
// - records: the verified, cleared records the item itself cites, never a pool of other records:
//   { own: [title, alt text, credit], sources: [the holder's words in its saved sources] } (a plain
//   string counts as `own`).
// A displayed number is grounded when
// - one clause of a ground states the same number (and, when the copy gives a unit, the same unit; for a
//   day, the same month; for a count or measurement, the same subject: the word the number counts or
//   measures, so "8 windows and 12 doors" is not grounded by "12 windows and 8 doors") and
//   contains every content word of the number's own phrase in the copy: "The college was built in
//   1887" (phrase: college, built) is not grounded by "In 1887 he entered the college" (no "built"); or
// - it is a date (a year, or a day with its month) that a cited record gives for itself: copy that
//   cites a record may give that record's date ("The meadow, 1923" for a photograph of 1923).
// A ground's clauses with their numbers in context, parsed once per text: a holder's saved page (a
// scanned journal issue's OCR runs to hundreds of KB) grounds every item that cites its record, and the
// parse is a pure function of the text.
const GROUND_CACHE = new Map()
const groundContexts = (text) => {
  let hit = GROUND_CACHE.get(text)
  if (!hit) GROUND_CACHE.set(text, (hit = clauses(text).map(numbersInContext)))
  return hit
}

export function ungroundedItem(strings, grounds) {
  const { facts = [], records = [] } = Array.isArray(grounds) ? { facts: grounds } : grounds
  const recs = records.map((r) => (typeof r === 'string' ? { own: [r], sources: [] } : r))
  const gs = [...facts, ...recs.flatMap((r) => [...r.own, ...(r.sources || [])])].flatMap((t) => groundContexts(String(t ?? '')))
  const dates = new Set(recs.flatMap((r) => [...recordDates(r)]))
  const out = []
  for (const str of strings) {
    const missing = []
    for (const cl of clauses(str.text)) {
      for (const x of numbersInContext(cl).nums) {
        if (x.date?.month) continue // the month of an ISO date is its name
        const ok =
          (x.date?.year && dates.has(`y${x.date.year}`)) ||
          (x.date?.day && dates.has(`d${x.date.day}`)) ||
          gs.some((g) => g.nums.some((y) => y.n === x.n && (!x.unit || y.unit === x.unit) && (!x.date?.day || y.date?.day === x.date.day) && (!x.subject || y.subject === x.subject)) && [...x.near].every((w) => g.words.has(w)))
        if (!ok) missing.push(x.unit ? `${x.n} ${x.unit}` : x.n)
      }
    }
    if (missing.length) out.push({ ...str, missing: [...new Set(missing)] })
  }
  return out
}

// [{ path, text }] of the copy in an object, not descending into `skip` keys
export function shownStrings(obj, path = '', skip = new Set()) {
  const out = []
  if (Array.isArray(obj)) obj.forEach((x, i) => out.push(...shownStrings(x, `${path}[${i}]`, skip)))
  else if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      if (skip.has(k)) continue
      if (typeof v === 'string' && SHOWN.includes(k)) out.push({ path: `${path}.${k}`, text: v })
      else if (v && typeof v === 'object') out.push(...shownStrings(v, `${path}.${k}`, skip))
    }
  }
  return out
}

// every fact id cited anywhere inside an object
export function citedFacts(obj, acc = new Set()) {
  if (Array.isArray(obj)) obj.forEach((x) => citedFacts(x, acc))
  else if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      if ((k === 'factIds' || k === 'facts') && Array.isArray(v)) v.forEach((f) => typeof f === 'string' && acc.add(f))
      else if (k === 'factId' && typeof v === 'string') acc.add(v)
      else citedFacts(v, acc)
    }
  }
  return acc
}
