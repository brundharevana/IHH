import { test, expect } from 'vitest'
import { INDUCTEES } from '../data/index.js'
import index from '../data/facts.generated.json'
import tourUse from '../data/tour-use.generated.json'
import { buildQuiz, score } from './quiz.js'
import { QUESTIONS } from './questions.js'
import { END_LINKS, placeholders } from './links.js'

const tours = Object.values(INDUCTEES)
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
// whole words, case-insensitive: "ten" is in "ten-year-old" but not in "often"
const says = (claim, text) => new RegExp(`(?<![\\w])${esc(text)}(?![\\w])`, 'i').test(claim)

// the facts a visitor meets in a chapter: the ones its panels, records and narration print or speak
// (every nested factIds list in the exported chapter), and the fact that states the chapter's year
function shownFacts(slug, chapterId) {
  const c = tourUse.tours[slug].chapters.find((x) => x.id === chapterId)
  const acc = new Set()
  const walk = (o) => {
    if (Array.isArray(o)) o.forEach(walk)
    else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) k === 'factIds' ? v.forEach((id) => acc.add(id)) : walk(v)
  }
  for (const [k, v] of Object.entries(c)) if (k !== 'factIds') walk(v)
  const yearFact = INDUCTEES[slug].chapters.find((x) => x.id === chapterId).yearFact
  return acc.add(yearFact)
}

test('every inductee has five written questions', () => {
  for (const t of tours) {
    expect(QUESTIONS[t.slug], t.slug).toHaveLength(5)
    expect(buildQuiz(t, index), t.slug).toHaveLength(5)
  }
})

test('every question is a full sentence ending in a question mark, with no template text', () => {
  for (const t of tours) {
    for (const q of QUESTIONS[t.slug]) {
      expect(q.prompt, q.id).toMatch(/^[A-Z].{20,}\?$/)
      expect(q.prompt, q.id).not.toMatch(/: [A-Z][a-z]+ [a-z]/) // "In which year: Becoming a citizen?"
      expect(q.prompt, q.id).not.toMatch(/Which happened first|Which stop/)
    }
  }
})

test('every question rests on a verified fact shown in its own chapter of the tour', () => {
  for (const t of tours) {
    for (const q of QUESTIONS[t.slug]) {
      expect(index.facts[q.factId], `${t.slug} ${q.id}`).toBeTruthy()
      expect(index.facts[q.factId].slug, `${t.slug} ${q.id}`).toBe(t.slug)
      expect(t.chapters.some((c) => c.id === q.chapter), `${t.slug} ${q.id} chapter`).toBe(true)
      expect(shownFacts(t.slug, q.chapter).has(q.factId), `${t.slug} ${q.id}: ${q.factId} is not shown in ${q.chapter}`).toBe(true)
    }
  }
})

test('the answer is in the fact word for word, and no other option is', () => {
  for (const t of tours) {
    for (const q of QUESTIONS[t.slug]) {
      const claim = index.facts[q.factId].claim
      expect(q.options, q.id).toContain(q.answer)
      expect(says(claim, q.answer), `${q.id}: "${q.answer}" not in "${claim}"`).toBe(true)
      for (const o of q.options.filter((x) => x !== q.answer)) expect(says(claim, o), `${q.id}: "${o}" is also in the claim`).toBe(false)
    }
  }
})

