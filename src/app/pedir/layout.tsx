import type { Metadata, Viewport } from 'next';
import { Fredoka, Poppins } from 'next/font/google';

// Las páginas de pedidos de cada evento pueden usar otras letras; solo se cargan aquí.
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-poppins', display: 'swap' });
const fredoka = Fredoka({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-fredoka', display: 'swap' });

export const metadata: Metadata = {
  title: 'Haz tu pedido',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function OrderLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${poppins.variable} ${fredoka.variable}`}>{children}</div>;
}
