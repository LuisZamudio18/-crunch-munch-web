'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { clsx } from 'clsx';
import { STICKERS, type StickerId } from '@/data/stickers';

type Pos = { top?: string; right?: string; bottom?: string; left?: string };
type Motion = 'float' | 'sway' | 'bounce' | 'wiggle';

interface StickerProps {
  id: StickerId;
  /** Width in px on phones. */
  size: number;
  /** Width in px from tablet up (defaults to `size`). */
  mdSize?: number;
  /** Position inside the nearest positioned parent on phones. Use negative values to straddle a section edge. */
  pos: Pos;
  /** Position from tablet up (defaults to `pos`). */
  mdPos?: Pos;
  rotate?: number;
  /** How it moves while idle. */
  motion?: Motion;
  /** Seconds per idle cycle and start delay, so no two stickers move together. */
  duration?: number;
  delay?: number;
  /** How far it drifts against the scroll (0 = none, 0.1 = gentle, 0.25 = strong). */
  speed?: number;
  hideOnMobile?: boolean;
  mobileOnly?: boolean;
  priority?: boolean;
}

// One shared scroll loop for every sticker on the page (cheap: only the ones near the screen are moved).
const parallax = new Map<HTMLElement, number>();
let ticking = false;
let listening = false;

function update() {
  ticking = false;
  const vh = window.innerHeight;
  parallax.forEach((speed, el) => {
    const r = el.getBoundingClientRect();
    if (r.bottom < -200 || r.top > vh + 200) return;
    const offset = r.top + r.height / 2 - vh / 2;
    el.style.translate = `0 ${(-offset * speed).toFixed(1)}px`;
  });
}
function onScroll() {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(update);
  }
}

const MOTION_NAME: Record<Motion, string> = {
  float: 'sticker-float',
  sway: 'sticker-sway',
  bounce: 'sticker-bounce',
  wiggle: 'sticker-wiggle',
};

/** Decorative die-cut sticker from the brand sheet: pops in when reached, moves on its own and drifts with the scroll. */
export default function Sticker({
  id,
  size,
  mdSize,
  pos,
  mdPos,
  rotate = 0,
  motion = 'float',
  duration = 7,
  delay = 0,
  speed = 0.08,
  hideOnMobile = false,
  mobileOnly = false,
  priority = false,
}: StickerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const s = STICKERS[id];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-in');
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
    );
    io.observe(el);
    if (!reduce && speed) {
      parallax.set(el, speed);
      if (!listening) {
        listening = true;
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
      }
      onScroll();
    }
    return () => {
      io.disconnect();
      parallax.delete(el);
    };
  }, [speed]);

  const vars: Record<string, string> = { '--w': `${size}px`, '--rot': `${rotate}deg`, '--dur': `${duration}s`, '--delay': `${delay}s`, '--pop-delay': `${Math.min(delay, 1.2) / 3}s`, '--motion': MOTION_NAME[motion] };
  if (mdSize) vars['--md-w'] = `${mdSize}px`;
  (['top', 'right', 'bottom', 'left'] as const).forEach((k) => {
    if (pos[k] !== undefined) vars[`--${k}`] = pos[k]!;
    const m = mdPos?.[k];
    if (m !== undefined) vars[`--md-${k}`] = m;
  });

  return (
    <div ref={ref} aria-hidden="true" className={clsx('sticker', hideOnMobile && 'hidden md:block', mobileOnly && 'md:hidden')} style={vars as React.CSSProperties}>
      <Image src={s.src} alt="" width={s.w} height={s.h} sizes={`${mdSize ?? size}px`} priority={priority} className="w-full h-auto" />
    </div>
  );
}
