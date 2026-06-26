'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';

interface NavbarProps {
  onOpenConfigurator: () => void;
}

export default function Navbar({ onOpenConfigurator }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const links = [
    { href: '#servicios', label: 'Servicios' },
    { href: '#nosotros', label: 'Nosotros' },
    { href: '#testimonios', label: 'Testimonios' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-cream-50/95 backdrop-blur-md shadow-sm border-b border-cream-200'
          : 'bg-transparent'
      }`}
    >
      <div className="container-max px-5 md:px-10 lg:px-20 py-4 flex items-center justify-between">
        <a href="#" className={`text-display text-2xl font-semibold transition-colors ${scrolled ? 'text-coffee-700' : 'text-cream-50'}`}>
          Crunch <span className="gold-text">&amp;</span> Munch
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`text-sm tracking-widest uppercase transition-colors hover:text-gold-400 ${
                scrolled ? 'text-coffee-600' : 'text-cream-200'
              }`}
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant={scrolled ? 'gold' : 'outline'}
            size="sm"
            onClick={onOpenConfigurator}
            className={!scrolled ? 'border-cream-200 text-cream-50 hover:bg-cream-50/10' : ''}
          >
            Cotizar
          </Button>

          {/* Mobile menu button */}
          <button
            className={`md:hidden p-2 ${scrolled ? 'text-coffee-700' : 'text-cream-50'}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menú"
          >
            <div className="w-5 space-y-1">
              <span className={`block h-0.5 bg-current transition-transform ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
              <span className={`block h-0.5 bg-current transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 bg-current transition-transform ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-cream-50 border-t border-cream-200 px-5 py-4 flex flex-col gap-4">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-coffee-600 text-sm tracking-widest uppercase"
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
