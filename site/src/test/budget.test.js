import { it, expect } from 'vitest';
import { checkBudget, PHONE_BUDGET } from '../museum/budget.js';
const ok = { drawCalls: 60, triangles: 1e5, lights: 3, textureBytes: 20e6, downloadBytes: 2e6 };
it('passes within budget', () => {
  expect(checkBudget(ok)).toEqual([]);
});
it('names every exceeded limit', () => {
  const e = checkBudget({ drawCalls: 81, triangles: 150001, lights: 5, textureBytes: 25e6, downloadBytes: 3e6 });
  expect(e.length).toBe(5);
  expect(e.join(' ')).toMatch(/drawCalls.*triangles.*lights.*textureBytes.*downloadBytes/);
});
// Gate honesty: a stat that was not measured is a failure, never a silent pass.
it('fails on every missing stat, naming it', () => {
  expect(checkBudget({})).toEqual(Object.keys(PHONE_BUDGET).map(k => `${k} is missing or not a finite non-negative number`));
  const { lights, ...noLights } = ok;
  expect(checkBudget(noLights)).toEqual(['lights is missing or not a finite non-negative number']);
});
it('fails on NaN, Infinity, null, strings and negative counts', () => {
  for (const bad of [NaN, Infinity, -Infinity, null, '10', -1, true]) {
    expect(checkBudget({ ...ok, drawCalls: bad })).toEqual([`drawCalls is missing or not a finite non-negative number`]);
  }
});
it('fails when stats is not an object', () => {
  expect(checkBudget(undefined).length).toBe(5);
  expect(checkBudget(null).length).toBe(5);
});
