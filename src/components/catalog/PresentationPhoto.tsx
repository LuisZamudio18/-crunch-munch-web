import Image from 'next/image';
import { clsx } from 'clsx';
import { PRESENTATION_PHOTOS, type PresentationKey } from '@/data/presentations';

interface PresentationPhotoProps {
  photo: PresentationKey;
  /** Overrides the photo's own label in the caption (e.g. "Copas de cristal"). */
  caption?: string;
  className?: string;
  sizes?: string;
}

/** A presentation photo with its caption, cropped to a fixed shape so a row of them lines up. */
export default function PresentationPhoto({ photo, caption, className, sizes = '(max-width: 640px) 50vw, 240px' }: PresentationPhotoProps) {
  const info = PRESENTATION_PHOTOS[photo];
  return (
    <figure className={clsx('m-0', className)}>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-cream-200">
        <Image
          src={info.src}
          alt={info.alt}
          fill
          sizes={sizes}
          className="object-cover"
          style={{ objectPosition: info.position }}
        />
      </div>
      <figcaption className="mt-1.5 text-xs text-coffee-600">{caption ?? info.label}</figcaption>
    </figure>
  );
}
