'use client';
import { createContext, useContext, useState, useCallback } from 'react';

type Overlay = 'cart' | 'fav' | 'account' | 'menu' | null;

// Objetivo de AR: las URLs de los binarios 3D del producto que se está viendo.
export interface ARTarget {
  glbUrl: string; // .glb (Android/web) — requerido
  usdzUrl?: string; // .usdz (AR iOS) — opcional
  posterUrl?: string; // imagen de carga — opcional
  name: string;
  alt: string;
}

interface UICtx {
  overlay: Overlay;
  openCart: () => void;
  openFav: () => void;
  openAccount: () => void;
  openMenu: () => void;
  closeOverlay: () => void;
  // AR
  arTarget: ARTarget | null; // objetivo de AR o null si cerrado
  openAr: (target: ARTarget) => void;
  closeAr: () => void;
}

const Ctx = createContext<UICtx | null>(null);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [arTarget, setArTarget] = useState<ARTarget | null>(null);

  const openCart = useCallback(() => setOverlay('cart'), []);
  const openFav = useCallback(() => setOverlay('fav'), []);
  const openAccount = useCallback(() => setOverlay('account'), []);
  const openMenu = useCallback(() => setOverlay('menu'), []);
  const closeOverlay = useCallback(() => setOverlay(null), []);

  const openAr = useCallback((target: ARTarget) => setArTarget(target), []);
  const closeAr = useCallback(() => setArTarget(null), []);

  return (
    <Ctx.Provider
      value={{ overlay, openCart, openFav, openAccount, openMenu, closeOverlay, arTarget, openAr, closeAr }}
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
