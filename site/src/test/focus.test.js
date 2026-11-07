import { it, expect } from 'vitest';
import { trapIndex } from '../ui/focus.js';

it('wraps Tab from the last item to the first', () => {
  expect(trapIndex(3, 2, false)).toBe(0);
});
it('wraps Shift+Tab from the first item to the last', () => {
  expect(trapIndex(3, 0, true)).toBe(2);
});
it('lets the browser move focus inside the list', () => {
  expect(trapIndex(3, 1, false)).toBe(-1);
  expect(trapIndex(3, 1, true)).toBe(-1);
});
it('pulls focus back in when it sits outside the list (e.g. on the heading)', () => {
  expect(trapIndex(3, -1, false)).toBe(0);
  expect(trapIndex(3, -1, true)).toBe(2);
});
it('returns -1 when there is nothing focusable', () => {
  expect(trapIndex(0, -1, false)).toBe(-1);
});
