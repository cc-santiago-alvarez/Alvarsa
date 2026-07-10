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
  // Para el hero y la pieza del mes preferimos una pieza con imagen.
  const withImg = products.find((p) => p.imageIds?.length > 0);
  const hero = withImg || products[0];
  const moment = withImg || products[0];
  const countByCat = (id: string) => products.filter((p) => p.categoryId === id).length;
  const catImage = (id: string) => products.find((p) => p.categoryId === id && p.imageIds?.length > 0)?.imageIds[0];

  return (
    <div>
      {/* HERO — pieza flotando + wordmark gigante */}
      <section style={{ background: 'linear-gradient(180deg,#f6f6f4,#efefec)' }}>
        <div className="alv-wrap" style={{ paddingTop: 30, paddingBottom: 0 }}>
          <div style={{ minHeight: '54vh', display: 'grid', placeItems: 'center', padding: '20px 0' }}>
            {hero?.imageIds?.[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl(hero.imageIds[0])}
                alt={hero.name}
                style={{ width: 'min(560px, 82%)', maxHeight: '52vh', objectFit: 'contain', filter: 'drop-shadow(0 30px 40px rgba(0,0,0,0.18))' }}
              />
            ) : (
              <div className="font-display" style={{ color: '#cfcfca', fontWeight: 800, letterSpacing: '0.2em', fontSize: 16 }}>ALVARSA</div>
            )}
          </div>
        </div>
        <div style={{ textAlign: 'center', overflow: 'hidden' }}>
          <h1 className="font-display" style={{ fontWeight: 900, fontSize: 'clamp(64px, 20vw, 240px)', lineHeight: 0.9, color: '#141414', letterSpacing: '-0.02em', margin: 0, paddingBottom: 24 }}>
            ALVARSA
          </h1>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section className="alv-wrap" style={{ paddingTop: 44, paddingBottom: 10 }}>
        <span className="alv-kicker">{t.cat_kicker}</span>
        <h2 className="font-display" style={{ fontWeight: 800, fontSize: 30, marginTop: 10, marginBottom: 20, color: '#141414' }}>{t.cat_title}</h2>
        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
          {cats.map((c) => {
            const n = countByCat(c.id);
            return (
              <Link key={c.id} href={`/catalogo?categoryId=${c.id}`} style={{ color: 'inherit' }}>
                <div style={{ border: '1px solid var(--alv-line)', borderRadius: 16, overflow: 'hidden', background: '#fff' }}>
                  <ProductImage imageId={catImage(c.id)} alt={lang === 'es' ? c.nameEs : c.nameEn} style={{ aspectRatio: '4 / 3' }} />
                  <div style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span className="font-display" style={{ fontWeight: 700, fontSize: 16, color: '#141414' }}>{lang === 'es' ? c.nameEs : c.nameEn}</span>
                    <span style={{ color: '#8c8c8c', fontSize: 13 }}>{n}</span>
                  </div>
                </div>
              </Link>
            );
          })}
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
          <h2 className="font-display" style={{ fontWeight: 800, fontSize: 'clamp(24px, 4vw, 34px)', marginTop: 12, lineHeight: 1.15, maxWidth: 460 }}>{t.arband_title}</h2>
          <p style={{ marginTop: 12, color: '#c9c9c4', maxWidth: 560, lineHeight: 1.6 }}>{t.arband_sub}</p>
          <button
            onClick={() => openAr(hero?.imageIds?.[0] ? imageUrl(hero.imageIds[0]) : '')}
            className="alv-btn-gold" style={{ marginTop: 22 }}
          >
            {t.arband_cta}
          </button>
        </div>
      </section>

      {/* PIEZA DEL MES */}
      {moment && (
        <section className="alv-wrap" style={{ paddingTop: 46 }}>
          <div style={{ display: 'grid', gap: 0, gridTemplateColumns: '1fr', alignItems: 'stretch', border: '1px solid var(--alv-line)', borderRadius: 20, overflow: 'hidden' }} className="alv-moment-grid">
            <ProductImage imageId={moment.imageIds?.[0]} alt={moment.name} style={{ aspectRatio: '4 / 3' }} />
            <div style={{ padding: 'clamp(22px, 4vw, 40px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span className="alv-kicker">{t.moment_kicker}</span>
              <h2 className="font-display" style={{ fontWeight: 800, fontSize: 32, marginTop: 12, color: '#141414' }}>{moment.name}</h2>
              <p style={{ marginTop: 12, color: '#4a4a4a', lineHeight: 1.6 }}>{lang === 'es' ? moment.descriptionEs : moment.descriptionEn}</p>
              <Link href={`/producto/${moment.id}`} className="alv-btn-dark" style={{ marginTop: 20, alignSelf: 'flex-start' }}>{t.moment_cta}</Link>
            </div>
          </div>
        </section>
      )}

      {/* CRAFT QUOTE */}
      <section className="alv-wrap" style={{ paddingTop: 54, paddingBottom: 20, textAlign: 'center' }}>
        <p className="font-display" style={{ fontWeight: 700, fontSize: 'clamp(22px, 3.5vw, 30px)', maxWidth: 780, margin: '0 auto', color: '#141414', lineHeight: 1.3 }}>{t.craft_quote}</p>
        <p style={{ marginTop: 14, color: '#6e6e6e' }}>{t.craft_by}</p>
        <Link href="/catalogo" className="alv-btn-dark" style={{ marginTop: 22 }}>{t.hero_cta1}</Link>
      </section>

      <style>{`@media (min-width: 861px) { .alv-moment-grid { grid-template-columns: 1fr 1fr !important; } }`}</style>
    </div>
  );
}
