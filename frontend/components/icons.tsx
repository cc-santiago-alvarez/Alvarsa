'use client';
// Iconos SVG de línea (stroke=currentColor).
type P = { size?: number };
const base = (size = 20) => ({ width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const });

export const IconSearch = ({ size }: P) => (<svg {...base(size)}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>);
export const IconHeart = ({ size, filled }: P & { filled?: boolean }) => (<svg {...base(size)} fill={filled ? 'currentColor' : 'none'}><path d="M20.8 6.6a5 5 0 0 0-8.8-2.2A5 5 0 0 0 3.2 6.6c0 4.6 8.8 10 8.8 10s8.8-5.4 8.8-10z" /></svg>);
export const IconCart = ({ size }: P) => (<svg {...base(size)}><circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" /><path d="M2 3h3l2.4 12.4a1.5 1.5 0 0 0 1.5 1.2h8.4a1.5 1.5 0 0 0 1.5-1.2L22 7H6" /></svg>);
export const IconUser = ({ size }: P) => (<svg {...base(size)}><circle cx="12" cy="8" r="3.6" /><path d="M5 20a7 7 0 0 1 14 0" /></svg>);
export const IconMenu = ({ size }: P) => (<svg {...base(size)}><path d="M3 6h18M3 12h18M3 18h18" /></svg>);
export const IconClose = ({ size }: P) => (<svg {...base(size)}><path d="M6 6l12 12M18 6L6 18" /></svg>);
export const IconChevron = ({ size }: P) => (<svg {...base(size)}><path d="M6 9l6 6 6-6" /></svg>);
export const IconArrowLeft = ({ size }: P) => (<svg {...base(size)}><path d="M19 12H5M12 19l-7-7 7-7" /></svg>);
export const IconPlus = ({ size }: P) => (<svg {...base(size)}><path d="M12 5v14M5 12h14" /></svg>);
export const IconMinus = ({ size }: P) => (<svg {...base(size)}><path d="M5 12h14" /></svg>);
export const IconTrash = ({ size }: P) => (<svg {...base(size)}><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" /></svg>);
export const IconImage = ({ size }: P) => (<svg {...base(size)}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>);
export const IconCube = ({ size }: P) => (<svg {...base(size)}><path d="M12 2l9 5v10l-9 5-9-5V7z" /><path d="M12 22V12M21 7l-9 5-9-5" /></svg>);
