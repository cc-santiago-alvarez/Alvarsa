'use client';

// Marca Alvarsa: monograma real + wordmark. `light` para fondos oscuros (footer).
export default function Brand({ light = false, compact = false }: { light?: boolean; compact?: boolean }) {
  const ink = light ? '#ffffff' : '#141414';
  const sub = light ? '#b9b9b4' : '#6e6e6e';
  const mark = light ? '/assets/brand-mark-white.webp' : '/assets/brand-mark.webp';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 11 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={mark} alt="Alvarsa" width={36} height={31} style={{ width: 36, height: 'auto', display: 'block' }} />
      {!compact && (
        <span style={{ lineHeight: 1 }}>
          <span className="font-display" style={{ display: 'block', fontWeight: 900, fontSize: 18, letterSpacing: '0.06em', color: ink }}>
            ALVARSA
          </span>
          <span style={{ display: 'block', fontSize: 9.5, letterSpacing: '0.22em', color: sub, fontWeight: 700, marginTop: 2 }}>
            CARPINTERÍA METÁLICA
          </span>
        </span>
      )}
    </span>
  );
}
