import Link from 'next/link';
import BrandName from '@/components/ui/BrandName';
import { CONTACT } from '@/lib/siteConfig';

/**
 * Lightweight header for non-home pages (About/Contact/Privacy).
 * Unlike Navbar, this has no configurator to open, so it stays a plain
 * server component with real <Link> navigation instead of scroll-anchors.
 */
export default function StaticHeader() {
  return (
    <header className="bg-cream-100/95 backdrop-blur-md text-coffee-700 sticky top-0 z-50 border-b border-gold-400/30">
      <div className="container-max px-5 md:px-10 lg:px-20 py-4 flex items-center justify-between gap-4">
        <Link href="/" className="font-bodoni text-xl md:text-2xl uppercase leading-none shrink-0 text-coffee-900" aria-label="Crunch & Munch, inicio"><BrandName /></Link>

        <nav aria-label="Principal" className="flex items-center gap-4 md:gap-7 font-sans text-[13px] uppercase tracking-[0.2em]">
          <Link href="/" className="hover:text-gold-500 transition-colors">Inicio</Link>
          <Link href="/about" className="hover:text-gold-500 transition-colors">Nosotros</Link>
          <Link href="/contact" className="hover:text-gold-500 transition-colors">Contacto</Link>
          <a
            href={CONTACT.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-block rounded-full bg-coffee-600 text-cream-50 px-5 py-2.5 font-semibold hover:bg-coffee-700 transition-colors"
          >
            Cotizar
          </a>
        </nav>
      </div>
    </header>
  );
}
