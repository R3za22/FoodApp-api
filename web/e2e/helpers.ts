import { expect, type Page } from '@playwright/test';

/** Fails the test if any request leaves the app origin (mock mode must be offline). */
export function trackExternal(page: Page, origin: string): string[] {
  const external: string[] = [];
  page.on('request', (req) => {
    const u = req.url();
    if (u.startsWith('data:') || u.startsWith('blob:')) return;
    if (new URL(u).origin !== origin) external.push(u);
  });
  return external;
}

export async function loginAsDemo(page: Page) {
  await page.goto('/#/login');
  await page.getByRole('button', { name: '↵' }).click();
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page.getByRole('heading', { name: 'My recipes', level: 1 })).toBeVisible();
}

export const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);
