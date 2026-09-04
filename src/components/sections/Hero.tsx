'use client';

import { useEffect, useRef, useState } from 'react';
import Button from '@/components/ui/Button';

interface HeroProps {
  onOpenConfigurator: () => void;
}

// Optional background video for the hero, configured per-deploy — no video
// configured (or it fails to load) falls back to the existing bg-hero-gradient
// with nothing else changing.
const HERO_VIDEO_URL = process.env.NEXT_PUBLIC_HERO_VIDEO_URL;

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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-hero-gradient">
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
