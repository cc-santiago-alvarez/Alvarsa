// Etiquetas de personalización (presentación). El backend solo guarda los VALORES
// (negro/crudo/oxido, roble/nogal/pino, s/l/custom); aquí viven sus nombres ES/EN.
// Portado del OPTS del prototipo.

export type OptAxis = 'metal' | 'madera' | 'medida';

export interface OptChoice {
  v: string;
  es: string;
  en: string;
}

export interface OptGroup {
  es: string; // etiqueta del eje
  en: string;
  opts: OptChoice[];
}

export const OPTS: Record<OptAxis, OptGroup> = {
  metal: {
    es: 'Acabado metal',
    en: 'Metal finish',
    opts: [
      { v: 'negro', es: 'Negro mate', en: 'Matte black' },
      { v: 'crudo', es: 'Acero crudo', en: 'Raw steel' },
      { v: 'oxido', es: 'Óxido sellado', en: 'Sealed rust' },
    ],
  },
  madera: {
    es: 'Madera',
    en: 'Wood',
    opts: [
      { v: 'roble', es: 'Roble', en: 'Oak' },
      { v: 'nogal', es: 'Nogal', en: 'Walnut' },
      { v: 'pino', es: 'Pino', en: 'Pine' },
    ],
  },
  medida: {
    es: 'Medida',
    en: 'Size',
    opts: [
      { v: 's', es: 'Estándar', en: 'Standard' },
      { v: 'l', es: 'Ampliada', en: 'Large' },
      { v: 'custom', es: 'A medida', en: 'Bespoke' },
    ],
  },
};

export const ALL_METAL = OPTS.metal.opts.map((o) => o.v);
export const ALL_MADERA = OPTS.madera.opts.map((o) => o.v);
export const ALL_MEDIDA = OPTS.medida.opts.map((o) => o.v);

export function optLabel(axis: OptAxis, value: string, lang: 'es' | 'en'): string {
  const o = OPTS[axis].opts.find((x) => x.v === value);
  return o ? o[lang] : value;
}
