// Story mode (src/ui/story.js): "Start the story" on the globe zooms to the first room and enters it;
// in a room the narration starts on arrival, and when it ends a card reads "Continuing to <next> in
// 5 s" with Stay and Close story; then on to the next room (a door step for an unpinned room) and,
// after the last room, the ending page. Close story and Esc stop every timer; Back never resumes a
// story; reduced motion keeps the story going with fades only; a failed aerial load fades into the
// room. Rooms and titles are read from the shipped content, not hard-coded.
import { test, expect } from '@playwright/test';
import { JOURNEY } from './journey-content.js';
import { chapter } from './content.js';
import { seekNarration } from './narration.js';
import { roomReady } from './room.js';

test.beforeEach(() => test.setTimeout(180000)); // SwiftShader: zooms, rooms and walks on the CPU

const QA = process.env.QA_DIR || new URL('../test-results/qa/', import.meta.url).pathname; // screenshots for review (set QA_DIR to keep them elsewhere)
// Rooms in journey order (as content/journey.js storyJourney): stops with a chapter, each chapter once.
const ROOMS = [];
for (const s of JOURNEY.stops) if (s.chapter !== undefined && !ROOMS.some(r => r.n === s.chapter)) ROOMS.push({ id: s.id, n: s.chapter, pinned: Boolean(s.map), title: chapter(s.chapter).title });
const FIRST = ROOMS[0], SECOND = ROOMS[1], LAST = ROOMS[ROOMS.length - 1];
const roomPath = r => `/einstein/${r.n}/`;
const ready = roomReady;
const card = page => page.locator('[data-story-card]');
const path = page => { const u = new URL(page.url()); return u.pathname + u.search; };

// The narration near its end: if the browser blocked the story's autoplay, the visitor presses Play.
async function endNarration(page) {
  await page.waitForFunction(() => { const a = document.getElementById('narration'); return a && Number.isFinite(a.duration) && a.duration > 1; });
  if (await page.evaluate(() => document.getElementById('narration').paused)) await page.locator('[data-play]').click();
  await expect.poll(() => page.evaluate(() => !document.getElementById('narration').paused)).toBe(true);
  await seekNarration(page, { end: 0.4 });
}
// autoplay: 'playing' (arrived by a story navigation, which the browser allowed), 'blocked' (the browser
// refused it) or 'held' (not reached through the story, e.g. a typed or pasted story URL: no autoplay).
// When it does not play, the big play button stays and the announcement says to press Play.
// A room reached by a story navigation is waited for at its commit (waitForURL ... 'commit'), not at its
// load event: start-up holds the load event for as long as the 3D room takes to start (15 s and more
// with software WebGL on a loaded machine). The room's own ready state is the wait that counts.
async function arrivedInRoom(page, r, autoplay) {
  await ready(page);
  // The arrival is done when the stage says how the narration started; that waits on the browser's
  // play(), which on a loaded machine takes seconds (flake-report 2026-10-12). Wait for that state,
  // then check what it is and what the arrival did.
  await page.locator('[data-stage][data-story-autoplay]').waitFor();
  await expect(page.getByRole('heading', { level: 1, name: r.title })).toBeFocused();
  await expect(page.locator('[data-story-announce]')).toContainText(`Now in: ${r.title}`);
  await expect(page.locator('[data-stage]')).toHaveAttribute('data-story-autoplay', autoplay);
  const paused = await page.evaluate(() => document.getElementById('narration').paused);
  expect(paused).toBe(autoplay !== 'playing');
  if (autoplay !== 'playing') {
    await expect(page.locator('[data-stage-play]')).toBeVisible();
    await expect(page.locator('[data-story-announce]')).toContainText('Press Play to hear the narration');
  }
  // A small Close story control stays on the stage all through the story.
  await expect(page.locator('[data-stage]').getByRole('button', { name: 'Close story' }).first()).toBeVisible();
}
const END_URL = /\/einstein\/end\/(\?story=1)?$/;
const nextName = i => (i + 1 < ROOMS.length ? ROOMS[i + 1].title : "the journey's end");

