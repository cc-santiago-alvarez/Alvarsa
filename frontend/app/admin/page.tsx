'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useLang } from '@/providers/LangProvider';
import { useAuth } from '@/providers/AuthProvider';
import { useUI } from '@/providers/UIProvider';
import { getProducts, deleteProduct } from '@/lib/products';
import ProductForm from '@/components/admin/ProductForm';
import ProductTable from '@/components/admin/ProductTable';
import { IconArrowLeft } from '@/components/icons';
import type { Product } from '@/lib/types';

export default function AdminPage() {
  const { t } = useLang();
  const { loading, isAdmin } = useAuth();
  const { openAccount } = useUI();

  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [createdCount, setCreatedCount] = useState(0);
  const [flash, setFlash] = useState('');
  const formTop = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isAdmin) getProducts().then(setProducts).catch(() => {});
  }, [isAdmin]);

  function refresh() {
    getProducts().then(setProducts).catch(() => {});
  }

  function onSaved(p: Product, created: boolean) {
    setFlash(created ? t.adm_ok_created : t.adm_ok_updated);
    if (created) setCreatedCount((n) => n + 1);
    setEditing(null);
    refresh();
    setTimeout(() => setFlash(''), 3000);
  }

  async function onDelete(p: Product) {
    if (!confirm(t.adm_confirm_delete)) return;
    try {
      await deleteProduct(p.id);
      if (editing?.id === p.id) setEditing(null);
      refresh();
    } catch {}
  }

  function startEdit(p: Product) {
    setEditing(p);
    formTop.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (loading) return <div className="alv-wrap" style={{ padding: '60px 20px' }} />;

  if (!isAdmin) {
    return (
      <div className="alv-wrap" style={{ padding: '70px 20px', textAlign: 'center', maxWidth: 520 }}>
        <h1 className="font-display" style={{ fontWeight: 800, fontSize: 26, color: '#141414' }}>{t.adm_kicker}</h1>
        <p style={{ color: '#6e6e6e', marginTop: 12 }}>{t.adm_no_access}</p>
        <button onClick={openAccount} className="alv-btn-gold" style={{ marginTop: 20 }}>{t.acc_login}</button>
      </div>
    );
  }

  return (
    <div className="alv-wrap" style={{ paddingTop: 26, paddingBottom: 40 }} ref={formTop}>
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#6e6e6e', fontSize: 14 }}>
        <IconArrowLeft size={16} /> {t.adm_back_store}
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginTop: 14 }}>
        <div>
          <span className="alv-kicker">{t.adm_kicker}</span>
          <h1 className="font-display" style={{ fontWeight: 900, fontSize: 'clamp(30px, 5vw, 42px)', marginTop: 8, color: '#141414' }}>{editing ? t.adm_edit + ' — ' + editing.name : t.adm_title}</h1>
          <p style={{ color: '#6e6e6e', marginTop: 6, maxWidth: 520 }}>{t.adm_sub}</p>
        </div>
        <div style={{ border: '1px solid var(--alv-line)', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="font-display" style={{ fontWeight: 900, fontSize: 26, color: '#141414' }}>{createdCount}</span>
          <span style={{ fontSize: 13, color: '#6e6e6e', maxWidth: 120 }}>{t.adm_created_count}</span>
        </div>
      </div>

      {flash && <div style={{ marginTop: 18, background: '#eaf6ea', border: '1px solid #bfe0bf', color: '#256a2b', borderRadius: 12, padding: '12px 16px', fontSize: 14 }}>{flash}</div>}

      <div style={{ marginTop: 22 }}>
        <ProductForm editing={editing} onSaved={onSaved} onCancel={() => setEditing(null)} />
      </div>

      <div style={{ marginTop: 40 }}>
        <h2 className="font-display" style={{ fontWeight: 800, fontSize: 24, color: '#141414', marginBottom: 16 }}>{t.adm_products_title}</h2>
        <ProductTable products={products} onEdit={startEdit} onDelete={onDelete} />
      </div>
    </div>
  );
}
