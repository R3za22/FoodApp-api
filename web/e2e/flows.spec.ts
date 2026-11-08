import { expect, test } from '@playwright/test';
import { loginAsDemo, PNG, trackExternal } from './helpers';

const ORIGIN = 'http://127.0.0.1:4173';

test('log in, filter, search, create with photo, edit, delete', async ({ page }) => {
  const external = trackExternal(page, ORIGIN);
  await loginAsDemo(page);
  await expect(page.locator('.recipe-card')).toHaveCount(6);

  // tag filter -> API query semantics, then ingredient filter, then clear
  await page.getByRole('button', { name: 'Soup', exact: true }).click();
  await expect(page.locator('.recipe-card')).toHaveCount(1);
  await expect(page.getByText('Lentil soup (adasi)')).toBeVisible();
  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  await expect(page.locator('.recipe-card')).toHaveCount(6);
  await page.getByLabel('Search recipes').fill('ghormeh');
  await expect(page.locator('.recipe-card')).toHaveCount(1);
  await page.getByLabel('Search recipes').fill('zzz');
  await expect(page.getByRole('heading', { name: 'No recipes match' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();

  // create with a new tag, a new ingredient and a photo
  await page.getByRole('link', { name: 'New recipe' }).first().click();
  await page.getByRole('button', { name: 'Save recipe' }).click();
  await expect(page.getByText('Enter a title.')).toBeVisible();
  await page.getByLabel('Title').fill('Midnight toast');
  await page.getByLabel('Time (minutes)').fill('5');
  await page.getByLabel('Price').fill('1.2500');
  await page.getByRole('button', { name: 'Save recipe' }).click();
  await expect(page.getByText('No more than 5 digits in total, 2 after the point.')).toBeVisible();
  await page.getByLabel('Price').fill('1.25');
  await page.getByLabel('Add a tag').fill('Quick');
  await page.getByRole('button', { name: 'Add tag', exact: true }).click();
  await page.getByLabel('Add an ingredient').fill('sourdough');
  await page.getByRole('button', { name: 'Add ingredient' }).click();
  await page.getByLabel('eggs').check();
  await page.getByLabel('Choose a photo').setInputFiles({ name: 'toast.png', mimeType: 'image/png', buffer: PNG });
  await page.getByRole('button', { name: 'Save recipe' }).click();

  await expect(page.getByRole('heading', { name: 'Midnight toast', level: 1 })).toBeVisible();
  await expect(page.locator('.ing-list li')).toHaveText(['sourdough', 'eggs']);
  await expect(page.locator('.cover.big img')).toBeVisible();

  // edit
  await page.getByRole('link', { name: 'Edit recipe' }).click();
  await page.getByLabel('Title').fill('Midnight toast v2');
  await page.getByRole('button', { name: 'Remove tag Quick' }).click();
  await page.getByRole('button', { name: 'Save recipe' }).click();
  await expect(page.getByRole('heading', { name: 'Midnight toast v2', level: 1 })).toBeVisible();

  // persists across reload (localStorage)
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Midnight toast v2', level: 1 })).toBeVisible();

  // delete needs confirmation
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByRole('heading', { name: 'My recipes', level: 1 })).toBeVisible();
  await expect(page.locator('.recipe-card')).toHaveCount(6);
  expect(external).toEqual([]);
});

test('tags and ingredients manager: add, rename, delete with confirmation', async ({ page }) => {
  const external = trackExternal(page, ORIGIN);
  await loginAsDemo(page);
  await page.getByRole('link', { name: 'Tags and ingredients' }).first().click();
  await page.getByLabel('New tag').fill('Spicy');
  await page.getByRole('button', { name: 'Add tag' }).click();
  await expect(page.getByText('Spicy', { exact: true })).toBeVisible();
  await page.getByRole('listitem').filter({ hasText: 'Spicy' }).getByRole('button', { name: 'Rename' }).click();
  await page.getByLabel('Name').fill('Hot');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByText('Hot', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Delete cumin' }).click();
  await expect(page.getByRole('alertdialog')).toContainText('It is used in 2 recipes');
  await page.getByRole('alertdialog').getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText('cumin', { exact: true })).toHaveCount(0);
  expect(external).toEqual([]);
});

test('sign up, failed and successful login, profile token, log out', async ({ page }) => {
  const external = trackExternal(page, ORIGIN);
  await page.goto('/#/login');
  await page.locator('#su-name').fill('Sara');
  await page.locator('#su-email').fill('sara@example.com');
  await page.locator('#su-pass').fill('abc');
  await page.getByRole('button', { name: 'Sign up' }).click();
  await expect(page.getByText('Ensure this field has at least 5 characters.')).toBeVisible();
  await page.locator('#su-pass').fill('abcde');
  await page.getByRole('button', { name: 'Sign up' }).click();
  await expect(page.getByRole('status')).toContainText('Account created');

  await page.locator('#li-pass').fill('wrong-pass');
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page.getByRole('alert')).toContainText('Could not log in.');
  await page.locator('#li-pass').fill('abcde');
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page.getByRole('heading', { name: 'No recipes yet' })).toBeVisible();

  await page.getByRole('link', { name: 'Profile' }).first().click();
  await expect(page.getByTestId('token')).toContainText('•');
  await page.getByRole('button', { name: 'Reveal' }).click();
  await expect(page.getByTestId('token')).toContainText('mock-token-');
  await page.getByLabel('Name', { exact: true }).fill('Sara K');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByText('Saved')).toBeVisible();
  await page.getByRole('button', { name: 'Log out' }).click();
  await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();
  // private routes redirect when signed out
  await page.goto('/#/manage');
  await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();
  expect(external).toEqual([]);
});

test('Persian UI is RTL and unknown routes show a 404', async ({ page }) => {
  await loginAsDemo(page);
  await page.getByRole('button', { name: 'فارسی' }).click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fa');
  await expect(page.getByRole('heading', { name: 'دستور پخت‌های من', level: 1 })).toBeVisible();
  await expect(page.getByText('۶ دستور پخت')).toBeVisible();
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await page.goto('/#/nope');
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
});

test('server failure shows the error state and retry recovers', async ({ page }) => {
  await loginAsDemo(page);
  await page.evaluate(() => localStorage.setItem('foodapp.mock.fail', '1'));
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Could not reach the server' })).toBeVisible();
  await page.evaluate(() => localStorage.removeItem('foodapp.mock.fail'));
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.locator('.recipe-card')).toHaveCount(6);
});

test('mobile layout has no horizontal scroll', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await loginAsDemo(page);
  for (const hash of ['/', '/manage', '/profile', '/recipes/new']) {
    await page.goto(`/#${hash}`);
    await expect(page.locator('h1')).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, hash).toBeLessThanOrEqual(0);
  }
});
