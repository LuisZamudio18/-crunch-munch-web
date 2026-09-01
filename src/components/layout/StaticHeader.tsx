import Link from 'next/link';
import { CONTACT } from '@/lib/siteConfig';

/**
 * Lightweight header for non-home pages (About/Contact/Privacy).
 * Unlike Navbar, this has no configurator to open, so it stays a plain
 * server component with real <Link> navigation instead of scroll-anchors.
 */
export default function StaticHeader() {
  return (
    <header className="bg-coffee-900 text-cream-50 sticky top-0 z-50 border-b border-coffee-700">
      <div className="container-max px-5 md:px-10 lg:px-20 py-4 flex items-center justify-between gap-4">
        <Link href="/" className="text-display text-xl md:text-2xl font-semibold shrink-0">
          Crunch <span className="gold-text">&amp;</span> Munch
        </Link>

        <nav className="flex items-center gap-4 md:gap-6 text-xs md:text-sm tracking-widest uppercase">
          <Link href="/" className="hover:text-gold-400 transition-colors">Inicio</Link>
          <Link href="/about" className="hover:text-gold-400 transition-colors">Nosotros</Link>
          <Link href="/contact" className="hover:text-gold-400 transition-colors">Contacto</Link>
          <a
            href={CONTACT.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-block rounded-full bg-gold-400 text-coffee-900 px-4 py-2 font-semibold normal-case tracking-normal hover:bg-gold-300 transition-colors"
          >
            Cotizar
          </a>
        </nav>
      </div>
    </header>
  );
}
