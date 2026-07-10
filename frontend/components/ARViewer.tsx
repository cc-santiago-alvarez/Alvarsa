'use client';
import { useEffect, useRef, useState } from 'react';
import { IconClose, IconPlus, IconMinus } from './icons';
import { useLang } from '@/providers/LangProvider';
import { useUI } from '@/providers/UIProvider';

type Status = 'requesting' | 'live' | 'nocam';

export default function ARViewer() {
  const { t } = useLang();
  const { arImage, closeAr } = useUI();
  const open = arImage !== null;

  const [status, setStatus] = useState<Status>('requesting');
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setStatus('requesting');
    setScale(1);
    setPos({ x: 0, y: 0 });

    let cancelled = false;
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setStatus('nocam');
    } else {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
        .then((stream) => {
          if (cancelled) { stream.getTracks().forEach((tr) => tr.stop()); return; }
          streamRef.current = stream;
          setStatus('live');
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }
        })
        .catch(() => setStatus('nocam'));
    }
    return () => {
      cancelled = true;
      if (streamRef.current) { streamRef.current.getTracks().forEach((tr) => tr.stop()); streamRef.current = null; }
    };
  }, [open]);

  function scaleBy(d: number) {
    setScale((s) => Math.min(2.4, Math.max(0.4, +(s + d).toFixed(2))));
  }

  function onPointerDown(e: React.PointerEvent) {
    const ox = e.clientX, oy = e.clientY;
    const bx = pos.x, by = pos.y;
    const move = (ev: PointerEvent) => setPos({ x: bx + (ev.clientX - ox), y: by + (ev.clientY - oy) });
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  if (!open) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 80, background: '#000', overflow: 'hidden' }}>
      {/* fondo: cámara o sala de ejemplo */}
      {status === 'live' ? (
        <video ref={videoRef} playsInline muted style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, #2a2a28, #141414 60%)' }} />
      )}

      {/* pieza superpuesta */}
      {arImage && (
        <img
          src={arImage}
          alt="AR"
          onPointerDown={onPointerDown}
          draggable={false}
          style={{
            position: 'absolute', left: '50%', top: '55%',
            transform: `translate(-50%, -50%) translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
            width: 'min(60vw, 340px)', cursor: 'grab', userSelect: 'none', touchAction: 'none',
            filter: 'drop-shadow(0 24px 40px rgba(0,0,0,0.5))',
          }}
        />
      )}

      {/* header */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, color: '#fff' }}>
        <span className="alv-kicker" style={{ color: '#e0b23c' }}>{t.ar_title}</span>
        <button onClick={closeAr} aria-label={t.ar_close} style={{ width: 42, height: 42, borderRadius: 999, border: 'none', background: 'rgba(255,255,255,0.14)', color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer' }}><IconClose size={20} /></button>
      </div>

      {/* estado */}
      {status !== 'live' && (
        <div style={{ position: 'absolute', top: '18%', left: 0, right: 0, textAlign: 'center', color: '#fff', padding: '0 24px' }}>
          {status === 'requesting' ? (
            <p style={{ color: '#c9c9c4' }}>{t.ar_requesting}</p>
          ) : (
            <div style={{ maxWidth: 380, margin: '0 auto' }}>
              <div className="font-display" style={{ fontWeight: 800, fontSize: 22 }}>{t.ar_nocam_t}</div>
              <p style={{ color: '#c9c9c4', marginTop: 8, fontSize: 14 }}>{t.ar_nocam_d}</p>
            </div>
          )}
        </div>
      )}

      {/* controles */}
      <div style={{ position: 'absolute', bottom: 24, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, color: '#fff' }}>
        <p style={{ fontSize: 12.5, color: '#c9c9c4', textAlign: 'center', padding: '0 24px' }}>{t.ar_hint}</p>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'rgba(255,255,255,0.12)', borderRadius: 999, padding: 6 }}>
          <button onClick={() => scaleBy(-0.2)} style={arCtrl} aria-label="-"><IconMinus size={18} /></button>
          <span style={{ fontSize: 13, minWidth: 54, textAlign: 'center' }}>{t.ar_scale} {(scale * 100).toFixed(0)}%</span>
          <button onClick={() => scaleBy(0.2)} style={arCtrl} aria-label="+"><IconPlus size={18} /></button>
          <button onClick={() => { setScale(1); setPos({ x: 0, y: 0 }); }} style={{ ...arCtrl, width: 'auto', padding: '0 14px', fontSize: 13 }}>{t.ar_reset}</button>
        </div>
      </div>
    </div>
  );
}

const arCtrl: React.CSSProperties = { width: 38, height: 38, borderRadius: 999, border: 'none', background: 'rgba(255,255,255,0.16)', color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer' };
