'use client';

import { useEffect, useRef } from 'react';

const FRAME_W = 360;
const FRAME_H = 461;

/**
 * La mascota de Crunch & Munch: un vasito de café con brazos y piernas que va caminando de izquierda a derecha
 * a lo largo de la página mientras se hace scroll (de regreso si se sube), moviendo los brazos al caminar.
 * Es decorativa: no recibe clics y se quita si el visitante pidió menos movimiento.
 */
export default function ScrollBuddy() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.style.display = 'none';
      return;
    }
    let lastY = window.scrollY;
    let dir = 1;
    let stopTimer: ReturnType<typeof setTimeout> | undefined;
    let raf = 0;

    const place = () => {
      raf = 0;
      const y = window.scrollY;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, y / max));
      const w = el.offsetWidth;
      const x = progress * (window.innerWidth - w);
      if (y !== lastY) dir = y > lastY ? 1 : -1;
      lastY = y;
      el.style.transform = `translateX(${x.toFixed(1)}px) scaleX(${dir})`;
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(place);
      el.classList.add('is-walking');
      clearTimeout(stopTimer);
      stopTimer = setTimeout(() => el.classList.remove('is-walking'), 220);
    };

    place();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      clearTimeout(stopTimer);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} aria-hidden="true" className="scroll-buddy">
      <div className="scroll-buddy__sprite" style={{ aspectRatio: `${FRAME_W} / ${FRAME_H}` }} />
    </div>
  );
}
