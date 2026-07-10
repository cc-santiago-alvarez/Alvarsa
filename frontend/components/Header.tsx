'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import Brand from './Brand';
import { IconSearch, IconHeart, IconCart, IconUser, IconMenu, IconChevron } from './icons';
import { useLang } from '@/providers/LangProvider';
import { useCart } from '@/providers/CartProvider';
import { useFavorites } from '@/providers/FavoritesProvider';
import { useUI } from '@/providers/UIProvider';

export default function Header() {
  const { t, lang, setLang } = useLang();
  const { count } = useCart();
  const { favorites } = useFavorites();
  const { openCart, openFav, openAccount, openMenu } = useUI();
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState('');
  const [langOpen, setLangOpen] = useState(false);

  const nav = [
    { href: '/', label: t.nav_home },
    { href: '/catalogo', label: t.nav_catalog },
    { href: '/taller', label: t.nav_about },
    { href: '/contacto', label: t.nav_contact },
  ];

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push('/catalogo' + (q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''));
  }

  return (
    <>
      <header style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--alv-line)' }}>
        <div className="alv-wrap" style={{ display: 'flex', alignItems: 'center', gap: 18, height: 68 }}>
          <Link href="/" aria-label="Alvarsa inicio"><Brand /></Link>

          <nav style={{ display: 'flex', gap: 22, marginLeft: 8 }} className="alv-desktop-nav">
            {nav.map((n) => {
              const active = pathname === n.href;
              return (
                <Link key={n.href} href={n.href} style={{ color: active ? '#141414' : '#3a3a3a', fontWeight: active ? 700 : 500, fontSize: 15 }}>
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <form onSubmit={submitSearch} className="alv-desktop-search" style={{ marginLeft: 'auto', position: 'relative', width: 240 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#8c8c8c' }}><IconSearch size={17} /></span>
            <input
              value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.search_ph}
              className="alv-input" style={{ paddingLeft: 36, height: 40, borderRadius: 999, fontSize: 14 }}
            />
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }} className="alv-actions">
            <div style={{ position: 'relative' }} className="alv-desktop-lang">
              <button onClick={() => setLangOpen((v) => !v)} className="alv-iconbtn" style={iconBtn} aria-label="Idioma">
                <span style={{ fontSize: 13, fontWeight: 700 }}>{lang.toUpperCase()}</span>
                <IconChevron size={14} />
              </button>
              {langOpen && (
                <div style={{ position: 'absolute', right: 0, top: 44, background: '#fff', border: '1px solid var(--alv-line)', borderRadius: 12, boxShadow: '0 12px 30px rgba(0,0,0,0.08)', overflow: 'hidden', minWidth: 130 }}>
                  {(['es', 'en'] as const).map((l) => (
                    <button key={l} onClick={() => { setLang(l); setLangOpen(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', fontSize: 14, background: lang === l ? 'var(--alv-panel)' : '#fff', border: 'none', cursor: 'pointer', color: '#141414' }}>
                      {l === 'es' ? t.lang_es_name : t.lang_en_name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={openAccount} style={iconBtn} aria-label={t.acc_title}><IconUser size={20} /></button>
            <button onClick={openFav} style={iconBtn} aria-label={t.fav_title}>
              <IconHeart size={20} />
              {favorites.length > 0 && <span style={badge}>{favorites.length}</span>}
            </button>
            <button onClick={openCart} style={iconBtn} aria-label={t.cart_title}>
              <IconCart size={20} />
              {count > 0 && <span style={badge}>{count}</span>}
            </button>
            <button onClick={openMenu} style={iconBtn} className="alv-hamburger" aria-label="Menú"><IconMenu size={22} /></button>
          </div>
        </div>
      </header>
      <style>{`
        @media (max-width: 860px) {
          .alv-desktop-nav, .alv-desktop-search, .alv-desktop-lang { display: none !important; }
        }
        @media (min-width: 861px) {
          .alv-hamburger { display: none !important; }
        }
        .alv-iconbtn:hover { background: var(--alv-panel); }
      `}</style>
    </>
  );
}

const iconBtn: React.CSSProperties = {
  position: 'relative', width: 40, height: 40, borderRadius: 999, display: 'inline-flex',
  alignItems: 'center', justifyContent: 'center', gap: 4, background: 'transparent',
  border: 'none', cursor: 'pointer', color: '#141414',
};
const badge: React.CSSProperties = {
  position: 'absolute', top: 3, right: 2, minWidth: 16, height: 16, padding: '0 4px',
  borderRadius: 999, background: 'var(--alv-gold)', color: '#141414', fontSize: 10.5,
  fontWeight: 800, display: 'grid', placeItems: 'center',
};
