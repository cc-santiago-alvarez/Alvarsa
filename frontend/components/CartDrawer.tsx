'use client';
import { useState } from 'react';
import Link from 'next/link';
import Drawer from './Drawer';
import ProductImage from './ProductImage';
import { IconPlus, IconMinus, IconTrash } from './icons';
import { useLang } from '@/providers/LangProvider';
import { useCart } from '@/providers/CartProvider';
import { useUI } from '@/providers/UIProvider';
import { optLabel } from '@/lib/opts';
import { money } from '@/lib/format';
import { createQuote } from '@/lib/orders';
import type { OptionSelection } from '@/lib/types';

export default function CartDrawer() {
  const { t, lang } = useLang();
  const { cart, subtotal, incItem, decItem, removeItem, clearCart } = useCart();
  const { overlay, closeOverlay } = useUI();
  const open = overlay === 'cart';

  const [contact, setContact] = useState({ name: '', phone: '', email: '' });
  const [ordered, setOrdered] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function optSummary(sel: OptionSelection) {
    return [optLabel('metal', sel.metal, lang), optLabel('madera', sel.madera, lang), optLabel('medida', sel.medida, lang)]
      .filter(Boolean)
      .join(' · ');
  }

  function close() {
    if (ordered) {
      clearCart();
      setOrdered(false);
      setContact({ name: '', phone: '', email: '' });
    }
    closeOverlay();
  }

  async function checkout() {
    setError('');
    if (!contact.name.trim()) {
      setError(t.cart_send_error);
      return;
    }
    setBusy(true);
    try {
      await createQuote({
        items: cart.map((i) => ({ productId: i.id, name: i.name, price: i.price, qty: i.qty, options: { ...i.sel } })),
        contact: { name: contact.name.trim(), phone: contact.phone.trim(), email: contact.email.trim() },
      });
      setOrdered(true);
    } catch {
      setError(t.cart_send_error);
    } finally {
      setBusy(false);
    }
  }

  const empty = cart.length === 0;

  return (
    <Drawer
      open={open}
      onClose={close}
      title={t.cart_title}
      footer={
        !ordered && !empty ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ color: '#6e6e6e' }}>{t.cart_subtotal}</span>
              <strong className="font-display" style={{ fontSize: 18, color: '#141414' }}>{money(subtotal)} COP</strong>
            </div>
            {error && <p style={{ color: '#b3261e', fontSize: 13, marginBottom: 10 }}>{error}</p>}
            <button onClick={checkout} className="alv-btn-gold" style={{ width: '100%', justifyContent: 'center' }} disabled={busy}>{t.cart_checkout}</button>
            <p style={{ fontSize: 12, color: '#8c8c8c', marginTop: 10, textAlign: 'center' }}>{t.cart_note}</p>
          </div>
        ) : undefined
      }
    >
      {ordered ? (
        <div style={{ textAlign: 'center', padding: '30px 0' }}>
          <div style={{ width: 56, height: 56, borderRadius: 999, background: 'var(--alv-gold)', display: 'grid', placeItems: 'center', margin: '0 auto', color: '#141414', fontSize: 26 }}>✓</div>
          <div className="font-display" style={{ fontWeight: 800, fontSize: 22, marginTop: 16, color: '#141414' }}>{t.cart_thanks_t}</div>
          <p style={{ color: '#6e6e6e', marginTop: 10 }}>{t.cart_thanks_d}</p>
          <button className="alv-btn-dark" style={{ marginTop: 20 }} onClick={close}>{t.cart_close}</button>
        </div>
      ) : empty ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p style={{ color: '#6e6e6e' }}>{t.cart_empty}</p>
          <Link href="/catalogo" onClick={closeOverlay} className="alv-btn-dark" style={{ marginTop: 18 }}>{t.cart_empty_cta}</Link>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gap: 14 }}>
            {cart.map((i) => (
              <div key={i.key} style={{ display: 'flex', gap: 12 }}>
                <ProductImage imageId={i.img0} alt={i.name} style={{ width: 64, height: 64, borderRadius: 12, border: '1px solid var(--alv-line)', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <span className="font-display" style={{ fontWeight: 700, color: '#141414', fontSize: 15 }}>{i.name}</span>
                    <button onClick={() => removeItem(i.key)} aria-label="Quitar" style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#8c8c8c' }}><IconTrash size={16} /></button>
                  </div>
                  <div style={{ fontSize: 12.5, color: '#8c8c8c', marginTop: 2 }}>{optSummary(i.sel)}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--alv-line)', borderRadius: 999 }}>
                      <button onClick={() => decItem(i.key)} style={stepBtn} aria-label="-"><IconMinus size={15} /></button>
                      <span style={{ minWidth: 22, textAlign: 'center', fontSize: 14 }}>{i.qty}</span>
                      <button onClick={() => incItem(i.key)} style={stepBtn} aria-label="+"><IconPlus size={15} /></button>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#141414' }}>{money(i.price * i.qty)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 22, borderTop: '1px solid var(--alv-line)', paddingTop: 16 }}>
            <div className="alv-label" style={{ marginBottom: 10 }}>{t.cart_contact_title}</div>
            <div style={{ display: 'grid', gap: 10 }}>
              <input className="alv-input" placeholder={t.contact_name_label} value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} />
              <input className="alv-input" placeholder={t.contact_phone_label} value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
              <input className="alv-input" placeholder={t.acc_email} value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
            </div>
          </div>
        </>
      )}
    </Drawer>
  );
}

const stepBtn: React.CSSProperties = { width: 30, height: 30, display: 'grid', placeItems: 'center', border: 'none', background: 'none', cursor: 'pointer', color: '#141414' };
