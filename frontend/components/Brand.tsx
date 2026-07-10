'use client';

// Marca Alvarsa: monograma + wordmark. `light` para fondos oscuros.
export default function Brand({ light = false, compact = false }: { light?: boolean; compact?: boolean }) {
  const ink = light ? '#ffffff' : '#141414';
  const sub = light ? '#b9b9b4' : '#6e6e6e';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <span
        aria-hidden
        style={{
          width: 34, height: 34, borderRadius: 8, background: '#d6a81f',
          color: '#141414', display: 'grid', placeItems: 'center', fontWeight: 900,
          fontFamily: 'var(--font-archivo)', fontSize: 18,
        }}
      >
        A
      </span>
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
