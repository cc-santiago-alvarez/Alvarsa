'use client';
import Link from 'next/link';
import { useLang } from '@/providers/LangProvider';

export default function Footer() {
  const { t } = useLang();

  const nav = [
    { href: '/', label: t.nav_home },
    { href: '/catalogo', label: t.nav_catalog },
    { href: '/taller', label: t.nav_about },
    { href: '/contacto', label: t.nav_contact },
  ];

  return (
    <footer style={{ background: '#141414', color: '#b9b9b4', marginTop: 40 }}>
      <div className="alv-wrap" style={{ position: 'relative', padding: '52px 20px 34px', textAlign: 'center', overflow: 'hidden' }}>
        {/* Nav centrada */}
        <nav style={{ display: 'flex', gap: 26, justifyContent: 'center', flexWrap: 'wrap', position: 'relative', zIndex: 2 }}>
          {nav.map((n) => (
            <Link key={n.href} href={n.href} style={{ color: '#b9b9b4', fontSize: 14 }}>{n.label}</Link>
          ))}
        </nav>

        {/* Contacto directo centrado */}
        <div style={{ display: 'flex', gap: 22, justifyContent: 'center', flexWrap: 'wrap', marginTop: 14, position: 'relative', zIndex: 2 }}>
          <a href="mailto:taller@alvarsa.co" style={{ color: '#d6a81f', fontSize: 14 }}>{t.footer_l_email}</a>
          <a href="https://instagram.com/alvarsa" target="_blank" rel="noreferrer" style={{ color: '#d6a81f', fontSize: 14 }}>Instagram</a>
          <a href="tel:+576044482009" style={{ color: '#d6a81f', fontSize: 14 }}>{t.footer_l_phone}</a>
        </div>

        {/* Marca de agua ALVARSA */}
        <div style={{ position: 'relative', margin: '26px 0 20px', display: 'grid', placeItems: 'center', zIndex: 1 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/brand-logo-white.webp"
            alt="Alvarsa"
            style={{ width: 'min(340px, 70%)', opacity: 0.1, userSelect: 'none', pointerEvents: 'none' }}
            draggable={false}
          />
        </div>

        {/* Copyright */}
        <div style={{ fontSize: 12.5, color: '#7a7a75', position: 'relative', zIndex: 2 }}>{t.footer_rights}</div>
      </div>
    </footer>
  );
}
