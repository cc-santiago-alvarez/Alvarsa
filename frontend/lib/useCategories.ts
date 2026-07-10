'use client';
import { useEffect, useState } from 'react';
import { getCategories } from './categories';
import type { Category } from './types';

// Caché a nivel de módulo para no re-pedir categorías en cada montaje.
let cache: Category[] | null = null;
let inflight: Promise<Category[]> | null = null;

export function useCategories() {
  const [cats, setCats] = useState<Category[]>(cache || []);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    if (cache) return;
    if (!inflight) inflight = getCategories().then((c) => (cache = c));
    inflight
      .then((c) => setCats(c))
      .catch(() => setCats([]))
      .finally(() => setLoading(false));
  }, []);

  return { cats, loading };
}

export function catLabel(cats: Category[], id: string, lang: 'es' | 'en'): string {
  const c = cats.find((x) => x.id === id);
  return c ? (lang === 'es' ? c.nameEs : c.nameEn) : '';
}
