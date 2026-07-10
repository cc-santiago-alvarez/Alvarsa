'use client';
import Link from 'next/link';
import Drawer from './Drawer';
import { useLang } from '@/providers/LangProvider';
import { useUI } from '@/providers/UIProvider';

export default function MobileMenu() {
  const { t, lang, setLang } = useLang();
  const { overlay, closeOverlay } = useUI();
  const open = overlay === 'menu';

  const nav = [
    { href: '/', label: t.nav_home },
    { href: '/catalogo', label: t.nav_catalog },
    { href: '/taller', label: t.nav_about },
    { href: '/contacto', label: t.nav_contact },
  ];

  return (
    <Drawer open={open} onClose={closeOverlay} title="Alvarsa">
      <nav style={{ display: 'grid', gap: 4 }}>
        {nav.map((n) => (
          <Link key={n.href} href={n.href} onClick={closeOverlay} className="font-display" style={{ fontWeight: 700, fontSize: 22, color: '#141414', padding: '10px 0', borderBottom: '1px solid var(--alv-line)' }}>
            {n.label}
          </Link>
        ))}
      </nav>

      <Link href="/contacto" onClick={closeOverlay} className="alv-btn-gold" style={{ width: '100%', justifyContent: 'center', marginTop: 22 }}>{t.nav_bespoke}</Link>

      <div style={{ display: 'flex', gap: 8, marginTop: 22 }}>
        {(['es', 'en'] as const).map((l) => (
          <button key={l} onClick={() => setLang(l)} className="alv-chip" data-active={lang === l}>{l === 'es' ? t.lang_es_name : t.lang_en_name}</button>
        ))}
      </div>
    </Drawer>
  );
}
