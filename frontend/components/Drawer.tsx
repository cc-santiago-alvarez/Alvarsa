'use client';
import { useEffect } from 'react';
import { IconClose } from './icons';

// Slide-over derecho reutilizable con overlay y animación.
export default function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(20,20,20,0.42)', animation: 'alvOverlay 0.22s ease both' }} />
      <aside
        role="dialog"
        aria-modal="true"
        style={{
          position: 'absolute', top: 0, right: 0, height: '100%', width: 'min(420px, 100%)',
          background: '#fff', display: 'flex', flexDirection: 'column', boxShadow: '-14px 0 40px rgba(0,0,0,0.14)',
          animation: 'alvDrawer 0.28s cubic-bezier(0.22,1,0.36,1) both',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid var(--alv-line)' }}>
          <span className="font-display" style={{ fontWeight: 800, fontSize: 19, color: '#141414' }}>{title}</span>
          <button onClick={onClose} aria-label="Cerrar" style={{ width: 38, height: 38, borderRadius: 999, border: 'none', background: 'var(--alv-panel)', display: 'grid', placeItems: 'center', cursor: 'pointer', color: '#141414' }}>
            <IconClose size={18} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px' }}>{children}</div>
        {footer && <div style={{ borderTop: '1px solid var(--alv-line)', padding: '16px 20px' }}>{footer}</div>}
      </aside>
    </div>
  );
}
