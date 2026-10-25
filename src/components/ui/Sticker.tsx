import Image from 'next/image';
import { clsx } from 'clsx';
import { STICKERS, type StickerId } from '@/data/stickers';

interface StickerProps {
  id: StickerId;
  /** Width in px at desktop. */
  size: number;
  /** Position inside a relatively-positioned parent, e.g. { top: '8%', left: '4%' }. */
  style: React.CSSProperties;
  rotate?: number;
  /** Seconds per float cycle and start delay, so no two stickers move together. */
  duration?: number;
  delay?: number;
  /** Hide on small screens. */
  desktopOnly?: boolean;
  /** Show only on small screens. */
  mobileOnly?: boolean;
  priority?: boolean;
}

/** Decorative die-cut sticker from the brand sheet; floats slowly and never takes clicks. */
export default function Sticker({ id, size, style, rotate = 0, duration = 7, delay = 0, desktopOnly = false, mobileOnly = false, priority = false }: StickerProps) {
  const s = STICKERS[id];
  return (
    <div
      aria-hidden="true"
      className={clsx('sticker', desktopOnly && 'hidden md:block', mobileOnly && 'md:hidden')}
      style={{
        ...style,
        width: size,
        ['--rot' as string]: `${rotate}deg`,
        ['--dur' as string]: `${duration}s`,
        ['--delay' as string]: `${delay}s`,
      }}
    >
      <Image src={s.src} alt="" width={s.w} height={s.h} sizes={`${size}px`} priority={priority} className="w-full h-auto" />
    </div>
  );
}
