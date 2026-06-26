import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, DM_Sans } from 'next/font/google';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Crunch & Munch — Luxury Mobile Bars',
  description:
    'Barras móviles premium para bodas, corporativos y celebraciones. Coffee Bar, Snack Bar, Charcutería, Smoothies, Brunch y más.',
  keywords: 'mobile bar, barra móvil, coffee bar, snack bar, eventos, bodas, Tabasco',
  openGraph: {
    title: 'Crunch & Munch — Luxury Mobile Bars',
    description: 'Eleva cada momento a una experiencia con nuestras barras móviles premium.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
