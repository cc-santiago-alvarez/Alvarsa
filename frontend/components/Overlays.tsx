'use client';
import dynamic from 'next/dynamic';
import CartDrawer from './CartDrawer';
import FavoritesDrawer from './FavoritesDrawer';
import AccountDrawer from './AccountDrawer';
import MobileMenu from './MobileMenu';

// ARViewer carga @google/model-viewer, que toca window/customElements al
// importarse: debe ser client-only (ssr:false solo funciona dentro de un Client
// Component, y este lo es).
const ARViewer = dynamic(() => import('./ARViewer'), { ssr: false });

// Monta todos los overlays; cada uno se muestra según el estado de UIProvider.
export default function Overlays() {
  return (
    <>
      <CartDrawer />
      <FavoritesDrawer />
      <AccountDrawer />
      <MobileMenu />
      <ARViewer />
    </>
  );
}
