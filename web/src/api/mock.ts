import { DEMO_TOKEN } from './constants';
import { en, fa, type Seed } from '../mock/fixtures';
import {
  ApiError,
  type Api,
  type AttrKind,
  type Ingredient,
  type RecipeDetail,
  type RecipeFilters,
  type RecipeInput,
  type RecipeSummary,
  type Tag,
} from './types';

const KEY = 'foodapp.mock.v1';
export const DEMO_EMAIL = 'demo@example.com';
export const DEMO_PASSWORD = 'demo12345';

interface Attr {
  id: number;
  name: string;
}
interface StoredRecipe {
  id: number;
  title: string;
  description: string;
  time_minutes: number;
  price: string;
  link: string;
  tagIds: number[];
  ingredientIds: number[];
  image: string | null;
}
interface UserData {
  nextId: number;
  tags: Attr[];
  ingredients: Attr[];
  recipes: StoredRecipe[];
}
interface Account {
  id: number;
  name: string;
  email: string;
  password: string;
  token: string;
}
interface Db {
  nextUser: number;
  accounts: Account[];
  data: Record<number, UserData>;
}

const latency = Number(import.meta.env.VITE_MOCK_LATENCY ?? 120);
const sleep = () => new Promise((r) => setTimeout(r, latency));

export function seedData(seed: Seed): UserData {
  let id = 1;
  const tags = seed.tags.map((name) => ({ id: id++, name }));
  const ingredients = seed.ingredients.map((name) => ({ id: id++, name }));
  const recipes = seed.recipes.map((r) => ({
    id: id++,
    title: r.title,
    description: r.description,
    time_minutes: r.time,
    price: r.price,
    link: r.link,
    tagIds: r.tags.map((n) => tags.find((t) => t.name === n)!.id),
    ingredientIds: r.ingredients.map((n) => ingredients.find((t) => t.name === n)!.id),
    image: null,
  }));
  return { nextId: id, tags, ingredients, recipes };
}

function fresh(lang: 'en' | 'fa' = 'en'): Db {
  return {
    nextUser: 2,
    accounts: [{ id: 1, name: 'Demo Cook', email: DEMO_EMAIL, password: DEMO_PASSWORD, token: DEMO_TOKEN }],
    data: { 1: seedData(lang === 'fa' ? fa : en) },
  };
}

function load(): Db {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Db;
  } catch {
    /* storage blocked or corrupt: fall through to a fresh store */
  }
  return fresh();
}

let memory: Db | null = null;
const db = (): Db => (memory ??= load());
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(db()));
  } catch {
    /* storage unavailable: data lives for this session only */
  }
}

function failing(): boolean {
  try {
    return localStorage.getItem('foodapp.mock.fail') === '1';
  } catch {
    return false;
  }
}

async function guard(): Promise<void> {
  await sleep();
  if (failing()) throw new ApiError(0, 'network');
}

function account(token: string): Account {
  const a = db().accounts.find((x) => x.token === token);
  if (!a) throw new ApiError(401, 'Invalid token.');
  return a;
}
const dataFor = (token: string) => db().data[account(token).id];

function toDetail(d: UserData, r: StoredRecipe): RecipeDetail {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    time_minutes: r.time_minutes,
    price: r.price,
    link: r.link,
    image: r.image,
    tags: r.tagIds.map((id) => d.tags.find((t) => t.id === id)!).map(({ id, name }) => ({ id, name })),
    ingredients: r.ingredientIds
      .map((id) => d.ingredients.find((t) => t.id === id)!)
      .map(({ id, name }) => ({ id, name })),
  };
}

function resolve(d: UserData, kind: AttrKind, names: string[]): number[] {
  const list = d[kind];
  return names.map((raw) => {
    const name = raw.trim();
    const hit = list.find((a) => a.name.toLowerCase() === name.toLowerCase());
    if (hit) return hit.id;
    const a = { id: d.nextId++, name };
    list.push(a);
    return a.id;
  });
}

function validatePrice(price: string) {
  if (!/^\d{1,3}(\.\d{1,2})?$/.test(price)) {
    throw new ApiError(400, 'invalid', {
      price: ['Ensure that there are no more than 5 digits in total and 2 decimal places.'],
    });
  }
}

const countFor = (d: UserData, kind: AttrKind, id: number) =>
  d.recipes.filter((r) => (kind === 'tags' ? r.tagIds : r.ingredientIds).includes(id)).length;

