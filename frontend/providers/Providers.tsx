'use client';
import { LangProvider } from './LangProvider';
import { AuthProvider } from './AuthProvider';
import { CartProvider } from './CartProvider';
import { FavoritesProvider } from './FavoritesProvider';
import { UIProvider } from './UIProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LangProvider>
      <AuthProvider>
        <FavoritesProvider>
          <CartProvider>
            <UIProvider>{children}</UIProvider>
          </CartProvider>
        </FavoritesProvider>
      </AuthProvider>
    </LangProvider>
  );
}