test('Start the story: the globe zooms to the first room, holds with Skip and Close story, then enters it with the narration', async ({ page }, info) => {
  await page.goto('/einstein/?debug');
  await expect(page.locator('#globe')).toHaveAttribute('data-ready', 'true', { timeout: 30000 });
  const start = page.getByRole('link', { name: 'Start the story' });
  await expect(start).toHaveAttribute('href', `${roomPath(FIRST)}?story=1`);
  await start.click();
  const stage = page.locator('[data-stage]');
  const bar = page.getByRole('group', { name: 'Story' });
  if (FIRST.pinned) {
    await expect(stage).toHaveAttribute('data-story', 'moving');
    await expect(bar.getByRole('button', { name: 'Skip' })).toBeVisible();
    await expect(bar.getByRole('button', { name: 'Close story' })).toBeVisible();
    await expect(page.locator('[data-aerial-skip]')).toBeHidden(); // one Skip only: the story's
    await expect(stage).toHaveAttribute('data-story', 'hold', { timeout: 30000 });
    await expect(stage).toHaveAttribute('data-aerial', 'arrived');
    await expect(bar).toContainText(`Entering ${FIRST.title}`);
    await page.screenshot({ path: `${QA}/story-globe-hold-${info.project.name}.png` });
  }
  await page.waitForURL(`**${roomPath(FIRST)}?story=1`, { timeout: 30000, waitUntil: 'commit' });
  await arrivedInRoom(page, FIRST, 'playing');
});

// The countdown runs on the page's clock, which this test holds still once the room has arrived: the
// card's seconds pass only when the test plays them out (page.clock.runFor), so a loaded machine can
// never run the 5 s out before Stay is pressed, and Stay is shown to stop a countdown that would go on.
async function endNarrationOnHeldClock(page) {
  // Polled from the test side: with the page's clock held, nothing in the page may wait on its timers.
  await expect.poll(() => page.evaluate(() => { const a = document.getElementById('narration'); return Number.isFinite(a.duration) && a.duration > 1; })).toBe(true);
  if (await page.evaluate(() => document.getElementById('narration').paused)) await page.locator('[data-play]').click();
  await expect.poll(() => page.evaluate(() => !document.getElementById('narration').paused)).toBe(true);
  await seekNarration(page, { end: 0.4 });
}
test('in a room: narration end shows the card; Stay holds; Close story stops every timer and leaves the visitor there', async ({ page }) => {
  await page.clock.install();
  await page.goto(`${roomPath(FIRST)}?story=1`);
  await arrivedInRoom(page, FIRST, 'held');
  // A story page opts in to the cross-document View Transition fade.
  expect(await page.evaluate(() => Boolean(document.getElementById('voa-vt')))).toBe(true);
  const exitHref = await page.locator('a[data-door="exit"]').getAttribute('href');
  expect(exitHref).toBe(SECOND && SECOND.pinned && FIRST.pinned ? `/einstein/?story=1&from=${FIRST.id}` : (SECOND ? `${roomPath(SECOND)}?story=1&from=${FIRST.id}` : '/einstein/end/'));
  // From here the page's time moves only when the test moves it.
  await page.clock.pauseAt(await page.evaluate(() => Date.now()) + 1000);
  await endNarrationOnHeldClock(page);
  await expect(card(page)).toBeVisible({ timeout: 15000 });
  const text = card(page).locator('[data-story-text]');
  await expect(text).toHaveText(`Continuing to ${nextName(0)} in 5 s`);
  // The countdown is live: one second of page time takes it to 4.
  await page.clock.runFor(1000);
  await expect(text).toHaveText(`Continuing to ${nextName(0)} in 4 s`);
  // The card never takes focus, sits on the stage, clear of the door buttons.
  const seen = await page.evaluate(() => {
    const box = el => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; };
    const c = document.querySelector('[data-story-card]');
    return { focused: c.contains(document.activeElement), stage: box(document.querySelector('[data-stage]')), card: box(c), doors: box(document.querySelector('[data-door-nav]')) };
  });
  expect(seen.focused).toBe(false);
  const { stage: s, card: c, doors: d } = seen;
  expect(c.x >= s.x && c.x + c.width <= s.x + s.width && c.y >= s.y && c.y + c.height <= s.y + s.height).toBe(true);
  expect(c.y).toBeGreaterThan(d.y + d.height);
  // Stay: the countdown stops; ten seconds of page time later the visitor is still here.
  await card(page).getByRole('button', { name: 'Stay' }).click();
  await expect(card(page)).toBeHidden();
  await page.clock.runFor(10000);
  await expect(page.locator('[data-story-announce]')).toContainText('Countdown stopped');
  expect(path(page)).toBe(`${roomPath(FIRST)}?story=1`);
  await expect(page.locator('[data-stage]')).not.toHaveAttribute('data-leaving', /.*/);
  // The narration ends again: the card again; Close story ends the story where the visitor stands.
  await endNarrationOnHeldClock(page);
  await expect(card(page)).toBeVisible({ timeout: 15000 });
  await card(page).getByRole('button', { name: 'Close story' }).click();
  await expect(card(page)).toBeHidden();
  expect(path(page)).toBe(roomPath(FIRST));
  await expect(page.locator('[data-stage]')).not.toHaveAttribute('data-story', /.*/);
  await page.clock.runFor(10000);
  expect(path(page)).toBe(roomPath(FIRST));
  await expect(page.locator('[data-stage]')).not.toHaveAttribute('data-leaving', /.*/);
  await expect(page.locator('[data-door-fade]')).toBeHidden();
  // The doors are plain doors again, without the story's page transition.
  expect(await page.evaluate(() => Boolean(document.getElementById('voa-vt')))).toBe(false);
  await expect(page.locator('a[data-door="exit"]')).toHaveAttribute('href', SECOND ? roomPath(SECOND) : '/einstein/end/');
  // Focus left the closed card for the exit door button.
  await expect(page.locator('a[data-door="exit"]')).toBeFocused();
});

