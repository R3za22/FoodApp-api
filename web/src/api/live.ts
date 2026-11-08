import {
  ApiError,
  type Api,
  type AttrKind,
  type FieldErrors,
  type RecipeFilters,
  type RecipeInput,
} from './types';

const base = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
const ATTR_PATH: Record<AttrKind, string> = { tags: 'tags', ingredients: 'ingredient' };

async function request<T>(
  path: string,
  opts: { method?: string; token?: string; json?: unknown; form?: FormData } = {},
): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (opts.token) headers.Authorization = `Token ${opts.token}`;
  let body: BodyInit | undefined;
  if (opts.json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(opts.json);
  } else if (opts.form) {
    body = opts.form;
  }
  let res: Response;
  try {
    res = await fetch(`${base}${path}`, { method: opts.method ?? 'GET', headers, body });
  } catch {
    throw new ApiError(0, 'network');
  }
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  const data = text ? JSON.parse(text) : undefined;
  if (!res.ok) {
    const fields: FieldErrors = data && typeof data === 'object' && !Array.isArray(data) ? data : {};
    throw new ApiError(res.status, data?.detail ?? `HTTP ${res.status}`, fields);
  }
  return data as T;
}

function query(f: RecipeFilters): string {
  const p = new URLSearchParams();
  if (f.tags.length) p.set('tags', f.tags.join(','));
  if (f.ingredients.length) p.set('ingredients', f.ingredients.join(','));
  const s = p.toString();
  return s ? `?${s}` : '';
}

export const liveApi: Api = {
  mode: 'live',
  async signUp(input) {
    await request('/api/user/create/', { method: 'POST', json: input });
  },
  async login(email, password) {
    const r = await request<{ token: string }>('/api/user/token/', { method: 'POST', json: { email, password } });
    return r.token;
  },
  me: (token) => request('/api/user/me/', { token }),
  updateMe: (token, patch) => request('/api/user/me/', { method: 'PATCH', token, json: patch }),
  listRecipes: (token, f) => request(`/api/recipe/recipes/${query(f)}`, { token }),
  getRecipe: (token, id) => request(`/api/recipe/recipes/${id}/`, { token }),
  saveRecipe(token, id, input: RecipeInput) {
    const json = {
      ...input,
      tags: input.tags.map((name) => ({ name })),
      ingredients: input.ingredients.map((name) => ({ name })),
    };
    return id === null
      ? request('/api/recipe/recipes/', { method: 'POST', token, json })
      : request(`/api/recipe/recipes/${id}/`, { method: 'PATCH', token, json });
  },
  deleteRecipe: (token, id) => request(`/api/recipe/recipes/${id}/`, { method: 'DELETE', token }),
  async setImage(token, id, file) {
    if (!file) {
      const r = await request<{ image: string | null }>(`/api/recipe/recipes/${id}/`, {
        method: 'PATCH',
        token,
        json: { image: null },
      });
      return r.image;
    }
    const form = new FormData();
    form.append('image', file);
    const r = await request<{ image: string }>(`/api/recipe/recipes/${id}/upload-image/`, {
      method: 'POST',
      token,
      form,
    });
    return r.image;
  },
  listAttrs: (token, kind) => request(`/api/recipe/${ATTR_PATH[kind]}/`, { token }),
  createAttr: (token, kind, name) =>
    request(`/api/recipe/${ATTR_PATH[kind]}/`, { method: 'POST', token, json: { name } }),
  renameAttr: (token, kind, id, name) =>
    request(`/api/recipe/${ATTR_PATH[kind]}/${id}/`, { method: 'PATCH', token, json: { name } }),
  deleteAttr: (token, kind, id) =>
    request(`/api/recipe/${ATTR_PATH[kind]}/${id}/`, { method: 'DELETE', token }),
};
