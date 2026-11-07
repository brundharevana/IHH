// Scanned-room stage helpers (src/museum/scanstage.js): the next room's prefetch and the loading view's
// states. Carried from the Task 3 review: a prefetch cancelled before this room's full detail is in
// never starts; while the failure card is up no detail pill shows over it.
import { it, expect, describe } from 'vitest';
import { prefetchNextScan, scanLoadingView } from '../museum/scanstage.js';

const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };
const fakeDoors = () => {
  const arrive = [], before = [];
  return { onArrive: f => arrive.push(f), beforeNavigate: f => before.push(f), arrive: () => arrive.forEach(f => f()), navigate: u => before.forEach(f => f(u)) };
};
const scan = id => ({ id, preview: { url: `/scans/${id}/preview/room.a.glb` }, occluder: { url: `/scans/${id}/occluder.b.glb` }, bundles: { phone: { url: `/scans/${id}/phone/room.c.glb` }, desktop: { url: `/scans/${id}/desktop/room.d.glb` } } });

describe('prefetchNextScan', () => {
  const setup = () => {
    const calls = [], aborted = [];
    const prefetchImpl = url => { calls.push(url); return { abort: () => aborted.push(url) }; };
    const after = deferred(), doors = fakeDoors();
    prefetchNextScan({ next: { href: '/einstein/4/', scan: scan('b') }, doors, audio: null, after: after.promise, prefetchImpl, cls: () => 'phone', base: 'http://x/einstein/3/' });
    return { calls, aborted, after, doors };
  };
  it('starts after this room is detailed, for this device, and aborts if the visitor leaves another way', async () => {
    const { calls, aborted, after, doors } = setup();
    doors.arrive();
    expect(calls).toEqual([]); // waits for this room's own full bundle
    after.resolve(); await after.promise; await Promise.resolve();
    expect(calls).toEqual(['/scans/b/preview/room.a.glb', '/scans/b/occluder.b.glb', '/scans/b/phone/room.c.glb']);
    doors.navigate('/einstein/');
    expect(aborted.length).toBe(3);
  });
  it('a prefetch cancelled before this room is detailed never starts (abort race)', async () => {
    const { calls, after, doors } = setup();
    doors.arrive();
    doors.navigate('/einstein/'); // leaves another way while this room still loads
    after.resolve(); await after.promise; await Promise.resolve();
    expect(calls).toEqual([]);
  });
  it('going on to the next room itself keeps the prefetch', async () => {
    const { calls, aborted, after, doors } = setup();
    doors.arrive();
    after.resolve(); await after.promise; await Promise.resolve();
    doors.navigate('/einstein/4/');
    expect(calls.length).toBe(3);
    expect(aborted).toEqual([]);
  });
});

describe('scanLoadingView', () => {
  const el = (extra = {}) => ({ hidden: false, attrs: {}, textContent: '', classList: { add() {}, remove() {} }, setAttribute(k, v) { this.attrs[k] = v; }, focus() { this.focused = true; }, querySelector: () => null, ...extra });
  const fakeRoot = () => {
    const bar = el(), pillBar = el(), text = el();
    const view = el({ querySelector: s => (s === 'progress' ? bar : s === '[data-scan-progress-text]' ? text : null) });
    const pill = el({ hidden: true, querySelector: s => (s === 'progress' ? pillBar : null) });
    const failed = el({ hidden: true });
    const map = { '[data-scan-loading]': view, '[data-scan-failed]': failed, '[data-scan-detail]': pill };
    return { root: { querySelector: s => map[s] || null }, view, pill, failed };
  };
  // Codex gate round 2. Rule: what the loading view or the failure card covers is out of reach: the
  // stage is data-covered (its controls hidden) until the room is drawn, again on failure or context
  // loss, and uncovered on recovery.
  it('covers the stage while loading and failed, uncovers it when the room is drawn or recovers', () => {
    const { root, view } = fakeRoot();
    const stage = { attrs: new Set(['data-covered']), toggleAttribute(k, on) { if (on) this.attrs.add(k); else this.attrs.delete(k); } };
    view.closest = sel => (sel === '[data-stage]' ? stage : null);
    const v = scanLoadingView(root, { reduced: () => true });
    expect(stage.attrs.has('data-covered')).toBe(true);
    v.recover(); v.done();
    expect(stage.attrs.has('data-covered')).toBe(false);
    v.fail();
    expect(stage.attrs.has('data-covered')).toBe(true);
    v.done(); // a late draw does not uncover a failure card
    expect(stage.attrs.has('data-covered')).toBe(true);
    v.recover();
    expect(stage.attrs.has('data-covered')).toBe(false);
  });
  it('no detail pill over the failure card; it returns after recovery', () => {
    const { root, pill, failed } = fakeRoot();
    const v = scanLoadingView(root);
    v.detail({ loaded: 1, total: 10 });
    expect(pill.hidden).toBe(false);
    v.fail();
    expect(failed.hidden).toBe(false);
    expect(pill.hidden).toBe(true);
    v.detail({ loaded: 5, total: 10 }); // the full bundle still streams in behind the card
    expect(pill.hidden).toBe(true);
    expect(v.failed()).toBe(true);
    v.recover();
    expect(failed.hidden).toBe(true);
    v.detail({ loaded: 6, total: 10 });
    expect(pill.hidden).toBe(false);
  });
  it('the loading view does not fade out over a failure card', () => {
    const { root, view } = fakeRoot();
    const v = scanLoadingView(root, { reduced: () => true });
    v.fail();
    expect(view.hidden).toBe(true);
    v.done();
    expect(view.hidden).toBe(true);
  });
});