test('Esc while the card counts down closes the story: no navigation', async ({ page }) => {
  await page.goto(`${roomPath(FIRST)}?story=1`);
  await arrivedInRoom(page, FIRST, 'held');
  await endNarration(page);
  await expect(card(page)).toBeVisible({ timeout: 15000 });
  await page.keyboard.press('Escape');
  await expect(card(page)).toBeHidden();
  expect(path(page)).toBe(roomPath(FIRST));
  await page.waitForTimeout(7000);
  expect(path(page)).toBe(roomPath(FIRST));
});

test('continuing: room to room in journey order, then the ending page (never back to the first room)', async ({ page }, info) => {
  await page.goto(`${roomPath(FIRST)}?story=1`);
  for (const [i, r] of ROOMS.entries()) {
    await arrivedInRoom(page, r, i === 0 ? 'held' : 'playing');
    await endNarration(page);
    await expect(card(page)).toBeVisible({ timeout: 15000 });
    // The leave: a walk and a fade after the countdown (a frame of it is kept).
    await expect(page.locator('[data-stage]')).toHaveAttribute('data-leaving', /walk|fade/, { timeout: 10000 });
    if (i === 0) {
      // Mid-walk, before the page goes (an outgoing page in a View Transition draws no new frames, so a
      // late shot could wait for ever; the frame is a QA record, not an assertion).
      await page.waitForTimeout(300);
      await page.screenshot({ path: `${QA}/story-transition-${info.project.name}.png`, timeout: 5000 }).catch(() => {});
    }
    if (i + 1 < ROOMS.length) await page.waitForURL(`**${roomPath(ROOMS[i + 1])}?story=1&from=${r.id}`, { timeout: 30000, waitUntil: 'commit' });
  }
  await page.waitForURL(END_URL, { timeout: 30000 });
  // The ending page arrives with the story's fade, then drops the story parameter.
  expect(await page.evaluate(() => document.documentElement.dataset.storyFade)).toBe('in');
  await expect.poll(() => path(page)).toBe('/einstein/end/');
  // The story is over: links from the ending page are plain navigation again.
  await expect.poll(() => page.evaluate(() => Boolean(document.getElementById('voa-vt')))).toBe(false);
  await page.waitForTimeout(3000);
  expect(path(page)).toBe('/einstein/end/');
});

test('Back during the story lands on the previous room without a story: no card, no countdown, no autoplay', async ({ page }) => {
  test.skip(ROOMS.length < 2, 'one room only');
  await page.goto(`${roomPath(FIRST)}?story=1`);
  await arrivedInRoom(page, FIRST, 'held');
  await endNarration(page);
  await page.waitForURL(`**${roomPath(SECOND)}?story=1&from=${FIRST.id}`, { timeout: 30000, waitUntil: 'commit' });
  await arrivedInRoom(page, SECOND, 'playing');
  await page.goBack();
  await expect.poll(() => new URL(page.url()).pathname).toBe(roomPath(FIRST));
  await ready(page);
  await expect(page.locator('[data-door-fade]')).toBeHidden();
  await expect(card(page)).toBeHidden();
  await expect.poll(() => new URL(page.url()).search).toBe('');
  await expect(page.locator('[data-stage]')).not.toHaveAttribute('data-story', /.*/);
  await page.waitForTimeout(7000);
  expect(path(page)).toBe(roomPath(FIRST));
  await expect(card(page)).toBeHidden();
  // Back once more: the globe, sane, nothing moving on its own.
});

