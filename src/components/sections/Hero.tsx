'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button';

interface HeroProps {
  onOpenConfigurator: () => void;
}

// Optional background video for the hero, configured per-deploy — no video
// configured (or it fails to load) falls back to the existing bg-hero-gradient
// with nothing else changing.
const HERO_VIDEO_URL = process.env.NEXT_PUBLIC_HERO_VIDEO_URL;

const PREVIEW_BARS = [
  { name: 'Coffee Bar', image: '/barras/coffee-bar.jpg' },
  { name: 'Charcutería', image: '/barras/charcuteria.jpg' },
  { name: 'Dessert Bar', image: '/barras/dessert-bar.jpg' },
  { name: 'Drinks Bar', image: '/barras/drinks-bar.jpg' },
];

const STATS = [
  { value: '24', label: 'Barras distintas' },
  { value: '+25', label: 'Tipos de servicio' },
  { value: '100%', label: 'Personalizable' },
  { value: 'Tabasco', label: 'Cobertura estatal' },
];

export default function Hero({ onOpenConfigurator }: HeroProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const showVideo = Boolean(HERO_VIDEO_URL) && !videoFailed;

  // Respect prefers-reduced-motion: pause the video (muted+looping autoplay
  // is exactly the kind of motion that setting asks sites to avoid) without
  // tearing down the gradient fallback underneath it.
  useEffect(() => {
    if (!showVideo || !videoRef.current) return;
    const video = videoRef.current;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const applyMotionPreference = () => {
      if (reducedMotion.matches) video.pause();
      else video.play().catch(() => {}); // autoplay can still be blocked by the browser; the gradient underneath covers that too
    };

    applyMotionPreference();
    reducedMotion.addEventListener('change', applyMotionPreference);
    return () => reducedMotion.removeEventListener('change', applyMotionPreference);
  }, [showVideo]);

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
    <section className="relative overflow-hidden bg-hero-gradient">
      {/* Background video (optional) — sits above the section's own
          bg-hero-gradient (visible instantly, and as the permanent fallback
          if there's no video, it fails to load, or autoplay is blocked). */}
      {showVideo && (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          onError={() => {
            console.error('[hero] No se pudo cargar el video de fondo, usando el degradado.');
            setVideoFailed(true);
          }}
        >
          <source src={HERO_VIDEO_URL} type="video/mp4" />
        </video>
      )}

      {/* Same gradient as the fallback, layered translucently over the video
          so the hero text keeps exactly the contrast it always had. */}
      {showVideo && <div className="absolute inset-0 bg-hero-gradient opacity-80" aria-hidden="true" />}

      {/* Subtle texture overlay */}
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(196,154,46,0.3) 0%, transparent 50%),
                            radial-gradient(circle at 80% 20%, rgba(196,154,46,0.2) 0%, transparent 40%)`,
        }}
      />

      <div className="container-max section-padding py-16 md:py-20 lg:py-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-14 items-center">
          {/* Text column */}
          <div className="text-center lg:text-left">
            <p ref={subRef as React.RefObject<HTMLParagraphElement>} className="text-xs uppercase tracking-widest3 text-gold-400 mb-5 font-sans">
              Luxury Mobile Bars
            </p>

            <h1
              ref={titleRef}
              className="text-display text-4xl sm:text-5xl md:text-6xl text-cream-50 leading-[1.12] mb-5"
            >
              Eleva cada <em className="gold-text not-italic">momento</em> a una experiencia
            </h1>

            <p className="text-cream-300 text-base max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed font-sans">
              Barras móviles premium para bodas, corporativos y celebraciones especiales — 24 conceptos distintos, cada uno diseñado para sorprender.
            </p>

            <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-9">
              <Button variant="gold" size="lg" onClick={onOpenConfigurator}>
                Diseña tu Evento ✦
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="text-cream-200 hover:text-cream-50 hover:bg-white/10"
                onClick={() => document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Ver catálogo completo
              </Button>
            </div>

            <div className="flex gap-8 justify-start pt-6 border-t border-cream-50/10 overflow-x-auto">
              {STATS.map((stat) => (
                <div key={stat.label} className="shrink-0">
                  <div className="text-display text-2xl text-cream-50">{stat.value}</div>
                  <div className="text-[11px] text-cream-400 whitespace-nowrap">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Preview mosaic */}
          <div className="hidden sm:grid grid-cols-2 gap-3.5">
            {PREVIEW_BARS.map((bar, i) => (
              <div
                key={bar.name}
                className={`relative rounded-2xl overflow-hidden h-40 lg:h-44 ${i % 2 === 1 ? 'mt-6' : ''}`}
              >
                <Image src={bar.image} alt={bar.name} fill className="object-cover" sizes="220px" />
                <div className="absolute inset-0 bg-gradient-to-t from-coffee-900/85 via-coffee-900/10 to-transparent" />
                <span className="absolute bottom-3 left-3.5 text-cream-50 text-sm font-sans">{bar.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
