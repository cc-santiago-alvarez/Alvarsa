'use client';
import { useState } from 'react';
import { useLang } from '@/providers/LangProvider';
import { createContact } from '@/lib/orders';

export default function ContactoPage() {
  const { t } = useLang();
  const [form, setForm] = useState({ name: '', phone: '', email: '', reason: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.reason.trim()) {
      setError(t.contact_error);
      return;
    }
    setBusy(true);
    try {
      // Nota: los adjuntos requieren subida admin (GridFS); el formulario público envía sin attachments.
      await createContact({ name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim(), reason: form.reason.trim(), attachments: [] });
      setSent(true);
    } catch {
      setError(t.contact_error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="alv-wrap" style={{ paddingTop: 34, paddingBottom: 40 }}>
      <span className="alv-kicker">{t.contact_kicker}</span>
      <h1 className="font-display" style={{ fontWeight: 800, fontSize: 'clamp(28px, 5vw, 40px)', marginTop: 12, color: '#141414' }}>{t.contact_title}</h1>
      <p style={{ color: '#6e6e6e', marginTop: 8, maxWidth: 560 }}>{t.contact_sub}</p>

      <div style={{ display: 'grid', gap: 26, gridTemplateColumns: '1fr', marginTop: 26 }} className="alv-contact-grid">
        {/* Formulario */}
        <div style={{ border: '1px solid var(--alv-line)', borderRadius: 20, padding: 'clamp(20px, 4vw, 30px)' }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div className="font-display" style={{ fontWeight: 800, fontSize: 24, color: '#141414' }}>{t.contact_sent_t}</div>
              <p style={{ color: '#6e6e6e', marginTop: 10 }}>{t.contact_sent_d}</p>
              <button className="alv-btn-dark" style={{ marginTop: 18 }} onClick={() => { setSent(false); setForm({ name: '', phone: '', email: '', reason: '' }); }}>{t.contact_sent_btn}</button>
            </div>
          ) : (
            <form onSubmit={submit} style={{ display: 'grid', gap: 16 }}>
              <Field label={t.contact_name_label}>
                <input className="alv-input" placeholder={t.contact_name_ph} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Field>
              <Field label={t.contact_phone_label}>
                <input className="alv-input" placeholder={t.contact_phone_ph} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </Field>
              <Field label={t.contact_email_label}>
                <input className="alv-input" type="email" placeholder={t.contact_email_ph} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </Field>
              <Field label={t.contact_reason_label}>
                <textarea className="alv-input" rows={5} placeholder={t.contact_reason_ph} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} style={{ resize: 'vertical' }} />
              </Field>
              {error && <p style={{ color: '#b3261e', fontSize: 14 }}>{error}</p>}
              <button type="submit" className="alv-btn-gold" style={{ justifyContent: 'center' }} disabled={busy}>{t.contact_submit}</button>
            </form>
          )}
        </div>

        {/* Contacto directo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="alv-label">{t.contact_direct}</div>
          <DirectRow k={t.footer_l_phone} v="+57 604 448 2009" href="tel:+576044482009" />
          <DirectRow k={t.footer_l_email} v="taller@alvarsa.co" href="mailto:taller@alvarsa.co" />
          <div style={{ borderTop: '1px solid var(--alv-line)', paddingTop: 14 }}>
            <div style={{ color: '#141414', fontWeight: 600 }}>{t.footer_addr}</div>
            <div style={{ color: '#6e6e6e', fontSize: 14, marginTop: 4 }}>{t.contact_hours}</div>
          </div>
        </div>
      </div>

      <style>{`@media (min-width: 861px) { .alv-contact-grid { grid-template-columns: 1.2fr 0.8fr !important; } }`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block' }}>
      <span className="alv-label" style={{ display: 'block', marginBottom: 6 }}>{label}</span>
      {children}
    </label>
  );
}
function DirectRow({ k, v, href }: { k: string; v: string; href: string }) {
  return (
    <div>
      <div className="alv-label" style={{ marginBottom: 2 }}>{k}</div>
      <a href={href} style={{ fontSize: 16, fontWeight: 600 }}>{v}</a>
    </div>
  );
}
