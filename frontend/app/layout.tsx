import type { Metadata } from 'next';
import { Archivo, Manrope } from 'next/font/google';
import './globals.css';
import { Providers } from '@/providers/Providers';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Overlays from '@/components/Overlays';

const archivo = Archivo({ subsets: ['latin'], weight: ['500', '600', '700', '800', '900'], variable: '--font-archivo' });
const manrope = Manrope({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-manrope' });

export const metadata: Metadata = {
  title: 'Alvarsa — Carpintería metálica',
  description: 'Muebles de estilo industrial hechos a mano. Acero y madera con oficio.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${archivo.variable} ${manrope.variable}`}>
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Providers>
          <Header />
          <main style={{ flex: 1 }}>{children}</main>
          <Footer />
          <Overlays />
        </Providers>
      </body>
    </html>
  );
}