test('Back from the first room entered by Start the story: the globe, with no story running', async ({ page }) => {
  await page.goto('/einstein/');
  await expect(page.locator('#globe')).toHaveAttribute('data-ready', 'true', { timeout: 30000 });
  await page.getByRole('link', { name: 'Start the story' }).click();
  await page.waitForURL(`**${roomPath(FIRST)}?story=1`, { timeout: 60000, waitUntil: 'commit' });
  await ready(page);
  await page.goBack();
  await expect.poll(() => path(page)).toBe('/einstein/');
  await expect(page.locator('#globe')).toHaveAttribute('data-ready', 'true', { timeout: 30000 });
  await expect(page.locator('[data-story-bar]')).toBeHidden();
  await page.waitForTimeout(4000);
  expect(path(page)).toBe('/einstein/');
  await expect(page.locator('[data-stage]')).not.toHaveAttribute('data-story', /.*/);
});

test('Close story on the globe during the zoom stops the chain: no room is entered', async ({ page }) => {
  test.skip(!FIRST.pinned, 'the first room is not pinned');
  await page.goto('/einstein/?debug');
  await expect(page.locator('#globe')).toHaveAttribute('data-ready', 'true', { timeout: 30000 });
  await page.getByRole('link', { name: 'Start the story' }).click();
  await expect(page.locator('[data-stage]')).toHaveAttribute('data-story', 'moving');
  await page.getByRole('group', { name: 'Story' }).getByRole('button', { name: 'Close story' }).click();
  await expect(page.locator('[data-story-bar]')).toBeHidden();
  await page.waitForTimeout(9000);
  expect(path(page)).toBe('/einstein/?debug');
  await expect(page.locator('[data-stage]')).not.toHaveAttribute('data-story', /.*/);
});

test('a failed aerial load on the way in fades into the room, never a dead end', async ({ page }) => {
  test.skip(!FIRST.pinned, 'the first room is not pinned');
  await page.route(`**/aerial/einstein/${FIRST.id}/**`, r => r.abort());
  await page.goto('/einstein/');
  await expect(page.locator('#globe')).toHaveAttribute('data-ready', 'true', { timeout: 30000 });
  await page.getByRole('link', { name: 'Start the story' }).click();
  await page.waitForURL(`**${roomPath(FIRST)}?story=1`, { timeout: 30000, waitUntil: 'commit' });
  await arrivedInRoom(page, FIRST, 'playing');
});

test('the globe page reached from a room for a door step goes straight on to the next room', async ({ page }) => {
  const i = ROOMS.findIndex((r, k) => k + 1 < ROOMS.length && !(r.pinned && ROOMS[k + 1].pinned));
  test.skip(i < 0, 'no door step on this journey');
  // The story bar never shows for a door step (it has no globe sequence).
  await page.addInitScript(() => {
    document.addEventListener('DOMContentLoaded', () => {
      const bar = document.querySelector('[data-story-bar]');
      if (bar) new MutationObserver(() => { if (!bar.hidden) sessionStorage.setItem('voa-bar-shown', '1'); }).observe(bar, { attributes: true });
    });
  });
  await page.goto(`/einstein/?story=1&from=${ROOMS[i].id}`);
  await page.waitForURL(`**${roomPath(ROOMS[i + 1])}?story=1&from=${ROOMS[i].id}`, { timeout: 30000, waitUntil: 'commit' });
  // The globe page was opened directly (not through the story), so the room does not autoplay.
  await arrivedInRoom(page, ROOMS[i + 1], 'held');
  expect(await page.evaluate(() => sessionStorage.getItem('voa-bar-shown'))).toBeNull();
});

test('reduced motion: fades only (no walk to the door), and the story still goes on', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => localStorage.setItem('voa-mode', '3d')); // reduced motion defaults to Lite; the visitor chose 3D
  await page.goto('/einstein/?debug');
  await expect(page.locator('#globe')).toHaveAttribute('data-ready', 'true', { timeout: 30000 });
  await page.getByRole('link', { name: 'Start the story' }).click();
  await page.waitForURL(`**${roomPath(FIRST)}?story=1`, { timeout: 60000, waitUntil: 'commit' });
  await arrivedInRoom(page, FIRST, 'playing');
  await endNarration(page);
  await expect(card(page)).toBeVisible({ timeout: 15000 });
  // The leave mode, recorded as it happens (the fade is short).
  await page.evaluate(() => new MutationObserver(() => { const m = document.querySelector('[data-stage]').dataset.leaving; if (m) sessionStorage.setItem('voa-story-leave', m); })
    .observe(document.querySelector('[data-stage]'), { attributes: true, attributeFilter: ['data-leaving'] }));
  await page.waitForURL(SECOND ? `**${roomPath(SECOND)}?story=1&from=${FIRST.id}` : END_URL, { timeout: 30000 });
  expect(await page.evaluate(() => sessionStorage.getItem('voa-story-leave'))).toBe('fade');
});

