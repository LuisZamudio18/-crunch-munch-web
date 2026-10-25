import { clsx } from 'clsx';

/**
 * El nombre de la marca como logotipo: en las U lleva la estrellita de cuatro puntas del logo.
 * Úsalo solo en logotipos (menú, pie de página, firma), no en el texto corrido.
 */
export function StarU({ children = 'U' }: { children?: string }) {
  return (
    <span className="brand-u">
      {children}
      <span className="brand-u__star" aria-hidden="true" />
    </span>
  );
}

/** "Crunch & Munch" con la estrella en cada U; `ampClassName` colorea el "&". */
export default function BrandName({ className, ampClassName = 'text-gold-500' }: { className?: string; ampClassName?: string }) {
  return (
    <span className={clsx('brand-name', className)} aria-label="Crunch & Munch">
      <span aria-hidden="true">
        CR<StarU />NCH <span className={ampClassName}>&amp;</span> M<StarU />NCH
      </span>
    </span>
  );
}
