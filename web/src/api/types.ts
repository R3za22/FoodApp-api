import type { components } from './schema';

type S = components['schemas'];

export type User = S['User'];
export type Tag = S['Tag'];
export type Ingredient = S['Ingredient'];
export type RecipeSummary = S['Recipe'];
export type RecipeDetail = S['RecipeDetail'];

/** Payload for create/update. New tag/ingredient names are created server side. */
export interface RecipeInput {
  title: string;
  description: string;
  time_minutes: number;
  price: string;
  link: string;
  tags: string[];
  ingredients: string[];
}

export interface RecipeFilters {
  tags: number[];
  ingredients: number[];
}

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
}

/** Field level errors as returned by DRF: { field: ["message"] } */
export type FieldErrors = Record<string, string[]>;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public fields: FieldErrors = {},
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export type AttrKind = 'tags' | 'ingredients';

/** One interface, two adapters (mock and live). */
export interface Api {
  mode: 'mock' | 'live';
  signUp(input: SignUpInput): Promise<void>;
  /** Returns the API token. */
  login(email: string, password: string): Promise<string>;
  me(token: string): Promise<User>;
  updateMe(token: string, patch: Partial<SignUpInput>): Promise<User>;
  listRecipes(token: string, filters: RecipeFilters): Promise<RecipeSummary[]>;
  getRecipe(token: string, id: number): Promise<RecipeDetail>;
  saveRecipe(token: string, id: number | null, input: RecipeInput): Promise<RecipeDetail>;
  deleteRecipe(token: string, id: number): Promise<void>;
  /** Uploads (or with null removes) the recipe photo; returns the image URL or null. */
  setImage(token: string, id: number, file: File | null): Promise<string | null>;
  listAttrs(token: string, kind: AttrKind): Promise<(Tag | Ingredient)[]>;
  createAttr(token: string, kind: AttrKind, name: string): Promise<Tag | Ingredient>;
  renameAttr(token: string, kind: AttrKind, id: number, name: string): Promise<Tag | Ingredient>;
  deleteAttr(token: string, kind: AttrKind, id: number): Promise<void>;
  /** Mock only: restore the seeded data. */
  resetDemo?(lang: 'en' | 'fa'): void;
}