test('a blocked autoplay leaves the big play button; pressing it plays, and the story goes on when it ends', async ({ page }, info) => {
  // The browser refuses play() without a gesture on this page (as a strict autoplay policy would).
  // The gesture is a trusted press or key in this document, not navigator.userActivation: Playwright
  // runs every evaluation (locator and expect polling included) as a user gesture
  // (Runtime.callFunctionOn userGesture: true), so the test's own wait for the room made the page
  // "active" and the arrival's play() was allowed (flake-report 2026-10-12).
  await page.addInitScript(() => {
    let gesture = false;
    for (const t of ['pointerdown', 'pointerup', 'click', 'keydown']) addEventListener(t, e => { if (e.isTrusted) gesture = true; }, true);
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      return gesture ? play.call(this) : Promise.reject(new DOMException('blocked', 'NotAllowedError'));
    };
  });
  await page.goto('/einstein/');
  await expect(page.locator('#globe')).toHaveAttribute('data-ready', 'true', { timeout: 30000 });
  await page.getByRole('link', { name: 'Start the story' }).click();
  await page.waitForURL(`**${roomPath(FIRST)}?story=1`, { timeout: 60000, waitUntil: 'commit' });
  await arrivedInRoom(page, FIRST, 'blocked');
  await page.locator('[data-stage-play]').click();
  await expect.poll(() => page.evaluate(() => !document.getElementById('narration').paused)).toBe(true);
  await endNarration(page);
  await expect(card(page)).toBeVisible({ timeout: 15000 });
  await expect(card(page).locator('[data-story-text]')).toHaveText(new RegExp(`^Continuing to ${nextName(0)} in [1-5] s$`));
  await page.screenshot({ path: `${QA}/story-card-${info.project.name}.png` });
});

test('without story mode the narration still waits for Play', async ({ page }) => {
  await page.goto(roomPath(FIRST));
  await ready(page);
  await page.waitForTimeout(1500);
  expect(await page.evaluate(() => document.getElementById('narration').paused)).toBe(true);
  await expect(page.locator('[data-stage]')).not.toHaveAttribute('data-story', /.*/);
  await expect(page.locator('a[data-door="exit"]')).toHaveAttribute('href', SECOND ? roomPath(SECOND) : '/einstein/end/');
  expect(await page.evaluate(() => Boolean(document.getElementById('voa-vt')))).toBe(false);
});

test('the stage Close story control ends the story in any state, and so does Esc while the narration plays', async ({ page }) => {
  await page.goto('/einstein/');
  await expect(page.locator('#globe')).toHaveAttribute('data-ready', 'true', { timeout: 30000 });
  await page.getByRole('link', { name: 'Start the story' }).click();
  await page.waitForURL(`**${roomPath(FIRST)}?story=1`, { timeout: 60000, waitUntil: 'commit' });
  await arrivedInRoom(page, FIRST, 'playing');
  // Esc while the narration plays (no card yet) closes the story; the narration is left as it is.
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-stage]')).not.toHaveAttribute('data-story', /.*/);
  expect(path(page)).toBe(roomPath(FIRST));
  await expect(page.locator('[data-story-pill]')).toBeHidden();
  await endNarration(page);
  await page.waitForTimeout(7000);
  await expect(card(page)).toBeHidden();
  expect(path(page)).toBe(roomPath(FIRST));
  // The pill on a fresh story page: one click ends it.
  await page.goto(`${roomPath(FIRST)}?story=1`);
  await arrivedInRoom(page, FIRST, 'held');
  await page.locator('[data-story-pill]').click();
  await expect(page.locator('[data-stage]')).not.toHaveAttribute('data-story', /.*/);
  expect(path(page)).toBe(roomPath(FIRST));
});

