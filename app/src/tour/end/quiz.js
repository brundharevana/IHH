// End-of-tour quiz: the hand-written questions in questions.js (five per inductee, each answered by a verified
// fact the visitor meets in the tour). Deterministic: no randomness.
import { QUESTIONS } from './questions.js'

// FNV-1a string hash: a fixed, well-spread number per key
const hash = (key) => [...key].reduce((h, ch) => Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0, 2166136261)

// The slot of the right answer for each of n questions of 3 options: every slot used about equally
// (0,1,2,0,1,...), then shuffled by a generator seeded with the tour slug, so the order is the same on
// every visit but has no visible pattern.
function answerSlots(slug, n, size = 3) {
  const slots = Array.from({ length: n }, (_, i) => i % size)
  let seed = hash(slug)
  const next = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0)
  for (let i = n - 1; i > 0; i--) {
    const j = next() % (i + 1)
    ;[slots[i], slots[j]] = [slots[j], slots[i]]
  }
  return slots
}

// Rotate the options so the answer (at index `answer`) lands in `slot`; the others keep their written order around it.
function rotate(options, answer, slot) {
  const shift = (slot - answer + options.length) % options.length
  return { options: options.map((_, i) => options[(i - shift + options.length) % options.length]), answer: slot }
}

// `visited`: the ids of the chapters shown in this visit (a visit can start mid-tour). The quiz asks only
// about those chapters (none for an empty list); about every chapter only when `visited` is not given.
// Answer slots are set over the whole written list, so a question's options keep one order.
export function buildQuiz(tour, index, visited = null) {
  const written = QUESTIONS[tour.slug] || []
  const slots = answerSlots(tour.slug, written.length)
  const seen = visited ? new Set(visited) : null
  return written.flatMap((w, i) => {
    const fact = index.facts[w.factId]
    if (!fact) throw new Error(`${tour.slug}: quiz fact ${w.factId} is not verified`)
    if (seen && !seen.has(w.chapter)) return []
    return [{
      id: w.id,
      kind: 'fact',
      prompt: w.prompt,
      ...rotate(w.options, w.options.indexOf(w.answer), slots[i]),
      factIds: [w.factId],
      reveal: fact.claim,
    }]
  })
}

export function score(questions, picks) {
  const right = questions.filter((q, i) => picks[i] === q.answer).length
  return { right, total: questions.length }
}
