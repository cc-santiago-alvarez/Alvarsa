'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { DICT, type Lang, type Dict } from '@/lib/dict';

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dict;
  L: <T>(es: T, en: T) => T; // helper para elegir campo por idioma
}

const Ctx = createContext<LangCtx | null>(null);
const KEY = 'alv_lang';

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('es');

  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    if (saved === 'es' || saved === 'en') setLangState(saved);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem(KEY, l);
  }, []);

  const L = useCallback(<T,>(es: T, en: T): T => (lang === 'es' ? es : en), [lang]);

  return (
    <Ctx.Provider value={{ lang, setLang, t: DICT[lang], L }}>{children}</Ctx.Provider>
  );
}

export function useLang(): LangCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('useLang must be used within LangProvider');
  return c;
}
