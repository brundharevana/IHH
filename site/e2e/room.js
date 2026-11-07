// A room page has started when its canvas says so: data-ready "true" (or "failed"). Start-up compiles
// shaders and uploads textures; with software WebGL on a loaded machine that blocked the page for 15 s
// and more (flake-report 2026-10-12). Wait for the outcome, then check it: no fixed time budget other
// than the test's own.
import { expect } from '@playwright/test';

export async function roomReady(page) {
  await page.locator('#room[data-ready]').waitFor({ state: 'attached' });
  await expect(page.locator('#room')).toHaveAttribute('data-ready', 'true');
}

// A scanned room is drawn from its preview first and redrawn once when its full-detail bundle is in
// (Task 3): tests that count frames at rest wait for that swap too (data-scan "full", or
// "preview-only" when the full bundle could not load). A procedural room has no data-scan.
export async function roomSettled(page) {
  await roomReady(page);
  // Bounded by the test's own timeout, as roomReady is (no separate clock).
  if (await page.locator('#room[data-scan]').count()) await page.locator('#room[data-scan="full"], #room[data-scan="preview-only"]').waitFor();
}
