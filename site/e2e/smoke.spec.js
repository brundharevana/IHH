import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('home renders with no serious axe violations', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('IHH: Voices of Arrival');
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();
  expect(r.violations.filter(v => ['serious', 'critical'].includes(v.impact))).toEqual([]);
});
