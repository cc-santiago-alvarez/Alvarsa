'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getProducts } from '@/lib/products';
import { useCategories, catLabel } from '@/lib/useCategories';
import { useLang } from '@/providers/LangProvider';
import { useUI } from '@/providers/UIProvider';
import { imageUrl } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import ProductImage from '@/components/ProductImage';
import type { Product } from '@/lib/types';

export default function HomePage() {
  const { t, lang } = useLang();
  const { cats } = useCategories();
  const { openAr } = useUI();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    getProducts().then(setProducts).catch(() => setProducts([]));
  }, []);

  const featured = products.slice(0, 4);
  const moment = products[0];
  const countByCat = (id: string) => products.filter((p) => p.categoryId === id).length;

  return (
    <div>
      {/* HERO */}
      <section className="alv-wrap" style={{ paddingTop: 46, paddingBottom: 30 }}>
        <div style={{ display: 'grid', gap: 30, gridTemplateColumns: '1fr', alignItems: 'center' }} className="alv-hero-grid">
          <div>
            <span className="alv-kicker">{t.hero_kicker}</span>
            <h1 className="font-display" style={{ fontWeight: 900, fontSize: 'clamp(40px, 7vw, 76px)', lineHeight: 1.02, marginTop: 16, color: '#141414' }}>
              {t.hero_title_1}<br /><span style={{ color: '#d6a81f' }}>{t.hero_title_2}</span>
            </h1>
            <p style={{ marginTop: 18, color: '#4a4a4a', fontSize: 17, maxWidth: 480, lineHeight: 1.6 }}>{t.hero_sub}</p>
            <div style={{ display: 'flex', gap: 12, marginTop: 26, flexWrap: 'wrap' }}>
              <Link href="/catalogo" className="alv-btn-gold">{t.hero_cta1}</Link>
              <Link href="/contacto" className="alv-btn-dark">{t.hero_cta2}</Link>
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <ProductImage imageId={moment?.imageIds?.[0]} alt="Alvarsa" style={{ aspectRatio: '4 / 3.2', borderRadius: 22, border: '1px solid var(--alv-line)' }} />
          </div>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section className="alv-wrap" style={{ paddingTop: 40, paddingBottom: 20 }}>
        <span className="alv-kicker">{t.cat_kicker}</span>
        <h2 className="font-display" style={{ fontWeight: 800, fontSize: 30, marginTop: 10, marginBottom: 20, color: '#141414' }}>{t.cat_title}</h2>
        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
          {cats.map((c) => (
            <Link key={c.id} href={`/catalogo?categoryId=${c.id}`} style={{ color: 'inherit' }}>
              <div style={{ border: '1px solid var(--alv-line)', borderRadius: 16, padding: 18, background: 'var(--alv-panel)', minHeight: 108, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <span className="font-display" style={{ fontWeight: 700, fontSize: 18, color: '#141414' }}>{lang === 'es' ? c.nameEs : c.nameEn}</span>
                <span style={{ color: '#6e6e6e', fontSize: 13 }}>{countByCat(c.id)} {countByCat(c.id) === 1 ? t.results_one : t.results_many}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* DESTACADOS */}
      <section className="alv-wrap" style={{ paddingTop: 40 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <span className="alv-kicker">{t.feat_kicker}</span>
            <h2 className="font-display" style={{ fontWeight: 800, fontSize: 30, marginTop: 10, color: '#141414' }}>{t.feat_title}</h2>
          </div>
          <Link href="/catalogo" style={{ fontWeight: 600, fontSize: 15 }}>{t.feat_link} →</Link>
        </div>
        <div style={{ display: 'grid', gap: 22, gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))' }}>
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} categoryLabel={catLabel(cats, p.categoryId, lang)} />
          ))}
        </div>
      </section>

      {/* AR BAND */}
      <section className="alv-wrap" style={{ paddingTop: 46 }}>
        <div style={{ background: '#141414', borderRadius: 22, padding: 'clamp(24px, 5vw, 48px)', color: '#fff' }}>
          <span className="alv-kicker" style={{ color: '#e0b23c' }}>{t.arband_kicker}</span>
          <h2 className="font-display" style={{ fontWeight: 800, fontSize: 'clamp(24px, 4vw, 34px)', marginTop: 12, lineHeight: 1.15 }}>{t.arband_title}</h2>
          <p style={{ marginTop: 12, color: '#c9c9c4', maxWidth: 560, lineHeight: 1.6 }}>{t.arband_sub}</p>
          <button
            onClick={() => openAr(moment?.imageIds?.[0] ? imageUrl(moment.imageIds[0]) : '')}
            className="alv-btn-gold" style={{ marginTop: 22 }}
          >
            {t.arband_cta}
          </button>
        </div>
      </section>

      {/* PIEZA DEL MES */}
      {moment && (
        <section className="alv-wrap" style={{ paddingTop: 46 }}>
          <div style={{ display: 'grid', gap: 26, gridTemplateColumns: '1fr', alignItems: 'center' }} className="alv-moment-grid">
            <ProductImage imageId={moment.imageIds?.[0]} alt={moment.name} style={{ aspectRatio: '4 / 3', borderRadius: 20, border: '1px solid var(--alv-line)' }} />
            <div>
              <span className="alv-kicker">{t.moment_kicker}</span>
              <h2 className="font-display" style={{ fontWeight: 800, fontSize: 32, marginTop: 12, color: '#141414' }}>{moment.name}</h2>
              <p style={{ marginTop: 12, color: '#4a4a4a', lineHeight: 1.6 }}>{lang === 'es' ? moment.descriptionEs : moment.descriptionEn}</p>
              <Link href={`/producto/${moment.id}`} className="alv-btn-dark" style={{ marginTop: 20 }}>{t.moment_cta}</Link>
            </div>
          </div>
        </section>
      )}

      {/* CRAFT QUOTE */}
      <section className="alv-wrap" style={{ paddingTop: 54, paddingBottom: 20, textAlign: 'center' }}>
        <p className="font-display" style={{ fontWeight: 700, fontSize: 'clamp(22px, 3.5vw, 30px)', maxWidth: 780, margin: '0 auto', color: '#141414', lineHeight: 1.3 }}>{t.craft_quote}</p>
        <p style={{ marginTop: 14, color: '#6e6e6e' }}>{t.craft_by}</p>
      </section>

      <style>{`
        @media (min-width: 861px) {
          .alv-hero-grid { grid-template-columns: 1.05fr 0.95fr !important; }
          .alv-moment-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}
