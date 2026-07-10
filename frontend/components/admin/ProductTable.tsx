'use client';
import ProductImage from '@/components/ProductImage';
import { IconTrash } from '@/components/icons';
import { useLang } from '@/providers/LangProvider';
import { useCategories, catLabel } from '@/lib/useCategories';
import { money } from '@/lib/format';
import type { Product } from '@/lib/types';

export default function ProductTable({
  products,
  onEdit,
  onDelete,
}: {
  products: Product[];
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
}) {
  const { t, lang } = useLang();
  const { cats } = useCategories();

  if (products.length === 0) return <p style={{ color: '#6e6e6e' }}>{t.adm_none}</p>;

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {products.map((p) => (
        <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 14, border: '1px solid var(--alv-line)', borderRadius: 14, padding: 10 }}>
          <ProductImage imageId={p.imageIds?.[0]} alt={p.name} style={{ width: 52, height: 52, borderRadius: 10, flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="font-display" style={{ fontWeight: 700, color: '#141414' }}>{p.name}</div>
            <div style={{ fontSize: 13, color: '#6e6e6e' }}>{catLabel(cats, p.categoryId, lang)} · {money(p.price)} COP</div>
          </div>
          <button onClick={() => onEdit(p)} className="alv-chip">{t.adm_edit}</button>
          <button onClick={() => onDelete(p)} aria-label={t.adm_delete} style={{ border: '1px solid var(--alv-line)', background: '#fff', borderRadius: 999, width: 38, height: 38, display: 'grid', placeItems: 'center', cursor: 'pointer', color: '#b3261e' }}><IconTrash size={17} /></button>
        </div>
      ))}
    </div>
  );
}
