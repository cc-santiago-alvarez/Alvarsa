'use client';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getProduct, getProducts } from '@/lib/products';
import { useCategories, catLabel } from '@/lib/useCategories';
import { useLang } from '@/providers/LangProvider';
import { useCart } from '@/providers/CartProvider';
import { useUI } from '@/providers/UIProvider';
import { imageUrl } from '@/lib/api';
import { OPTS, type OptAxis } from '@/lib/opts';
import { money } from '@/lib/format';
import ProductImage from '@/components/ProductImage';
import ProductCard from '@/components/ProductCard';
import { IconArrowLeft, IconHeart } from '@/components/icons';
import { useFavorites } from '@/providers/FavoritesProvider';
import type { Product, OptionSelection } from '@/lib/types';

const AXES: OptAxis[] = ['metal', 'madera', 'medida'];

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { t, lang } = useLang();
  const { cats } = useCategories();
  const { addToCart } = useCart();
  const { openCart, openAr } = useUI();
  const { isFav, toggleFav } = useFavorites();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [sel, setSel] = useState<OptionSelection>({ metal: '', madera: '', medida: '' });

  useEffect(() => {
    setNotFound(false);
    getProduct(id)
      .then((p) => {
        setProduct(p);
        setGalleryIdx(0);
        // selección por defecto = primera opción disponible de cada eje
        setSel({
          metal: p.customization.metal[0] || '',
          madera: p.customization.madera[0] || '',
          medida: p.customization.medida[0] || '',
        });
        getProducts({ categoryId: p.categoryId })
          .then((all) => setRelated(all.filter((x) => x.id !== p.id).slice(0, 3)))
          .catch(() => {});
      })
      .catch(() => setNotFound(true));
  }, [id]);

  const availableAxes = useMemo(
    () => (product ? AXES.filter((a) => (product.customization[a]?.length ?? 0) > 0) : []),
    [product]
  );

  if (notFound) {
    return (
      <div className="alv-wrap" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <p style={{ color: '#6e6e6e' }}>{t.pd_notfound}</p>
        <Link href="/catalogo" className="alv-btn-dark" style={{ marginTop: 18 }}>{t.pd_back}</Link>
      </div>
    );
  }
  if (!product) return <div className="alv-wrap" style={{ padding: '60px 20px' }} />;

  const desc = lang === 'es' ? product.descriptionEs : product.descriptionEn;
  const materials = lang === 'es' ? product.materialsEs : product.materialsEn;
  const fav = isFav(product.id);
  const mainImage = product.imageIds[galleryIdx];

  function handleAdd() {
    addToCart(product!, sel);
    openCart();
  }

  return (
    <div className="alv-wrap" style={{ paddingTop: 24, paddingBottom: 30 }}>
      <Link href="/catalogo" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#6e6e6e', fontSize: 14 }}>
        <IconArrowLeft size={16} /> {t.pd_back}
      </Link>

      <div style={{ display: 'grid', gap: 34, gridTemplateColumns: '1fr', marginTop: 20 }} className="alv-pd-grid">
        {/* GALERÍA */}
        <div>
          <div style={{ position: 'relative' }}>
            <ProductImage imageId={mainImage} alt={product.name} style={{ aspectRatio: '4 / 3.4', borderRadius: 20, border: '1px solid var(--alv-line)' }} />
            <button
              onClick={() => openAr(mainImage ? imageUrl(mainImage) : '')}
              className="alv-btn-dark"
              style={{ position: 'absolute', bottom: 14, right: 14, padding: '9px 16px', fontSize: 14 }}
            >
              AR
            </button>
          </div>
          {product.imageIds.length > 1 && (
            <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
              {product.imageIds.map((imgId, i) => (
                <button key={imgId} onClick={() => setGalleryIdx(i)} style={{ padding: 0, border: i === galleryIdx ? '2px solid #d6a81f' : '1px solid var(--alv-line)', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', background: 'none' }}>
                  <ProductImage imageId={imgId} alt={`${product.name} ${i + 1}`} style={{ width: 68, height: 68 }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* INFO */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div>
              <div className="alv-label">{catLabel(cats, product.categoryId, lang)} · REF ALV-{product.id.slice(0, 6).toUpperCase()}</div>
              <h1 className="font-display" style={{ fontWeight: 800, fontSize: 34, marginTop: 8, color: '#141414' }}>{product.name}</h1>
            </div>
            <button onClick={() => toggleFav(product.id)} aria-label="Favorito" style={{ width: 42, height: 42, borderRadius: 999, border: '1px solid var(--alv-line)', background: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer', color: fav ? '#d6a81f' : '#141414', flexShrink: 0 }}>
              <IconHeart size={20} filled={fav} />
            </button>
          </div>

          {desc && <p style={{ marginTop: 14, color: '#4a4a4a', lineHeight: 1.65 }}>{desc}</p>}

          <div style={{ marginTop: 18, fontSize: 24, fontWeight: 800, color: '#141414' }} className="font-display">
            {money(product.price)} <span style={{ fontSize: 14, fontWeight: 600, color: '#6e6e6e' }}>COP</span>
          </div>

          {/* Materiales / dimensiones / entrega */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginTop: 20, borderTop: '1px solid var(--alv-line)', borderBottom: '1px solid var(--alv-line)', padding: '16px 0' }}>
            {materials && <Info label={t.pd_materials} value={materials} />}
            {product.dims && <Info label={t.pd_dims} value={product.dims} />}
            <Info label={t.pd_lead} value={t.pd_lead_val} />
          </div>

          {/* Personalización */}
          {availableAxes.length > 0 && (
            <div style={{ marginTop: 22 }}>
              <div className="font-display" style={{ fontWeight: 700, fontSize: 18, marginBottom: 12, color: '#141414' }}>{t.pd_custom}</div>
              {availableAxes.map((axis) => (
                <div key={axis} style={{ marginBottom: 14 }}>
                  <div className="alv-label" style={{ marginBottom: 8 }}>{OPTS[axis][lang]}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {product.customization[axis].map((v) => {
                      const choice = OPTS[axis].opts.find((o) => o.v === v);
                      const label = choice ? choice[lang] : v;
                      return (
                        <button key={v} className="alv-chip" data-active={sel[axis] === v} onClick={() => setSel((s) => ({ ...s, [axis]: v }))}>
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              {sel.medida === 'custom' && (
                <p style={{ fontSize: 13, color: '#9a7512', background: '#fbf4dc', border: '1px solid #ecdca0', borderRadius: 10, padding: '10px 12px', marginTop: 6 }}>{t.pd_bespoke_hint}</p>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            <button onClick={handleAdd} className="alv-btn-gold" style={{ flex: 1, justifyContent: 'center', minWidth: 200 }}>{t.pd_add}</button>
          </div>
          <p style={{ fontSize: 13, color: '#6e6e6e', marginTop: 12, lineHeight: 1.5 }}>{t.pd_note}</p>
        </div>
      </div>

      {/* RELACIONADOS */}
      {related.length > 0 && (
        <section style={{ marginTop: 50 }}>
          <h2 className="font-display" style={{ fontWeight: 800, fontSize: 24, marginBottom: 18, color: '#141414' }}>{t.pd_related}</h2>
          <div style={{ display: 'grid', gap: 22, gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))' }}>
            {related.map((p) => (
              <ProductCard key={p.id} product={p} categoryLabel={catLabel(cats, p.categoryId, lang)} />
            ))}
          </div>
        </section>
      )}

      <style>{`@media (min-width: 861px) { .alv-pd-grid { grid-template-columns: 1.05fr 0.95fr !important; } }`}</style>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="alv-label" style={{ marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, color: '#141414' }}>{value}</div>
    </div>
  );
}
