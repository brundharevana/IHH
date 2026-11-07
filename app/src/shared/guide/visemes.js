// Caption text -> the 15 Oculus visemes the Rocketbox heads carry (AA_VI_00_Sil .. AA_VI_14_U).
// Letters are mapped one by one (digraphs first; spaces and punctuation are short closures).
// Approximate, but the mouth moves through closed (PP), teeth (FF, TH) and the vowel shapes instead
// of flapping the jaw. Production plan: phoneme-aligned visemes generated offline per clip.

export const VISEMES = ['sil', 'PP', 'FF', 'TH', 'DD', 'kk', 'CH', 'SS', 'nn', 'RR', 'aa', 'E', 'I', 'O', 'U']

export const VISEME_MORPH = Object.fromEntries(
  VISEMES.map((v, i) => [v, `AA_VI_${String(i).padStart(2, '0')}_${v === 'sil' ? 'Sil' : v === 'kk' ? 'KK' : v}`]),
)

export function toUnits(text) {
  const t = (text || '').toLowerCase()
  const out = []
  for (let i = 0; i < t.length; i++) {
    const two = t.slice(i, i + 2)
    if (two === 'th') { out.push('TH'); i++; continue }
    if (two === 'ch' || two === 'sh') { out.push('CH'); i++; continue }
    if (two === 'ee' || two === 'ea') { out.push('I'); i++; continue }
    if (two === 'oo' || two === 'ou') { out.push('U'); i++; continue }
    const c = t[i]
    if ('aeiouy'.includes(c)) out.push({ a: 'aa', e: 'E', i: 'I', o: 'O', u: 'U', y: 'I' }[c])
    else if ('pbm'.includes(c)) out.push('PP')
    else if ('fv'.includes(c)) out.push('FF')
    else if ('td'.includes(c)) out.push('DD')
    else if ('kgcqx'.includes(c)) out.push('kk')
    else if ('szj'.includes(c)) out.push(c === 'j' ? 'CH' : 'SS')
    else if ('nl'.includes(c)) out.push('nn')
    else if (c === 'r') out.push('RR')
    else if (c === 'w') out.push('U')
    else if (c === 'h') out.push('E')
    else if (/[0-9]/.test(c)) out.push(['aa', 'E', 'nn', 'O'][Number(c) % 4]) // numbers are read aloud
    else out.push('sil')
  }
  return out.length ? out : ['sil']
}

// the unit at progress p (0..1) through a caption
export function unitAt(units, p) {
  return units[Math.min(units.length - 1, Math.max(0, Math.floor(p * units.length)))]
}
