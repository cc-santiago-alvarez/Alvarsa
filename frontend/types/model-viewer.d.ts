// Tipado del custom element <model-viewer> para JSX (React 19). React pasa las
// props desconocidas de custom elements como atributos DOM, así que basta con
// declarar el elemento y sus atributos usados. Lo recoge el glob **/*.ts del tsconfig.
import type React from 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        'ios-src'?: string;
        alt?: string;
        poster?: string;
        ar?: boolean;
        'ar-modes'?: string;
        'ar-scale'?: string;
        'camera-controls'?: boolean;
        'auto-rotate'?: boolean;
        'shadow-intensity'?: string | number;
        exposure?: string | number;
        'environment-image'?: string;
      };
    }
  }
}
