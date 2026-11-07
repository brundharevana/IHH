// Codex gate round 3. Rule: a download measurement is the bytes the network delivered, summed over
// every transfer of a URL (two range requests are two transfers); a response served from the cache is
// excluded only when the browser says so; a transfer that never finished, or has no measurable size,
// fails the measurement, never counts 0. (e2e/measure.js, used by e2e/budget.spec.js.)
import { it, expect } from 'vitest';
import { totals, transferCounts } from '../../e2e/measure.js';

const req = (id, url, extra = {}) => ({ id, url, bytes: 0, finished: true, cached: false, ...extra });
it('sums repeated range transfers of one URL', () => {
  expect(totals([req('1', 'http://x/a.mp3', { bytes: 120 }), req('2', 'http://x/a.mp3', { bytes: 90 })]).get('http://x/a.mp3')).toBe(210);
});
it('excludes a response the browser served from its cache', () => {
  expect(totals([req('1', 'http://x/a.jpg', { bytes: 500 }), req('2', 'http://x/a.jpg', { bytes: 500, cached: true })]).get('http://x/a.jpg')).toBe(500);
});
it('fails on a transfer that did not finish or has no measured size, never counting it as 0', () => {
  expect(() => totals([req('1', 'http://x/a', { finished: false, bytes: 10 })])).toThrow(/did not finish/);
  expect(() => totals([req('1', 'http://x/a', { bytes: undefined })])).toThrow(/no measured size/);
  expect(() => totals([req('1', 'http://x/a', { bytes: NaN })])).toThrow(/no measured size/);
});
it('a transfer the browser cancelled counts what it received', () => {
  expect(totals([req('1', 'http://x/a.mp3', { bytes: 64, failed: 'net::ERR_ABORTED' })]).get('http://x/a.mp3')).toBe(64);
});
it('counts network transfers per URL, cache hits left out', () => {
  const c = transferCounts([req('1', 'http://x/a.jpg'), req('2', 'http://x/a.jpg'), req('3', 'http://x/a.jpg', { cached: true })]);
  expect(c.get('http://x/a.jpg')).toBe(2);
});
