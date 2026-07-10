'use client';
import Link from 'next/link';
import Brand from './Brand';
import { useLang } from '@/providers/LangProvider';

export default function Footer() {
  const { t } = useLang();
  return (
    <footer style={{ background: '#141414', color: '#b9b9b4', marginTop: 40 }}>
      <div className="alv-wrap" style={{ padding: '46px 20px 30px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 30, justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ maxWidth: 320 }}>
            <Brand light />
            <p style={{ marginTop: 14, fontSize: 14, lineHeight: 1.6 }}>{t.footer_addr}</p>
            <p style={{ marginTop: 4, fontSize: 14 }}>{t.contact_hours}</p>
          </div>
          <div style={{ display: 'flex', gap: 54, flexWrap: 'wrap' }}>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, marginBottom: 12, fontSize: 14 }}>{t.footer_contact}</div>
              <ul style={{ display: 'grid', gap: 8, fontSize: 14, listStyle: 'none', padding: 0, margin: 0 }}>
                <li><a href="mailto:taller@alvarsa.co" style={{ color: '#d6a81f' }}>taller@alvarsa.co</a></li>
                <li><a href="tel:+576044482009" style={{ color: '#d6a81f' }}>+57 604 448 2009</a></li>
                <li><a href="https://instagram.com/alvarsa" target="_blank" rel="noreferrer" style={{ color: '#d6a81f' }}>Instagram</a></li>
              </ul>
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, marginBottom: 12, fontSize: 14 }}>Alvarsa</div>
              <ul style={{ display: 'grid', gap: 8, fontSize: 14, listStyle: 'none', padding: 0, margin: 0 }}>
                <li><Link href="/catalogo" style={{ color: '#b9b9b4' }}>{t.nav_catalog}</Link></li>
                <li><Link href="/taller" style={{ color: '#b9b9b4' }}>{t.nav_about}</Link></li>
                <li><Link href="/contacto" style={{ color: '#b9b9b4' }}>{t.nav_contact}</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #2a2a2a', marginTop: 34, paddingTop: 18, fontSize: 13 }}>{t.footer_rights}</div>
      </div>
    </footer>
  );
}
