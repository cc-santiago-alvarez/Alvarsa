'use client';
import CartDrawer from './CartDrawer';
import FavoritesDrawer from './FavoritesDrawer';
import AccountDrawer from './AccountDrawer';
import MobileMenu from './MobileMenu';
import ARViewer from './ARViewer';

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
