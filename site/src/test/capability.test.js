import { it, expect } from 'vitest';
import { chooseMode, probeWebGL2 } from '../museum/capability.js';
it('falls back to lite without WebGL2', () => expect(chooseMode({ webgl2: false })).toBe('lite'));
it('honours ?lite=1 and the stored preference', () => {
  expect(chooseMode({ webgl2: true, liteParam: true })).toBe('lite');
  expect(chooseMode({ webgl2: true, userPref: 'lite' })).toBe('lite');
});
// Spec line 106: Lite is chosen by capability probe, reduced-motion preference, or toggle. An explicit
// stored choice beats the media query, so a reduced-motion visitor can still opt into the room.
it('reduced motion alone chooses Lite', () => expect(chooseMode({ webgl2: true, reducedMotion: true })).toBe('lite'));
it('an explicit 3d preference beats reduced motion', () => expect(chooseMode({ webgl2: true, reducedMotion: true, userPref: '3d' })).toBe('3d'));
it('an explicit lite preference wins without reduced motion', () => expect(chooseMode({ webgl2: true, reducedMotion: false, userPref: 'lite' })).toBe('lite'));
it('no WebGL2 is Lite even with a 3d preference', () => expect(chooseMode({ webgl2: false, userPref: '3d' })).toBe('lite'));
it('?lite=1 is Lite even with a 3d preference', () => expect(chooseMode({ webgl2: true, liteParam: true, userPref: '3d' })).toBe('lite'));
it('an explicit 3d preference with no reduced motion stays 3d', () => expect(chooseMode({ webgl2: true, userPref: '3d' })).toBe('3d'));
it('defaults to 3d with WebGL2 and no overrides', () => expect(chooseMode({ webgl2: true })).toBe('3d'));
it('probeWebGL2 is exported and safe to import in Node', () => expect(typeof probeWebGL2).toBe('function'));
import { afterEach } from 'vitest';
const realDoc = globalThis.document;
afterEach(() => { if (realDoc === undefined) delete globalThis.document; else globalThis.document = realDoc; });
it('probeWebGL2 returns false when createElement throws', () => {
  globalThis.document = { createElement() { throw new Error('x'); } };
  expect(probeWebGL2()).toBe(false);
});
it('probeWebGL2 returns false when getContext returns null', () => {
  globalThis.document = { createElement: () => ({ getContext: () => null }) };
  expect(probeWebGL2()).toBe(false);
});
it('probeWebGL2 returns true when a webgl2 context exists', () => {
  globalThis.document = { createElement: () => ({ getContext: () => ({}) }) };
  expect(probeWebGL2()).toBe(true);
});
