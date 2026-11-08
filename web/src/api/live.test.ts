import { afterEach, describe, expect, it, vi } from 'vitest';
import { liveApi } from './live';
import { ApiError } from './types';

function stub(status: number, body: unknown) {
  const fn = vi.fn(async () => new Response(body === undefined ? null : JSON.stringify(body), { status }));
  vi.stubGlobal('fetch', fn);
  return fn;
}
afterEach(() => vi.unstubAllGlobals());

describe('live adapter', () => {
  it('sends the Token header and filter query', async () => {
    const fn = stub(200, []);
    await liveApi.listRecipes('abc', { tags: [1, 3], ingredients: [2] });
    const [url, init] = fn.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('/api/recipe/recipes/?tags=1%2C3&ingredients=2');
    expect((init.headers as Record<string, string>).Authorization).toBe('Token abc');
  });

  it('wraps tag and ingredient names as objects on save', async () => {
    const fn = stub(201, { id: 1 });
    await liveApi.saveRecipe('t', null, { title: 'x', description: '', time_minutes: 1, price: '1', link: '', tags: ['A'], ingredients: ['b'] });
    const init = (fn.mock.calls[0] as unknown as [string, RequestInit])[1];
    expect(JSON.parse(init.body as string)).toMatchObject({ tags: [{ name: 'A' }], ingredients: [{ name: 'b' }] });
  });

  it('uses the singular ingredient endpoint', async () => {
    const fn = stub(200, []);
    await liveApi.listAttrs('t', 'ingredients');
    expect((fn.mock.calls[0] as unknown as [string])[0]).toBe('/api/recipe/ingredient/');
  });

  it('surfaces DRF field errors and network failures', async () => {
    stub(400, { price: ['bad'] });
    await expect(liveApi.login('a', 'b')).rejects.toMatchObject({ status: 400, fields: { price: ['bad'] } });
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('x'); }));
    await expect(liveApi.me('t')).rejects.toEqual(expect.any(ApiError));
  });

  it('handles 204 deletes', async () => {
    stub(204, undefined);
    await expect(liveApi.deleteRecipe('t', 1)).resolves.toBeUndefined();
  });
});
