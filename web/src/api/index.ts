import { liveApi } from './live';
import { mockApi } from './mock';
import type { Api } from './types';

/** Demo builds are always mock; otherwise VITE_API_MODE picks the adapter. */
export const isDemo = import.meta.env.VITE_DEMO === '1';
export const api: Api =
  isDemo || (import.meta.env.VITE_API_MODE ?? 'mock') !== 'live' ? mockApi : liveApi;

export * from './types';
