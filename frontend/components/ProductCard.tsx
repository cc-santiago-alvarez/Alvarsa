'use client';
import Link from 'next/link';
import ProductImage from './ProductImage';
import { IconHeart } from './icons';
import { useLang } from '@/providers/LangProvider';
import { useFavorites } from '@/providers/FavoritesProvider';
import { money } from '@/lib/format';
import type { Product } from '@/lib/types';

export default function ProductCard({ product, categoryLabel }: { product: Product; categoryLabel?: string }) {
  const { t, L } = useLang();
  const { isFav, toggleFav } = useFavorites();
  const materials = L(product.materialsEs, product.materialsEn);
  const fav = isFav(product.id);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => toggleFav(product.id)}
        aria-label="Favorito"
        style={{
          position: 'absolute', top: 12, right: 12, zIndex: 2, width: 36, height: 36, borderRadius: 999,
          background: 'rgba(255,255,255,0.92)', border: '1px solid var(--alv-line)', display: 'grid',
          placeItems: 'center', cursor: 'pointer', color: fav ? '#d6a81f' : '#141414',
        }}
      >
        <IconHeart size={18} filled={fav} />
      </button>
      <Link href={`/producto/${product.id}`} style={{ color: 'inherit', display: 'block' }}>
        <ProductImage imageId={product.imageIds?.[0]} alt={product.name} style={{ aspectRatio: '4 / 3.4', borderRadius: 16, border: '1px solid var(--alv-line)' }} />
        <div style={{ padding: '14px 2px 0' }}>
          {categoryLabel && <div className="alv-label" style={{ marginBottom: 6 }}>{categoryLabel}</div>}
          <div className="font-display" style={{ fontWeight: 700, fontSize: 18, color: '#141414' }}>{product.name}</div>
          {materials && <div style={{ color: '#6e6e6e', fontSize: 13.5, marginTop: 4 }}>{materials}</div>}
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: '#6e6e6e' }}>
              {t.from} <strong style={{ color: '#141414', fontSize: 15 }}>{money(product.price)}</strong> COP
            </span>
            <span style={{ color: '#9a7512', fontSize: 13.5, fontWeight: 600 }}>{t.view_piece} →</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
