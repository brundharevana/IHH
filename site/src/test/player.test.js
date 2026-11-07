import { it, expect } from 'vitest';
import { fmtTime, cueIndexAt } from '../ui/player.js';

it('formats player time as m:ss', () => {
  expect(fmtTime(0)).toBe('0:00');
  expect(fmtTime(73.4)).toBe('1:13');
  expect(fmtTime(NaN)).toBe('0:00');
  expect(fmtTime(-3)).toBe('0:00');
});

it('finds the cue playing at a time; the previous cue holds through the pause between lines', () => {
  const cues = [{ startTime: 0 }, { startTime: 5.4 }, { startTime: 11.8 }];
  expect(cueIndexAt(cues, 0)).toBe(0);
  expect(cueIndexAt(cues, 5.2)).toBe(0);
  expect(cueIndexAt(cues, 5.4)).toBe(1);
  expect(cueIndexAt(cues, 99)).toBe(2);
  expect(cueIndexAt([], 3)).toBe(-1);
  expect(cueIndexAt([{ startTime: 1 }], 0.5)).toBe(-1);
});

// Fix round 2: on a phone a caption is at most two lines; a longer cue pages through two-line pages
// over the cue's time instead of growing the box (the transcript has the whole line).
import { captionPages, pageAt } from '../ui/player.js';
const mono = s => s.length * 10; // 10 px per character
it('splits a caption into pages of at most two lines that fit the width, words whole, nothing lost', () => {
  const text = 'The record of naturalization for Albert Einstein at the National Archives at Philadelphia includes a Certificate of Arrival';
  const pages = captionPages(text, mono, 200, 2);
  expect(pages.length).toBeGreaterThan(1);
  for (const p of pages) {
    const lines = captionPages(p, mono, 200, 1);
    expect(lines.length, p).toBeLessThanOrEqual(2);
  }
  expect(pages.join(' ')).toBe(text);
  expect(captionPages('Short line.', mono, 200, 2)).toEqual(['Short line.']);
  // A word wider than the line still goes on a line of its own.
  expect(captionPages('Supercalifragilisticexpialidocious yes', mono, 100, 2)).toEqual(['Supercalifragilisticexpialidocious yes']);
});
it('shows the page for the time within the cue', () => {
  const pages = ['one', 'two', 'three'], cue = { startTime: 10, endTime: 16 };
  expect(pageAt(pages, cue, 10)).toBe('one');
  expect(pageAt(pages, cue, 12.1)).toBe('two');
  expect(pageAt(pages, cue, 15.9)).toBe('three');
  expect(pageAt(pages, cue, 30)).toBe('three');
  expect(pageAt(['only'], cue, 11)).toBe('only');
});

// Task 4 review minor (carried to Task 7): caption pages are measured with the caption font; when a
// web font finishes loading after the first measure, the cached pages are dropped and measured again.
import { onFontsChange } from '../ui/player.js';
it('re-measures after web fonts load: calls back on fonts.ready and on each loadingdone', async () => {
  let resolveReady;
  const fonts = Object.assign(new EventTarget(), { ready: new Promise(r => { resolveReady = r; }) });
  let calls = 0;
  onFontsChange({ fonts }, () => { calls++; });
  expect(calls).toBe(0);
  resolveReady();
  await fonts.ready; await Promise.resolve();
  expect(calls).toBe(1);
  fonts.dispatchEvent(new Event('loadingdone'));
  expect(calls).toBe(2);
  // No Font Loading API: nothing to wait for, no error.
  expect(() => onFontsChange({}, () => { calls++; })).not.toThrow();
});
