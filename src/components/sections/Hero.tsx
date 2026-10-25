'use client';

import { useEffect, useRef } from 'react';
import Button from '@/components/ui/Button';
import Sticker from '@/components/ui/Sticker';

interface HeroProps {
  onOpenConfigurator: () => void;
}

const FACTS = [
  { value: '24', label: 'barras distintas' },
  { value: '+25', label: 'tipos de servicio' },
  { value: '100 %', label: 'personalizable' },
  { value: 'Tabasco', label: 'cobertura estatal' },
];

export default function Hero({ onOpenConfigurator }: HeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Quien pide menos movimiento ve la foto fija (el póster) en lugar del video.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => (reduce.matches ? video.pause() : video.play().catch(() => {}));
    apply();
    reduce.addEventListener('change', apply);
    return () => reduce.removeEventListener('change', apply);
  }, []);

  return (
    <section className="relative overflow-hidden bg-cream-100 px-5 md:px-10 lg:px-20 pt-28 md:pt-32">
      <div className="container-max relative pb-14 md:pb-20">
        {/* Stickers sueltos alrededor de la foto, como en la hoja de la marca */}
        <Sticker id="copa-rosa" size={104} style={{ top: '0%', right: '0%' }} rotate={8} duration={8} priority desktopOnly />
        <Sticker id="taza-latte" size={150} style={{ top: '50%', right: '-2%' }} rotate={-7} duration={9} delay={1.2} desktopOnly />
        <Sticker id="cafe-helado" size={92} style={{ bottom: '3%', left: '53%' }} rotate={-6} duration={7.5} delay={0.6} desktopOnly />
        <Sticker id="croissant" size={132} style={{ bottom: '0%', right: '14%' }} rotate={-10} duration={8.5} delay={2} desktopOnly />

        <div className="relative grid grid-cols-1 lg:grid-cols-[1.12fr_0.88fr] gap-10 lg:gap-8 items-center">
          <div className="relative z-10">

            <h1 className="font-bodoni text-[clamp(2.4rem,6.3vw,6.4rem)] leading-[0.98] tracking-[-0.01em] text-coffee-600 mb-7">
              Barras de lujo
              <br />
              <em className="font-serif italic font-medium text-gold-500">para celebrar.</em>
            </h1>

            <p className="font-sans text-base leading-relaxed text-coffee-600 max-w-lg mb-9">
              Coffee bar, drinks, mimosas, postres, charcutería y brunch para bodas, XV años, baby showers y eventos
              corporativos. Eliges tus barras y tus toppings, y te mostramos tu estimado al momento.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button variant="dark" size="lg" onClick={onOpenConfigurator}>
                Diseña tu evento
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Ver las barras
              </Button>
            </div>

            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-5 max-w-xl pt-6 border-t border-gold-400/50">
              {FACTS.map((f) => (
                <div key={f.label}>
                  <dt className="font-bodoni text-2xl text-coffee-600">{f.value}</dt>
                  <dd className="font-sans text-base text-coffee-600 mt-1">{f.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <Sticker id="copa-rosa" size={78} style={{ top: '-26px', right: '-2px' }} rotate={8} duration={8} mobileOnly />
            <div className="blob overflow-hidden aspect-[4/5] w-full max-w-[520px] mx-auto lg:ml-auto bg-cream-200 ring-8 ring-white shadow-[0_30px_60px_-30px_rgba(74,53,40,0.45)]">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                poster="/video/hero-poster.jpg"
                aria-label="Barra blanca de Crunch & Munch con sombrilla de flecos, menú de bebidas y vasos en un evento"
              >
                <source src="/video/hero.webm" type="video/webm" />
                <source src="/video/hero.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
