// The guide's own wayfinding words in a room (never facts about the inductee; those come from the
// narration lines tied to verified facts). Words: shared/guide/lines.json, one whole line per clip
// (the audio build renders each line per guide voice): tour.rooms.<room id> for each recreated room,
// the tour-level lists for Einstein's study. Each object has a few intro lines; the picker never
// repeats the line it used last time for that object and avoids starting two lines in a row with
// the same word, so the guide does not fall into a stock phrase.
// Each line is { text, parts }: the speaker plays the parts' clips in sequence (here one part).
import LINES from '../shared/guide/lines.json'

const TOUR = LINES.tour

const whole = (text) => ({ text, parts: [text] })
const firstWord = (s) => s.split(/[\s,]/)[0].toLowerCase()

export function createPhrasebook(roomId, rand = Math.random) {
  const own = TOUR.rooms?.[roomId]
  const ARRIVALS = own?.arrivals || TOUR.arrivals
  const INTROS = own?.intros || TOUR.intros
  const NUDGES = own?.nudges || TOUR.nudges
  const DONE = TOUR.done
  const used = new Map() // kind -> last line
  let lastStart = null
  const nudged = []

  function pick(kind, list) {
    const prev = used.get(kind)
    let pool = list.filter((l) => l !== prev && firstWord(l) !== lastStart)
    if (!pool.length) pool = list.filter((l) => l !== prev)
    if (!pool.length) pool = list
    const l = pool[Math.floor(rand() * pool.length) % pool.length]
    used.set(kind, l)
    lastStart = firstWord(l)
    return l
  }

  return {
    // invite: prefer a line that asks the visitor to look (or walk) around, if the room has one
    arrival({ invite = false } = {}) {
      const asks = invite ? ARRIVALS.filter((l) => /\b(look|walk) around\b/i.test(l)) : []
      return whole(pick('arrival', asks.length ? asks : ARRIVALS))
    },
    // a stop's own intro; with none, an error in development and tests, and nothing said in production (never another
    // stop's intro: Codex review 2; check_narration requires one per stop)
    intro(id) {
      if (INTROS[id]?.length) return whole(pick(`intro:${id}`, INTROS[id]))
      if (import.meta.env.DEV) throw new Error(`no intro for the stop ${id} in ${roomId || 'the study'}`)
      return null
    },
    // Nudge toward something not yet seen; rotates through the unseen ones.
    nudge(unseenIds) {
      if (!unseenIds.length) return whole(pick('done', DONE))
      const fresh = unseenIds.filter((id) => !nudged.includes(id))
      const id = (fresh.length ? fresh : unseenIds)[0]
      nudged.push(id)
      if (NUDGES[id]?.length) return whole(pick(`nudge:${id}`, NUDGES[id]))
      if (import.meta.env.DEV) throw new Error(`no nudge for the stop ${id} in ${roomId || 'the study'}`)
      // (production: nothing is said, never a stand-in line: Codex review 3)
      return null
    },
    done: () => whole(pick('done', DONE)),
  }
}
