'use client';
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import type { OptionSelection, Product } from '@/lib/types';

export interface CartItem {
  key: string;
  id: string;
  name: string;
  price: number;
  img0: string; // primer imageId (o '' si no hay)
  sel: OptionSelection;
  qty: number;
}

interface CartCtx {
  cart: CartItem[];
  count: number;
  subtotal: number;
  addToCart: (p: Product, sel: OptionSelection) => void;
  incItem: (key: string) => void;
  decItem: (key: string) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
}

const Ctx = createContext<CartCtx | null>(null);
const KEY = 'alv_cart';

function itemKey(id: string, sel: OptionSelection) {
  return [id, sel.metal, sel.madera, sel.medida].join('|');
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || '[]');
      if (Array.isArray(saved)) setCart(saved);
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(KEY, JSON.stringify(cart));
  }, [cart, hydrated]);

  const addToCart = useCallback((p: Product, sel: OptionSelection) => {
    const key = itemKey(p.id, sel);
    setCart((c) => {
      const copy = c.map((i) => ({ ...i }));
      const existing = copy.find((i) => i.key === key);
      if (existing) existing.qty += 1;
      else
        copy.push({
          key,
          id: p.id,
          name: p.name,
          price: p.price,
          img0: p.imageIds?.[0] || '',
          sel: { ...sel },
          qty: 1,
        });
      return copy;
    });
  }, []);

  const incItem = useCallback((key: string) => setCart((c) => c.map((i) => (i.key === key ? { ...i, qty: i.qty + 1 } : i))), []);
  const decItem = useCallback((key: string) => setCart((c) => c.map((i) => (i.key === key ? { ...i, qty: Math.max(1, i.qty - 1) } : i))), []);
  const removeItem = useCallback((key: string) => setCart((c) => c.filter((i) => i.key !== key)), []);
  const clearCart = useCallback(() => setCart([]), []);

  const count = useMemo(() => cart.reduce((n, i) => n + i.qty, 0), [cart]);
  const subtotal = useMemo(() => cart.reduce((n, i) => n + i.price * i.qty, 0), [cart]);

  return (
    <Ctx.Provider value={{ cart, count, subtotal, addToCart, incItem, decItem, removeItem, clearCart }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart(): CartCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('useCart must be used within CartProvider');
  return c;
}