// The question adds nothing to its fact (the G2 "nothing added" rule, applied to the prompt): every word
// of the prompt is a word of the claim, a word of the inductee's name, or a question word. Words are
// compared lowercased, without a possessive 's, split at hyphens and commas inside numbers kept, with
// only regular -s/-es/-ed/-ing endings dropped. No synonyms: "city" is not supported by "Belgrade".
// "year" is a question word only when the claim states a year. Relation words (prepositions, "and")
// carry meaning by what they join, so each must also stand in the claim next to the same word: the word
// after it, or the word before it at the end (articles skipped). "arrive from New York" fails against
// "arrived in New York". One directly before a question word ("In which year", "On which liner") stands
// for the asked slot: the claim must use it too. Pronouns are not question words: a prompt names the
// person or uses the claim's own pronoun.
const QUESTION_WORDS = new Set(['which', 'what', 'who', 'whom', 'where', 'when', 'how', 'many', 'did', 'do', 'does', 'was', 'were', 'is', 'the', 'a', 'an'])
const ARTICLES = new Set(['the', 'a', 'an'])
const RELATION_WORDS = new Set(['of', 'in', 'on', 'at', 'to', 'for', 'by', 'with', 'from', 'as', 'into', 'before', 'after', 'across', 'until', 'during', 'about', 'and'])
// irregular past tenses of verbs the claims use: the same word in another form, not added content
const IRREGULAR = { wrote: 'write', met: 'meet', became: 'become', left: 'leave' }
const stem = (w0) => {
  const w = IRREGULAR[w0] || w0.replace(/'s$/, '').replace(/ied$/, 'y')
  return (w.replace(/(ing|ed|es|s)$/, '') || w).replace(/(.{3,})e$/, '$1')
}
const words = (text) => text.toLowerCase().replace(/[‘’]/g, "'").match(/\d[\d,]*\d|\d|[a-z']+/g).map((w) => w.replace(/^'+|'+$/g, '')).filter(Boolean)
function addedWords(prompt, claim, name) {
  const nameStems = new Set(words(name).map(stem))
  const have = new Set([...words(claim).map(stem), ...nameStems])
  const yearOk = /\b\d{4}\b/.test(claim)
  const added = words(prompt).filter((w) => !QUESTION_WORDS.has(w) && !(w === 'year' && yearOk) && !have.has(stem(w)))
  // relation words: the same neighbour in the claim (any of the person's name words counts as one name)
  const key = (w) => (nameStems.has(stem(w)) ? '<name>' : stem(w))
  const bare = (text) => words(text).filter((w) => !ARTICLES.has(w)).map(key)
  const c = bare(claim)
  const pairs = new Set(c.slice(1).map((w, i) => `${c[i]} ${w}`))
  const p = bare(prompt)
  const raw = words(prompt).filter((w) => !ARTICLES.has(w))
  p.forEach((w, i) => {
    if (!RELATION_WORDS.has(raw[i])) return
    const next = raw[i + 1]
    if (next && QUESTION_WORDS.has(next)) {
      if (!c.includes(w)) added.push(`"${w} ${next}"`)
      return
    }
    const pair = next ? `${w} ${p[i + 1]}` : i > 0 ? `${p[i - 1]} ${w}` : null
    if (!pair || !pairs.has(pair)) added.push(`"${pair || w}"`)
  })
  return added
}

// What these checks prove, and what they do not: they hold each prompt to the claim's words and the
// question word to the kind of answer, so an added word, a changed relation or a swapped question word
// fails. Words cannot prove meaning; that each question is right is checked by the independent
// cross-model fact check of all 25 (as the fact pipeline pairs its word gate with an adversary).
test('every question uses only its fact\'s words', () => {
  const problems = []
  for (const t of tours) {
    for (const q of QUESTIONS[t.slug]) {
      const added = addedWords(q.prompt, index.facts[q.factId].claim, t.name)
      if (added.length) problems.push(`${t.slug} ${q.id}: "${q.prompt}" adds ${added.join(', ')} to "${index.facts[q.factId].claim}"`)
    }
  }
  expect(problems).toEqual([])
})

// The kind of answer a question asks for, and the question words that ask for it. A year or a number is
// read from the answer itself; a person, place or thing is the question's `asks`.
const NUMBER_WORDS = /^(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|twenty|thirty)$/i
function answerKind(q) {
  if (/^\d{4}$/.test(q.answer)) return 'year'
  if (/^\d[\d,]*$/.test(q.answer) || NUMBER_WORDS.test(q.answer)) return 'number'
  return q.asks
}
const ASKS = {
  year: /\b(which|what) year\b|^when\b/i,
  number: /\bhow (many|old)\b/i,
  person: /\b(who|whom)\b/i,
  place: /\b(where|which|what)\b/i,
  thing: /\b(which|what)\b/i,
}
// question words that ask for another kind, and so may not appear ("when" asks for a time only at the
// start; inside a question it joins two clauses: "How old was he when leaving ...")
const NOT = {
  year: /\b(who|whom|where|how)\b/i,
  number: /\b(who|whom|where|year)\b|^when\b/i,
  person: /\b(where|how|year)\b|^when\b/i,
  place: /\b(who|whom|how|year)\b|^when\b/i,
  thing: /\b(who|whom|where|how|year)\b|^when\b/i,
}
function kindProblem(q) {
  const k = answerKind(q)
  if (!ASKS[k]) return `asks "${q.asks}" is not person, place or thing`
  if ((k === 'year' || k === 'number') && q.asks) return `a ${k} answer takes no asks`
  if (!ASKS[k].test(q.prompt)) return `a ${k} answer, but the question does not ask for one`
  if (NOT[k].test(q.prompt)) return `a ${k} answer, but the question asks for another kind (${q.prompt.match(NOT[k])[0]})`
  return null
}

test('every question word asks for the kind of answer it has', () => {
  const problems = []
  for (const t of tours) for (const q of QUESTIONS[t.slug]) { const p = kindProblem(q); if (p) problems.push(`${t.slug} ${q.id}: ${p}`) }
  expect(problems).toEqual([])
})

test('the kind check catches a swapped question word', () => {
  const ship = QUESTIONS.einstein.find((q) => q.id === 'arriving-ship')
  expect(kindProblem(ship)).toBeNull()
  // Codex review 3: "Where did ..." passes the word check but asks for a place, and Westernland is a liner
  const where = { ...ship, prompt: 'Where did Albert Einstein arrive in New York on October 17, 1933?' }
  expect(addedWords(where.prompt, index.facts[ship.factId].claim, 'Albert Einstein')).toEqual([])
  expect(kindProblem(where)).toMatch(/does not ask for one|another kind/)
  expect(kindProblem({ ...ship, prompt: 'Which liner did Albert Einstein arrive on, and who?' })).toMatch(/another kind \(who\)/)
  expect(kindProblem({ ...ship, asks: undefined })).toMatch(/not person, place or thing/)
  const year = QUESTIONS.albright.find((q) => q.id === 'citizen-year')
  expect(kindProblem({ ...year, prompt: 'How many did Madeleine Albright become a U.S. citizen?' })).toMatch(/does not ask|another kind/)
})

test('the prompt check catches an added word', () => {
  const claim = "Albright's father was a Czechoslovak diplomat in Belgrade before the Second World War."
  expect(addedWords("In which city was Madeleine Albright's father a Czechoslovak diplomat?", claim, 'Madeleine Albright')).toEqual(['city'])
  // a relation word joined to another word than in the claim reverses or changes it
  const arrived = 'On October 17, 1933, Einstein arrived in New York on the Red Star liner Westernland.'
  expect(addedWords('On which liner did Albert Einstein arrive in New York?', arrived, 'Albert Einstein')).toEqual([])
  expect(addedWords('On which liner did Albert Einstein arrive from New York?', arrived, 'Albert Einstein')).toEqual(['from', '"from new"'])
  expect(addedWords('On which liner did Albert Einstein arrive on New York?', arrived, 'Albert Einstein')).toEqual(['"on new"'])
  expect(addedWords("Where was Madeleine Albright's father a Czechoslovak diplomat?", claim, 'Madeleine Albright')).toEqual([])
  expect(addedWords('In which year did he arrive?', 'He left.', 'X')).toEqual(['in', 'year', 'arrive', '"in which"'])
})

test('three distinct options per question, and ids unique within a tour', () => {
  for (const t of tours) {
    for (const q of QUESTIONS[t.slug]) {
      expect(q.options, q.id).toHaveLength(3)
      expect(new Set(q.options.map((o) => o.toLowerCase())).size, q.id).toBe(3)
    }
    const ids = QUESTIONS[t.slug].map((q) => q.id)
    expect(new Set(ids).size, t.slug).toBe(ids.length)
  }
})

test('questions follow the tour order', () => {
  for (const t of tours) {
    const at = (q) => t.chapters.findIndex((c) => c.id === q.chapter)
    const order = QUESTIONS[t.slug].map(at)
    expect(order, t.slug).toEqual([...order].sort((a, b) => a - b))
  }
})

test('buildQuiz keeps the written text, points answer at the right option, and reveals the fact', () => {
  for (const t of tours) {
    const built = buildQuiz(t, index)
    QUESTIONS[t.slug].forEach((w, i) => {
      const q = built[i]
      expect(q.prompt).toBe(w.prompt)
      expect([...q.options].sort()).toEqual([...w.options].sort())
      expect(q.options[q.answer]).toBe(w.answer)
      expect(q.factIds).toEqual([w.factId])
      expect(q.reveal).toBe(index.facts[w.factId].claim)
    })
  }
})

test('right answers are spread over the three positions', () => {
  const all = tours.flatMap((t) => buildQuiz(t, index))
  const counts = [0, 1, 2].map((p) => all.filter((q) => q.answer === p).length)
  for (const c of counts) expect(c, JSON.stringify(counts)).toBeGreaterThanOrEqual(5)
})

test('the quiz is the same every time', () => {
  for (const t of tours) expect(buildQuiz(t, index)).toEqual(buildQuiz(t, index))
})

test('an unverified fact is refused', () => {
  const bad = { facts: { ...index.facts } }
  delete bad.facts[QUESTIONS.einstein[0].factId]
  expect(() => buildQuiz(INDUCTEES.einstein, bad)).toThrow(/not verified/)
})

test('the quiz asks only about the chapters shown in this visit', () => {
  for (const t of tours) {
    const all = buildQuiz(t, index)
    for (const c of t.chapters) {
      const visited = [c.id]
      const built = buildQuiz(t, index, visited)
      const want = QUESTIONS[t.slug].filter((q) => q.chapter === c.id).map((q) => q.id)
      expect(built.map((q) => q.id), `${t.slug} ${c.id}`).toEqual(want)
      // a question keeps its order of options whatever was visited
      for (const q of built) expect(q, `${t.slug} ${q.id}`).toEqual(all.find((x) => x.id === q.id))
    }
    // the visit that walked every chapter gets every question; no list means every chapter, an empty one none
    expect(buildQuiz(t, index, t.chapters.map((c) => c.id))).toEqual(all)
    expect(buildQuiz(t, index, [])).toEqual([])
  }
  // a visit that saw only a chapter without questions gets no quiz
  expect(buildQuiz(INDUCTEES.naismith, index, ['honoured'])).toEqual([])
})

test('a tour with no written questions gets no quiz', () => {
  expect(buildQuiz({ slug: 'lamarr-demo', chapters: [] }, index)).toEqual([])
})

test('score counts right picks and treats a skipped one as wrong', () => {
  const q = buildQuiz(INDUCTEES.einstein, index)
  expect(score(q, [q[0].answer, null, ...q.slice(2).map(() => null)])).toEqual({ right: 1, total: q.length })
})

test('placeholders lists the links still missing', () => {
  expect(placeholders()).toEqual(['feedbackUrl', 'feedbackQrImage', 'storyUrl'])
  expect(placeholders({ feedbackUrl: 'https://x', feedbackQrImage: null, storyUrl: null })).toEqual(['feedbackQrImage', 'storyUrl'])
  expect(END_LINKS).toEqual({ feedbackUrl: null, feedbackQrImage: null, storyUrl: null })
})
