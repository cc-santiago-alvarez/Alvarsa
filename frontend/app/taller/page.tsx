'use client';
import Link from 'next/link';
import { useLang } from '@/providers/LangProvider';

export default function TallerPage() {
  const { t } = useLang();
  return (
    <div className="alv-wrap" style={{ paddingTop: 34, paddingBottom: 30 }}>
      <span className="alv-kicker">{t.about_kicker}</span>
      <h1 className="font-display" style={{ fontWeight: 800, fontSize: 'clamp(30px, 5vw, 44px)', marginTop: 12, color: '#141414', maxWidth: 760, lineHeight: 1.1 }}>{t.about_title}</h1>
      <p style={{ marginTop: 16, color: '#4a4a4a', fontSize: 18, maxWidth: 640, lineHeight: 1.6 }}>{t.about_lead}</p>

      <div style={{ display: 'grid', gap: 22, gridTemplateColumns: '1fr', marginTop: 30 }} className="alv-taller-grid">
        <div style={{ background: '#141414', borderRadius: 20, minHeight: 260, display: 'grid', placeItems: 'center' }}>
          <span className="font-display" style={{ color: '#3a3a3a', fontWeight: 900, fontSize: 40, letterSpacing: '0.2em' }}>ALVARSA</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16 }}>
          <p style={{ color: '#4a4a4a', lineHeight: 1.7 }}>{t.about_body1}</p>
          <p style={{ color: '#4a4a4a', lineHeight: 1.7 }}>{t.about_body2}</p>
        </div>
      </div>

      <h2 className="font-display" style={{ fontWeight: 800, fontSize: 26, marginTop: 44, color: '#141414' }}>{t.about_values_title}</h2>
      <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', marginTop: 18 }}>
        {t.values.map((v, i) => (
          <div key={i} style={{ border: '1px solid var(--alv-line)', borderRadius: 16, padding: 22, background: 'var(--alv-panel)' }}>
            <div className="font-display" style={{ fontWeight: 700, fontSize: 18, color: '#141414' }}>{v.ti}</div>
            <p style={{ marginTop: 8, color: '#6e6e6e', fontSize: 14.5, lineHeight: 1.6 }}>{v.d}</p>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--alv-gold)', borderRadius: 20, padding: 'clamp(24px, 5vw, 40px)', marginTop: 44, display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 className="font-display" style={{ fontWeight: 800, fontSize: 26, color: '#141414' }}>{t.about_cta_title}</h3>
          <p style={{ color: '#5a4a10', marginTop: 6 }}>{t.about_cta_sub}</p>
        </div>
        <Link href="/catalogo" className="alv-btn-dark">{t.hero_cta1}</Link>
      </div>

      <style>{`@media (min-width: 861px) { .alv-taller-grid { grid-template-columns: 1fr 1fr !important; } }`}</style>
    </div>
  );
}
