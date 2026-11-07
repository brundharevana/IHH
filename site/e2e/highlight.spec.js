// As each narration line plays, the exhibits it names light up: their rings in the room and their
// thumbnails in the stage rail, their list items and source chips, and the transcript line; a polite
// live region names them once per line. (Real-scan museum spec: the numbered DOM hotspot pills became
// rings drawn in 3D; the rail buttons are their accessible equivalent, so the DOM assertions moved
// from [data-hotspot] to [data-rail] and the ring state is read through the debug hook.)
import { test, expect } from '@playwright/test';
import { chapter, exhibit, revealSteps } from './content.js';
import { seekNarration } from './narration.js';
import { roomReady } from './room.js';

const seekToCue = (page, cue, dt = 0.1) => seekNarration(page, { cue, dt });

test('the line playing now highlights its exhibit ring and thumbnail, list item, chip and transcript line', async ({ page }) => {
  await page.goto('/einstein/1/?debug');
  await roomReady(page);
  const lines = chapter(1).narration;
  await page.waitForFunction(n => (document.getElementById('cues').track.cues || []).length === n, lines.length);
  // The second and third lines that reveal something, and everything each of them names (a line
  // names its authored reveals and every exhibit whose title or notes cite one of its facts).
  const [s1, s2, s3] = revealSteps(1);
  const label = id => { const e = exhibit(1, id); return `${e.number}. ${e.title}`; };
  const announce = s => `Now showing exhibit ${s.names.map(label).join('; exhibit ')}`;
  // Exactly the exhibits the line names are active: ring, thumbnail, list item (aria-current) and nothing else.
  const activeIs = async s => {
    for (const id of s.names) {
      await expect(page.locator(`[data-rail="${id}"]`)).toHaveClass(/is-active/);
      await expect(page.locator(`[data-rail="${id}"]`)).toHaveAttribute('aria-current', 'true');
      await expect.poll(() => page.evaluate(x => window.__voa.ring(x).active, id)).toBe(true);
      const li = page.locator(`#exhibits li[data-item="${id}"]`);
      await expect(li).toHaveClass(/is-active/);
      await expect(li.locator('button[data-exhibit]')).toHaveAttribute('aria-current', 'true');
      await expect(li.locator('.chip-btn').first()).toBeAttached();
    }
    await expect(page.locator('#exhibits li.is-active')).toHaveCount(s.names.length);
    await expect(page.locator('[data-rail].is-active')).toHaveCount(s.names.length);
    const lit = await page.evaluate(ids => ids.filter(x => window.__voa.ring(x).active), ['ex1', 'ex2', 'ex3', 'ex4']);
    expect(lit.sort()).toEqual([...s.names].sort());
    await expect(page.locator(`.transcript [data-line="${s.line}"]`)).toHaveClass(/is-current/);
    await expect(page.locator('.transcript .is-current')).toHaveCount(1);
  };
  // Count every change to the live region.
  await page.evaluate(() => {
    window.__announcements = [];
    const live = document.querySelector('[data-announce]');
    new MutationObserver(() => window.__announcements.push(live.textContent)).observe(live, { childList: true, characterData: true, subtree: true });
  });
  const stage = await page.locator('[data-stage]').boundingBox();
  await seekToCue(page, s2.cue);
  const lead = exhibit(1, s2.names[0]);
  const hot = page.locator(`[data-rail="${lead.id}"]`);
  await expect(hot).toBeVisible();
  await expect(hot).toHaveAccessibleName(`Exhibit ${lead.number}: ${lead.title}`);
  const hb = await hot.boundingBox();
  expect(hb.x >= stage.x && hb.y >= stage.y && hb.x + hb.width <= stage.x + stage.width && hb.y + hb.height <= stage.y + stage.height).toBe(true);
  for (const id of s1.reveals.filter(id => !s2.names.includes(id))) await expect(page.locator(`[data-rail="${id}"]`)).not.toHaveClass(/is-active/);
  await activeIs(s2);
  await expect(page.locator('[data-announce]')).toHaveText(announce(s2));
  // A later seek inside the same line does not announce again (counted once that seek has completed:
  // the page's seek handlers have run by then).
  await seekToCue(page, s2.cue, 1.5);
  expect(await page.evaluate(() => window.__announcements.filter(Boolean).length)).toBe(1);
  // The next line that reveals something moves the highlight to what it names.
  await seekToCue(page, s3.cue);
  await activeIs(s3);
  for (const id of s2.names.filter(id => !s3.names.includes(id))) await expect(page.locator(`[data-rail="${id}"]`)).not.toHaveClass(/is-active/);
  await expect(page.locator('[data-announce]')).toHaveText(announce(s3));
  // The highlight offers the panel of the first exhibit the line names.
  // On a wide stage a "now showing" button offers it; on a phone stage (fix round 2) that button gives
  // way to the lit rail thumbnail, which opens the same exhibit.
  const now = page.locator('[data-now]');
  if ((page.viewportSize() || { width: 1280 }).width >= 600) {
    await expect(now).toHaveText(`Open ${label(s3.names[0])}`);
    await now.click();
  } else {
    await expect(now).toBeHidden();
    const lit = page.locator(`[data-rail="${s3.names[0]}"]`);
    await expect(lit).toHaveAttribute('aria-current', 'true');
    await lit.click();
  }
  // The panel opens when the glide to the exhibit has arrived (the stage is aria-busy until then);
  // software WebGL draws a scanned room's frames slowly, so wait on that state, not on a clock.
  await page.locator('[data-stage]:not([aria-busy])').waitFor();
  await expect(page.getByRole('dialog', { name: label(s3.names[0]) })).toBeVisible();
});

