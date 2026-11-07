import { it, expect } from 'vitest';
import { mountAmbient } from '../ui/ambient.js';

function fakeButton() {
  const attrs = {}, handlers = {};
  return { attrs, dataset: {}, setAttribute: (k, v) => { attrs[k] = String(v); }, getAttribute: k => attrs[k],
    addEventListener: (t, f) => { handlers[t] = f; }, click: () => handlers.click && handlers.click(), contains: () => false };
}
function fakeWindow() {
  const handlers = {};
  return { handlers, addEventListener: (t, f) => { handlers[t] = f; }, removeEventListener: t => { delete handlers[t]; } };
}
function memStore(init = {}) {
  const m = new Map(Object.entries(init));
  return { m, getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, v) };
}
class FakeCtx {
  constructor() { this.currentTime = 0; this.destination = {}; FakeCtx.started = 0; }
  resume() { return Promise.resolve(); }
  suspend() { return Promise.resolve(); }
  decodeAudioData() { return Promise.resolve({}); }
  createGain() { return { gain: { setValueAtTime() {}, linearRampToValueAtTime() {} }, connect: d => d }; }
  createBufferSource() { return { connect: g => g, start: () => { FakeCtx.started++; }, stop() {}, disconnect() {} }; }
}
const okFetch = () => Promise.resolve({ ok: true, arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)) });
const flush = () => new Promise(r => setTimeout(r, 0));

it('starts unpressed and fetches nothing on load', () => {
  const btn = fakeButton(); let fetched = 0;
  mountAmbient(btn, { store: memStore(), AudioContext: FakeCtx, fetch: () => { fetched++; return okFetch(); }, win: fakeWindow() });
  expect(btn.attrs['aria-pressed']).toBe('false');
  expect(fetched).toBe(0);
});

it('shows pressed only once the tone is actually playing', async () => {
  const btn = fakeButton(), store = memStore();
  mountAmbient(btn, { store, AudioContext: FakeCtx, fetch: okFetch, win: fakeWindow() });
  btn.click();
  expect(btn.attrs['aria-pressed']).toBe('false');
  await flush(); await flush();
  expect(FakeCtx.started).toBe(1);
  expect(btn.attrs['aria-pressed']).toBe('true');
  expect(store.m.get('voa-ambient')).toBe('on');
});

it('a remembered "on" stays unpressed until the first gesture starts the tone', async () => {
  const btn = fakeButton(), win = fakeWindow();
  mountAmbient(btn, { store: memStore({ 'voa-ambient': 'on' }), AudioContext: FakeCtx, fetch: okFetch, win });
  expect(btn.attrs['aria-pressed']).toBe('false');
  expect(btn.dataset.state).toBe('waiting');
  win.handlers.pointerdown({ target: {} });
  await flush(); await flush();
  expect(btn.attrs['aria-pressed']).toBe('true');
});

it('a failed start resets the stored preference to off', async () => {
  const btn = fakeButton(), store = memStore({ 'voa-ambient': 'on' }), win = fakeWindow();
  mountAmbient(btn, { store, AudioContext: FakeCtx, fetch: () => Promise.resolve({ ok: false, status: 404 }), win });
  win.handlers.keydown({ target: {} });
  await flush(); await flush();
  expect(btn.attrs['aria-pressed']).toBe('false');
  expect(store.m.get('voa-ambient')).toBe('off');
});