// Lite story: reduced motion with no stored choice (and no WebGL) keeps the Lite page; the story plays
// its chapters there in journey order, one at a time, and ends on the ending page.
const liteNarration = n => `section#chapter-${n} audio[data-narration]`;
async function endLiteNarration(page, n) {
  const sel = liteNarration(n);
  // The visitor presses Play when it is not playing (the Lite audio loads nothing until then).
  if (await page.evaluate(s => document.querySelector(s).paused, sel)) await page.locator(sel).evaluate(a => a.play());
  await page.waitForFunction(s => { const a = document.querySelector(s); return a && Number.isFinite(a.duration) && a.duration > 1; }, sel);
  await seekNarration(page, { end: 0.4 }, sel);
}
async function liteStory(page) {
  await page.goto('/einstein/');
  const start = page.getByRole('link', { name: 'Start the story' });
  await expect(start).toHaveAttribute('href', `/einstein/lite/?story=1#chapter-${FIRST.n}`);
  await start.click();
  await page.waitForURL(`**/einstein/lite/?story=1#chapter-${FIRST.n}`, { timeout: 30000 });
  await expect(page.locator('canvas')).toHaveCount(0);
  const bar = page.getByRole('group', { name: 'Story' });
  await expect(bar.getByRole('button', { name: 'Close story' })).toBeVisible();
  for (const [i, r] of ROOMS.entries()) {
    await expect(page.getByRole('heading', { level: 2, name: new RegExp(`^${r.title}`) })).toBeFocused({ timeout: 15000 });
    await expect(page.locator('[data-story-announce]')).toContainText(`Now in: ${r.title}`);
    await expect.poll(() => page.evaluate(s => !document.querySelector(s).paused, liteNarration(r.n))).toBe(true);
    await endLiteNarration(page, r.n);
    await expect(bar.locator('[data-story-text]')).toHaveText(new RegExp(`^Continuing to ${nextName(i)} in [1-5] s$`), { timeout: 15000 });
    await expect(bar.getByRole('button', { name: 'Stay' })).toBeVisible();
    expect(await page.evaluate(() => document.querySelector('[data-story-bar]').contains(document.activeElement))).toBe(false);
    if (i + 1 < ROOMS.length) await expect.poll(() => new URL(page.url()).hash, { timeout: 15000 }).toBe(`#chapter-${ROOMS[i + 1].n}`);
  }
  await page.waitForURL(END_URL, { timeout: 30000 });
  await expect.poll(() => path(page)).toBe('/einstein/end/');
}

test('reduced motion, no stored choice: the story runs on the Lite page chapter by chapter, then the ending page', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await liteStory(page);
  // A frame of the Lite story bar is kept for QA (a fresh run to the first card).
  await page.goto('/einstein/');
  await page.getByRole('link', { name: 'Start the story' }).click();
  await page.waitForURL(`**/einstein/lite/?story=1#chapter-${FIRST.n}`);
  await expect.poll(() => page.evaluate(s => !document.querySelector(s).paused, liteNarration(FIRST.n))).toBe(true);
  await endLiteNarration(page, FIRST.n);
  await expect(page.locator('[data-story-bar] [data-story-text]')).toContainText('Continuing to', { timeout: 15000 });
  await page.screenshot({ path: `${QA}/story-lite-${info.project.name}.png` });
});

test('without WebGL: the same Lite story', async ({ page }) => {
  await page.addInitScript(() => { HTMLCanvasElement.prototype.getContext = () => null; });
  await liteStory(page);
});

test('without WebGL a room in story mode redirects to its Lite chapter with the story kept; Close story there stops it', async ({ page }) => {
  await page.addInitScript(() => { HTMLCanvasElement.prototype.getContext = () => null; });
  await page.goto(`${roomPath(SECOND || FIRST)}?story=1&from=${FIRST.id}`);
  await page.waitForURL(`**/einstein/lite/?story=1&from=${FIRST.id}#chapter-${(SECOND || FIRST).n}`, { timeout: 30000 });
  const bar = page.getByRole('group', { name: 'Story' });
  await expect(bar.getByRole('button', { name: 'Close story' })).toBeVisible();
  // Not reached by a story click on this page's own link: no autoplay; the visitor presses Play.
  const sel = liteNarration((SECOND || FIRST).n);
  expect(await page.evaluate(s => document.querySelector(s).paused, sel)).toBe(true);
  await endLiteNarration(page, (SECOND || FIRST).n);
  await expect(bar.locator('[data-story-text]')).toContainText('Continuing to', { timeout: 15000 });
  await page.keyboard.press('Escape');
  await expect(bar).toBeHidden();
  const at = path(page);
  await page.waitForTimeout(7000);
  expect(path(page)).toBe(at);
  expect(new URL(page.url()).search).toBe('');
});

