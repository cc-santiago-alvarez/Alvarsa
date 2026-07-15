'use client';
import { useState } from 'react';
import { imageUrl } from '@/lib/api';

// Imagen de producto servida desde GridFS. Si no hay imageId (o falla la carga),
// muestra un placeholder neutro con la marca, para no romper el layout.
export default function ProductImage({
  imageId,
  alt,
  className,
  style,
  fit = 'cover',
}: {
  imageId?: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  // 'cover' (default) recorta para llenar el recuadro — ideal en cuadrículas.
  // 'contain' muestra la imagen completa (con margen) — para el visor de la ficha.
  fit?: 'cover' | 'contain';
}) {
  const [failed, setFailed] = useState(false);
  const show = imageId && !failed;

  return (
    <div
      className={'alv-imgbg ' + (className || '')}
      style={{ position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', ...style }}
    >
      {show ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl(imageId!)}
          alt={alt}
          onError={() => setFailed(true)}
          style={{ width: '100%', height: '100%', objectFit: fit }}
        />
      ) : (
        <span
          className="font-display"
          style={{ color: '#c9c9c4', fontWeight: 800, letterSpacing: '0.18em', fontSize: 13, textTransform: 'uppercase' }}
        >
          Alvarsa
        </span>
      )}
    </div>
  );
}
