import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { isDemo } from './api';
import { DEMO_TOKEN } from './api/constants';

const STORE = 'foodapp.token';

function read(): string | null {
  try {
    const t = localStorage.getItem(STORE);
    if (t) return t;
  } catch {
    /* ignore */
  }
  // the static demo is pre-signed-in with the sample account
  return isDemo ? DEMO_TOKEN : null;
}

interface Auth {
  token: string | null;
  signIn(token: string): void;
  signOut(): void;
}

const Ctx = createContext<Auth | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(read);
  const signIn = useCallback((t: string) => {
    try {
      localStorage.setItem(STORE, t);
    } catch {
      /* ignore */
    }
    setToken(t);
  }, []);
  const signOut = useCallback(() => {
    try {
      localStorage.removeItem(STORE);
    } catch {
      /* ignore */
    }
    // in the demo a signed-out visitor goes to the login screen; the demo account stays one click away
    setToken(null);
  }, []);
  const value = useMemo(() => ({ token, signIn, signOut }), [token, signIn, signOut]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): Auth {
  const v = useContext(Ctx);
  if (!v) throw new Error('AuthProvider missing');
  return v;
}

