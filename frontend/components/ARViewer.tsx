'use client';
import { useEffect, useRef, useState } from 'react';
import { IconClose } from './icons';
import { useLang } from '@/providers/LangProvider';
import { useUI } from '@/providers/UIProvider';

// Visor 3D + AR real con <model-viewer>. En escritorio muestra el modelo
// orbitable; en móvil el botón "Ver en tu espacio" lanza el motor AR del
// dispositivo: Scene Viewer / ARCore (Android) o AR Quick Look / ARKit (iOS).
// La cámara y el mapeo del espacio (detección de planos) los hace ese motor,
// no este código.
export default function ARViewer() {
  const { t } = useLang();
  const { arTarget, closeAr } = useUI();
  const open = arTarget !== null;

  const mvRef = useRef<HTMLElement | null>(null);
  // El custom element se registra client-side (el módulo toca customElements).
  const [ready, setReady] = useState(false);
  // null = aún sin saber; true/false = soporte AR detectado tras cargar el modelo.
  const [arAvailable, setArAvailable] = useState<boolean | null>(null);
  const [arError, setArError] = useState(false);

  useEffect(() => {
    let active = true;
    import('@google/model-viewer').then(() => {
      if (active) setReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  // Al montar el modelo, consultamos si el dispositivo puede activar AR y
  // escuchamos el estado de la sesión (ar-status: 'failed' si no arranca).
  useEffect(() => {
    if (!ready || !open) return;
    const el = mvRef.current as unknown as {
      canActivateAR?: boolean;
      loaded?: boolean;
      addEventListener: HTMLElement['addEventListener'];
      removeEventListener: HTMLElement['removeEventListener'];
    } | null;
    if (!el) return;
    setArError(false);
    const sync = () => setArAvailable(!!el.canActivateAR);
    const onStatus = (e: Event) => {
      const status = (e as CustomEvent<{ status?: string }>).detail?.status;
      if (status === 'failed') setArError(true);
    };
    el.addEventListener('load', sync);
    el.addEventListener('ar-status', onStatus as EventListener);
    if (el.loaded) sync();
    return () => {
      el.removeEventListener('load', sync);
      el.removeEventListener('ar-status', onStatus as EventListener);
    };
  }, [ready, open, arTarget]);

  function enterAR() {
    const el = mvRef.current as unknown as { activateAR?: () => void } | null;
    try {
      el?.activateAR?.();
    } catch {
      setArError(true);
    }
  }

  if (!open) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 80, background: '#000', overflow: 'hidden' }}>
      {ready ? (
        <model-viewer
          ref={mvRef as never}
          src={arTarget.glbUrl}
          ios-src={arTarget.usdzUrl}
          poster={arTarget.posterUrl}
          alt={arTarget.alt}
          ar
          ar-modes="scene-viewer webxr quick-look"
          ar-scale="fixed"
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

      {/* CTA de AR + estado */}
      <div style={{ position: 'absolute', bottom: 24, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '0 24px' }}>
        {arAvailable === false ? (
          <p style={{ color: '#c9c9c4', fontSize: 13, textAlign: 'center', maxWidth: 420 }}>{t.ar_unsupported}</p>
        ) : (
          <>
            <button onClick={enterAR} className="alv-btn-gold">{t.ar_enter}</button>
            {arError && <p style={{ color: '#e0b23c', fontSize: 12.5, textAlign: 'center' }}>{t.ar_failed}</p>}
          </>
        )}
        <p style={{ color: '#c9c9c4', fontSize: 12.5, textAlign: 'center' }}>{t.ar_view_hint}</p>
      </div>
    </div>
  );
}