export const mockApi: Api = {
  mode: 'mock',

  async signUp(input) {
    await guard();
    const fields: Record<string, string[]> = {};
    if (!/^\S+@\S+\.\S+$/.test(input.email)) fields.email = ['Enter a valid email address.'];
    if (input.password.length < 5) fields.password = ['Ensure this field has at least 5 characters.'];
    if (db().accounts.some((a) => a.email.toLowerCase() === input.email.toLowerCase())) {
      fields.email = ['user with this email already exists.'];
    }
    if (Object.keys(fields).length) throw new ApiError(400, 'invalid', fields);
    const id = db().nextUser++;
    db().accounts.push({ id, ...input, token: `mock-token-${id}-${Math.random().toString(16).slice(2, 8)}` });
    db().data[id] = { nextId: 1, tags: [], ingredients: [], recipes: [] };
    save();
  },

  async login(email, password) {
    await guard();
    const a = db().accounts.find((x) => x.email.toLowerCase() === email.toLowerCase() && x.password === password);
    if (!a) throw new ApiError(400, 'Unable to authenticate with provided credentials.', {
      non_field_errors: ['Unable to authenticate with provided credentials.'],
    });
    return a.token;
  },

  async me(token) {
    await guard();
    const a = account(token);
    return { email: a.email, name: a.name };
  },

  async updateMe(token, patch) {
    await guard();
    const a = account(token);
    if (patch.password !== undefined && patch.password.length < 5) {
      throw new ApiError(400, 'invalid', { password: ['Ensure this field has at least 5 characters.'] });
    }
    Object.assign(a, patch);
    save();
    return { email: a.email, name: a.name };
  },

  async listRecipes(token, f: RecipeFilters) {
    await guard();
    const d = dataFor(token);
    return d.recipes
      .filter((r) => !f.tags.length || r.tagIds.some((id) => f.tags.includes(id)))
      .filter((r) => !f.ingredients.length || r.ingredientIds.some((id) => f.ingredients.includes(id)))
      .sort((a, b) => b.id - a.id)
      .map((r): RecipeSummary => {
        const { description, image, ...rest } = toDetail(d, r);
        void description;
        void image;
        return rest;
      });
  },

  async getRecipe(token, id) {
    await guard();
    const d = dataFor(token);
    const r = d.recipes.find((x) => x.id === id);
    if (!r) throw new ApiError(404, 'Not found.');
    return toDetail(d, r);
  },

  async saveRecipe(token, id, input: RecipeInput) {
    await guard();
    const d = dataFor(token);
    if (!input.title.trim()) throw new ApiError(400, 'invalid', { title: ['This field may not be blank.'] });
    validatePrice(input.price);
    const patch = {
      title: input.title.trim(),
      description: input.description,
      time_minutes: input.time_minutes,
      price: input.price,
      link: input.link,
      tagIds: resolve(d, 'tags', input.tags),
      ingredientIds: resolve(d, 'ingredients', input.ingredients),
    };
    let r: StoredRecipe | undefined;
    if (id === null) {
      r = { id: d.nextId++, image: null, ...patch };
      d.recipes.push(r);
    } else {
      r = d.recipes.find((x) => x.id === id);
      if (!r) throw new ApiError(404, 'Not found.');
      Object.assign(r, patch);
    }
    save();
    return toDetail(d, r);
  },

  async deleteRecipe(token, id) {
    await guard();
    const d = dataFor(token);
    if (!d.recipes.some((r) => r.id === id)) throw new ApiError(404, 'Not found.');
    d.recipes = d.recipes.filter((r) => r.id !== id);
    save();
  },

  async setImage(token, id, file) {
    await guard();
    const d = dataFor(token);
    const r = d.recipes.find((x) => x.id === id);
    if (!r) throw new ApiError(404, 'Not found.');
    if (file && !file.type.startsWith('image/')) {
      throw new ApiError(400, 'invalid', { image: ['Upload a valid image.'] });
    }
    r.image = file ? URL.createObjectURL(file) : null; // object URL: lives for this session only
    save();
    return r.image;
  },

  async listAttrs(token, kind) {
    await guard();
    const d = dataFor(token);
    return [...d[kind]]
      .sort((a, b) => b.name.localeCompare(a.name))
      .map((a): Tag | Ingredient => ({ id: a.id, name: a.name, recipe_count: countFor(d, kind, a.id) }));
  },

  async createAttr(token, kind, name) {
    await guard();
    const d = dataFor(token);
    if (!name.trim()) throw new ApiError(400, 'invalid', { name: ['This field may not be blank.'] });
    const a = { id: d.nextId++, name: name.trim() };
    d[kind].push(a);
    save();
    return { ...a, recipe_count: 0 };
  },

  async renameAttr(token, kind, id, name) {
    await guard();
    const d = dataFor(token);
    const a = d[kind].find((x) => x.id === id);
    if (!a) throw new ApiError(404, 'Not found.');
    if (!name.trim()) throw new ApiError(400, 'invalid', { name: ['This field may not be blank.'] });
    a.name = name.trim();
    save();
    return { ...a, recipe_count: countFor(d, kind, id) };
  },

  async deleteAttr(token, kind, id) {
    await guard();
    const d = dataFor(token);
    d[kind] = d[kind].filter((x) => x.id !== id);
    for (const r of d.recipes) {
      const key = kind === 'tags' ? 'tagIds' : 'ingredientIds';
      r[key] = r[key].filter((x) => x !== id);
    }
    save();
  },

  resetDemo(lang) {
    memory = fresh(lang);
    save();
  },
};
