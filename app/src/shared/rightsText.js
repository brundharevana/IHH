// The rights line a visitor reads (the record viewer's label, the landing's portrait and record credits): the record's
// rights words without the project's own notes on how it came to be shown. A record shown by an owner ruling keeps the
// ruling in its data (the *-artifacts.js rights words, records.lock.json, the provenance exports for IHH's chatbot,
// build_fact_index.py OWNER_RULED); only the line on screen leaves it out. Inside the parentheses the clauses are split
// at a semicolon outside quotation marks, and a clause that names the ruling ("owner ruling 2026-10-27", "owner ruling
// 2026-10-29: a US federal publication", "an official record of the Secretary of State, owner ruling") is dropped; the
// holder's own words stay as they are written, under their own label:
//   Public domain (owner ruling 2026-10-27; HathiTrust: "pdus")  ->  Public domain (HathiTrust: "pdus")
//   Public domain (holder: "Public Domain Mark"; owner ruling 2026-10-27)  ->  Public domain (holder: "Public Domain Mark")
const RULING = /\bowner[\s-]*rul/i
// the clauses of a parenthesis, split at a semicolon outside quotation marks
function clauses(s) {
  const out = []
  let depth = 0
  let from = 0
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (ch === '“') depth++
    else if (ch === '”') depth = Math.max(0, depth - 1)
    else if (ch === ';' && depth === 0) {
      out.push(s.slice(from, i))
      from = i + 1
    }
  }
  out.push(s.slice(from))
  return out.map((x) => x.trim()).filter(Boolean)
}
export function visitorRights(rights) {
  if (typeof rights !== 'string' || !RULING.test(rights)) return rights
  const m = /^([^(]*?)\s*\((.*)\)\s*$/s.exec(rights)
  if (!m) return rights
  const kept = clauses(m[2]).filter((c) => !RULING.test(c))
  return kept.length ? `${m[1]} (${kept.join('; ')})` : m[1]
}
