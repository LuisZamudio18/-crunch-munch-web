'use client';

import { useEffect, useRef } from 'react';
import Button from '@/components/ui/Button';

interface HeroProps {
  onOpenConfigurator: () => void;
}

export default function Hero({ onOpenConfigurator }: HeroProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = [titleRef.current, subRef.current, ctaRef.current];
    els.forEach((el, i) => {
      if (!el) return;
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      setTimeout(() => {
        if (!el) return;
        el.style.transition = 'opacity 0.9s ease, transform 0.9s ease';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 200 + i * 200);
    });
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-hero-gradient">
      {/* Subtle texture overlay */}
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(196,154,46,0.3) 0%, transparent 50%),
                            radial-gradient(circle at 80% 20%, rgba(196,154,46,0.2) 0%, transparent 40%)`,
        }}
      />

      {/* Floating decorative elements */}
      <div className="absolute top-1/4 left-[10%] w-px h-32 bg-gradient-to-b from-transparent via-gold-400/30 to-transparent hidden lg:block" />
      <div className="absolute top-1/3 right-[10%] w-px h-24 bg-gradient-to-b from-transparent via-gold-400/20 to-transparent hidden lg:block" />

      <div className="container-max section-padding py-0 text-center relative z-10">
        <p ref={subRef as React.RefObject<HTMLParagraphElement>} className="text-xs uppercase tracking-widest3 text-gold-400 mb-6 font-sans">
          Luxury Mobile Bars
        </p>

        <h1
          ref={titleRef}
          className="text-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-cream-50 leading-[1.1] mb-6"
        >
          Eleva cada{' '}
          <em className="gold-text not-italic">momento</em>
          <br />a una experiencia
        </h1>

        <p className="text-cream-300 text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed font-sans">
          Barras móviles premium para bodas, corporativos y celebraciones especiales.
          Diseñadas para crear recuerdos únicos.
        </p>

        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="gold" size="lg" onClick={onOpenConfigurator}>
            Diseña tu Evento ✦
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="text-cream-200 hover:text-cream-50 hover:bg-white/10"
            onClick={() => document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Ver servicios
          </Button>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-cream-400 animate-bounce">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
            <path d="M8 0v16M1 9l7 7 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </section>
  );
}
