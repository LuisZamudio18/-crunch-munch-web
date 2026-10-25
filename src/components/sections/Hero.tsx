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
    <section className="relative overflow-x-clip bg-cream-100 px-5 md:px-10 lg:px-20 pt-28 md:pt-32">
      <div className="container-max relative pb-14 md:pb-20">
        {/* Stickers sueltos alrededor de la foto, como en la hoja de la marca */}
        <Sticker id="copa-rosa" size={104} pos={{ top: '0%', right: '0%' }} rotate={8} motion="sway" duration={8} priority hideOnMobile />
        <Sticker id="taza-latte" size={150} pos={{ top: '50%', right: '-2%' }} rotate={-7} motion="float" duration={9} delay={1.2} speed={0.05} hideOnMobile />
        <Sticker id="barra" size={150} mdSize={250} pos={{ bottom: '-14px', left: '-6px' }} mdPos={{ bottom: '-3%', left: '45%' }} rotate={-3} motion="float" duration={9} delay={0.3} speed={0.05} hideOnMobile />
        <Sticker id="cafe-helado" size={92} pos={{ top: '46%', left: '49%' }} rotate={-6} motion="bounce" duration={6.5} delay={0.6} speed={0.1} hideOnMobile />
        <Sticker id="croissant" size={84} mdSize={132} pos={{ bottom: '6px', right: '8px' }} mdPos={{ bottom: '0%', right: '14%' }} rotate={-10} motion="sway" duration={8.5} delay={2} speed={0.06} />

        <div className="relative grid grid-cols-1 lg:grid-cols-[1.12fr_0.88fr] gap-10 lg:gap-8 items-center">
          <div className="relative z-10">

            <h1 className="font-bodoni text-[clamp(2.4rem,6.3vw,6.4rem)] leading-[0.98] tracking-[-0.01em] text-coffee-600 mb-7">
              Barras de lujo
              <br />
              <em className="font-serif italic font-medium text-gold-500">para celebrar.</em>
            </h1>

            {/* Celular: el sticker de la barra, grande, justo debajo del título */}
            <div className="relative md:hidden h-[176px] -mt-1 mb-5" aria-hidden="true">
              <Sticker id="barra" size={248} pos={{ top: '0px', left: 'calc(50% - 124px)' }} rotate={-2} motion="float" duration={8} speed={0} />
            </div>

            <p className="font-sans text-base leading-relaxed text-coffee-600 max-w-lg mb-9">
              Coffee bar, drinks, mimosas, postres, charcutería y brunch para bodas, XV años, baby showers y eventos
              corporativos. Eliges tus barras y tus toppings, y te mostramos tu estimado al momento.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button variant="dark" size="lg" onClick={onOpenConfigurator}>
                Cotiza tu evento
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
            <Sticker id="copa-rosa" size={78} pos={{ top: '-26px', right: '-2px' }} rotate={8} motion="sway" duration={8} speed={0.05} mobileOnly />
            <Sticker id="cafe-helado" size={64} pos={{ top: '-18px', left: '-6px' }} rotate={-8} motion="bounce" duration={6.5} delay={0.6} speed={0.05} mobileOnly />
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
