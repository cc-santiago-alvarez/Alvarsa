'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as auth from '@/lib/auth';
import type { Me, Role } from '@/lib/types';

interface AuthCtx {
  me: Me | null;
  loading: boolean;
  authenticated: boolean;
  role: Role;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [meState, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const m = await auth.me();
      setMe(m);
    } catch {
      setMe({ authenticated: false, role: '', userId: '' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const m = await auth.login(email, password);
    setMe(m);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const m = await auth.register(email, password);
    setMe(m);
  }, []);

  const logout = useCallback(async () => {
    await auth.logout();
    setMe({ authenticated: false, role: '', userId: '' });
  }, []);

  const authenticated = !!meState?.authenticated;
  const role = meState?.role ?? '';

  return (
    <Ctx.Provider
      value={{
        me: meState,
        loading,
        authenticated,
        role,
        isAdmin: role === 'admin',
        login,
        register,
        logout,
        refresh,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth(): AuthCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAuth must be used within AuthProvider');
  return c;
}
