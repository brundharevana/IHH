// Codex gate 2026-10-14. Rule: the exhibit panel is the top layer of the chapter stage. Every stage
// overlay (loading view, Lite fallback card, story card, rail, pills) sits below it, so details
// opened from the exhibit list are never hidden under one. Checked over all of ChapterRoom.astro's
// stage rules, not only the fallback card that was found under it (e2e: chapter.spec.js).
import { it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const read = (p) => readFileSync(fileURLToPath(new URL(p, import.meta.url)), 'utf8');
const zOf = (rule) => Number((rule.match(/z-index:\s*(\d+)/) || [])[1]);

it('the exhibit panel stacks above every overlay on the chapter stage', () => {
  const panel = zOf(read('../styles/panel.css').match(/#panel \{[^}]*\}/)[0]);
  const rules = [...read('../components/ChapterRoom.astro').matchAll(/(\.voa-chapter [^{]+)\{([^}]*)\}/g)]
    .filter(([, , body]) => /z-index/.test(body) && /position:\s*absolute/.test(body))
    .map(([, sel, body]) => [sel.trim(), zOf(body)]);
  expect(rules.map(([s]) => s).join(' ')).toMatch(/scan-failed/);
  for (const [sel, z] of rules) expect(z, sel).toBeLessThan(panel);
});
