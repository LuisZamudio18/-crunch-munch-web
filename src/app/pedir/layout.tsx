import type { Metadata, Viewport } from 'next';
import { Baloo_2, Dancing_Script, Fredoka, Poppins } from 'next/font/google';

// Las páginas de pedidos de cada evento pueden usar otras letras; solo se cargan aquí.
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-poppins', display: 'swap' });
const fredoka = Fredoka({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-fredoka', display: 'swap' });

const baloo = Baloo_2({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-baloo', display: 'swap' });
const dancing = Dancing_Script({ subsets: ['latin'], weight: ['500', '700'], variable: '--font-dancing', display: 'swap' });

export const metadata: Metadata = {
  title: 'Haz tu pedido',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function OrderLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${poppins.variable} ${fredoka.variable} ${baloo.variable} ${dancing.variable}`}>{children}</div>;
}
