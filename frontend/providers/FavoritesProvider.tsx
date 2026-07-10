'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface FavCtx {
  favorites: string[];
  isFav: (id: string) => boolean;
  toggleFav: (id: string) => void;
}

const Ctx = createContext<FavCtx | null>(null);
const KEY = 'alv_favorites';

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || '[]');
      if (Array.isArray(saved)) setFavorites(saved);
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(KEY, JSON.stringify(favorites));
  }, [favorites, hydrated]);

  const toggleFav = useCallback((id: string) => {
    setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
  }, []);

  const isFav = useCallback((id: string) => favorites.includes(id), [favorites]);

  return <Ctx.Provider value={{ favorites, isFav, toggleFav }}>{children}</Ctx.Provider>;
}

export function useFavorites(): FavCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('useFavorites must be used within FavoritesProvider');
  return c;
}
