'use client';
import { useEffect, useState } from 'react';
import { IconClose } from './icons';
import { useLang } from '@/providers/LangProvider';
import { useUI } from '@/providers/UIProvider';

// Visor 3D + AR real con <model-viewer>. En escritorio muestra el modelo
// orbitable; en móvil el botón interno lanza Scene Viewer (Android) o AR Quick
// Look (iOS, requiere .usdz + HTTPS). Se monta solo cuando hay un arTarget con
// modelo, así que aquí no hay caso "sin modelo".
export default function ARViewer() {
  const { t } = useLang();
  const { arTarget, closeAr } = useUI();
  const open = arTarget !== null;

  // El custom element se registra client-side (el módulo toca customElements).
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    import('@google/model-viewer').then(() => {
      if (active) setReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!open) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 80, background: '#000', overflow: 'hidden' }}>
      {ready ? (
        <model-viewer
          src={arTarget.glbUrl}
          ios-src={arTarget.usdzUrl}
          poster={arTarget.posterUrl}
          alt={arTarget.alt}
          ar
          ar-modes="scene-viewer webxr quick-look"
          camera-controls
          auto-rotate
          shadow-intensity="1"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', backgroundColor: '#000' }}
        />
      ) : (
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: '#c9c9c4' }}>
          <p>{t.ar_loading}</p>
        </div>
      )}

      {/* header */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, color: '#fff', pointerEvents: 'none' }}>
        <span className="alv-kicker" style={{ color: '#e0b23c' }}>{t.ar_title} · {arTarget.name}</span>
        <button
          onClick={closeAr}
          aria-label={t.ar_close}
          style={{ width: 42, height: 42, borderRadius: 999, border: 'none', background: 'rgba(255,255,255,0.14)', color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer', pointerEvents: 'auto' }}
        >
          <IconClose size={20} />
        </button>
      </div>

      {/* hint */}
      <div style={{ position: 'absolute', bottom: 22, left: 0, right: 0, textAlign: 'center', color: '#c9c9c4', padding: '0 24px', pointerEvents: 'none' }}>
        <p style={{ fontSize: 12.5 }}>{t.ar_view_hint}</p>
      </div>
    </div>
  );
}
