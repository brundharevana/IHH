// The guide's lines on the landing. Every line is a whole sentence (or two) from
// shared/guide/lines.json, which the audio build also reads, so each line has one pre-rendered
// clip per guide voice: nothing is stitched mid-sentence. The picker never says the same line
// twice in a row for a kind. Copy is about the visit only; it makes no claims about the inductee.
import LINES from '../shared/guide/lines.json'

const { offer: OFFER, decline: DECLINE, greeting: GREETING } = LINES.landing

const last = new Map()

// one entry from list, never the previous pick of this kind (when there is a choice)
function pickFresh(kind, list, rand) {
  const prev = last.get(kind)
  const pool = list.length > 1 ? list.filter((o) => o !== prev) : list
  const o = pool[Math.floor(rand() * pool.length) % pool.length]
  last.set(kind, o)
  return o
}

const whole = (text) => ({ text, parts: [text] })

export const fillLine = (tpl, inductee) =>
  tpl.replace('{n}', inductee.name).replace('{pos}', LINES.pronouns[inductee.slug] || 'their')

// inductee: { slug, name }
export function offerLine(inductee, rand = Math.random) {
  return whole(fillLine(pickFresh('offer', OFFER, rand), inductee))
}

export function declineLine(rand = Math.random) {
  return whole(pickFresh('decline', DECLINE, rand))
}

export function greetingLine(rand = Math.random) {
  return whole(pickFresh('greet', GREETING, rand))
}

// test hook: forget remembered picks
export function _resetPhrases() {
  last.clear()
}
