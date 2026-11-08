import { beforeEach, describe, expect, it } from 'vitest';
import { ApiError } from './types';
import { DEMO_EMAIL, DEMO_PASSWORD, mockApi } from './mock';

async function tokenFor() {
  return mockApi.login(DEMO_EMAIL, DEMO_PASSWORD);
}

beforeEach(() => mockApi.resetDemo?.('en'));

describe('mock adapter', () => {
  it('rejects wrong credentials like the API does', async () => {
    await expect(mockApi.login(DEMO_EMAIL, 'nope')).rejects.toBeInstanceOf(ApiError);
  });

  it('signs up validates and then logs in', async () => {
    await expect(mockApi.signUp({ name: 'A', email: 'a@b.co', password: 'abc' })).rejects.toMatchObject({
      status: 400,
      fields: { password: expect.any(Array) },
    });
    await mockApi.signUp({ name: 'A', email: 'a@b.co', password: 'abcde' });
    const tk = await mockApi.login('a@b.co', 'abcde');
    expect(await mockApi.listRecipes(tk, { tags: [], ingredients: [] })).toEqual([]);
  });

  it('filters recipes by tag and ingredient ids', async () => {
    const tk = await tokenFor();
    const tags = await mockApi.listAttrs(tk, 'tags');
    const ings = await mockApi.listAttrs(tk, 'ingredients');
    const soup = tags.find((t) => t.name === 'Soup')!;
    const lentils = ings.find((t) => t.name === 'lentils')!;
    const bySoup = await mockApi.listRecipes(tk, { tags: [soup.id], ingredients: [] });
    expect(bySoup.map((r) => r.title)).toEqual(['Lentil soup (adasi)']);
    const byLentils = await mockApi.listRecipes(tk, { tags: [], ingredients: [lentils.id] });
    expect(byLentils).toHaveLength(1);
  });

  it('creates a recipe with new tag and ingredient names (get-or-create)', async () => {
    const tk = await tokenFor();
    const r = await mockApi.saveRecipe(tk, null, {
      title: 'Toast', description: '', time_minutes: 5, price: '1.00', link: '',
      tags: ['Quick', 'breakfast'], ingredients: ['bread'],
    });
    expect(r.tags?.map((t) => t.name).sort()).toEqual(['Breakfast', 'Quick']);
    expect(r.ingredients?.map((t) => t.name)).toEqual(['bread']);
    const tags = await mockApi.listAttrs(tk, 'tags');
    expect(tags.filter((t) => t.name.toLowerCase() === 'breakfast')).toHaveLength(1);
  });

  it('rejects an invalid price with a field error', async () => {
    const tk = await tokenFor();
    await expect(
      mockApi.saveRecipe(tk, null, { title: 'x', description: '', time_minutes: 1, price: '4.5000', link: '', tags: [], ingredients: [] }),
    ).rejects.toMatchObject({ fields: { price: expect.any(Array) } });
  });

  it('deleting a tag removes it from recipes and counts usage', async () => {
    const tk = await tokenFor();
    const tags = await mockApi.listAttrs(tk, 'tags');
    const veg = tags.find((t) => t.name === 'Vegetarian')!;
    expect(veg.recipe_count).toBe(4);
    await mockApi.deleteAttr(tk, 'tags', veg.id);
    const recipes = await mockApi.listRecipes(tk, { tags: [], ingredients: [] });
    expect(recipes.every((r) => !(r.tags ?? []).some((t) => t.name === 'Vegetarian'))).toBe(true);
  });

  it('refuses unknown tokens with 401', async () => {
    await expect(mockApi.listRecipes('bad', { tags: [], ingredients: [] })).rejects.toMatchObject({ status: 401 });
  });
});
