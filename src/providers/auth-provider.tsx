import { isAxiosError } from 'axios';
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';

import { getMe } from '@/lib/auth-api';
import { sessionStorage } from '@/lib/session-storage';
import { User } from '@/types/api';

const TOKEN_KEY = 'yuvaconnect_access_token';
const USER_KEY = 'yuvaconnect_user';

type AuthContextValue = {
  token: string | null;
  user: User | null;
  /** True only while the very first session restore is in flight. */
  isLoading: boolean;
  /** True when a cached session is shown but the server could not be reached. */
  isOffline: boolean;
  setSession: (token: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User) => void;
  /** Re-validate the cached session after a network failure. */
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/** The token is only discarded when the server actively rejects it. */
function isAuthRejection(error: unknown): boolean {
  if (!isAxiosError(error)) return false;
  const status = error.response?.status;
  return status === 401 || status === 403;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const cancelled = useRef(false);

  useEffect(() => {
    cancelled.current = false;

    async function restoreSession() {
      try {
        const savedToken = await sessionStorage.getItem(TOKEN_KEY);
        if (!savedToken) return;

        // Show the cached identity immediately so the app opens straight into
        // the right dashboard instead of flashing the signed-out state — and so
        // a cold start without a network still works.
        const cachedUser = await sessionStorage.getItem(USER_KEY);
        let hydratedFromCache = false;
        if (cachedUser) {
          try {
            setUser(JSON.parse(cachedUser) as User);
            hydratedFromCache = true;
          } catch {
            /* corrupt cache — the live fetch below will replace it */
          }
        }
        if (cancelled.current) return;
        setToken(savedToken);
        // Only stop the splash early when we actually have an identity to show.
        // Otherwise `isLoading` stays true so no screen can briefly render its
        // "you are signed out" state for a user who is in fact signed in.
        if (hydratedFromCache) setIsLoading(false);

        // Then revalidate in the background.
        try {
          const fresh = await getMe(savedToken);
          if (cancelled.current) return;
          setUser(fresh);
          setIsOffline(false);
          await sessionStorage.setItem(USER_KEY, JSON.stringify(fresh));
        } catch (error) {
          if (isAuthRejection(error)) {
            // The server says this session is dead — sign out.
            await sessionStorage.removeItem(TOKEN_KEY);
            await sessionStorage.removeItem(USER_KEY);
            if (cancelled.current) return;
            setToken(null);
            setUser(null);
            setIsOffline(false);
          } else {
            // Network hiccup or a 5xx: keep the session and let each screen show
            // its own retry state rather than silently logging the user out.
            setIsOffline(true);
          }
        }
      } catch {
        /* storage unavailable — stay signed out rather than hanging */
      } finally {
        if (!cancelled.current) setIsLoading(false);
      }
    }

    void restoreSession();
    return () => {
      cancelled.current = true;
    };
  }, []);

  async function setSession(nextToken: string, nextUser: User) {
    await sessionStorage.setItem(TOKEN_KEY, nextToken);
    await sessionStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
    setIsOffline(false);
  }

  async function signOut() {
    await sessionStorage.removeItem(TOKEN_KEY);
    await sessionStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    setIsOffline(false);
  }

  async function refresh() {
    if (!token) return;
    try {
      const fresh = await getMe(token);
      setUser(fresh);
      setIsOffline(false);
      await sessionStorage.setItem(USER_KEY, JSON.stringify(fresh));
    } catch (error) {
      if (isAuthRejection(error)) await signOut();
      else setIsOffline(true);
    }
  }

  return (
    <AuthContext.Provider
      value={{ token, user, isLoading, isOffline, setSession, signOut, setUser, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