// The ending page of the story fades itself in where the browser has no cross-document View
// Transitions: the fade layer runs a real opacity transition from dark to clear (a fade, not a cut,
// which would run no transition), and the page is left clear.
test('the ending page fades in on a browser without cross-document View Transitions', async ({ page }) => {
  await page.addInitScript(() => {
    delete window.CSSViewTransitionRule;
    window.__fade = [];
    const on = type => document.addEventListener(type, e => {
      if (e.target.matches && e.target.matches('div[data-story-fade-layer]') && e.propertyName === 'opacity') window.__fade.push({ type, at: e.elapsedTime });
    }, true);
    on('transitionrun'); on('transitionend');
  });
  await page.goto('/einstein/end/?story=1');
  await expect.poll(() => page.evaluate(() => window.__fade.map(f => f.type).join(',')), { timeout: 10000 }).toBe('transitionrun,transitionend');
  const fade = await page.evaluate(() => {
    const el = document.querySelector('div[data-story-fade-layer]');
    return { opacity: getComputedStyle(el).opacity, duration: parseFloat(getComputedStyle(el).transitionDuration) };
  });
  expect(fade.opacity).toBe('0');
  expect(fade.duration).toBeGreaterThanOrEqual(0.3);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).opacity)).toBe('1');
});

// The fade layer is its own element: closing a story (which clears the fade) never blanks the page,
// whose <html> carries the story's arrival marker.
test('Close story on the Lite page leaves the page visible', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`/einstein/lite/?story=1#chapter-${FIRST.n}`);
  const bar = page.getByRole('group', { name: 'Story' });
  await bar.getByRole('button', { name: 'Close story' }).click();
  await expect(bar).toBeHidden();
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).opacity)).toBe('1');
  expect(await page.evaluate(() => document.documentElement.style.opacity)).toBe('');
});

// Esc closes the innermost open thing: an open source toggletip first, the story only on the next Esc.
test('Lite story: Esc on an open source toggletip closes the tip, not the story', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`/einstein/lite/?story=1#chapter-${FIRST.n}`);
  const bar = page.getByRole('group', { name: 'Story' });
  await expect(bar).toBeVisible();
  const chip = page.locator(`#chapter-${FIRST.n} h2 button[data-chip]`).first();
  await chip.click();
  await expect(chip).toHaveAttribute('aria-expanded', 'true');
  await chip.focus();
  await page.keyboard.press('Escape');
  await expect(chip).toHaveAttribute('aria-expanded', 'false');
  await expect(bar).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(bar).toBeHidden();
});

// The autoplay token is written when the page actually goes: Esc during the walk to the exit door
// cancels the leave and leaves no token behind.
test('Esc during the walk to a story exit leaves no autoplay token', async ({ page }) => {
  await page.goto(`${roomPath(FIRST)}?story=1`);
  await arrivedInRoom(page, FIRST, 'held');
  await page.evaluate(() => sessionStorage.removeItem('voa-story-go'));
  await page.locator('a[data-door="exit"]').click();
  await expect(page.locator('[data-stage]')).toHaveAttribute('data-leaving', /walk|fade/);
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-stage]')).not.toHaveAttribute('data-leaving', /.*/);
  await page.waitForTimeout(2000);
  expect(path(page)).toBe(roomPath(FIRST));
  expect(await page.evaluate(() => sessionStorage.getItem('voa-story-go'))).toBeNull();
});

test('Enter the room pressed during the globe hold enters once, with the narration starting (the story carries on)', async ({ page }) => {
  test.skip(!FIRST.pinned, 'the first room is not pinned');
  const navs = [];
  page.on('framenavigated', f => { if (f === page.mainFrame()) navs.push(new URL(f.url()).pathname); });
  await page.goto('/einstein/');
  await expect(page.locator('#globe')).toHaveAttribute('data-ready', 'true', { timeout: 30000 });
  await page.getByRole('link', { name: 'Start the story' }).click();
  await expect(page.locator('[data-stage]')).toHaveAttribute('data-story', 'hold', { timeout: 30000 });
  const enter = page.locator('[data-aerial-enter]');
  await expect(enter).toHaveAttribute('href', `${roomPath(FIRST)}?story=1`);
  await enter.click();
  await page.waitForURL(`**${roomPath(FIRST)}?story=1`, { timeout: 30000, waitUntil: 'commit' });
  await arrivedInRoom(page, FIRST, 'playing');
  await page.waitForTimeout(2000); // the hold's own timer must not navigate a second time
  expect(navs.filter(p => p === roomPath(FIRST))).toHaveLength(1);
});

