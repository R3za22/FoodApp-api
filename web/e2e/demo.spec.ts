import { expect, test } from '@playwright/test';
import { trackExternal } from './helpers';

const BASE = 'http://127.0.0.1:4174';

test.use({ baseURL: `${BASE}/demos/foodapp/` });

test('demo build: pre-signed-in, banner, base path, nothing leaves the origin', async ({ page }) => {
  const external = trackExternal(page, BASE);
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'My recipes', level: 1 })).toBeVisible();
  await expect(page.locator('.recipe-card')).toHaveCount(6);
  const banner = page.getByRole('region', { name: 'Demo' });
  await expect(banner).toContainText('Demo · sample data');
  await expect(banner.getByRole('link')).toHaveAttribute('href', 'https://rezaghamar.ir');
  await page.locator('.recipe-card').first().click();
  await expect(page.locator('.ing-list li').first()).toBeVisible();
  await banner.getByRole('button', { name: 'Dismiss' }).click();
  await expect(banner).toHaveCount(0);
  await page.getByRole('link', { name: 'Profile' }).first().click();
  await page.getByRole('button', { name: 'Reset demo data' }).click();
  await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible();
  expect(external).toEqual([]);
});
