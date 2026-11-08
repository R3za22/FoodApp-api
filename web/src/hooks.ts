import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from './api';
import { useAuth } from './auth';

export interface Loaded<T> {
  data: T | null;
  error: ApiError | null;
  loading: boolean;
  reload(): void;
}

/** Runs an authenticated API call; a 401 signs the user out. */
export function useLoad<T>(fn: (token: string) => Promise<T>, deps: unknown[]): Loaded<T> {
  const { token, signOut } = useAuth();
  const [state, setState] = useState<{ data: T | null; error: ApiError | null; loading: boolean }>({
    data: null,
    error: null,
    loading: true,
  });
  const [tick, setTick] = useState(0);
  const fnRef = useRef(fn);
  fnRef.current = fn;
  useEffect(() => {
    if (!token) return;
    let live = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    fnRef.current(token).then(
      (data) => live && setState({ data, error: null, loading: false }),
      (e: unknown) => {
        if (!live) return;
        const err = e instanceof ApiError ? e : new ApiError(0, 'network');
        if (err.status === 401) signOut();
        setState({ data: null, error: err, loading: false });
      },
    );
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, tick, signOut, ...deps]);
  const reload = useCallback(() => setTick((n) => n + 1), []);
  return { ...state, reload };
}

/** First message of a DRF field error. */
export function fieldMessage(err: unknown, field: string): string | undefined {
  return err instanceof ApiError ? err.fields[field]?.[0] : undefined;
}

/** Deterministic plate colours for recipes without a photo. */
const PLATES = [
  { bg: '#F6DAD4', a: '#C73A25', b: '#F2D544' },
  { bg: '#D3E8DA', a: '#2F7A4A', b: '#F2D544' },
  { bg: '#F8E9A8', a: '#D98B2B', b: '#FFFFFF' },
  { bg: '#D3E8DA', a: '#12301F', b: '#2F7A4A' },
];
export const plateFor = (id: number) => PLATES[Math.abs(id) % PLATES.length];

export function filterByTitle<T extends { title: string }>(items: T[], q: string): T[] {
  const needle = q.trim().toLowerCase();
  return needle ? items.filter((r) => r.title.toLowerCase().includes(needle)) : items;
}

export function parseIds(raw: string | null): number[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0);
}

/** Client-side validation of the edit form; returns message keys per field. */
export function validateRecipeForm(v: { title: string; time: string; price: string; link: string }) {
  const errors: Partial<Record<'title' | 'time' | 'price' | 'link', 'errTitleRequired' | 'errTime' | 'errPrice' | 'errLink'>> = {};
  if (!v.title.trim()) errors.title = 'errTitleRequired';
  if (!/^\d+$/.test(v.time.trim()) || Number(v.time) < 1) errors.time = 'errTime';
  if (!/^\d{1,3}(\.\d{1,2})?$/.test(v.price.trim())) errors.price = 'errPrice';
  if (v.link.trim() && !/^https?:\/\/\S+$/i.test(v.link.trim())) errors.link = 'errLink';
  return errors;
}