test('during the story zoom, focus that was lost goes to the visible story Skip, not the hidden aerial one', async ({ page }) => {
  test.skip(!FIRST.pinned, 'the first room is not pinned');
  // Hold the stack's manifest back a moment so the zoom's states change after focus is lost.
  await page.route(`**/aerial/einstein/${FIRST.id}/manifest.json`, async r => { await new Promise(res => setTimeout(res, 1000)); await r.continue(); });
  await page.goto('/einstein/');
  await expect(page.locator('#globe')).toHaveAttribute('data-ready', 'true', { timeout: 30000 });
  await page.getByRole('link', { name: 'Start the story' }).click();
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  await expect(page.locator('[data-stage]')).toHaveAttribute('data-aerial', 'zooming', { timeout: 30000 });
  const skip = page.getByRole('group', { name: 'Story' }).getByRole('button', { name: 'Skip' });
  await expect(skip).toBeVisible();
  await expect(skip).toBeFocused();
});

// Codex gate round 3. Rule: a covered stage (failure card, context loss) is a held stage: the
// narration pauses (and no shortcut restarts it), a countdown stops and nothing navigates, a story
// arrival waits; the card itself offers Close story and the Lite link; on recovery the narration and
// the countdown resume.
const loseContext = page => page.evaluate(() => { window.__lose = document.getElementById('room').getContext('webgl2').getExtension('WEBGL_lose_context'); window.__lose.loseContext(); });
const narrationPaused = page => page.evaluate(() => document.getElementById('narration').paused);

test('a context loss during the narration pauses it (no hidden audio, no shortcut restarts it); restore resumes it', async ({ page }) => {
  await page.goto(`${roomPath(FIRST)}?debug`);
  await ready(page);
  await page.locator('[data-stage-play]').click();
  await expect.poll(() => narrationPaused(page)).toBe(false);
  await loseContext(page);
  await expect(page.locator('[data-scan-failed]')).toBeVisible();
  await expect.poll(() => narrationPaused(page)).toBe(true);
  await page.locator('body').focus().catch(() => {});
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  await page.keyboard.press('k');
  await page.waitForTimeout(500);
  expect(await narrationPaused(page)).toBe(true);
  await page.evaluate(() => window.__lose.restoreContext());
  await expect(page.locator('[data-scan-failed]')).toBeHidden();
  await expect.poll(() => narrationPaused(page)).toBe(false);
});

test('a context loss during the countdown holds the story: no navigation; Close story on the card; restore counts again', async ({ page }) => {
  await page.goto(`${roomPath(FIRST)}?story=1&debug`);
  await arrivedInRoom(page, FIRST, 'held');
  await endNarration(page);
  await expect(card(page)).toBeVisible({ timeout: 15000 });
  await loseContext(page);
  const fail = page.locator('[data-scan-failed]');
  await expect(fail).toBeVisible();
  await expect(card(page)).toBeHidden();
  await page.waitForTimeout(7000);
  expect(path(page)).toBe(`${roomPath(FIRST)}?story=1&debug`);
  await expect(fail.getByRole('button', { name: 'Close story' })).toBeVisible();
  await expect(fail.getByRole('link', { name: /Lite/ })).toBeVisible();
  await page.evaluate(() => window.__lose.restoreContext());
  await expect(fail).toBeHidden();
  await expect(card(page)).toBeVisible({ timeout: 15000 });
  await card(page).getByRole('button', { name: 'Close story' }).click();
});

test('a room that fails to start in story mode plays nothing and goes nowhere; the card closes the story', async ({ page }) => {
  // Arrived by a story navigation (the one-shot token), so the narration would autoplay.
  await page.addInitScript(() => { try { sessionStorage.setItem('voa-story-go', location.pathname); } catch {} });
  await page.route('**/basis/**', r => r.abort());
  await page.goto(`${roomPath(FIRST)}?story=1`);
  await expect(page.locator('#room')).toHaveAttribute('data-ready', 'failed', { timeout: 60000 });
  await page.waitForTimeout(7000);
  expect(await narrationPaused(page)).toBe(true);
  await expect(page.locator('[data-stage]')).not.toHaveAttribute('data-story-autoplay', /.*/);
  await expect(page.locator('[data-stage]')).not.toHaveAttribute('data-story', 'counting');
  expect(path(page)).toBe(`${roomPath(FIRST)}?story=1`);
  const close = page.locator('[data-scan-failed]').getByRole('button', { name: 'Close story' });
  await expect(close).toBeVisible();
  await close.click();
  await expect(page.locator('[data-stage]')).not.toHaveAttribute('data-story', /.*/);
  await expect(close).toBeHidden();
  expect(path(page)).toBe(roomPath(FIRST));
});
