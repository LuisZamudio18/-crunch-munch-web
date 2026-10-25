'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import BrandName from '@/components/ui/BrandName';

interface NavbarProps {
  onOpenConfigurator: () => void;
}

const LINKS = [
  { href: '#servicios', label: 'Barras' },
  { href: '#nosotros', label: 'Nosotros' },
  { href: '#instagram', label: 'Instagram' },
  { href: '#preguntas', label: 'Preguntas' },
];

export default function Navbar({ onOpenConfigurator }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav
      aria-label="Principal"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || menuOpen ? 'bg-cream-100/95 backdrop-blur-md border-b border-gold-400/30' : 'bg-transparent'
      }`}
    >
      <div className="mx-5 md:mx-10 lg:mx-20"><div className="container-max py-4 flex items-center justify-between gap-6">
        <a href="#" className="group flex flex-col items-start leading-none" aria-label="Crunch & Munch, inicio">
          <BrandName className="font-bodoni text-[19px] sm:text-[22px] md:text-2xl tracking-[0.02em] whitespace-nowrap text-coffee-900 uppercase" />
          <span className="hidden sm:block font-sans text-[13px] tracking-[0.3em] text-gold-500 uppercase mt-1">Luxury mobile bars</span>
        </a>

        <div className="hidden md:flex items-center gap-9">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="font-sans text-[13px] uppercase tracking-[0.22em] text-coffee-600 hover:text-gold-500 transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Button variant="dark" size="sm" onClick={onOpenConfigurator}>
            Cotizar
          </Button>

          <button
            className="md:hidden p-2 text-coffee-700"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
          >
            <div className="w-5 space-y-1">
              <span className={`block h-0.5 bg-current transition-transform ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
              <span className={`block h-0.5 bg-current transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 bg-current transition-transform ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
            </div>
          </button>
        </div>
      </div></div>

      {menuOpen && (
        <div className="md:hidden bg-cream-100 border-t border-gold-400/30 px-5 py-5 flex flex-col gap-5">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="font-sans text-[13px] uppercase tracking-[0.22em] text-coffee-600"
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
