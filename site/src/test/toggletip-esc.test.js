// Esc closes the innermost open thing first: an open source toggletip takes Esc (and marks it handled,
// preventDefault), so the story, a panel or a door leave does not also act on the same key press.
import { it, expect } from 'vitest';
import { onTipEscape } from '../ui/sources.js';

function tipWorld(open) {
  const body = { hidden: !open };
  const region = { querySelector: () => body };
  const btn = { attrs: { 'aria-expanded': String(open), 'aria-controls': 'r1' }, getAttribute(k) { return this.attrs[k]; }, setAttribute(k, v) { this.attrs[k] = v; }, focused: false, focus() { this.focused = true; } };
  const wrap = { querySelector: () => (btn.attrs['aria-expanded'] === 'true' ? btn : null) };
  const active = { closest: () => wrap };
  globalThis.document = { getElementById: () => region };
  return { body, btn, active };
}
const key = (k, prevented = false) => ({ key: k, defaultPrevented: prevented, preventDefault() { this.defaultPrevented = true; } });

it('Esc on an open toggletip closes it and marks the key handled', () => {
  const w = tipWorld(true);
  const e = key('Escape');
  expect(onTipEscape(e, w.active)).toBe(true);
  expect(e.defaultPrevented).toBe(true);
  expect(w.body.hidden).toBe(true);
  expect(w.btn.focused).toBe(true);
  delete globalThis.document;
});

it('Esc with no open toggletip, another key, or a key already handled: left alone', () => {
  const w = tipWorld(false);
  const e = key('Escape');
  expect(onTipEscape(e, w.active)).toBe(false);
  expect(e.defaultPrevented).toBe(false);
  const w2 = tipWorld(true);
  const other = key('Enter');
  expect(onTipEscape(other, w2.active)).toBe(false);
  expect(w2.body.hidden).toBe(false);
  const done = key('Escape', true);
  expect(onTipEscape(done, w2.active)).toBe(false);
  expect(w2.body.hidden).toBe(false);
  delete globalThis.document;
});
