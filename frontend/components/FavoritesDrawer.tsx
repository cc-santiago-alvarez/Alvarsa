'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Drawer from './Drawer';
import ProductImage from './ProductImage';
import { IconTrash } from './icons';
import { useLang } from '@/providers/LangProvider';
import { useFavorites } from '@/providers/FavoritesProvider';
import { useUI } from '@/providers/UIProvider';
import { getProducts } from '@/lib/products';
import { money } from '@/lib/format';
import type { Product } from '@/lib/types';

export default function FavoritesDrawer() {
  const { t } = useLang();
  const { favorites, toggleFav } = useFavorites();
  const { overlay, closeOverlay } = useUI();
  const open = overlay === 'fav';
  const [all, setAll] = useState<Product[]>([]);

  useEffect(() => {
    if (open && all.length === 0) getProducts().then(setAll).catch(() => {});
  }, [open]);

  const items = all.filter((p) => favorites.includes(p.id));

  return (
    <Drawer open={open} onClose={closeOverlay} title={t.fav_title}>
      {favorites.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p style={{ color: '#6e6e6e' }}>{t.fav_empty}</p>
          <Link href="/catalogo" onClick={closeOverlay} className="alv-btn-dark" style={{ marginTop: 18 }}>{t.fav_empty_cta}</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {items.map((p) => (
            <div key={p.id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <ProductImage imageId={p.imageIds?.[0]} alt={p.name} style={{ width: 60, height: 60, borderRadius: 12, border: '1px solid var(--alv-line)', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="font-display" style={{ fontWeight: 700, color: '#141414', fontSize: 15 }}>{p.name}</div>
                <div style={{ fontSize: 13, color: '#6e6e6e' }}>{money(p.price)} COP</div>
                <Link href={`/producto/${p.id}`} onClick={closeOverlay} style={{ fontSize: 13, fontWeight: 600 }}>{t.fav_view} →</Link>
              </div>
              <button onClick={() => toggleFav(p.id)} aria-label="Quitar" style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#8c8c8c' }}><IconTrash size={16} /></button>
            </div>
          ))}
        </div>
      )}
    </Drawer>
  );
}
