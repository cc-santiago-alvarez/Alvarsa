'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getProducts } from '@/lib/products';
import { useCategories, catLabel } from '@/lib/useCategories';
import { useLang } from '@/providers/LangProvider';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/lib/types';

function CatalogInner() {
  const { t, lang } = useLang();
  const { cats } = useCategories();
  const params = useSearchParams();
  const router = useRouter();
  const categoryId = params.get('categoryId') || '';
  const q = params.get('q') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getProducts({ categoryId: categoryId || undefined, q: q || undefined })
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [categoryId, q]);

  function setCategory(id: string) {
    const sp = new URLSearchParams();
    if (id) sp.set('categoryId', id);
    if (q) sp.set('q', q);
    router.push('/catalogo' + (sp.toString() ? `?${sp}` : ''));
  }

  return (
    <div className="alv-wrap" style={{ paddingTop: 34, paddingBottom: 30 }}>
      <span className="alv-kicker">{t.nav_catalog}</span>
      <h1 className="font-display" style={{ fontWeight: 800, fontSize: 34, marginTop: 10, color: '#141414' }}>{t.catalog_title}</h1>
      <p style={{ color: '#6e6e6e', marginTop: 8, maxWidth: 620 }}>{t.catalog_sub}</p>

      {/* Chips de categoría */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 22 }}>
        <button className="alv-chip" data-active={!categoryId} onClick={() => setCategory('')}>{t.filter_all}</button>
        {cats.map((c) => (
          <button key={c.id} className="alv-chip" data-active={categoryId === c.id} onClick={() => setCategory(c.id)}>
            {lang === 'es' ? c.nameEs : c.nameEn}
          </button>
        ))}
      </div>

      {q && <p style={{ marginTop: 16, color: '#6e6e6e', fontSize: 14 }}>“{q}” · {products.length} {products.length === 1 ? t.results_one : t.results_many}</p>}

      <div style={{ marginTop: 24, display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))' }}>
        {products.map((p) => (
          <ProductCard key={p.id} product={p} categoryLabel={catLabel(cats, p.categoryId, lang)} />
        ))}
      </div>

      {!loading && products.length === 0 && (
        <p style={{ marginTop: 40, color: '#6e6e6e', textAlign: 'center' }}>{t.empty_catalog}</p>
      )}
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="alv-wrap" style={{ padding: '40px 20px' }} />}>
      <CatalogInner />
    </Suspense>
  );
}