test('a ring opens its exhibit and Escape returns focus to its thumbnail', async ({ page }) => {
  await page.goto('/einstein/2/?debug');
  await roomReady(page);
  await page.getByRole('button', { name: 'Show all exhibits' }).click();
  // Start the narration (a seek): the big play button leaves the middle of the stage, where the
  // ring of the exhibit faced sits.
  await seekNarration(page, 0.1);
  await expect(page.locator('[data-stage-play]')).toBeHidden();
  // Stand at exhibit 2's station (Task 5: the study is a scanned room without look-around buttons; a
  // visitor reaches it by the rail or by turning, the test through the debug hook).
  await page.evaluate(() => { const st = window.__voa.stations().find(x => x.id === window.__voa.stationOf('ex2')); return window.__voa.pose(st.position, st.look); });
  // Rings follow the camera: the turn is a glide, and a ring is a still target only once the camera
  // has come to rest (clicking it mid-turn races its next placement). With software WebGL under
  // parallel load the turn can take longer than an assertion's default 5 s.
  await page.locator('#room[data-camera="rest"]').waitFor();
  // Bring the stage into view (a ring is drawn in the canvas).
  await page.locator('[data-stage]').scrollIntoViewIfNeeded();
  // Exhibit 2 is in the middle of its station's view, on a phone too.
  const ring = () => page.evaluate(() => window.__voa.ring('ex2'));
  await expect.poll(async () => (await ring()).visible).toBe(true);
  const at = (await ring()).screen;
  expect(at).not.toBeNull();
  // At rest it stays where it is across frames (it breathes in size, not in place).
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r)))));
  const still = (await ring()).screen;
  expect(Math.hypot(still.x - at.x, still.y - at.y)).toBeLessThan(2);
  await page.mouse.click(at.x, at.y);
  const ex2 = exhibit(2, 'ex2');
  await expect(page.getByRole('dialog', { name: `${ex2.number}. ${ex2.title}` })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-rail="ex2"]')).toBeFocused();
});

// Door pills are placed in the layer's own coordinates; the layer must not scroll when a pill at its
// edge is focused or scrolled to (it clips instead), or every pill would sit off its door.
test('the hotspot layer cannot be scrolled from inside', async ({ page }) => {
  await page.goto('/einstein/1/');
  await roomReady(page);
  const top = await page.locator('[data-hotspots]').evaluate(el => {
    const tall = document.createElement('div');
    tall.style.cssText = 'position:absolute;left:0;top:0;width:1px;height:5000px';
    el.append(tall);
    el.scrollTop = 40; tall.scrollIntoView({ block: "end" });
    const t = el.scrollTop; tall.remove();
    return t;
  });
  expect(top).toBe(0);
});
