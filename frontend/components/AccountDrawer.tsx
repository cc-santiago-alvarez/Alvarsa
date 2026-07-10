'use client';
import { useState } from 'react';
import Link from 'next/link';
import Drawer from './Drawer';
import { useLang } from '@/providers/LangProvider';
import { useAuth } from '@/providers/AuthProvider';
import { useUI } from '@/providers/UIProvider';
import { ApiError } from '@/lib/api';

export default function AccountDrawer() {
  const { t } = useLang();
  const { authenticated, role, me, login, register, logout } = useAuth();
  const { overlay, closeOverlay } = useUI();
  const open = overlay === 'account';

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function msgFor(code: string) {
    switch (code) {
      case 'INVALID_CREDENTIALS': return t.acc_err_creds;
      case 'EMAIL_ALREADY_TAKEN': return t.acc_err_taken;
      case 'INVALID_INPUT': return t.acc_err_input;
      default: return t.acc_err_generic;
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'login') await login(email.trim(), password);
      else await register(email.trim(), password);
      setEmail(''); setPassword('');
    } catch (err) {
      setError(err instanceof ApiError ? msgFor(err.code) : t.acc_err_generic);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Drawer open={open} onClose={closeOverlay} title={t.acc_title}>
      {authenticated ? (
        <div>
          <div style={{ background: 'var(--alv-panel)', borderRadius: 14, padding: 18 }}>
            <div className="alv-label" style={{ marginBottom: 6 }}>{t.acc_signed_as}</div>
            <div style={{ fontWeight: 600, color: '#141414', wordBreak: 'break-all' }}>{me?.userId}</div>
            <span style={{ display: 'inline-block', marginTop: 10, fontSize: 12.5, fontWeight: 700, padding: '4px 12px', borderRadius: 999, background: role === 'admin' ? '#141414' : '#fff', color: role === 'admin' ? '#d6a81f' : '#141414', border: '1px solid var(--alv-line)' }}>
              {role === 'admin' ? t.acc_role_admin : t.acc_role_customer}
            </span>
          </div>

          {role === 'admin' && (
            <Link href="/admin" onClick={closeOverlay} className="alv-btn-gold" style={{ width: '100%', justifyContent: 'center', marginTop: 18 }}>{t.acc_admin_panel}</Link>
          )}
          <button onClick={() => logout()} className="alv-btn-dark" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>{t.acc_logout}</button>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', gap: 6, background: 'var(--alv-panel)', borderRadius: 999, padding: 4, marginBottom: 18 }}>
            {(['login', 'register'] as const).map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(''); }} style={{ flex: 1, padding: '9px 0', borderRadius: 999, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, background: mode === m ? '#fff' : 'transparent', color: '#141414', boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>
                {m === 'login' ? t.acc_login : t.acc_register}
              </button>
            ))}
          </div>

          <form onSubmit={submit} style={{ display: 'grid', gap: 14 }}>
            <label>
              <span className="alv-label" style={{ display: 'block', marginBottom: 6 }}>{t.acc_email}</span>
              <input className="alv-input" type="email" required placeholder={t.acc_email_ph} value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label>
              <span className="alv-label" style={{ display: 'block', marginBottom: 6 }}>{t.acc_password}</span>
              <input className="alv-input" type="password" required placeholder={t.acc_password_ph} value={password} onChange={(e) => setPassword(e.target.value)} />
              {mode === 'register' && <span style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4, display: 'block' }}>{t.acc_pw_hint}</span>}
            </label>
            {error && <p style={{ color: '#b3261e', fontSize: 14 }}>{error}</p>}
            <button type="submit" className="alv-btn-gold" style={{ justifyContent: 'center' }} disabled={busy}>
              {mode === 'login' ? t.acc_login_cta : t.acc_register_cta}
            </button>
          </form>
        </div>
      )}
    </Drawer>
  );
}
