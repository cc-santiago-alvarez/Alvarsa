'use client';
import { createContext, useContext, useState, useCallback } from 'react';

type Overlay = 'cart' | 'fav' | 'account' | 'menu' | null;

interface UICtx {
  overlay: Overlay;
  openCart: () => void;
  openFav: () => void;
  openAccount: () => void;
  openMenu: () => void;
  closeOverlay: () => void;
  // AR
  arImage: string | null; // url de imagen o null si cerrado
  openAr: (imageUrl: string) => void;
  closeAr: () => void;
}

const Ctx = createContext<UICtx | null>(null);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [arImage, setArImage] = useState<string | null>(null);

  const openCart = useCallback(() => setOverlay('cart'), []);
  const openFav = useCallback(() => setOverlay('fav'), []);
  const openAccount = useCallback(() => setOverlay('account'), []);
  const openMenu = useCallback(() => setOverlay('menu'), []);
  const closeOverlay = useCallback(() => setOverlay(null), []);

  const openAr = useCallback((imageUrl: string) => setArImage(imageUrl), []);
  const closeAr = useCallback(() => setArImage(null), []);

  return (
    <Ctx.Provider
      value={{ overlay, openCart, openFav, openAccount, openMenu, closeOverlay, arImage, openAr, closeAr }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useUI(): UICtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('useUI must be used within UIProvider');
  return c;
}
